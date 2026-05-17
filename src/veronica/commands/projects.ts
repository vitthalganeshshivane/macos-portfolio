import { projects } from '#constants';
import { registry } from '../engine/command-registry';
import type { CommandDefinition, TerminalLine } from './types';

const projectsCommand: CommandDefinition = {
	name: 'projects',
	aliases: ['ls-projects'],
	description: 'List portfolio projects',
	execute: () => {
		const lines: TerminalLine[] = [
			{
				kind: 'output',
				segments: [{ text: 'Projects:', bold: true }],
			},
			{ kind: 'system', text: '' },
		];

		for (const { name, description, tags } of projects) {
			lines.push({
				kind: 'output',
				segments: [
					{ text: `  ${name}`, color: 'green', bold: true },
				],
			});
			lines.push({
				kind: 'output',
				segments: [{ text: `    ${description}` }],
			});
			if (tags.length > 0) {
				lines.push({
					kind: 'output',
					segments: [
						{ text: '    ', color: 'muted' },
						{ text: tags.join(' | '), color: 'muted' },
					],
				});
			}
			lines.push({ kind: 'system', text: '' });
		}

		lines.push({
			kind: 'output',
			segments: [
				{ text: `${String(projects.length)} projects total.`, color: 'muted' },
			],
		});

		return { lines };
	},
};

registry.register(projectsCommand);
export default projectsCommand;
