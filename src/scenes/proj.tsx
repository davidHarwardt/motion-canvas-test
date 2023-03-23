import { makeScene2D } from "@motion-canvas/2d";
import { Rect, RectProps } from "@motion-canvas/2d/lib/components";
import { initial, signal, vector2Signal } from "@motion-canvas/2d/lib/decorators";
import { all, waitFor } from "@motion-canvas/core/lib/flow";
import { SignalValue, SimpleSignal } from "@motion-canvas/core/lib/signals";
import { PossibleVector2, SimpleVector2Signal } from "@motion-canvas/core/lib/types";
import { createRef, useLogger } from "@motion-canvas/core/lib/utils";

import mapImg from "../../images/map-medium.png";

export default makeScene2D(function* (view) {
    const map = createRef<Map>();
    view.add(<Map ref={map} mapTexture={mapImg} width={1000} height={600} radius={10} opacity={1}/>);

    yield* waitFor(0.1);

    yield* all(
        map().mapValue(1.0, 4),
    );

    yield* waitFor(1);
});

interface MapProps extends RectProps {
    mapOffset?: SignalValue<PossibleVector2>;
    mapScale?: SignalValue<number>;
    mapTexture: string | HTMLImageElement,
}

const PROJECTION = {
    "mercator": 0,
    "peters": 1,
};

class Map extends Rect {
    protected readonly canvas: HTMLCanvasElement;

    protected readonly gl: WebGL2RenderingContext;
    protected readonly prog: WebGLProgram;
    protected readonly vao: WebGLVertexArrayObject;

    protected readonly scaleUniform: WebGLUniformLocation;
    protected readonly offsetUniform: WebGLUniformLocation;
    protected readonly aspectUniform: WebGLUniformLocation;
    protected readonly valueUniform: WebGLUniformLocation;
    protected readonly mapTexture: WebGLTexture;
    protected mapImg: HTMLImageElement;

    @initial([0, 0])
    @vector2Signal()
    public declare readonly mapOffset: SimpleVector2Signal<number>;

    @initial(1)
    @signal()
    public declare readonly mapScale: SimpleSignal<number>;

    @initial(0)
    @signal()
    public declare readonly mapValue: SimpleSignal<number>;

