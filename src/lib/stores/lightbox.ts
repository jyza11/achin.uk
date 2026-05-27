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
			set({ isOpen: true, works, index });
		},
		close() {
			update((s) => ({ ...s, isOpen: false }));
		},
		next() {
			update((s) => ({ ...s, index: (s.index + 1) % s.works.length }));
		},
		prev() {
			update((s) => ({ ...s, index: (s.index - 1 + s.works.length) % s.works.length }));
		}
	};
}

export const lightboxStore = createLightboxStore();
