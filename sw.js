// sw.template.js — the source of the port's service worker.
//
// This file is a TEMPLATE, not the shipped worker. `scripts/build-sw.mjs` reads it after
// the export finishes, fills the two placeholders from the real build output, and writes
// out/sw.js. Two reasons it cannot be shipped as-is from public/:
//
//   · the precache list cannot be written by hand. Vanilla's SHELL is 43 plain paths
//     (sw.js:6-47) because nothing in that tree is hashed. This export's chunk names are
//     bare 13-character content hashes that change every build, plus a per-build id
//     directory, plus one RSC payload per route — so the list has to be generated from
//     the finished export or it is wrong the moment anything changes.
//   · the version literal. version_display #5 greps the worker's source for a top-level
//     VERSION constant, and the no-hardcoded-version guard forbids that literal anywhere
//     in next/ source. Both hold at once only if the worker is a build product: the guard
//     skips out/, the version comes from package.json, and no source file carries it.
//     Nothing in this file's prose may spell that assignment out, or the grep matches the
//     comment instead of the constant — which is exactly what happened the first time.
//
// THE STRATEGY IS VANILLA'S, carried rule for rule from sw.js:
//   · cache-first, ignoreSearch, never blocking on the network;
//   · non-GET and cross-origin requests are not answered at all, so Supabase sync
//     traffic passes through untouched;
//   · install is one atomic addAll of Requests with cache:'reload', then skipWaiting;
//   · activate deletes only keys starting with the app's own prefix, then clients.claim;
//   · one message type in, one shape out: GET_VERSION -> {type:'VERSION', version}.
//
// THREE DEPARTURES, each forced by the export's shape and each recorded in README.md:
//   1. The navigation fallback. Vanilla answers every navigation miss with the one
//      cached './index.html' because it is a single-document hash-routed SPA. This export
//      has 16 documents and index.html is a client-side redirect to /birds, so answering
//      a /tools navigation with index.html would land the fancier somewhere else. The
//      navigation branch therefore resolves the request's own document first — the flat
//      export means /tools is the file tools.html — and only falls back to index.html for
//      a path it has never heard of.
//   2. A network failure returns a 504 Response instead of rejecting. A rejected
//      respondWith surfaces as a request error in the page, and both intent suites assert
//      ZERO page errors across their offline sections. Vanilla has the same hole and gets
//      away with it because it precaches everything it ever asks for; so does this, but a
//      worker that can only fail loudly is not worth the risk.
//   3. Install is split into a CRITICAL list and a best-effort tail. Vanilla's addAll is
//      one atomic call over 41 hand-checked paths; this list is 131 build-named ones, of
//      which about 60 are RSC payloads that only affect client-side navigation. Keeping
//      the whole thing atomic means one 404 on one payload costs the app its entire
//      offline mode — and on GitHub Pages that is not hypothetical, since every /_next/
//      path needs .nojekyll to be served at all. So the documents, chunks, stylesheets,
//      fonts, datasets, manifest and icons install atomically, exactly as vanilla does,
//      and the payloads are added one by one with their failures reported rather than
//      fatal. A shell that must work still must; a payload that cannot be had degrades
//      one navigation instead of everything.

const VERSION = 'zajil-v2.0.0-dev.1';
const PREFIX = 'zajil-';

// The prefix the SHELL below was GENERATED with. Every entry is qualified with it, so a
// build deployed under a different prefix would 404 all of them, install would reject, and
// the app would report a registered worker with no cache at all — indistinguishable from
// "not activated yet". Baked here so the worker can say so instead.
const BUILT_FOR = '/zajilv2/';

