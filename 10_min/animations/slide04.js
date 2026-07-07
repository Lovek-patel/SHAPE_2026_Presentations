// ============================================
// SLIDE 04 — GUIDED THERAPY ANIMATION
// ============================================

const GUIDED_CONFIG = {
  beat0_duration: 3000,
  beat1_duration: 5000,
  beat2_duration: 5000,
  beat3_duration: 5000,

  spawn_interval: 55,
  base_speed: 2.3,
  magnet_strength: 0.10,
  missile_strength: 0.065,

  red_kill_chance: 0.5,
  blue_kill_chance: 0.01,
  red_min_survive: 0.30,

  div_interval: 1300
};

const GUIDED_BEATS = [
  { text: "What if we could\nguide the treatment?", duration: GUIDED_CONFIG.beat0_duration },
  { text: "Targeted therapy —\ntreatment that finds cancer.", duration: GUIDED_CONFIG.beat1_duration },
  { text: "More cancer dies.", duration: GUIDED_CONFIG.beat2_duration },
  { text: "Far less collateral damage.", duration: GUIDED_CONFIG.beat3_duration },
  { text: "That's the idea.", duration: 99999 }
];

let guidedAnimating = false;
let guidedRAF = null;

Reveal.on("slidechanged", function(event) {
  if (event.previousSlide && event.previousSlide.id === "slide-guided") _resetGuided();
  if (event.currentSlide && event.currentSlide.id === "slide-guided" && !guidedAnimating) {
    guidedAnimating = true;
    setTimeout(startGuidedAnimation, 600);
  }
});

Reveal.on("ready", function() {
  const s = Reveal.getCurrentSlide();
  if (s && s.id === "slide-guided" && !guidedAnimating) {
    guidedAnimating = true;
    setTimeout(startGuidedAnimation, 600);
  }
});

function _resetGuided() {
  guidedAnimating = false;
  if (guidedRAF) cancelAnimationFrame(guidedRAF);
  guidedRAF = null;

  const canvas = document.getElementById("guided-canvas");
  if (canvas) canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

  const txt = document.getElementById("guided-text");
  if (txt) {
    txt.classList.remove("visible");
    txt.textContent = "";
  }
}

function startGuidedAnimation() {
  const canvas = document.getElementById("guided-canvas");
  const textEl = document.getElementById("guided-text");
  if (!canvas || !textEl) return;
  requestAnimationFrame(() => _startGuidedInner(canvas, textEl));
}

