// Service worker do app Refeições (SIGECON).
// Tudo que é buscado com sucesso fica guardado; se a rede falhar, usa o que já está guardado.

const CACHE_NOME = 'refeicoes-campo-v4'; // trocar o número força os celulares a renovarem o cache
const ARQUIVOS_ESSENCIAIS = [
  './',
  './index.html',
  './refeicoes-campo.html',
  './manifest.json',
  './icone.svg',
  './icone-180.png',
  './icone-192.png',
  './icone-512.png',
  './icone-maskable-512.png',
];

self.addEventListener('install', (evento) => {
  self.skipWaiting();
  evento.waitUntil(
    caches.open(CACHE_NOME).then((cache) => cache.addAll(ARQUIVOS_ESSENCIAIS))
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(nomes.filter((n) => n !== CACHE_NOME).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (evento) => {
  const req = evento.request;
  if (req.method !== 'GET') return; // POST (sincronização) passa direto
  if (req.url.includes('/rest/v1/') || req.url.includes('/auth/v1/') || req.url.includes('/storage/v1/')) return; // dados do banco não vão para o cache

  evento.respondWith(
    fetch(req)
      .then((resposta) => {
        const copia = resposta.clone();
        caches.open(CACHE_NOME).then((cache) => cache.put(req, copia)).catch(() => {});
        return resposta;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((cacheado) => cacheado || Promise.reject('offline-sem-cache')))
  );
});
