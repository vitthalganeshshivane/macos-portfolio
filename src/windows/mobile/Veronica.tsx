import { MobileWindowHeader } from '#components/mobile/WindowHeader';
import { MobileWindowWrapper } from '#hoc';
import { TerminalBody } from '#veronica';
import type { ReactElement } from 'react';

/**
 * Mobile Veronica terminal window.
 */
const MobileVeronica = (): ReactElement => {
	return (
		<>
			<MobileWindowHeader windowKey="veronica" title="Veronica" />
			<TerminalBody />
		</>
	);
};

const MobileVeronicaWindow = MobileWindowWrapper(MobileVeronica, 'veronica');
export default MobileVeronicaWindow;
