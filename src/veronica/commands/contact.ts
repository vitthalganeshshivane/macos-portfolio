import { CONTACT_EMAIL, socials } from '#constants';
import type { CommandDefinition, TerminalLine } from './types';
import { registry } from '../engine/command-registry';

const contactCommand: CommandDefinition = {
	name: 'contact',
	aliases: ['email', 'socials'],
	description: 'Contact info and socials',
	execute: () => {
		const lines: TerminalLine[] = [
			{
				kind: 'output',
				segments: [{ text: 'Contact:', bold: true }],
			},
			{ kind: 'system', text: '' },
			{
				kind: 'output',
				segments: [
					{ text: '  Email      ', color: 'green' },
					{ text: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
				],
			},
			{ kind: 'system', text: '' },
			{
				kind: 'output',
				segments: [{ text: 'Socials:', bold: true }],
			},
		];

		for (const { text, link } of socials) {
			lines.push({
				kind: 'output',
				segments: [
					{ text: `  ${text.padEnd(12)}`, color: 'green' },
					{ text: link, href: link },
				],
			});
		}

		return { lines };
	},
};

registry.register(contactCommand);
export default contactCommand;
