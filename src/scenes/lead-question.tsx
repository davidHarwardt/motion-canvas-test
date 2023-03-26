import { makeScene2D } from "@motion-canvas/2d";
import { beginSlide } from "@motion-canvas/core/lib/utils";

import statement from "./statement";

export default makeScene2D(function* (view) {
    const smt = `Inwiefern unterstuetzt die Mercator-Projektion
    weiterhin ein eurozentrisches Weltbild
    und sollten wir in der heutigen Zeit
    Alternativen finden?`;
    yield* statement("lead-question", smt, view);
});

