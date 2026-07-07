// ============================================
// SLIDE 03 — CHEMOTHERAPY ANIMATION
// ============================================

const CHEMO_CONFIG = {
  beat0_duration:    3000,
  beat1_duration:    5000,
  beat2_duration:    5000,
  beat3_duration:    4000,
  beat4_duration:    5000,

  spawn_normal:      70,
  spawn_heavy:       24,
  speed_min:         2.0,
  speed_max:         3.6,

  blue_kill_normal:  0.50,
  red_kill_normal:   0.50,
  blue_kill_heavy:   0.85,
  red_kill_heavy:    0.65,
  red_min_survive:   0.30,

  div_interval:      1100,
};

const CHEMO_BEATS = [
  { text: "So we fight back.",                                         duration: CHEMO_CONFIG.beat0_duration },
  { text: "Chemotherapy —\na cocktail designed\nto kill dividing cells.", duration: CHEMO_CONFIG.beat1_duration },
  { text: "It works.\nSome cancer cells die.",                          duration: CHEMO_CONFIG.beat2_duration },
  { text: "We could increase the dose.\nMore cancer dies.",             duration: CHEMO_CONFIG.beat3_duration },
  { text: "But so does everything else.\nThis isn't precise enough.",   duration: CHEMO_CONFIG.beat4_duration },
  { text: "There has to be\nanother way.",                              duration: 99999 },
];

let chemoAnimating = false;
let chemoRAF       = null;

Reveal.on('slidechanged', function(event) {
  if (event.previousSlide && event.previousSlide.id === 'slide-chemo') {
    _resetChemo();
  }
  if (event.currentSlide && event.currentSlide.id === 'slide-chemo' && !chemoAnimating) {
    chemoAnimating = true;
    setTimeout(startChemoAnimation, 600);
  }
});

Reveal.on('ready', function() {
  const s = Reveal.getCurrentSlide();
  if (s && s.id === 'slide-chemo' && !chemoAnimating) {
    chemoAnimating = true;
    setTimeout(startChemoAnimation, 600);
  }
});

function _resetChemo() {
  chemoAnimating = false;
  if (chemoRAF) { cancelAnimationFrame(chemoRAF); chemoRAF = null; }
  const canvas = document.getElementById('chemo-canvas');
  if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  const txt = document.getElementById('chemo-text');
  if (txt) { txt.classList.remove('visible'); txt.textContent = ''; }
}

function startChemoAnimation() {
  const canvas = document.getElementById('chemo-canvas');
  const textEl = document.getElementById('chemo-text');
  if (!canvas || !textEl) return;
  requestAnimationFrame(() => _startChemoInner(canvas, textEl));
}