    public constructor(props: Omit<MapProps, "children">) {
        super({ ...props });
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.width();
        this.canvas.height = this.height();

        this.gl = this.canvas.getContext("webgl2");
        const gl = this.gl;


        this.vao = gl.createVertexArray();

        {
            gl.activeTexture(gl.TEXTURE0);
            this.mapTexture = gl.createTexture();
            // set to red pixel until loaded
            gl.bindTexture(gl.TEXTURE_2D, this.mapTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, Uint8Array.from([0, 0, 0, 255]));

            if(typeof props.mapTexture === "string") {
                const img = document.createElement("img");
                img.src = props.mapTexture;
                img.addEventListener("load", _ => {
                    this.setTexture(gl, img);
                });
            } else {
                const img = props.mapTexture;
                if(!img.complete) {
                    img.addEventListener("load", _ => {
                        this.setTexture(gl, img);
                    });
                } else { this.setTexture(gl, img) }
            }
        }

        gl.clearColor(0.1, 0.0, 0.0, 1.0);
        this.prog = createProgram(gl, `#version 300 es
        precision highp float;
        // vertex

        uniform vec2 uOffset;
        uniform float uScale;
        uniform float uAspect;
        uniform float uV;

        out vec2 texCoords;
        out vec2 offset;
        out float scale;
        out float aspect;
        out float v;

        void main() {
            vec2 vertices[3] = vec2[3](
                vec2(-1,-1),
                vec2(3,-1),
                vec2(-1, 3)
            );
            offset = uOffset;
            scale = uScale;
            aspect = uAspect;
            v = uV;

            gl_Position = vec4(vertices[gl_VertexID], 0.0, 1.0);
            // texCoords = (1.0 - (0.5 * (gl_Position.xy / vec2(uAspect, 1.0)) + vec2(0.5))) * vec2(-1.0, 1.0);
            texCoords = gl_Position.xy / vec2(uAspect, -1.0);
        }
        `, `#version 300 es
        precision highp float;
        // fragment
        in vec2 texCoords;
        in vec2 offset;
        in float scale;
        in float aspect;
        in float v;

        uniform sampler2D uTexture;

        out vec4 outColor;
        #define PI 3.41592

        vec2 to_uv(vec2 sPos) {
            // (yaw | lon | lambda, pitch | lat | phi)
            return vec2(
                ((sPos.x / PI) + 1.0) / 2.0,
                (sPos.y / PI) + 0.5
            );
        }

        vec2 proj_from_peters(vec2 pos, vec2 origin) {
            return vec2(
                pos.x - origin.x,
                asin((pos.y - origin.y) / 2.0)
            );
        }

        vec2 proj_from_mercator(vec2 pos, vec2 origin) {
            return vec2(
                origin.x + pos.x,
                2.0 * atan(exp(pos.y)) - (PI / 2.0)
            );
        }

        vec2 proj_from_epirectangular(vec2 pos, vec2 origin) {
            return vec2(
                (pos.x / cos(0.0)) + origin.x,
                (pos.y * 0.8) + origin.y
            );
        }

        vec2 proj_from_ortho(vec2 pos, vec2 origin) {
            float p = length(pos);
            float c = asin(p);

            return vec2(
                origin.x + atan((pos.x * sin(c)) / (p * cos(c) * cos(origin.y) - pos.y * sin(c) * sin(origin.y))),
                asin(cos(c) * sin(origin.y) + (pos.y * sin(c) * cos(origin.y)) / p)
            );
        }

        vec2 lerp2f(vec2 a, vec2 b, float v) { return a * (1.0 - v) + b * v; }

        void main() {
            vec2 uv = texCoords * PI * 0.59;
            vec2 origin = vec2(0.0, 0.0);

            vec2 proj_1 = proj_from_mercator(uv, origin);
            vec2 proj_2 = proj_from_peters(uv, origin);
            vec2 proj = lerp2f(proj_1, proj_2, v);

            vec2 pos = to_uv(proj);

            outColor = texture(uTexture, pos);

            // outColor = mix(vec4(vec3(floor(texCoords.x + texCoords.y)), 1.0), outColor, 1.0);
            // outColor = vec4(vec3((floor(length(uv)) + 0.5) * uv, 0.0), 1.0);
        }
        `);

        this.scaleUniform = gl.getUniformLocation(this.prog, "uScale");
        this.offsetUniform = gl.getUniformLocation(this.prog, "uOffset");
        this.aspectUniform = gl.getUniformLocation(this.prog, "uAspect");
        this.valueUniform = gl.getUniformLocation(this.prog, "uV");
        gl.useProgram(this.prog);

        gl.uniform1f(this.scaleUniform, 1.0);
        gl.uniform2f(this.offsetUniform, 0.0, 0.0);
        gl.uniform1f(this.aspectUniform, this.canvas.height / this.canvas.width);
        gl.uniform1f(this.valueUniform, this.mapValue());
    }

    private setTexture(gl: WebGLRenderingContext, img: HTMLImageElement) {
        this.mapImg = img;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.mapTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    }

    protected override draw(ctx: CanvasRenderingContext2D) {
        const gl = this.gl;
        { // resize before everything else
            const width = this.width();
            const height = this.height();
            const shouldResize = this.canvas.width != width || this.canvas.height != height;
            if(this.canvas.width != width) this.canvas.width = width;
            if(this.canvas.height != height) this.canvas.height = height;
            if(shouldResize) {
                this.gl.viewport(0, 0, width, height);
                gl.uniform1f(this.aspectUniform, this.canvas.height / this.canvas.width);
            }

            // set uniforms
            gl.uniform1f(this.scaleUniform, this.mapScale());
            const offset = this.mapOffset();
            gl.uniform2f(this.offsetUniform, offset.x, offset.y);

            gl.uniform1f(this.valueUniform, this.mapValue());
        }

        gl.clear(this.gl.COLOR_BUFFER_BIT);
        gl.useProgram(this.prog);
        gl.bindVertexArray(this.vao);

        gl.drawArrays(gl.TRIANGLES, 0, 3);

        const path = this.getPath();
        this.applyStyle(ctx);
        ctx.save(); {
            ctx.clip(path);
            let pos = this.position();
            ctx.drawImage(this.canvas, pos.x - this.width() / 2, pos.y - this.height() / 2);
        } ctx.restore();
    }
}

function createShader(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        let info = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(`Could not compile Shader: ${info}`);
    }

    return shader;
}

function createProgram(gl: WebGL2RenderingContext, vSrc: string, fSrc: string): WebGLProgram {
    const prog = gl.createProgram();
    const vert = createShader(gl, gl.VERTEX_SHADER, vSrc);
    const frag = createShader(gl, gl.FRAGMENT_SHADER, fSrc);

    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    if(!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        let info = gl.getProgramInfoLog(prog);
        gl.deleteProgram(prog);
        gl.deleteShader(vert);
        gl.deleteShader(frag);
        throw new Error(`Could not link Program: ${info}`);
    }

    return prog;
}

