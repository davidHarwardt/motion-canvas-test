import { makeScene2D } from "@motion-canvas/2d";
import { all } from "@motion-canvas/core/lib/flow";
import { fadeT } from "./transitions";
import { Map, MapFeature } from "./map";
import * as d3 from "d3";
import { beginSlide, createRef } from "@motion-canvas/core/lib/utils";
import { vars } from "./var";

import greenland from "../../maps/greenland.geo.json";

export default makeScene2D(function* (view) {
    // either add cylinder projetction here or on extra slide
    const mercatorMap = createRef<Map>();
    const mapCountry = new MapFeature(greenland as any, "red", 0.0, 0);

    view.add(
        <Map
            width={() => view.width()}
            height={() => view.height()}
            ref={mercatorMap}
            opacity={0}
            fill="white"
            stroke="#333"
            showContinents={true}
            projection={d3.geoMercatorRaw as any}
            lineWidth={5}
            mapScale={1.02}
            features={[ mapCountry ]}/>
    );

    yield* all(
        fadeT(),
    );
    yield* mercatorMap().opacity(1.0, vars.duration);

    yield* beginSlide("mercator-descr-show-greenland");
    yield* all(
        mapCountry.opacity(1.0, vars.duration),
        mapCountry.strokeWidth(5, vars.duration),
        mercatorMap().fill("#999", vars.duration),
    );

    yield* beginSlide("mercator-descr-move-greenland");
    yield* all(
        mapCountry.offset.x(50.0, vars.durationLong),
        mapCountry.offset.y(-90.0, vars.durationLong),
        mapCountry.strokeWidth(2, vars.durationLong),
    );
    yield* beginSlide("mercator-descr-zoom-greenland");
    yield* all(
        mercatorMap().mapScale(4.5, vars.duration),
        mapCountry.strokeWidth(5, vars.duration),
    );

    yield* beginSlide("mercator-desrc-pole-stretch");
    yield* all(
        mercatorMap().mapScale(1.02, vars.duration),
        mapCountry.opacity(0, vars.duration),
        mercatorMap().fill("white", vars.duration),
    );

    // add outlines to other shapes talked about

    yield* beginSlide("end");
});

