import { WindowControls } from '#components';
import { WindowWrapper } from '#hoc';
import { TerminalBody } from '#veronica';
import type { ReactElement } from 'react';

/**
 * Desktop Veronica terminal window — interactive AI-powered CLI.
 */
const Veronica = (): ReactElement => {
	return (
		<>
			<div className="window-header">
				<WindowControls target="veronica" />
				<h2>Veronica</h2>
				<div className="window-header-spacer" aria-hidden="true" />
			</div>
			<TerminalBody />
		</>
	);
};

const VeronicaWindow = WindowWrapper(Veronica, 'veronica');
export default VeronicaWindow;
