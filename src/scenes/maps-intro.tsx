import { makeScene2D } from "@motion-canvas/2d";
import { Line, Rect, Txt } from "@motion-canvas/2d/lib/components";
import { all, delay, sequence } from "@motion-canvas/core/lib/flow";
import { createSignal } from "@motion-canvas/core/lib/signals";
import { beginSlide, createRef, finishScene } from "@motion-canvas/core/lib/utils";
import * as d3 from "d3";
import * as d3p from "d3-geo-projection";
import { Map } from "./map";
import { fadeT } from "./transitions";
import { vars } from "./var";

export default makeScene2D(function* (view) {
    const globe = createRef<Map>();
    const container = createRef<Rect>();
    const qMark = createRef<Txt>();
    view.add(
        <Rect layout width={() => view.width()} height={() => view.height()} alignItems="center" justifyContent="center" gap={100} ref={container}>
            <Map
                width={600}
                height={600}
                ref={globe}
                fill="white"
                stroke="#333"
                showContinents={true}
                // projection={d3.geoOrthographicRaw as any}
                projection={d3p.geoSatelliteRaw(100, 0)}
                globeClipAngle={90}
                layout
                alignItems="center"
                justifyContent="center"
                lineWidth={5}>
                <Txt fontSize={300} text={"?"} fill="white" ref={qMark} opacity={0.0}/>
            </Map>
        </Rect>
    );

    globe().globeRotX(-90);

    yield* all(
        fadeT(),
        globe().globeRotX(0, vars.durationLong),
        globe().globeRotY(0, vars.durationLong),
        globe().globeRotZ(0, vars.durationLong),
    );

    yield* beginSlide("maps-intro-to-plane");

    yield* globe().fill("#00000000", vars.duration),
    globe().globeClipAngle(0);

    yield* all(
        globe().toProj(d3.geoEquirectangularRaw as any, vars.duration),
        globe().width(globe().width() * 2.0, vars.duration),
        qMark().opacity(1.0, vars.duration),
        globe().globeRotX(-90, vars.duration * 1.2),
    );

    yield* beginSlide("maps-intro-end");

    finishScene();
    yield* all(
        container().position.y(100, vars.duration),
    );
});



