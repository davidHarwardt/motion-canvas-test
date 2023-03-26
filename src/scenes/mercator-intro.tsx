import { makeScene2D } from "@motion-canvas/2d";
import { all, sequence, waitFor } from "@motion-canvas/core/lib/flow";
import { beginSlide, createRef, finishScene } from "@motion-canvas/core/lib/utils";

import { Map } from "./map";
import * as d3 from "d3";
import * as d3p from "d3-geo-projection";
import { Rect, Txt } from "@motion-canvas/2d/lib/components";
import { fadeT } from "./transitions";
import { vars } from "./var";

export default makeScene2D(function* (view) {
    const map = createRef<Map>();
    const mapText = createRef<Txt>();
    const mapContainer = createRef<Rect>();
    view.add(
        <Rect layout gap={0} alignItems="center" direction="column" ref={mapContainer}>
            <Map
                width={view.width() * 0.8}
                height={view.height() * 1.2}
                y={-10}
                ref={map}
                projection={d3.geoMercatorRaw as any}
                fill="white"
                stroke="#333"
                lineWidth={5}
                opacity={0}
                lineOpacity={0}/>
            <Txt ref={mapText} text="Mercator" fontSize={0} fill="white" opacity={0} y={450}/>
        </Rect>
    );

    const duration = vars.duration;
    yield* all(
        fadeT(duration),
        map().opacity(1.0, duration),
        map().height(view.height() + 20, duration),
        map().position.y(-1, duration),
    );

    yield* beginSlide("intro-show-label");

    yield* all(
        mapContainer().gap(50, duration),
        map().height(view.height() * 0.8, duration),
        mapText().fontSize(50, duration),
        mapText().opacity(1.0, duration),
    );

    yield* beginSlide("intro-to-equal-area");

    yield* all(
        map().toProj(d3p.geoCylindricalEqualAreaRaw(45 * (Math.PI / 180.0)), duration),
        sequence(duration / 3.0,
            mapText().opacity(0.0, duration / 3.0),
            mapText().text("Flaechentreue Projektion", duration / 3.0),
            mapText().opacity(1.0, duration / 3.0)
        ),
    );

    yield* beginSlide("intro-next");
});

