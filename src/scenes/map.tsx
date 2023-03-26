import { makeScene2D } from "@motion-canvas/2d";
import { Rect, RectProps, Txt } from "@motion-canvas/2d/lib/components";
import { initial, signal } from "@motion-canvas/2d/lib/decorators";
import { all, waitFor } from "@motion-canvas/core/lib/flow";
import { createSignal, SignalValue, SimpleSignal } from "@motion-canvas/core/lib/signals";
import { ThreadGenerator } from "@motion-canvas/core/lib/threading";
import { tween } from "@motion-canvas/core/lib/tweening";
import { createRef, Reference, useLogger } from "@motion-canvas/core/lib/utils";
import * as d3 from "d3";
import * as d3p from "d3-geo-projection";

import * as topojson from "topojson-client";

function* changeText(txt: Reference<Txt>, target: string, seconds = 0) {
    yield* txt().opacity(0.0, seconds / 2);
    yield* txt().text(target, 0);
    yield* txt().opacity(1.0, seconds / 2);
}

export default makeScene2D(function* (view) {
    const duration = 5.0;
    const waitDuration = 1.0;

    const map = createRef<Map>();
    const name = createRef<Txt>();
    view.add(
        <Map
            width={1000}
            height={600}
            ref={map}
            projection={d3.geoOrthographicRaw as any}
            fill="white"
            stroke="#333"
            lineWidth={5}
        />
    );

    view.add(<Txt ref={name} text="Orthographic" fill="white" y={400}/>);
    yield* waitFor(0.5);

    yield* all(
        // map().width(800, duration),
        // map().height(400, duration),
        map().toProj(d3.geoEquirectangularRaw as any, duration * 0.8),
        changeText(name, "Equirectangular", duration * 0.5),
    );

    yield* waitFor(waitDuration);

    yield* all(
        // map().width(800, duration),
        // map().height(550, duration),
        map().toProj(d3.geoMercatorRaw as any, duration * 0.9),
        changeText(name, "Mercator", duration * 0.5),
    );

    yield* waitFor(waitDuration);

    yield* all(
        // map().width(1200, duration),
        // map().height(590, duration),
        map().toProj(d3p.geoCylindricalEqualAreaRaw(45 * (Math.PI / 180.0)) as any, duration * 0.9),
        changeText(name, "Gall-Peters", duration * 0.5),
    );

    yield* waitFor(waitDuration);

    yield* all(
        // map().width(1200, duration),
        // map().height(605, duration),
        map().toProj(d3p.geoEckert6Raw as any, duration * 0.9),
        changeText(name, "Eckert IV", duration * 0.5),
    );

    yield* waitFor(0.5);
});

export class MapFeature {
    private readonly obj: d3.GeoPermissibleObjects;

    @signal()
    public declare readonly opacity: SimpleSignal<number>;

    public declare readonly color: string;

    @signal()
    public declare readonly strokeWidth: SimpleSignal<number>;

    public constructor(obj: d3.GeoPermissibleObjects, color: string, opacity?: SignalValue<number>, strokeWidth?: SignalValue<number>) {
        this.obj = obj;
        this.opacity = createSignal(opacity ?? 1.0);
        this.color = color;
        this.strokeWidth = createSignal(strokeWidth ?? 2.0);
    }

    public drawProj(ctx: CanvasRenderingContext2D, path: d3.GeoPath) {
        ctx.beginPath();
        path(this.obj);
        const oldAlpha = ctx.globalAlpha;
        ctx.globalAlpha = this.opacity();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.strokeWidth();
        ctx.stroke();
        ctx.globalAlpha = oldAlpha;
    }
}

export interface MapProps extends Omit<RectProps, "children"> {
    globeClipAngle?: SignalValue<number>,
    projection?: d3.GeoRawProjection,
    lineOpacity?: SignalValue<number>,
    features?: MapFeature[],
    mapCutoff?: SignalValue<number>,
}

import mapSmall from "../../maps/land-110m.json?url";

let __l: d3.GeoPermissibleObjects | undefined;
let __loading = false;
function land() {
    if(!__l && !__loading) {
        fetch(mapSmall).then(v => v.json()).then(v => {
            useLogger().info("loaded map");
            __l = topojson.feature(v, v.objects.land);
        }).catch(err => useLogger().warn(`could not load map: ${err}`));
        __loading = true;
        useLogger().info(`loading map from ${mapSmall}`);
    }
    return __l ?? d3.geoGraticule10();
}

