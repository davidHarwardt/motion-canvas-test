import { createSignal } from "@motion-canvas/core/lib/signals";
import { useTransition } from "@motion-canvas/core/lib/transitions";

export function* fadeT(duration = 1.0) {
    const p = createSignal(0);
    const end = useTransition(
        ctx => ctx.globalAlpha = p(),
        ctx => ctx.globalAlpha = (1 - p()),
    );
    yield* p(1.0, duration);
    end();
}

