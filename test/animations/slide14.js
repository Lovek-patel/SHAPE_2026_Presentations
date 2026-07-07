// ============================================
// SLIDE 14 — MURINE MODEL
// Layout:
//   Top zone: mice walking L↔R on a ground line
//   Middle zone: timeline with day markers + labels
//   Bottom zone: plasma vials accumulating
//   Bottom-right: day counter
//
// Beat sequence:
//   0 — 4 mice walking back and forth
//       text: "24 immunocompromised tumor-bearing mice."
//   1 — injection tag appears on one mouse, text
//       text: "Cells injected via tail vein."
//   2 — day counter runs -1→31, plasma vials collect
//       text: "Plasma collected at days −1 through 27."
//   3 — vials stored, counter holds at 31
//       text: "Day 31: sacrifice and organ collection."
//       organs appear
//   4 — holds for click
// ============================================

const MOUSE_CONFIG = {
  beat0_dur: 3000,
  beat1_dur: 3500,
  beat2_dur: 10000,
  beat3_dur: 4000,
  beat4_dur: 99999,
};

const MOUSE_TEXTS = [
  '24 immunocompromised tumor-bearing mice.',
  'Cells injected via tail vein.',
  'Plasma collected at days −1, 3, 7, 11, 15, 19, 23, 27.',
  'Day 31: sacrifice and organ collection.',
  '',
];

const DAY_EVENTS = [
  { day:-1,  label:'Day −1', col:'rgba(136,192,208,0.90)', plasma:true  },
  { day:3,   label:'Day 3',  col:'rgba(136,192,208,0.90)', plasma:true  },
  { day:7,   label:'Day 7',  col:'rgba(136,192,208,0.90)', plasma:true  },
  { day:11,  label:'Day 11', col:'rgba(136,192,208,0.90)', plasma:true  },
  { day:15,  label:'Day 15', col:'rgba(136,192,208,0.90)', plasma:true  },
  { day:19,  label:'Day 19', col:'rgba(136,192,208,0.90)', plasma:true  },
  { day:23,  label:'Day 23', col:'rgba(136,192,208,0.90)', plasma:true  },
  { day:27,  label:'Day 27', col:'rgba(136,192,208,0.90)', plasma:true  },
  { day:31,  label:'Day 31', col:'rgba(192,87,74,0.90)',   plasma:true },
];

let mouseAnimating  = false;
let mouseRAF        = null;
let mouseBeat       = 0;
let mouseBeatStart  = 0;
let mouseBeatTimers = [];
let mouseClickReady = false;

Reveal.on('slidechanged', function(event) {
  if (event.previousSlide && event.previousSlide.id === 'slide-mouse') _resetMouse();
  if (event.currentSlide  && event.currentSlide.id  === 'slide-mouse' && !mouseAnimating) {
    mouseAnimating = true; mouseBeat = 0; mouseClickReady = false;
    setTimeout(startMouseAnimation, 500);
  }
});
Reveal.on('ready', function() {
  const s = Reveal.getCurrentSlide();
  if (s && s.id === 'slide-mouse' && !mouseAnimating) {
    mouseAnimating = true; mouseBeat = 0; mouseClickReady = false;
    setTimeout(startMouseAnimation, 500);
  }
});
document.addEventListener('keydown', function(e) {
  if (!mouseClickReady) return;
  if (e.key !== 'ArrowRight' && e.key !== ' ' && e.key !== 'Enter') return;
  e.stopImmediatePropagation(); e.preventDefault();
  mouseClickReady = false; Reveal.next();
}, true);

function _resetMouse() {
  mouseAnimating = false; mouseBeat = 0; mouseClickReady = false;
  mouseBeatTimers.forEach(clearTimeout); mouseBeatTimers = [];
  if (mouseRAF) { cancelAnimationFrame(mouseRAF); mouseRAF = null; }
  const canvas = document.getElementById('mouse-canvas');
  if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  const txt = document.getElementById('mouse-text');
  if (txt) { txt.classList.remove('visible'); txt.textContent = ''; }
}

function startMouseAnimation() {
  const canvas = document.getElementById('mouse-canvas');
  const textEl = document.getElementById('mouse-text');
  if (!canvas) return;
  requestAnimationFrame(() => _startMouseInner(canvas, textEl));
}

