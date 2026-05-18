import type { CommandDefinition, TerminalLine } from './types';
import { registry } from '../engine/command-registry';
import { VERSION } from '../constants';

const veronicaCommand: CommandDefinition = {
	name: 'veronica',
	aliases: ['version', 'v'],
	description: 'About Veronica',
	execute: () => {
		const lines: TerminalLine[] = [
			{
				kind: 'output',
				segments: [
					{ text: 'Veronica', bold: true, color: 'green' },
					{ text: ` v${VERSION}` },
				],
			},
			{ kind: 'system', text: '' },
			{
				kind: 'output',
				segments: [
					{ text: 'Type  ', color: 'muted' },
					{ text: 'Terminal AI Assistant', color: 'green' },
				],
			},
			{
				kind: 'output',
				segments: [
					{ text: 'Built  ', color: 'muted' },
					{ text: 'for Vitthal\'s Portfolio' },
				],
			},
			{
				kind: 'output',
				segments: [
					{ text: 'Stack  ', color: 'muted' },
					{ text: 'React + Zustand + TypeScript' },
				],
			},
			{
				kind: 'output',
				segments: [
					{ text: 'Mode   ', color: 'muted' },
					{ text: 'Hybrid (Local + AI)' },
				],
			},
			{ kind: 'system', text: '' },
			{
				kind: 'output',
				segments: [
					{ text: 'Terminal-native. Not a chatbot.', color: 'muted' },
				],
			},
		];

		return { lines };
	},
};

registry.register(veronicaCommand);
export default veronicaCommand;
