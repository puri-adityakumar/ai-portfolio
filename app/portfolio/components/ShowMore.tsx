'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

interface ShowMoreProps {
	collapsed: ReactNode;
	expanded: ReactNode;
	initialExpanded?: boolean;
	moreLabel?: string;
	lessLabel?: string;
	className?: string;
}

export default function ShowMore({
	collapsed,
	expanded,
	initialExpanded = false,
	moreLabel = 'Show more',
	lessLabel = 'Show less',
	className = ''
}: ShowMoreProps) {
	const [isExpanded, setIsExpanded] = useState<boolean>(initialExpanded);

	return (
		<div className={className}>
			<div>
				{isExpanded ? expanded : collapsed}
			</div>
			<div className="mt-6 flex justify-center">
				<button
					type="button"
					onClick={() => setIsExpanded((v) => !v)}
					className="inline-flex items-center gap-2 px-4 py-2 glass-strong rounded-lg text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-colors"
					aria-expanded={isExpanded}
				>
					<span>{isExpanded ? lessLabel : moreLabel}</span>
					<svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
					</svg>
				</button>
			</div>
		</div>
	);
}


