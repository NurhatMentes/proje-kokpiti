import { spawn } from 'node:child_process';

// Yol ve komutlar sadece taramadan gelir (kullanıcı girdisi değil), yine de
// cmd'nin özel karakterlerini içeren yolları reddediyoruz.
const UNSAFE = /["&|<>^%!\r\n]/;

function assertSafe(p) {
  if (UNSAFE.test(p)) throw new Error('Bu klasör yolu özel karakter içeriyor, güvenlik için açılmadı.');
}

function detached(cmd, args, opts = {}) {
  const child = spawn(cmd, args, { detached: true, stdio: 'ignore', windowsHide: false, ...opts });
  child.on('error', () => {});
  child.unref();
}

export function openInVSCode(dir) {
  assertSafe(dir);
  detached('cmd.exe', ['/d', '/s', '/c', `code "${dir}"`], { windowsVerbatimArguments: true, windowsHide: true });
}

export function openInExplorer(dir) {
  detached('explorer.exe', [dir]);
}

// Yeni bir terminal penceresi açar; komut verilirse onu çalıştırıp açık bırakır
export function openTerminal(dir, command, title = 'Proje Kokpiti') {
  assertSafe(dir);
  if (command && /[&|<>^%!\r\n]/.test(command)) throw new Error('Komut güvenli değil.');
  const safeTitle = title.replace(/["&|<>^%!]/g, '');
  const inner = command ? `cmd /k ${command}` : 'cmd /k';
  detached('cmd.exe', ['/d', '/s', '/c', `start "${safeTitle}" /D "${dir}" ${inner}`], {
    windowsVerbatimArguments: true,
    windowsHide: true,
  });
}
