import type { CommandDefinition } from './types';
import { registry } from '../engine/command-registry';

const pwdCommand: CommandDefinition = {
	name: 'pwd',
	description: 'Print working directory',
	execute: () => ({
		lines: [
			{
				kind: 'output',
				segments: [{ text: '~/portfolio' }],
			},
		],
	}),
};

registry.register(pwdCommand);
export default pwdCommand;
