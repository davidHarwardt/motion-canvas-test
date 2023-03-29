import { createSignal } from "@motion-canvas/core/lib/signals";
import { useTransition } from "@motion-canvas/core/lib/transitions";
import { vars } from "./var";

export function* fadeT(duration = vars.duration) {
    const p = createSignal(0);
    const end = useTransition(
        ctx => ctx.globalAlpha = p(),
        ctx => ctx.globalAlpha = (1 - p()),
    );
    yield* p(1.0, duration);
    end();
}