function _startGuidedInner(canvas, textEl) {
  const par = canvas.parentElement;
  const pw  = par.offsetWidth;
  const ph  = par.offsetHeight;
  canvas.width  = pw > 50 ? pw : 1100;
  canvas.height = ph > 50 ? ph : 520;
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext('2d');

  const TCX = W * 0.44;
  const TCY = H * 0.52;
  const TUMOR_R = Math.min(W, H) * 0.18;
  const HEADER_H = 90;
  const TEXT_ZONE = { x: 40, y: H - 160, w: 300, h: 140 };

  const sideWeights = { top: 1, right: 1, bottom: 1, left: 1 };

  function chooseSide() {
    const total = sideWeights.top + sideWeights.right + sideWeights.bottom + sideWeights.left;
    let r = Math.random() * total;

    for (const side of ["top", "right", "bottom", "left"]) {
      r -= sideWeights[side];
      if (r <= 0) return side;
    }

    return "right";
  }

  function rewardSide(winningSide) {
    if (!winningSide || !sideWeights[winningSide]) return;

    for (const side of ["top", "right", "bottom", "left"]) {
      if (side === winningSide) continue;
      const transfer = sideWeights[side] * 0.33;
      sideWeights[side] -= transfer;
      sideWeights[winningSide] += transfer;
    }
  }

  class Cell {
    constructor(x, y, radius, isEvil) {
      this.x = x;
      this.y = y;
      this.homeX = x;
      this.homeY = y;
      this.baseR = radius;
      this.isEvil = isEvil;
      this.dead = false;
      this.opacity = 0;
      this.dividing = false;
      this.divProg = 0;
      this.flashPurple = 0;

      this.rx = radius * (0.82 + Math.random() * 0.55);
      this.ry = radius * (0.70 + Math.random() * 0.55);
      this.angle = Math.random() * Math.PI;
      this.dAngle = (Math.random() - 0.5) * 0.003;

      this.nxOff = (Math.random() - 0.5) * radius * 0.35;
      this.nyOff = (Math.random() - 0.5) * radius * 0.35;
      this.nR = radius * (0.26 + Math.random() * 0.12);

      this.phase = Math.random() * Math.PI * 2;
      this.wobblePhase = Math.random() * Math.PI * 2;
    }

    cellColor(a) {
      return this.isEvil ? `rgba(185,60,55,${a})` : `rgba(74,127,165,${a})`;
    }

    nucleusColor(a) {
      return this.isEvil ? `rgba(110,25,25,${a})` : `rgba(35,75,115,${a})`;
    }

    update(t) {
      if (this.opacity < 1 && !this.dead) this.opacity = Math.min(1, this.opacity + 0.025);
      if (this.dead) {
        this.opacity = Math.max(0, this.opacity - 0.012);
        return;
      }

      this.x = this.homeX + Math.sin(t * 0.001 + this.wobblePhase) * 1.2;
      this.y = this.homeY + Math.cos(t * 0.0013 + this.wobblePhase) * 1.2;

      this.angle += this.dAngle;
      const pulse = Math.sin(t * 0.001 + this.phase) * 0.04;
      this.rx = this.baseR * (0.85 + pulse);
      this.ry = this.baseR * (0.75 - pulse * 0.5);

      if (this.dividing) this.divProg = Math.min(1, this.divProg + 0.012);
      if (this.flashPurple > 0) this.flashPurple = Math.max(0, this.flashPurple - 0.06);
    }

    draw(ctx) {
      if (this.opacity <= 0.01) return;

      ctx.save();
      ctx.translate(this.x, this.y);

      let sx = 1, sy = 1;
      if (this.dividing && this.divProg < 1) {
        sx = 1 + this.divProg * 0.25;
        sy = 1 - this.divProg * 0.35;
      }

      ctx.scale(sx, sy);
      ctx.rotate(this.angle);

      ctx.beginPath();
      ctx.ellipse(0, 0, this.rx, this.ry, 0, 0, Math.PI * 2);

      if (this.flashPurple > 0) {
        ctx.fillStyle = `rgba(155,111,168,${this.flashPurple * this.opacity})`;
        ctx.strokeStyle = `rgba(155,111,168,${this.flashPurple * this.opacity})`;
      } else {
        ctx.fillStyle = this.cellColor(this.opacity * 0.5);
        ctx.strokeStyle = this.cellColor(this.opacity * 0.9);
      }

      ctx.lineWidth = 1.3;
      ctx.fill();
      ctx.stroke();

      if (this.flashPurple < 0.5) {
        ctx.beginPath();
        ctx.ellipse(this.nxOff, this.nyOff, this.nR * 0.85, this.nR, this.angle * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = this.nucleusColor(this.opacity * 0.75);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  class GuidedParticle {
    constructor(cellsRef) {
      this.side = chooseSide();
      this.cellsRef = cellsRef;

      const margin = 45;

      if (this.side === "right") {
        this.x = W + margin;
        this.y = Math.random() * H;
      } else if (this.side === "left") {
        this.x = -margin;
        this.y = Math.random() * H;
      } else if (this.side === "top") {
        this.x = Math.random() * W;
        this.y = -margin;
      } else {
        this.x = Math.random() * W;
        this.y = H + margin;
      }

      const redCells = cellsRef.filter(c => !c.dead && c.isEvil);
      this.target = redCells.length
        ? redCells[Math.floor(Math.random() * redCells.length)]
        : null;

      const aimX = this.target ? this.target.x : TCX;
      const aimY = this.target ? this.target.y : TCY;

      const baseAngle = Math.atan2(aimY - this.y, aimX - this.x);
      const spread = (Math.random() - 0.5) * 0.35;
      const angle = baseAngle + spread;

      this.vx = Math.cos(angle) * GUIDED_CONFIG.base_speed;
      this.vy = Math.sin(angle) * GUIDED_CONFIG.base_speed;

      this.size = 4 + Math.random() * 3;
      this.angle = Math.random() * Math.PI * 2;
      this.spin = (Math.random() - 0.5) * 0.06;
      this.opacity = 0.75 + Math.random() * 0.25;
      this.dead = false;
    }

    findTarget() {
      const reds = this.cellsRef.filter(c => !c.dead && c.isEvil);
      if (!reds.length) return null;

      let nearest = null;
      let nearDist = Infinity;

      reds.forEach(c => {
        const d = Math.hypot(c.x - this.x, c.y - this.y);
        if (d < nearDist) {
          nearDist = d;
          nearest = c;
        }
      });

      return nearest;
    }

    update() {
      if (this.dead) return;

      if (!this.target || this.target.dead) {
        this.target = this.findTarget();
      }

      if (this.target) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 0) {
          this.vx += (dx / dist) * GUIDED_CONFIG.missile_strength;
          this.vy += (dy / dist) * GUIDED_CONFIG.missile_strength;

          const mf = Math.max(0, 1 - dist / 350);
          this.vx += (dx / dist) * GUIDED_CONFIG.magnet_strength * mf;
          this.vy += (dy / dist) * GUIDED_CONFIG.magnet_strength * mf;
        }
      }

      // Steer away from healthy blue cells.
        this.cellsRef.filter(c => !c.dead && !c.isEvil).forEach(c => {
        const dx = this.x - c.x;
        const dy = this.y - c.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 0 && dist < 70) {
            const force = (70 - dist) / 70;
            this.vx += (dx / dist) * force * 0.18;
            this.vy += (dy / dist) * force * 0.18;
        }
        });

      const spd = Math.hypot(this.vx, this.vy);
      if (spd > 4.0) {
        this.vx *= 4.0 / spd;
        this.vy *= 4.0 / spd;
      }

      this.x += this.vx;
      this.y += this.vy;
      this.angle += this.spin;
    }

    draw(ctx) {
      if (this.dead || this.opacity <= 0) return;

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);

      ctx.beginPath();
      ctx.moveTo(0, -this.size);
      ctx.lineTo(this.size * 0.866, this.size * 0.5);
      ctx.lineTo(-this.size * 0.866, this.size * 0.5);
      ctx.closePath();

      ctx.fillStyle = `rgba(155,111,168,${this.opacity})`;
      ctx.strokeStyle = `rgba(200,160,215,${this.opacity * 0.6})`;
      ctx.lineWidth = 0.8;
      ctx.fill();
      ctx.stroke();

      const sq = this.size * 0.55;
      ctx.fillStyle = `rgba(240,200,60,${this.opacity * 0.9})`;
      ctx.strokeStyle = `rgba(255,230,100,${this.opacity * 0.7})`;
      ctx.lineWidth = 0.6;
      ctx.fillRect(-sq / 2, -this.size - sq - 1, sq, sq);
      ctx.strokeRect(-sq / 2, -this.size - sq - 1, sq, sq);

      ctx.restore();
    }
  }

  class PopBurst {
    constructor(x, y) {
      this.particles = Array.from({ length: 8 }, () => {
        const a = Math.random() * Math.PI * 2;
        const s = 1.5 + Math.random() * 3;
        return { x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, opacity: 1, r: 2 + Math.random() * 3 };
      });
    }

    update() {
      this.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.92;
        p.vy *= 0.92;
        p.opacity = Math.max(0, p.opacity - 0.045);
      });
    }

    done() {
      return this.particles.every(p => p.opacity <= 0);
    }

    draw(ctx) {
      this.particles.forEach(p => {
        if (p.opacity <= 0) return;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(155,111,168,${p.opacity})`;
        ctx.fill();
      });
    }
  }

  let cells = [];
  let particles = [];
  let pops = [];
  let beat = -1;
  let beatTimers = [];
  let spawnTimer = null;
  let divTimer = null;

  const snap = window.tumorSnapshot || [];
  if (snap.length > 0) {
    snap.forEach(s => {
      const c = new Cell(s.x, s.y, s.r, s.isEvil);
      c.opacity = 1;
      cells.push(c);
    });
  } else {
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = 80 + Math.random() * 200;
      cells.push(new Cell(TCX + Math.cos(a) * d, TCY + Math.sin(a) * d, 20 + Math.random() * 10, false));
    }

    for (let i = 0; i < 20; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.random() * W * 0.16;
      cells.push(new Cell(TCX + Math.cos(a) * d, TCY + Math.sin(a) * d, 18 + Math.random() * 8, true));
    }
  }

  function showText(msg) {
    textEl.classList.remove("visible");
    setTimeout(() => {
      textEl.innerHTML = msg.replace(/\n/g, "<br>");
      textEl.classList.add("visible");
    }, 400);
  }

  function spawnChild(parent) {
    if (!parent || parent.dead) return;

    parent.dividing = true;
    parent.divProg = 0;

    setTimeout(() => {
      if (!guidedAnimating) return;

      const angle = Math.random() * Math.PI * 2;
      const dist = parent.baseR * 1.9;

      const child = new Cell(
        parent.homeX + Math.cos(angle) * dist,
        parent.homeY + Math.sin(angle) * dist,
        parent.baseR * (0.85 + Math.random() * 0.2),
        parent.isEvil
      );

      child.opacity = 0.6;
      cells.push(child);

      parent.dividing = false;
      parent.divProg = 0;
    }, 700);
  }

  function checkHits() {
    const redAlive = cells.filter(c => !c.dead && c.isEvil).length;
    const redTotal = cells.filter(c => c.isEvil).length;
    const redMinAlive = Math.ceil(redTotal * GUIDED_CONFIG.red_min_survive);

    particles.forEach(p => {
      if (p.dead) return;

      cells.forEach(c => {
        if (c.dead || p.dead) return;

        const dist = Math.hypot(p.x - c.x, p.y - c.y);

        if (dist < c.baseR * 0.9) {
          c.flashPurple = 0.8;

          if (c.isEvil) {
            p.dead = true;
            rewardSide(p.side);

            if (Math.random() < GUIDED_CONFIG.red_kill_chance) {
              if (redAlive <= redMinAlive) return;
              c.dead = true;
              pops.push(new PopBurst(c.x, c.y));
            }
          } else {
            // Most guided particles dodge/glance off healthy cells instead of killing them.
            p.vx *= -0.25;
            p.vy *= -0.25;

            if (Math.random() < GUIDED_CONFIG.blue_kill_chance) {
                c.dead = true;
                pops.push(new PopBurst(c.x, c.y));
            }
            }
        }
      });
    });
  }

  function nextBeat() {
    beat++;
    if (beat >= GUIDED_BEATS.length) return;

    showText(GUIDED_BEATS[beat].text);

    if (beat === 0) {
      divTimer = setInterval(() => {
        if (!guidedAnimating) {
          clearInterval(divTimer);
          return;
        }

        const reds = cells.filter(c => !c.dead && c.isEvil);
        if (reds.length > 0 && reds.length < 40) {
          spawnChild(reds[Math.floor(Math.random() * reds.length)]);
        }
      }, GUIDED_CONFIG.div_interval);
    }

    if (beat === 1) {
      spawnTimer = setInterval(() => {
        if (!guidedAnimating) {
          clearInterval(spawnTimer);
          return;
        }

        particles.push(new GuidedParticle(cells));
      }, GUIDED_CONFIG.spawn_interval);
    }

    if (beat === 4) {
      if (spawnTimer) clearInterval(spawnTimer);
      if (divTimer) clearInterval(divTimer);
      particles.forEach(p => p.dead = true);
      return;
    }

    if (beat < GUIDED_BEATS.length - 1) {
      beatTimers.push(setTimeout(nextBeat, GUIDED_BEATS[beat].duration));
    }
  }

  function render(t) {
    if (!guidedAnimating) return;

    ctx.clearRect(0, 0, W, H);

    // header black bar
    ctx.fillStyle = '#0e0e0e';
    ctx.fillRect(0, 0, W, HEADER_H);

    cells.filter(c => !c.isEvil).forEach(c => { c.update(t); c.draw(ctx); });
    cells.filter(c =>  c.isEvil).forEach(c => { c.update(t); c.draw(ctx); });
    particles.forEach(p => { p.update(); p.draw(ctx); });
    checkHits();
    pops.forEach(p => { p.update(); p.draw(ctx); });

    // redraw header on top
    ctx.fillStyle = '#0e0e0e';
    ctx.fillRect(0, 0, W, HEADER_H);

    ctx.fillStyle = "#0e0e0e";
    ctx.fillRect(0, 0, W, HEADER_H);

    cells = cells.filter(c => !(c.dead && c.opacity <= 0));
    particles = particles.filter(p => !p.dead && p.y < H + 90 && p.y > -90 && p.x > -90 && p.x < W + 90);
    pops = pops.filter(p => !p.done());

    guidedRAF = requestAnimationFrame(render);
  }

  guidedRAF = requestAnimationFrame(render);
  setTimeout(nextBeat, 300);
} // end _startGuidedInner