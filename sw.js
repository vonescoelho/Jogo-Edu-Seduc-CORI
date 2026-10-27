/* Esta versão do aplicativo foi encerrada.
   Este trabalhador apaga só o que era do aplicativo antigo, se desliga e recarrega a tela,
   que passa a mostrar o aviso de encerramento. */
self.addEventListener("install", e=>self.skipWaiting());
self.addEventListener("activate", e=>{
  e.waitUntil((async ()=>{
    try{
      const nomes=await caches.keys();
      await Promise.all(nomes.filter(n=>{ const m=/^aee-srm-v(\d+)$/.exec(n); return m && +m[1]<=56; }).map(n=>caches.delete(n)));
    }catch(err){}
    try{ await self.registration.unregister(); }catch(err){}
    try{ const abertos=await self.clients.matchAll({type:"window"}); abertos.forEach(c=>{ try{ c.navigate(c.url); }catch(err){} }); }catch(err){}
  })());
});
self.addEventListener("fetch", ()=>{});
