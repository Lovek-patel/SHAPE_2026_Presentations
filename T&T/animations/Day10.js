DAYS.push({label:'Day 10 — Bioprinting & Organoids', short:'D10', slides:[

/* ── TITLE ─────────────────────────────────────────────────────── */
{layout:'title', kicker:'Day 10 · Ch. 28 / 29', title:'Building a Kidney',
 subtitle:'Organoids, bioprinting, and organ-on-chip',
 meta:'Lead: Love Patel'},

/* ── PIVOT SLIDE: DONOR-DEPENDENT VS DONOR-INDEPENDENT ─────────── */
{title:'Two approaches to replacing the kidney', kind:'Context', kicker:'Where we are',
 block:{type:'two-col',
   left:{h:'Donor-dependent', body:[
     '<strong>Day 8:</strong> decellularization and scaffold recellularization',
     'Strip a donor kidney to its extracellular matrix, repopulate with patient cells',
     'Preserves native architecture — but requires a donor organ to start',
     'Supply is still the bottleneck',
   ]},
   right:{h:'Donor-independent', body:[
     '<strong>Today:</strong> organoids, bioprinting, and organ-on-chip',
     'Start from stem cells or from a printer — no donor organ required',
     'Build the architecture from scratch, or grow it from scratch',
     'A fundamentally different engineering problem',
   ]}}},

/* ── ORGANOIDS DIVIDER ───────────────────────────────────────────── */
{layout:'divider', kicker:'Part 1', title:'Organoids',
 subtitle:'Growing a kidney from reprogrammed cells', tag:'iPSC technology'},

/* ── WHAT AN ORGANOID IS ────────────────────────────────────────── */
{title:'Recreating embryonic development in a dish', kind:'Organoids', kicker:'28.1 The Logic',
 subtitle:"Kidney organoid protocols do not invent a new process. They recapitulate one the embryo already runs.",
 block:{type:'split-visual',
   body:[
     '<strong>Metanephric mesenchyme</strong> — gives rise to every nephron epithelial cell: glomerulus, proximal tubule, loop of Henle, distal tubule.',
     '<strong>Ureteric bud</strong> — gives rise to the collecting duct system, ureters, and renal pelvis.',
     'By exposing iPSCs to the right signals in the right order, both lineages can be induced simultaneously. The cells then self-organize into nephron-like structures.',
   ],
   diagram:'<img src="assets/organoid.jpg" alt="Kidney organoid" style="width:100%;height:100%;border-radius:12px;object-fit:cover;">'}},

/* ── TWO PROTOCOLS ──────────────────────────────────────────────── */
{title:'Two landmark protocols, two trade-offs', kind:'Organoids', kicker:'28.2 Differentiation Protocols',
 block:{type:'compare', cols:['Approach','Trade-off'],
   rows:[
     {label:'Takasato et al., 2015', vals:['Single monolayer. CHIR99021 titration generates both MM and UB-like populations.','Faster, but more off-target (neuronal) cells. Lower podocyte purity.']},
     {label:'Morizane et al., 2015', vals:['Suspension culture. Stringent intermediate mesoderm induction step.','Higher podocyte purity, but longer and more complex protocol.']},
   ]}},

/* ── WHAT IS INSIDE ─────────────────────────────────────────────── */
{title:"What is actually inside an organoid at day 25", kind:'Organoids', kicker:'28.3 Cellular Composition',
 block:{type:'split-visual',
   body:[
     {type:'icon-row', items:[
       {icon:'cell',   h:'Podocytes',       p:'Present, but fetal stage. Foot processes are rudimentary. No functional slit diaphragm.'},
       {icon:'filter', h:'Proximal tubule', p:'Most abundant population. Transporter expression (SGLT2, NHE3) is 30-60% of adult levels.'},
       {icon:'branch', h:'Endothelium',     p:'Form capillary-like networks inside the organoid — but not connected to any external blood supply.'},
     ]}
   ],
   diagram:'<img src="assets/organoid2.jpg" alt="Organoid cellular structure" style="width:100%;border-radius:12px;object-fit:cover;">'}},

/* ── VASCULARIZATION PROBLEM WITH MATH ──────────────────────────── */
{title:'The vascularization problem', kind:'Organoids', kicker:'28.4 The Central Barrier',
 subtitle:'No perfusable blood supply means no driving pressure for filtration, and a hard ceiling on organoid size.',
 block:{type:'stack', items:[
   {type:'stat-grid', items:[
     {num:'~200µm', lbl:'maximum distance oxygen can diffuse through tissue without a blood vessel'},
     {num:'~1mm',   lbl:'organoid diameter beyond which a necrotic core develops'},
     {num:'0',      lbl:'driving pressure for glomerular ultrafiltration without perfused vasculature'},
   ]},
   {type:'diffusion-animation'},
   {type:'math-callout',
     tag:'Math connection',
     body:'The 200 µm oxygen diffusion limit is not arbitrary. It follows from Fick\'s second law applied to a cylinder of tissue. The concentration profile follows an exponential decay from the vessel wall outward — the same mathematical structure as the medullary gradient you derived on Day 6.',
     lines:[
       'C(x) = C<sub>0</sub> · e<sup>−x/L</sup>',
       'where L = <span class="hl">D · C<sub>0</sub> / (Q · r²)</span>',
     ],
     note:'D = diffusivity of O₂ in tissue · Q = cellular O₂ consumption rate · Same exponential form as Ce(y) from Day 6.'},
 ]}},

/* ── STRATEGIES TO SOLVE VASCULARIZATION ───────────────────────── */
{title:'Four strategies to get blood flowing', kind:'Organoids', kicker:'28.4.1 Addressing Vascularization',
 block:{type:'icon-row', items:[
   {icon:'pin',     h:'Kidney-capsule engraftment',    p:'Transplant into a mouse. Host vasculature grows in, and podocytes begin to mature toward adult architecture.'},
   {icon:'chip',    h:'Organ-on-chip integration',     p:'Perfuse organoids in microfluidic devices for better oxygen delivery and endothelial alignment.'},
   {icon:'printer', h:'Bioprinted vascular templates', p:'Print a sacrificial channel network, dissolve it after the surrounding material sets, leave perfusable space behind.'},
   {icon:'layers',  h:'Co-culture with endothelium',   p:'Mix organoid cells with umbilical vein endothelial cells. Partial self-assembly of vascular networks inside the organoid.'},
 ]}},

/* ── APPLICATIONS ───────────────────────────────────────────────── */
{title:'Already useful, even before transplantation works', kind:'Organoids', kicker:'28.5 Current Applications',
 block:{type:'two-col',
   left:{h:'Disease modeling', body:[
     'Patient-derived organoids with PKD1/PKD2 mutations spontaneously form cysts — recapitulating polycystic kidney disease in a dish',
     'Drug candidates that slow cyst growth can be screened in hours, not years',
   ]},
   right:{h:'Nephrotoxicity screening', body:[
     'Cisplatin selectively kills proximal tubule cells in organoids, mirroring the clinical injury pattern exactly',
     'Could replace animal models for early-stage drug safety testing — a practical near-term application that does not require a transplantable organ',
   ]}}},

/* ── BIOPRINTING DIVIDER ────────────────────────────────────────── */
{layout:'divider', kicker:'Part 2', title:'3D Bioprinting',
 subtitle:'Placing cells exactly where you want them', tag:'Bioprinting'},

/* ── WHAT BIOPRINTING IS ────────────────────────────────────────── */
{title:'The core idea: precise spatial control', kind:'Bioprinting', kicker:'29.1 What Bioprinting Is',
 block:{type:'split-visual',
   body:[
     'A bioprinter deposits cell-laden hydrogel (bioink) layer by layer, building three-dimensional tissue structures with defined cell placement.',
     'The goal is to recreate the spatial architecture of an organ — the right cell in the right place — without waiting for self-organization.',
     'Unlike organoids, structure is imposed by design. Unlike scaffolds, no donor organ is needed.',
     'The tradeoff: resolution, viability, and printability pull in different directions. No single modality wins on all three.',
   ],
   diagram:'<img src="assets/bioprinter.jpg" alt="Bioprinter depositing bioink" style="width:100%;border-radius:12px;object-fit:cover;">'}},

/* ── FOUR MODALITIES ────────────────────────────────────────────── */
{title:'Four ways to print cells', kind:'Bioprinting', kicker:'29.1 Modalities',
 block:{type:'compare', cols:['Resolution','Key tradeoff'],
   rows:[
     {label:'Extrusion-based',         vals:['100-500 µm', 'High cell density, but shear stress during extrusion kills 10-30% of cells']},
     {label:'Inkjet',                  vals:['20-50 µm',   'High resolution, but limited to low-viscosity bioinks — restricts material choices']},
     {label:'Stereolithography (DLP)', vals:['<10-25 µm',  'Highest spatial resolution, but UV exposure during curing damages DNA and proteins']},
     {label:'Laser-assisted (LAB)',    vals:['Cell-level',  '>95% cell viability, but slow throughput and difficult to scale to organ size']},
   ]}},

/* ── BIOINK MATH CONNECTION ─────────────────────────────────────── */
{title:'The physics behind the viability tradeoff', kind:'Bioprinting', kicker:'Math connection',
 block:{type:'math-callout',
   tag:'Why shear stress kills cells',
   body:'In extrusion-based printing, cells are pushed through a narrow nozzle. The wall shear stress on those cells depends on flow rate and nozzle geometry. This is not a new equation. It is the same fluid mechanics you would use to analyze flow in the proximal tubule. Higher flow rate or smaller nozzle radius raises shear stress, increasing cell death. This is why LAB avoids the nozzle entirely.',
   lines:[
     'τ<sub>wall</sub> = 4ηQ / πr<sup>3</sup>',
   ],
   note:'τ = shear stress (Pa) · η = bioink viscosity · Q = volumetric flow rate · r = nozzle radius. Doubling Q doubles τ. Halving r increases τ by 8×.'}},

/* ── BIOINK DESIGN ──────────────────────────────────────────────── */
{title:'A bioink has to do three things at once', kind:'Bioprinting', kicker:'29.2 Bioink Design',
 block:{type:'bullets', items:[
   '<strong>Printable</strong> — shear-thinning under pressure, solidifying immediately after deposition. Needs the right rheology for the chosen printer modality.',
   '<strong>Cell-compatible</strong> — non-toxic, adequate oxygen and nutrient diffusion during and after printing, gelation mechanism that does not damage cells.',
   '<strong>Biomimetic</strong> — ECM composition that matches what the target cell actually expects. Proximal tubule cells want type IV collagen. Podocytes want laminin. One bioink does not fit all.',
 ]}},

/* ── ORGAN-ON-CHIP DIVIDER ──────────────────────────────────────── */
{layout:'divider', kicker:'Part 3', title:'Organ-on-Chip',
 subtitle:'Adding flow, pressure, and mechanical cues', tag:'Microfluidics'},

/* ── WHAT ORGAN-ON-CHIP IS ──────────────────────────────────────── */
{title:'The core idea: recapitulate the mechanical environment', kind:'OOC', kicker:'29.3 What Organ-on-Chip Is',
 subtitle:'A static dish cannot provide flow, shear, transmembrane pressure, or cyclic stretch. A chip can.',
 block:{type:'stack', items:[
   {type:'chip-animation'},
   {type:'bullets', items:[
     'Two parallel microchannels separated by a thin porous membrane. Upper channel: vascular side. Lower channel: tubular or urinary side.',
     'Cells are seeded on the membrane surface and experience physiological flow — providing mechanical cues that static culture cannot replicate.',
     'The membrane permeability, channel geometry, and pressure gradient are all engineering variables. You design the physiology.',
   ]},
 ]}},

/* ── PROXIMAL TUBULE ON CHIP ────────────────────────────────────── */
{title:'Proximal tubule-on-chip: flow changes everything', kind:'OOC', kicker:'29.3 Proximal Tubule-on-Chip',
 block:{type:'split-visual',
   body:[
     {type:'stat-grid', items:[
       {num:'2-5x', lbl:'increase in SGLT2, NHE3, and AQP1 expression under physiological flow vs. static culture'},
       {num:'2-3x', lbl:'higher transepithelial electrical resistance — tighter junctions, more complete barrier'},
       {num:'0.1 dyn/cm²', lbl:'wall shear stress threshold above which proximal tubule cells develop apical brush border'},
     ]}
   ],
   diagram:'<img src="assets/kidney_chip.jpg" alt="Kidney-on-chip microfluidic device" style="width:100%;border-radius:12px;object-fit:cover;">'}},

/* ── GLOMERULUS ON CHIP: STARLING MATH CONNECTION ───────────────── */
{title:'Glomerulus-on-chip: the Starling equation comes back', kind:'OOC', kicker:'Math connection',
 block:{type:'math-callout',
   tag:'From Day 3 to the chip',
   body:'A glomerulus-on-chip needs to recreate pressure-driven ultrafiltration. The Starling equation tells us exactly what that requires: P_UF = 17 mmHg and a membrane with sufficient Kf. Engineering both simultaneously — at sub-micron scale, with cyclic stretch from each heartbeat — is why the glomerulus-on-chip is the hardest chip to build.',
   lines:[
     'P<sub>UF</sub> = (P<sub>GC</sub> − P<sub>BS</sub>) − (π<sub>GC</sub> − π<sub>BS</sub>) = <span class="hl">17 mmHg</span>',
     'GFR = K<sub>f</sub> · P<sub>UF</sub>  →  need high K<sub>f</sub> = L<sub>p</sub> · S',
   ],
   note:'On a chip, you control P_GC and P_BS directly via pump pressure. But Kf is set by your membrane — and current membranes let albumin leak at 10-100x the rate of a real glomerulus.'}},

/* ── GLOMERULUS ON CHIP HONEST ASSESSMENT ──────────────────────── */
{title:'What glomerulus-on-chip has actually achieved', kind:'OOC', kicker:'29.4 Current State',
 block:{type:'two-col',
   left:{h:'What works', body:[
     'Some size selectivity: molecules above ~70 kDa are partially retained',
     'Some charge selectivity: negatively charged molecules show higher retention',
     'Flow-induced podocyte maturation: cells develop more realistic foot process morphology under shear',
     'Measurable albumin retention — better than static culture, far worse than native glomerulus',
   ]},
   right:{h:'What does not work yet', body:[
     'Albumin leakage is 10-100x higher than native glomerular filtration barrier',
     'No cyclic stretch system has fully replicated cardiac-driven transmembrane pressure oscillations at the right frequency and amplitude',
     'Long-term stability beyond days to weeks is not established',
     'No device has achieved GFR values in the range relevant to replacing kidney function',
   ]}}},

/* ── SYNTHESIS ──────────────────────────────────────────────────── */
{title:'Three technologies, three unsolved problems', kind:'Synthesis', kicker:'Where the field actually is',
 block:{type:'compare', cols:['What it solves','What it does not solve yet'],
   rows:[
     {label:'Organoids', vals:['Self-organizing structure. Patient-derived, autologous. Disease modeling.','Vascularization. Fetal maturation. No filtration without a blood supply.']},
     {label:'Bioprinting', vals:['Precise spatial placement. No donor needed. Scalable in principle.','Resolution vs viability tradeoff. No self-organization. Long-term stability.']},
     {label:'Organ-on-chip', vals:['Mechanical environment. Flow-induced maturation. Drug screening.','GFR far below target. Albumin leakage. Not implantable.']},
   ]}},

/* ── PROJECT REMINDER ───────────────────────────────────────────── */
{layout:'project', kicker:'Project Reminder', title:'Make a Fake Organ',
 subtitle:'Your final project is to design a replacement for part of or an entire organ. It does not have to be a kidney.',
 progress:'By Day 10: Your design should be finalized. Know what you are replacing, how, and what the math says about whether it could work. Written report draft should exist.'},

]});

/* ══════════════════════════════════════════════════════════════════
   THANK YOU + DAY 11 + DAY 12
═══════════════════════════════════════════════════════════════════ */
DAYS.push({label:'Thank You', short:'FIN', slides:[

{layout:'thankyou', title:'Thank You',
 subtitle:'for taking our elective.',
 names:'Kate Iza & Love Patel',
 course:'Tubes & Tissues · SHAPE Program 2026'},

{layout:'workshop', kicker:'Day 11', title:'Project Workshop',
 subtitle:'Open lab. Build it. Model it. Write it.',
 tasks:[
   'Continue or complete your physical build, simulation, or proposal',
   'Work on your written report (250-1,000 words)',
   'Ask questions — both instructors are circulating',
   'If you are stuck: start with the function you want to replace and work backward from the math',
 ]},

{layout:'presentations', kicker:'Day 12', title:'Final Presentations',
 subtitle:'3-5 minutes per team. Then 2-3 minutes of questions.',
 reminders:[
   'Cover the biology of what you are replacing and why it fails',
   'Cover the engineering or modeling approach and the math or quantitative reasoning behind it',
   'Show whatever you built, designed, or simulated — put it in front of people',
   'Be ready for questions on any part of the project, not just your own section',
 ]},

]});
