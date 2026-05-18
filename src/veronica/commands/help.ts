import { registry } from '../engine/command-registry';
import type { CommandDefinition, TerminalLine } from './types';

const helpCommand: CommandDefinition = {
	name: 'help',
	aliases: ['h', '?'],
	description: 'Show available commands',
	usage: 'help [command]',
	execute: (args) => {
		// Show help for a specific command
		if (args[0]) {
			const result = registry.lookup(args[0]);
			if (!result) {
				return {
					lines: [
						{
							kind: 'error',
							text: `help: no help for '${args[0]}'`,
						},
					],
				};
			}

			const lines: TerminalLine[] = [
				{
					kind: 'output',
					segments: [
						{ text: result.command.name, bold: true, color: 'green' },
					],
				},
				{
					kind: 'output',
					segments: [{ text: `  ${result.command.description}` }],
				},
			];

			if (result.command.usage) {
				lines.push({
					kind: 'output',
					segments: [
						{ text: '  Usage: ', color: 'muted' },
						{ text: result.command.usage },
					],
				});
			}

			if (result.command.aliases?.length) {
				lines.push({
					kind: 'output',
					segments: [
						{ text: '  Aliases: ', color: 'muted' },
						{ text: result.command.aliases.join(', ') },
					],
				});
			}

			return { lines };
		}

		// List all commands
		const all = registry.getAll();
		const lines: TerminalLine[] = [
			{
				kind: 'output',
				segments: [{ text: 'Available commands:', bold: true }],
			},
			{ kind: 'system', text: '' },
		];

		for (const cmd of all) {
			lines.push({
				kind: 'output',
				segments: [
					{ text: `  ${cmd.name.padEnd(12)}`, color: 'green' },
					{ text: cmd.description },
				],
			});
		}

		lines.push({ kind: 'system', text: '' });
		lines.push({
			kind: 'output',
			segments: [
				{ text: '  Type ', color: 'muted' },
				{ text: 'help <command>', color: 'green' },
				{ text: ' for details.', color: 'muted' },
			],
		});

		return { lines };
	},
};

registry.register(helpCommand);
export default helpCommand;
