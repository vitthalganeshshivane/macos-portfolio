import { useEffect, useRef, type ReactElement } from 'react';
import { useVeronicaStore } from '../store';
import { BOOT_SEQUENCE } from '../constants';
import type { SystemLine } from '../types';

/**
 * Renders the boot sequence on first terminal open.
 * Appends lines with staggered timing for cinematic feel.
 *
 * The hasRun ref prevents re-entry when boot line timeouts trigger
 * re-renders (each appendLine updates Zustand state). Without it,
 * every re-render during the boot sequence would re-schedule all
 * timeouts, creating an infinite loop.
 *
 * StrictMode-safe: cleanup clears all pending timeouts, resets the
 * ref, and clears boot state. The second mount re-runs the sequence
 * cleanly with no duplicates.
 */
export const BootSequence = (): ReactElement | null => {
	const hasBooted = useVeronicaStore((s) => s.hasBooted);
	const appendLine = useVeronicaStore((s) => s.appendLine);
	const setHasBooted = useVeronicaStore((s) => s.setHasBooted);
	const clearLines = useVeronicaStore((s) => s.clearLines);
	const hasRun = useRef(false);

	useEffect(() => {
		if (hasBooted || hasRun.current) return;
		hasRun.current = true;

		const allTimeouts: ReturnType<typeof setTimeout>[] = [];
		let cumulativeDelay = 0;

		BOOT_SEQUENCE.forEach(({ text, delay }) => {
			cumulativeDelay += delay;
			const id = setTimeout(() => {
				appendLine({
					kind: 'system',
					text,
				} satisfies SystemLine);
			}, cumulativeDelay);
			allTimeouts.push(id);
		});

		const finalId = setTimeout(() => {
			setHasBooted(true);
		}, cumulativeDelay + 10);
		allTimeouts.push(finalId);

		return () => {
			for (const id of allTimeouts) {
				clearTimeout(id);
			}
			// Reset so the second StrictMode mount can re-run cleanly
			hasRun.current = false;
			clearLines();
		};
	}, [hasBooted, appendLine, setHasBooted, clearLines]);

	return null;
};
