import type { CommandDefinition } from './types';
import { registry } from '../engine/command-registry';

const resumeCommand: CommandDefinition = {
	name: 'resume',
	aliases: ['cv'],
	description: 'Open resume viewer',
	execute: () => ({
		lines: [
			{
				kind: 'output',
				segments: [{ text: 'Opening resume...', color: 'muted' }],
			},
		],
		openWindow: 'resume',
	}),
};

registry.register(resumeCommand);
export default resumeCommand;
