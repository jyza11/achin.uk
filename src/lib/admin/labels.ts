// Shared 中文 labels for /admin. Reused by every admin slice (works list now,
// edit forms and /admin/text later) so wording stays consistent in one place.
import { ClientResponseError } from 'pocketbase';

export const fieldLabels = {
	title_zh: '中文標題',
	title_en: '英文標題',
	description_zh: '中文說明',
	description_en: '英文說明',
	year: '年份',
	medium: '媒材',
	size: '尺寸',
	sold: '已售',
	collection: '系列',
	sort: '排序',
	status: '狀態',
	image: '圖片'
} as const;

export const collectionLabels = {
	gallery: '油畫',
	sketch: '素描'
} as const;

export const statusLabels = {
	draft: '草稿',
	published: '公開'
} as const;

// Buttons + copy shared by WorkForm (new/edit work) — kept here so wording stays
// consistent with the rest of /admin.
export const actionLabels = {
	save: '儲存',
	saving: '儲存中…',
	cancel: '取消',
	delete: '刪除'
} as const;

export const formLabels = {
	imageHint: '請上傳原始照片，不要裁切或加濾鏡。網站會自動產生網頁用的版本，原始檔會保留。',
	sortHint: '數字小的排前面',
	deleteConfirm: '確定要刪除這件作品？此動作無法復原。',
	missingImage: '請選擇圖片。',
	missingTitle: '請輸入中文標題。'
} as const;

/** Turn a PocketBase error into a 中文 message an artist/editor can act on. */
export function pbErrorToZh(err: unknown): string {
	if (err instanceof ClientResponseError) {
		if (err.status === 0) {
			return '無法連線到後台。';
		}
		// The upload hook rejects HEIC with a plain BadRequestError (no field data); the
		// schema's mimeTypes check reports under data.image. Both mean the same to the artist.
		if (err.status === 400 && (err.response?.data?.image || /HEIC|HEIF/i.test(err.message))) {
			return '圖片格式不支援。請上傳 JPEG、PNG、WebP 或 AVIF；iPhone 請先匯出為 JPEG（設定 › 相機 › 格式 › 最相容）。';
		}
		if (err.status === 401 || err.status === 403) {
			return '沒有權限，請重新登入。';
		}
		return err.message;
	}
	if (err instanceof Error) return err.message;
	return String(err);
}

// Labels for /admin/text — the page-text editor. `groups` maps a slug's prefix
// (the part before the first `.`) to a 中文 heading; `other` covers any slug whose
// prefix isn't one of the known pages.
export const textLabels = {
	heading: '頁面文字',
	hint: '這些文字會顯示在網站各頁，每一段可以分別儲存。',
	loading: '載入中…',
	empty: '尚無文字',
	zh: '中文',
	en: '英文',
	saved: '已儲存',
	groups: {
		home: '首頁',
		about: '關於',
		gallery: '油畫',
		contact: '合作',
		events: '展覽',
		other: '其他'
	}
} as const;
