import {makeProject} from "@motion-canvas/core";

import title from "./scenes/title?scene";
import mercatorIntro from "./scenes/mercator-intro?scene";
import leadQuestion from "./scenes/lead-question?scene";

// import proj from "./scenes/proj?scene";

import map from "./scenes/map?scene";

export default makeProject({
    scenes: [
        title,
        mercatorIntro,
        leadQuestion,

        // map,
    ],
});
