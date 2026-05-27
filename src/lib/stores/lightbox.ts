import { writable } from 'svelte/store';
import type { Work } from '$lib/data/works';

type LightboxState = {
	isOpen: boolean;
	works: Work[];
	index: number;
};

const initial: LightboxState = { isOpen: false, works: [], index: 0 };

function createLightboxStore() {
	const { subscribe, set, update } = writable<LightboxState>(initial);

	return {
		subscribe,
		open(works: Work[], index: number) {
			if (works.length === 0) return; // guard: nothing to show
			const safeIndex = Math.max(0, Math.min(index, works.length - 1));
			set({ isOpen: true, works, index: safeIndex });
		},
		close() {
			update((s) => ({ ...s, isOpen: false }));
		},
		next() {
			update((s) => {
				if (s.works.length === 0) return s; // guard: no modulo-by-zero
				return { ...s, index: (s.index + 1) % s.works.length };
			});
		},
		prev() {
			update((s) => {
				if (s.works.length === 0) return s;
				return { ...s, index: (s.index - 1 + s.works.length) % s.works.length };
			});
		}
	};
}

export const lightboxStore = createLightboxStore();
