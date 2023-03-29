import { makeScene2D } from "@motion-canvas/2d";
import { Img } from "@motion-canvas/2d/lib/components";
import { all } from "@motion-canvas/core/lib/flow";
import { beginSlide, createRef } from "@motion-canvas/core/lib/utils";
import { fadeT } from "./transitions";
import { vars } from "./var";

import googleGlobe from "../../images/google-globe.png";
import appleGlobe from "../../images/apple-globe.jpeg";

import atlasMapsExp from "../../images/atlas-map-explain.jpeg";
import atlasMapsImg from "../../images/atlas-map-img.jpeg";

export default makeScene2D(function* (view) {
    const googleImg = createRef<Img>();
    view.add(<Img ref={googleImg} src={googleGlobe} y={20}/>);

    const appleImg = createRef<Img>();
    view.add(<Img ref={appleImg} scale={0.5} src={appleGlobe} y={20} opacity={0}/>);

    const atlasImgMap = createRef<Img>();
    view.add(<Img ref={atlasImgMap} scale={0.5} src={atlasMapsImg} y={20} opacity={0}/>);

    const atlasMapExplain = createRef<Img>();
    view.add(<Img ref={atlasMapExplain} scale={0.5} src={atlasMapsExp} y={20} opacity={0}/>);

    yield* all(
        fadeT(),
        googleImg().position.y(0, vars.duration),
    );

    yield* beginSlide("mercator-google-apple-to-apple");
    yield* all(
        googleImg().position.y(-20, vars.duration),
        googleImg().opacity(0.0, vars.duration),
        appleImg().position.y(0, vars.duration),
        appleImg().opacity(1.0, vars.duration),
    );
    yield* beginSlide("mercator-google-apple-end");

    yield* all(
        appleImg().position.y(-20, vars.duration),
        appleImg().opacity(0.0, vars.duration),
        atlasImgMap().position.y(0, vars.duration),
        atlasImgMap().opacity(1.0, vars.duration),
    );
    yield* beginSlide("mercator-atlas-img");

    yield* all(
        atlasImgMap().position.y(-20, vars.duration),
        atlasImgMap().opacity(0.0, vars.duration),
        atlasMapExplain().position.y(0, vars.duration),
        atlasMapExplain().opacity(1.0, vars.duration),
    );
    yield* beginSlide("mercator-atlas-img");
});

