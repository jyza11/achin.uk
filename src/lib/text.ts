/** Split editor text into paragraphs on blank lines. Shared by server and components. */
export function paragraphs(text: string): string[] {
	return text
		.split(/\n\s*\n/)
		.map((p) => p.trim())
		.filter(Boolean);
}

/** One bilingual text: 中文 first, English second (AGENTS.md › Languages). */
export type Bi = { zh: string; en: string };

/**
 * The CMS block when the CMS has a row for it, else the page's hardcoded fallback. Field by
 * field is deliberately NOT mixed: an empty field in an existing row means "show nothing".
 */
export function bi(block: Bi | undefined, fallback: Bi): Bi {
	return block ?? fallback;
}
