import { makeScene2D } from "@motion-canvas/2d";
import { Txt } from "@motion-canvas/2d/lib/components";
import { all } from "@motion-canvas/core/lib/flow";
import { beginSlide, createRef } from "@motion-canvas/core/lib/utils";
import { fadeT } from "./transitions";
import { vars } from "./var";

export default makeScene2D(function* (view) {
    const text = createRef<Txt>();
    const text1 = createRef<Txt>();
    const titleText = createRef<Txt>();

    const texts = [text, text1];

    view.add(<Txt ref={titleText} fontSize={120} fontWeight={600} text="Vorwuerfe" fill="white" y={20}/>);
    view.add(<Txt ref={text} fontSize={60} fill="white" opacity={0} y={20} textAlign="center"/>);
    view.add(<Txt ref={text1} fontSize={60} fill="white" opacity={0} y={20} textAlign="center"/>);

    const statements = [
        "Europa zentraler\nund groesser\nals Rest der Welt",
        "Begruendung von\nunterwerfung\nund enteignung",
        "Teilt Welt in\neuropaeisches Zentrum\nund Rest der Welt ein",
        "Expansion findet\nanhand der Karte\nnach 'aussen' statt",
    ];

    yield* all(
        fadeT(),
        titleText().position.y(0, vars.duration),
    );

    yield* beginSlide("mercator-postcol-q");

    yield all(
        titleText().position.y(-20, vars.duration),
        titleText().opacity(0, vars.duration),
        text().opacity(1.0, vars.duration),
        text().position.y(0, vars.duration),
    );

    for(const [i, smt] of statements.entries()) {
        const sText = texts[i % 2];
        const hText = texts[(i + 1) % 2];

        sText().text(smt);
        yield* all(
            sText().position.y(0, vars.duration),
            sText().opacity(1.0, vars.duration),
            hText().opacity(0.0, vars.duration),
            hText().position.y(-20, vars.duration),
        );
        yield* beginSlide(`mercator-postcol-smt-${i}`);
        hText().position.y(20);
    }

    yield* all(...texts.map(v => all(
        v().opacity(0.0, vars.duration),
        v().position.y(-20, vars.duration),
    )));

    yield* beginSlide("mercator-postcol-current");
});

