import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';

// Browser-only client for /admin. Do NOT import anything from $lib/server here — that module
// is server-only and this one ships to the client bundle instead.
//
// `/admin/+layout.ts` sets `ssr = false`, so every admin route only ever runs client-side —
// this module should never be imported from a server-loaded route. The default auth store
// (no second constructor arg) persists the session to localStorage in the browser and falls
// back to an in-memory store if localStorage isn't available, so constructing it here is safe
// even if that assumption is ever broken.
const PB_URL = env.PUBLIC_PB_URL ?? 'http://127.0.0.1:8090';

export const pb = new PocketBase(PB_URL);
