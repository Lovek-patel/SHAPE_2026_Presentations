// ============================================
// SLIDE 05 — iRGD MECHANISM ANIMATION
// Auto-plays beat by beat, holds on last beat
// ============================================

const IRGD_CONFIG = {
  beat0_duration: 3000,
  beat1_duration: 4000,
  beat2_duration: 4000,
  beat3_duration: 4000,
  beat4_duration: 5000,
  beat5_hold:     99999,
};

const IRGD_TEXTS = [
  "iRGD — a cyclic tumor-penetrating peptide.",
  "The RGD motif binds αvβ3 integrin\non tumor vasculature.",
  "Proteolytic cleavage between K and G\nexposes the CendR motif.",
  "The exposed motif\nbinds NRP1.",
  "Endocytosis transports the complex\ninto the cell.",
  "Drug delivery up to 40×\nmore efficient.",
];

let irgdAnimating = false;
let irgdRAF       = null;
let irgdBeat      = 0;
let irgdBeatStart = 0;

Reveal.on('slidechanged', function(event) {
  if (event.previousSlide && event.previousSlide.id === 'slide-irgd') {
    _resetIRGD();
  }
  if (event.currentSlide && event.currentSlide.id === 'slide-irgd' && !irgdAnimating) {
    irgdAnimating = true;
    irgdBeat = 0;
    setTimeout(startIRGDAnimation, 600);
  }
});

Reveal.on('ready', function() {
  const s = Reveal.getCurrentSlide();
  if (s && s.id === 'slide-irgd' && !irgdAnimating) {
    irgdAnimating = true;
    irgdBeat = 0;
    setTimeout(startIRGDAnimation, 600);
  }
});

function _resetIRGD() {
  irgdAnimating = false;
  irgdBeat = 0;
  if (irgdRAF) { cancelAnimationFrame(irgdRAF); irgdRAF = null; }
  const canvas = document.getElementById('irgd-canvas');
  if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  const txt = document.getElementById('irgd-text');
  if (txt) { txt.classList.remove('visible'); txt.textContent = ''; }
}

function startIRGDAnimation() {
  const canvas = document.getElementById('irgd-canvas');
  const textEl = document.getElementById('irgd-text');
  if (!canvas || !textEl) return;
  requestAnimationFrame(() => _startIRGDInner(canvas, textEl));
}