export class Map extends Rect {
    protected readonly canvas: HTMLCanvasElement;
    protected readonly ctx: CanvasRenderingContext2D;
    private proj: {
        current: d3.GeoProjection,
        currentRaw: d3.GeoRawProjection
    };
    private readonly features: MapFeature[];

    @initial(0) @signal()
    public declare readonly globeRotX: SimpleSignal<number>;

    @initial(0) @signal()
    public declare readonly globeRotY: SimpleSignal<number>;

    @initial(0) @signal()
    public declare readonly globeRotZ: SimpleSignal<number>;

    @signal()
    public declare readonly globeClipAngle: SimpleSignal<number>;

    @signal()
    public declare readonly lineOpacity: SimpleSignal<number>;

    @signal()
    public declare readonly mapCutoff: SimpleSignal<number>;

    public constructor(props: MapProps) {
        super({ ...props });
        this.globeClipAngle = createSignal(props.globeClipAngle ?? 0.0);
        this.lineOpacity = createSignal(props.lineOpacity ?? 1.0);
        this.features = props.features ?? [];

        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.mapCutoff = createSignal(props.mapCutoff ?? 85);

        this.proj = {} as any;
        this.setProj(props.projection ?? d3.geoOrthographicRaw as any);
    }

    protected setProj(p: d3.GeoRawProjection) {
        this.proj.currentRaw = p;
        this.proj.current = interpolateProj(p, p)(0);
    }

    public *toProj (p: d3.GeoRawProjection, seconds = 0, after?: ThreadGenerator): ThreadGenerator {
        yield* tween(seconds, (v, _) => { // on progress
            this.proj.current = interpolateProj(this.proj.currentRaw, p)(v);
        }, _ => { // on finish
            this.proj.currentRaw = p;
        });
        if(after) yield* after;
    }

    protected override draw(ctx: CanvasRenderingContext2D) {
        const width = this.width();
        const height = this.height();
        { // resize
            if(this.canvas.width != width) this.canvas.width = width;
            if(this.canvas.height != height) this.canvas.height = height;
        }

        const cutoff = this.mapCutoff();
        const bounds = {
            type: "MultiPoint" as const,
            coordinates: [
                [180, 0],
                [-180, 0],
                [180, cutoff],
                [-180, cutoff],
                [180, -cutoff],
                [-180, -cutoff],
            ],
        };

        { // draw map
            const ctx1 = this.ctx;
            ctx1.save();
            const path = d3.geoPath(
                centerProj(this.proj.current, width, height).rotate([
                    this.globeRotX(),
                    this.globeRotY(),
                    this.globeRotZ(),
                ]).fitExtent([[5, 5], [this.canvas.width, this.canvas.height]], bounds).precision(0.1),
            ctx1);

            ctx1.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.applyStyle(ctx1);

            ctx1.beginPath();
            path(d3.geoGraticule10());
            const oldAlpha = ctx1.globalAlpha;
            ctx1.globalAlpha = this.lineOpacity();
            ctx1.stroke();
            ctx1.globalAlpha = oldAlpha;

            ctx1.beginPath();
            path(land());
            // ctx1.fillStyle = "white";
            ctx1.fill();

            for(const feature of this.features) {
                feature.drawProj(ctx1, path);
            }

            // draw bounds
            // ctx1.beginPath(); path(bounds); ctx1.fillStyle = "red"; ctx1.fill();

            ctx1.restore();
        }

        const path = this.getPath();
        ctx.save(); {
            // this.applyStyle(ctx);
            ctx.clip(path);
            let pos = this.position();
            const [rx, ry] = [pos.x * 0.0 - this.width() / 2, pos.y * 0.0 - this.height() / 2];

            // debug rect
            // ctx.fillStyle = "#151515"; ctx.fillRect(rx, ry, this.width(), this.height());
            ctx.drawImage(this.canvas, rx, ry);
        } ctx.restore();
    }
}

function centerProj(p: d3.GeoProjection, w: number, h: number): d3.GeoProjection {
    return p.translate([w / 2, h / 2])
}

function interpolateProj(p0: d3.GeoRawProjection, p1: d3.GeoRawProjection) {
    const mutate: (t: number) => d3.GeoProjection = d3.geoProjectionMutator((t: number) => (x, y) => {
        const [x0, y0] = p0(x, y);
        const [x1, y1] = p1(x, y);
        return [x0 + t * (x1 - x0), y0 + t * (y1 - y0)]
    });
    return mutate;
}


