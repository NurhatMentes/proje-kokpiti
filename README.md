# Proje Kokpiti

Tüm projelerini tek ekrandan takip ettiğin yerel geliştirici paneli.

## Başlatma

`baslat.bat` dosyasına çift tıkla. Tarayıcıda http://localhost:4545 adresi açılır.
Harici paket gerekmez, sadece Node.js 20+ yeterli.

Elle başlatmak için:

```bash
npm start
```

## Ne yapar?

- **Tarar:** `config.json` içindeki klasörlerde her alt klasörü bir proje olarak görür.
  Teknolojiyi (Flutter, Expo, Next.js, Python, .NET, Godot…), alt projeleri
  (`mobile/`, `functions/`, `admin/`) ve git depolarını otomatik bulur.
- **Sağlık kontrolü:** commit edilmemiş değişiklikler, push edilmemiş commit'ler,
  remote'u olmayan depolar, **git'e commit edilmiş gizli dosyalar** (`.env`,
  keystore, service account), eksik `.env`, kurulmamış bağımlılıklar,
  uzun süredir dokunulmayan projeler.
- **Durum etiketi:** Aktif / Beklemede / Yayına yakın / Yayında / Arşiv. Etiket
  vermediğin projeler için son değişikliğe göre tahmin yapar.
- **"Nerede kalmıştım?" notu:** yazdıkça otomatik kaydedilir.
- **Tek tıkla aç:** VS Code, Gezgin, terminal ya da alt projeyi doğru komutla
  çalıştırma (`flutter run`, `npm run dev`, venv içindeki `python`…).
- **AI özeti:** son commit'ler, dokümanlar ve notuna bakarak "son ne yaptım,
  sırada ne var" özetini çıkarır (OpenRouter üzerinden, istediğin model).
- **Yayın kontrol listesi:** mobil, web ve genel projeler için hazır maddeler.
  İstersen kendi maddelerini de ekleyebilirsin.

## AI özeti için

1. https://openrouter.ai/keys adresinden bir anahtar al.
2. `.env.example` dosyasını `.env` adıyla kopyala ve anahtarı yaz:
   ```
   OPENROUTER_API_KEY=sk-or-v1-...
   ```
3. Kokpiti yeniden başlat.

Model Ayarlar ekranından değiştirilebilir. Varsayılan model
`anthropic/claude-sonnet-5`. OpenRouter'daki herhangi bir model adını
yazabilirsin (örneğin `deepseek/deepseek-v4-flash` ya da ücretsiz
`qwen/qwen3.8-27b:free`).

"Özet çıkar" butonuna bastığında projenin README ve CHANGELOG gibi
dokümanları, son 25 commit mesajı, değişen dosya adları ve notun OpenRouter'a,
oradan da seçtiğin modelin sağlayıcısına gönderilir. `.env` gibi gizli
dosyaların içeriği gönderilmez.

## Veriler

- `config.json`: taranacak klasörler ve AI modeli (arayüzdeki Ayarlar'dan da değişir)
- `.env`: OpenRouter anahtarın (git'e girmez)
- `data/kokpit.json`: notların, durumların, kontrol listelerin ve AI özetlerin

Sunucu sadece `127.0.0.1` üzerinden dinler. Başka bir cihazdan ya da siteden
erişilemez.
