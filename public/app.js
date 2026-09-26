// ---------- sabitler ----------
const STATUSES = [
  { id: 'aktif', label: 'Aktif' },
  { id: 'beklemede', label: 'Beklemede' },
  { id: 'yayina-yakin', label: 'Yayına yakın' },
  { id: 'yayinda', label: 'Yayında' },
  { id: 'arsiv', label: 'Arşiv' },
];
const STATUS_LABEL = Object.fromEntries(STATUSES.map((s) => [s.id, s.label]));

const CHECKLISTS = {
  mobile: [
    'Uygulama ikonu (tüm boyutlar)',
    'Splash / açılış ekranı',
    'Uygulama adı ve paket kimliği (applicationId / bundle id)',
    'Sürüm numarası ve build numarası güncel',
    'Release imzalama (keystore) hazır ve yedekli',
    'API anahtarları koda gömülü değil (.env / remote config)',
    'Gizlilik politikası sayfası (URL)',
    'Store açıklaması (kısa + uzun)',
    'Ekran görüntüleri (telefon + tablet)',
    'Öne çıkan görsel (1024×500)',
    'İçerik derecelendirme anketi',
    'Veri güvenliği formu',
    'Hata takibi (Crashlytics / Sentry)',
    'Analitik olayları',
    'Gerçek cihazda release build testi',
    'Kapalı test (internal testing) turu',
  ],
  web: [
    'Alan adı bağlandı',
    'HTTPS aktif',
    'Favicon ve manifest',
    'Başlık / açıklama meta etiketleri',
    'Paylaşım görseli (Open Graph)',
    'API anahtarları sunucu tarafında',
    'Gizlilik / KVKK metni',
    'Analitik',
    'Hata takibi',
    'Mobil görünüm testi',
    'Lighthouse performans kontrolü',
    'Otomatik build & deploy',
  ],
  other: [
    'README: kurulum ve çalıştırma adımları',
    'Gizli anahtarlar repoda değil',
    'Bağımlılıklar sabitlendi (lock / requirements)',
    'Temel testler',
    'Hata kayıtları (logging)',
    'Sürüm etiketi (git tag)',
    'Dağıtım / çalıştırma yöntemi belli',
  ],
};

const ICONS = {
  branch: '<svg viewBox="0 0 24 24"><circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="7" r="2"/><path d="M6 7v10M18 9c0 5-6 4-11 8"/></svg>',
  edit: '<svg viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  up: '<svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  down: '<svg viewBox="0 0 24 24"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>',
  clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.6l6.2-.9Z"/></svg>',
  danger: '<svg viewBox="0 0 24 24"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0ZM12 9v4M12 17h.01"/></svg>',
  warn: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>',
  info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  code: '<svg viewBox="0 0 24 24"><path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/></svg>',
  folder: '<svg viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>',
  term: '<svg viewBox="0 0 24 24"><path d="m4 17 6-5-6-5M12 19h8"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M6 4v16l14-8Z"/></svg>',
  spark: '<svg viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></svg>',
  refresh: '<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>',
};

const STACK_COLORS = {
  Flutter: '#54c5f8', Dart: '#54c5f8', Expo: '#a78bfa', 'React Native': '#61dafb', React: '#61dafb',
  'Next.js': '#e5e7eb', Vue: '#42b883', Svelte: '#ff3e00', 'Node.js': '#7cc36b', 'Node API': '#7cc36b',
  'Cloud Functions': '#ffca28', Firebase: '#ffa000', '.NET': '#a179dc', Python: '#f7d046', Godot: '#478cbf',
  'Statik Web': '#f16529', Electron: '#9feaf9', Vite: '#bd34fe', Rust: '#dea584', Go: '#00add8',
};
const stackColor = (s) => STACK_COLORS[s.split(' · ')[0]] || '#8b93aa';

// ---------- durum ----------
const state = {
  projects: [],
  scannedAt: null,
  filter: loadPref('filter', 'tumu'),
  sort: loadPref('sort', 'recent'),
  onlyIssues: loadPref('onlyIssues', false),
  query: '',
  openId: null,
};

function loadPref(key, fallback) {
  try {
    const v = localStorage.getItem(`kokpit.${key}`);
    return v === null ? fallback : JSON.parse(v);
  } catch {
    return fallback;
  }
}
function savePref(key, value) {
  try { localStorage.setItem(`kokpit.${key}`, JSON.stringify(value)); } catch {}
}

