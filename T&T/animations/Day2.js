DAYS.push({label:'Day 2 — Regenerative Medicine', short:'D2', slides:[

/* ── TITLE ─────────────────────────────────────────────────────── */
{layout:'title', kicker:'Day 2 · Ch. 25', title:'Why Build a Kidney?', subtitle:'An introduction to regenerative medicine', meta:'Lead: Love Patel'},

/* ── OPENING HOOK ───────────────────────────────────────────────── */
{title:'Ten years on dialysis. Worse survival odds than most cancers.',
 kind:'Opening', kicker:'The problem',
 block:{type:'callout-large', text:'That is the standard treatment. Why is it still the default? What would actually replace it?'}},

/* ── SCALE ───────────────────────────────────────────────────────── */
{title:'The scale of the problem', kind:'Context', kicker:'25.1',
 block:{type:'stat-seq-clean', items:[
   {num:'800K+', lbl:'Americans with end-stage renal disease'},
   {num:'4M+',   lbl:'people affected globally'},
   {num:'100K+', lbl:'on the U.S. transplant waitlist'},
   {num:'13',    lbl:'die every day waiting for a kidney'},
 ]}},

/* ── DISTRIBUTION ────────────────────────────────────────────────── */
{title:'The burden is not distributed evenly', kind:'Context', kicker:'Who is most affected',
 block:{type:'split-visual',
   body:[
     'Some populations face ESRD at far higher rates than others',
     'Largely driven by diabetes and hypertension, and by unequal access to early care',
     'A real solution has to work for everyone carrying that burden, not just patients with easy access to care'
   ],
   diagram:'<img src="assets/kidney.jpg" alt="ESRD disparity chart" style="width:100%;border-radius:12px;">'}},

/* ── THREE APPROACHES ────────────────────────────────────────────── */
{title:'Three ways we replace kidney function', kind:'Survey', kicker:'25.2',
 block:{type:'reveal-cards', items:[
   {h:'Hemodialysis', rows:[
     {k:'How', v:'External machine, 3x per week'},
     {k:'10-yr survival', v:'~9%'},
     {k:'Limit', v:'$90,000/yr; cardiovascular strain'},
   ]},
   {h:'Peritoneal Dialysis', rows:[
     {k:'How', v:"Patient's own peritoneum, daily exchanges"},
     {k:'10-yr survival', v:'Similar; better quality of life'},
     {k:'Limit', v:'Compliance; limited toxin clearance'},
   ]},
   {h:'Transplant', rows:[
     {k:'How', v:'Donor kidney, near-full function'},
     {k:'20-yr survival', v:'~50% graft survival'},
     {k:'Limit', v:'~27,000 done/yr vs. 100,000+ waiting'},
   ]},
 ]}},

/* ── WHAT DIALYSIS REPLACES ──────────────────────────────────────── */
{title:'What dialysis  replaces', kind:'Core idea', kicker:'25.3',
 block:{type:'split-visual',
   body:[
     '<strong>Filtration</strong> — partial. ~180 L/day natively vs. ~40 L/week on dialysis',
     '<strong>Tubular function</strong> — absent. No reabsorption, no secretion',
     '<strong>Endocrine function</strong> — absent. EPO, vitamin D, renin all gone'
   ],
   diagram:'<img src="assets/dialysis.jpg" alt="Dialysis schematic" style="width:100%;border-radius:12px;">'}},

/* ── CONSEQUENCES ────────────────────────────────────────────────── */
{title:'What the body does', kind:'Consequence', kicker:'Why it matters',
 block:{type:'bullets', items:[
   '<strong>Acidosis</strong> — bicarbonate added to dialysate to buffer what builds up between sessions',
   '<strong>Potassium swings</strong> — strict diet limits, risky shifts during treatment',
   '<strong>Anemia</strong> — without EPO, hemoglobin can collapse to 6–7 g/dL',
 ]}},

/* ── WHAT A REPLACEMENT NEEDS ────────────────────────────────────── */
{title:'What would a real replacement need to do?', kind:'Synthesis', kicker:'25.4',
 block:{type:'icon-row', items:[
   {icon:'drop',   h:'Filter continuously',     p:'30+ mL/min GFR, around the clock.'},
   {icon:'cycle',  h:'Reabsorb selectively',    p:'~100 L/day of filtrate recovered.'},
   {icon:'shield', h:'Be immune-compatible',    p:'Autologous cells or tolerance.'},
   {icon:'pulse',  h:'Last for years',          p:'2–5 years would already beat dialysis.'},
 ]}},

/* ── SCALE CONSTRAINT ────────────────────────────────────────────── */
{title:'And it has to be buildable at scale', kind:'Synthesis', kicker:'The forgotten constraint',
 block:{type:'callout-large', text:'A device that costs a million dollars and needs a major academic medical center to operate does not solve ESRD for the world. It solves it for a narrow slice of it.'}},

/* ── DISCUSSION ──────────────────────────────────────────────────── */
{title:'What does it mean to replace an organ?', kind:'Discussion', kicker:'Turn and Talk',
 block:{type:'discussion', q:[
   'Is a machine that filters blood a kidney?',
   "Is a clump of cells that can't filter anything yet?",
   'Where is the line, and does it matter?'
 ]}},

/* ── BRIDGE QUOTE ────────────────────────────────────────────────── */
{title:'The bridge between science and the clinic', kind:'Framing', kicker:'A theme for the course',
 block:{type:'quote', text:'Understanding these things mathematically does not diminish their biological elegance.', cite:'On studying the kidney before rebuilding it'}},

/* ── METHODS OVERVIEW (NEW SLIDE) ────────────────────────────────── */
{title:'The approaches we will study', kind:'Methods survey', kicker:'Four strategies',
 block:{type:'icon-row', items:[
   {icon:'layers',  h:'Decellularization', p:'Strip a donor organ to its scaffold, then repopulate it with patient cells.'},
   {icon:'branch',  h:'Organoids',         p:'Grow kidney-like tissue from reprogrammed stem cells in a dish.'},
   {icon:'grid',    h:'Bioprinting',       p:'Place cells in precise spatial patterns using a biological 3D printer.'},
   {icon:'chip',    h:'Kidney-on-chip',    p:'Microfluidic devices that replicate nephron function with real flow.'},
 ]}},

/* ── WHY THE KIDNEY FAILS: CHRONIC / SYSTEMIC ───────────────────── */
{title:'Why kidneys fail: slow', kind:'Pathology', kicker:'Chronic kidney disease',
 block:{type:'icon-row', items:[
   {icon:'drop',   h:'Diabetes mellitus',
    p:'Chronically high glucose glycates the GBM and drives hyperfiltration. Podocytes are lost, the filtration barrier thickens and leaks. Diabetic nephropathy is the leading cause of ESRD worldwide.'},
   {icon:'pulse',  h:'Hypertension',
    p:'Elevated systemic pressure is transmitted to the glomerulus when autoregulation fails. Afferent arterioles thicken, glomerulosclerosis develops, and GFR erodes over years.'},
   {icon:'shield', h:'Glomerulonephritis',
    p:'Immune-mediated inflammation directly targets the filtration barrier. IgA nephropathy, lupus nephritis, and FSGS all attack the glomerulus through different mechanisms, but the endpoint is the same: scarred, non-functional nephrons.'},
 ]}},

/* ── WHY THE KIDNEY FAILS: ACUTE / OBSTRUCTIVE ──────────────────── */
{title:'Why kidneys fail: fast', kind:'Pathology', kicker:'Acute and obstructive',
 block:{type:'icon-row', items:[
   {icon:'grid',   h:'Kidney stones',
    p:'Supersaturation of calcium oxalate, uric acid, or struvite causes crystal nucleation in the tubular lumen. Small stones pass; large ones obstruct urinary flow, raise pressure in Bowman\'s space, and can reduce GFR to near zero in the affected kidney within hours.'},
   {icon:'wave',   h:'Acute kidney injury (AKI)',
    p:'Three categories: prerenal (inadequate blood flow: sepsis, hemorrhage), intrinsic (tubular cell death from ischemia or nephrotoxins like NSAIDs and contrast), and postrenal (downstream obstruction). AKI can be reversible, but repeated episodes accelerate CKD.'},
   {icon:'layers', h:'Congenital and structural',
    p:'Polycystic kidney disease (PKD) causes progressive cyst growth that physically crowds out functional parenchyma. Reflux nephropathy scars the kidney through recurrent infection. These are not lifestyle diseases.'},
 ]}},

/* ── ROADMAP ─────────────────────────────────────────────────────── */
{title:'Where this course is headed', kind:'Roadmap', kicker:'The arc',
 block:{type:'timeline', steps:[
   {h:'Why the kidney fails',      p:'The clinical reality and what current treatments miss'},
   {h:'How it works',              p:'Structure, filtration, concentration, and all the math'},
   {h:'How we try to rebuild it',  p:'Every major regenerative strategy, from scaffolds to bioprinting'},
   {h:'What you will build',       p:'Your project: an organ analog that demonstrates real function'},
 ]}},

/* ── END OF DAY PROJECT REMINDER ─────────────────────────────────── */
{layout:'project', kicker:'Project Reminder', title:'Make a Fake Organ',
 subtitle:'Your final project is to design and build (or model) a functional organ analog. It must demonstrate at least one physiological function. It does not have to be a kidney.',
 progress:'By Day 2: You should be thinking about what organ function interests you most. Start thinking about your groups 8 groups of 3, 2 groups of 2.'},

]});