// generated from the finished export by scripts/build-sw.mjs
const SHELL = [
  "/zajilv2/",
  "/zajilv2/.nojekyll",
  "/zajilv2/__next.__PAGE__.txt",
  "/zajilv2/__next._full.txt",
  "/zajilv2/__next._tree.txt",
  "/zajilv2/_next/static/GsRS4-ETqNDvwmDcZqiaA/_buildManifest.js",
  "/zajilv2/_next/static/GsRS4-ETqNDvwmDcZqiaA/_clientMiddlewareManifest.js",
  "/zajilv2/_next/static/GsRS4-ETqNDvwmDcZqiaA/_ssgManifest.js",
  "/zajilv2/_next/static/chunks/04xkbqp3zbjr1.js",
  "/zajilv2/_next/static/chunks/07796av9fmr_2.js",
  "/zajilv2/_next/static/chunks/08qb_lncymrbu.js",
  "/zajilv2/_next/static/chunks/0_1edu-iy0p0g.js",
  "/zajilv2/_next/static/chunks/0cz1d0mv5g_q7.js",
  "/zajilv2/_next/static/chunks/0dn_hptl9hu9t.js",
  "/zajilv2/_next/static/chunks/0e89er2mx2u_y.css",
  "/zajilv2/_next/static/chunks/0g6qy8-zccw7v.js",
  "/zajilv2/_next/static/chunks/0ipswg5i38pmx.css",
  "/zajilv2/_next/static/chunks/0jvhpaew_uadu.js",
  "/zajilv2/_next/static/chunks/0knahspd97h9c.js",
  "/zajilv2/_next/static/chunks/0t5lq5lv2v2qq.js",
  "/zajilv2/_next/static/chunks/11smhr7iky5we.js",
  "/zajilv2/_next/static/chunks/1acym1f6gpg8a.js",
  "/zajilv2/_next/static/chunks/1ivdeioc390p8.css",
  "/zajilv2/_next/static/chunks/1jz64l_c7eqhg.css",
  "/zajilv2/_next/static/chunks/1k-o-8lvszlhf.js",
  "/zajilv2/_next/static/chunks/2-u76ucll5vs0.js",
  "/zajilv2/_next/static/chunks/234isiluwdbzw.js",
  "/zajilv2/_next/static/chunks/27qg6_ucmlfqs.js",
  "/zajilv2/_next/static/chunks/2ih41p65zpf84.css",
  "/zajilv2/_next/static/chunks/2mmpezlrfmbu5.js",
  "/zajilv2/_next/static/chunks/2nis6bnjhc0v1.js",
  "/zajilv2/_next/static/chunks/2tyz_0ruvd7d8.js",
  "/zajilv2/_next/static/chunks/3-r88-vuz09z8.js",
  "/zajilv2/_next/static/chunks/33wmmxu2kkyqh.js",
  "/zajilv2/_next/static/chunks/35k_tbw4wpgo9.js",
  "/zajilv2/_next/static/chunks/36s0_oppz_dxw.js",
  "/zajilv2/_next/static/chunks/38zt4d4lr33pb.js",
  "/zajilv2/_next/static/chunks/3aix2ochs0-cq.js",
  "/zajilv2/_next/static/chunks/3evq2r089fpsa.js",
  "/zajilv2/_next/static/chunks/3fntmmi971322.js",
  "/zajilv2/_next/static/chunks/3gxkcfb887iyi.js",
  "/zajilv2/_next/static/chunks/3q69vt1m6dy3d.css",
  "/zajilv2/_next/static/chunks/3xca2w39t40h2.css",
  "/zajilv2/_next/static/chunks/3yn-s3-bqfr_t.js",
  "/zajilv2/_next/static/chunks/40-s9frdgnj_i.css",
  "/zajilv2/_next/static/chunks/turbopack-34rh9x1i1c1t-.js",
  "/zajilv2/_next/static/media/alexandria_var-s.p.1kcp3q9nxg9at.woff2",
  "/zajilv2/_next/static/media/apple-icon.3lsu9wusm9ggv.png",
  "/zajilv2/_next/static/media/favicon.2vob68tjqpejf.ico",
  "/zajilv2/_next/static/media/ibm_plex_mono_latin_500-s.p.11q3guvgd1r20.woff2",
  "/zajilv2/_next/static/media/ibm_plex_mono_latin_600-s.p.30e0eqd5fxn92.woff2",
  "/zajilv2/apple-icon.png",
  "/zajilv2/bird/__next._full.txt",
  "/zajilv2/bird/__next._tree.txt",
  "/zajilv2/bird/__next.bird.__PAGE__.txt",
  "/zajilv2/bird/edit/__next._full.txt",
  "/zajilv2/bird/edit/__next._tree.txt",
  "/zajilv2/bird/edit/__next.bird.edit.__PAGE__.txt",
  "/zajilv2/bird/edit/index.html",
  "/zajilv2/bird/edit/index.txt",
  "/zajilv2/bird/index.html",
  "/zajilv2/bird/index.txt",
  "/zajilv2/bird/new/__next._full.txt",
  "/zajilv2/bird/new/__next._tree.txt",
  "/zajilv2/bird/new/__next.bird.new.__PAGE__.txt",
  "/zajilv2/bird/new/index.html",
  "/zajilv2/bird/new/index.txt",
  "/zajilv2/birds/__next._full.txt",
  "/zajilv2/birds/__next._tree.txt",
  "/zajilv2/birds/__next.birds.__PAGE__.txt",
  "/zajilv2/birds/index.html",
  "/zajilv2/birds/index.txt",
  "/zajilv2/breeding/__next._full.txt",
  "/zajilv2/breeding/__next._tree.txt",
  "/zajilv2/breeding/__next.breeding.__PAGE__.txt",
  "/zajilv2/breeding/index.html",
  "/zajilv2/breeding/index.txt",
  "/zajilv2/cert/__next._full.txt",
  "/zajilv2/cert/__next._tree.txt",
  "/zajilv2/cert/__next.cert.__PAGE__.txt",
  "/zajilv2/cert/index.html",
  "/zajilv2/cert/index.txt",
  "/zajilv2/example-loft-large.json",
  "/zajilv2/favicon.ico",
  "/zajilv2/health/__next._full.txt",
  "/zajilv2/health/__next._tree.txt",
  "/zajilv2/health/__next.health.__PAGE__.txt",
  "/zajilv2/health/index.html",
  "/zajilv2/health/index.txt",
  "/zajilv2/icons/icon-192.png",
  "/zajilv2/icons/icon-512-maskable.png",
  "/zajilv2/icons/icon-512.png",
  "/zajilv2/index.html",
  "/zajilv2/index.txt",
  "/zajilv2/manifest.webmanifest",
  "/zajilv2/pair/__next._full.txt",
  "/zajilv2/pair/__next._tree.txt",
  "/zajilv2/pair/__next.pair.__PAGE__.txt",
  "/zajilv2/pair/index.html",
  "/zajilv2/pair/index.txt",
  "/zajilv2/pedigree/__next._full.txt",
  "/zajilv2/pedigree/__next._tree.txt",
  "/zajilv2/pedigree/__next.pedigree.__PAGE__.txt",
  "/zajilv2/pedigree/index.html",
  "/zajilv2/pedigree/index.txt",
  "/zajilv2/races/__next._full.txt",
  "/zajilv2/races/__next._tree.txt",
  "/zajilv2/races/__next.races.__PAGE__.txt",
  "/zajilv2/races/index.html",
  "/zajilv2/races/index.txt",
  "/zajilv2/sample-data.json",
  "/zajilv2/sign-in/__next._full.txt",
  "/zajilv2/sign-in/__next._tree.txt",
  "/zajilv2/sign-in/__next.sign-in.__PAGE__.txt",
  "/zajilv2/sign-in/index.html",
  "/zajilv2/sign-in/index.txt",
  "/zajilv2/stats/__next._full.txt",
  "/zajilv2/stats/__next._tree.txt",
  "/zajilv2/stats/__next.stats.__PAGE__.txt",
  "/zajilv2/stats/index.html",
  "/zajilv2/stats/index.txt",
  "/zajilv2/sync-config.js",
  "/zajilv2/tools/__next._full.txt",
  "/zajilv2/tools/__next._tree.txt",
  "/zajilv2/tools/__next.tools.__PAGE__.txt",
  "/zajilv2/tools/index.html",
  "/zajilv2/tools/index.txt"
];

