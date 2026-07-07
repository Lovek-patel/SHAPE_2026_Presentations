DAYS.push({label:'Day 10 — Bioprinting & Organoids', short:'D10', slides:[

/* ── TITLE ─────────────────────────────────────────────────────── */
{layout:'title', kicker:'Day 10 · Ch. 28 / 29', title:'Building a Kidney, Cell by Cell', subtitle:'3D bioprinting and the organoid revolution', meta:'Lead: Love · which method actually wins?'},

/* ── CALLBACK ───────────────────────────────────────────────────── */
{title:'Last time: starting from a donor organ', kind:'Recap', kicker:'Callback to Day 8',
 block:{type:'callout-large', text:"On Day 8 we stripped a donor kidney down to its extracellular matrix scaffold and asked whether new cells could repopulate it. Today, two methods that don't start with a donor organ at all. They start from stem cells, or from a printer."}},

/* ── TWO PATHS ──────────────────────────────────────────────────── */
{title:'Two paths, same destination', kind:'Roadmap', kicker:"Today's plan",
 block:{type:'split-visual',
   body:[
     '<strong>iPSC-derived organoids</strong> — grow kidney-like tissue from reprogrammed stem cells. Self-organizing: the cells build structure themselves.',
     '<strong>3D bioprinting and organ-on-chip</strong> — place cells in precise spatial patterns by design. Add flow and mechanical cues a dish cannot provide.'
   ],
   diagram:'<img src="assets/organoid.jpg" alt="Kidney organoid fluorescence microscopy" style="width:100%;border-radius:12px;object-fit:cover;">'}},

/* ── DIRECTED DIFFERENTIATION ───────────────────────────────────── */
{title:'Recreating embryonic development, in a dish', kind:'Organoids · Logic', kicker:'28.1 The Logic of Directed Differentiation',
 subtitle:"Kidney organoid protocols don't invent a new process. They recapitulate one the embryo already runs.",
 block:{type:'two-col',
   left:{h:'Metanephric mesenchyme', body:['Gives rise to every nephron epithelial cell: glomerulus, proximal tubule, loop, distal tubule']},
   right:{h:'Ureteric bud',         body:['Gives rise to the collecting duct system, ureters, and renal pelvis']}}},

/* ── PROTOCOLS ──────────────────────────────────────────────────── */
{title:'Two landmark protocols, two trade-offs', kind:'Organoids · Methods', kicker:'28.2 Current Differentiation Protocols',
 block:{type:'compare', cols:['Approach','Trade-off'],
   rows:[
     {label:'Takasato et al., 2015', vals:['Single monolayer, CHIR99021 titration generates both MM and UB-like populations','Faster, but more off-target (neuronal) cells']},
     {label:'Morizane et al., 2015', vals:['Suspension culture, stringent intermediate mesoderm induction','Higher podocyte purity, longer and more complex protocol']},
   ]}},

/* ── WHAT IS INSIDE ─────────────────────────────────────────────── */
{title:"What's actually inside an organoid at day 25", kind:'Organoids · Composition', kicker:'28.3 Cellular Composition',
 block:{type:'split-visual',
   body:[
     {type:'icon-row', items:[
       {icon:'cell',   h:'Podocytes',         p:'Present, but fetal. Foot processes are rudimentary.'},
       {icon:'filter', h:'Proximal tubule',   p:'The most abundant population. Transporter expression is only 30–60% of adult levels.'},
       {icon:'branch', h:'Endothelial cells', p:"Form capillary-like networks inside the organoid — but aren't connected to any external blood supply."},
     ]}
   ],
   diagram:'<img src="assets/organoid2.jpg" alt="Organoid cellular structure" style="width:100%;border-radius:12px;object-fit:cover;">'}},

/* ── VASCULARIZATION PROBLEM ────────────────────────────────────── */
{title:'The vascularization problem', kind:'Organoids · Limitation', kicker:'28.4 — The Central Barrier',
 subtitle:'No perfusable blood supply means no driving pressure for filtration, and a hard ceiling on organoid size.',
 block:{type:'stat-grid', items:[
   {num:'~200µm', lbl:'maximum distance oxygen can diffuse through tissue without a blood supply'},
   {num:'~1mm',   lbl:'organoid diameter beyond which a necrotic core develops'},
   {num:'0',      lbl:'driving pressure for ultrafiltration without a perfused vasculature'},
 ]}},

/* ── STRATEGIES ─────────────────────────────────────────────────── */
{title:'Four strategies to get blood flowing', kind:'Organoids · Solutions', kicker:'28.4.1 Strategies to Address Vascularization',
 block:{type:'icon-row', items:[
   {icon:'pin',     h:'Kidney-capsule engraftment',   p:'Transplant into a mouse. Host vasculature grows in, and podocytes mature toward adult architecture.'},
   {icon:'chip',    h:'Organ-on-chip integration',    p:'Perfuse organoids in microfluidic devices for better oxygen delivery and endothelial alignment.'},
   {icon:'printer', h:'Bioprinted vascular templates', p:'Print a sacrificial channel network, dissolve it, leave perfusable space behind.'},
 ]}},

/* ── APPLICATIONS ───────────────────────────────────────────────── */
{title:'Already useful, even before transplantation works', kind:'Organoids · Application', kicker:'28.5 Current Applications',
 block:{type:'two-col',
   left:{h:'Disease modeling',             body:['Patient-derived organoids with PKD1/PKD2 mutations spontaneously form cysts, recapitulating polycystic kidney disease in a dish']},
   right:{h:'Drug nephrotoxicity screening', body:['Cisplatin selectively kills proximal tubule cells in organoids, mirroring exactly the clinical injury pattern']}}},

/* ── BIOPRINTING TRANSITION ─────────────────────────────────────── */
{layout:'divider', kicker:'Part 2', title:'3D Bioprinting', subtitle:'Placing cells exactly where you want them', tag:'Bioprinting'},

/* ── BIOPRINTING VISUAL ─────────────────────────────────────────── */
{title:'What bioprinting actually looks like', kind:'Bioprinting · Visual', kicker:'The technology',
 block:{type:'full-image', src:'assets/bioprinter.jpg', caption:'A bioprinter depositing cell-laden hydrogel layer by layer. Resolution, cell viability, and printable materials vary dramatically across modalities.'}},

/* ── BIOPRINTING MODALITIES ─────────────────────────────────────── */
{title:'Bioprinting: four ways to place cells precisely', kind:'Bioprinting · Modalities', kicker:'29.1 Principles and Modalities',
 block:{type:'compare', cols:['Resolution','Trade-off'],
   rows:[
     {label:'Extrusion-based',        vals:['100–500 µm',  'High cell density, but 10–30% cell death from shear stress']},
     {label:'Inkjet',                 vals:['20–50 µm',    'High resolution, but limited to low-viscosity bioinks']},
     {label:'Stereolithography / DLP',vals:['<10–25 µm',   'Highest resolution, but UV exposure can damage cells']},
     {label:'Laser-assisted (LAB)',   vals:['Cell-level',  '>95% viability, but slow and hard to scale']},
   ]}},

/* ── BIOINK ─────────────────────────────────────────────────────── */
{title:'A bioink has to do three things at once', kind:'Bioprinting · Materials', kicker:'29.2 Bioink Design',
 block:{type:'bullets', items:[
   '<strong>Printable</strong> — the right rheology for the chosen printer',
   '<strong>Cell-compatible</strong> — non-toxic, enough oxygen and nutrient diffusion',
   '<strong>Biomimetic</strong> — matches the ECM composition the target cell actually expects',
 ]}},

/* ── KIDNEY ON CHIP ─────────────────────────────────────────────── */
{title:'Kidney-on-chip: adding flow back in', kind:'Integration', kicker:'29.3 Proximal Tubule-on-Chip',
 subtitle:'Two parallel microchannels separated by a thin porous membrane — one lined with tubule cells, one simulating blood flow.',
 block:{type:'split-visual',
   body:[
     {type:'stat-grid', items:[
       {num:'2–5x', lbl:'increase in SGLT2, NHE3, AQP1 expression under physiological flow vs. static culture'},
       {num:'2–3x', lbl:'higher transepithelial electrical resistance — tighter, more complete barriers'},
     ]}
   ],
   diagram:'<img src="assets/kidney_chip.jpg" alt="Kidney-on-chip microfluidic device" style="width:100%;border-radius:12px;object-fit:cover;">'}},

/* ── GLOMERULUS ON CHIP ─────────────────────────────────────────── */
{title:'The harder version: glomerulus-on-chip', kind:'Integration', kicker:'29.4 — Why filtration is the hard problem',
 block:{type:'callout-large', text:'Recreating pressure-driven filtration on a chip means a sub-micron membrane, controllable transmembrane pressure, and cyclic mechanical stretch to mimic each heartbeat. Current devices show some size and charge selectivity — but albumin still leaks through at far higher rates than a real glomerulus.'}},

/* ── DISCUSSION ─────────────────────────────────────────────────── */
{title:'Which method is more promising, and why?', kind:'Discussion', kicker:'Closing the loop on Days 8 & 10',
 block:{type:'discussion', q:[
   'Scaffolding starts with a donor organ\'s own architecture.',
   'Bioprinting builds architecture from nothing.',
   'Which problem is actually harder to solve? And does combining them — organoids inside printed scaffolds — get you the best of both?'
 ]}},

/* ── PROJECT REMINDER ───────────────────────────────────────────── */
{layout:'project', kicker:'Project Reminder', title:'Make a Fake Organ',
 subtitle:'Your final project is to design and build (or model) a functional organ analog. It must demonstrate at least one physiological function. It does not have to be a kidney.',
 progress:'By Day 10: You should be finalizing your design. Written report draft should exist. Know whether you are doing a physical build or a theoretical model and have the core components decided.'},

]});

