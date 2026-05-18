import type { CommandDefinition, TerminalLine } from './types';
import { registry } from '../engine/command-registry';

const VIRTUAL_FS = [
	{ name: 'about/', type: 'dir', color: 'green' as const },
	{ name: 'projects/', type: 'dir', color: 'green' as const },
	{ name: 'skills/', type: 'dir', color: 'green' as const },
	{ name: 'contact/', type: 'dir', color: 'green' as const },
	{ name: 'resume.pdf', type: 'file', color: 'blue' as const },
	{ name: '.veronica', type: 'file', color: 'muted' as const },
];

const lsCommand: CommandDefinition = {
	name: 'ls',
	aliases: ['dir'],
	description: 'List virtual filesystem',
	execute: () => {
		const lines: TerminalLine[] = [];

		for (const entry of VIRTUAL_FS) {
			lines.push({
				kind: 'output',
				segments: [
					{ text: `  ${entry.name.padEnd(18)}`, color: entry.color },
					{ text: entry.type === 'dir' ? '<DIR>' : '', color: 'muted' },
				],
			});
		}

		return { lines };
	},
};

registry.register(lsCommand);
export default lsCommand;