// what this worker actually controls, e.g. '/' or '/zajil/'
const SCOPE = new URL(self.registration ? self.registration.scope : './', self.location.href).pathname;

// Documents, code, type and data — the shell that must work or there is no offline mode.
// The rest (RSC navigation payloads) is best-effort; see departure 3.
const CRITICAL = new RegExp(
  '(/$|\\.html$|\\.css$|\\.js$|\\.woff2?$|\\.json$|\\.webmanifest$|\\.png$|\\.ico$|\\.svg$)');

// `cache: 'reload'` bypasses the browser HTTP cache: hosts such as GitHub Pages send
// max-age, so a plain addAll can bake stale copies of the PREVIOUS deploy into the new
// version cache — permanently, since a version cache is only ever written once.
const fresh = (u) => new Request(u, { cache: 'reload' });

async function precache() {
  if (SCOPE !== BUILT_FOR) {
    // Say it once, loudly. Every SHELL entry is qualified with BUILT_FOR, so none of them
    // can be fetched from here and there is nothing this worker can usefully cache.
    console.error(`[zajil] this service worker was built for ${BUILT_FOR} but is installed `
      + `at ${SCOPE}; its precache list cannot be fetched. Rebuild with `
      + `NEXT_PUBLIC_BASE_PATH set to the path it is deployed under.`);
    return;
  }
  const c = await caches.open(VERSION);
  const critical = SHELL.filter((u) => CRITICAL.test(u));
  const optional = SHELL.filter((u) => !CRITICAL.test(u));
  // atomic, as vanilla is: if the shell cannot be had, there is no offline mode to report
  await c.addAll(critical.map(fresh));
  // best-effort: one missing navigation payload costs one navigation, not everything
  const missed = [];
  await Promise.all(optional.map((u) => c.add(fresh(u)).catch(() => missed.push(u))));
  if (missed.length) console.warn(`[zajil] ${missed.length} of ${optional.length} navigation `
    + `payloads could not be precached; those routes will need the network once.`, missed.slice(0, 5));
}

