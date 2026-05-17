import clsx from 'clsx';
import type { ReactElement } from 'react';
import type { OutputSegment } from '../types';
import { COLOR_MAP } from '../constants';

interface SegmentRendererProps {
	segment: OutputSegment;
}

export const SegmentRenderer = ({
	segment,
}: SegmentRendererProps): ReactElement => {
	const colorClass = segment.color ? COLOR_MAP[segment.color] : '';
	const className = clsx(colorClass, segment.bold && 'font-bold');

	if (segment.href) {
		return (
			<a
				href={segment.href}
				target="_blank"
				rel="noopener noreferrer"
				className={clsx(className, 'terminal-link')}
			>
				{segment.text}
			</a>
		);
	}

	return <span className={className}>{segment.text}</span>;
};