// ---------- yardımcılar ----------
const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

async function api(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: opts.body ? { 'Content-Type': 'application/json' } : undefined,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Hata ${res.status}`);
  return data;
}

function ago(ts) {
  if (!ts) return 'bilinmiyor';
  const d = (Date.now() - ts) / 1000;
  if (d < 60) return 'az önce';
  if (d < 3600) return `${Math.floor(d / 60)} dk önce`;
  if (d < 86400) return `${Math.floor(d / 3600)} saat önce`;
  const days = Math.floor(d / 86400);
  if (days === 1) return 'dün';
  if (days < 7) return `${days} gün önce`;
  if (days < 30) return `${Math.floor(days / 7)} hafta önce`;
  if (days < 365) return `${Math.floor(days / 30)} ay önce`;
  const y = Math.floor(days / 365);
  const m = Math.floor((days % 365) / 30);
  return m ? `${y} yıl ${m} ay önce` : `${y} yıl önce`;
}

const fmtDate = (iso) => new Date(iso).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' });

// Kullanıcı durum vermediyse son değişikliğe göre tahmin et
function effectiveStatus(p) {
  if (p.meta.status) return { id: p.meta.status, auto: false };
  const days = p.lastModified ? (Date.now() - p.lastModified) / 86400000 : Infinity;
  return { id: days < 30 ? 'aktif' : days < 180 ? 'beklemede' : 'arsiv', auto: true };
}

const counts = (p, level) => p.health.filter((h) => h.level === level).length;
const totalChanges = (p) => p.repos.reduce((n, r) => n + (r.changes || 0), 0);
const totalAhead = (p) => p.repos.reduce((n, r) => n + (r.ahead || 0), 0);

function checklistItems(p) {
  return [...(CHECKLISTS[p.kind] || CHECKLISTS.other), ...(p.meta.customItems || [])];
}
function checklistProgress(p) {
  const items = checklistItems(p);
  const done = items.filter((i) => p.meta.checklist?.[i]).length;
  return { done, total: items.length, pct: items.length ? Math.round((done / items.length) * 100) : 0 };
}

function toast(msg, isErr = false) {
  const t = $('#toast');
  t.textContent = msg;
  t.className = `toast${isErr ? ' err' : ''}`;
  t.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => (t.hidden = true), isErr ? 5000 : 2200);
}

// Çok basit, güvenli markdown: önce kaçış, sonra başlık/liste/kalın/kod
function md(src) {
  const lines = esc(src).split('\n');
  let html = '';
  let list = null;
  const inline = (s) => s.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>');
  const close = () => { if (list) { html += `</${list}>`; list = null; } };
  for (const raw of lines) {
    const line = raw.trim();
    let m;
    if ((m = line.match(/^#{1,4}\s+(.*)/))) { close(); html += `<h2>${inline(m[1])}</h2>`; }
    else if ((m = line.match(/^[-*]\s+(.*)/))) { if (list !== 'ul') { close(); html += '<ul>'; list = 'ul'; } html += `<li>${inline(m[1])}</li>`; }
    else if ((m = line.match(/^\d+[.)]\s+(.*)/))) { if (list !== 'ol') { close(); html += '<ol>'; list = 'ol'; } html += `<li>${inline(m[1])}</li>`; }
    else if (line) { close(); html += `<p>${inline(line)}</p>`; }
    else close();
  }
  close();
  return html;
}

// ---------- listeleme ----------
function visibleProjects() {
  const q = state.query.trim().toLocaleLowerCase('tr');
  let list = state.projects.filter((p) => {
    const st = effectiveStatus(p);
    if (state.filter === 'etiketsiz' && !st.auto) return false;
    if (!['tumu', 'etiketsiz'].includes(state.filter) && st.id !== state.filter) return false;
    if (state.onlyIssues && !p.health.some((h) => h.level !== 'info')) return false;
    if (q) {
      const hay = [p.name, p.rootLabel, ...p.stacks, ...p.tags, p.meta.note || ''].join(' ').toLocaleLowerCase('tr');
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const sorters = {
    recent: (a, b) => (b.lastModified || 0) - (a.lastModified || 0),
    name: (a, b) => a.name.localeCompare(b.name, 'tr'),
    issues: (a, b) => counts(b, 'danger') * 100 + counts(b, 'warn') * 10 + counts(b, 'info') - (counts(a, 'danger') * 100 + counts(a, 'warn') * 10 + counts(a, 'info')),
    changes: (a, b) => totalChanges(b) + totalAhead(b) * 5 - (totalChanges(a) + totalAhead(a) * 5),
  };
  list.sort(sorters[state.sort] || sorters.recent);
  list.sort((a, b) => (b.meta.pinned ? 1 : 0) - (a.meta.pinned ? 1 : 0));
  return list;
}

function renderStats() {
  const ps = state.projects;
  const active = ps.filter((p) => effectiveStatus(p).id === 'aktif').length;
  const danger = ps.filter((p) => counts(p, 'danger')).length;
  const attention = ps.filter((p) => counts(p, 'warn') || counts(p, 'danger')).length;
  const dirty = ps.filter((p) => totalChanges(p)).length;
  const ahead = ps.reduce((n, p) => n + totalAhead(p), 0);
  const stat = (num, lbl, cls = '', action = '') =>
    `<button class="stat ${cls}" data-stat="${action}"><div class="num">${num}</div><div class="lbl">${lbl}</div></button>`;
  $('#stats').innerHTML = [
    stat(ps.length, 'Toplam proje', '', 'all'),
    stat(active, 'Aktif', 'accent', 'aktif'),
    stat(danger, 'Güvenlik riski', danger ? 'danger' : '', 'issues'),
    stat(attention, 'Dikkat gerektiren', attention ? 'warn' : '', 'issues'),
    stat(dirty, `Commit bekleyen${ahead ? ` · ${ahead} push bekliyor` : ''}`, '', 'changes'),
  ].join('');
}

function renderFilters() {
  const count = (id) => state.projects.filter((p) => {
    const st = effectiveStatus(p);
    return id === 'tumu' || (id === 'etiketsiz' ? st.auto : st.id === id);
  }).length;
  const chips = [{ id: 'tumu', label: 'Tümü' }, ...STATUSES, { id: 'etiketsiz', label: 'Etiketsiz' }];
  $('#statusFilters').innerHTML = chips
    .map((c) => `<button class="chip ${state.filter === c.id ? 'on' : ''}" data-filter="${c.id}" role="tab">${c.label}<span class="count">${count(c.id)}</span></button>`)
    .join('');
}

function cardHTML(p) {
  const st = effectiveStatus(p);
  const d = counts(p, 'danger'), w = counts(p, 'warn'), i = counts(p, 'info');
  const repo = p.repos[0];
  const changes = totalChanges(p), ahead = totalAhead(p);
  const prog = checklistProgress(p);
  const badges = [...p.stacks, ...p.tags]
    .map((s) => `<span class="badge" style="color:${stackColor(s)}"><span class="dot"></span><span style="color:var(--text)">${esc(s)}</span></span>`)
    .join('');

  let git = '';
  if (repo) {
    git = `<div class="card-git">
      <span>${ICONS.branch}${esc(repo.branch || '?')}</span>
      ${changes ? `<span class="dirty">${ICONS.edit}${changes} değişiklik</span>` : ''}
      ${ahead ? `<span class="ahead">${ICONS.up}${ahead} push</span>` : ''}
      ${repo.lastCommit ? `<span title="${esc(repo.lastCommit.subject)}">${ICONS.clock}${ago(Date.parse(repo.lastCommit.date))}</span>` : ''}
    </div>`;
  } else {
    git = `<div class="card-git"><span>${ICONS.branch}git yok</span></div>`;
  }

  return `<article class="card ${d ? 'has-danger' : ''}" data-id="${p.id}" tabindex="0">
    <div class="card-head">
      <div>
        <h2 class="card-title">${esc(p.name)}</h2>
        <div class="card-sub">${esc(p.rootLabel)} · ${ago(p.lastModified)}</div>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <span class="status st-${st.id} ${st.auto ? 'auto' : ''}" title="${st.auto ? 'Otomatik tahmin — detaydan etiketle' : ''}">${STATUS_LABEL[st.id]}</span>
        <button class="pin ${p.meta.pinned ? 'on' : ''}" data-pin="${p.id}" title="Sabitle" aria-label="Sabitle">${ICONS.star}</button>
      </div>
    </div>
    ${badges ? `<div class="badges">${badges}</div>` : ''}
    ${git}
    ${p.meta.note ? `<p class="card-note">${esc(p.meta.note)}</p>` : ''}
    <div class="card-foot">
      <div class="issues">
        ${d ? `<span class="issue-count danger" title="Kritik">${ICONS.danger}${d}</span>` : ''}
        ${w ? `<span class="issue-count warn" title="Uyarı">${ICONS.warn}${w}</span>` : ''}
        ${i ? `<span class="issue-count info" title="Bilgi">${ICONS.info}${i}</span>` : ''}
        ${!d && !w && !i ? `<span class="issue-count" style="color:var(--ok)">${ICONS.check}Temiz</span>` : ''}
      </div>
      <span class="progress-mini" title="Yayın kontrol listesi">${prog.done}/${prog.total}<i><b style="width:${prog.pct}%"></b></i></span>
    </div>
  </article>`;
}

function renderGrid() {
  const list = visibleProjects();
  $('#grid').innerHTML = list.length
    ? list.map(cardHTML).join('')
    : `<div class="empty">Bu filtreye uyan proje yok.</div>`;
}

function renderAll() {
  renderStats();
  renderFilters();
  renderGrid();
  if (state.scannedAt) {
    $('#scanInfo').textContent = `${state.projects.length} proje · son tarama ${new Date(state.scannedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (state.openId) renderDrawer();
}

// ---------- detay paneli ----------
function renderDrawer() {
  const p = state.projects.find((x) => x.id === state.openId);
  if (!p) return closeDrawer();
  const st = effectiveStatus(p);
  const prog = checklistProgress(p);
  const drawer = $('#drawer');
  const noteFocused = document.activeElement?.id === 'note';
  const noteValue = noteFocused ? $('#note').value : null;

  const subs = p.subprojects.length
    ? `<div class="subs">${p.subprojects.map((s) => `
        <div class="sub">
          <div class="sub-info">
            <b style="color:${stackColor(s.stack)}">●</b> <b>${esc(s.stack)}</b>
            ${s.version ? `<span class="muted"> · v${esc(s.version)}</span>` : ''}
            <code>${esc(s.rel === '.' ? 'kök klasör' : s.rel)}${s.run ? ` — ${esc(s.run)}` : ''}</code>
          </div>
          <div class="sub-btns">
            ${s.rel !== '.' ? `<button class="btn small ghost" data-act="vscode" data-sub="${esc(s.rel)}" title="Bu klasörü VS Code'da aç">${ICONS.code}</button>` : ''}
            ${s.run ? `<button class="btn small" data-act="run" data-sub="${esc(s.rel)}">${ICONS.play}Çalıştır</button>` : ''}
          </div>
        </div>`).join('')}</div>`
    : '<p class="muted">Tanınan bir teknoloji bulunamadı.</p>';

  const health = p.health.length
    ? `<ul class="health">${p.health.map((h) => `<li class="${h.level}">${ICONS[h.level]}<span>${esc(h.text)}</span></li>`).join('')}</ul>`
    : `<p class="health-ok">${ICONS.check} Her şey yolunda görünüyor.</p>`;

  const repos = p.repos.length
    ? p.repos.map((r) => `
      <div class="repo">
        <div class="repo-row">
          <span>${ICONS.branch}<b>${esc(r.branch || '?')}</b>${r.upstream ? `<span class="muted">→ ${esc(r.upstream)}</span>` : ''}</span>
          ${p.repos.length > 1 ? `<span class="muted">${esc(r.dir.slice(p.path.length + 1) || 'kök')}</span>` : ''}
          <span>${ICONS.edit}${r.changes} değişiklik</span>
          ${r.ahead ? `<span style="color:var(--danger)">${ICONS.up}${r.ahead} push bekliyor</span>` : ''}
          ${r.behind ? `<span style="color:var(--info)">${ICONS.down}${r.behind} geride</span>` : ''}
        </div>
        ${r.lastCommit ? `<div class="commit"><code>${esc(r.lastCommit.hash)}</code>${esc(r.lastCommit.subject)} <span class="muted">· ${ago(Date.parse(r.lastCommit.date))}</span></div>` : '<div class="commit muted">Henüz commit yok</div>'}
        ${r.remote ? `<div class="remote">${esc(r.remote)}</div>` : ''}
        ${r.changedFiles.length ? `<details><summary>Değişen dosyalar (${r.changes})</summary><div class="files">${r.changedFiles.map((f) => `<div><span class="c">${esc(f.code)}</span>${esc(f.file)}</div>`).join('')}${r.changes > r.changedFiles.length ? `<div class="muted">… ve ${r.changes - r.changedFiles.length} dosya daha</div>` : ''}</div></details>` : ''}
      </div>`).join('')
    : '<p class="muted">Bu proje git ile takip edilmiyor. Kod kaybı riskine karşı bir depo açmanı öneririm.</p>';

  const ai = p.meta.aiSummary;
  const aiBusy = drawer.dataset.aiBusy === p.id;
  const items = checklistItems(p);
  const custom = new Set(p.meta.customItems || []);

  drawer.innerHTML = `
    <div class="d-head">
      <div class="d-title">
        <h2>${esc(p.name)}</h2>
        <div>
          <button class="icon-btn" data-act="rescan" title="Bu projeyi yeniden tara">${ICONS.refresh}</button>
          <button class="icon-btn" data-close title="Kapat (Esc)">${ICONS.close}</button>
        </div>
      </div>
      <div class="d-path">${esc(p.path)}</div>
      <div class="d-actions">
        <button class="btn primary" data-act="vscode">${ICONS.code}VS Code</button>
        <button class="btn" data-act="explorer">${ICONS.folder}Klasör</button>
        <button class="btn" data-act="terminal">${ICONS.term}Terminal</button>
      </div>
    </div>
    <div class="d-body">
      <section class="sec">
        <h3>Durum ${st.auto ? '<span class="hint">şu an otomatik tahmin — birini seç</span>' : ''}</h3>
        <div class="status-picker">
          ${STATUSES.map((s) => `<button class="status st-${s.id} ${p.meta.status === s.id ? 'sel' : ''}" data-status="${s.id}">${s.label}</button>`).join('')}
        </div>
      </section>

      <section class="sec">
        <h3>Nerede kalmıştım? <span class="hint">otomatik kaydedilir</span></h3>
        <textarea id="note" rows="4" placeholder="Örn: Ödeme ekranı yarım kaldı. Sıradaki iş: RevenueCat entegrasyonu.">${esc(p.meta.note || '')}</textarea>
        <div class="save-state" id="saveState"></div>
      </section>

      <section class="sec">
        <h3>AI özeti <span class="hint">son commit'ler + dokümanlar + notun</span></h3>
        ${ai ? `<div class="ai-box">${md(ai.text)}<div class="ai-meta">${fmtDate(ai.createdAt)} · ${esc(ai.model)}</div></div>` : '<p class="ai-empty">Bu projeye döndüğünde "son ne yaptım, sırada ne var?" sorusunu cevaplar.</p>'}
        <div style="margin-top:10px">
          <button class="btn ${ai ? '' : 'primary'}" data-act="ai" ${aiBusy ? 'disabled' : ''}>
            ${aiBusy ? '<span class="spinner"></span>Düşünüyor…' : `${ICONS.spark}${ai ? 'Özeti yenile' : 'Özet çıkar'}`}
          </button>
        </div>
      </section>

      <section class="sec">
        <h3>Sağlık kontrolü</h3>
        ${health}
      </section>

      <section class="sec">
        <h3>Alt projeler & çalıştırma</h3>
        ${subs}
      </section>

      <section class="sec">
        <h3>Git</h3>
        ${repos}
      </section>

      <section class="sec">
        <h3>Yayın kontrol listesi <span class="hint">${prog.done}/${prog.total} · ${p.kind === 'mobile' ? 'mobil' : p.kind === 'web' ? 'web' : 'genel'}</span></h3>
        <div class="progress"><b style="width:${prog.pct}%"></b></div>
        <ul class="checklist">
          ${items.map((item) => `
            <li><label>
              <input type="checkbox" data-check="${esc(item)}" ${p.meta.checklist?.[item] ? 'checked' : ''} />
              <span>${esc(item)}</span>
              ${custom.has(item) ? `<button class="icon-btn rm" data-remove="${esc(item)}" title="Kaldır">${ICONS.trash}</button>` : ''}
            </label></li>`).join('')}
        </ul>
        <form class="add-item" id="addItem">
          <input name="item" placeholder="Kendi maddeni ekle…" maxlength="200" autocomplete="off" />
          <button class="btn small">${ICONS.plus}Ekle</button>
        </form>
      </section>
    </div>`;

  if (noteFocused) {
    const n = $('#note');
    n.value = noteValue;
    n.focus();
  }
}

function openDrawer(id) {
  state.openId = id;
  renderDrawer();
  const d = $('#drawer');
  $('#scrim').hidden = false;
  d.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => d.classList.add('open'));
  d.scrollTop = 0;
  d.focus();
}

function closeDrawer() {
  state.openId = null;
  const d = $('#drawer');
  d.classList.remove('open');
  d.setAttribute('aria-hidden', 'true');
  $('#scrim').hidden = true;
}

async function patchMeta(p, patch) {
  const meta = await api(`/api/projects/${p.id}/meta`, { method: 'PATCH', body: patch });
  p.meta = meta;
  return meta;
}

// ---------- veri ----------
async function load(refresh = false, silent = false) {
  const btn = $('#refreshBtn');
  btn.disabled = true;
  btn.classList.add('spin');
  try {
    const data = await api(`/api/projects${refresh ? '?refresh=1' : ''}`);
    state.projects = data.projects;
    state.scannedAt = data.scannedAt;
    renderAll();
    if (refresh && !silent) toast('Tarama tamamlandı');
  } catch (err) {
    toast(err.message, true);
    if (!state.projects.length) $('#grid').innerHTML = `<div class="empty">Sunucuya ulaşılamadı: ${esc(err.message)}</div>`;
  } finally {
    btn.disabled = false;
    btn.classList.remove('spin');
  }
}

// ---------- olaylar ----------
$('#refreshBtn').addEventListener('click', () => load(true));

$('#search').addEventListener('input', (e) => { state.query = e.target.value; renderGrid(); });
$('#sort').value = state.sort;
$('#sort').addEventListener('change', (e) => { state.sort = e.target.value; savePref('sort', state.sort); renderGrid(); });
$('#onlyIssues').checked = state.onlyIssues;
$('#onlyIssues').addEventListener('change', (e) => { state.onlyIssues = e.target.checked; savePref('onlyIssues', state.onlyIssues); renderGrid(); });

$('#statusFilters').addEventListener('click', (e) => {
  const b = e.target.closest('[data-filter]');
  if (!b) return;
  state.filter = b.dataset.filter;
  savePref('filter', state.filter);
  renderFilters();
  renderGrid();
});

$('#stats').addEventListener('click', (e) => {
  const b = e.target.closest('[data-stat]');
  if (!b) return;
  const a = b.dataset.stat;
  state.filter = a === 'aktif' ? 'aktif' : 'tumu';
  state.onlyIssues = a === 'issues';
  if (a === 'changes') state.sort = 'changes';
  if (a === 'issues') state.sort = 'issues';
  $('#onlyIssues').checked = state.onlyIssues;
  $('#sort').value = state.sort;
  renderFilters();
  renderGrid();
});

$('#grid').addEventListener('click', async (e) => {
  const pin = e.target.closest('[data-pin]');
  if (pin) {
    e.stopPropagation();
    const p = state.projects.find((x) => x.id === pin.dataset.pin);
    await patchMeta(p, { pinned: !p.meta.pinned }).catch((err) => toast(err.message, true));
    renderGrid();
    return;
  }
  const card = e.target.closest('.card');
  if (card) openDrawer(card.dataset.id);
});
$('#grid').addEventListener('keydown', (e) => {
  const card = e.target.closest('.card');
  if (card && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openDrawer(card.dataset.id); }
});

$('#scrim').addEventListener('click', closeDrawer);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && state.openId && !$('#settings').open) closeDrawer();
  if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
    e.preventDefault();
    $('#search').focus();
  }
});

