import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanAll, scanProject } from './lib/scanner.js';
import { Store } from './lib/store.js';
import { openInVSCode, openInExplorer, openTerminal } from './lib/launcher.js';
import { summarize, hasApiKey, DEFAULT_MODEL } from './lib/ai.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_FILE = path.join(here, 'config.json');
const PUBLIC_DIR = path.join(here, 'public');

// .env dosyasını oku (OPENROUTER_API_KEY vb.); sistemde tanımlı değişkenler önceliklidir
try {
  const env = await fs.readFile(path.join(here, '.env'), 'utf8');
  for (const line of env.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
} catch {}

let config = JSON.parse(await fs.readFile(CONFIG_FILE, 'utf8'));
config.aiModel ||= DEFAULT_MODEL;
const PORT = Number(process.env.PORT || config.port || 4545);
const store = new Store(path.join(here, 'data', 'kokpit.json'));
await store.load();

let projects = [];
let scannedAt = null;
let scanning = null;

async function rescan() {
  scanning ??= scanAll(config)
    .then((list) => {
      projects = list;
      scannedAt = new Date().toISOString();
    })
    .finally(() => {
      scanning = null;
    });
  return scanning;
}

const withMeta = (p) => ({ ...p, meta: store.get(p.id) });
const findProject = (id) => projects.find((p) => p.id === id);

// ---------- HTTP yardımcıları ----------
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 1_000_000) throw new Error('İstek çok büyük');
  }
  return raw ? JSON.parse(raw) : {};
}

// Sadece bu makineden ve bu sayfadan gelen isteklere izin ver
// (DNS rebinding ve başka sitelerin localhost'a istek atmasına karşı)
function isTrusted(req) {
  const host = (req.headers.host || '').toLowerCase();
  if (host !== `localhost:${PORT}` && host !== `127.0.0.1:${PORT}`) return false;
  if (req.method !== 'GET') {
    const origin = req.headers.origin;
    if (!origin || (origin !== `http://localhost:${PORT}` && origin !== `http://127.0.0.1:${PORT}`)) return false;
  }
  return true;
}

async function serveStatic(req, res, pathname) {
  const file = path.normalize(path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname));
  if (!file.startsWith(PUBLIC_DIR)) return send(res, 403, { error: 'Yasak' });
  try {
    const data = await fs.readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    send(res, 404, { error: 'Bulunamadı' });
  }
}

// ---------- API ----------
const STATUSES = new Set(['aktif', 'beklemede', 'yayina-yakin', 'yayinda', 'arsiv']);

async function handleApi(req, res, pathname, query) {
  if (pathname === '/api/projects' && req.method === 'GET') {
    if (query.get('refresh') === '1' || !scannedAt) await rescan();
    else if (scanning) await scanning;
    return send(res, 200, { projects: projects.map(withMeta), scannedAt, roots: config.roots });
  }

  if (pathname === '/api/config') {
    if (req.method === 'GET') return send(res, 200, { ...config, hasApiKey: hasApiKey() });
    if (req.method === 'PUT') {
      const body = await readBody(req);
      const roots = (body.roots || []).map((r) => String(r).trim()).filter(Boolean);
      const missing = [];
      for (const r of roots) {
        try {
          if (!(await fs.stat(r)).isDirectory()) missing.push(r);
        } catch {
          missing.push(r);
        }
      }
      if (!roots.length) return send(res, 400, { error: 'En az bir klasör gerekli.' });
      if (missing.length) return send(res, 400, { error: `Klasör bulunamadı: ${missing.join(', ')}` });
      const aiModel = String(body.aiModel || '').trim() || DEFAULT_MODEL;
      if (!/^[\w.~:/-]+$/.test(aiModel)) return send(res, 400, { error: 'Model adı geçersiz (örn. anthropic/claude-sonnet-5).' });
      config = { ...config, roots, staleDays: Number(body.staleDays) || config.staleDays, aiModel };
      await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
      await rescan();
      return send(res, 200, { ...config, hasApiKey: hasApiKey() });
    }
  }

  const m = pathname.match(/^\/api\/projects\/([a-f0-9]{10})(?:\/(meta|action|ai|rescan))?$/);
  if (!m) return send(res, 404, { error: 'Bilinmeyen adres' });
  const project = findProject(m[1]);
  if (!project) return send(res, 404, { error: 'Proje bulunamadı, listeyi yenile.' });
  const sub = m[2];

  if (!sub && req.method === 'GET') return send(res, 200, withMeta(project));

  if (sub === 'rescan' && req.method === 'POST') {
    const fresh = await scanProject(project.path, project.rootLabel, config);
    projects = projects.map((p) => (p.id === fresh.id ? fresh : p));
    return send(res, 200, withMeta(fresh));
  }

  if (sub === 'meta' && req.method === 'PATCH') {
    const body = await readBody(req);
    const patch = {};
    if ('status' in body) {
      if (body.status && !STATUSES.has(body.status)) return send(res, 400, { error: 'Geçersiz durum' });
      patch.status = body.status || null;
    }
    if ('note' in body) patch.note = String(body.note ?? '').slice(0, 20000);
    if ('checklist' in body && typeof body.checklist === 'object') patch.checklist = body.checklist;
    if ('customItems' in body && Array.isArray(body.customItems)) {
      patch.customItems = body.customItems.map((s) => String(s).slice(0, 200)).slice(0, 50);
    }
    if ('pinned' in body) patch.pinned = !!body.pinned;
    const meta = await store.update(project.id, patch);
    return send(res, 200, meta);
  }

  if (sub === 'action' && req.method === 'POST') {
    const { action, subproject } = await readBody(req);
    const target = subproject ? project.subprojects.find((s) => s.rel === subproject) : null;
    const dir = target?.dir || project.path;
    try {
      if (action === 'vscode') openInVSCode(dir);
      else if (action === 'explorer') openInExplorer(dir);
      else if (action === 'terminal') openTerminal(dir, null, project.name);
      else if (action === 'run') {
        if (!target?.run) return send(res, 400, { error: 'Bu alt proje için çalıştırma komutu yok.' });
        openTerminal(target.dir, target.run, `${project.name} — ${target.stack}`);
      } else return send(res, 400, { error: 'Bilinmeyen işlem' });
    } catch (err) {
      return send(res, 400, { error: err.message });
    }
    return send(res, 200, { ok: true });
  }

  if (sub === 'ai' && req.method === 'POST') {
    try {
      const summary = await summarize(project, store.get(project.id), { model: config.aiModel, port: PORT });
      const meta = await store.update(project.id, { aiSummary: summary });
      return send(res, 200, meta);
    } catch (err) {
      return send(res, 500, { error: err.message });
    }
  }

  send(res, 405, { error: 'İzin verilmeyen yöntem' });
}

const server = http.createServer(async (req, res) => {
  try {
    if (!isTrusted(req)) return send(res, 403, { error: 'Yalnızca yerel erişim' });
    const url = new URL(req.url, `http://localhost:${PORT}`);
    if (url.pathname.startsWith('/api/')) return await handleApi(req, res, url.pathname, url.searchParams);
    if (req.method !== 'GET') return send(res, 405, { error: 'İzin verilmeyen yöntem' });
    return await serveStatic(req, res, decodeURIComponent(url.pathname));
  } catch (err) {
    console.error(err);
    if (!res.headersSent) send(res, 500, { error: err.message });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  🚀 Proje Kokpiti hazır: http://localhost:${PORT}\n`);
  rescan().then(() => console.log(`  ${projects.length} proje tarandı.`));
});
