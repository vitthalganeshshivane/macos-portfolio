import { techStack } from '#constants';
import type { CommandDefinition, TerminalLine } from './types';
import { registry } from '../engine/command-registry';

const skillsCommand: CommandDefinition = {
	name: 'skills',
	aliases: ['tech', 'stack'],
	description: 'Tech stack overview',
	execute: () => {
		const lines: TerminalLine[] = [
			{
				kind: 'output',
				segments: [{ text: 'Tech Stack:', bold: true }],
			},
			{ kind: 'system', text: '' },
		];

		for (const { category, items } of techStack) {
			lines.push({
				kind: 'output',
				segments: [
					{ text: `  ${category.padEnd(14)}`, color: 'green', bold: true },
					{ text: items.join(', ') },
				],
			});
		}

		lines.push({ kind: 'system', text: '' });
		lines.push({
			kind: 'output',
			segments: [
				{ text: `${String(techStack.length)} categories loaded.`, color: 'muted' },
			],
		});

		return { lines };
	},
};

registry.register(skillsCommand);
export default skillsCommand;