const drawer = $('#drawer');
drawer.addEventListener('click', async (e) => {
  const p = state.projects.find((x) => x.id === state.openId);
  if (!p) return;

  if (e.target.closest('[data-close]')) return closeDrawer();

  const statusBtn = e.target.closest('[data-status]');
  if (statusBtn) {
    const next = p.meta.status === statusBtn.dataset.status ? null : statusBtn.dataset.status;
    await patchMeta(p, { status: next }).catch((err) => toast(err.message, true));
    return renderAll();
  }

  const rm = e.target.closest('[data-remove]');
  if (rm) {
    e.preventDefault();
    const item = rm.dataset.remove;
    const checklist = { ...(p.meta.checklist || {}) };
    delete checklist[item];
    await patchMeta(p, { customItems: (p.meta.customItems || []).filter((i) => i !== item), checklist });
    return renderAll();
  }

  const act = e.target.closest('[data-act]');
  if (!act) return;
  const action = act.dataset.act;

  if (action === 'ai') {
    drawer.dataset.aiBusy = p.id;
    renderDrawer();
    try {
      p.meta = await api(`/api/projects/${p.id}/ai`, { method: 'POST' });
      toast('Özet hazır');
    } catch (err) {
      toast(err.message, true);
    } finally {
      delete drawer.dataset.aiBusy;
      renderDrawer();
    }
    return;
  }

  if (action === 'rescan') {
    act.disabled = true;
    try {
      const fresh = await api(`/api/projects/${p.id}/rescan`, { method: 'POST' });
      state.projects = state.projects.map((x) => (x.id === fresh.id ? fresh : x));
      renderAll();
      toast('Proje yeniden tarandı');
    } catch (err) {
      toast(err.message, true);
    }
    return;
  }

  try {
    await api(`/api/projects/${p.id}/action`, { method: 'POST', body: { action, subproject: act.dataset.sub } });
    const labels = { vscode: 'VS Code açılıyor…', explorer: 'Klasör açılıyor…', terminal: 'Terminal açılıyor…', run: 'Yeni terminalde başlatılıyor…' };
    toast(labels[action] || 'Tamam');
  } catch (err) {
    toast(err.message, true);
  }
});

