// ============================================
// SLIDE 06 — ANCHORED iRGD (fixed)
// ============================================

let anchoredAnimating  = false;
let anchoredRAF        = null;
let anchoredPhase      = 0;
let anchoredClickReady = false;

Reveal.on('slidechanged', function(event) {
  if (event.previousSlide && event.previousSlide.id === 'slide-anchored') _resetAnchored();
  if (event.currentSlide && event.currentSlide.id === 'slide-anchored' && !anchoredAnimating) {
    anchoredAnimating = true; anchoredPhase = 0; anchoredClickReady = false;
    setTimeout(startAnchoredAnimation, 500);
  }
});
Reveal.on('ready', function() {
  const s = Reveal.getCurrentSlide();
  if (s && s.id === 'slide-anchored' && !anchoredAnimating) {
    anchoredAnimating = true; anchoredPhase = 0; anchoredClickReady = false;
    setTimeout(startAnchoredAnimation, 500);
  }
});

document.addEventListener('keydown', function(e) {
  if (!anchoredClickReady) return;
  if (e.key==='ArrowRight'||e.key===' '||e.key==='Enter') {
    e.stopImmediatePropagation();
    _advanceAnchored();
  }
}, true);

function _advanceAnchored() {
  if (!anchoredClickReady) return;
  anchoredClickReady = false;
  ['anchored-secretory-card','anchored-anchored-card'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.opacity = '0';
  });
  setTimeout(() => { anchoredPhase = 1; }, 700);
}

function _resetAnchored() {
  anchoredAnimating = false; anchoredPhase = 0; anchoredClickReady = false;
  if (anchoredRAF) { cancelAnimationFrame(anchoredRAF); anchoredRAF = null; }
  const canvas = document.getElementById('anchored-canvas');
  if (canvas) canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);
  ['anchored-secretory-card','anchored-anchored-card'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.style.opacity='0'; }
  });
  const txt = document.getElementById('anchored-text');
  if (txt) { txt.classList.remove('visible'); txt.textContent=''; }
}

function startAnchoredAnimation() {
  const canvas = document.getElementById('anchored-canvas');
  if (!canvas) return;
  requestAnimationFrame(() => _startAnchoredInner(canvas));
}

