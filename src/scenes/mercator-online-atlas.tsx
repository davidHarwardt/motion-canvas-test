import { makeScene2D } from "@motion-canvas/2d";
import { Img, Rect, Txt } from "@motion-canvas/2d/lib/components";
import { all, sequence } from "@motion-canvas/core/lib/flow";
import { beginSlide, createRef, useLogger } from "@motion-canvas/core/lib/utils";
import { fadeT } from "./transitions";

import googleMaps from "../../images/google-maps-icon.png";
import osm from "../../images/osm-icon.svg";
import bingMaps from "../../images/bing-maps-icon.png";
import hereMaps from "../../images/here-icon.png";
import yahooMaps from "../../images/yahoo-maps-icon.png";
import yandexMaps from "../../images/yandex-maps-icon.png";
import petalMaps from "../../images/petal-maps-icon.png";
import wazeMaps from "../../images/waze-maps-icon.png";
import { createSignal } from "@motion-canvas/core/lib/signals";
import { vars } from "./var";

export default makeScene2D(function* (view) {
    // view.add(<Txt text="todo" fill="orange" fontSize={200}/>);
    const urls = [
        googleMaps,
        osm,
        bingMaps,
        hereMaps,
        yahooMaps,
        yandexMaps,
        petalMaps,
        wazeMaps,
    ];
    const imgWidth = createSignal(400);
    const images = urls.map(v => {
        const widthMult = createSignal(0);
        const img = <Img src={v} opacity={0}/> as Img;
        const aspect = img.height() / img.width();
        img.width(() => imgWidth() * widthMult());
        img.height(() => aspect * imgWidth() * widthMult());
        return [img, widthMult] as const;
    });
    view.add(
        <Rect
            width={view.width() * 0.8}
            height={view.height() * 0.8}
            layout
            children={images.map(v => v[0])}
            alignItems="center"
            justifyContent="center"/>
    );

    yield* all(
        fadeT(),
    );
    yield* beginSlide("mercator-online-todo");

    for(let i = 0; i < 3; i++) {
        yield* all(
            images[i][0].opacity(1.0, vars.duration),
            images[i][0].margin(20, vars.duration),
            images[i][1](1.0, vars.duration),
        );
        yield* beginSlide(`mercator-online-logo-${i}`);
    }
    yield* all(
        sequence(vars.duration / 4, ...images.slice(3).map(v => {
            return all(
                v[0].opacity(1.0, vars.duration),
                v[0].margin(20, vars.duration),
                v[1](1.0, vars.duration),
            );
        })),
        imgWidth(150, vars.duration),
    );
    // yield* beginSlide("mercator-online-end");
});


