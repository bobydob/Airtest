// sw-br-proxy.js
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

const MAP = {
  '.framework.br': 'application/javascript',
  '.wasm.br':      'application/wasm',
  '.data.br':      'application/octet-stream'
};

// Разрешаем все *.br из твоей папки на jsDelivr
self.addEventListener('fetch', event => {
  const u = new URL(event.request.url);
  if (u.hostname !== 'cdn.jsdelivr.net') return;

  // подстрой при необходимости путь/ветку
  const isOurPath = /\/bobydob\/Airtest@master\/5\//.test(u.pathname);
  if (!isOurPath) return;

  const ext = Object.keys(MAP).find(e => u.pathname.endsWith(e));
  if (!ext) return;

  event.respondWith((async () => {
    const res = await fetch(event.request);           // CORS-ответ от jsDelivr (type: "cors")
    const headers = new Headers(res.headers);
    headers.set('Content-Type', MAP[ext]);            // правильный MIME
    headers.set('Content-Encoding', 'br');            // говорим браузеру: это brotli
    headers.delete('Content-Length');                 // длина меняется после декомпрессии

    // Возвращаем тот же поток тела; декомпрессию сделает сам браузер.
    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers
    });
  })());
});

