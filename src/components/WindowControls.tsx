import type { WindowKey } from '#store';
import { useWindowStore } from '#store';
import type { ReactElement } from 'react';
import { useShallow } from 'zustand/react/shallow';

interface WindowControlsProps {
	target: WindowKey;
}

export const WindowControls = ({
	target,
}: WindowControlsProps): ReactElement => {
	const { closeWindow, toggleMaximize } = useWindowStore();
	const isMaximized = useWindowStore(
		useShallow((state) => state.windows[target]?.isMaximized ?? false),
	);

	return (
		<div className="window-controls">
			<button
				type="button"
				className="close"
				aria-label="Close window"
				onClick={() => {
					closeWindow(target);
				}}
			/>
			<button
				type="button"
				className="minimize"
				aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
				onClick={() => {
					toggleMaximize(target);
				}}
			/>
			<button
				type="button"
				className="maximize"
				aria-label="Zoom window"
			/>
		</div>
	);
};

export default WindowControls;