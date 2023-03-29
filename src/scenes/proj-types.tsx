import { makeScene2D } from "@motion-canvas/2d";
import { Img, Rect, Txt } from "@motion-canvas/2d/lib/components";
import { all } from "@motion-canvas/core/lib/flow";
import { beginSlide, createRef } from "@motion-canvas/core/lib/utils";
import { fadeT } from "./transitions";
import * as d3 from "d3";
import * as d3p from "d3-geo-projection";

import cylinder from "../../images/cylinder.png";
import plane from "../../images/plane.png";
import cone from "../../images/cone.png";
import { Map } from "./map";
import { vars } from "./var";

export default makeScene2D(function* (view) {
    // view.add(<Txt text="todo" fontSize={200} fill="orange"/>);
    const aspect = (1920 / 1080);
    const images = [
        <Img src={cylinder} width={800} height={800 / aspect}/>,
        <Img src={cone} width={800} height={800 / aspect} opacity={0}/>,
        <Img src={plane} width={800} height={800 / aspect} opacity={0}/>,
    ];
    const projections = [
        d3.geoMercatorRaw,
        d3.geoConicEquidistantRaw(0, Math.PI / 3),
        d3.geoAzimuthalEqualAreaRaw,
    ];
    const map = createRef<Map>();
    const imgContainer = createRef<Rect>();

    view.add(
        <Rect layout direction="row" alignItems="center">
            <Rect ref={imgContainer}>
                {images[0]}
            </Rect>
            <Map
                width={800}
                height={600}
                ref={map}
                projection={projections[0] as any}
                fill="white"
                stroke="#333"
                showContinents={true}
                lineWidth={5}/>
        </Rect>
    );
    yield* all(
        fadeT(),
    );

    for(let i = 1; i < images.length; i++) {
        yield* beginSlide(`proj-types-proj-${i}`);
        yield map().toProj(projections[i] as any, vars.duration * 2.0);
        if(i == 2) yield map().mapScale(0.7, vars.duration);

        yield* images[i - 1].opacity(0.0, vars.duration);
        imgContainer().removeChildren();
        imgContainer().add(images[i]);
        yield* all(
            images[i].opacity(1.0, vars.duration)
        );
    }
    yield* beginSlide("proj-types-proj-end");
    const lastImg = images[images.length - 1] as Img;

    yield* all(
        lastImg.width(0, vars.duration),
        lastImg.height(0, vars.duration),
        map().toProj(d3p.geoHealpixRaw(1), vars.duration),
        map().scale(1.2, vars.duration),
    );
    yield* beginSlide("proj-types-end");
});

function proj(img: string, proj: d3.GeoRawProjection) {
    const map = createRef<Map>();
    const element = (
        <Rect layout direction="column">
            <Img src={img} width={800}/>
            <Map
                width={800}
                height={600}
                projection={proj}
                fill="white"
                stroke="#333"
                lineWidth={5}
                ref={map}/>
        </Rect>
    );

    return element;
}