function _startAnchoredInner(canvas) {
  const par = canvas.parentElement;
  canvas.width  = par.offsetWidth  > 50 ? par.offsetWidth  : 1100;
  canvas.height = par.offsetHeight > 50 ? par.offsetHeight : 520;
  const W = canvas.width, H = canvas.height;
  const ctx = canvas.getContext('2d');

  const HEADER_H   = 90;
  const MEMBRANE_Y = H * 0.64;
  const WALL_H     = H * 0.092;
  const TAIL_LEN   = WALL_H * 0.83;
  const CONSTRUCT_XS = [W*0.22, W*0.34, W*0.46, W*0.58, W*0.70];

  // denser lipids
  const N_LIPIDS = 92;
  const lipids = Array.from({length:N_LIPIDS},(_,i)=>({
    x:   W*0.003 + i*((W*0.994)/(N_LIPIDS-1)),
    ph:  Math.random()*Math.PI*2,
    tT1: (Math.random()-0.5)*0.42,
    tT2: (Math.random()-0.5)*0.42,
    tB1: (Math.random()-0.5)*0.42,
    tB2: (Math.random()-0.5)*0.42,
  }));

  let proteases       = [];
  let cutProgress     = CONSTRUCT_XS.map(()=>0);
  let constructOp     = CONSTRUCT_XS.map(()=>0);
  let freed           = [];
  let phase1Start     = null;
  let textShown       = false;

  // each freed iRGD gets a random drift direction baked in
  function spawnFreed(cx, fromY) {
    for (let i=0;i<7;i++) {
      const baseA = -Math.PI/2 + (Math.random()-0.5)*1.4;
      freed.push({
        x: cx + (Math.random()-0.5)*10,
        y: fromY,
        vx: Math.cos(baseA)*(0.25+Math.random()*0.55),
        vy: Math.sin(baseA)*(0.4+Math.random()*0.55) - 0.2,
        ax: (Math.random()-0.5)*0.008,  // random horizontal drift
        r:  7 + Math.random()*5,
        op: 0.85,
        type: Math.random()<0.55?'ring':'drug',
      });
    }
  }

  function sm(x){x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);}

  function squiggle(x,y,len,tilt,down,phase){
    ctx.beginPath(); ctx.moveTo(x,y);
    const d=down?1:-1;
    for(let i=1;i<=5;i++){
      ctx.lineTo(x+Math.sin(i*1.15+phase)*2.5+tilt*i*1.4, y+d*(len*i/5));
    }
    ctx.stroke();
  }

  function drawMembrane(t) {
    const gi=ctx.createLinearGradient(0,MEMBRANE_Y,0,H);
    gi.addColorStop(0,'rgba(35,14,22,0.88)'); gi.addColorStop(1,'rgba(16,7,12,0.96)');
    ctx.fillStyle=gi; ctx.fillRect(0,MEMBRANE_Y+WALL_H,W,H-MEMBRANE_Y-WALL_H);

    const gw=ctx.createLinearGradient(0,MEMBRANE_Y-WALL_H,0,MEMBRANE_Y+WALL_H);
    gw.addColorStop(0,'rgba(202,110,136,0.16)');
    gw.addColorStop(0.5,'rgba(220,126,150,0.25)');
    gw.addColorStop(1,'rgba(192,104,128,0.16)');
    ctx.fillStyle=gw; ctx.fillRect(0,MEMBRANE_Y-WALL_H,W,WALL_H*2);

    lipids.forEach(l=>{
      const fl=Math.sin(t*0.0016+l.ph)*2.0, dx=Math.sin(t*0.0008+l.ph)*2.4;
      const x=l.x+dx;
      // outer
      let y=MEMBRANE_Y-WALL_H+5+fl;
      ctx.lineWidth=1.2; ctx.strokeStyle='rgba(208,165,182,0.25)';
      squiggle(x-2.5,y+5,TAIL_LEN,l.tT1,true,l.ph);
      squiggle(x+2.5,y+5,TAIL_LEN,l.tT2,true,l.ph+1.2);
      ctx.beginPath(); ctx.arc(x,y,5.6,0,Math.PI*2);
      ctx.fillStyle='rgba(226,145,165,0.84)'; ctx.fill();
      // inner
      y=MEMBRANE_Y+WALL_H-5+Math.sin(t*0.0016+l.ph+1.1)*2.0;
      squiggle(x-2.5,y-5,TAIL_LEN,l.tB1,false,l.ph+0.6);
      squiggle(x+2.5,y-5,TAIL_LEN,l.tB2,false,l.ph+1.9);
      ctx.beginPath(); ctx.arc(x,y,5.6,0,Math.PI*2);
      ctx.fillStyle='rgba(205,126,146,0.72)'; ctx.fill();
    });
  }

  function drawConstruct(t,cx,cutP,opacity){
    if(opacity<=0.01) return;
    ctx.save(); ctx.globalAlpha=opacity;

    const memTop = MEMBRANE_Y-WALL_H+3;
    const memBot = MEMBRANE_Y+WALL_H*0.45;

    // TM helix — cyan spiral passing through both leaflets
    ctx.lineWidth=3.0; ctx.lineCap='round';
    ctx.strokeStyle='rgba(85,202,226,0.88)';
    ctx.beginPath();
    for(let i=0;i<=38;i++){
      const f=i/38, y=memTop+f*(memBot-memTop);
      const x=cx+Math.sin(f*4.2*Math.PI+t*0.0007)*5.5;
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }
    ctx.stroke();

    // CD28-hinge (red) — C-arc curving right
    const h1bot=memTop-1, h1top=memTop-22;
    ctx.strokeStyle='rgba(212,58,48,0.90)'; ctx.lineWidth=4.2; ctx.lineCap='round';
    ctx.beginPath();
    ctx.moveTo(cx,h1bot);
    ctx.bezierCurveTo(cx+20,h1bot-3, cx+20,h1top+3, cx,h1top);
    ctx.stroke();

    // CD8-hinge (green) — C-arc curving left
    const h2top=h1top-22;
    ctx.strokeStyle='rgba(52,182,68,0.90)'; ctx.lineWidth=4.2;
    ctx.beginPath();
    ctx.moveTo(cx,h1top);
    ctx.bezierCurveTo(cx-20,h1top-3, cx-20,h2top+3, cx,h2top);
    ctx.stroke();

    // cleavage site (purple dot, fades on cut)
    const cleavY=h2top-5;
    const cleavOp=Math.max(0,1-cutP*2.2);
    if(cleavOp>0.01){
      ctx.globalAlpha=opacity*cleavOp;
      ctx.fillStyle='rgba(168,85,212,0.92)';
      ctx.beginPath(); ctx.arc(cx,cleavY,4.8,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha=opacity;
    }

    // GGGSx4 linker (gold) — rises with cut
    const linkerRise=cutP*16;
    const linkerBot=cleavY-5-linkerRise, linkerTop=linkerBot-13;
    const linkerOp=Math.max(0,1-cutP*0.75);
    ctx.globalAlpha=opacity*linkerOp;
    ctx.strokeStyle='rgba(192,152,50,0.88)'; ctx.lineWidth=3.2;
    ctx.beginPath(); ctx.moveTo(cx,linkerBot); ctx.lineTo(cx,linkerTop); ctx.stroke();

    // iRGD ring — floats up and drifts when cut
    const ringRise=cutP*60, ringY=linkerTop-15-ringRise;
    const ringOp=Math.max(0,1-cutP*0.5);
    ctx.globalAlpha=opacity*ringOp;

    const AMINO=['C','R','G','D','K','G','P','D','C'], N=AMINO.length, ringR=12;
    ctx.strokeStyle='rgba(240,244,248,0.72)'; ctx.lineWidth=1.5;
    ctx.beginPath();
    AMINO.forEach((_,i)=>{
      const a=(i/N)*Math.PI*2-Math.PI/2;
      const px=cx+Math.cos(a)*ringR, py=ringY+Math.sin(a)*ringR;
      i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
    });
    ctx.closePath(); ctx.stroke();

    AMINO.forEach((aa,i)=>{
      const a=(i/N)*Math.PI*2-Math.PI/2;
      const px=cx+Math.cos(a)*ringR, py=ringY+Math.sin(a)*ringR;
      ctx.beginPath(); ctx.arc(px,py,5.2,0,Math.PI*2);
      ctx.fillStyle=(i>=1&&i<=3)?'rgba(255,218,60,0.96)':'rgba(180,56,50,0.92)';
      ctx.fill();
      ctx.font='5px Raleway,sans-serif'; ctx.fillStyle='white';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(aa,px,py);
    });

    // Drug payload on C(0)
    const c0a=-Math.PI/2;
    const c0x=cx+Math.cos(c0a)*ringR, c0y=ringY+Math.sin(c0a)*ringR;
    const pex=c0x, pey=c0y-17;
    ctx.strokeStyle='rgba(172,208,236,0.80)'; ctx.lineWidth=1.3;
    ctx.beginPath(); ctx.moveTo(c0x,c0y); ctx.lineTo(pex,pey); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(pex,pey,8.5,5.5,0,0,Math.PI*2);
    ctx.fillStyle='rgba(62,122,180,0.86)'; ctx.fill();
    ctx.font='4.5px Raleway,sans-serif'; ctx.fillStyle='white';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('Drug',pex,pey);

    ctx.globalAlpha=1; ctx.restore();
  }

  function drawProtease(t,x,y,opacity){
    if(opacity<=0.01) return;
    ctx.save(); ctx.globalAlpha=opacity;
    const r=15;
    ctx.beginPath();
    for(let i=0;i<=28;i++){
      const a=(i/28)*Math.PI*2;
      const w=1+0.20*Math.sin(3*a+t*0.0035)+0.11*Math.cos(5*a+t*0.0025);
      const px=x+Math.cos(a)*r*w, py=y+Math.sin(a)*r*w;
      i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
    }
    ctx.closePath();
    ctx.fillStyle='rgba(145,82,202,0.76)';
    ctx.strokeStyle='rgba(188,138,235,0.88)';
    ctx.lineWidth=1.3; ctx.fill(); ctx.stroke();
    ctx.font='7.5px Raleway,sans-serif'; ctx.fillStyle='rgba(240,244,248,0.88)';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('TEV',x,y);
    ctx.restore();
  }

  function updateFreed(){
    freed.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      p.vx+=p.ax;                    // random horizontal drift
      p.vy-=0.003;                   // gentle upward float
      p.vx*=0.99; p.vy*=0.99;        // slight damping
      p.op=Math.max(0,p.op-0.006);
    });
    freed=freed.filter(p=>p.op>0);
  }

  function drawFreed(){
    freed.forEach(p=>{
      ctx.save(); ctx.globalAlpha=p.op;
      if(p.type==='ring'){
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.strokeStyle='rgba(136,192,208,0.85)'; ctx.lineWidth=1.2; ctx.stroke();
      } else {
        ctx.beginPath(); ctx.ellipse(p.x,p.y,p.r*1.1,p.r*0.68,0,0,Math.PI*2);
        ctx.fillStyle='rgba(62,122,180,0.78)'; ctx.fill();
      }
      ctx.restore();
    });
  }

  // protease spawn offsets (ms from phase1 start)
  const PROTEASE_OFFSETS = [0, 1800, 3500, 5100, 6600];
  let spawnedProteases = new Array(CONSTRUCT_XS.length).fill(false);

  // show cards
  setTimeout(()=>{
    const sec=document.getElementById('anchored-secretory-card');
    if(sec) sec.style.opacity='1';
    setTimeout(()=>{
      const anc=document.getElementById('anchored-anchored-card');
      if(anc) anc.style.opacity='1';
      setTimeout(()=>{ anchoredClickReady=true; },400);
    },1800);
  },300);

  function render(t){
    if(!anchoredAnimating) return;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='#0e0e0e'; ctx.fillRect(0,0,W,HEADER_H);

    if(anchoredPhase===0){
      ctx.fillStyle='#0e0e0e'; ctx.fillRect(0,0,W,HEADER_H);
      anchoredRAF=requestAnimationFrame(render); return;
    }

    if(anchoredPhase>=1){
      if(phase1Start===null) phase1Start=t;
      const elapsed=t-phase1Start;

      drawMembrane(t);

      // fade in constructs staggered
      constructOp=constructOp.map((op,i)=>{
        const delay=i*100;
        return elapsed>delay ? Math.min(1,op+0.022) : op;
      });

      // spawn proteases from TOP
      PROTEASE_OFFSETS.forEach((offset,i)=>{
        if(elapsed>=offset && !spawnedProteases[i]){
          spawnedProteases[i]=true;
          proteases[i]={
            x: CONSTRUCT_XS[i] + (Math.random()-0.5)*20,
            y: HEADER_H + 10,          // start just below header
            targetIdx: i,
            state: 'approaching',
            cutProgress: 0,
            opacity: 0,
          };
        }
      });

      // update proteases
      proteases.forEach((pr)=>{
        if(!pr) return;
        pr.opacity=Math.min(1,pr.opacity+0.03);
        if(pr.state==='done') return;

        const cleavY=MEMBRANE_Y-WALL_H-70; // approx cleavage site
        const tx=CONSTRUCT_XS[pr.targetIdx]-2, ty=cleavY;
        const dx=tx-pr.x, dy=ty-pr.y;
        const dist=Math.sqrt(dx*dx+dy*dy);

        if(dist>5){
          pr.x+=(dx/dist)*1.9; pr.y+=(dy/dist)*1.9;
        } else {
          pr.state='cutting';
          pr.cutProgress=Math.min(1,pr.cutProgress+0.016);
          cutProgress[pr.targetIdx]=pr.cutProgress;
          if(pr.cutProgress>=0.28&&pr.cutProgress<0.30){
            spawnFreed(CONSTRUCT_XS[pr.targetIdx],cleavY);
          }
          if(pr.cutProgress>=1) pr.state='done';
        }
      });

      CONSTRUCT_XS.forEach((cx2,i)=>drawConstruct(t,cx2,cutProgress[i],constructOp[i]));
      proteases.forEach(pr=>{ if(pr) drawProtease(t,pr.x,pr.y,pr.opacity); });
      updateFreed(); drawFreed();

      // show text when 3 proteases active
      if(!textShown && proteases.filter(Boolean).length>=3){
        textShown=true;
        const txt=document.getElementById('anchored-text');
        if(txt){
          txt.classList.remove('visible');
          setTimeout(()=>{ txt.innerHTML='Anchored iRGD provides tunable control.'; txt.classList.add('visible'); },400);
        }
      }
    }

    ctx.fillStyle='#0e0e0e'; ctx.fillRect(0,0,W,HEADER_H);
    anchoredRAF=requestAnimationFrame(render);
  }

  anchoredRAF=requestAnimationFrame(render);
}