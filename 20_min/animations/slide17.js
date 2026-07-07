// ============================================
// SLIDE 17 — QUESTIONS AMBIENT BACKGROUND
// Slow drifting blue cells, red tumor grows,
// iRGD kills it, peace, repeat. Very faint.
// ============================================

let questionsAnimating = false;
let questionsRAF = null;

Reveal.on('slidechanged', function(event) {
  if (event.previousSlide && event.previousSlide.id === 'slide-questions') {
    questionsAnimating = false;
    if (questionsRAF) { cancelAnimationFrame(questionsRAF); questionsRAF = null; }
  }
  if (event.currentSlide && event.currentSlide.id === 'slide-questions' && !questionsAnimating) {
    questionsAnimating = true;
    setTimeout(startQuestionsAnimation, 400);
  }
});

Reveal.on('ready', function() {
  const s = Reveal.getCurrentSlide();
  if (s && s.id === 'slide-questions' && !questionsAnimating) {
    questionsAnimating = true;
    setTimeout(startQuestionsAnimation, 400);
  }
});

function startQuestionsAnimation() {
  const canvas = document.getElementById('questions-canvas');
  if (!canvas) return;
  requestAnimationFrame(() => _startQuestionsInner(canvas));
}

function _startQuestionsInner(canvas) {
  const par = canvas.parentElement;
  canvas.width  = par.offsetWidth  > 50 ? par.offsetWidth  : 1100;
  canvas.height = par.offsetHeight > 50 ? par.offsetHeight : 520;
  const W = canvas.width, H = canvas.height;
  const ctx = canvas.getContext('2d');

  // ---- Cell class (simplified, low opacity ambient) ----
  class AmbientCell {
    constructor(isEvil) {
      this.x       = Math.random() * W;
      this.y       = Math.random() * H;
      this.r       = 14 + Math.random() * 10;
      this.isEvil  = isEvil;
      this.vx      = (Math.random()-0.5)*0.18;
      this.vy      = (Math.random()-0.5)*0.18;
      this.phase   = Math.random()*Math.PI*2;
      this.opacity = 0.08 + Math.random()*0.10;
      this.dead    = false;
      this.fadeOut = 0;
    }

    update(t) {
      if (this.fadeOut > 0) { this.fadeOut = Math.max(0, this.fadeOut-0.015); return; }
      this.x += this.vx + Math.sin(t*0.0005+this.phase)*0.08;
      this.y += this.vy + Math.cos(t*0.0004+this.phase)*0.08;
      if (this.x < -this.r) this.x = W+this.r;
      if (this.x > W+this.r) this.x = -this.r;
      if (this.y < -this.r) this.y = H+this.r;
      if (this.y > H+this.r) this.y = -this.r;
    }

    draw(ctx, t) {
      const op = this.opacity * (this.fadeOut > 0 ? this.fadeOut/1 : 1);
      if (op < 0.01) return;
      const pulse = Math.sin(t*0.001+this.phase)*0.06;
      const rr = this.r*(1+pulse);
      ctx.beginPath(); ctx.arc(this.x, this.y, rr, 0, Math.PI*2);
      ctx.fillStyle = this.isEvil
        ? `rgba(185,60,55,${op})`
        : `rgba(74,127,165,${op})`;
      ctx.fill();
      // nucleus
      ctx.beginPath(); ctx.arc(this.x+rr*0.15, this.y-rr*0.1, rr*0.28, 0, Math.PI*2);
      ctx.fillStyle = this.isEvil
        ? `rgba(110,25,25,${op*0.8})`
        : `rgba(35,75,115,${op*0.8})`;
      ctx.fill();
    }
  }

  // ---- iRGD ring (tiny, ambient) ----
  class AmbientIRGD {
    constructor() {
      this.x     = Math.random()*W;
      this.y     = Math.random()*H;
      this.vx    = (Math.random()-0.5)*0.4;
      this.vy    = (Math.random()-0.5)*0.4;
      this.r     = 12 + Math.random()*6;
      this.phase = Math.random()*Math.PI*2;
      this.target = null;
      this.opacity = 0.12 + Math.random()*0.08;
    }

    update(cells) {
      // seek nearest red cell
      if (!this.target || this.target.dead || this.target.fadeOut > 0) {
        const reds = cells.filter(c=>c.isEvil&&!c.dead&&c.fadeOut===0);
        if (reds.length) {
          let nearest=null, nd=Infinity;
          reds.forEach(c=>{
            const d=Math.hypot(c.x-this.x,c.y-this.y);
            if (d<nd){nd=d;nearest=c;}
          });
          this.target = nearest;
        }
      }
      if (this.target) {
        const dx=this.target.x-this.x, dy=this.target.y-this.y;
        const dist=Math.sqrt(dx*dx+dy*dy);
        if (dist < this.r + this.target.r) {
          // kill target
          this.target.fadeOut = 1;
          this.target = null;
        } else if (dist > 0) {
          this.vx += (dx/dist)*0.015;
          this.vy += (dy/dist)*0.015;
        }
      }
      const spd=Math.hypot(this.vx,this.vy);
      if (spd>0.5){this.vx*=0.5/spd;this.vy*=0.5/spd;}
      this.x+=this.vx; this.y+=this.vy;
      if (this.x<-20) this.x=W+20;
      if (this.x>W+20) this.x=-20;
      if (this.y<-20) this.y=H+20;
      if (this.y>H+20) this.y=-20;
    }

    draw(ctx, t) {
      ctx.save(); ctx.translate(this.x,this.y);
      const N=9, baseR=this.r;
      ctx.strokeStyle=`rgba(136,192,208,${this.opacity})`;
      ctx.lineWidth=1;
      ctx.beginPath();
      for (let i=0;i<N;i++){
        const a=(i/N)*Math.PI*2+t*0.0003+this.phase;
        const px=Math.cos(a)*baseR, py=Math.sin(a)*baseR;
        i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
      }
      ctx.closePath(); ctx.stroke();
      ctx.restore();
    }
  }

  // ---- state ----
  let cells = Array.from({length:28}, () => new AmbientCell(false));
  // start with a small red cluster somewhere
  let tumorPhase = 0; // 0=growing, 1=being attacked, 2=peace, 3=new tumor
  let phaseTimer = 0;
  const PHASE_DUR = [6000, 5000, 4000, 1000];
  let phaseStart = performance.now();

  const irgds = Array.from({length:5}, () => new AmbientIRGD());

  function spawnRed(x, y) {
    const c = new AmbientCell(true);
    c.x=x||Math.random()*W; c.y=y||Math.random()*H;
    c.opacity=0.09+Math.random()*0.08;
    cells.push(c);
  }

  function render(t) {
    if (!questionsAnimating) return;
    ctx.clearRect(0,0,W,H);

    // phase management
    const now = performance.now();
    if (now - phaseStart > PHASE_DUR[tumorPhase]) {
      tumorPhase = (tumorPhase+1)%4;
      phaseStart = now;

      if (tumorPhase===0) {
        // new tumor in a new spot
        const nx=W*0.2+Math.random()*W*0.6;
        const ny=H*0.2+Math.random()*H*0.6;
        for (let i=0;i<4;i++) spawnRed(nx+(Math.random()-0.5)*40, ny+(Math.random()-0.5)*40);
      }
    }

    // tumor growth phase: add red cells slowly
    if (tumorPhase===0 && Math.random()<0.008) {
      const reds=cells.filter(c=>c.isEvil&&!c.dead&&c.fadeOut===0);
      if (reds.length>0&&reds.length<12) {
        const p=reds[Math.floor(Math.random()*reds.length)];
        spawnRed(p.x+(Math.random()-0.5)*40, p.y+(Math.random()-0.5)*40);
      }
    }

    // replace dead blue cells
    const blues=cells.filter(c=>!c.isEvil&&c.fadeOut===0&&!c.dead);
    if (blues.length<26&&Math.random()<0.01) cells.push(new AmbientCell(false));

    // clean up
    cells=cells.filter(c=>!(c.fadeOut===0&&c.dead));

    // update and draw
    cells.forEach(c=>{c.update(t);c.draw(ctx,t);});
    if (tumorPhase===1||tumorPhase===2) {
      irgds.forEach(ir=>{ir.update(cells);ir.draw(ctx,t);});
    }

    questionsRAF=requestAnimationFrame(render);
  }

  // seed initial small tumor
  for (let i=0;i<3;i++) spawnRed(W*0.5+(Math.random()-0.5)*60, H*0.5+(Math.random()-0.5)*60);

  questionsRAF=requestAnimationFrame(render);
}