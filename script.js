/* ----------------------------------------------------------
     SAMPLE DATA — replace with a live Supabase fetch later.
  ---------------------------------------------------------- */
  const NAME_POOL = {
    it:{f:["Luca","Giulia","Marco","Sofia","Alessandro","Chiara","Matteo","Elena","Francesco","Aurora"],l:["Rossi","Ferrari","Esposito","Bianchi","Romano","Colombo","Ricci","Greco","Conti","Costa"]},
    de:{f:["Lukas","Hannah","Felix","Emma","Jonas","Mia","Paul","Lena","Finn","Clara"],l:["Müller","Schmidt","Weber","Wagner","Becker","Hoffmann","Schulz","Koch","Richter","Klein"]},
    jp:{f:["Haruto","Yui","Sota","Aoi","Ren","Sakura","Yuto","Hina","Riku","Mio"],l:["Sato","Suzuki","Takahashi","Tanaka","Watanabe","Ito","Yamamoto","Nakamura","Kobayashi","Kato"]},
    br:{f:["Miguel","Helena","Arthur","Alice","Bernardo","Laura","Davi","Manuela","Théo","Valentina"],l:["Silva","Santos","Oliveira","Souza","Lima","Pereira","Costa","Rodrigues","Almeida","Ferreira"]},
    ng:{f:["Chidi","Amara","Emeka","Zainab","Tunde","Ngozi","Ifeanyi","Adaeze","Obi","Funke"],l:["Okafor","Adeyemi","Balogun","Okonkwo","Eze","Abubakar","Nwosu","Bello","Chukwu","Ogun"]},
    us:{f:["James","Olivia","Noah","Ava","Liam","Sophia","Ethan","Isabella","Mason","Charlotte"],l:["Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Martinez","Lee","Nguyen"]},
    in:{f:["Aarav","Diya","Vivaan","Ananya","Aditya","Ishani","Reyansh","Saanvi","Arjun","Myra"],l:["Sharma","Patel","Iyer","Reddy","Nair","Gupta","Rao","Mehta","Das","Kapoor"]},
    fr:{f:["Gabriel","Louise","Raphaël","Emma","Louis","Jade","Arthur","Alice","Hugo","Chloé"],l:["Martin","Bernard","Dubois","Thomas","Robert","Petit","Durand","Leroy","Moreau","Simon"]},
  };
  const CITIES = [
    {name:"Berlin", country:"Germany",  lat:52.52,  lng:13.405, pool:"de", seed:12, base:342},
    {name:"Roma",   country:"Italy",    lat:41.902, lng:12.496, pool:"it", seed:7,  base:511},
    {name:"Tōkyō",  country:"Japan",    lat:35.676, lng:139.65, pool:"jp", seed:31, base:288},
    {name:"São Paulo",country:"Brazil", lat:-23.55, lng:-46.63, pool:"br", seed:19, base:463},
    {name:"Lagos",  country:"Nigeria",  lat:6.524,  lng:3.379,  pool:"ng", seed:44, base:377},
    {name:"New York",country:"USA",     lat:40.712, lng:-74.006,pool:"us", seed:5,  base:604},
    {name:"Mumbai", country:"India",    lat:19.076, lng:72.877, pool:"in", seed:23, base:559},
    {name:"Paris",  country:"France",   lat:48.856, lng:2.352,  pool:"fr", seed:9,  base:420},
  ];
  function rng(seed){let s=seed*9301+49297;return()=>{s=(s*9301+49297)%233280;return s/233280;}}
  const YEAR_NOW=2007;
  function buildPeople(city){
    const r=rng(city.seed*97+city.base), pool=NAME_POOL[city.pool];
    const n=18+Math.floor(r()*22), arr=[];
    for(let i=0;i<n;i++){
      const f=pool.f[Math.floor(r()*pool.f.length)];
      const l=pool.l[Math.floor(r()*pool.l.length)];
      arr.push({first:f,last:l,year:1938+Math.floor(r()*(YEAR_NOW-1938))});
    }
    arr.sort((a,b)=>a.year-b.year);
    return arr;
  }
  CITIES.forEach(c=>c.people=buildPeople(c));
  const TOTAL = CITIES.reduce((s,c)=>s+c.people.length,0);

  /* ---------- Globe (HD textures) ---------- */
  // Swap TEX_NIGHT for your own 8K night map later if you host one.
  const TEX_NIGHT = 'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg';
  const TEX_BUMP  = 'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png';

  const globe = Globe()
    (document.getElementById('globeViz'))
    .globeImageUrl(TEX_NIGHT)
    .bumpImageUrl(TEX_BUMP)
    .backgroundColor('rgba(0,0,0,0)')
    .showAtmosphere(true).atmosphereColor('#F5B841').atmosphereAltitude(0.16)
    .pointsData(CITIES)
    .pointLat('lat').pointLng('lng')
    .pointColor(()=> '#F5B841')
    .pointAltitude(d=> 0.02 + d.people.length/900)
    .pointRadius(0.55).pointsMerge(false)
    .pointLabel(d=> `<div style="font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.08em;color:#F5B841;background:rgba(8,11,20,.9);padding:6px 10px;border-radius:6px;border:1px solid rgba(245,184,65,.3)">${d.name.toUpperCase()} · ${d.people.length}</div>`)
    .onPointClick(openCity);

  globe.ringsData(CITIES).ringLat('lat').ringLng('lng')
    .ringColor(()=> t=>`rgba(245,184,65,${1-t})`)
    .ringMaxRadius(2.2).ringPropagationSpeed(1.1).ringRepeatPeriod(2600);

  // ---- Sharpness: anisotropic filtering + relief + crisp pixel ratio ----
  function applyQuality(){
    try{
      const renderer = globe.renderer();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
      const maxAniso = renderer.capabilities.getMaxAnisotropy();
      const mat = globe.globeMaterial();
      [mat.map, mat.bumpMap].forEach(t=>{
        if(t){ t.anisotropy = maxAniso; t.generateMipmaps = true; t.needsUpdate = true; }
      });
      if('bumpScale' in mat){ mat.bumpScale = 5; }
      mat.needsUpdate = true;
    }catch(e){}
  }
  globe.onGlobeReady(applyQuality);
  let tries=0; const qi=setInterval(()=>{ applyQuality(); if(++tries>12) clearInterval(qi); }, 400);

  const reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const controls = globe.controls();
  controls.autoRotate = !reduce; controls.autoRotateSpeed = 0.35;
  controls.enableZoom = true;
  controls.minDistance = 128;   // allow close-up zoom (globe radius = 100)
  controls.maxDistance = 600;
  globe.pointOfView({lat:30,lng:10,altitude:2.4},0);

  function resize(){ globe.width(window.innerWidth).height(window.innerHeight); }
  window.addEventListener('resize',resize); resize();

  /* ---------- Count-up ---------- */
  (function(){
    const el=document.getElementById('count'); const dur=1600, t0=performance.now();
    (function step(t){
      const k=Math.min(1,(t-t0)/dur), e=1-Math.pow(1-k,3);
      el.textContent=Math.floor(e*TOTAL).toLocaleString('en-US');
      if(k<1) requestAnimationFrame(step);
    })(performance.now());
  })();

  /* ---------- City panel ---------- */
  const panel=document.getElementById('panel'), grid=document.getElementById('grid');
  const searchWrap=document.getElementById('searchWrap');
  const TILE=['#243B57','#3A3350','#1F4A45','#4A3A2A','#3E2E3E','#2C3E50'];

  function openCity(city){
    controls.autoRotate=false;
    globe.pointOfView({lat:city.lat,lng:city.lng,altitude:1.5},900);
    document.getElementById('pCoord').textContent =
      `${Math.abs(city.lat).toFixed(2)}°${city.lat>=0?'N':'S'}  ${Math.abs(city.lng).toFixed(2)}°${city.lng>=0?'E':'W'}`;
    document.getElementById('pCity').textContent = city.name;
    document.getElementById('pCountry').textContent = city.country;
    document.getElementById('pCount').textContent = city.people.length;
    document.getElementById('pSpan').textContent =
      `${city.people[0].year}–${city.people[city.people.length-1].year}`;
    grid.innerHTML='';
    city.people.forEach((p,i)=>{
      const initials=(p.first[0]||'')+(p.last[0]||'');
      const bg=TILE[(i+city.seed)%TILE.length];
      const card=document.createElement('div');
      card.className='card'; card.style.animationDelay=(i*22)+'ms';
      card.innerHTML=`
        <div class="portrait" style="background:linear-gradient(155deg,${bg},#0C1120)">
          <span class="idx">#${i+1}</span><span class="mono">${initials}</span>
        </div>
        <div class="name">${p.first} ${p.last}</div>
        <div class="year">b. ${p.year} · ${city.name}</div>`;
      grid.appendChild(card);
    });
    panel.classList.add('open');
    searchWrap.classList.add('shifted');
  }
  function closePanel(){ panel.classList.remove('open'); searchWrap.classList.remove('shifted'); controls.autoRotate=!reduce; }
  document.getElementById('close').addEventListener('click',closePanel);
  window.addEventListener('keydown',e=>{ if(e.key==='Escape' && panel.classList.contains('open')) closePanel(); });

  /* ---------- Search ---------- */
  const input=document.getElementById('search'), results=document.getElementById('results');
  const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  let matches=[], active=-1;

  function query(q){
    if(!q) return [];
    return CITIES.filter(c=> norm(c.name).includes(q) || norm(c.country).includes(q)).slice(0,6);
  }
  function render(){
    if(input.value.trim() && matches.length===0){
      results.innerHTML=`<div class="res-empty">No place found. Try another name.</div>`;
      results.classList.add('show'); return;
    }
    if(matches.length===0){ results.classList.remove('show'); results.innerHTML=''; return; }
    results.innerHTML = matches.map((c,i)=>
      `<button class="res${i===active?' active':''}" data-i="${CITIES.indexOf(c)}">
         <span class="res-name">${c.name}</span>
         <span class="res-meta">${c.country} · <b>${c.people.length}</b></span>
       </button>`).join('');
    results.classList.add('show');
  }
  function pick(city){ input.value=city.name; matches=[]; active=-1; render(); openCity(city); input.blur(); }

  input.addEventListener('input',()=>{ matches=query(norm(input.value)); active=-1; render(); });
  input.addEventListener('focus',()=>{ if(input.value){ matches=query(norm(input.value)); render(); } });
  input.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'){ e.preventDefault(); active=Math.min(active+1,matches.length-1); render(); }
    else if(e.key==='ArrowUp'){ e.preventDefault(); active=Math.max(active-1,0); render(); }
    else if(e.key==='Enter'){ const c=matches[active>=0?active:0]; if(c) pick(c); }
    else if(e.key==='Escape'){ input.value=''; matches=[]; render(); input.blur(); }
  });
  results.addEventListener('click',e=>{ const b=e.target.closest('.res'); if(b) pick(CITIES[+b.dataset.i]); });
  document.addEventListener('click',e=>{ if(!searchWrap.contains(e.target)){ results.classList.remove('show'); } });
