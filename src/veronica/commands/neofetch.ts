import type { CommandDefinition, TerminalLine } from './types';
import { registry } from '../engine/command-registry';
import { NEOFETCH_ART, VERSION } from '../constants';

const neofetchCommand: CommandDefinition = {
	name: 'neofetch',
	aliases: ['sysinfo', 'fetch'],
	description: 'System summary',
	execute: () => {
		const info = [
			{ label: 'OS', value: 'VitthalOS 1.0' },
			{ label: 'Host', value: 'Portfolio v2' },
			{ label: 'Kernel', value: `Veronica-${VERSION}` },
			{ label: 'Shell', value: 'veronica-terminal' },
			{ label: 'DE', value: 'macOS Tahoe' },
			{ label: 'WM', value: 'GSAP Draggable' },
			{ label: 'Theme', value: 'Glassmorphism' },
			{ label: 'Terminal', value: 'Veronica + React' },
			{ label: 'CPU', value: 'MERN Stack @ 3.5GHz' },
			{ label: 'Memory', value: '23 projects / 12 skills' },
			{ label: 'Uptime', value: 'Since 2023 (no sleep)' },
			{ label: 'Packages', value: 'npm (too many)' },
			{ label: 'Editor', value: 'VS Code' },
			{ label: 'Focus', value: 'Full-Stack Web Dev' },
			{ label: 'AI', value: 'OpenRouter + NIM' },
			{ label: 'Location', value: 'India' },
			{ label: 'Caffeine', value: '99%' },
			{ label: 'GitHub', value: 'vitthalganeshshivane' },
		];

		const lines: TerminalLine[] = [];

		// Render ASCII art alongside info lines
		const maxLines = Math.max(NEOFETCH_ART.length, info.length);

		for (let i = 0; i < maxLines; i++) {
			const artLine = NEOFETCH_ART[i] ?? ''.padEnd(32);
			const paddedArt = artLine.padEnd(32);

			if (i < info.length) {
				const { label, value } = info[i];
				if (i === 0) {
					// First line: user@host style
					lines.push({
						kind: 'output',
						segments: [
							{ text: paddedArt, color: 'green' },
							{ text: 'vitthal', bold: true, color: 'green' },
							{ text: '@', color: 'muted' },
							{ text: 'portfolio', bold: true, color: 'green' },
						],
					});
				} else if (i === 1) {
					// Separator line
					lines.push({
						kind: 'output',
						segments: [
							{ text: paddedArt, color: 'green' },
							{ text: '-'.repeat(20), color: 'muted' },
						],
					});
				} else {
					lines.push({
						kind: 'output',
						segments: [
							{ text: paddedArt, color: 'green' },
							{ text: `${label}: `, color: 'green', bold: true },
							{ text: value },
						],
					});
				}
			} else {
				lines.push({
					kind: 'output',
					segments: [{ text: paddedArt, color: 'green' }],
				});
			}
		}

		// Color palette row
		lines.push({ kind: 'system', text: '' });
		const colorBlocks = ['███', '███', '███', '███', '███', '███', '███', '███'];
		lines.push({
			kind: 'output',
			segments: [
				{ text: ''.padEnd(32) },
				...colorBlocks.map((block, i) => ({
					text: block,
					color: (['red', 'green', 'yellow', 'blue', 'green', 'muted', 'blue', 'muted'] as const)[i],
				})),
			],
		});

		return { lines };
	},
};

registry.register(neofetchCommand);
export default neofetchCommand;
