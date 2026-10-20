/* Plataforma de Atendimentos AEE — trabalhador de segundo plano.

   O index.html é buscado primeiro na internet e só depois no que está guardado:
   assim, basta o tablet pegar rede uma vez para receber a versão nova, sem
   precisar instalar nada de novo. Os ícones e o manifesto continuam vindo do
   que está guardado, por serem fixos. */
const CACHE = "aee-srm-v56";
const ARQUIVOS = ["./","./index.html","./manifest.webmanifest",
                  "./logo-aee-192.png","./logo-aee-512.png"];

self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ARQUIVOS)).then(()=>self.skipWaiting()));
});

self.addEventListener("activate", e=>{
  e.waitUntil((async ()=>{
    const nomes = await caches.keys();
    await Promise.all(nomes.filter(n=>n!==CACHE).map(n=>caches.delete(n)));
    await self.clients.claim();
    const abertos = await self.clients.matchAll({type:"window"});
    abertos.forEach(c=>{ try{ c.postMessage({tipo:"versao-nova", versao:CACHE}); }catch(e){} });
  })());
});

/* o aplicativo pede para a versão nova assumir na hora */
self.addEventListener("message", e=>{
  if(e.data && e.data.tipo==="assumir") self.skipWaiting();
});

const ehPagina = req =>
  req.mode === "navigate" ||
  (req.destination === "document") ||
  /\/(index\.html)?(\?.*)?$/.test(new URL(req.url).pathname);

self.addEventListener("fetch", e=>{
  if(e.request.method!=="GET") return;
  if(new URL(e.request.url).origin !== self.location.origin) return;

  if(ehPagina(e.request)){
    /* primeiro a internet: é por aqui que chega o conteúdo novo */
    e.respondWith((async ()=>{
      try{
        const resp = await fetch(e.request, {cache:"no-store"});
        const c = await caches.open(CACHE);
        try{ c.put("./index.html", resp.clone()); }catch(err){}
        return resp;
      }catch(err){
        return (await caches.match("./index.html")) || (await caches.match(e.request)) ||
               new Response("Sem internet e sem cópia guardada.", {status:503});
      }
    })());
    return;
  }

  e.respondWith((async ()=>{
    const guardado = await caches.match(e.request);
    if(guardado) return guardado;
    try{
      const resp = await fetch(e.request);
      const c = await caches.open(CACHE);
      try{ c.put(e.request, resp.clone()); }catch(err){}
      return resp;
    }catch(err){
      return (await caches.match("./index.html")) ||
             new Response("Sem internet.", {status:503});
    }
  })());
});
