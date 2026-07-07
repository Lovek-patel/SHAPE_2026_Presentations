// ============================================
// SLIDE 08 — LENTIVIRAL VECTOR PRODUCTION
// Single flask, cinematic zoom-in sequence
// ============================================

const LV_CONFIG = {
  beat0_dur:  2000,
  beat1_dur:  4500,
  beat2_dur:  2500,
  beat3_dur:  3800,
  beat4_dur:  2800,  // debris settles — hold before filter text
  beat5_dur:  3000,  // "Filter lysate" shown, THEN debris fades
  beat6_dur:  3500,  // collect
  beat7_dur:  99999,
};

const LV_TEXTS = [
  '',
  'Grow E. coli with plasmids.',
  '',
  'Lyse.',
  '',
  'Filter lysate — vectors remains.',
  'Collect.',
  'Repeat for all desired vectors.',
];

const VECTOR_LABELS = ['VSVG','GAG','REV','VSVG2','PLV','VSVA'];

const VTYPES = [
  { fill:'rgba(136,192,208,0.90)', stroke:'rgba(90,155,178,0.95)',  shape:'rhombus', spikes:8  },
  { fill:'rgba(185,105,210,0.90)', stroke:'rgba(148,68,185,0.95)',  shape:'hex',     spikes:6  },
  { fill:'rgba(205,160,55,0.90)',  stroke:'rgba(170,124,28,0.95)',  shape:'circle',  spikes:10 },
  { fill:'rgba(100,192,118,0.90)', stroke:'rgba(62,152,80,0.95)',   shape:'rhombus', spikes:6  },
  { fill:'rgba(212,90,88,0.90)',   stroke:'rgba(172,52,52,0.95)',   shape:'hex',     spikes:8  },
  { fill:'rgba(145,162,232,0.90)', stroke:'rgba(104,120,200,0.95)', shape:'circle',  spikes:7  },
];

let lvAnimating  = false;
let lvRAF        = null;
let lvBeat       = 0;
let lvBeatStart  = 0;
let lvBeatTimers = [];
let lvClickReady = false;

Reveal.on('slidechanged', function(event) {
  if (event.previousSlide && event.previousSlide.id === 'slide-lentiviral') _resetLV();
  if (event.currentSlide  && event.currentSlide.id  === 'slide-lentiviral' && !lvAnimating) {
    lvAnimating = true; lvBeat = 0; lvClickReady = false;
    setTimeout(startLVAnimation, 500);
  }
});
Reveal.on('ready', function() {
  const s = Reveal.getCurrentSlide();
  if (s && s.id === 'slide-lentiviral' && !lvAnimating) {
    lvAnimating = true; lvBeat = 0; lvClickReady = false;
    setTimeout(startLVAnimation, 500);
  }
});
document.addEventListener('keydown', function(e) {
  if (!lvClickReady) return;
  if (e.key !== 'ArrowRight' && e.key !== ' ' && e.key !== 'Enter') return;
  e.stopImmediatePropagation(); e.preventDefault();
  lvClickReady = false; Reveal.next();
}, true);

function _resetLV() {
  lvAnimating = false; lvBeat = 0; lvClickReady = false;
  lvBeatTimers.forEach(clearTimeout); lvBeatTimers = [];
  if (lvRAF) { cancelAnimationFrame(lvRAF); lvRAF = null; }
  const canvas = document.getElementById('lentiviral-canvas');
  if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  const txt = document.getElementById('lentiviral-text');
  if (txt) { txt.classList.remove('visible'); txt.textContent = ''; }
}

function startLVAnimation() {
  const canvas = document.getElementById('lentiviral-canvas');
  const textEl = document.getElementById('lentiviral-text');
  if (!canvas) return;
  requestAnimationFrame(() => _startLVInner(canvas, textEl));
}

