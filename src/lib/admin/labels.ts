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

/** Turn a PocketBase error into a 中文 message an artist/editor can act on. */
export function pbErrorToZh(err: unknown): string {
	if (err instanceof ClientResponseError) {
		if (err.status === 0) {
			return '無法連線到後台。';
		}
		if (err.status === 400 && err.response?.data?.image) {
			return '圖片格式不支援。請上傳 JPEG、PNG、WebP 或 AVIF；iPhone 請先匯出為 JPEG。';
		}
		if (err.status === 401 || err.status === 403) {
			return '沒有權限，請重新登入。';
		}
		return err.message;
	}
	if (err instanceof Error) return err.message;
	return String(err);
}
