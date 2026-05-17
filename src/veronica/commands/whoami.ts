import type { CommandDefinition } from './types';
import { registry } from '../engine/command-registry';

const whoamiCommand: CommandDefinition = {
	name: 'whoami',
	description: 'Print current user',
	execute: () => ({
		lines: [
			{
				kind: 'output',
				segments: [{ text: 'vitthalganeshshivane' }],
			},
		],
	}),
};

registry.register(whoamiCommand);
export default whoamiCommand;