/* ══════════════════════════════════════════════════════════════════
   THANK YOU SLIDE
═══════════════════════════════════════════════════════════════════ */
DAYS.push({label:'Thank You', short:'FIN', slides:[

{layout:'thankyou', title:'Thank You', subtitle:'for taking our elective.',
 names:'Kate Iza & Love Patel',
 course:'Tubes & Tissues · SHAPE Program 2026'},

/* ── DAY 11 ──────────────────────────────────────────────────────── */
{layout:'workshop', kicker:'Day 11', title:'Project Workshop',
 subtitle:'Open lab. Build it. Model it. Write it.',
 tasks:[
   'Continue or complete your physical build or theoretical model',
   'Work on your written report (250–1,000 words)',
   'Ask questions — both instructors are circulating',
   'If you are stuck, start with the function you want to replicate and work backward',
 ]},

/* ── DAY 12 ─────────────────────────────────────────────────────── */
{layout:'presentations', kicker:'Day 12', title:'Final Presentations',
 subtitle:'5–8 minutes per team. Then 2–3 minutes of questions.',
 reminders:[
   'Cover: what your organ does, how you built or modeled it, what it can and cannot do',
   'Show your artifact or your diagrams — whatever you made, put it in front of people',
   'Be ready to field a question about your design choices',
   'You do not need to have solved bioengineering. You need to have thought hard about one piece of it.',
 ]},

]});