function _startIRGDInner(canvas, textEl) {
  const par = canvas.parentElement;
  const pw  = par.offsetWidth;
  const ph  = par.offsetHeight;
  canvas.width  = pw > 50 ? pw : 1100;
  canvas.height = ph > 50 ? ph : 520;
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext('2d');

  // FIX 1: membrane lower, more room above for iRGD
  const MEMBRANE_Y  = H * 0.62;
  const WALL_H      = H * 0.09;   // FIX 1: thinner wall so tails touch
  const INTEGRIN_X  = W * 0.36;
  const NRP1_X      = W * 0.60;

  const BEAT_DURATIONS = [
    IRGD_CONFIG.beat0_duration,
    IRGD_CONFIG.beat1_duration,
    IRGD_CONFIG.beat2_duration,
    IRGD_CONFIG.beat3_duration,
    IRGD_CONFIG.beat4_duration,
    IRGD_CONFIG.beat5_hold,
  ];

  let beatTimers = [];

  function showText(msg) {
    textEl.classList.remove('visible');
    setTimeout(() => {
      textEl.innerHTML = msg.replace(/\n/g, '<br>');
      textEl.classList.add('visible');
    }, 350);
  }

  function scheduleBeat(beat) {
    if (beat >= IRGD_TEXTS.length) return;
    showText(IRGD_TEXTS[beat]);
    irgdBeat = beat;
    irgdBeatStart = performance.now();
    if (beat < IRGD_TEXTS.length - 1) {
      const tid = setTimeout(() => scheduleBeat(beat + 1), BEAT_DURATIONS[beat]);
      beatTimers.push(tid);
    }
  }

  // ============================================
  // LIPID DATA — FIX 1: shorter tails so they just touch
  // ============================================
  const N_LIPIDS = 68;
  const TAIL_LEN = WALL_H * 0.85; // tails just reach center of wall

  const lipids = Array.from({length: N_LIPIDS}, (_, i) => ({
    x:       W * 0.01 + i * ((W * 0.98) / (N_LIPIDS - 1)),
    phase:   Math.random() * Math.PI * 2,
    tiltT1:  (Math.random() - 0.5) * 0.5,
    tiltT2:  (Math.random() - 0.5) * 0.5,
    tiltB1:  (Math.random() - 0.5) * 0.5,
    tiltB2:  (Math.random() - 0.5) * 0.5,
  }));

  // ============================================
  // BACKGROUND PROTEINS — more varied shapes
  // ============================================
  const bgProts = [
    { x: W*0.07,  phase: 0.4,  shape: 'Y',    h: 38, col: 'rgba(140,160,200,0.36)' },
    { x: W*0.16,  phase: 1.3,  shape: 'rod',  h: 32, col: 'rgba(160,130,190,0.30)' },
    { x: W*0.25,  phase: 2.1,  shape: 'club', h: 40, col: 'rgba(130,155,195,0.33)' },
    { x: W*0.50,  phase: 0.7,  shape: 'Y',    h: 34, col: 'rgba(150,140,185,0.28)' },
    { x: W*0.72,  phase: 2.8,  shape: 'rod',  h: 36, col: 'rgba(135,160,200,0.31)' },
    { x: W*0.82,  phase: 1.6,  shape: 'club', h: 32, col: 'rgba(155,130,180,0.28)' },
    { x: W*0.91,  phase: 3.3,  shape: 'rod',  h: 38, col: 'rgba(140,155,195,0.33)' },
  ];

  // helpers
  function ease(x) { return x<0.5?2*x*x:1-Math.pow(-2*x+2,2)/2; }
  function sm(x)   { x=Math.max(0,Math.min(1,x)); return x*x*(3-2*x); }
  function beatP()  {
    const dur = BEAT_DURATIONS[irgdBeat];
    return dur===99999 ? 0 : Math.min(1,(performance.now()-irgdBeatStart)/dur);
  }

  function squiggle(x, y, len, tilt, down, phase) {
    ctx.beginPath(); ctx.moveTo(x, y);
    const d = down ? 1 : -1;
    for (let i=1;i<=5;i++) {
      const yy = y + d*(len*i/5);
      const xx = x + Math.sin(i*1.2+phase)*3 + tilt*i*1.8;
      ctx.lineTo(xx,yy);
    }
    ctx.stroke();
  }

  // ============================================
  // VESSEL WALL + MEMBRANE
  // ============================================
  function drawVesselWall(t, invagP) {
    // cell interior
    const grad = ctx.createLinearGradient(0, MEMBRANE_Y, 0, H);
    grad.addColorStop(0, 'rgba(45,18,28,0.9)');
    grad.addColorStop(1, 'rgba(22,10,16,0.97)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, MEMBRANE_Y + WALL_H, W, H - MEMBRANE_Y - WALL_H);

    // FIX 5 wall color blends with phospholipid pink-rose
    const wallGrad = ctx.createLinearGradient(0, MEMBRANE_Y-WALL_H, 0, MEMBRANE_Y+WALL_H);
    wallGrad.addColorStop(0,   'rgba(210,120,145,0.18)');
    wallGrad.addColorStop(0.35,'rgba(225,135,158,0.28)');
    wallGrad.addColorStop(0.5, 'rgba(230,140,162,0.22)');
    wallGrad.addColorStop(0.65,'rgba(215,125,150,0.28)');
    wallGrad.addColorStop(1,   'rgba(200,110,135,0.18)');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, MEMBRANE_Y - WALL_H, W, WALL_H * 2);

    // lumen label
    ctx.font = '11px Raleway, sans-serif';
    ctx.fillStyle = 'rgba(240,220,230,0.32)';
    ctx.textAlign = 'left';
    ctx.fillText('Vessel lumen', 16, MEMBRANE_Y - WALL_H - 8);

    // outer leaflet (top of wall)
    drawLeaflet(t, MEMBRANE_Y - WALL_H + 6, true, invagP);
    // inner leaflet (bottom of wall)
    drawLeaflet(t, MEMBRANE_Y + WALL_H - 6, false, invagP);

    if (invagP > 0.05) drawInvagination(t, invagP);
  }

  function drawLeaflet(t, baseY, isOuter, invagP) {
    lipids.forEach(l => {
      const fl  = Math.sin(t*0.0017+l.phase)*2.5;
      const dx  = Math.sin(t*0.0009+l.phase)*3;
      const x   = l.x + dx;

      // deformation near NRP1
      const distN = (x - NRP1_X) / (W*0.09);
      const push  = invagP > 0 ? sm(invagP)*Math.exp(-distN*distN)*WALL_H*1.6 : 0;
      const y     = baseY + fl + (isOuter ? push*0.65 : push*0.35);

      ctx.lineWidth   = 1.4;
      ctx.strokeStyle = 'rgba(215,175,190,0.32)';

      if (isOuter) {
        // tails point inward (down)
        squiggle(x-2.5, y+6, TAIL_LEN, l.tiltT1, true,  l.phase);
        squiggle(x+2.5, y+6, TAIL_LEN, l.tiltT2, true,  l.phase+1.4);
        ctx.beginPath(); ctx.arc(x, y, 6.5, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(235,155,175,0.82)'; ctx.fill();
      } else {
        // tails point inward (up)
        squiggle(x-2.5, y-6, TAIL_LEN, l.tiltB1, false, l.phase+0.7);
        squiggle(x+2.5, y-6, TAIL_LEN, l.tiltB2, false, l.phase+2.1);
        ctx.beginPath(); ctx.arc(x, y, 6.5, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(215,135,155,0.72)'; ctx.fill();
      }
    });
  }

  function drawInvagination(t, invagP) {
    const p   = sm(invagP);
    const vR  = 24 + 38*p;
    const neck = MEMBRANE_Y + WALL_H + 2;
    const vCY = neck + vR*0.85 + 28*p;

    // outer ring of vesicle bilayer
    ctx.beginPath(); ctx.arc(NRP1_X, vCY, vR, 0, Math.PI*2);
    ctx.strokeStyle = `rgba(235,155,175,${0.65*p})`; ctx.lineWidth=9; ctx.stroke();
    // inner ring
    ctx.beginPath(); ctx.arc(NRP1_X, vCY, vR-13, 0, Math.PI*2);
    ctx.strokeStyle = `rgba(215,135,155,${0.42*p})`; ctx.lineWidth=5; ctx.stroke();

    // lipid head dots on vesicle
    const nDots = 20;
    for (let i=0;i<nDots;i++) {
      const a  = (i/nDots)*Math.PI*2 + t*0.0005;
      const hx = NRP1_X + Math.cos(a)*(vR+1);
      const hy = vCY    + Math.sin(a)*(vR+1);
      ctx.beginPath(); ctx.arc(hx,hy,4,0,Math.PI*2);
      ctx.fillStyle=`rgba(235,155,175,${0.72*p})`; ctx.fill();
    }

    // deep dip neck — no full pinch off
    const nw = 20*(1-p*0.7);
    ctx.beginPath();
    ctx.moveTo(NRP1_X-nw, neck);
    ctx.quadraticCurveTo(NRP1_X, neck+18+22*p, NRP1_X+nw, neck);
    ctx.strokeStyle=`rgba(14,14,14,${p*0.85})`; ctx.lineWidth=12; ctx.stroke();
  }

  // ============================================
  // BACKGROUND PROTEINS
  // ============================================
  function drawBGProts(t) {
    bgProts.forEach(p => {
      const ys = Math.sin(t*0.0013+p.phase)*3;
      const xs = Math.sin(t*0.0009+p.phase)*2;
      const x  = p.x+xs;
      const y  = MEMBRANE_Y+ys;
      ctx.strokeStyle=p.col; ctx.fillStyle=p.col;
      ctx.lineWidth=5; ctx.lineCap='round';

      if (p.shape==='Y') {
        ctx.beginPath(); ctx.moveTo(x,y+p.h*0.55); ctx.lineTo(x,y-p.h*0.15); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x,y-p.h*0.15); ctx.lineTo(x-11,y-p.h*0.65); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x,y-p.h*0.15); ctx.lineTo(x+11,y-p.h*0.65); ctx.stroke();
        ctx.beginPath(); ctx.arc(x-11,y-p.h*0.65-6,6,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(x+11,y-p.h*0.65-6,6,0,Math.PI*2); ctx.fill();
      } else if (p.shape==='rod') {
        ctx.beginPath(); ctx.moveTo(x,y+p.h*0.55); ctx.lineTo(x,y-p.h*0.55); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(x,y-p.h*0.55-7,7,9,0,0,Math.PI*2); ctx.fill();
      } else {
        ctx.beginPath(); ctx.moveTo(x,y+p.h*0.55); ctx.lineTo(x,y-p.h*0.25); ctx.stroke();
        ctx.beginPath(); ctx.arc(x,y-p.h*0.25-10,10,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(x-5,y-p.h*0.25-20,6,0,Math.PI*2); ctx.fill();
      }
    });
  }

  // ============================================
  // αvβ3 INTEGRIN — FIX 4: labels below membrane
  // ============================================
  function drawIntegrin(t, active) {
    const ys  = Math.sin(t*0.0014)*2;
    const y   = MEMBRANE_Y + ys;
    const col1 = active ? 'rgba(140,175,245,0.95)' : 'rgba(110,135,205,0.58)';
    const col2 = active ? 'rgba(175,125,220,0.95)' : 'rgba(145,110,190,0.58)';

    ctx.lineWidth=6.5; ctx.lineCap='round';

    // stalks — tall enough to be clearly above membrane
    ctx.strokeStyle=col1;
    ctx.beginPath(); ctx.moveTo(INTEGRIN_X-13,y+WALL_H+10); ctx.lineTo(INTEGRIN_X-16,y-WALL_H*1.4); ctx.stroke();
    ctx.strokeStyle=col2;
    ctx.beginPath(); ctx.moveTo(INTEGRIN_X+13,y+WALL_H+10); ctx.lineTo(INTEGRIN_X+10,y-WALL_H*1.4); ctx.stroke();

    // upper extracellular arms angling outward then curving in (V shape)
    ctx.strokeStyle=col1; ctx.lineWidth=5;
    ctx.beginPath(); ctx.moveTo(INTEGRIN_X-16,y-WALL_H*1.4); ctx.lineTo(INTEGRIN_X-22,y-WALL_H*2.6); ctx.stroke();
    ctx.strokeStyle=col2;
    ctx.beginPath(); ctx.moveTo(INTEGRIN_X+10,y-WALL_H*1.4); ctx.lineTo(INTEGRIN_X+18,y-WALL_H*2.6); ctx.stroke();

    // globular heads
    ctx.fillStyle=col1;
    ctx.beginPath(); ctx.arc(INTEGRIN_X-22,y-WALL_H*2.6-13,14,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=col2;
    ctx.beginPath(); ctx.arc(INTEGRIN_X+18,y-WALL_H*2.6-11,12,0,Math.PI*2); ctx.fill();

    // FIX 4: labels below membrane (not above), FIX 4: no binding circle
    ctx.font='12px Raleway, sans-serif'; ctx.textAlign='center';
    ctx.fillStyle='rgba(190,210,255,0.72)';
    ctx.fillText('αv', INTEGRIN_X-22, y+WALL_H+26);
    ctx.fillStyle='rgba(200,170,240,0.72)';
    ctx.fillText('β3', INTEGRIN_X+18, y+WALL_H+26);
  }

  // ============================================
  // NRP1 — labels already below membrane, keep fixed
  // ============================================
  function drawNRP1(t, active, yShift) {
    const ys  = Math.sin(t*0.0011+1.8)*2;
    const y   = MEMBRANE_Y + ys + yShift;
    const col = active ? 'rgba(245,195,90,0.95)' : 'rgba(185,150,70,0.58)';

    ctx.lineWidth=6.5; ctx.lineCap='round';
    ctx.strokeStyle=col;
    ctx.beginPath(); ctx.moveTo(NRP1_X,y+WALL_H+10); ctx.lineTo(NRP1_X,y-WALL_H*0.6); ctx.stroke();

    // b1 lobe
    ctx.fillStyle=col;
    ctx.beginPath(); ctx.ellipse(NRP1_X,y-WALL_H*0.6-14,10,15,0,0,Math.PI*2); ctx.fill();
    // b2 lobe
    ctx.beginPath(); ctx.ellipse(NRP1_X+5,y-WALL_H*0.6-38,12,16,0.25,0,Math.PI*2); ctx.fill();

    // glow when active
    if (active) {
      ctx.beginPath(); ctx.arc(NRP1_X+4,y-WALL_H*0.6-38,22,0,Math.PI*2);
      ctx.strokeStyle=`rgba(245,195,90,0.30)`; ctx.lineWidth=4; ctx.stroke();
    }

    // fixed label below membrane
    ctx.font='12px Raleway, sans-serif'; ctx.fillStyle='rgba(245,205,120,0.78)';
    ctx.textAlign='center';
    ctx.fillText('NRP1', NRP1_X, y+WALL_H+26);
  }

  // ============================================
  // iRGD PEPTIDE
  // sequence: C R G D K G P D C (9 residues)
  // FIX 2: rotated so Drug clears header
  // FIX 3: cleavage between K(4) and G(5), opens on cleavage
  // ============================================
  const AMINO   = ['C','R','G','D','K','G','P','D','C'];
  const N_AMINO = AMINO.length;
  const RING_R  = 42;
  // FIX 2: rotate ring ~75deg CCW so C(0) is bottom-left, drug goes down-left away from header
  const RING_ROT = -Math.PI * 0.42;

  function getRingPts(cx, cy, scale, openP) {
    return AMINO.map((aa, i) => {
      const baseA = (i/N_AMINO)*Math.PI*2 + RING_ROT;
      // ring positions
      const rx = Math.cos(baseA)*RING_R*scale;
      const ry = Math.sin(baseA)*RING_R*scale;

      // open after cleavage: K(4) and G(5) spread apart
      let ox=0, oy=0;
      if (openP > 0) {
        // split: residues 0-4 shift left, 5-8 shift right
        const side = i <= 4 ? -1 : 1;
        ox = side * openP * 18 * scale;
        oy = openP * 8 * scale;
      }

      return { aa, i, x: cx+rx+ox, y: cy+ry+oy };
    });
  }

  function drawPeptide(pts, beat, cleavP, scale, cx, cy) {
    // backbone — draw in two segments if cleaved
    ctx.strokeStyle='rgba(240,244,248,0.72)'; ctx.lineWidth=2;

    if (cleavP < 0.5) {
      // full ring
      ctx.beginPath();
      pts.forEach((p,i)=> i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
      ctx.closePath(); ctx.stroke();
    } else {
      // segment 1: C-R-G-D-K (0-4)
      ctx.beginPath();
      for (let i=0;i<=4;i++) i===0?ctx.moveTo(pts[i].x,pts[i].y):ctx.lineTo(pts[i].x,pts[i].y);
      ctx.stroke();
      // segment 2: G-P-D-C (5-8)
      ctx.beginPath();
      for (let i=5;i<=8;i++) i===5?ctx.moveTo(pts[i].x,pts[i].y):ctx.lineTo(pts[i].x,pts[i].y);
      ctx.stroke();
    }

    // FIX 3: cleavage dashed line between K(4) and G(5)
    if (cleavP > 0) {
      const k=pts[4], g=pts[5];
      ctx.strokeStyle=`rgba(255,230,80,${cleavP})`; ctx.lineWidth=2.5;
      ctx.setLineDash([5,5]);
      ctx.beginPath(); ctx.moveTo(k.x,k.y); ctx.lineTo(g.x,g.y);
      ctx.stroke(); ctx.setLineDash([]);
    }

    // amino acid circles
    pts.forEach((p,i) => {
      const isRGD   = i>=1&&i<=3;   // R G D
      const isCendR = i>=0&&i<=4;   // C R G D K

      let fill = 'rgba(185,60,55,0.92)';
      if (isRGD && beat<=1)    fill = 'rgba(255,225,80,0.96)';
      if (isCendR && beat>=2)  fill = 'rgba(70,205,175,0.96)';

      ctx.beginPath(); ctx.arc(p.x,p.y,11*scale,0,Math.PI*2);
      ctx.fillStyle=fill; ctx.fill();
      ctx.font=`${Math.round(10*scale)}px Raleway, sans-serif`;
      ctx.fillStyle='white'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(p.aa,p.x,p.y);
    });

    // drug payload on C(0) — FIX 2: line goes outward from ring center
    const c0  = pts[0];
    const ang = Math.atan2(c0.y-cy, c0.x-cx);
    const ex  = c0.x + Math.cos(ang)*44*scale;
    const ey  = c0.y + Math.sin(ang)*44*scale;
    ctx.strokeStyle='rgba(180,215,240,0.85)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(c0.x,c0.y); ctx.lineTo(ex,ey); ctx.stroke();

    ctx.save(); ctx.translate(ex,ey);
    ctx.beginPath(); ctx.ellipse(0,0,20*scale,13*scale,ang,0,Math.PI*2);
    ctx.fillStyle='rgba(70,130,185,0.88)'; ctx.strokeStyle='rgba(150,200,235,0.9)';
    ctx.lineWidth=1.5; ctx.fill(); ctx.stroke();
    ctx.font=`${Math.round(9*scale)}px Raleway, sans-serif`;
    ctx.fillStyle='white'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('Drug',0,0); ctx.restore();
  }

  // ============================================
  // RENDER LOOP
  // ============================================
  function render(t) {
    if (!irgdAnimating) return;
    ctx.clearRect(0,0,W,H);

    const beat  = irgdBeat;
    const bp    = beatP();
    const sp    = sm(bp);
    const ep    = ease(bp);

    // invagination: deepens during beat 4, full at beat 5
    const invagP = beat===4 ? sp : beat>=5 ? 1 : 0;
    // FIX 5: NRP1 moves down with membrane during invagination
    const nrp1Shift = invagP * WALL_H * 1.0;

    drawVesselWall(t, invagP);
    drawBGProts(t);
    drawIntegrin(t, beat>=1);
    drawNRP1(t, beat>=3, nrp1Shift);

    // ---- iRGD position ----
    let px, py, pscale;
    const cleavP = beat===2 ? sp : beat>=3 ? 1 : 0;
    const openP  = beat===2 ? sm(Math.max(0,(bp-0.4)/0.6)) : beat>=3 ? 1 : 0;

    // above membrane with room for header
    const baseY = MEMBRANE_Y - WALL_H - 90;

    if (beat===0) {
      // float in from left
      px = -60 + (W*0.40+60)*sm(bp);
      py = baseY; pscale=1.45;
    } else if (beat===1) {
      // drift to integrin
      px = W*0.40 + (INTEGRIN_X - W*0.40)*ep;
      py = baseY; pscale=1.45-sp*0.2;
    } else if (beat===2) {
      // at integrin, cleavage
      px=INTEGRIN_X; py=baseY; pscale=1.25;
    } else if (beat===3) {
      // migrate to NRP1
      px = INTEGRIN_X+(NRP1_X-INTEGRIN_X)*ep;
      py = baseY; pscale=1.2;
    } else if (beat===4) {
      // pulled into membrane — stays above phospholipid outer leaflet
      const topLeaflet = MEMBRANE_Y - WALL_H + 6;
      const endY = topLeaflet - 20 - RING_R*1.2*1.0; // just above outer leaflet
      px=NRP1_X; py=baseY+(endY-baseY)*sp; pscale=1.1;
    } else {
      // inside vesicle
      const vCY = MEMBRANE_Y+WALL_H+2 + (24+38)*0.85 + 28;
      px=NRP1_X+Math.sin(t*0.0015)*3;
      py=vCY+Math.cos(t*0.001)*3;
      pscale=0.85;
    }

    const pts = getRingPts(px, py, pscale, openP);
    drawPeptide(pts, beat, cleavP, pscale, px, py);

    irgdRAF = requestAnimationFrame(render);
  }

  scheduleBeat(0);
  irgdRAF = requestAnimationFrame(render);
} // end _startIRGDInner