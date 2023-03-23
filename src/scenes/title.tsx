import { makeScene2D } from "@motion-canvas/2d/lib/scenes";

import { all, delay, waitFor } from "@motion-canvas/core/lib/flow";
import * as C from "@motion-canvas/2d/lib/components";
import { beginSlide, createRef } from "@motion-canvas/core/lib/utils";

export default makeScene2D(function* (view) {
    // view.fill("#111111");

    yield* beginSlide("title"); {
        const container = createRef<C.Rect>();
        const text = createRef<C.Txt>();
        view.add(
            <C.Rect ref={container} fill="#333333" layout radius={10} fontFamily="Arial" padding={50} opacity={0}>
                <C.Txt ref={text} fill="white" fontWeight={600} fontFamily="Arial" textAlign="center" fontSize={0}>
                    {"Die Mercator-Projektion\nin einer Zeit\ndes Postkollonialen Denkens"}
                </C.Txt>
            </C.Rect>
        );

        yield* all(
            delay(0.2, text().opacity(1.0, 0.3)),
            text().fontSize(50, 0.5),
            container().opacity(0.5, 1),
        );

        yield* beginSlide("title-vanish");
        yield* container().opacity(0, 1.0);
        container().remove();
    }

    yield* waitFor(0.1);
});


