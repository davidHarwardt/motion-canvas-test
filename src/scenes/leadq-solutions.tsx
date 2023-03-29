import { makeScene2D } from "@motion-canvas/2d";
import { Txt } from "@motion-canvas/2d/lib/components";
import { all } from "@motion-canvas/core/lib/flow";
import { beginSlide } from "@motion-canvas/core/lib/utils";
import { fadeT } from "./transitions";

export default makeScene2D(function* (view) {
    // view.add(<Txt text="todo" fontSize={200} fill="orange"/>);
    yield* all(
        fadeT(),
    );
    yield* beginSlide("leadq-solutions-todo");
});

