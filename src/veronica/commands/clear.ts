import type { CommandDefinition } from './types';
import { registry } from '../engine/command-registry';

const clearCommand: CommandDefinition = {
	name: 'clear',
	aliases: ['cls'],
	description: 'Clear terminal output',
	execute: () => ({
		lines: [],
	}),
};

registry.register(clearCommand);
export default clearCommand;
