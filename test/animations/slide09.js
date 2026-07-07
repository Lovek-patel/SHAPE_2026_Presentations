// ============================================
// SLIDE 09 — VIRAL HARVEST
// HEK293T cells receive 3 vectors, produce virus,
// virus builds up, supernatant collected
//
// Beat sequence (auto, holds at end for click):
//   0 — 4 HEK293T cells appear, floating gently
//   1 — 3 colored vector particles drift into each cell
//       text: "HEK293T cells transfected with three lentiviral vectors."
//   2 — cells develop green internal spots (viral production)
//       text: "Cells begin producing lentiviral particles."
//   3 — cells release small green virus shapes that accumulate
//       text: "Virus released into the supernatant."
//   4 — cells fade away gently, viruses remain
//       text: "Collect supernatant."
//   5 — viruses gather into a collection zone with label
//       text: "Viral stock ready."
//       holds, click advances
// ============================================

const VH_CONFIG = {
  beat0_dur: 2000,
  beat1_dur: 4500,
  beat2_dur: 3500,
  beat3_dur: 4000,
  beat4_dur: 2800,
  beat5_dur: 99999,
};

const VH_TEXTS = [
  '',
  'HEK293T cells transfected with three lentiviral vectors.',
  'Cells begin producing lentiviral particles.',
  'Virus released into the supernatant.',
  'Collect supernatant.',
  'Viral stock ready.',
];

// 3 vector types (same colors as slide 8)
const VEC_COLORS = [
  { fill:'rgba(136,192,208,0.88)', stroke:'rgba(90,155,178,0.95)',  label:'VSVG'  },
  { fill:'rgba(185,105,210,0.88)', stroke:'rgba(148,68,185,0.95)',  label:'psPAX2'},
  { fill:'rgba(205,160,55,0.88)',  stroke:'rgba(170,124,28,0.95)',  label:'pMD2.G'},
];

let vhAnimating  = false;
let vhRAF        = null;
let vhBeat       = 0;
let vhBeatStart  = 0;
let vhBeatTimers = [];
let vhClickReady = false;

Reveal.on('slidechanged', function(event) {
  if (event.previousSlide && event.previousSlide.id === 'slide-harvest') _resetVH();
  if (event.currentSlide  && event.currentSlide.id  === 'slide-harvest' && !vhAnimating) {
    vhAnimating = true; vhBeat = 0; vhClickReady = false;
    setTimeout(startVHAnimation, 500);
  }
});
Reveal.on('ready', function() {
  const s = Reveal.getCurrentSlide();
  if (s && s.id === 'slide-harvest' && !vhAnimating) {
    vhAnimating = true; vhBeat = 0; vhClickReady = false;
    setTimeout(startVHAnimation, 500);
  }
});
document.addEventListener('keydown', function(e) {
  if (!vhClickReady) return;
  if (e.key !== 'ArrowRight' && e.key !== ' ' && e.key !== 'Enter') return;
  e.stopImmediatePropagation(); e.preventDefault();
  vhClickReady = false; Reveal.next();
}, true);

function _resetVH() {
  vhAnimating = false; vhBeat = 0; vhClickReady = false;
  vhBeatTimers.forEach(clearTimeout); vhBeatTimers = [];
  if (vhRAF) { cancelAnimationFrame(vhRAF); vhRAF = null; }
  const canvas = document.getElementById('harvest-canvas');
  if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  const txt = document.getElementById('harvest-text');
  if (txt) { txt.classList.remove('visible'); txt.textContent = ''; }
}

function startVHAnimation() {
  const canvas = document.getElementById('harvest-canvas');
  const textEl = document.getElementById('harvest-text');
  if (!canvas) return;
  requestAnimationFrame(() => _startVHInner(canvas, textEl));
}

