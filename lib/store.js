import fs from 'node:fs/promises';
import path from 'node:path';

// Kullanıcının elle girdiği bilgiler (durum, not, kontrol listesi, AI özeti).
// Proje yoluna göre değil id'ye göre tutulur; id yolun hash'idir.
export class Store {
  constructor(file) {
    this.file = file;
    this.data = { projects: {} };
    this.writing = Promise.resolve();
  }

  async load() {
    try {
      this.data = JSON.parse(await fs.readFile(this.file, 'utf8'));
      this.data.projects ??= {};
    } catch {
      this.data = { projects: {} };
    }
  }

  get(id) {
    return this.data.projects[id] || {};
  }

  async update(id, patch) {
    const cur = this.get(id);
    this.data.projects[id] = { ...cur, ...patch, updatedAt: new Date().toISOString() };
    await this.save();
    return this.data.projects[id];
  }

  save() {
    // Yazmaları sıraya al, yarım dosya kalmasın diye önce geçici dosyaya yaz
    this.writing = this.writing.then(async () => {
      await fs.mkdir(path.dirname(this.file), { recursive: true });
      const tmp = `${this.file}.tmp`;
      await fs.writeFile(tmp, JSON.stringify(this.data, null, 2));
      await fs.rename(tmp, this.file);
    });
    return this.writing;
  }
}
