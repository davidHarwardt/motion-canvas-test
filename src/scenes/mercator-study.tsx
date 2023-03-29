import { makeScene2D } from "@motion-canvas/2d";
import { Img, Rect, RectProps } from "@motion-canvas/2d/lib/components";
import { all, waitFor } from "@motion-canvas/core/lib/flow";
import { SignalValue } from "@motion-canvas/core/lib/signals";
import { beginSlide, createRef, Reference, useLogger } from "@motion-canvas/core/lib/utils";
import ChartJs from "chart.js/auto";
import { fadeT } from "./transitions";

import table5 from "../../images/table-5.png";
import table7 from "../../images/table-7.png";
import table89 from "../../images/table-8-9.png";
import mercatorStudy from "../../images/study-img.png";
import { vars } from "./var";

export default makeScene2D(function* (view) {
    const img = createRef<Img>();
    const h = view.height() * 0.8;
    const images = [
        <Img src={mercatorStudy} height={view.height() * 0.8} y={20}/>,
        <Img src={table5} height={view.height() * 0.8} ref={img} opacity={0.0} y={20}/>,
        <Img src={table7} height={view.height() * 0.8} ref={img} opacity={0.0} y={20}/>,
        <Img src={table89} height={view.height() * 0.8} ref={img} opacity={0.0} y={20}/>,
    ];
    images.forEach(img => view.add(img));

    yield* all(
        fadeT(),
        images[0].position.y(0.0, vars.duration),
    );

    for(let i = 1; i < images.length; i++) {
        yield* beginSlide(`mercator-study-chart-${i}`);
        yield* all(
            images[i - 1].opacity(0.0, vars.duration),
            images[i - 1].position.y(-20, vars.duration),
            images[i].opacity(1.0, vars.duration),
            images[i].position.y(0, vars.duration),
        );
    }
    yield* beginSlide("mercator-study-chart-last");
});

