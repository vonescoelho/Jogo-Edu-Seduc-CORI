const CACHE = "aee-coriolano-v12";
const ARQUIVOS = ["./","./index.html","./manifest.webmanifest","./icone-192.png","./icone-512.png","./icone-mascara-512.png"];
self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ARQUIVOS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate", e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim()));
});
self.addEventListener("fetch", e=>{
  if(e.request.method!=="GET") return;
  e.respondWith(
    caches.match(e.request).then(function(guardado){
      if(guardado) return guardado;
      return fetch(e.request).then(function(resp){
        var copia=resp.clone();
        caches.open(CACHE).then(function(c){ try{ c.put(e.request, copia); }catch(err){} });
        return resp;
      }).catch(function(){ return caches.match("./index.html"); });
    })
  );
});
