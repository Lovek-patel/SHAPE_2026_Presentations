// ============================================
// SLIDE 10 — CELL TRANSDUCTION
// HEK293T cells receive lentiviral vectors,
// ~80% become GFP-expressing over 48 hours.
// Time counter 0–48hr shown.
// ============================================

const TD_CONFIG = {
  beat0_dur: 3000,   // cells appear
  beat1_dur: 5000,   // virus added
  beat2_dur: 10000,  // 0→24hr, cells infecting
  beat3_dur: 10000,  // 24→48hr, GFP brightens, virions spread
  beat4_dur: 99999,  // hold at 48hr
};

const TD_TEXTS = [
  'HEK293T cells in culture.',
  'Lentiviral virus added.',
  'Viral integration.',
  'GFP signal appears at ~24 hours.',
  '~80% transduction efficiency confirmed.',
];

let tdAnimating  = false;
let tdRAF        = null;
let tdBeat       = 0;
let tdBeatStart  = 0;
let tdBeatTimers = [];
let tdClickReady = false;

Reveal.on('slidechanged', function(event) {
  if (event.previousSlide && event.previousSlide.id === 'slide-transduction') _resetTD();
  if (event.currentSlide  && event.currentSlide.id  === 'slide-transduction' && !tdAnimating) {
    tdAnimating = true; tdBeat = 0; tdClickReady = false;
    setTimeout(startTDAnimation, 500);
  }
});
Reveal.on('ready', function() {
  const s = Reveal.getCurrentSlide();
  if (s && s.id === 'slide-transduction' && !tdAnimating) {
    tdAnimating = true; tdBeat = 0; tdClickReady = false;
    setTimeout(startTDAnimation, 500);
  }
});
document.addEventListener('keydown', function(e) {
  if (!tdClickReady) return;
  if (e.key !== 'ArrowRight' && e.key !== ' ' && e.key !== 'Enter') return;
  e.stopImmediatePropagation(); e.preventDefault();
  tdClickReady = false; Reveal.next();
}, true);

function _resetTD() {
  tdAnimating = false; tdBeat = 0; tdClickReady = false;
  tdBeatTimers.forEach(clearTimeout); tdBeatTimers = [];
  if (tdRAF) { cancelAnimationFrame(tdRAF); tdRAF = null; }
  const canvas = document.getElementById('transduction-canvas');
  if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  const txt = document.getElementById('transduction-text');
  if (txt) { txt.classList.remove('visible'); txt.textContent = ''; }
}

function startTDAnimation() {
  const canvas = document.getElementById('transduction-canvas');
  const textEl = document.getElementById('transduction-text');
  if (!canvas) return;
  requestAnimationFrame(() => _startTDInner(canvas, textEl));
}