drawer.addEventListener('change', async (e) => {
  const box = e.target.closest('[data-check]');
  if (!box) return;
  const p = state.projects.find((x) => x.id === state.openId);
  const checklist = { ...(p.meta.checklist || {}), [box.dataset.check]: box.checked };
  if (!box.checked) delete checklist[box.dataset.check];
  await patchMeta(p, { checklist }).catch((err) => toast(err.message, true));
  renderAll();
});

drawer.addEventListener('submit', async (e) => {
  if (e.target.id !== 'addItem') return;
  e.preventDefault();
  const p = state.projects.find((x) => x.id === state.openId);
  const item = new FormData(e.target).get('item').toString().trim();
  if (!item) return;
  if (checklistItems(p).includes(item)) return toast('Bu madde zaten var', true);
  await patchMeta(p, { customItems: [...(p.meta.customItems || []), item] }).catch((err) => toast(err.message, true));
  renderAll();
  $('#addItem input')?.focus();
});

let noteTimer;
drawer.addEventListener('input', (e) => {
  if (e.target.id !== 'note') return;
  const p = state.projects.find((x) => x.id === state.openId);
  const value = e.target.value;
  $('#saveState').textContent = 'Yazılıyor…';
  clearTimeout(noteTimer);
  noteTimer = setTimeout(async () => {
    try {
      await patchMeta(p, { note: value });
      const s = $('#saveState');
      if (s) s.textContent = 'Kaydedildi ✓';
      renderGrid();
    } catch (err) {
      toast(err.message, true);
    }
  }, 600);
});