function _startVHInner(canvas, textEl) {
  const par = canvas.parentElement;
  canvas.width  = par.offsetWidth  > 50 ? par.offsetWidth  : 1100;
  canvas.height = par.offsetHeight > 50 ? par.offsetHeight : 520;
  const W = canvas.width, H = canvas.height;
  const ctx = canvas.getContext('2d');
  const HEADER_H = 90;

  function sm(x)   { x=Math.max(0,Math.min(1,x)); return x*x*(3-2*x); }
  function ease(x) { return x<0.5?2*x*x:1-Math.pow(-2*x+2,2)/2; }
  function lerp(a,b,t){ return a+(b-a)*t; }
  function clamp(x,a,b){ return Math.max(a,Math.min(b,x)); }

  function showText(msg) {
    if (!textEl) return;
    textEl.classList.remove('visible');
    setTimeout(() => {
      textEl.innerHTML = msg;
      if (msg) textEl.classList.add('visible');
    }, 300);
  }

  function scheduleBeat(b) {
    vhBeat = b; vhBeatStart = performance.now();
    if (VH_TEXTS[b]) showText(VH_TEXTS[b]);
    const dur = VH_CONFIG['beat'+b+'_dur'];
    if (!dur || dur === 99999) { vhClickReady = true; return; }
    vhBeatTimers.push(setTimeout(() => { if (vhAnimating) scheduleBeat(b+1); }, dur));
  }

  // ---- HEK293T cell positions ----
  // HEK293T are large, roughly polygonal/blobby adherent cells
  // We'll represent as irregular blob shapes with a large nucleus
  const CELL_POSITIONS = [
    { x:W*0.22, y:H*0.42 },
    { x:W*0.42, y:H*0.38 },
    { x:W*0.62, y:H*0.50 },
    { x:W*0.38, y:H*0.62 },
  ];

  let cells = CELL_POSITIONS.map((pos, i) => ({
    x: pos.x, y: pos.y,
    vx: (Math.random()-0.5)*0.08,
    vy: (Math.random()-0.5)*0.06,
    phase: Math.random()*Math.PI*2,
    wobble: Math.random()*Math.PI*2,
    r: 38 + Math.random()*8,
    blobAngles: Array.from({length:10},()=>Math.random()*0.25),
    op: 0,
    vecProgress: [0,0,0],    // 0=not absorbed, 1=inside cell
    productionLevel: 0,       // 0-1, grows in beat 2
    releasing: false,
  }));

  // Incoming vector particles (3 per cell = 12 total)
  let vectors = [];

  // Virus particles released by cells
  let viruses = [];

  // Collection zone
  const COL_X = W*0.82, COL_Y = H*0.48, COL_R = 55;
  let colOp = 0;
  let colLabel = 0;

  // ---- Beat dispatch ----
  let _lastBeat = -1;
  function onBeat(b) {
    if (b === _lastBeat) return; _lastBeat = b;

    if (b === 0) {
      cells.forEach((c,i) => {
        vhBeatTimers.push(setTimeout(() => { c.op = 1; }, i*250));
      });
    }

    if (b === 1) {
      // send 3 vectors to each cell, staggered
      cells.forEach((cell, ci) => {
        VEC_COLORS.forEach((vc, vi) => {
          // vector starts from a random off-screen edge
          const startX = vi===0 ? -40 : vi===1 ? W+40 : W*0.5+(Math.random()-0.5)*200;
          const startY = vi===2 ? -40  : H*0.2+Math.random()*H*0.6;
          const delay  = ci*400 + vi*280;
          vhBeatTimers.push(setTimeout(() => {
            if (!vhAnimating) return;
            vectors.push({
              x: startX, y: startY,
              tx: cell.x + (Math.random()-0.5)*20,
              ty: cell.y + (Math.random()-0.5)*20,
              col: vc, cellIdx: ci, vecIdx: vi,
              op: 1, absorbed: false,
              t: 0, // travel progress 0→1
            });
          }, delay));
        });
      });
    }

    if (b === 2) {
      // cells start producing — productionLevel rises
      cells.forEach(c => c.releasing = false);
    }

    if (b === 3) {
      // cells start releasing virus
      cells.forEach(c => { c.releasing = true; });
    }

    if (b === 4) {
      // cells fade out
      cells.forEach(c => { c.fading = true; });
    }

    if (b === 5) {
      // viruses collect
      viruses.forEach(v => { v.collecting = true; });
    }
  }

  // ---- DRAW: HEK293T blob cell ----
  // Irregular polygon with large nucleus — matches HEK293T morphology
  function drawHEK(c, t) {
    if (c.op < 0.01) return;
    ctx.save(); ctx.globalAlpha = c.op;

    const r = c.r;
    const wobX = Math.sin(t*0.0009+c.wobble)*1.5;
    const wobY = Math.cos(t*0.0007+c.wobble)*1.5;
    const cx = c.x+wobX, cy = c.y+wobY;
    const n = 10; // blob points

    // cell body — irregular blob
    ctx.beginPath();
    for (let i=0;i<=n;i++) {
      const a = (i/n)*Math.PI*2;
      const blobR = r*(0.82 + c.blobAngles[i%n] + 0.06*Math.sin(t*0.0008+a+c.phase));
      const px = cx+Math.cos(a)*blobR;
      const py = cy+Math.sin(a)*blobR*0.72; // slightly flattened
      i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
    }
    ctx.closePath();
    ctx.fillStyle   = 'rgba(210,190,230,0.22)';
    ctx.strokeStyle = 'rgba(190,170,215,0.65)';
    ctx.lineWidth   = 1.5;
    ctx.fill(); ctx.stroke();

    // nucleus — large, typical of HEK293T
    const nR = r*0.48;
    ctx.beginPath(); ctx.arc(cx+r*0.05, cy-r*0.05, nR, 0, Math.PI*2);
    ctx.fillStyle   = 'rgba(160,130,200,0.55)';
    ctx.strokeStyle = 'rgba(180,150,220,0.70)';
    ctx.lineWidth   = 1.2;
    ctx.fill(); ctx.stroke();

    // nucleolus
    ctx.beginPath(); ctx.arc(cx+r*0.08, cy-r*0.08, nR*0.30, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(140,100,180,0.60)'; ctx.fill();

    // production glow (beat 2+)
    if (c.productionLevel > 0) {
      const pl = c.productionLevel;
      // green glow inside cell
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r*0.7);
      grd.addColorStop(0, `rgba(80,200,100,${pl*0.35})`);
      grd.addColorStop(1, `rgba(80,200,100,0)`);
      ctx.beginPath();
      for (let i=0;i<=n;i++) {
        const a=(i/n)*Math.PI*2;
        const blobR=r*(0.82+c.blobAngles[i%n]);
        i===0?ctx.moveTo(cx+Math.cos(a)*blobR,cy+Math.sin(a)*blobR*0.72)
             :ctx.lineTo(cx+Math.cos(a)*blobR,cy+Math.sin(a)*blobR*0.72);
      }
      ctx.closePath();
      ctx.fillStyle=grd; ctx.fill();

      // small internal green spots
      const nSpots = Math.floor(pl*5)+1;
      for (let i=0;i<nSpots;i++) {
        const sa = (i/nSpots)*Math.PI*2+c.phase;
        const sd = r*0.28*Math.random()+r*0.12;
        ctx.beginPath(); ctx.arc(cx+Math.cos(sa)*sd, cy+Math.sin(sa)*sd*0.7, 3.5+Math.random()*2.5, 0, Math.PI*2);
        ctx.fillStyle=`rgba(80,210,100,${pl*0.80})`; ctx.fill();
      }
    }

    ctx.restore();
  }

  // ---- DRAW: vector particle (colored triangle) ----
  function drawVector(v) {
    if (v.op < 0.01 || v.absorbed) return;
    ctx.save(); ctx.globalAlpha = v.op;
    const s = 7;
    ctx.translate(v.x, v.y);
    ctx.beginPath();
    ctx.moveTo(0,-s); ctx.lineTo(s*0.866,s*0.5); ctx.lineTo(-s*0.866,s*0.5);
    ctx.closePath();
    ctx.fillStyle   = v.col.fill;
    ctx.strokeStyle = v.col.stroke;
    ctx.lineWidth   = 0.8;
    ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  // ---- DRAW: virus particle (green circle with star) ----
  function drawVirus(v) {
    if (v.op < 0.01) return;
    ctx.save(); ctx.globalAlpha = v.op;
    // circle body
    ctx.beginPath(); ctx.arc(v.x, v.y, v.r, 0, Math.PI*2);
    ctx.fillStyle   = 'rgba(80,210,100,0.78)';
    ctx.strokeStyle = 'rgba(50,175,70,0.90)';
    ctx.lineWidth   = 1.2;
    ctx.fill(); ctx.stroke();
    // star inside
    ctx.fillStyle = 'rgba(255,255,255,0.80)';
    const pts = 5, ir = v.r*0.38, or = v.r*0.72;
    ctx.beginPath();
    for (let i=0;i<pts*2;i++) {
      const a = (i/pts)*Math.PI - Math.PI/2;
      const rr = i%2===0 ? or : ir;
      i===0?ctx.moveTo(v.x+Math.cos(a)*rr, v.y+Math.sin(a)*rr)
           :ctx.lineTo(v.x+Math.cos(a)*rr, v.y+Math.sin(a)*rr);
    }
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // ---- RENDER ----
  let releaseTimers = []; // per-cell virus release intervals

  function render(t) {
    if (!vhAnimating) return;
    onBeat(vhBeat);

    const beat = vhBeat;

    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='#0e0e0e'; ctx.fillRect(0,0,W,HEADER_H);

    // update + draw cells
    cells.forEach((c,ci) => {
      if (c.op <= 0) return;

      // gentle drift
      c.x += c.vx; c.y += c.vy;
      c.vx += (Math.random()-0.5)*0.004; c.vy += (Math.random()-0.5)*0.004;
      const spd = Math.sqrt(c.vx*c.vx+c.vy*c.vy);
      if (spd > 0.10) { c.vx*=0.10/spd; c.vy*=0.10/spd; }
      // soft boundary
      const mx=W*0.12, my=HEADER_H+40, mxr=W*0.88, myr=H-40;
      if(c.x<mx+c.r){c.vx+=0.02;} if(c.x>mxr-c.r){c.vx-=0.02;}
      if(c.y<my+c.r){c.vy+=0.02;} if(c.y>myr-c.r){c.vy-=0.02;}

      // production level rises in beat 2+
      if (beat >= 2) c.productionLevel = Math.min(1, c.productionLevel+0.004);

      // fading in beat 4+
      if (c.fading) c.op = Math.max(0, c.op - 0.008);

      drawHEK(c, t);
    });

    // update + draw vectors
    vectors.forEach(v => {
      if (v.absorbed) return;
      v.t = Math.min(1, v.t + 0.012);
      const ep = ease(v.t);
      v.x = lerp(v.x, v.tx, 0.04);
      v.y = lerp(v.y, v.ty, 0.04);
      if (v.t > 0.92) {
        v.absorbed = true;
        if (cells[v.cellIdx]) cells[v.cellIdx].vecProgress[v.vecIdx] = 1;
      }
      drawVector(v);
    });

    // virus release — spawned periodically in beat 3
    if (beat >= 3) {
      cells.forEach((c,ci) => {
        if (!c.releasing || c.op < 0.1) return;
        if (Math.random() < 0.025) { // ~1.5 per second at 60fps
          const a = Math.random()*Math.PI*2;
          const spawnR = c.r*0.9;
          viruses.push({
            x: c.x + Math.cos(a)*spawnR,
            y: c.y + Math.sin(a)*spawnR,
            vx: Math.cos(a)*(0.3+Math.random()*0.5),
            vy: Math.sin(a)*(0.3+Math.random()*0.5) - 0.15,
            r: 5+Math.random()*3,
            op: 0.1,
            collecting: false,
          });
        }
      });
    }

    // update + draw viruses
    viruses.forEach(v => {
      v.op = Math.min(1, v.op+0.025);
      if (v.collecting) {
        const dx=COL_X-v.x, dy=COL_Y-v.y;
        const d=Math.sqrt(dx*dx+dy*dy);
        if (d > COL_R*0.62) {
          const spd = Math.min(d*0.032, 2.8);
          v.x+=dx/d*spd; v.y+=dy/d*spd;
        } else {
          // orbit gently inside
          const idx = viruses.filter(vv=>vv.collecting).indexOf(v);
          const tot = viruses.filter(vv=>vv.collecting).length;
          const a = (idx/Math.max(1,tot))*Math.PI*2 + t*0.0004;
          v.x = lerp(v.x, COL_X+Math.cos(a)*COL_R*0.55, 0.06);
          v.y = lerp(v.y, COL_Y+Math.sin(a)*COL_R*0.55, 0.06);
        }
      } else {
        v.x+=v.vx; v.y+=v.vy;
        v.vx*=0.97; v.vy*=0.97;
        v.vy+=0.005; // slight gravity
      }
      drawVirus(v);
    });
    viruses = viruses.filter(v=>v.op>0);

    // collection circle (beat 5)
    if (beat >= 5) {
      colOp   = Math.min(1, colOp+0.018);
      colLabel= Math.min(1, colLabel+0.015);
      ctx.save(); ctx.globalAlpha=colOp*0.55;
      ctx.strokeStyle='rgba(80,210,100,0.72)'; ctx.lineWidth=2;
      ctx.setLineDash([5,4]);
      ctx.beginPath(); ctx.arc(COL_X,COL_Y,COL_R,0,Math.PI*2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      // label
      ctx.save(); ctx.globalAlpha=colLabel;
      ctx.font='bold 14px Raleway,sans-serif';
      ctx.fillStyle='rgba(80,210,100,0.90)';
      ctx.textAlign='center'; ctx.textBaseline='top';
      ctx.fillText('Viral Stock', COL_X, COL_Y+COL_R+10);
      ctx.restore();
    }

    ctx.fillStyle='#0e0e0e'; ctx.fillRect(0,0,W,HEADER_H);
    vhRAF = requestAnimationFrame(render);
  }

  scheduleBeat(0);
  vhRAF = requestAnimationFrame(render);
}