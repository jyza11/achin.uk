/// Runs inside PocketBase's JS VM (not Node) — excluded from ESLint.
/// Loaded from rebuild.pb.js via require() — PocketBase runs each handler in an isolated
/// VM, so shared code must live in a module like this one.
///
/// Netlify rebuild trigger (AGENTS.md › Deployment): content edits reach the live site
/// through a rebuild, not instantly. Every `works`/`content_blocks` write records a
/// "last change" time; a cron job checks every minute and fires the Netlify build hook
/// once the content has been quiet for REBUILD_QUIET_SECONDS (default 120), so a burst of
/// edits triggers one build, not one per save.
///
/// Two files, two writers — no shared write, so no lost update between a record hook and
/// the cron tick running in different VMs:
///   <dataDir>/rebuild-last-change   written ONLY by record hooks (unix seconds)
///   <dataDir>/rebuild-built-at      written ONLY by the cron tick (the last-change value
///                                   it had seen when the build hook accepted the request)
/// "Dirty" simply means last-change > built-at. An edit that lands while the request is
/// in flight moves last-change past the value the tick records, so it stays dirty and the
/// next tick fires again — a rebuild is never dropped; at worst one fires twice.
/// The build hook URL is a secret: it is never logged, and transport errors (whose text
/// embeds the URL) are logged as a fixed string.

const LAST_CHANGE_FILE = 'rebuild-last-change';
const BUILT_AT_FILE = 'rebuild-built-at';

function readNumber(path) {
	try {
		const n = parseInt(toString($os.readFile(path)), 10);
		return Number.isNaN(n) ? 0 : n;
	} catch (_) {
		return 0; // missing or unreadable — treat as "never"
	}
}

function now() {
	return Math.floor(Date.now() / 1000);
}

function readState(app) {
	const dir = app.dataDir() + '/';
	const lastChange = readNumber(dir + LAST_CHANGE_FILE);
	const builtAt = readNumber(dir + BUILT_AT_FILE);
	return { dirty: lastChange > builtAt, last_change_at: lastChange, built_at: builtAt };
}

// Record hooks only. Never throws to the caller's benefit — but callers still wrap it.
function markDirty(app) {
	$os.writeFile(app.dataDir() + '/' + LAST_CHANGE_FILE, String(now()), 0o644);
}

function quietSeconds() {
	const n = parseInt($os.getenv('REBUILD_QUIET_SECONDS'), 10);
	return Number.isNaN(n) ? 120 : n;
}

// Cron tick, every minute. Never throws: a failed or skipped tick means the next one
// tries again. (The "not set" notice may repeat once a minute in some runs — PocketBase
// may or may not reuse the VM between ticks — that is acceptable for a misconfiguration.)
let warnedMissingHook = false;
function tick(app) {
	const url = $os.getenv('NETLIFY_BUILD_HOOK');
	if (!url) {
		if (!warnedMissingHook) {
			console.log('[rebuild] NETLIFY_BUILD_HOOK not set — auto-rebuild disabled');
			warnedMissingHook = true;
		}
		return;
	}

	const state = readState(app);
	if (!state.dirty) return;
	if (now() - state.last_change_at < quietSeconds()) return; // still changing

	const seenAt = state.last_change_at;
	let res;
	try {
		res = $http.send({ url: url, method: 'POST', timeout: 20 });
	} catch (_) {
		// The Go error text embeds the request URL — never log it.
		console.log('[rebuild] build hook request failed (network/timeout) — will retry');
		return;
	}
	if (res.statusCode < 200 || res.statusCode >= 300) {
		console.log('[rebuild] build hook failed: status ' + res.statusCode + ' — will retry');
		return;
	}
	try {
		$os.writeFile(app.dataDir() + '/' + BUILT_AT_FILE, String(seenAt), 0o644);
	} catch (_) {
		// Could not record the build; the next tick will fire once more. Better one extra
		// build than a missed one.
		console.log('[rebuild] build triggered but could not record built-at — may fire again');
		return;
	}
	console.log('[rebuild] triggered Netlify build (status ' + res.statusCode + ')');
}

module.exports = { readState, markDirty, tick };
