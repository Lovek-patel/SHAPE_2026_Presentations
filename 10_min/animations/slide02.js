// ============================================
// SLIDE 02 — TUMOR GROWTH ANIMATION
// ============================================

window.tumorSnapshot = [];

const TUMOR_CONFIG = {
  beat0_duration:     3000,
  beat1_duration:     5000,
  beat2_duration:     5000,
  beat3_duration:     6000,
  beat4_duration:     9000,
  beat5_duration:     3000,
  beat6_leuko_enter:  500,
  beat6_leuko_circle: 500,
  beat7_hold:         3000,

  mutation_delay:     700,
  leuko_speed:        3.5,
  evil_div_interval:  150,
  evil_div_max:       75,
  blue_div_interval:  200,
  final_burst_count:  50,
};

const TUMOR_BEATS = [
  { text: "It starts with a single cell.",         duration: TUMOR_CONFIG.beat0_duration },
  { text: "Some divide.\nSome die.\nBalance.",      duration: TUMOR_CONFIG.beat1_duration },
  { text: "The body recognizes it.\nIt fights back.", duration: TUMOR_CONFIG.beat2_duration },
  { text: "But sometimes one escapes.",             duration: TUMOR_CONFIG.beat3_duration },
  { text: "It doesn't stop dividing.",              duration: TUMOR_CONFIG.beat4_duration },
  { text: "Cells gather and form\na solid tumor.",  duration: TUMOR_CONFIG.beat5_duration },
  { text: "The body can no longer help.",           duration: 3000 },
  { text: "So what can we do?",                     duration: TUMOR_CONFIG.beat7_hold },
];

let tumorAnimating = false;
let tumorRAF       = null;

Reveal.on('slidechanged', function(event) {
  if (event.previousSlide && event.previousSlide.id === 'slide-tumor') {
    _resetTumor();
  }
  if (event.currentSlide && event.currentSlide.id === 'slide-tumor' && !tumorAnimating) {
    tumorAnimating = true;
    setTimeout(startTumorAnimation, 600);
  }
});

Reveal.on('ready', function() {
  const s = Reveal.getCurrentSlide();
  if (s && s.id === 'slide-tumor' && !tumorAnimating) {
    tumorAnimating = true;
    setTimeout(startTumorAnimation, 600);
  }
});

function _resetTumor() {
  tumorAnimating = false;
  if (tumorRAF) { cancelAnimationFrame(tumorRAF); tumorRAF = null; }
  const canvas = document.getElementById('tumor-canvas');
  if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  const txt = document.getElementById('tumor-text');
  if (txt) { txt.classList.remove('visible'); txt.textContent = ''; }
}

function startTumorAnimation() {
  const canvas = document.getElementById('tumor-canvas');
  const textEl = document.getElementById('tumor-text');
  if (!canvas || !textEl) return;
  requestAnimationFrame(() => _startTumorInner(canvas, textEl));
}

