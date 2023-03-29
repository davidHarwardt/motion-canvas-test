import { makeScene2D } from "@motion-canvas/2d";
import { Rect, Txt } from "@motion-canvas/2d/lib/components";
import { all } from "@motion-canvas/core/lib/flow";
import { beginSlide, createRef, useLogger } from "@motion-canvas/core/lib/utils";
import { fadeT } from "./transitions";
import { Map, MapFeature } from "./map";
import * as d3 from "d3";
import * as d3p from "d3-geo-projection";
import { vars } from "./var";

export default makeScene2D(function* (view) {
    // view.add(<Txt text={"todo!"} fontSize={300} fill="orange" zIndex={1000}/>);

    const globe = createRef<Map>();
    const map = createRef<Map>();
    const mapContainer = createRef<Rect>();
    view.add(
        <Rect layout direction="row" ref={mapContainer} y={30} gap={100} alignItems="center">
            <Map
                width={600}
                height={600}
                ref={globe}
                // projection={d3.geoOrthographicRaw as any}
                // globeClipAngle={100}
                projection={d3p.geoSatelliteRaw(100, 0)}
                globeClipAngle={90}

                showContinents={true}
                fill="white"
                stroke="#333"
                lineWidth={5}/>

            <Map
                width={800}
                height={600}
                ref={map}
                projection={d3.geoEquirectangularRaw as any}
                fill="white"
                stroke="#333"
                lineWidth={5}/>
        </Rect>
    );
    globe().globeRotX(55);

    yield* all(
        fadeT(),
        mapContainer().position.y(0, vars.duration),
    );

    const basicTravel = {
        "type": "LineString",
        "coordinates": [
            [-76.098, 35.728],
            [-66.098, 35.728],
            [-56.098, 35.728],
            [-46.098, 35.728],
            [-36.098, 35.728],
            [-26.098, 35.728],
            [-16.098, 35.728],

            [-8.5197, 35.728],
            [-8.5197, 54.6865],
        ],
    };
    const coordinates: [number, number][] = [
        [-76.0598, 35.7280],
        [-8.5197, 54.6865],
    ];

    const nextCoords: [number, number][] = [
        [10, -73],
        [75.5197, 12.6865],
    ];

    const loxodomeTravel = {
        "type": "LineString",
        "coordinates": loxodromePoints(coordinates[0], coordinates[1], 20),
        // coordinates,
    };

    const basicRoute = new MapFeature(basicTravel as any, "red", 0.0, 5);
    const loxodomeRoute = new MapFeature(loxodomeTravel as any, "red", 0.0, 5);

    const loxodomeRouteComplex = new MapFeature({
        "type": "LineString",
        coordinates: loxodromePoints(nextCoords[0], nextCoords[1], 20),
    }, "red", 0.0, 5);
    
    globe().features.push(basicRoute);
    map().features.push(basicRoute);
    yield* beginSlide("mercator-loxodomes-basic");
    yield* all(
        basicRoute.opacity(1.0, vars.duration),
    );

    map().features.push(loxodomeRoute);
    globe().features.push(loxodomeRoute);
    yield* beginSlide("mercator-loxodomes-loxodome");
    yield* all(
        loxodomeRoute.opacity(1.0, vars.duration),
    );


    yield* beginSlide("mercator-loxodomes-complex");

    globe().features.push(loxodomeRouteComplex);
    map().features.push(loxodomeRouteComplex);
    yield* all(
        loxodomeRouteComplex.opacity(1.0, vars.duration),
        globe().globeRotX(-5.0, vars.duration),
    );

    yield* beginSlide("mercator-loxodomes-to-mercator");
    yield* all(
        map().toProj(d3.geoMercatorRaw as any, vars.duration),
        map().height(800, vars.duration),
    );


    // north carolina (35.7280, -76.0598)

    yield* beginSlide("mercator-loxodomes-end");
});

function loxodromePoints([lat0, lon0]: [number, number], [lat1, lon1]: [number, number], res: number) {
    const fromDeg = (v: number) => (v * (Math.PI / 180));
    d3.geoMercatorRaw()
    const mercatorP = ([lat, lon]: [number, number]): [number, number] => ([
        fromDeg(lat),
        Math.log(Math.tan((Math.PI / 4) + (fromDeg(lon) / 2))),
    ]);
    const mercatorI = ([x, y]: [number, number]): [number, number] => ([
        x,
        2 * Math.atan(Math.exp(y)) - (Math.PI / 2.0),
    ]);
    // const lerp = ([a0, a1]: [number, number], [b0, b1]: [number, number], v: number): [number, number] => ([a0 * (1 - v) + b0 * v, a1 * (1 - v) + b1]);
    const lerp = ([a0, a1]: [number, number], [b0, b1]: [number, number], v: number): [number, number] => ([a0 + (b0 - a0) * v, a1 + (b1 - a1) * v]);
    const toDeg = ([lat, lon]: [number, number]): [number, number] => ([
        lat * (180 / Math.PI),
        lon * (180 / Math.PI),
    ]);

    const ret: [number, number][] = [];

    const p0 = mercatorP([lat0, lon0])
    const p1 = mercatorP([lat1, lon1]);
    for(let i = 0; i <= res; i++) {
        const v = (i / res);
        ret.push(toDeg(mercatorI(lerp(p0, p1, v))));
    }
    return ret;
}