// ---------- ayarlar ----------
$('#settingsBtn').addEventListener('click', async () => {
  const cfg = await api('/api/config');
  $('#rootsInput').value = cfg.roots.join('\n');
  $('#staleInput').value = cfg.staleDays;
  $('#modelInput').value = cfg.aiModel || '';
  $('#keyStatus').innerHTML = cfg.hasApiKey
    ? '<span style="color:var(--ok)">✓ OpenRouter anahtarı bulundu</span>'
    : '<span style="color:var(--warn)">⚠ OpenRouter anahtarı yok: kokpit klasöründeki .env dosyasına OPENROUTER_API_KEY=... satırını ekleyip kokpiti yeniden başlat</span>';
  $('#settingsError').hidden = true;
  $('#settings').showModal();
});

$('#saveSettings').addEventListener('click', async (e) => {
  e.preventDefault();
  const btn = e.currentTarget;
  btn.disabled = true;
  try {
    await api('/api/config', {
      method: 'PUT',
      body: { roots: $('#rootsInput').value.split('\n'), staleDays: $('#staleInput').value, aiModel: $('#modelInput').value },
    });
    $('#settings').close();
    await load();
    toast('Ayarlar kaydedildi');
  } catch (err) {
    $('#settingsError').textContent = err.message;
    $('#settingsError').hidden = false;
  } finally {
    btn.disabled = false;
  }
});

// Sekmeye geri dönüldüğünde sessizce güncelle (VS Code'da çalışıp gelince)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && state.scannedAt && Date.now() - Date.parse(state.scannedAt) > 60000) {
    load(true, true);
  }
});

load();