function _startMouseInner(canvas, textEl) {
  const par = canvas.parentElement;
  canvas.width  = par.offsetWidth  > 50 ? par.offsetWidth  : 1100;
  canvas.height = par.offsetHeight > 50 ? par.offsetHeight : 520;
  const W = canvas.width, H = canvas.height;
  const ctx = canvas.getContext('2d');
  const HEADER_H = 90;

  // Layout zones
  const MOUSE_ZONE_Y  = HEADER_H + 20;         // top of mouse zone
  const MOUSE_ZONE_H  = (H - HEADER_H) * 0.30; // height of mouse area
  const GROUND_Y      = MOUSE_ZONE_Y + MOUSE_ZONE_H; // ground line
  const TIMELINE_Y    = GROUND_Y + 48;          // timeline dot row
  const VIAL_Y        = TIMELINE_Y + 72;        // plasma vials row
  const COUNTER_X     = W - 130;
  const COUNTER_Y     = H - 75;

  function sm(x)   { x=Math.max(0,Math.min(1,x)); return x*x*(3-2*x); }
  function ease(x) { return x<0.5?2*x*x:1-Math.pow(-2*x+2,2)/2; }
  function lerp(a,b,t){ return a+(b-a)*t; }
  function clamp(x,a,b){ return Math.max(a,Math.min(b,x)); }

  function showText(msg) {
    if (!textEl) return;
    textEl.classList.remove('visible');
    setTimeout(() => { textEl.innerHTML = msg; if (msg) textEl.classList.add('visible'); }, 300);
  }

  function scheduleBeat(b) {
    mouseBeat = b; mouseBeatStart = performance.now();
    if (MOUSE_TEXTS[b]) showText(MOUSE_TEXTS[b]);
    const dur = MOUSE_CONFIG['beat'+b+'_dur'];
    if (!dur || dur === 99999) { mouseClickReady = true; return; }
    mouseBeatTimers.push(setTimeout(() => { if (mouseAnimating) scheduleBeat(b+1); }, dur));
  }

  // ---- 4 mice walking back and forth ----
  const MOUSE_SCALE = 1.5; // bigger mice
  const miceData = [
    { x: W*0.12, dir:  1, speed: 0.55, phase: 0.0, tagVisible: false },
    { x: W*0.35, dir: -1, speed: 0.45, phase: 1.2, tagVisible: false },
    { x: W*0.58, dir:  1, speed: 0.60, phase: 0.6, tagVisible: false },
    { x: W*0.78, dir: -1, speed: 0.50, phase: 1.8, tagVisible: false },
  ];
  const MOUSE_LEFT  = W * 0.05;
  const MOUSE_RIGHT = W * 0.92;

  // Timeline markers
  let eventMarkers = DAY_EVENTS.map(() => 0); // opacity per event

  // Plasma vials
  let vials = []; // {x, y, op, day}

  // Organs
  let organs = [];

  // Current displayed day
  let currentDay = -2;

  // ---- DRAW: mouse (faces the direction it walks) ----
  // dir: 1=right, -1=left
  function drawMouse(x, y, dir, t, phase, tagged, scale) {
    const s = scale || 1;
    ctx.save();
    ctx.translate(x, y);
    if (dir > 0) ctx.scale(-1, 1); // nose points left by default, flip when going right

    // tail — slow wavy, behind body
    const tailWag = Math.sin(t*0.003 + phase) * 6 * s;
    ctx.strokeStyle = 'rgba(205,180,165,0.82)';
    ctx.lineWidth = 2 * s; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(26*s, 0);
    for (let i=1;i<=8;i++) {
      const tx2 = 26*s + i*7*s;
      // fused: tail emerges smoothly from body oval using quadratic
      const ty2 = Math.sin(i*0.6 + t*0.003 + phase) * tailWag * (i/8);
      ctx.lineTo(tx2, ty2);
    }
    ctx.stroke();

    // body — single smooth ellipse
    ctx.fillStyle = 'rgba(192,172,158,0.92)';
    ctx.strokeStyle = 'rgba(162,142,128,0.78)';
    ctx.lineWidth = 1.2 * s;
    ctx.beginPath(); ctx.ellipse(0, 0, 26*s, 13*s, 0, 0, Math.PI*2);
    ctx.fill(); ctx.stroke();

    // head — fused with body (overlapping ellipse same fill)
    ctx.fillStyle = 'rgba(192,172,158,0.92)';
    ctx.strokeStyle = 'rgba(162,142,128,0.78)';
    ctx.lineWidth = 1.2 * s;
    ctx.beginPath(); ctx.ellipse(-26*s, 2*s, 13*s, 11*s, 0.08, 0, Math.PI*2);
    ctx.fill(); ctx.stroke();

    // ear
    ctx.beginPath(); ctx.ellipse(-32*s, -9*s, 5.5*s, 4.5*s, 0.3, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(218,172,172,0.78)'; ctx.fill();

    // eye
    ctx.beginPath(); ctx.arc(-31*s, -1.5*s, 2.2*s, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(38,18,18,0.90)'; ctx.fill();
    ctx.beginPath(); ctx.arc(-30.5*s, -2*s, 0.7*s, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.fill();

    // nose
    ctx.beginPath(); ctx.arc(-38*s, 4*s, 1.8*s, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(218,138,138,0.85)'; ctx.fill();

    // legs — walking cycle
    const legCycle = t * 0.010 + phase;
    const legPositions = [[-14*s, 11*s], [-4*s, 11*s], [8*s, 11*s], [18*s, 11*s]];
    legPositions.forEach(([lx,ly], i) => {
      const swing = Math.sin(legCycle + i * 1.2) * 5 * s;
      ctx.strokeStyle = 'rgba(175,150,135,0.78)';
      ctx.lineWidth = 2.5 * s; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + swing*0.4, ly + 7*s); ctx.stroke();
    });

    // injection tag (green triangle ear-tag)
    if (tagged) {
      const ts = 5 * s;
      ctx.fillStyle = 'rgba(80,210,100,0.95)';
      ctx.strokeStyle = 'rgba(40,165,60,0.95)'; ctx.lineWidth = 0.6*s;
      ctx.beginPath();
      ctx.moveTo(-33*s, -16*s);
      ctx.lineTo(-33*s - ts, -16*s + ts*1.6);
      ctx.lineTo(-33*s + ts, -16*s + ts*1.6);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
    }

    ctx.restore();
  }

  // ---- DRAW: plasma vial (bigger) ----
  function drawVial(x, y, op) {
    if (op < 0.01) return;
    ctx.save(); ctx.globalAlpha = op;
    const vW = 14, vH = 26;
    ctx.fillStyle = 'rgba(210,228,242,0.72)';
    ctx.strokeStyle = 'rgba(165,195,222,0.82)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.roundRect(x-vW/2, y-vH, vW, vH, 2); ctx.fill(); ctx.stroke();
    // plasma liquid (amber)
    ctx.fillStyle = 'rgba(222,188,100,0.68)';
    ctx.beginPath(); ctx.roundRect(x-vW/2+2, y-10, vW-4, 9, 1); ctx.fill();
    // cap
    ctx.fillStyle = 'rgba(136,192,208,0.88)';
    ctx.beginPath(); ctx.roundRect(x-vW/2, y-vH-6, vW, 7, 2); ctx.fill();
    ctx.restore();
  }

  // ---- DRAW: timeline ----
  function drawTimeline() {
    const tx = W * 0.06, tw = W * 0.86;
    // background bar
    ctx.strokeStyle = 'rgba(60,72,88,0.55)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(tx, TIMELINE_Y); ctx.lineTo(tx+tw, TIMELINE_Y); ctx.stroke();

    const total = 32; // day -1 to 31 = 32 units
    DAY_EVENTS.forEach((ev, i) => {
      const op = eventMarkers[i];
      if (op < 0.01) return;
      const px = tx + ((ev.day + 1) / total) * tw;
      ctx.save(); ctx.globalAlpha = op;
      // dot
      ctx.beginPath(); ctx.arc(px, TIMELINE_Y, 6, 0, Math.PI*2);
      ctx.fillStyle = ev.col; ctx.fill();
      // label above
      ctx.font = 'bold 12px Raleway,sans-serif';
      ctx.fillStyle = 'rgba(200,215,230,0.88)';
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(ev.label, px, TIMELINE_Y - 10);
      ctx.restore();
    });
  }

  // ---- DRAW: day counter ----
  function drawCounter(day) {
    const d = Math.round(clamp(day, -1, 31));
    ctx.save();
    const bw = 108, bh = 50;
    const bx = COUNTER_X, by = COUNTER_Y;
    ctx.fillStyle = 'rgba(16,18,26,0.88)';
    ctx.strokeStyle = 'rgba(136,192,208,0.52)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 5); ctx.fill(); ctx.stroke();
    ctx.font = '12px Raleway,sans-serif';
    ctx.fillStyle = 'rgba(136,192,208,0.72)';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('Day', bx+bw/2, by+6);
    ctx.font = 'bold 26px Raleway,sans-serif';
    ctx.fillStyle = d === 31 ? 'rgba(192,87,74,0.96)' : 'rgba(136,192,208,0.96)';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText((d<0?'−':'')+Math.abs(d), bx+bw/2, by+bh*0.65);
    ctx.restore();
  }

  // ---- DRAW: organ ----
  function drawOrgan(x, y, rX, rY, col, label, op) {
    if (op < 0.01) return;
    ctx.save(); ctx.globalAlpha = op;
    ctx.fillStyle = col; ctx.strokeStyle = 'rgba(255,255,255,0.20)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(x, y, rX, rY, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.font = 'bold 12px Raleway,sans-serif';
    ctx.fillStyle = 'rgba(240,244,248,0.82)';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(label, x, y+rY+5);
    ctx.restore();
  }

  // ---- beat dispatch ----
  let _lastBeat = -1;
  function onBeat(b) {
    if (b === _lastBeat) return; _lastBeat = b;

    if (b === 1) {
      // tag mouse 0
      mouseBeatTimers.push(setTimeout(() => {
        miceData[0].tagVisible = true;
        miceData[1].tagVisible = true;
        miceData[2].tagVisible = true;
      }, 800));
    }

    if (b === 2) {
      const daySeq = [-1, 3, 7, 11, 15, 19, 23, 27, 31];
      const times  = [0, 900, 1800, 2800, 3800, 4800, 5800, 6800, 8200];
      daySeq.forEach((day, i) => {
        mouseBeatTimers.push(setTimeout(() => {
          if (!mouseAnimating) return;
          currentDay = day;
          eventMarkers[i] = 1;
          if (DAY_EVENTS[i].plasma) {
            vials.push({ x: W*0.06 + vials.length*36, y: VIAL_Y, op: 0 });
          }
        }, times[i]));
      });
    }

    if (b === 3) {
      const organData = [
        { x:W*0.15, rX:18, rY:14, col:'rgba(200,78,78,0.78)',   label:'Heart'  },
        { x:W*0.28, rX:24, rY:16, col:'rgba(158,88,58,0.78)',   label:'Liver'  },
        { x:W*0.41, rX:16, rY:13, col:'rgba(175,128,88,0.78)',  label:'Kidney' },
        { x:W*0.54, rX:15, rY:12, col:'rgba(205,198,178,0.78)', label:'Brain'  },
        { x:W*0.67, rX:17, rY:13, col:'rgba(138,78,118,0.78)',  label:'Tumor'  },
      ];
      organData.forEach((o, i) => {
        mouseBeatTimers.push(setTimeout(() => {
          organs.push({ ...o, y: VIAL_Y + 30, op: 0 });
        }, i*320));
      });
    }
  }

  // ---- RENDER ----
  function render(t) {
    if (!mouseAnimating) return;
    onBeat(mouseBeat);
    const beat = mouseBeat;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0e0e0e'; ctx.fillRect(0, 0, W, HEADER_H);

    // ground line for mice
    ctx.strokeStyle = 'rgba(55,65,80,0.55)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(W*0.02, GROUND_Y); ctx.lineTo(W*0.98, GROUND_Y); ctx.stroke();

    // update + draw mice
    miceData.forEach((m, mi) => {
      // move
      m.x += m.dir * m.speed;
      if (m.x > MOUSE_RIGHT) { m.dir = -1; }
      if (m.x < MOUSE_LEFT)  { m.dir =  1; }
      // slight bounce
      const bounceY = GROUND_Y - 5 - 15 + Math.abs(Math.sin(t*0.010 + m.phase)) * 4;
      drawMouse(m.x, bounceY, m.dir, t, m.phase, m.tagVisible, MOUSE_SCALE);
    });

    // timeline (beat 2+)
    if (beat >= 2) {
      drawTimeline();
      drawCounter(currentDay);
    }

    // vials
    vials.forEach(v => {
      v.op = Math.min(1, v.op + 0.03);
      drawVial(v.x, v.y, v.op);
    });

    // organs (beat 3+)
    organs.forEach(o => {
      o.op = Math.min(1, o.op + 0.018);
      drawOrgan(o.x, o.y, o.rX, o.rY, o.col, o.label, o.op);
    });

    ctx.fillStyle = '#0e0e0e'; ctx.fillRect(0, 0, W, HEADER_H);
    mouseRAF = requestAnimationFrame(render);
  }

  scheduleBeat(0);
  mouseRAF = requestAnimationFrame(render);
}