function _startChemoInner(canvas, textEl) {
  const parent = canvas.parentElement;
  const pw = parent.offsetWidth;
  const ph = parent.offsetHeight;
  canvas.width  = pw > 50 ? pw : 1100;
  canvas.height = ph > 50 ? ph : 520;
  const W   = canvas.width;
  const H   = canvas.height;
  const ctx = canvas.getContext('2d');

  const TCX      = W * 0.44;
  const TCY      = H * 0.52;
  const HEADER_H = 90;
  const TEXT_ZONE = { x: W - 340, y: HEADER_H, w: 300, h: 160 };

  // side-weighting so particles learn which sides hit red cells
  const sideWeights = { top: 1, right: 1, bottom: 1, left: 1 };

  function chooseSide() {
    const total = sideWeights.top + sideWeights.right + sideWeights.bottom + sideWeights.left;
    let r = Math.random() * total;
    for (const side of ['top', 'right', 'bottom', 'left']) {
      r -= sideWeights[side];
      if (r <= 0) return side;
    }
    return 'right';
  }

  function rewardSide(winningSide) {
    if (!winningSide || !sideWeights[winningSide]) return;
    for (const side of ['top', 'right', 'bottom', 'left']) {
      if (side === winningSide) continue;
      const transfer = sideWeights[side] * 0.33;
      sideWeights[side] -= transfer;
      sideWeights[winningSide] += transfer;
    }
  }

  // ============================================
  // CELL
  // ============================================
  class Cell {
    constructor(x, y, radius, isEvil) {
      this.x          = x;
      this.y          = y;
      this.homeX      = x;
      this.homeY      = y;
      this.baseR      = radius;
      this.isEvil     = isEvil;
      this.dead       = false;
      this.opacity    = 0;
      this.dividing   = false;
      this.divProg    = 0;
      this.flashRed   = 0;
      this.rx         = radius * (0.82 + Math.random() * 0.55);
      this.ry         = radius * (0.70 + Math.random() * 0.55);
      this.angle      = Math.random() * Math.PI;
      this.dAngle     = (Math.random() - 0.5) * 0.003;
      this.nxOff      = (Math.random() - 0.5) * radius * 0.35;
      this.nyOff      = (Math.random() - 0.5) * radius * 0.35;
      this.nR         = radius * (0.26 + Math.random() * 0.12);
      this.phase      = Math.random() * Math.PI * 2;
      this.wobblePhase = Math.random() * Math.PI * 2;
    }

    cellColor(a)    { return this.isEvil ? `rgba(185,60,55,${a})`  : `rgba(74,127,165,${a})`; }
    nucleusColor(a) { return this.isEvil ? `rgba(110,25,25,${a})`  : `rgba(35,75,115,${a})`;  }

    update(t) {
      if (this.opacity < 1 && !this.dead) this.opacity = Math.min(1, this.opacity + 0.025);
      if (this.dead) { this.opacity = Math.max(0, this.opacity - 0.012); return; }

      // all cells wobble around their home position
      this.x = this.homeX + Math.sin(t * 0.001 + this.wobblePhase) * 1.2;
      this.y = this.homeY + Math.cos(t * 0.0013 + this.wobblePhase) * 1.2;

      this.angle += this.dAngle;
      const pulse = Math.sin(t * 0.001 + this.phase) * 0.04;
      this.rx = this.baseR * (0.85 + pulse);
      this.ry = this.baseR * (0.75 - pulse * 0.5);
      if (this.dividing) this.divProg = Math.min(1, this.divProg + 0.012);
      if (this.flashRed > 0) this.flashRed = Math.max(0, this.flashRed - 0.08);
    }

    draw(ctx) {
      if (this.opacity <= 0.01) return;
      ctx.save();
      ctx.translate(this.x, this.y);
      let sx = 1, sy = 1;
      if (this.dividing && this.divProg < 1) { sx = 1+this.divProg*0.25; sy = 1-this.divProg*0.35; }
      ctx.scale(sx, sy);
      ctx.rotate(this.angle);
      ctx.beginPath();
      ctx.ellipse(0, 0, this.rx, this.ry, 0, 0, Math.PI*2);
      if (this.flashRed > 0) {
        ctx.fillStyle   = `rgba(155,111,168,${this.flashRed*this.opacity})`;
        ctx.strokeStyle = `rgba(155,111,168,${this.flashRed*this.opacity})`;
      } else {
        ctx.fillStyle   = this.cellColor(this.opacity*0.5);
        ctx.strokeStyle = this.cellColor(this.opacity*0.9);
      }
      ctx.lineWidth = 1.3; ctx.fill(); ctx.stroke();
      if (this.flashRed < 0.5) {
        ctx.beginPath();
        ctx.ellipse(this.nxOff, this.nyOff, this.nR*0.85, this.nR, this.angle*0.4, 0, Math.PI*2);
        ctx.fillStyle = this.nucleusColor(this.opacity*0.75);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // ============================================
  // CHEMO PARTICLE — purple triangle
  // ============================================
  class ChemoParticle {
    constructor() {
      this.side = chooseSide();
      const margin = 45;
      if      (this.side === 'right')  { this.x = W+margin; this.y = Math.random()*H; }
      else if (this.side === 'left')   { this.x = -margin;  this.y = Math.random()*H; }
      else if (this.side === 'top')    { this.x = Math.random()*W; this.y = -margin; }
      else                             { this.x = Math.random()*W; this.y = H+margin; }

      const redCells = cells.filter(c => !c.dead && c.isEvil);
      const target = redCells.length
        ? redCells[Math.floor(Math.random()*redCells.length)]
        : { x: TCX, y: TCY };

      const baseAngle = Math.atan2(target.y - this.y, target.x - this.x);
      const angle = baseAngle + (Math.random()-0.5)*0.9;
      const speed = CHEMO_CONFIG.speed_min + Math.random()*(CHEMO_CONFIG.speed_max - CHEMO_CONFIG.speed_min);
      this.vx      = Math.cos(angle)*speed;
      this.vy      = Math.sin(angle)*speed;
      this.size    = 3 + Math.random()*4;
      this.angle   = Math.random()*Math.PI*2;
      this.spin    = (Math.random()-0.5)*0.08;
      this.opacity = 0.7 + Math.random()*0.3;
      this.dead    = false;
    }

    update() {
      if (this.dead) return;
      this.x += this.vx; this.y += this.vy; this.angle += this.spin;
    }

    draw(ctx) {
      if (this.dead || this.opacity <= 0) return;
      ctx.save();
      ctx.translate(this.x, this.y); ctx.rotate(this.angle);
      ctx.beginPath();
      ctx.moveTo(0, -this.size);
      ctx.lineTo(this.size*0.866, this.size*0.5);
      ctx.lineTo(-this.size*0.866, this.size*0.5);
      ctx.closePath();
      ctx.fillStyle   = `rgba(155,111,168,${this.opacity})`;
      ctx.strokeStyle = `rgba(200,160,215,${this.opacity*0.6})`;
      ctx.lineWidth = 0.8; ctx.fill(); ctx.stroke();
      ctx.restore();
    }
  }

  // ============================================
  // POP BURST
  // ============================================
  class PopBurst {
    constructor(x, y) {
      this.particles = Array.from({length:8}, () => {
        const a = Math.random()*Math.PI*2, s = 1.5+Math.random()*3;
        return {x, y, vx:Math.cos(a)*s, vy:Math.sin(a)*s, opacity:1, r:2+Math.random()*3};
      });
    }
    update() {
      this.particles.forEach(p => {
        p.x+=p.vx; p.y+=p.vy; p.vx*=0.92; p.vy*=0.92;
        p.opacity = Math.max(0, p.opacity-0.045);
      });
    }
    done() { return this.particles.every(p => p.opacity <= 0); }
    draw(ctx) {
      this.particles.forEach(p => {
        if (p.opacity <= 0) return;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(155,111,168,${p.opacity})`; ctx.fill();
      });
    }
  }

  // ============================================
  // STATE
  // ============================================
  let cells=[], chemo=[], pops=[];
  let beat=-1, beatTimers=[];
  let spawnTimer=null, divTimer=null;
  let heavyDose=false;

  // seed from slide 2 snapshot
  const snap = window.tumorSnapshot || [];
  if (snap.length > 0) {
    snap.forEach(s => {
      const c = new Cell(s.x, s.y, s.r, s.isEvil);
      c.opacity = 1;
      cells.push(c);
    });
  } else {
    for (let i=0; i<12; i++) {
      const a=Math.random()*Math.PI*2, d=60+Math.random()*180;
      cells.push(new Cell(TCX+Math.cos(a)*d, TCY+Math.sin(a)*d, 20+Math.random()*10, false));
    }
    for (let i=0; i<20; i++) {
      const a=Math.random()*Math.PI*2, d=Math.random()*W*0.16;
      cells.push(new Cell(TCX+Math.cos(a)*d, TCY+Math.sin(a)*d, 18+Math.random()*8, true));
    }
  }

  // ============================================
  // HELPERS
  // ============================================
  function showText(msg) {
    textEl.classList.remove('visible');
    setTimeout(() => {
      textEl.innerHTML = msg.replace(/\n/g,'<br>');
      textEl.classList.add('visible');
    }, 400);
  }

  function spawnChild(parent) {
    if (!parent||parent.dead) return;
    parent.dividing=true; parent.divProg=0;
    setTimeout(() => {
      if (!chemoAnimating) return;
      const angle = Math.random()*Math.PI*2;
      const dist  = parent.baseR*1.9;
      const child = new Cell(
        parent.homeX+Math.cos(angle)*dist,
        parent.homeY+Math.sin(angle)*dist,
        parent.baseR*(0.85+Math.random()*0.2),
        parent.isEvil
      );
      child.opacity = 0.6;
      cells.push(child);
      parent.dividing=false; parent.divProg=0;
    }, 700);
  }

  function checkHits(heavy) {
    const blueKill   = heavy ? CHEMO_CONFIG.blue_kill_heavy   : CHEMO_CONFIG.blue_kill_normal;
    const redKill    = heavy ? CHEMO_CONFIG.red_kill_heavy    : CHEMO_CONFIG.red_kill_normal;
    const redAlive   = cells.filter(c=>!c.dead&&c.isEvil).length;
    const redTotal   = cells.filter(c=>c.isEvil).length;
    const redMinAlive = Math.ceil(redTotal*CHEMO_CONFIG.red_min_survive);

    chemo.forEach(p => {
      if (p.dead) return;
      cells.forEach(c => {
        if (c.dead||p.dead) return;
        const dist = Math.hypot(p.x-c.x, p.y-c.y);
        if (dist < c.baseR*0.9) {
          p.dead = true; c.flashRed = 0.8;
          if (c.isEvil) rewardSide(p.side);
          const killChance = c.isEvil ? redKill : blueKill;
          if (Math.random() < killChance) {
            if (c.isEvil && redAlive <= redMinAlive) return;
            c.dead = true; pops.push(new PopBurst(c.x, c.y));
          }
        }
      });
    });
  }

  function startDiv() {
    divTimer = setInterval(() => {
      if (!chemoAnimating){clearInterval(divTimer);return;}
      const alive = cells.filter(c=>!c.dead);
      if (alive.length>0 && alive.length<80) spawnChild(alive[Math.floor(Math.random()*alive.length)]);
    }, CHEMO_CONFIG.div_interval);
  }

  function startSpawn(heavy) {
    if (spawnTimer) clearInterval(spawnTimer);
    spawnTimer = setInterval(() => {
      if (!chemoAnimating){clearInterval(spawnTimer);return;}
      chemo.push(new ChemoParticle());
    }, heavy ? CHEMO_CONFIG.spawn_heavy : CHEMO_CONFIG.spawn_normal);
  }

  // ============================================
  // BEAT SEQUENCER
  // ============================================
  function nextBeat() {
    beat++;
    if (beat >= CHEMO_BEATS.length) return;
    showText(CHEMO_BEATS[beat].text);

    if (beat===0) startDiv();
    if (beat===1) startSpawn(false);
    if (beat===3) { heavyDose=true; startSpawn(true); }

    if (beat===5) {
      if (spawnTimer){clearInterval(spawnTimer);spawnTimer=null;}
      if (divTimer){clearInterval(divTimer);divTimer=null;}
      chemo.forEach(p=>{p.dead=true;});
      // hold — wait for click
      return;
    }

    if (beat < CHEMO_BEATS.length-1) {
      beatTimers.push(setTimeout(nextBeat, CHEMO_BEATS[beat].duration));
    }
  }

  // ============================================
  // RENDER
  // ============================================
  function render(t) {
    if (!chemoAnimating) return;
    ctx.clearRect(0,0,W,H);

    // header black bar
    ctx.fillStyle='#0e0e0e';
    ctx.fillRect(0,0,W,HEADER_H);

    // blue under red
    cells.filter(c=>!c.isEvil).forEach(c=>{c.update(t);c.draw(ctx);});
    cells.filter(c=> c.isEvil).forEach(c=>{c.update(t);c.draw(ctx);});
    chemo.forEach(p=>{p.update();p.draw(ctx);});
    checkHits(heavyDose);
    pops.forEach(p=>{p.update();p.draw(ctx);});

    // redraw header on top
    ctx.fillStyle='#0e0e0e';
    ctx.fillRect(0,0,W,HEADER_H);

    cells = cells.filter(c=>!(c.dead&&c.opacity<=0));
    chemo = chemo.filter(p=>!p.dead&&p.y<H+90&&p.y>-90&&p.x>-90&&p.x<W+90);
    pops  = pops.filter(p=>!p.done());

    chemoRAF = requestAnimationFrame(render);
  }

  chemoRAF = requestAnimationFrame(render);
  setTimeout(nextBeat, 300);
} // end _startChemoInner