self.addEventListener('install', (e) => {
  e.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      // CacheStorage is per-ORIGIN, not per-scope: on <user>.github.io every project site
      // shares it. Only ever delete our own caches, or we wipe the offline data of sibling
      // apps on the same account.
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith(PREFIX) && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// The page asks the CONTROLLING worker what it is, so the About row reports what is
// actually installed rather than a constant compiled into the bundle — those two disagree
// exactly when it matters, i.e. when an update has not activated yet. Replies down the
// MessageChannel port when given one, otherwise to the requesting client.
self.addEventListener('message', (e) => {
  if (!e.data || e.data.type !== 'GET_VERSION') return;
  const reply = { type: 'VERSION', version: VERSION };
  if (e.ports && e.ports[0]) e.ports[0].postMessage(reply);
  else if (e.source && e.source.postMessage) e.source.postMessage(reply);
});

/**
 * [departure 1] Which document answers this navigation.
 *
 * The export is flat and trailingSlash-false: the route /tools is the file tools.html, and
 * /tools/ holds only RSC payloads. A host with clean URLs asks for /tools; a plain file
 * server asks for /tools.html. Both must find the same cached document, and a record view
 * carries its id in the query (/bird?id=…), which is not part of the document's identity.
 */
function documentCandidates(url) {
  const path = url.pathname;
  // `path` itself is not a candidate: the read above already tried the request, and with
  // ignoreSearch that is the same lookup
  const out = [];
  if (!/\.[a-z0-9]+$/i.test(path)) {
    // BOTH export shapes, because a worker outlives the config that built it. `trailingSlash:
    // true` (RULED 2026-09-25) writes stats/index.html; before it, stats.html. The directory
    // index is tried FIRST because it is what this build produces.
    //
    // The bare, slash-less form is the one that matters here. ONLINE the host redirects
    // /stats to /stats/ and the question never arises; OFFLINE there is no host, so a
    // bookmark, a typed URL or a link someone trimmed the slash off is answered by this
    // worker alone — and without this candidate it fell through to SCOPE + index.html and
    // rendered the SHELL, which redirects to /birds. The user asks for stats offline and
    // silently gets the loft: a wrong document, not an error. Caught by the gate, not by
    // reading.
    out.push(path.replace(/\/$/, '') + '/index.html');
    out.push(path.replace(/\/$/, '') + '.html');
    if (path.endsWith('/')) out.push(path + 'index.html');
  }
  out.push(SCOPE + 'index.html');
  return out;
}

// ignoreSearch because a record view carries its id in the query and the export's own
// asset links carry a hash there; ignoreVary because a host that sends Vary on a precached
// response would otherwise turn every cache-first hit into a miss and take offline with it.
const MATCH = { ignoreSearch: true, ignoreVary: true };

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    // read from OUR cache only, for the same origin-sharing reason
    caches.open(VERSION).then(async (c) => {
      const hit = await c.match(e.request, MATCH);
      if (hit) return hit;

      if (e.request.mode === 'navigate') {
        for (const candidate of documentCandidates(url)) {
          const doc = await c.match(candidate, MATCH);
          if (doc) return doc;
        }
      }

      // everything else tries the network and back-fills the cache for next time
      try {
        const res = await fetch(e.request);
        if (res.ok) c.put(e.request, res.clone());
        return res;
      } catch {
        // [departure 2] answer, do not reject: a rejected respondWith is a page error, and
        // being offline is the condition this app is built for, not a fault
        return new Response('', { status: 504, statusText: 'Offline' });
      }
    }),
  );
});
