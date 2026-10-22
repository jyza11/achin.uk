// QR codes printed on paper — one entry per code. A printed code must never break:
// never delete or rename a key once it is printed; change its target instead.
// The QR itself encodes https://achin.uk/q/<code>, not the target.
export const qrTargets: Record<string, string> = {
	gallery: '/gallery'
};
