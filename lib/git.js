import { execFile } from 'node:child_process';

// Git'i yalnızca okuma amaçlı çalıştırır. safe.directory sadece bu komut için
// verilir; farklı diskteki (D:) depolarda "dubious ownership" hatasını önler.
export function git(dir, args, { timeout = 10000 } = {}) {
  return new Promise((resolve) => {
    execFile(
      'git',
      ['-c', `safe.directory=${dir.replace(/\\/g, '/')}`, '-c', 'core.quotepath=false', '-C', dir, ...args],
      { timeout, maxBuffer: 32 * 1024 * 1024, windowsHide: true },
      (err, stdout, stderr) => {
        if (err) resolve({ ok: false, out: '', err: (stderr || err.message).trim() });
        else resolve({ ok: true, out: stdout, err: '' });
      },
    );
  });
}

// Depoya girmemesi gereken dosyalar (commit edilmişse tehlike)
const SECRET_PATTERNS = [
  /(^|\/)\.env$/,
  /(^|\/)\.env\.(local|production|prod|dev|development)$/,
  /(^|\/)secrets?\//i,
  /\.(jks|keystore|p12|pem)$/i,
  /(^|\/)key\.properties$/,
  /service[-_]?account.*\.json$/i,
  /client_secret.*\.json$/i,
];

export async function inspectRepo(dir) {
  const [status, last, remote, files] = await Promise.all([
    git(dir, ['status', '--porcelain=v1', '-b']),
    git(dir, ['log', '-1', '--format=%h%x1f%s%x1f%cI']),
    git(dir, ['remote', 'get-url', 'origin']),
    git(dir, ['ls-files']),
  ]);

  const repo = {
    dir,
    ok: status.ok,
    error: status.ok ? null : status.err.split('\n')[0],
    branch: null,
    upstream: null,
    ahead: 0,
    behind: 0,
    changes: 0,
    changedFiles: [],
    lastCommit: null,
    remote: remote.ok ? remote.out.trim() : null,
    trackedSecrets: [],
  };

  if (status.ok) {
    const lines = status.out.split('\n').filter(Boolean);
    const head = lines.shift() || '';
    // "## main...origin/main [ahead 2, behind 1]" veya "## No commits yet on main"
    const m = head.match(/^## (?:No commits yet on )?([^.\s]+)(?:\.\.\.(\S+))?(?: \[(.+)\])?/);
    if (m) {
      repo.branch = m[1];
      repo.upstream = m[2] || null;
      const info = m[3] || '';
      repo.ahead = Number(info.match(/ahead (\d+)/)?.[1] || 0);
      repo.behind = Number(info.match(/behind (\d+)/)?.[1] || 0);
    }
    repo.changes = lines.length;
    repo.changedFiles = lines.slice(0, 40).map((l) => ({ code: l.slice(0, 2).trim(), file: l.slice(3) }));
  }

  if (last.ok && last.out.trim()) {
    const [hash, subject, date] = last.out.trim().split('\x1f');
    repo.lastCommit = { hash, subject, date };
  }

  if (files.ok) {
    repo.trackedSecrets = files.out
      .split('\n')
      .filter((f) => f && SECRET_PATTERNS.some((re) => re.test(f)))
      .slice(0, 20);
  }

  return repo;
}

export async function recentLog(dir, count = 25) {
  const r = await git(dir, ['log', `-${count}`, '--format=%h %cs %s']);
  return r.ok ? r.out.trim() : '';
}

export async function shortStatus(dir) {
  const r = await git(dir, ['status', '--short']);
  return r.ok ? r.out.split('\n').slice(0, 60).join('\n').trim() : '';
}