function _startTumorInner(canvas, textEl) {
  const slide = canvas.parentElement;
  const pw = slide.offsetWidth;
  const ph = slide.offsetHeight;
  canvas.width  = pw > 50 ? pw : 1100;
  canvas.height = ph > 50 ? ph : 520;
  const W   = canvas.width;
  const H   = canvas.height;
  const ctx = canvas.getContext('2d');

  const TCX     = W * 0.44;
  const TCY     = H * 0.52;
  const TUMOR_R = Math.min(W, H) * 0.18;
  const HEADER_H = 90;
  const TEXT_ZONE = { x: W - 340, y: H - 160, w: 300, h: 140 };

  // ============================================
  // CELL
  // ============================================
  class Cell {
    constructor(x, y, radius, isEvil, pinned) {
      this.x           = x;
      this.y           = y;
      this.baseR       = radius;
      this.isEvil      = isEvil;
      this.pinned      = pinned || false;
      this.dead        = false;
      this.opacity     = 0;
      this.dividing    = false;
      this.divProg     = 0;
      this.flashWhite  = 0;
      this.rx          = radius * (0.82 + Math.random() * 0.55);
      this.ry          = radius * (0.70 + Math.random() * 0.55);
      this.angle       = Math.random() * Math.PI;
      this.nxOff       = (Math.random() - 0.5) * radius * 0.35;
      this.nyOff       = (Math.random() - 0.5) * radius * 0.35;
      this.nR          = radius * (0.26 + Math.random() * 0.12);
      this.vx          = (Math.random() - 0.5) * 0.12;
      this.vy          = (Math.random() - 0.5) * 0.12;
      this.dAngle      = (Math.random() - 0.5) * 0.003;
      this.phase       = Math.random() * Math.PI * 2;
      this.wobblePhase = Math.random() * Math.PI * 2;
      this.wobbling    = false;
      this.drifting    = false;
      this.homeX       = x;
      this.homeY       = y;
    }

    cellColor(a) {
      return this.isEvil ? `rgba(185,60,55,${a})` : `rgba(74,127,165,${a})`;
    }
    nucleusColor(a) {
      return this.isEvil ? `rgba(110,25,25,${a})` : `rgba(35,75,115,${a})`;
    }

    update(t) {
      if (this.opacity < 1 && !this.dead) this.opacity = Math.min(1, this.opacity + 0.018);
      if (this.dead) { this.opacity = Math.max(0, this.opacity - 0.007); return; }

      if (this.wobbling) {
        this.vx *= 0.85;
        this.vy *= 0.85;
        this.x = this.homeX + Math.sin(t * 0.001 + this.wobblePhase) * 1.5;
        this.y = this.homeY + Math.cos(t * 0.0013 + this.wobblePhase) * 1.5;

      } else if (this.pinned) {
        this.x += Math.sin(t * 0.002 + this.wobblePhase) * 0.3;
        this.y += Math.cos(t * 0.0015 + this.wobblePhase) * 0.3;

      } else if (this.isEvil) {
        const dx = TCX - this.x, dy = TCY - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist > TUMOR_R * 0.85) {
          this.vx += (dx/dist)*0.06; this.vy += (dy/dist)*0.06;
        } else if (dist < this.baseR) {
          this.vx -= (dx/(dist||1))*0.04; this.vy -= (dy/(dist||1))*0.04;
        } else {
          this.vx += (Math.random()-0.5)*0.04; this.vy += (Math.random()-0.5)*0.04;
        }
        const spd = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
        if (spd > 0.8) { this.vx *= 0.8/spd; this.vy *= 0.8/spd; }
        this.x += this.vx; this.y += this.vy;

      } else if (this.drifting) {
        const dx = this.x - TCX, dy = this.y - TCY;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if (dist > 0) { this.vx += (dx/dist)*0.035; this.vy += (dy/dist)*0.035; }
        const spd = Math.sqrt(this.vx*this.vx+this.vy*this.vy);
        if (spd > 1.4) { this.vx *= 1.4/spd; this.vy *= 1.4/spd; }
        this.x += this.vx; this.y += this.vy;

      } else {
        // blue cells — stay near center, gentle random movement
        const dx = TCX - this.x, dy = TCY - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist > TUMOR_R * 0.6) {
          this.vx += (dx/dist)*0.01; this.vy += (dy/dist)*0.01;
        }
        this.vx += (Math.random()-0.5)*0.02;
        this.vy += (Math.random()-0.5)*0.02;
        const spd = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
        if (spd > 0.2) { this.vx *= 0.2/spd; this.vy *= 0.2/spd; }
        this.x += this.vx; this.y += this.vy;
      }

      // text zone avoidance
      if (!this.wobbling) {
        const inZone = this.x > TEXT_ZONE.x && this.x < TEXT_ZONE.x + TEXT_ZONE.w &&
                       this.y > TEXT_ZONE.y && this.y < TEXT_ZONE.y + TEXT_ZONE.h;
        if (inZone) {
          const cx = TEXT_ZONE.x + TEXT_ZONE.w / 2;
          const cy = TEXT_ZONE.y + TEXT_ZONE.h / 2;
          this.vx += (this.x - cx) * 0.02;
          this.vy += (this.y - cy) * 0.02;
        }
      }

      // keep on canvas
      if (!this.pinned && !this.wobbling) {
        if (this.x < this.baseR)       { this.x = this.baseR;       this.vx *= -0.5; }
        if (this.x > W - this.baseR)   { this.x = W - this.baseR;   this.vx *= -0.5; }
        if (this.y < HEADER_H+this.baseR) { this.y = HEADER_H+this.baseR; this.vy *= -0.5; }
        if (this.y > H - this.baseR)   { this.y = H - this.baseR;   this.vy *= -0.5; }
      }

      this.angle += this.dAngle;
      const pulse = Math.sin(t*0.001 + this.phase)*0.04;
      this.rx = this.baseR*(0.85 + pulse);
      this.ry = this.baseR*(0.75 - pulse*0.5);
      if (this.dividing) this.divProg = Math.min(1, this.divProg + 0.012);
      if (this.flashWhite > 0) this.flashWhite = Math.max(0, this.flashWhite - 0.06);
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
      if (this.flashWhite > 0) {
        const fw = this.flashWhite;
        ctx.fillStyle   = `rgba(255,255,255,${fw*this.opacity})`;
        ctx.strokeStyle = `rgba(255,255,255,${fw*this.opacity*0.9})`;
      } else {
        ctx.fillStyle   = this.cellColor(this.opacity*0.5);
        ctx.strokeStyle = this.cellColor(this.opacity*0.9);
      }
      ctx.lineWidth = 1.3; ctx.fill(); ctx.stroke();
      if (this.flashWhite < 0.5) {
        ctx.beginPath();
        ctx.ellipse(this.nxOff, this.nyOff, this.nR*0.85, this.nR, this.angle*0.4, 0, Math.PI*2);
        ctx.fillStyle = this.nucleusColor(this.opacity*0.75);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // ============================================
  // LEUKOCYTE
  // ============================================
  class Leukocyte {
    constructor(sx, sy, tx, ty, miss) {
      this.x = sx; this.y = sy;
      this.targetX = tx; this.targetY = ty;
      this.miss = miss;
      this.r = 18; this.opacity = 0; this.done = false;
      this.phase = 'approach';
      this.speed = TUMOR_CONFIG.leuko_speed;
      this.wobble = 0; this.inspectAngle = 0;
      this.onHit = null;
      this.exitX = W+40; this.exitY = H+40;
      this.granules = Array.from({length:7}, (_,i) => ({
        angle: (i/7)*Math.PI*2,
        dist:  this.r*(0.3+Math.random()*0.28),
        r:     2.5+Math.random()*2,
        color: ['rgba(210,180,120,0.85)','rgba(190,160,100,0.85)','rgba(220,190,130,0.85)',
                'rgba(170,140,90,0.85)','rgba(200,170,110,0.85)','rgba(215,185,125,0.85)',
                'rgba(180,150,95,0.85)'][i]
      }));
    }

    update() {
      if (this.done) { this.opacity = Math.max(0, this.opacity-0.02); return; }
      this.opacity = Math.min(1, this.opacity+0.03);
      this.wobble += 0.08;
      let tx, ty, thresh;
      if (this.phase === 'approach') {
        tx = this.targetX; ty = this.targetY;
        thresh = this.miss ? 80 : this.r+8;
      } else if (this.phase === 'inspect') {
        this.inspectAngle += 0.022;
        tx = this.targetX + Math.cos(this.inspectAngle)*60;
        ty = this.targetY + Math.sin(this.inspectAngle)*60;
        thresh = 999;
      } else if (this.phase === 'bounce') {
        tx = this.bounceExitX; ty = this.bounceExitY; thresh = 30;
      } else {
        tx = this.exitX; ty = this.exitY; thresh = 30;
      }
      const dx = tx-this.x, dy = ty-this.y;
      const dist = Math.sqrt(dx*dx+dy*dy);
      const spd = this.phase==='inspect'?1.1:this.phase==='bounce'?1.8:this.speed;
      if (dist > 0) { this.x += (dx/dist)*spd; this.y += (dy/dist)*spd; }
      if (this.phase === 'approach' && dist < thresh) {
        if (this.miss) {
          this.phase = 'inspect';
          setTimeout(() => { this.phase = 'leave'; }, TUMOR_CONFIG.beat6_leuko_circle);
        } else if (this.bounceMode) {
          this.phase = 'bounce';
          const a = Math.atan2(this.y-TCY, this.x-TCX);
          this.bounceExitX = this.x+Math.cos(a)*120;
          this.bounceExitY = this.y+Math.sin(a)*120;
          setTimeout(() => { this.phase = 'leave'; }, 800);
        } else {
          this.done = true; this.phase = 'done';
          if (this.onHit) this.onHit();
        }
      }
      if (this.phase === 'leave' && dist < 30) this.done = true;
    }

    draw(ctx) {
      if (this.opacity <= 0.01) return;
      ctx.save();
      ctx.translate(this.x+Math.sin(this.wobble)*1.5, this.y+Math.cos(this.wobble*0.7)*1.5);
      ctx.beginPath(); ctx.arc(0,0,this.r,0,Math.PI*2);
      ctx.fillStyle   = `rgba(212,200,122,${this.opacity*0.45})`;
      ctx.strokeStyle = `rgba(212,200,122,${this.opacity*0.9})`;
      ctx.lineWidth = 1.5; ctx.fill(); ctx.stroke();
      this.granules.forEach(g => {
        ctx.beginPath();
        ctx.arc(Math.cos(g.angle+this.wobble*0.1)*g.dist,
                Math.sin(g.angle+this.wobble*0.1)*g.dist, g.r, 0, Math.PI*2);
        ctx.fillStyle = g.color.replace('0.85', String(this.opacity*0.85));
        ctx.fill();
      });
      ctx.restore();
    }
  }

  // ============================================
  // BURST
  // ============================================
  class Burst {
    constructor(x, y) {
      this.x = x; this.y = y;
      const a = Math.random()*Math.PI*2, s = 2+Math.random()*4;
      this.vx = Math.cos(a)*s; this.vy = Math.sin(a)*s;
      this.r = 3+Math.random()*5; this.opacity = 1;
      this.len = 6+Math.random()*10; this.angle = a;
    }
    update() {
      this.x+=this.vx; this.y+=this.vy;
      this.vx*=0.94; this.vy*=0.94;
      this.opacity = Math.max(0, this.opacity-0.028);
      this.r = Math.max(0, this.r-0.06);
    }
    draw(ctx) {
      if (this.opacity<=0) return;
      ctx.save(); ctx.translate(this.x,this.y); ctx.rotate(this.angle);
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(this.len,0);
      ctx.strokeStyle = `rgba(255,220,200,${this.opacity})`;
      ctx.lineWidth = this.r*0.5; ctx.lineCap='round'; ctx.stroke();
      ctx.restore();
    }
  }

  // ============================================
  // STATE
  // ============================================
  let cells=[], leukocytes=[], bursts=[];
  let beat=-1, beatTimers=[];
  let blueTimer=null, evilTimer=null;

  cells.push(new Cell(TCX, TCY, 26, false, false));

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
      if (!tumorAnimating) return;
      const angle = Math.random()*Math.PI*2;
      const dist  = parent.baseR*1.9;
      const child = new Cell(
        parent.x+Math.cos(angle)*dist,
        parent.y+Math.sin(angle)*dist,
        parent.baseR*(0.85+Math.random()*0.2),
        parent.isEvil, false
      );
      // truly random velocity — no inherited direction
      child.vx = (Math.random()-0.5)*0.25;
      child.vy = (Math.random()-0.5)*0.25;
      // inherit state from parent
      if (!child.isEvil) {
        child.drifting = parent.drifting || false;
        child.wobbling = parent.wobbling || false;
        if (child.wobbling) { child.homeX = child.x; child.homeY = child.y; }
      }
      cells.push(child);
      parent.dividing=false; parent.divProg=0;
    }, 700);
  }

  function killRandom(isEvil) {
    const pool = cells.filter(c=>!c.dead&&c.isEvil===isEvil&&!c.pinned&&!c.wobbling);
    if (pool.length>0) pool[Math.floor(Math.random()*pool.length)].dead=true;
  }

  function triggerBurst(x, y, cell) {
    cell.flashWhite=1.0;
    for (let i=0;i<14;i++) bursts.push(new Burst(x,y));
    setTimeout(()=>{cell.dead=true;},400);
  }

  function settleBlue() {
    cells.filter(c=>!c.dead&&!c.isEvil).forEach(c=>{
      c.drifting=false;
      c.wobbling=true;
      c.homeX=c.x; c.homeY=c.y;
    });
  }

  function startBlueDivision() {
    blueTimer = setInterval(()=>{
      if (!tumorAnimating){clearInterval(blueTimer);return;}
      const alive=cells.filter(c=>!c.dead&&!c.isEvil&&!c.pinned);
      if (alive.length>0) spawnChild(alive[Math.floor(Math.random()*alive.length)]);
    }, TUMOR_CONFIG.blue_div_interval);
  }

  function startEvilDivision() {
    let count=0;
    evilTimer = setInterval(()=>{
      if (!tumorAnimating||count>TUMOR_CONFIG.evil_div_max){clearInterval(evilTimer);return;}
      const evil=cells.filter(c=>!c.dead&&c.isEvil&&!c.pinned);
      if (!evil.length) return;
      const parent=evil[Math.floor(Math.random()*evil.length)];
      parent.dividing=true; parent.divProg=0;
      setTimeout(()=>{
        if (!tumorAnimating||parent.dead) return;
        const angle=Math.random()*Math.PI*2;
        const dist=parent.baseR*(1.6+Math.random()*0.6);
        const child=new Cell(
          parent.x+Math.cos(angle)*dist,
          parent.y+Math.sin(angle)*dist,
          parent.baseR*(0.88+Math.random()*0.24),
          true, false
        );
        child.homeX=child.x; child.homeY=child.y;
        cells.push(child);
        parent.dividing=false; parent.divProg=0; count++;
      },300);
    }, TUMOR_CONFIG.evil_div_interval);
  }

  // ============================================
  // BEAT SEQUENCER
  // ============================================
  function nextBeat() {
    beat++;
    if (beat>=TUMOR_BEATS.length) return;
    if (beat!==2) showText(TUMOR_BEATS[beat].text);

    // ---- Beat 0: one cell, first division ----
    if (beat===0) {
      beatTimers.push(setTimeout(()=>spawnChild(cells[0]),1500));
    }

    // ---- Beat 1: healthy growth, some die ----
    if (beat===1) {
      startBlueDivision();
      [3500,6000].forEach(t=>beatTimers.push(setTimeout(()=>killRandom(false),t)));
    }

    // ---- Beat 2: mutation, leukocyte kills from top ----
    if (beat===2) {
      showText("Sometimes cells mutate.");
      setTimeout(()=>showText("The body recognizes it.\nIt fights back."),2000);
      const t1=setTimeout(()=>{
        const alive=cells.filter(c=>!c.dead&&!c.isEvil);
        if (!alive.length) return;
        const victim=alive[Math.floor(Math.random()*alive.length)];
        victim.isEvil=true; victim.pinned=true;
        victim.baseR*=1.25; victim.vx=0; victim.vy=0;
        const t2=setTimeout(()=>{
          const lk=new Leukocyte(victim.x,-30,victim.x,victim.y,false);
          lk.onHit=()=>triggerBurst(victim.x,victim.y,victim);
          leukocytes.push(lk);
        },1200);
        beatTimers.push(t2);
      },TUMOR_CONFIG.mutation_delay);
      beatTimers.push(t1);
    }

    // ---- Beat 3: blue cells drift outward, then settle
    //             escape cell + leukocyte from bottom left misses ----
    if (beat===3) {
      // release blue cells outward in all directions
      cells.filter(c=>!c.dead&&!c.isEvil).forEach(c=>{ c.drifting=true; });
      // settle them after 2 seconds of drifting
      setTimeout(()=>settleBlue(), 2000);

      const t1=setTimeout(()=>{
        const alive=cells.filter(c=>!c.dead&&!c.isEvil);
        if (!alive.length) return;
        const victim=alive[Math.floor(Math.random()*alive.length)];
        victim.isEvil=true; victim.baseR*=1.3;
        victim.vx += (TCX-victim.x)*0.015;
        victim.vy += (TCY-victim.y)*0.015;
        const t2=setTimeout(()=>{
          const lk=new Leukocyte(-30,H+30,victim.x+90,victim.y-40,true);
          leukocytes.push(lk);
        },1000);
        beatTimers.push(t2);
      },600);
      beatTimers.push(t1);
    }

    // ---- Beat 4: rapid tumor growth ----
    if (beat===4) {
      startEvilDivision();
      let kc=0;
      const kt=setInterval(()=>{
        if (!tumorAnimating||kc>=3){clearInterval(kt);return;}
        killRandom(false); kc++;
      },1200);
      const t=setTimeout(()=>{
        let bc=0;
        const bt=setInterval(()=>{
          if (!tumorAnimating||bc>TUMOR_CONFIG.final_burst_count){clearInterval(bt);return;}
          const evil=cells.filter(c=>!c.dead&&c.isEvil);
          if (!evil.length){clearInterval(bt);return;}
          const parent=evil[Math.floor(Math.random()*evil.length)];
          parent.dividing=true; parent.divProg=0;
          setTimeout(()=>{
            if (!tumorAnimating) return;
            const angle=Math.random()*Math.PI*2;
            cells.push(new Cell(
              parent.x+Math.cos(angle)*TUMOR_R*(0.15+Math.random()*0.5),
              parent.y+Math.sin(angle)*TUMOR_R*(0.15+Math.random()*0.5),
              parent.baseR*(0.9+Math.random()*0.2),
              true, false
            ));
            parent.dividing=false; parent.divProg=0; bc++;
          },120);
        },80);
      },TUMOR_CONFIG.beat4_duration-1200);
      beatTimers.push(t);
    }

    // ---- Beat 5: slow tumor, settle all cells ----
    if (beat===5) {
      if (evilTimer){clearInterval(evilTimer);evilTimer=null;}
      cells.filter(c=>!c.dead&&c.isEvil).forEach(c=>{c.vx*=0.1;c.vy*=0.1;});
      setTimeout(()=>{
        cells.filter(c=>!c.dead).forEach(c=>{
          c.wobbling=true; c.drifting=false;
          c.homeX=c.x; c.homeY=c.y;
        });
      },500);
      beatTimers.push(setTimeout(nextBeat,TUMOR_CONFIG.beat5_duration));
      return;
    }

    // ---- Beat 6: leukocyte tries tumor, fails ----
    if (beat===6) {
      beatTimers.push(setTimeout(()=>{
        const lk=new Leukocyte(W+30,TCY,TCX+TUMOR_R+20,TCY,false);
        lk.bounceMode=true; lk.onHit=null;
        leukocytes.push(lk);
        setTimeout(nextBeat,2000);
      },TUMOR_CONFIG.beat6_leuko_enter));
      return;
    }

    // ---- Beat 7: snapshot + hold for click ----
    if (beat===7) {
      window.tumorSnapshot=cells.filter(c=>!c.dead).map(c=>({x:c.x,y:c.y,r:c.baseR,isEvil:c.isEvil}));
      return;
    }

    if (beat<TUMOR_BEATS.length-1&&beat!==5&&beat!==6&&beat!==7) {
      beatTimers.push(setTimeout(nextBeat,TUMOR_BEATS[beat].duration));
    }
  }

  // ============================================
  // RENDER
  // ============================================
  function render(t) {
    if (!tumorAnimating) return;
    ctx.clearRect(0,0,W,H);

    // header black bar
    ctx.fillStyle='#0e0e0e';
    ctx.fillRect(0,0,W,HEADER_H);

    // blue under red
    cells.filter(c=>!c.isEvil).forEach(c=>{c.update(t);c.draw(ctx);});
    cells.filter(c=> c.isEvil).forEach(c=>{c.update(t);c.draw(ctx);});
    leukocytes.forEach(l=>{l.update();l.draw(ctx);});
    bursts.forEach(b=>{b.update();b.draw(ctx);});

    // redraw header bar on top
    ctx.fillStyle='#0e0e0e';
    ctx.fillRect(0,0,W,HEADER_H);

    cells=cells.filter(c=>!(c.dead&&c.opacity<=0));
    leukocytes=leukocytes.filter(l=>l.opacity>0);
    bursts=bursts.filter(b=>b.opacity>0);

    tumorRAF=requestAnimationFrame(render);
  }

  tumorRAF=requestAnimationFrame(render);
  setTimeout(nextBeat,300);
} // end _startTumorInner