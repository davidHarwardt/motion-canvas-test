import { makeScene2D } from "@motion-canvas/2d/lib/scenes";

import { beginSlide } from "@motion-canvas/core/lib/utils";
import statement from "./statement";

export default makeScene2D(function* (view) {
    yield* beginSlide("title");
    const smt = "Die Mercator-Projektion\nin einer Zeit\ndes Postkolonialen Denkens";
    yield* statement("title", smt, view);
});