function _startLVInner(canvas, textEl) {
  const par = canvas.parentElement;
  canvas.width  = par.offsetWidth  > 50 ? par.offsetWidth  : 1100;
  canvas.height = par.offsetHeight > 50 ? par.offsetHeight : 520;
  const W = canvas.width, H = canvas.height;
  const ctx = canvas.getContext('2d');
  const HEADER_H = 90;

  // Flask geometry
  const FCX     = W * 0.50;
  const FW      = W * 0.22;
  const FH      = H * 0.55;
  const FBOT    = H * 0.85;
  const FTOP    = FBOT - FH;
  const NECK_W  = FW * 0.26;
  const NECK_H  = FH * 0.16;
  const BODY_TOP = FTOP + NECK_H;

  // Helpers
  function sm(x)    { x=Math.max(0,Math.min(1,x)); return x*x*(3-2*x); }
  function ease(x)  { return x<0.5?2*x*x:1-Math.pow(-2*x+2,2)/2; }
  function lerp(a,b,t){ return a+(b-a)*t; }
  function clamp(x,a,b){ return Math.max(a,Math.min(b,x)); }

  // Half-width of flask body at a given world y
  function flaskHW(y) {
    const t = clamp((y - BODY_TOP)/(FBOT - BODY_TOP), 0, 1);
    return lerp(NECK_W/2, FW/2, t);
  }

  // Is world point (x,y) inside the flask body?
  function insideFlask(x, y) {
    if (y < BODY_TOP || y > FBOT) return false;
    return Math.abs(x - FCX) < flaskHW(y);
  }

  function showText(msg) {
    if (!textEl) return;
    textEl.classList.remove('visible');
    setTimeout(() => {
      textEl.innerHTML = msg;
      if (msg) textEl.classList.add('visible');
    }, 300);
  }

  function scheduleBeat(b) {
    lvBeat = b; lvBeatStart = performance.now();
    if (LV_TEXTS[b]) showText(LV_TEXTS[b]);
    const dur = LV_CONFIG['beat'+b+'_dur'];
    if (!dur || dur === 99999) { lvClickReady = true; return; }
    lvBeatTimers.push(setTimeout(() => { if (lvAnimating) scheduleBeat(b+1); }, dur));
  }

  // Build clip path for flask body (for ctx.clip())
  function flaskBodyPath() {
    ctx.beginPath();
    ctx.moveTo(FCX - NECK_W/2, BODY_TOP);
    ctx.lineTo(FCX - FW/2,     FBOT);
    ctx.lineTo(FCX + FW/2,     FBOT);
    ctx.lineTo(FCX + NECK_W/2, BODY_TOP);
    ctx.closePath();
  }

  // ---- Cells ----
  const NUM_CELLS = 7;
  function makeCell() {
    // place strictly inside body with margin
    let x, y, attempts=0;
    do {
      const t = 0.12 + Math.random()*0.76;
      y = BODY_TOP + (FBOT-BODY_TOP)*t;
      const hw = flaskHW(y) * 0.72; // leave margin from walls
      x = FCX + (Math.random()-0.5)*2*hw;
      attempts++;
    } while (!insideFlask(x,y) && attempts<30);
    return {
      x, y,
      vx: (Math.random()-0.5)*0.15,
      vy: (Math.random()-0.5)*0.10,
      r:  7,
      angle: Math.random()*Math.PI*2,
      dAngle: (Math.random()-0.5)*0.010,
      phase: Math.random()*Math.PI*2,
      wobble: Math.random()*Math.PI*2,
      op: 0,
      hasPlasmid: false,
      plasmidAngle: Math.random()*Math.PI*2,
      holeProgress: 0,
      alive: true,
    };
  }

  let cells = Array.from({length:NUM_CELLS}, makeCell);

  // Plasmid
  let plasmid = { x:FCX, y:FTOP-50, vy:0.7, absorbed:false, op:0 };

  // Camera
  let camScale = 1;
  let flaskOp  = 0;

  // Debris + viruses
  let debris   = [];
  let viruses  = [];
  let debrisFading = false;

  const COLLECT_X = W*0.50, COLLECT_Y = H*0.46, COLLECT_R = 60;
  let mainCircleOp = 0;

  // 6 circles
  const CIRCLE_POS = [
    {x:W*0.15,y:H*0.37},{x:W*0.35,y:H*0.37},{x:W*0.55,y:H*0.37},{x:W*0.75,y:H*0.37},
    {x:W*0.25,y:H*0.70},{x:W*0.65,y:H*0.70},
  ];
  let circleVisible = VTYPES.map(()=>false);
  let circleOp      = VTYPES.map(()=>0);

  // ---- Beat dispatch ----
  let _lastBeat = -1;
  function onBeat(b) {
    if (b === _lastBeat) return; _lastBeat = b;

    if (b === 0) {
      lvBeatTimers.push(setTimeout(()=>{ if(lvAnimating) flaskOp=1; },300));
      lvBeatTimers.push(setTimeout(()=>{
        if(!lvAnimating) return;
        cells.forEach((c,i)=>{ lvBeatTimers.push(setTimeout(()=>{ c.op=1; },i*140)); });
      },600));
    }

    if (b === 1) {
      plasmid.op=1;
      lvBeatTimers.push(setTimeout(()=>{
        if(!lvAnimating) return;
        plasmid.absorbed=true;
        cells.forEach(c=>{ c.hasPlasmid=true; });
        // 3 more cells divide in
        [0,1,2].forEach(i=>{
          lvBeatTimers.push(setTimeout(()=>{
            if(!lvAnimating) return;
            const c=makeCell(); c.op=1; c.hasPlasmid=true;
            cells.push(c);
          },800+i*600));
        });
      },1600));
    }

    if (b === 2) {/* zoom handled in render */}

    if (b === 3) {
      // holes grow slowly for 2s, then full burst
      // text "Lyse" is shown immediately by scheduleBeat
      lvBeatTimers.push(setTimeout(()=>{
        if(!lvAnimating) return;
        // start holes — delayed 750ms so text is already visible
        const holeInt = setInterval(()=>{
          cells.forEach(c=>{ if(c.alive) c.holeProgress=Math.min(1,c.holeProgress+0.006); });
        },16);
        lvBeatTimers.push(setTimeout(()=>{
          clearInterval(holeInt);
          if(!lvAnimating) return;
          // burst all cells
          cells.forEach(c=>{
            if(!c.alive) return;
            c.alive=false; c.op=0;
            for(let i=0;i<16;i++){
              const a=Math.random()*Math.PI*2, s=0.5+Math.random()*3.0;
              debris.push({
                x:c.x, y:c.y,
                vx:Math.cos(a)*s, vy:Math.sin(a)*s-0.6,
                r:1.5+Math.random()*3.5, op:1, fading:false,
                col:`rgba(148,212,122,${0.4+Math.random()*0.4})`,
              });
            }
            for(let i=0;i<4;i++){
              const a=Math.random()*Math.PI*2, s=0.3+Math.random()*1.0;
              viruses.push({
                x:c.x+(Math.random()-0.5)*15,
                y:c.y+(Math.random()-0.5)*15,
                vx:Math.cos(a)*s*0.4, vy:Math.sin(a)*s*0.4-0.2,
                size:6.5+Math.random()*3.5, op:1,
                type:VTYPES[0], phase:'free', collected:false,
              });
            }
          });
        },2000));
      },400));
    }

    if (b === 5) {
      // TEXT is already shown via scheduleBeat
      // Debris starts fading only after 1.2s (text has been visible for a bit)
      lvBeatTimers.push(setTimeout(()=>{
        if(!lvAnimating) return;
        debrisFading=true;
        debris.forEach(d=>d.fading=true);
      },1200));
    }

    if (b === 6) {
      // transform virus positions from zoomed space to screen space
      const ox=FCX, oy=(BODY_TOP+FBOT)*0.5;
      viruses.forEach(v=>{
        // inverse of: translate(ox,oy) scale(4,4) translate(-ox,-oy)
        // screen = ox + (world-ox)*4 => world = (screen-ox)/4+ox ... wait
        // world coords ARE the cell coords; at scale=4 they render at:
        // screenX = ox + (worldX-ox)*4
        // so convert: screenX = ox + (v.x - ox)*4
        v.x = ox + (v.x - ox)*4;
        v.y = oy + (v.y - oy)*4;
        v.phase='collecting';
      });
    }

    if (b === 7) {
      viruses.forEach(v=>{ v.phase='done'; });
      VTYPES.forEach((_,i)=>{
        lvBeatTimers.push(setTimeout(()=>{
          if(!lvAnimating) return;
          circleVisible[i]=true;
        },i*340));
      });
    }
  }

  // ---- DRAW: flask outline ----
  function drawFlask(opacity) {
    if(opacity<0.01) return;
    ctx.save(); ctx.globalAlpha=opacity;
    ctx.strokeStyle='rgba(175,198,218,0.65)';
    ctx.fillStyle='rgba(136,192,208,0.06)';
    ctx.lineWidth=2; ctx.lineCap='round';
    ctx.beginPath();
    ctx.moveTo(FCX-NECK_W/2, FTOP);
    ctx.lineTo(FCX-NECK_W/2, BODY_TOP);
    ctx.lineTo(FCX-FW/2,     FBOT);
    ctx.lineTo(FCX+FW/2,     FBOT);
    ctx.lineTo(FCX+NECK_W/2, BODY_TOP);
    ctx.lineTo(FCX+NECK_W/2, FTOP);
    ctx.lineTo(FCX-NECK_W/2, FTOP);
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(FCX-NECK_W*0.72,FTOP); ctx.lineTo(FCX+NECK_W*0.72,FTOP); ctx.stroke();
    ctx.restore();
  }

  // ---- DRAW: E. coli — tail outside clip, body clipped ----
  function drawEcoli(c, t) {
    if(c.op<0.01) return;
    const r   = c.r;
    const hp  = c.holeProgress;
    const wobX = Math.sin(t*0.0015+c.wobble)*0.8;
    const wobY = Math.cos(t*0.0012+c.wobble)*0.8;
    const cx  = c.x+wobX, cy = c.y+wobY;

    // --- TAIL (drawn BEFORE clip, so it extends outside flask) ---
    ctx.save(); ctx.globalAlpha=c.op*(1-hp);
    ctx.translate(cx,cy); ctx.rotate(c.angle);
    ctx.strokeStyle='rgba(80,165,60,0.65)';
    ctx.lineWidth=0.9; ctx.lineCap='round';
    const tailLen = r*4.5;
    ctx.beginPath(); ctx.moveTo(-r*1.9,0);
    for(let i=1;i<=14;i++){
      const tx=-r*1.9-(tailLen*i/14);
      const ty=Math.sin(i*0.85+t*0.005+c.phase)*r*0.6;
      ctx.lineTo(tx,ty);
    }
    ctx.stroke();
    ctx.restore();

    // --- BODY (clipped inside flask) ---
    ctx.save(); ctx.globalAlpha=c.op;
    flaskBodyPath(); ctx.clip();
    ctx.translate(cx,cy); ctx.rotate(c.angle);

    if(hp<0.95){
      ctx.fillStyle=`rgba(148,212,122,${0.88*(1-hp*0.5)})`;
      ctx.strokeStyle=`rgba(80,152,64,${0.75*(1-hp*0.4)})`;
      ctx.lineWidth=1.0;
      ctx.beginPath(); ctx.ellipse(0,0,r*2.0,r,0,0,Math.PI*2);
      ctx.fill(); ctx.stroke();
      // nucleus
      if(hp<0.25){
        ctx.beginPath(); ctx.arc(0,0,r*0.30,0,Math.PI*2);
        ctx.fillStyle=`rgba(40,118,36,${0.55*(1-hp*3)})`; ctx.fill();
      }
      // holes
      if(hp>0.06){
        for(let i=0;i<3;i++){
          const ha=(i/3)*Math.PI*2+c.phase;
          const hx=Math.cos(ha)*r*1.5, hy=Math.sin(ha)*r*0.7;
          ctx.beginPath(); ctx.arc(hx,hy,r*0.42*hp,0,Math.PI*2);
          ctx.fillStyle=`rgba(14,14,14,${hp*0.88})`; ctx.fill();
        }
        if(hp>0.25){
          for(let i=0;i<3;i++){
            const ha=(i/3)*Math.PI*2+c.phase;
            ctx.beginPath(); ctx.arc(
              Math.cos(ha)*r*1.9+Math.sin(t*0.003+i)*2,
              Math.sin(ha)*r*0.9, r*0.16*hp, 0, Math.PI*2);
            ctx.fillStyle=`rgba(180,230,150,${hp*0.55})`; ctx.fill();
          }
        }
      }
      // plasmid ring
      if(c.hasPlasmid&&hp<0.35){
        const pr=r*0.55, pa=c.plasmidAngle+t*0.001;
        const px=Math.cos(pa)*r*1.1, py=Math.sin(pa)*r*0.5;
        ctx.strokeStyle='rgba(136,192,208,0.75)'; ctx.lineWidth=1.2;
        ctx.beginPath(); ctx.arc(px,py,pr,0,Math.PI*2); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(px+pr,py); ctx.lineTo(px+pr-3,py-2); ctx.lineTo(px+pr-3,py+2);
        ctx.fillStyle='rgba(136,192,208,0.75)'; ctx.fill();
      }
    }
    ctx.restore();
  }

  // ---- DRAW: plasmid ----
  function drawPlasmid() {
    if(plasmid.op<0.01||plasmid.absorbed) return;
    ctx.save(); ctx.globalAlpha=plasmid.op;
    const r=14;
    ctx.strokeStyle='rgba(136,192,208,0.90)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(plasmid.x,plasmid.y,r,0,Math.PI*2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(plasmid.x+r,plasmid.y);
    ctx.lineTo(plasmid.x+r-4,plasmid.y-3);
    ctx.lineTo(plasmid.x+r-4,plasmid.y+3);
    ctx.fillStyle='rgba(136,192,208,0.90)'; ctx.fill();
    ctx.font='8px Raleway,sans-serif';
    ctx.fillStyle='rgba(136,192,208,0.82)';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('plasmid',plasmid.x,plasmid.y);
    ctx.restore();
  }

  // ---- DRAW: virus ----
  function drawVirus(x,y,size,vt,opacity){
    if(opacity<0.01) return;
    ctx.save(); ctx.globalAlpha=opacity;
    ctx.fillStyle=vt.fill; ctx.strokeStyle=vt.stroke; ctx.lineWidth=1.1;
    ctx.beginPath();
    if(vt.shape==='rhombus'){
      ctx.moveTo(x,y-size); ctx.lineTo(x+size*0.70,y);
      ctx.lineTo(x,y+size); ctx.lineTo(x-size*0.70,y); ctx.closePath();
    } else if(vt.shape==='hex'){
      for(let i=0;i<6;i++){
        const a=(i/6)*Math.PI*2-Math.PI/6;
        i===0?ctx.moveTo(x+Math.cos(a)*size,y+Math.sin(a)*size)
             :ctx.lineTo(x+Math.cos(a)*size,y+Math.sin(a)*size);
      }
      ctx.closePath();
    } else {
      ctx.arc(x,y,size,0,Math.PI*2);
    }
    ctx.fill(); ctx.stroke();
    const sr=vt.shape==='circle'?size:size*0.80;
    ctx.strokeStyle=vt.stroke; ctx.lineWidth=0.9;
    for(let i=0;i<vt.spikes;i++){
      const a=(i/vt.spikes)*Math.PI*2;
      const sx=x+Math.cos(a)*sr, sy=y+Math.sin(a)*sr;
      const ex=x+Math.cos(a)*size*1.55, ey=y+Math.sin(a)*size*1.55;
      ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(ex,ey); ctx.stroke();
      ctx.beginPath(); ctx.arc(ex,ey,1.8,0,Math.PI*2);
      ctx.fillStyle=vt.stroke; ctx.fill();
    }
    ctx.restore();
  }

  // ---- RENDER ----
  function render(t) {
    if(!lvAnimating) return;
    onBeat(lvBeat);

    const beat = lvBeat;
    const rawP = clamp((performance.now()-lvBeatStart)/Math.max(1,LV_CONFIG['beat'+beat+'_dur']),0,1);

    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='#0e0e0e'; ctx.fillRect(0,0,W,HEADER_H);

    // ---- camera zoom ----
    let targetScale = 1;
    if      (beat===2) targetScale=lerp(1,4,ease(rawP));
    else if (beat>=3&&beat<=5) targetScale=4;
    else if (beat===6) targetScale=lerp(4,1,ease(rawP));
    else if (beat>=7)  targetScale=1;
    camScale=targetScale;

    const fOp = beat<2 ? flaskOp : beat===2 ? flaskOp*(1-ease(rawP)) : 0;

    // apply zoom transform for flask + cells
    ctx.save();
    if(camScale>1){
      const ox=FCX, oy=(BODY_TOP+FBOT)*0.5;
      ctx.translate(ox,oy); ctx.scale(camScale,camScale); ctx.translate(-ox,-oy);
    }

    drawFlask(fOp);

    // cells: physics + draw
    cells.forEach(c=>{
      if(!c.alive) return;
      c.x+=c.vx; c.y+=c.vy;
      c.angle+=c.dAngle;
      c.plasmidAngle+=0.008;

      // strict clamping — cell center must stay inside flask body
      const margin = c.r * 0.5;
      if(c.y < BODY_TOP+margin){ c.y=BODY_TOP+margin; c.vy=Math.abs(c.vy)*0.6; }
      if(c.y > FBOT-margin)    { c.y=FBOT-margin;     c.vy=-Math.abs(c.vy)*0.6; }
      const hw=flaskHW(c.y)-margin;
      if(c.x < FCX-hw){ c.x=FCX-hw; c.vx=Math.abs(c.vx)*0.6; }
      if(c.x > FCX+hw){ c.x=FCX+hw; c.vx=-Math.abs(c.vx)*0.6; }

      // gentle separation
      cells.forEach(other=>{
        if(other===c||!other.alive) return;
        const dx=c.x-other.x, dy=c.y-other.y;
        const d=Math.sqrt(dx*dx+dy*dy);
        const minD=(c.r+other.r)*1.6;
        if(d>0&&d<minD){ const f=(minD-d)/minD*0.10; c.vx+=dx/d*f; c.vy+=dy/d*f; }
      });
      c.vx+=(Math.random()-0.5)*0.007;
      c.vy+=(Math.random()-0.5)*0.007;
      const spd=Math.sqrt(c.vx*c.vx+c.vy*c.vy);
      if(spd>0.20){c.vx*=0.20/spd;c.vy*=0.20/spd;}

      drawEcoli(c,t);
    });

    // plasmid
    if(!plasmid.absorbed&&plasmid.op>0){
      plasmid.y+=plasmid.vy;
      if(plasmid.y>BODY_TOP+FH*0.28) plasmid.vy=-0.4;
      drawPlasmid();
    }

    ctx.restore(); // end zoom for flask/cells

    // ---- debris + free viruses (inside zoom until beat 6) ----
    if(beat>=3){
      ctx.save();
      if(beat>=3&&beat<=5&&camScale>1){
        const ox=FCX, oy=(BODY_TOP+FBOT)*0.5;
        ctx.translate(ox,oy); ctx.scale(camScale,camScale); ctx.translate(-ox,-oy);
      }

      debris.forEach(d=>{
        d.x+=d.vx; d.y+=d.vy; d.vx*=0.91; d.vy*=0.91; d.vy+=0.03;
        d.op=Math.max(0,d.op-(d.fading?0.018:0.002));
        if(d.op>0){
          ctx.save(); ctx.globalAlpha=d.op;
          ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,Math.PI*2);
          ctx.fillStyle=d.col; ctx.fill(); ctx.restore();
        }
      });
      debris=debris.filter(d=>d.op>0);

      if(beat<=5){
        viruses.forEach(v=>{
          if(v.phase==='free'){v.x+=v.vx;v.y+=v.vy;v.vx*=0.98;v.vy*=0.98;}
          if(!v.collected&&v.op>0) drawVirus(v.x,v.y,v.size,v.type,v.op);
        });
      }
      ctx.restore();
    }

    // ---- collect phase (beat 6, screen space) ----
    if(beat===6){
      mainCircleOp=Math.min(1,mainCircleOp+0.015);
      // draw circle first
      ctx.save(); ctx.globalAlpha=mainCircleOp*0.55;
      ctx.strokeStyle='rgba(136,192,208,0.72)'; ctx.lineWidth=2;
      ctx.setLineDash([5,4]);
      ctx.beginPath(); ctx.arc(COLLECT_X,COLLECT_Y,COLLECT_R,0,Math.PI*2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      viruses.forEach(v=>{
        if(v.phase==='collecting'){
          const dx=COLLECT_X-v.x, dy=COLLECT_Y-v.y;
          const d=Math.sqrt(dx*dx+dy*dy);
          if(d>COLLECT_R*0.62){
            // smooth eased movement — accelerates toward circle
            const speed=Math.min(d*0.035, 3.5);
            v.x+=dx/d*speed; v.y+=dy/d*speed;
          } else {
            v.collected=true; v.phase='collected';
          }
        }
        if(v.phase==='collected'){
          // orbit inside circle
          const idx=viruses.filter(vv=>vv.collected).indexOf(v);
          const total=viruses.filter(vv=>vv.collected).length;
          const a=(idx/Math.max(1,total))*Math.PI*2 + performance.now()*0.0004;
          v.x=COLLECT_X+Math.cos(a)*COLLECT_R*0.52;
          v.y=COLLECT_Y+Math.sin(a)*COLLECT_R*0.52;
        }
        if(v.op>0) drawVirus(v.x,v.y,v.size,v.type,v.op);
      });
    }

    // ---- 6 labeled circles (beat 7) ----
    if(beat>=7){
      viruses.forEach(v=>{ v.op=Math.max(0,v.op-0.03); });

      CIRCLE_POS.forEach((cp,i)=>{
        if(!circleVisible[i]) return;
        circleOp[i]=Math.min(1,circleOp[i]+0.022);
        const op=sm(circleOp[i]);
        if(op<0.01) return;
        const vt=VTYPES[i], r=44;

        // dashed circle
        ctx.save(); ctx.globalAlpha=op*0.60;
        ctx.strokeStyle=vt.stroke; ctx.lineWidth=2;
        ctx.setLineDash([5,4]);
        ctx.beginPath(); ctx.arc(cp.x,cp.y,r,0,Math.PI*2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // 4 orbiting viruses
        for(let j=0;j<4;j++){
          const a=(j/4)*Math.PI*2+performance.now()*0.00025*(i%2===0?1:-1);
          drawVirus(cp.x+Math.cos(a)*r*0.52,
                    cp.y+Math.sin(a)*r*0.52,
                    6.5,vt,op);
        }

        // bold label below circle
        ctx.save(); ctx.globalAlpha=op;
        ctx.font='bold 16px Raleway,sans-serif';
        ctx.fillStyle=vt.stroke.replace('0.95','0.92)');
        ctx.textAlign='center'; ctx.textBaseline='top';
        ctx.fillText(VECTOR_LABELS[i],cp.x,cp.y+r+10);
        ctx.restore();
      });
    }

    ctx.fillStyle='#0e0e0e'; ctx.fillRect(0,0,W,HEADER_H);
    lvRAF=requestAnimationFrame(render);
  }

  scheduleBeat(0);
  lvRAF=requestAnimationFrame(render);
}