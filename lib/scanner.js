import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { inspectRepo } from './git.js';

// Bu klasörlere ne teknoloji tespiti ne de "son değişiklik" taraması için girilir.
const IGNORE = new Set([
  'node_modules', '.git', 'build', 'dist', 'out', 'target', 'bin', 'obj', 'coverage',
  '.dart_tool', '.gradle', '.idea', '.vscode', '.next', '.expo', '.firebase', '.cache',
  '__pycache__', 'venv', 'env', '.godot', 'Pods', '.pub-cache', 'output', '.claude',
  '.kiro', '.trae', '.qoder', '.aider', '.amazonq', '.codex', '.cursor',
]);
const isIgnored = (name) => IGNORE.has(name) || name.startsWith('.venv');

// Flutter projesinin platform klasörleri; içlerindeki index.html vb. yanıltmasın
const FLUTTER_PLATFORM_DIRS = new Set(['android', 'ios', 'linux', 'macos', 'windows', 'web']);

export const projectId = (p) => crypto.createHash('sha1').update(p.toLowerCase()).digest('hex').slice(0, 10);

async function readText(file, max = 200_000) {
  try {
    const buf = await fs.readFile(file);
    return buf.subarray(0, max).toString('utf8');
  } catch {
    return null;
  }
}

async function listDir(dir) {
  try {
    return await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

function findVenvPython(dir) {
  for (const v of ['.venv', 'venv', 'env']) {
    const py = path.join(dir, v, 'Scripts', 'python.exe');
    if (existsSync(py)) return { venv: v, python: py };
  }
  return null;
}

// Bir klasörün ne tür bir alt proje olduğunu belirler (yoksa null)
async function detectStack(dir, names) {
  const has = (n) => names.has(n);

  if (has('pubspec.yaml')) {
    const txt = (await readText(path.join(dir, 'pubspec.yaml'))) || '';
    const isFlutter = /^\s*flutter\s*:/m.test(txt) || /sdk:\s*flutter/.test(txt);
    return {
      stack: isFlutter ? 'Flutter' : 'Dart',
      kind: isFlutter ? 'mobile' : 'other',
      version: txt.match(/^version:\s*(\S+)/m)?.[1] || null,
      run: isFlutter ? 'flutter run' : 'dart run',
      health: has('.dart_tool') ? [] : [{ level: 'info', text: 'Paketler çekilmemiş (flutter pub get)' }],
    };
  }

  if (has('package.json')) {
    let pkg = {};
    try {
      pkg = JSON.parse((await readText(path.join(dir, 'package.json'))) || '{}');
    } catch {}
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const d = (n) => n in deps;
    let stack = 'Node.js';
    let kind = 'web';
    if (d('expo')) { stack = 'Expo'; kind = 'mobile'; }
    else if (d('react-native')) { stack = 'React Native'; kind = 'mobile'; }
    else if (d('next')) stack = 'Next.js';
    else if (d('electron')) { stack = 'Electron'; kind = 'other'; }
    else if (d('firebase-functions')) { stack = 'Cloud Functions'; kind = 'other'; }
    else if (d('react')) stack = 'React';
    else if (d('vue')) stack = 'Vue';
    else if (d('svelte') || d('@sveltejs/kit')) stack = 'Svelte';
    else if (d('express') || d('fastify')) { stack = 'Node API'; kind = 'other'; }
    else if (d('vite')) stack = 'Vite';
    const scripts = pkg.scripts || {};
    const script = ['dev', 'start', 'serve'].find((s) => scripts[s]);
    const health = [];
    if (!has('node_modules')) health.push({ level: 'info', text: 'Bağımlılıklar kurulmamış (npm install)' });
    return {
      stack: d('typescript') ? `${stack} · TS` : stack,
      kind,
      version: pkg.version || null,
      run: script ? (script === 'start' ? 'npm start' : `npm run ${script}`) : null,
      health,
    };
  }

  const csproj = [...names].find((n) => n.endsWith('.csproj'));
  if (csproj || [...names].some((n) => n.endsWith('.sln'))) {
    return { stack: '.NET', kind: 'other', version: null, run: csproj ? 'dotnet run' : null, health: [] };
  }

  if (has('project.godot')) {
    return { stack: 'Godot', kind: 'other', version: null, run: null, health: [] };
  }

  if (has('Cargo.toml')) return { stack: 'Rust', kind: 'other', version: null, run: 'cargo run', health: [] };
  if (has('go.mod')) return { stack: 'Go', kind: 'other', version: null, run: 'go run .', health: [] };

  if (has('requirements.txt') || has('pyproject.toml') || has('setup.py') || has('main.py')) {
    const req = ((await readText(path.join(dir, 'requirements.txt'))) || '').toLowerCase();
    const venv = findVenvPython(dir);
    const py = venv ? `"${venv.python}"` : 'python';
    const entry = ['main.py', 'app.py', 'ui.py'].find((f) => has(f));
    let stack = 'Python';
    let run = entry ? `${py} ${entry}` : null;
    if (/^streamlit/m.test(req)) {
      stack = 'Python · Streamlit';
      if (entry) run = `${py} -m streamlit run ${entry}`;
    } else if (/^(fastapi|flask|django)/m.test(req)) {
      const fw = { fastapi: 'FastAPI', flask: 'Flask', django: 'Django' };
      stack = `Python · ${fw[req.match(/^(fastapi|flask|django)/m)[1]]}`;
    }
    const health = venv ? [] : [{ level: 'info', text: 'Sanal ortam (.venv) bulunamadı' }];
    return { stack, kind: 'other', version: null, run, health };
  }

  if (has('index.html')) {
    return { stack: 'Statik Web', kind: 'web', version: null, run: null, health: [] };
  }

  return null;
}

// Proje klasörünü gezer: alt projeleri, git depolarını, .env eksiklerini ve
// en son değiştirilen dosyanın tarihini bulur.
async function walkProject(root) {
  const subprojects = [];
  const repoDirs = [];
  const envIssues = [];
  const tags = new Set();
  let lastModified = 0;
  let fileCount = 0;
  let hasReadme = false;
  const docs = [];

  async function visit(dir, depth, inStack) {
    const entries = await listDir(dir);
    const names = new Set(entries.map((e) => e.name));
    const rel = path.relative(root, dir) || '.';

    if (names.has('.git') && depth <= 2) repoDirs.push(dir);
    if (names.has('firebase.json')) tags.add('Firebase');
    if (names.has('.env.example') && !names.has('.env')) {
      envIssues.push({ level: 'warn', text: `.env dosyası eksik (${rel === '.' ? 'kök' : rel}) — .env.example var` });
    }
    if (depth <= 1) {
      for (const n of names) {
        if (/^readme\.md$/i.test(n)) hasReadme = true;
        if (/^(readme|changelog|checklist|development_log|documentation|ozellik_notlari)[^/]*\.md$/i.test(n)) {
          docs.push(path.join(dir, n));
        }
      }
    }

    let stackHere = null;
    if (!inStack && depth <= 3) {
      stackHere = await detectStack(dir, names);
      if (stackHere) subprojects.push({ rel, dir, ...stackHere });
    }
    const isFlutter = stackHere?.stack === 'Flutter';

    for (const e of entries) {
      if (e.isDirectory()) {
        if (isIgnored(e.name) || depth >= 8) continue;
        if (isFlutter && FLUTTER_PLATFORM_DIRS.has(e.name)) {
          // platform klasörlerinde sadece tarih taraması yap
          await visit(path.join(dir, e.name), depth + 1, true);
          continue;
        }
        await visit(path.join(dir, e.name), depth + 1, inStack || !!stackHere);
      } else if (e.isFile() && fileCount < 25000) {
        fileCount++;
        try {
          const st = await fs.stat(path.join(dir, e.name));
          if (st.mtimeMs > lastModified) lastModified = st.mtimeMs;
        } catch {}
      }
    }
  }

  await visit(root, 0, false);
  return { subprojects, repoDirs, envIssues, tags: [...tags], lastModified, hasReadme, docs };
}

export async function scanProject(dir, rootLabel, { staleDays = 90 } = {}) {
  const w = await walkProject(dir);
  const repos = await Promise.all(w.repoDirs.map((d) => inspectRepo(d)));

  // En son commit tarihi dosya tarihinden yeniyse onu kullan
  let lastModified = w.lastModified;
  for (const r of repos) {
    const t = r.lastCommit ? Date.parse(r.lastCommit.date) : 0;
    if (t > lastModified) lastModified = t;
  }

  const health = [];
  for (const r of repos) {
    const where = path.relative(dir, r.dir) || 'kök';
    const label = repos.length > 1 ? ` (${where})` : '';
    if (!r.ok) {
      health.push({ level: 'warn', text: `Git okunamadı${label}: ${r.error}` });
      continue;
    }
    if (r.trackedSecrets.length) {
      health.push({
        level: 'danger',
        text: `Gizli dosya(lar) git'e commit edilmiş${label}: ${r.trackedSecrets.slice(0, 3).join(', ')}${r.trackedSecrets.length > 3 ? '…' : ''}`,
      });
    }
    if (!r.remote) health.push({ level: 'warn', text: `Uzak depo (remote) yok — kodun yedeği yok${label}` });
    else if (r.ahead) health.push({ level: 'warn', text: `${r.ahead} commit push edilmemiş${label}` });
    if (r.behind) health.push({ level: 'info', text: `Uzak depoda ${r.behind} yeni commit var (pull)${label}` });
    if (r.changes) health.push({ level: 'info', text: `${r.changes} commit edilmemiş değişiklik${label}` });
  }
  if (!repos.length) health.push({ level: 'warn', text: 'Git ile takip edilmiyor' });
  health.push(...w.envIssues);
  for (const s of w.subprojects) {
    for (const h of s.health) health.push({ ...h, text: w.subprojects.length > 1 ? `${h.text} — ${s.rel}` : h.text });
  }
  if (!w.hasReadme) health.push({ level: 'info', text: 'README.md yok' });
  const ageDays = lastModified ? (Date.now() - lastModified) / 86400000 : Infinity;
  if (ageDays > staleDays) health.push({ level: 'info', text: `${Math.floor(ageDays)} gündür dokunulmamış` });

  const order = { danger: 0, warn: 1, info: 2 };
  health.sort((a, b) => order[a.level] - order[b.level]);

  const kinds = new Set(w.subprojects.map((s) => s.kind));
  const kind = kinds.has('mobile') ? 'mobile' : kinds.has('web') ? 'web' : 'other';

  return {
    id: projectId(dir),
    name: path.basename(dir),
    path: dir,
    rootLabel,
    stacks: [...new Set(w.subprojects.map((s) => s.stack))],
    tags: w.tags,
    kind,
    subprojects: w.subprojects.map(({ health: _h, ...s }) => s),
    repos,
    health,
    docs: w.docs,
    lastModified: lastModified || null,
  };
}

export async function scanAll(config) {
  const jobs = [];
  for (const root of config.roots) {
    const entries = await listDir(root);
    const label = root.replace(/\\/g, '/').split('/').slice(-2).join('/');
    for (const e of entries) {
      if (!e.isDirectory() || e.name.startsWith('.') || isIgnored(e.name)) continue;
      jobs.push({ dir: path.join(root, e.name), label });
    }
  }

  // Aynı anda en fazla 4 proje taransın; disk ve git'i boğmayalım
  const results = [];
  let i = 0;
  async function worker() {
    while (i < jobs.length) {
      const job = jobs[i++];
      try {
        results.push(await scanProject(job.dir, job.label, config));
      } catch (err) {
        results.push({
          id: projectId(job.dir), name: path.basename(job.dir), path: job.dir, rootLabel: job.label,
          stacks: [], tags: [], kind: 'other', subprojects: [], repos: [], docs: [], lastModified: null,
          health: [{ level: 'danger', text: `Taranamadı: ${err.message}` }],
        });
      }
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker));
  return results;
}
