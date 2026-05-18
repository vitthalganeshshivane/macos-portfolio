import type { CommandDefinition } from './types';
import { registry } from '../engine/command-registry';

const aboutCommand: CommandDefinition = {
	name: 'about',
	aliases: ['bio', 'info'],
	description: 'About Vitthal',
	execute: () => ({
		lines: [
			{
				kind: 'output',
				segments: [{ text: 'Vitthal Ganesh Shivane', bold: true, color: 'green' }],
			},
			{ kind: 'system', text: '' },
			{
				kind: 'output',
				segments: [
					{ text: 'Role       ', color: 'green' },
					{ text: 'Aspiring Software Engineer' },
				],
			},
			{
				kind: 'output',
				segments: [
					{ text: 'Focus      ', color: 'green' },
					{ text: 'MERN Stack, Full-Stack Web' },
				],
			},
			{
				kind: 'output',
				segments: [
					{ text: 'Education  ', color: 'green' },
					{ text: 'BTech CSE (2023-2026)' },
				],
			},
			{
				kind: 'output',
				segments: [
					{ text: 'Diploma    ', color: 'green' },
					{ text: 'Mechanical Engineering' },
				],
			},
			{ kind: 'system', text: '' },
			{
				kind: 'output',
				segments: [
					{ text: 'Building real-world solutions with clean code' },
				],
			},
			{
				kind: 'output',
				segments: [
					{ text: 'and modern web technologies.' },
				],
			},
		],
	}),
};

registry.register(aboutCommand);
export default aboutCommand;
