import { Img, Rect } from "@motion-canvas/2d/lib/components";
import { makeScene2D } from "@motion-canvas/2d/lib/scenes";

import { beginSlide } from "@motion-canvas/core/lib/utils";
import statement from "./statement";
import titleImg from "../../images/title-img.png";
import { all, delay } from "@motion-canvas/core/lib/flow";
import { createSignal } from "@motion-canvas/core/lib/signals";
import { vars } from "./var";

export default makeScene2D(function* (view) {
    yield* beginSlide("title-img");
    const v = createSignal(0.0);
    view.add(<Img width={() => view.width()} height={() => view.height()} src={titleImg}/>);

    view.add(<Rect width={() => view.width() * v()} height={() => view.height() * v()} fill="#222" radius={10 * (1 - v())} opacity={0.2}/>);

    const smt = "Die Mercator-Projektion\nin einer Zeit\ndes postkolonialen Denkens";
    yield* all(
        v(1.0, vars.duration),
        statement("title", smt, view),
    );
});