function _startTDInner(canvas, textEl) {
  const par = canvas.parentElement;
  canvas.width  = par.offsetWidth  > 50 ? par.offsetWidth  : 1100;
  canvas.height = par.offsetHeight > 50 ? par.offsetHeight : 520;
  const W = canvas.width, H = canvas.height;
  const ctx = canvas.getContext('2d');
  const HEADER_H = 90;

  function lerp(a,b,t){ return a+(b-a)*t; }
  function clamp(x,a,b){ return Math.max(a,Math.min(b,x)); }
  function rnd(a,b){ return a+Math.random()*(b-a); }
  function sm(x){ x=clamp(x,0,1); return x*x*(3-2*x); }

  function showText(msg) {
    if (!textEl) return;
    textEl.classList.remove('visible');
    setTimeout(() => { textEl.innerHTML=msg; if(msg) textEl.classList.add('visible'); }, 300);
  }

  function scheduleBeat(b) {
    tdBeat=b; tdBeatStart=performance.now();
    if (TD_TEXTS[b]) showText(TD_TEXTS[b]);
    const dur = TD_CONFIG['beat'+b+'_dur'];
    if (!dur||dur===99999){ tdClickReady=true; return; }
    tdBeatTimers.push(setTimeout(()=>{ if(tdAnimating) scheduleBeat(b+1); },dur));
  }

  // ---- HEK293T cell — large adherent blob ----
  // HEK293T are large, polygonal, adherent — irregular shape
  let cellIdCounter = 0;
  function makeCell(x, y, infected) {
    const n = 9; // blob points
    return {
      id: cellIdCounter++,
      x: x !== undefined ? x : rnd(W*0.10, W*0.85),
      y: y !== undefined ? y : rnd(HEADER_H+50, H-50),
      vx: rnd(-0.04,0.04), vy: rnd(-0.04,0.04),
      r: rnd(28,38),        // HEK293T are large
      angle: rnd(0,Math.PI*2),
      phase: rnd(0,Math.PI*2),
      wobble: rnd(0,Math.PI*2),
      blobAmps: Array.from({length:n}, ()=>rnd(0.08,0.22)), // irregular blob
      n,
      op: 1,                // start visible immediately
      infected: infected||false,
      gfpLevel: 0,
      divTimer: rnd(12000,22000),
      deathTimer: rnd(30000,70000),
      dying: false, dyingP: 0,
      shedTimer: rnd(3000,6000),
    };
  }

  // 12 HEK293T cells, spread across slide
  let cells = [];
  const POSITIONS = [
    [W*0.12,H*0.38],[W*0.24,H*0.55],[W*0.35,H*0.40],[W*0.48,H*0.52],
    [W*0.58,H*0.38],[W*0.70,H*0.55],[W*0.82,H*0.42],[W*0.22,H*0.68],
    [W*0.44,H*0.68],[W*0.62,H*0.68],[W*0.76,H*0.70],[W*0.36,H*0.28],
  ];
  POSITIONS.forEach(([x,y]) => cells.push(makeCell(x,y,false)));

  // virus rain particles
  let virusRain = [];
  // free virions between cells
  let freeVirions = [];
  // time counter
  let timeHr = 0;

  let lastT = performance.now();

  // ---- Beat dispatch ----
  let _lastBeat = -1;
  function onBeat(b) {
    if (b===_lastBeat) return; _lastBeat=b;

    if (b===1) {
      // spawn 40 virus particles raining from top
      for (let i=0;i<40;i++) {
        tdBeatTimers.push(setTimeout(()=>{
          if(!tdAnimating) return;
          virusRain.push({
            x: rnd(W*0.05,W*0.95),
            y: HEADER_H+5,
            vy: rnd(1.2,2.5),
            vx: rnd(-0.4,0.4),
            r: rnd(3.5,5.5),
            op: 1, landed: false,
          });
        }, i*110));
      }
    }

    if (b===2) {
      // infect ~80% over 10 seconds, staggered
      const toInfect = Math.round(cells.length*0.80);
      const shuffled = [...cells].sort(()=>Math.random()-0.5);
      shuffled.slice(0,toInfect).forEach((c,i)=>{
        const delay = rnd(1000, TD_CONFIG.beat2_dur*0.80);
        tdBeatTimers.push(setTimeout(()=>{
          if(!tdAnimating) return;
          c.infected=true;
        },delay));
      });
    }
  }

  // ---- DRAW: HEK293T cell (large irregular blob) ----
  function drawCell(c, t) {
    if (c.op<0.01) return;
    const alpha = c.dying ? c.op*(1-c.dyingP) : c.op;
    if (alpha<0.01) return;
    ctx.save(); ctx.globalAlpha = alpha;

    const wobX = Math.sin(t*0.0008+c.wobble)*1.5;
    const wobY = Math.cos(t*0.0007+c.wobble)*1.5;
    const cx=c.x+wobX, cy=c.y+wobY;
    const r=c.r;

    // GFP halo
    if (c.gfpLevel>0.05) {
      const grd=ctx.createRadialGradient(cx,cy,r*0.4,cx,cy,r*2.5);
      grd.addColorStop(0,`rgba(80,220,100,${c.gfpLevel*0.28})`);
      grd.addColorStop(1,'rgba(80,220,100,0)');
      ctx.beginPath();
      for(let i=0;i<=c.n;i++){
        const a=(i/c.n)*Math.PI*2;
        const br=r*(1+c.blobAmps[i%c.n]);
        i===0?ctx.moveTo(cx+Math.cos(a)*br,cy+Math.sin(a)*br*0.75)
             :ctx.lineTo(cx+Math.cos(a)*br,cy+Math.sin(a)*br*0.75);
      }
      ctx.closePath(); ctx.fillStyle=grd; ctx.fill();
    }

    // cell body — irregular polygon, slightly flattened (adherent)
    ctx.beginPath();
    for(let i=0;i<=c.n;i++){
      const a=(i/c.n)*Math.PI*2;
      const br=r*(1+c.blobAmps[i%c.n]+0.04*Math.sin(t*0.0006+a+c.phase));
      i===0?ctx.moveTo(cx+Math.cos(a)*br,cy+Math.sin(a)*br*0.75)
           :ctx.lineTo(cx+Math.cos(a)*br,cy+Math.sin(a)*br*0.75);
    }
    ctx.closePath();

    // color: blue-grey if healthy, green if infected (ramps with gfp)
    const rr = Math.round(lerp(175,60,c.gfpLevel));
    const gg = Math.round(lerp(188,215,c.gfpLevel));
    const bb = Math.round(lerp(210,85,c.gfpLevel));
    ctx.fillStyle   = `rgba(${rr},${gg},${bb},0.30)`;
    ctx.strokeStyle = c.infected
      ? `rgba(50,${Math.round(lerp(160,220,c.gfpLevel))},65,0.80)`
      : 'rgba(145,165,195,0.70)';
    ctx.lineWidth=1.8; ctx.fill(); ctx.stroke();

    // large nucleus (HEK293T characteristic)
    const nR=r*0.50;
    ctx.beginPath(); ctx.arc(cx+r*0.06,cy-r*0.04,nR,0,Math.PI*2);
    ctx.fillStyle   = c.infected
      ? `rgba(30,${Math.round(lerp(85,165,c.gfpLevel))},40,0.60)`
      : 'rgba(110,130,165,0.55)';
    ctx.strokeStyle = c.infected ? 'rgba(40,180,55,0.42)' : 'rgba(95,115,150,0.48)';
    ctx.lineWidth=0.9; ctx.fill(); ctx.stroke();

    // nucleolus
    ctx.beginPath(); ctx.arc(cx+r*0.12,cy-r*0.08,nR*0.28,0,Math.PI*2);
    ctx.fillStyle=c.infected?'rgba(40,200,60,0.55)':'rgba(130,108,170,0.55)';
    ctx.fill();

    // GFP internal puncta (beat 3+)
    if(c.gfpLevel>0.15){
      const nDots=Math.floor(c.gfpLevel*6)+2;
      for(let i=0;i<nDots;i++){
        const da=(i/nDots)*Math.PI*2+c.phase;
        const dd=rnd(r*0.1,r*0.55);
        ctx.beginPath(); ctx.arc(cx+Math.cos(da)*dd,cy+Math.sin(da)*dd*0.7,2.5,0,Math.PI*2);
        ctx.fillStyle=`rgba(90,235,110,${c.gfpLevel*0.85})`; ctx.fill();
      }
    }

    ctx.restore();
  }

  // ---- DRAW: small virion ----
  function drawVirion(x,y,r,op) {
    if(op<0.01) return;
    ctx.save(); ctx.globalAlpha=op;
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fillStyle='rgba(80,218,100,0.82)';
    ctx.strokeStyle='rgba(48,172,65,0.92)';
    ctx.lineWidth=0.9; ctx.fill(); ctx.stroke();
    // star
    ctx.fillStyle='rgba(255,255,255,0.78)';
    const pts=5,ir=r*0.33,or=r*0.70;
    ctx.beginPath();
    for(let i=0;i<pts*2;i++){
      const a=(i/pts)*Math.PI-Math.PI/2;
      const rr=i%2===0?or:ir;
      i===0?ctx.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)
           :ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);
    }
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // ---- DRAW: time counter ----
  function drawCounter(hr) {
    const h=Math.round(clamp(hr,0,48));
    ctx.save();
    const bx=W-115,by=HEADER_H+14,bw=96,bh=42;
    ctx.fillStyle='rgba(18,18,26,0.82)';
    ctx.strokeStyle='rgba(136,192,208,0.50)';
    ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.roundRect(bx,by,bw,bh,5); ctx.fill(); ctx.stroke();
    ctx.font='bold 24px Raleway,sans-serif';
    ctx.fillStyle='rgba(136,192,208,0.95)';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(h+'hr',bx+bw/2,by+bh/2);
    ctx.restore();
  }

  // ---- RENDER ----
  function render(t) {
    if(!tdAnimating) return;
    onBeat(tdBeat);

    const beat=tdBeat;
    const rawP=clamp((performance.now()-tdBeatStart)/Math.max(1,TD_CONFIG['beat'+beat+'_dur']||99999),0,1);
    const dt=Math.min(t-lastT,50); lastT=t;

    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='#0e0e0e'; ctx.fillRect(0,0,W,HEADER_H);

    // time counter
    if(beat===2) timeHr=lerp(0,24,rawP);
    else if(beat===3) timeHr=lerp(24,48,rawP);
    else if(beat>=4) timeHr=48;

    // ---- update cells ----
    cells.forEach(c=>{
      if(c.dying){
        c.dyingP=Math.min(1,c.dyingP+0.004);
        if(c.dyingP>=1) c.op=0;
        return;
      }

      // gentle drift
      c.x+=c.vx; c.y+=c.vy;
      c.vx+=(Math.random()-0.5)*0.002;
      c.vy+=(Math.random()-0.5)*0.002;
      const spd=Math.sqrt(c.vx*c.vx+c.vy*c.vy);
      if(spd>0.06){c.vx*=0.06/spd;c.vy*=0.06/spd;}
      // soft boundary
      if(c.x<c.r+8){c.vx+=0.015;} if(c.x>W-c.r-8){c.vx-=0.015;}
      if(c.y<HEADER_H+c.r+8){c.vy+=0.015;} if(c.y>H-c.r-8){c.vy-=0.015;}

      // GFP ramp
      if(c.infected && c.gfpLevel<0.90){
        const rate=beat>=3?0.0018:0.0008;
        c.gfpLevel=Math.min(0.90,c.gfpLevel+rate);
      }

      // division
      if(beat>=2){
        c.divTimer-=dt;
        if(c.divTimer<=0){
          c.divTimer=rnd(14000,24000);
          const alive=cells.filter(cc=>cc.op>0).length;
          if(alive<22){
            const child=makeCell(
              c.x+rnd(-c.r*2,c.r*2),
              c.y+rnd(-c.r*2,c.r*2),
              c.infected
            );
            child.gfpLevel=c.infected?c.gfpLevel*0.45:0;
            cells.push(child);
          }
        }
        // death
        c.deathTimer-=dt;
        if(c.deathTimer<=0) c.dying=true;
      }

      // shed virion (beat 3+)
      if(c.infected&&beat>=3){
        c.shedTimer-=dt;
        if(c.shedTimer<=0){
          c.shedTimer=rnd(4000,9000);
          const a=Math.random()*Math.PI*2;
          freeVirions.push({
            x:c.x+Math.cos(a)*c.r*0.9,
            y:c.y+Math.sin(a)*c.r*0.9,
            vx:Math.cos(a)*rnd(0.2,0.55),
            vy:Math.sin(a)*rnd(0.2,0.55),
            r:rnd(3,5), op:1,
            targetCell:null,
          });
        }
      }
    });
    cells=cells.filter(c=>c.op>0);

    // ---- virus rain ----
    virusRain.forEach(v=>{
      if(!v.landed){
        v.y+=v.vy; v.x+=v.vx;
        if(v.y>H+20){v.op=0;}
        cells.forEach(c=>{
          if(v.landed||v.op<=0) return;
          if(Math.hypot(v.x-c.x,v.y-c.y)<c.r+v.r){v.landed=true;v.op=0;}
        });
      }
      if(!v.landed&&v.op>0) drawVirion(v.x,v.y,v.r,v.op);
    });
    virusRain=virusRain.filter(v=>v.op>0);

    // ---- free virions ----
    freeVirions.forEach(v=>{
      const uninf=cells.filter(c=>!c.infected&&c.op>0&&!c.dying);
      if(!v.targetCell||v.targetCell.infected){
        v.targetCell=uninf.length>0
          ? uninf.reduce((b,c)=>Math.hypot(c.x-v.x,c.y-v.y)<Math.hypot(b.x-v.x,b.y-v.y)?c:b,uninf[0])
          : null;
      }
      if(v.targetCell){
        const dx=v.targetCell.x-v.x,dy=v.targetCell.y-v.y;
        const d=Math.sqrt(dx*dx+dy*dy);
        if(d<v.targetCell.r+v.r+2){
          v.targetCell.infected=true; v.op=0;
        } else {
          v.vx=lerp(v.vx,dx/d*0.45,0.035);
          v.vy=lerp(v.vy,dy/d*0.45,0.035);
        }
      }
      v.x+=v.vx; v.y+=v.vy;
      v.vx*=0.98; v.vy*=0.98;
      v.op=Math.max(0,v.op-0.0015);
      if(v.op>0) drawVirion(v.x,v.y,v.r,v.op);
    });
    freeVirions=freeVirions.filter(v=>v.op>0);

    // ---- draw cells ----
    cells.forEach(c=>drawCell(c,t));

    // ---- counter ----
    if(beat>=2) drawCounter(timeHr);

    ctx.fillStyle='#0e0e0e'; ctx.fillRect(0,0,W,HEADER_H);
    tdRAF=requestAnimationFrame(render);
  }

  scheduleBeat(0);
  tdRAF=requestAnimationFrame(render);
}