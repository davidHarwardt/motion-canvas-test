import {makeProject} from "@motion-canvas/core";

import title from "./scenes/title?scene";
import mercatorIntro from "./scenes/mercator-intro?scene";
import leadQuestion from "./scenes/lead-question?scene";
import mapsIntro from "./scenes/maps-intro?scene";

import mercatorDescr from "./scenes/mercator-descr?scene";
import projTypes from "./scenes/proj-types?scene";
import mercatorUsage from "./scenes/mercator-usage?scene";
import mercatorLoxodomes from "./scenes/mercator-loxodomes?scene";

import mercatorPostcol from "./scenes/mercator-postcol?scene";
import mercatorOnlineAtlas from "./scenes/mercator-online-atlas?scene";
import mercatorGoogleApple from "./scenes/mercator-google-apple?scene";

import mercatorStudy from "./scenes/mercator-study?scene";

import leadQSolutions from "./scenes/leadq-solutions?scene"

// import proj from "./scenes/proj?scene";

import map from "./scenes/map?scene";

export default makeProject({
    scenes: [
        title,
        mercatorIntro,
        leadQuestion,
        mapsIntro,
        projTypes,
        mercatorDescr,
        mercatorUsage,
        mercatorLoxodomes,

        mercatorPostcol,
        mercatorOnlineAtlas,
        mercatorGoogleApple,
        mercatorStudy,
        leadQuestion,
        leadQSolutions,

        // map,
    ],
});
