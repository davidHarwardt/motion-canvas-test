import { makeScene2D } from "@motion-canvas/2d";
import { Img, Rect, Txt } from "@motion-canvas/2d/lib/components";
import { all } from "@motion-canvas/core/lib/flow";
import { fadeT } from "./transitions";

import mercatorOg from "../../images/mercator-og.jpeg";
import { beginSlide, createRef } from "@motion-canvas/core/lib/utils";
import { vars } from "./var";
import { createSignal } from "@motion-canvas/core/lib/signals";

export default makeScene2D(function* (view) {
    const container = createRef<Rect>();
    const textContainer = createRef<Rect>();
    const mercatorImg = createRef<Img>();
    view.add(
        <Rect layout width={() => view.width()} alignItems="center" justifyContent="center" direction="column" gap={0} ref={container} y={20}>
            <Img ref={mercatorImg} src={mercatorOg} width={() => view.width() * 0.8}/>
            <Rect height={0} opacity={0} ref={textContainer} direction="column">
                <Txt fontSize={48} fill="white">
                    {"Nova et Aucta Orbis Terrae Descriptio ad Usum Navigantium Emendata"}
                </Txt>
                <Txt fontSize={24} fill="gray">
                    {"Eine neue erweiterte beschreibung der Erde, angepasst fuer die verwendung durch Segler"}
                </Txt>
            </Rect>
        </Rect>
    );

    yield* all(
        fadeT(),
        container().position.y(0, vars.duration),
    );

    yield* beginSlide("mercator-usage-show-name");
    yield* all(
        container().gap(50, vars.duration),
        mercatorImg().width(view.width() * 0.7, vars.duration),
        textContainer().opacity(1.0, vars.duration),
        textContainer().height(null, vars.duration),
    );

    yield* beginSlide("mercator-usage-end");
});

