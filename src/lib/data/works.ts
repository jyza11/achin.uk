export type Work = {
	src: string;
	/** Larger copy for the lightbox (the CMS's 2400px web image); falls back to src. */
	hires?: string;
	alt: string;
	title: string;
	year: string;
	medium: string;
	size: string;
	sold?: boolean;
};
