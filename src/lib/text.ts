/** Split editor text into paragraphs on blank lines. Shared by server and components. */
export function paragraphs(text: string): string[] {
	return text
		.split(/\n\s*\n/)
		.map((p) => p.trim())
		.filter(Boolean);
}
