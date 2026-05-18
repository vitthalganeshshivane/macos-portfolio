import type { CommandDefinition } from '../types';

class CommandRegistry {
	private commands = new Map<string, CommandDefinition>();
	private aliases = new Map<string, string>();

	register(command: CommandDefinition): void {
		this.commands.set(command.name, command);
		for (const alias of command.aliases ?? []) {
			this.aliases.set(alias, command.name);
		}
	}

	lookup(input: string): { command: CommandDefinition; args: string[] } | null {
		const parts = input.trim().split(/\s+/);
		if (parts.length === 0 || parts[0] === '') return null;

		const name = parts[0].toLowerCase();
		const args = parts.slice(1);

		const command = this.commands.get(name) ?? this.commands.get(this.aliases.get(name) ?? '');
		if (!command) return null;

		return { command, args };
	}

	getAll(): CommandDefinition[] {
		return Array.from(this.commands.values());
	}

	getNames(): string[] {
		const names: string[] = [];
		for (const cmd of this.commands.values()) {
			names.push(cmd.name);
			for (const alias of cmd.aliases ?? []) {
				names.push(alias);
			}
		}
		return names;
	}
}

/** Singleton command registry instance. */
export const registry = new CommandRegistry();
