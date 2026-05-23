import { gsap } from '#lib/gsap';
import { useGSAP } from '@gsap/react';
import type { ReactElement } from 'react';
import { useRef, useCallback } from 'react';

interface BootScreenProps {
	onComplete: () => void;
}

export const BootScreen = ({ onComplete }: BootScreenProps): ReactElement => {
	const containerRef = useRef<HTMLDivElement>(null);
	const logoRef = useRef<HTMLImageElement>(null);

	const handleComplete = useCallback(() => {
		onComplete();
	}, [onComplete]);

	useGSAP(() => {
		const tl = gsap.timeline({
			onComplete: handleComplete,
		});

		tl.fromTo(
			logoRef.current,
			{ opacity: 0, scale: 0.9 },
			{ opacity: 1, scale: 1.05, duration: 0.3, ease: 'power2.out' },
		)
			.to(logoRef.current, { scale: 1, duration: 0.3, ease: 'power1.out' })
			.to(logoRef.current, { opacity: 0, duration: 0.3, ease: 'power2.in' }, '+=0.4')
			.to(containerRef.current, { opacity: 0, duration: 0.2, ease: 'power2.in' }, '-=0.1');
	}, []);

	return (
		<div
			ref={containerRef}
			className="boot-screen"
		>
			<img
				ref={logoRef}
				src="/apple-logo.png"
				alt=""
				className="boot-logo"
			/>
		</div>
	);
};
