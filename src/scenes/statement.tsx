import { Txt, View2D } from "@motion-canvas/2d/lib/components";
import { all } from "@motion-canvas/core/lib/flow";
import { beginSlide, createRef, endScene, finishScene } from "@motion-canvas/core/lib/utils";
import { fadeT } from "./transitions";
import { vars } from "./var";

export default function* (id: string, statement: string, view: View2D) {
    const smt = createRef<Txt>();
    view.add(
        <Txt text={statement} ref={smt} y={30} fill="white" fontWeight={600} fontFamily="Arial" textAlign="center" fontSize={60}/>
    );

    yield* all(
        fadeT(vars.duration),
        smt().position.y(0.0, vars.duration),
    );
    yield* beginSlide(`${id}-smt-finish`);

    // finishScene();
    // yield* smt().opacity(0.0, 1.0);
};

