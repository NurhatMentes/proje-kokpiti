import fs from 'node:fs/promises';
import path from 'node:path';
import { recentLog, shortStatus } from './git.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
export const DEFAULT_MODEL = 'anthropic/claude-sonnet-5';

const SYSTEM = `Sen bir geliştiricinin kişisel proje asistanısın. Geliştirici bir projeye
haftalar ya da aylar sonra geri dönüyor ve "nerede kalmıştım?" sorusunun cevabını istiyor.
Sana projenin dokümanlarını, son commit'lerini, commit edilmemiş değişikliklerini ve
geliştiricinin kendi notunu vereceğim.

Türkçe, kısa ve somut yaz. Tam olarak şu üç başlığı kullan:

## Son yapılanlar
3-5 madde. Commit'lere ve değişikliklere dayan, uydurma.

## Şu anki durum
2-3 cümle: proje ne durumda, yarım kalan iş var mı, dikkat edilmesi gereken bir şey var mı.

## Sıradaki 3 adım
Numaralı 3 madde. Her biri bugün oturup yapılabilecek kadar somut olsun.

Bilgi yetersizse bunu açıkça söyle.`;

async function readHead(file, max = 3000) {
  try {
    const txt = await fs.readFile(file, 'utf8');
    return txt.length > max ? `${txt.slice(0, max)}\n…(devamı kesildi)` : txt;
  } catch {
    return null;
  }
}

export async function buildContext(project, meta) {
  const parts = [`# Proje: ${project.name}`, `Yol: ${project.path}`];
  if (project.stacks.length) parts.push(`Teknolojiler: ${project.stacks.join(', ')}`);
  if (project.subprojects.length > 1) {
    parts.push(`Alt projeler: ${project.subprojects.map((s) => `${s.rel} (${s.stack})`).join(', ')}`);
  }
  if (meta.status) parts.push(`Geliştiricinin verdiği durum: ${meta.status}`);
  if (meta.note) parts.push(`\n## Geliştiricinin notu\n${meta.note}`);

  for (const doc of project.docs.slice(0, 4)) {
    const txt = await readHead(doc);
    if (txt) parts.push(`\n## Doküman: ${path.relative(project.path, doc)}\n${txt}`);
  }

  for (const repo of project.repos.filter((r) => r.ok)) {
    const where = path.relative(project.path, repo.dir) || 'kök';
    const [log, status] = await Promise.all([recentLog(repo.dir), shortStatus(repo.dir)]);
    parts.push(`\n## Git (${where}, dal: ${repo.branch})\nSon commit'ler:\n${log || '(commit yok)'}`);
    if (status) parts.push(`Commit edilmemiş değişiklikler:\n${status}`);
  }

  if (project.health.length) {
    parts.push(`\n## Otomatik tespit edilen uyarılar\n${project.health.map((h) => `- ${h.text}`).join('\n')}`);
  }
  return parts.join('\n');
}

export const hasApiKey = () => !!process.env.OPENROUTER_API_KEY;

export async function summarize(project, meta, { model = DEFAULT_MODEL, port } = {}) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error('OpenRouter API anahtarı yok. Kokpit klasöründeki .env dosyasına OPENROUTER_API_KEY=... satırını ekle ve kokpiti yeniden başlat.');
  }
  const context = await buildContext(project, meta);

  let res;
  try {
    res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        // OpenRouter panelinde isteklerin hangi uygulamadan geldiği görünsün
        'HTTP-Referer': `http://localhost:${port || 4545}`,
        'X-Title': 'Proje Kokpiti',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4000,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: context },
        ],
      }),
      signal: AbortSignal.timeout(180_000),
    });
  } catch (err) {
    if (err.name === 'TimeoutError') throw new Error('Model 3 dakika içinde yanıt vermedi, tekrar dene.');
    throw new Error('OpenRouter’a bağlanılamadı. İnternet bağlantını kontrol et.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    const status = res.ok ? data.error?.code : res.status;
    const detail = data.error?.message || res.statusText;
    const messages = {
      401: 'OpenRouter API anahtarı geçersiz. .env dosyasındaki OPENROUTER_API_KEY değerini kontrol et.',
      402: 'OpenRouter hesabında yeterli kredi yok. openrouter.ai/credits adresinden bakiye ekle.',
      404: `"${model}" modeli bulunamadı. Ayarlar'dan geçerli bir model adı gir.`,
      429: 'Hız sınırına takıldın, biraz sonra tekrar dene.',
    };
    throw new Error(messages[status] || `OpenRouter hatası (${status}): ${detail}`);
  }

  const choice = data.choices?.[0];
  const text = (choice?.message?.content || '').trim();
  if (!text) {
    const why = choice?.finish_reason === 'content_filter' ? 'Model bu isteği yanıtlamadı.' : 'Boş yanıt geldi.';
    throw new Error(`${why} Farklı bir model deneyebilirsin.`);
  }
  if (choice.finish_reason === 'length') {
    return { text: `${text}\n\n(Yanıt uzunluk sınırında kesildi.)`, model: data.model || model, createdAt: new Date().toISOString() };
  }
  return { text, model: data.model || model, createdAt: new Date().toISOString() };
}
