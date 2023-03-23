import {makeProject} from "@motion-canvas/core";

import title from "./scenes/title?scene";
import proj from "./scenes/proj?scene";

export default makeProject({
    scenes: [
        title,
        proj,
    ],
});
