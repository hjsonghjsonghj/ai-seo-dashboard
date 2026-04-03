// ============================================================
// AI SEO Dashboard – Figma Design Generator v4
// - Creates Primitives (full Tailwind scales), Semantic, Spacing collections
// - Binds all colors / padding / radius to variables
// - No clone() — fresh frames everywhere
// ============================================================

// ── HEX UTILITY ──────────────────────────────────────────────
function hex(h) {
  return {
    r: parseInt(h.slice(1,3),16)/255,
    g: parseInt(h.slice(3,5),16)/255,
    b: parseInt(h.slice(5,7),16)/255,
  };
}

// ── PRIMITIVE SCALES (full Tailwind palette) ──────────────────
const SCALES = {
  slate:   { 50:'#f8fafc',100:'#f1f5f9',200:'#e2e8f0',300:'#cbd5e1',400:'#94a3b8',500:'#64748b',600:'#475569',700:'#334155',800:'#1e293b',900:'#0f172a',950:'#020617' },
  violet:  { 50:'#f5f3ff',100:'#ede9fe',200:'#ddd6fe',300:'#c4b5fd',400:'#a78bfa',500:'#8b5cf6',600:'#7c3aed',700:'#6d28d9',800:'#5b21b6',900:'#4c1d95',950:'#2e1065' },
  blue:    { 50:'#eff6ff',100:'#dbeafe',200:'#bfdbfe',300:'#93c5fd',400:'#60a5fa',500:'#3b82f6',600:'#2563eb',700:'#1d4ed8',800:'#1e40af',900:'#1e3a8a',950:'#172554' },
  emerald: { 50:'#ecfdf5',100:'#d1fae5',200:'#a7f3d0',300:'#6ee7b7',400:'#34d399',500:'#10b981',600:'#059669',700:'#047857',800:'#065f46',900:'#064e3b',950:'#022c22' },
  red:     { 50:'#fef2f2',100:'#fee2e2',200:'#fecaca',300:'#fca5a5',400:'#f87171',500:'#ef4444',600:'#dc2626',700:'#b91c1c',800:'#991b1b',900:'#7f1d1d',950:'#450a0a' },
  amber:   { 50:'#fffbeb',100:'#fef3c7',200:'#fde68a',300:'#fcd34d',400:'#fbbf24',500:'#f59e0b',600:'#d97706',700:'#b45309',800:'#92400e',900:'#78350f',950:'#451a03' },
};

// ── SEMANTIC MAP (CSS --color-X-Y → Semantic/x/y) ─────────────
const SEM_MAP = [
  { name:'background',           ref:'slate/950'   },
  { name:'foreground/primary',   ref:'slate/100'   },
  { name:'foreground/secondary', ref:'slate/200'   },
  { name:'foreground/tertiary',  ref:'slate/300'   },
  { name:'foreground/strong',    ref:'slate/50'    },
  { name:'foreground/muted',     ref:'slate/400'   },
  { name:'primary/default',      ref:'blue/500'    },
  { name:'input',                ref:'slate/800'   },
  { name:'surface/default',      ref:'slate/900'   },
  { name:'surface/hover',        ref:'slate/800'   },
  { name:'border/primary',       ref:'slate/600'   },
  { name:'border/secondary',     ref:'slate/700'   },
  { name:'brand/deep',           ref:'violet/600'  },
  { name:'brand/default',        ref:'violet/500'  },
  { name:'brand/soft',           ref:'violet/400'  },
  { name:'brand/faint',          ref:'violet/300'  },
  { name:'positive/default',     ref:'emerald/500' },
  { name:'positive/soft',        ref:'emerald/400' },
  { name:'danger/deep',          ref:'red/600'     },
  { name:'danger/default',       ref:'red/500'     },
  { name:'danger/soft',          ref:'red/400'     },
  { name:'caution/default',      ref:'amber/500'   },
  { name:'caution/soft',         ref:'amber/400'   },
  { name:'chart/1',              ref:'violet/500'  },
  { name:'chart/2',              ref:'emerald/500' },
  { name:'chart/4',              ref:'blue/400'    },
];

// ── SPACING / SIZE VALUES ─────────────────────────────────────
const SP_DATA = {
  'Spacing/1':4, 'Spacing/2':8,  'Spacing/3':12,
  'Spacing/4':16,'Spacing/5':20, 'Spacing/6':24, 'Spacing/8':32,
  'Radius/none':0,'Radius/sm':4, 'Radius/md':8,
  'Radius/lg':12,'Radius/full':9999,
  'Size/icon-sm':16,'Size/icon-md':20,'Size/icon-lg':36,
  'Size/nav-btn':40,'Size/header':64,'Size/sidebar':64,
};

// ── CREATE ALL VARIABLES ──────────────────────────────────────
async function createVariables() {
  // 1. Primitives
  const primC = figma.variables.createVariableCollection('Primitives');
  primC.renameMode(primC.defaultModeId,'Default');
  const primM = primC.defaultModeId;
  const P = {};
  for (const [scale, steps] of Object.entries(SCALES)) {
    for (const [step, h] of Object.entries(steps)) {
      const v = figma.variables.createVariable(`${scale}/${step}`, primC, 'COLOR');
      v.setValueForMode(primM, hex(h));
      P[`${scale}/${step}`] = v;
    }
  }

  // 2. Semantic
  const semC = figma.variables.createVariableCollection('Semantic');
  semC.renameMode(semC.defaultModeId,'Default');
  const semM = semC.defaultModeId;
  const S = {};
  for (const { name, ref } of SEM_MAP) {
    const v = figma.variables.createVariable(name, semC, 'COLOR');
    v.setValueForMode(semM, { type:'VARIABLE_ALIAS', id: P[ref].id });
    S[name] = v;
  }

  // 3. Spacing
  const spC = figma.variables.createVariableCollection('Spacing');
  spC.renameMode(spC.defaultModeId,'Default');
  const spM = spC.defaultModeId;
  const SP = {};
  for (const [name, val] of Object.entries(SP_DATA)) {
    const v = figma.variables.createVariable(name, spC, 'FLOAT');
    v.setValueForMode(spM, val);
    SP[name] = v;
  }

  return { S, SP };
}

// ── PAINT HELPERS ─────────────────────────────────────────────
function fPaint(semVar, opacity=1) {
  const p = { type:'SOLID', color:{r:0,g:0,b:0}, opacity };
  return figma.variables.setBoundVariableForPaint(p,'color',semVar);
}
function setFill(node, semVar, opacity=1) { node.fills = [fPaint(semVar,opacity)]; }
function setStroke(node, semVar, weight=1, opacity=1) {
  const p = { type:'SOLID', color:{r:0,g:0,b:0}, opacity };
  node.strokes = [figma.variables.setBoundVariableForPaint(p,'color',semVar)];
  node.strokeWeight = weight;
  node.strokeAlign = 'INSIDE';
}

// ── AUTO-LAYOUT HELPER ────────────────────────────────────────
function AL(node, dir='HORIZONTAL', gap=0, align='CENTER', justify='MIN') {
  node.layoutMode = dir;
  node.itemSpacing = gap;
  node.counterAxisAlignItems = align;
  node.primaryAxisAlignItems = justify;
  node.paddingLeft=0; node.paddingRight=0;
  node.paddingTop=0;  node.paddingBottom=0;
}
function hugBoth(node) {
  node.primaryAxisSizingMode='AUTO';
  node.counterAxisSizingMode='AUTO';
}
function fixBoth(node) {
  node.primaryAxisSizingMode='FIXED';
  node.counterAxisSizingMode='FIXED';
}

// Bind padding variables (requires layoutMode != NONE)
function bindPad(node, SP, top, right, bottom, left) {
  if(top)    node.setBoundVariable('paddingTop',    SP[top]);
  if(right)  node.setBoundVariable('paddingRight',  SP[right]);
  if(bottom) node.setBoundVariable('paddingBottom', SP[bottom]);
  if(left)   node.setBoundVariable('paddingLeft',   SP[left]);
}
function bindPadAll(node, SP, key) {
  node.setBoundVariable('paddingTop',    SP[key]);
  node.setBoundVariable('paddingRight',  SP[key]);
  node.setBoundVariable('paddingBottom', SP[key]);
  node.setBoundVariable('paddingLeft',   SP[key]);
}
function bindPadHV(node, SP, h, v) {
  node.setBoundVariable('paddingLeft',   SP[h]);
  node.setBoundVariable('paddingRight',  SP[h]);
  node.setBoundVariable('paddingTop',    SP[v]);
  node.setBoundVariable('paddingBottom', SP[v]);
}

// ── TEXT ──────────────────────────────────────────────────────
const STYLE_MAP = { Regular:'Regular', Medium:'Medium', SemiBold:'Semi Bold', Bold:'Bold' };
async function T(text, size, weight, semVar, opacity=1) {
  const t = figma.createText();
  t.fontName = { family:'Inter', style: STYLE_MAP[weight]||'Regular' };
  t.fontSize = size;
  t.characters = String(text);
  if (semVar) t.fills = [fPaint(semVar, opacity)];
  return t;
}

// ── ICON PLACEHOLDER ──────────────────────────────────────────
function ICO(size, semVar, opacity=0.6, name='Icon') {
  const f = figma.createFrame();
  f.name = name; f.resize(size,size);
  f.fills = semVar ? [fPaint(semVar,opacity)] : [];
  f.cornerRadius = 3;
  return f;
}

// ── ICON WITH BG ──────────────────────────────────────────────
function iconBg(bgSz, bgVar, bgOp, icoSz, icoVar, SP, radiusKey, name='IconBg') {
  const bg = figma.createFrame();
  bg.name = name; bg.resize(bgSz,bgSz);
  bg.fills = [fPaint(bgVar,bgOp)];
  bg.setBoundVariable('cornerRadius', SP[radiusKey]);
  bg.clipsContent = false;
  AL(bg,'HORIZONTAL',0,'CENTER','CENTER'); fixBoth(bg);
  bg.appendChild(ICO(icoSz, icoVar, 0.8));
  return bg;
}

// ── BADGE ──────────────────────────────────────────────────────
async function badge(label, accentVar, SP) {
  const f = figma.createFrame();
  f.name = 'Badge'; f.resize(Math.max(label.length*6+20,56),22);
  f.fills = [fPaint(accentVar,0.15)];
  f.setBoundVariable('cornerRadius', SP['Radius/full']);
  AL(f,'HORIZONTAL',0,'CENTER','CENTER'); fixBoth(f);
  bindPadHV(f,SP,'Spacing/2','Spacing/1');
  f.appendChild(await T(label,10,'SemiBold',accentVar));
  return f;
}

// ── BUTTON ─────────────────────────────────────────────────────
async function btn(label, bgVar, textVar, w, SP) {
  const f = figma.createFrame();
  f.name = `Btn/${label}`; f.resize(w,32);
  f.fills = [fPaint(bgVar)];
  f.setBoundVariable('cornerRadius', SP['Radius/md']);
  AL(f,'HORIZONTAL',0,'CENTER','CENTER'); fixBoth(f);
  bindPadHV(f,SP,'Spacing/3','Spacing/2');
  f.appendChild(await T(label,13,'SemiBold',textVar));
  return f;
}

// ── COMPONENT WRAPPER ─────────────────────────────────────────
function COMP(name,w,h) {
  const c=figma.createComponent(); c.name=name; c.resize(w,h); c.fills=[];
  return c;
}
function onPage(n) { figma.currentPage.appendChild(n); return n; }

// ════════════════════════════════════════════════════════════
// COMPONENT BUILDERS
// ════════════════════════════════════════════════════════════

async function buildSidebar(S, SP) {
  const c = COMP('Sidebar',64,900);
  setFill(c,S['background']);
  setStroke(c,S['border/secondary'],1);
  c.clipsContent=true;

  // Logo
  const logoArea = figma.createFrame();
  logoArea.name='LogoArea'; logoArea.resize(64,64);
  setFill(logoArea,S['background']);
  AL(logoArea,'HORIZONTAL',0,'CENTER','CENTER'); fixBoth(logoArea);
  logoArea.appendChild(iconBg(36,S['primary/default'],1,20,S['foreground/strong'],SP,'Radius/md','Logo'));
  c.appendChild(logoArea);

  // Top divider
  const topDiv=figma.createFrame(); topDiv.name='TopDiv'; topDiv.resize(64,1);
  setFill(topDiv,S['border/secondary']); topDiv.y=63; c.appendChild(topDiv);

  // Nav items (py-4 px-2 gap-2 → each btn 40×40, x=12)
  const navLabels=['Overview','AI Visibility','Content Ops','Settings'];
  for (let i=0;i<4;i++) {
    const nb=figma.createFrame(); nb.name=`NavBtn/${navLabels[i]}`; nb.resize(40,40);
    if(i===0) setFill(nb,S['surface/hover']); else nb.fills=[];
    nb.setBoundVariable('cornerRadius',SP['Radius/md']);
    AL(nb,'HORIZONTAL',0,'CENTER','CENTER'); fixBoth(nb);
    nb.appendChild(ICO(20,i===0?S['primary/default']:S['foreground/muted']));
    if(i===0){
      const bar=figma.createFrame(); bar.name='ActiveBar'; bar.resize(4,20);
      setFill(bar,S['primary/default']); bar.setBoundVariable('cornerRadius',SP['Radius/sm']);
      bar.x=-20; bar.y=10; nb.appendChild(bar);
    }
    nb.x=12; nb.y=80+i*52; c.appendChild(nb);
  }

  // Bottom divider + avatar
  const botDiv=figma.createFrame(); botDiv.name='BotDiv'; botDiv.resize(64,1);
  setFill(botDiv,S['border/secondary']); botDiv.y=840; c.appendChild(botDiv);
  const avatar=figma.createFrame(); avatar.name='Avatar'; avatar.resize(36,36);
  setFill(avatar,S['surface/hover']); avatar.setBoundVariable('cornerRadius',SP['Radius/full']);
  AL(avatar,'HORIZONTAL',0,'CENTER','CENTER'); fixBoth(avatar);
  avatar.appendChild(await T('PA',13,'Medium',S['foreground/secondary']));
  avatar.x=14; avatar.y=848; c.appendChild(avatar);

  onPage(c); return c;
}

async function buildHeaders(S, SP) {
  // Dashboard header
  const h=COMP('Header/Dashboard',1376,64);
  setFill(h,S['background'],0.8);
  setStroke(h,S['border/secondary'],1,0.5);

  const titleBlk=figma.createFrame(); titleBlk.name='TitleBlock'; titleBlk.fills=[];
  AL(titleBlk,'VERTICAL',2,'MIN'); hugBoth(titleBlk);
  titleBlk.x=24; titleBlk.y=10;
  titleBlk.appendChild(await T('Dashboard Overview',20,'SemiBold',S['foreground/strong']));
  titleBlk.appendChild(await T('Track your AI search visibility and performance',13,'Medium',S['foreground/tertiary']));
  h.appendChild(titleBlk);

  // Search
  const srch=figma.createFrame(); srch.name='SearchInput'; srch.resize(256,36);
  setFill(srch,S['surface/default'],0.3); setStroke(srch,S['border/secondary'],1);
  srch.setBoundVariable('cornerRadius',SP['Radius/md']);
  AL(srch,'HORIZONTAL',8,'CENTER'); fixBoth(srch);
  bindPadHV(srch,SP,'Spacing/3','Spacing/1');
  srch.appendChild(ICO(16,S['foreground/muted']));
  srch.appendChild(await T('Search metrics...',13,'Regular',S['foreground/muted']));
  srch.x=1376-24-36-8-140-8-256; srch.y=14; h.appendChild(srch);

  // Date button
  const datBtn=figma.createFrame(); datBtn.name='DateBtn'; datBtn.resize(140,36);
  setFill(datBtn,S['surface/default'],0.3); setStroke(datBtn,S['border/secondary'],1);
  datBtn.setBoundVariable('cornerRadius',SP['Radius/md']);
  AL(datBtn,'HORIZONTAL',6,'CENTER'); fixBoth(datBtn);
  bindPadHV(datBtn,SP,'Spacing/3','Spacing/1');
  datBtn.appendChild(ICO(16,S['foreground/muted']));
  datBtn.appendChild(await T('Last 30 days',13,'Regular',S['foreground/primary']));
  datBtn.appendChild(ICO(14,S['foreground/muted']));
  datBtn.x=1376-24-36-8-140; datBtn.y=14; h.appendChild(datBtn);

  // Bell
  const bell=figma.createFrame(); bell.name='BellBtn'; bell.resize(36,36);
  setFill(bell,S['surface/default'],0.3); setStroke(bell,S['border/secondary'],1);
  bell.setBoundVariable('cornerRadius',SP['Radius/md']);
  AL(bell,'HORIZONTAL',0,'CENTER','CENTER'); fixBoth(bell);
  bell.appendChild(ICO(16,S['foreground/muted']));
  const dot=figma.createFrame(); dot.name='NotifDot'; dot.resize(16,16);
  setFill(dot,S['primary/default']); dot.setBoundVariable('cornerRadius',SP['Radius/full']);
  AL(dot,'HORIZONTAL',0,'CENTER','CENTER'); fixBoth(dot);
  dot.appendChild(await T('3',10,'SemiBold',S['foreground/strong']));
  dot.x=22; dot.y=-4; bell.appendChild(dot);
  bell.x=1376-24-36; bell.y=14; h.appendChild(bell);
  onPage(h);

  // Back-nav header
  const hb=COMP('Header/BackNav',1376,64);
  setFill(hb,S['background'],0.8);
  setStroke(hb,S['border/secondary'],1,0.5);
  const backRow=figma.createFrame(); backRow.name='BackButton'; backRow.fills=[];
  AL(backRow,'HORIZONTAL',8,'CENTER'); hugBoth(backRow);
  bindPadHV(backRow,SP,'Spacing/2','Spacing/1');
  backRow.appendChild(ICO(16,S['foreground/strong']));
  backRow.appendChild(await T('Back to Dashboard',14,'Medium',S['foreground/strong']));
  backRow.x=16; backRow.y=14; hb.appendChild(backRow);
  onPage(hb);
  return { header:h, headerBack:hb };
}

async function makeStatCard(name,isHover,S,SP) {
  const c=COMP(name,310,156);
  c.setBoundVariable('cornerRadius',SP['Radius/lg']);
  setFill(c,isHover?S['surface/hover']:S['surface/default'],isHover?0.8:0.6);
  setStroke(c,S['border/secondary'],1,0.3);
  c.clipsContent=true;

  const textCol=figma.createFrame(); textCol.name='TextCol'; textCol.fills=[];
  AL(textCol,'VERTICAL',6,'MIN'); hugBoth(textCol);
  textCol.x=20; textCol.y=20;
  textCol.appendChild(await T('AI Share of Voice',13,'Medium',S['foreground/secondary']));
  textCol.appendChild(await T('34.2%',28,'Bold',S['foreground/strong']));
  c.appendChild(textCol);

  const ib=iconBg(40,S['brand/default'],0.15,20,S['brand/soft'],SP,'Radius/md');
  ib.x=250; ib.y=20; c.appendChild(ib);

  const goalRow=figma.createFrame(); goalRow.name='GoalRow'; goalRow.fills=[];
  AL(goalRow,'HORIZONTAL',6,'CENTER'); hugBoth(goalRow);
  goalRow.x=20; goalRow.y=82;
  goalRow.appendChild(await T('Goal:',13,'Medium',S['foreground/tertiary']));
  goalRow.appendChild(await T('40%',13,'SemiBold',S['brand/faint']));
  goalRow.appendChild(await T('(86%)',13,'Medium',S['foreground/tertiary']));
  c.appendChild(goalRow);

  const track=figma.createFrame(); track.name='Track'; track.resize(270,8);
  setFill(track,S['border/secondary']); track.setBoundVariable('cornerRadius',SP['Radius/full']);
  track.x=20; track.y=106; c.appendChild(track);

  const fill=figma.createFrame(); fill.name='Fill'; fill.resize(232,8);
  setFill(fill,S['brand/default']); fill.setBoundVariable('cornerRadius',SP['Radius/full']);
  fill.x=20; fill.y=106; c.appendChild(fill);

  const trendRow=figma.createFrame(); trendRow.name='TrendRow'; trendRow.fills=[];
  AL(trendRow,'HORIZONTAL',6,'CENTER'); hugBoth(trendRow);
  trendRow.x=20; trendRow.y=124;
  trendRow.appendChild(ICO(14,S['positive/soft']));
  trendRow.appendChild(await T('+12.5%',13,'Bold',S['positive/soft']));
  trendRow.appendChild(await T('vs last month',13,'Medium',S['foreground/tertiary']));
  c.appendChild(trendRow);
  return c;
}

async function buildStatCards(S,SP) {
  const def=onPage(await makeStatCard('StatCard/State=Default',false,S,SP));
  const hov=onPage(await makeStatCard('StatCard/State=Hover',true,S,SP));
  const set=figma.combineAsVariants([def,hov],figma.currentPage);
  set.name='StatCard'; return set;
}

const INS_CFGS=[
  {key:'Critical',   typeLabel:'CRITICAL ACTION REQUIRED',headline:'Citation Drop Detected',
   desc:'/technical-seo-checklist lost 23% AI citations in 48 hours.',
   action:'Fix Now',badge:'URGENT',acc:'danger/default'},
  {key:'Opportunity',typeLabel:'GROWTH OPPORTUNITY',      headline:'Emerging Topic Surge',
   desc:'AI engines cite "multimodal SEO" more. First-mover advantage available.',
   action:'Generate Strategy',badge:'HIGH IMPACT',acc:'brand/default'},
  {key:'Optimization',typeLabel:'OPTIMIZATION ALERT',     headline:'Schema Enhancement',
   desc:'Structured data on top 5 pages could increase AI citation accuracy by ~34%.',
   action:'Generate Strategy',badge:'MEDIUM',acc:'caution/default'},
];

async function makeInsightCard(name,cfg,isHover,S,SP) {
  const c=COMP(name,408,216);
  c.setBoundVariable('cornerRadius',SP['Radius/lg']);
  setFill(c,isHover?S['surface/hover']:S['surface/default'],isHover?0.8:0.6);
  setStroke(c,S['border/secondary'],1,0.3);
  const acc=S[cfg.acc];

  // Header row
  const hRow=figma.createFrame(); hRow.name='HRow'; hRow.fills=[];
  AL(hRow,'HORIZONTAL',8,'CENTER','SPACE_BETWEEN'); hugBoth(hRow);
  hRow.x=20; hRow.y=20;
  const left=figma.createFrame(); left.name='Left'; left.fills=[];
  AL(left,'HORIZONTAL',8,'CENTER'); hugBoth(left);
  left.appendChild(iconBg(36,acc,0.15,16,acc,SP,'Radius/md'));
  left.appendChild(await T(cfg.typeLabel,11,'SemiBold',S['foreground/tertiary']));
  hRow.appendChild(left);
  hRow.appendChild(await badge(cfg.badge,acc,SP));
  c.appendChild(hRow);

  const hl=await T(cfg.headline,16,'SemiBold',S['foreground/secondary']);
  hl.x=20; hl.y=72; c.appendChild(hl);

  const desc=await T(cfg.desc,13,'Medium',S['foreground/tertiary']);
  desc.x=20; desc.y=96; desc.resize(368,56); desc.textAutoResize='HEIGHT'; c.appendChild(desc);

  const ab=await btn(cfg.action,acc,S['foreground/strong'],368,SP);
  ab.x=20; ab.y=172; c.appendChild(ab);
  return c;
}

async function buildInsightCards(S,SP) {
  const all=[];
  for (const cfg of INS_CFGS) {
    for (const isH of [false,true]) {
      all.push(onPage(await makeInsightCard(`InsightCard/Type=${cfg.key},State=${isH?'Hover':'Default'}`,cfg,isH,S,SP)));
    }
  }
  const set=figma.combineAsVariants(all,figma.currentPage);
  set.name='InsightCard'; return set;
}

async function buildTrendsChart(S,SP) {
  const c=COMP('TrendsChart',1280,404);
  c.setBoundVariable('cornerRadius',SP['Radius/lg']);
  setFill(c,S['surface/default'],0.6);
  setStroke(c,S['border/secondary'],1,0.3);
  c.clipsContent=true;

  const hdr=figma.createFrame(); hdr.name='CardHeader'; hdr.fills=[];
  hdr.resize(1240,56); AL(hdr,'HORIZONTAL',0,'CENTER','SPACE_BETWEEN');
  hdr.x=20; hdr.y=20;

  const headL=figma.createFrame(); headL.name='Left'; headL.fills=[];
  AL(headL,'VERTICAL',4,'MIN'); hugBoth(headL);
  headL.appendChild(await T('Search Visibility Trends',18,'SemiBold',S['foreground/strong']));
  headL.appendChild(await T('Monthly performance with AI event markers',13,'Medium',S['foreground/tertiary']));
  hdr.appendChild(headL);

  const leg=figma.createFrame(); leg.name='Legend'; leg.fills=[];
  AL(leg,'HORIZONTAL',20,'CENTER'); hugBoth(leg);
  for(const[lbl,key] of [['AI Discovery','chart/1'],['Organic','chart/2'],['Citations','chart/4']]) {
    const li=figma.createFrame(); li.name=`Li/${lbl}`; li.fills=[];
    AL(li,'HORIZONTAL',6,'CENTER'); hugBoth(li);
    const d=figma.createFrame(); d.name='Dot'; d.resize(8,8);
    setFill(d,S[key]); d.setBoundVariable('cornerRadius',SP['Radius/full']);
    li.appendChild(d); li.appendChild(await T(lbl,13,'Medium',S['foreground/secondary']));
    leg.appendChild(li);
  }
  hdr.appendChild(leg); c.appendChild(hdr);

  const divL=figma.createFrame(); divL.name='Divider'; divL.resize(1280,1);
  setFill(divL,S['border/secondary'],0.4); divL.y=76; c.appendChild(divL);

  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const barW=88,startX=60,baseY=344;
  const aiH=[40,48,58,52,76,88,98,112,122,138,148,164];
  const orgH=[30,34,40,44,52,56,62,70,78,84,92,100];
  const citH=[20,24,32,28,40,48,52,58,66,74,76,88];
  for(let i=0;i<12;i++){
    const x=startX+i*barW;
    const ai=figma.createFrame();  ai.name=`AI/${months[i]}`;  ai.resize(barW-2,aiH[i]);
    const org=figma.createFrame(); org.name=`Org/${months[i]}`; org.resize(barW-2,orgH[i]);
    const cit=figma.createFrame(); cit.name=`Cit/${months[i]}`; cit.resize(barW-2,citH[i]);
    setFill(ai,S['chart/1'],0.15);  ai.x=x;  ai.y=baseY-aiH[i];
    setFill(org,S['chart/2'],0.12); org.x=x; org.y=baseY-orgH[i];
    setFill(cit,S['chart/4'],0.10); cit.x=x; cit.y=baseY-citH[i];
    c.appendChild(ai); c.appendChild(org); c.appendChild(cit);
    const dt=figma.createFrame(); dt.name=`Dot/${months[i]}`; dt.resize(6,6);
    setFill(dt,S['chart/1']); dt.setBoundVariable('cornerRadius',SP['Radius/full']);
    dt.x=x+barW/2-3; dt.y=baseY-aiH[i]-5; c.appendChild(dt);
    const xl=await T(months[i],11,'Regular',S['foreground/muted']);
    xl.x=x+(barW-24)/2; xl.y=baseY+8; c.appendChild(xl);
  }
  for(let i=0;i<5;i++){
    const gl=figma.createFrame(); gl.name='Grid'; gl.resize(1200,1);
    setFill(gl,S['border/secondary'],0.3); gl.x=40; gl.y=88+i*56; c.appendChild(gl);
    const yl=await T(['8K','6K','4K','2K','0'][i],11,'Regular',S['foreground/muted']);
    yl.x=8; yl.y=88+i*56-7; c.appendChild(yl);
  }
  for(const ev of [{i:2,lbl:'Google Update'},{i:5,lbl:'Competitor'},{i:7,lbl:'Algorithm'},{i:10,lbl:'ChatGPT'}]){
    const ex=startX+ev.i*barW+barW/2;
    const evL=figma.createFrame(); evL.name='EvLine'; evL.resize(1,240);
    setFill(evL,S['brand/deep'],0.5); evL.x=ex; evL.y=96; c.appendChild(evL);
    const evT=await T(ev.lbl,10,'Medium',S['brand/soft']);
    evT.x=ex-24; evT.y=80; c.appendChild(evT);
  }
  onPage(c); return c;
}

async function buildCitationsTable(S,SP) {
  const ROWS=5,RH=44,TH=44,CH=60,W=1280;
  const totalH=CH+TH+ROWS*RH+8;
  const c=COMP('CitationsTable',W,totalH);
  c.setBoundVariable('cornerRadius',SP['Radius/lg']);
  setFill(c,S['surface/default'],0.6);
  setStroke(c,S['border/secondary'],1,0.3);
  c.clipsContent=true;

  const titleT=await T('Top 5 AI Search Citations',18,'SemiBold',S['foreground/secondary']);
  titleT.x=20; titleT.y=14; c.appendChild(titleT);
  const subT=await T('Real-time tracking with optimization status',13,'Medium',S['foreground/tertiary']);
  subT.x=20; subT.y=34; c.appendChild(subT);

  const vaBtn=figma.createFrame(); vaBtn.name='ViewAllBtn'; vaBtn.resize(100,32);
  setFill(vaBtn,S['surface/hover'],0.5); setStroke(vaBtn,S['border/secondary'],1);
  vaBtn.setBoundVariable('cornerRadius',SP['Radius/md']);
  AL(vaBtn,'HORIZONTAL',4,'CENTER','CENTER'); fixBoth(vaBtn);
  bindPadHV(vaBtn,SP,'Spacing/3','Spacing/1');
  vaBtn.appendChild(await T('View all',13,'Medium',S['foreground/secondary']));
  vaBtn.appendChild(ICO(12,S['foreground/muted']));
  vaBtn.x=W-120; vaBtn.y=16; c.appendChild(vaBtn);

  const hD=figma.createFrame(); hD.name='HdrDiv'; hD.resize(W,1);
  setFill(hD,S['border/secondary'],0.4); hD.y=CH-1; c.appendChild(hD);
  const thBg=figma.createFrame(); thBg.name='TheadBg'; thBg.resize(W,TH);
  setFill(thBg,S['surface/default'],0.3); thBg.y=CH; c.appendChild(thBg);

  const cols=[
    {lbl:'SOURCE',x:0,w:140},{lbl:'PAGE',x:140,w:300},{lbl:'MENTIONS',x:440,w:120},
    {lbl:'TREND',x:560,w:100},{lbl:'OPTIMIZATION',x:660,w:120},
    {lbl:'LAST SEEN',x:780,w:140},{lbl:'QUICK ACTION',x:920,w:120},
  ];
  for(const col of cols){
    const t=await T(col.lbl,11,'SemiBold',S['foreground/tertiary']);
    t.textAlignHorizontal='CENTER'; t.resize(col.w-8,14);
    t.x=col.x+4; t.y=CH+15; c.appendChild(t);
  }
  const thD=figma.createFrame(); thD.name='TheadDiv'; thD.resize(W,1);
  setFill(thD,S['border/secondary'],0.5); thD.y=CH+TH-1; c.appendChild(thD);

  const rowsD=[
    {src:'ChatGPT',pg:'/best-seo-tools-2026',men:'847',tr:'↑',opt:96,ok:'positive/default',ls:'2 min ago'},
    {src:'Claude',pg:'/ai-content-optimization',men:'623',tr:'↑',opt:78,ok:'caution/default',ls:'5 min ago'},
    {src:'Perplexity',pg:'/enterprise-seo-guide',men:'534',tr:'↑',opt:63,ok:'caution/default',ls:'8 min ago'},
    {src:'Google AI',pg:'/structured-data-guide',men:'412',tr:'↑',opt:35,ok:'danger/default',ls:'11 min ago'},
    {src:'Copilot',pg:'/link-building-strategies',men:'389',tr:'↑',opt:92,ok:'positive/default',ls:'3 min ago'},
  ];
  for(let ri=0;ri<rowsD.length;ri++){
    const rd=rowsD[ri]; const ry=CH+TH+ri*RH;
    if(ri%2!==0){const bg=figma.createFrame();bg.name='RowBg';bg.resize(W,RH);setFill(bg,S['surface/default'],0.12);bg.y=ry;c.appendChild(bg);}
    const addC=async(text,x,w,sz,wt,ck,center=true)=>{const t=await T(text,sz,wt,S[ck]);if(center)t.textAlignHorizontal='CENTER';t.resize(w-8,18);t.x=x+4;t.y=ry+13;c.appendChild(t);};
    await addC(rd.src,cols[0].x,cols[0].w,14,'SemiBold','foreground/secondary');
    await addC(rd.pg,cols[1].x,cols[1].w,13,'Medium','foreground/tertiary',false);
    await addC(rd.men,cols[2].x,cols[2].w,14,'SemiBold','foreground/secondary');
    await addC(rd.tr,cols[3].x,cols[3].w,14,'Bold','positive/soft');
    const ring=figma.createFrame();ring.name='Ring';ring.resize(36,36);
    setFill(ring,S[rd.ok],0.15);ring.setBoundVariable('cornerRadius',SP['Radius/full']);
    ring.x=cols[4].x+42;ring.y=ry+4;
    const rT=await T(`${rd.opt}%`,10,'SemiBold',S[rd.ok]);
    rT.textAlignHorizontal='CENTER';rT.resize(36,12);rT.x=0;rT.y=12;ring.appendChild(rT);c.appendChild(ring);
    await addC(rd.ls,cols[5].x,cols[5].w,13,'Medium','foreground/tertiary');
    const rv=figma.createFrame();rv.name='ReviewBtn';rv.resize(72,28);
    setFill(rv,S['brand/default'],0.1);setStroke(rv,S['brand/default'],1,0.3);
    rv.setBoundVariable('cornerRadius',SP['Radius/sm']);
    AL(rv,'HORIZONTAL',4,'CENTER','CENTER');fixBoth(rv);
    bindPadHV(rv,SP,'Spacing/2','Spacing/1');
    rv.appendChild(ICO(12,S['brand/faint']));
    rv.appendChild(await T('Review',12,'SemiBold',S['brand/faint']));
    rv.x=cols[6].x+24;rv.y=ry+8;c.appendChild(rv);
    if(ri<rowsD.length-1){const rD=figma.createFrame();rD.name='RowDiv';rD.resize(W,1);setFill(rD,S['border/secondary'],0.25);rD.y=ry+RH-1;c.appendChild(rD);}
  }
  onPage(c); return c;
}

async function buildFilterBar(S,SP) {
  const c=COMP('FilterBar',1280,100);
  c.setBoundVariable('cornerRadius',SP['Radius/lg']);
  setFill(c,S['surface/default'],0.6);
  setStroke(c,S['border/secondary'],1,0.3);

  const titleT=await T('Filters',16,'SemiBold',S['foreground/secondary']);
  titleT.x=20; titleT.y=16; c.appendChild(titleT);

  const row=figma.createFrame(); row.name='Controls'; row.fills=[];
  AL(row,'HORIZONTAL',16,'CENTER'); hugBoth(row);
  row.x=20; row.y=50;

  const selBox=async(label,w)=>{
    const s=figma.createFrame(); s.name=label; s.resize(w,36);
    setFill(s,S['surface/hover'],0.5); setStroke(s,S['border/secondary'],1);
    s.setBoundVariable('cornerRadius',SP['Radius/md']);
    AL(s,'HORIZONTAL',8,'CENTER'); fixBoth(s);
    bindPadHV(s,SP,'Spacing/3','Spacing/1');
    s.appendChild(ICO(16,S['foreground/muted']));
    s.appendChild(await T(label,14,'Regular',S['foreground/primary']));
    s.appendChild(ICO(12,S['foreground/muted'],0.5,'Chevron'));
    return s;
  };
  row.appendChild(await selBox('Last 30 days',160));
  row.appendChild(await selBox('All Sources',180));

  const srch=figma.createFrame(); srch.name='SearchInput'; srch.resize(400,36);
  setFill(srch,S['surface/hover'],0.5); setStroke(srch,S['border/secondary'],1);
  srch.setBoundVariable('cornerRadius',SP['Radius/md']);
  AL(srch,'HORIZONTAL',8,'CENTER'); fixBoth(srch);
  bindPadHV(srch,SP,'Spacing/3','Spacing/1');
  srch.appendChild(ICO(16,S['foreground/muted']));
  srch.appendChild(await T('Search by source or page...',14,'Regular',S['foreground/muted']));
  row.appendChild(srch);
  c.appendChild(row); onPage(c); return c;
}

async function buildBulkBar(S,SP) {
  const c=COMP('BulkActionBar',480,52);
  c.setBoundVariable('cornerRadius',SP['Radius/lg']);
  setFill(c,S['background'],0.95); setStroke(c,S['border/secondary'],1);
  AL(c,'HORIZONTAL',12,'CENTER'); fixBoth(c);
  bindPadHV(c,SP,'Spacing/4','Spacing/2');

  c.appendChild(await T('3 citations selected',14,'Medium',S['foreground/secondary']));

  const expBtn=figma.createFrame(); expBtn.name='ExportBtn'; expBtn.resize(80,32);
  setFill(expBtn,S['surface/hover']); setStroke(expBtn,S['border/secondary'],1);
  expBtn.setBoundVariable('cornerRadius',SP['Radius/md']);
  AL(expBtn,'HORIZONTAL',0,'CENTER','CENTER'); fixBoth(expBtn);
  bindPadHV(expBtn,SP,'Spacing/3','Spacing/1');
  expBtn.appendChild(await T('Export',13,'Medium',S['foreground/primary']));
  c.appendChild(expBtn);

  const resBtn=figma.createFrame(); resBtn.name='ResolveBtn'; resBtn.resize(148,32);
  setFill(resBtn,S['brand/default']);
  resBtn.setBoundVariable('cornerRadius',SP['Radius/md']);
  AL(resBtn,'HORIZONTAL',0,'CENTER','CENTER'); fixBoth(resBtn);
  bindPadHV(resBtn,SP,'Spacing/3','Spacing/1');
  resBtn.appendChild(await T('Mark as Resolved',13,'Medium',S['foreground/strong']));
  c.appendChild(resBtn);

  onPage(c); return c;
}

// ════════════════════════════════════════════════════════════
// INSTANCE BUILDERS (fresh frames for assembly pages)
// ════════════════════════════════════════════════════════════

async function makeSidebarInst(h,S,SP) {
  const c=figma.createFrame(); c.name='Sidebar'; c.resize(64,h);
  setFill(c,S['background']); setStroke(c,S['border/secondary'],1); c.clipsContent=true;
  const logoA=figma.createFrame(); logoA.name='LogoArea'; logoA.resize(64,64);
  setFill(logoA,S['background']); AL(logoA,'HORIZONTAL',0,'CENTER','CENTER'); fixBoth(logoA);
  logoA.appendChild(iconBg(36,S['primary/default'],1,20,S['foreground/strong'],SP,'Radius/md','Logo'));
  c.appendChild(logoA);
  const tD=figma.createFrame(); tD.name='TopDiv'; tD.resize(64,1);
  setFill(tD,S['border/secondary']); tD.y=63; c.appendChild(tD);
  const navL=['Overview','AI Visibility','Content Ops','Settings'];
  for(let i=0;i<4;i++){
    const nb=figma.createFrame(); nb.name=`NavBtn/${navL[i]}`; nb.resize(40,40);
    if(i===0)setFill(nb,S['surface/hover']);else nb.fills=[];
    nb.setBoundVariable('cornerRadius',SP['Radius/md']);
    AL(nb,'HORIZONTAL',0,'CENTER','CENTER'); fixBoth(nb);
    nb.appendChild(ICO(20,i===0?S['primary/default']:S['foreground/muted']));
    if(i===0){const bar=figma.createFrame();bar.name='ActiveBar';bar.resize(4,20);setFill(bar,S['primary/default']);bar.setBoundVariable('cornerRadius',SP['Radius/sm']);bar.x=-20;bar.y=10;nb.appendChild(bar);}
    nb.x=12; nb.y=80+i*52; c.appendChild(nb);
  }
  const bD=figma.createFrame(); bD.name='BotDiv'; bD.resize(64,1);
  setFill(bD,S['border/secondary']); bD.y=h-56; c.appendChild(bD);
  const av=figma.createFrame(); av.name='Avatar'; av.resize(36,36);
  setFill(av,S['surface/hover']); av.setBoundVariable('cornerRadius',SP['Radius/full']);
  AL(av,'HORIZONTAL',0,'CENTER','CENTER'); fixBoth(av);
  av.appendChild(await T('PA',13,'Medium',S['foreground/secondary']));
  av.x=14; av.y=h-50; c.appendChild(av);
  return c;
}

async function makeStatCardInst(cfg,w,S,SP) {
  const f=figma.createFrame(); f.name=`StatCard/${cfg.title}`; f.resize(w,152);
  f.setBoundVariable('cornerRadius',SP['Radius/lg']);
  setFill(f,S['surface/default'],0.6); setStroke(f,S['border/secondary'],1,0.3); f.clipsContent=true;

  const tc=figma.createFrame(); tc.name='TextCol'; tc.fills=[];
  AL(tc,'VERTICAL',6,'MIN'); hugBoth(tc); tc.x=20; tc.y=20;
  tc.appendChild(await T(cfg.title,13,'Medium',S['foreground/secondary']));
  tc.appendChild(await T(cfg.value,26,'Bold',S['foreground/strong']));
  f.appendChild(tc);

  const ib=iconBg(40,S['brand/default'],0.15,20,S['brand/soft'],SP,'Radius/md');
  ib.x=w-60; ib.y=20; f.appendChild(ib);

  const gT=await T(`Goal: ${cfg.goal}  (${cfg.pct}%)`,13,'Medium',S['foreground/tertiary']);
  gT.x=20; gT.y=82; f.appendChild(gT);

  const trk=figma.createFrame(); trk.name='Track'; trk.resize(w-40,8);
  setFill(trk,S['border/secondary']); trk.setBoundVariable('cornerRadius',SP['Radius/full']);
  trk.x=20; trk.y=106; f.appendChild(trk);
  const fw=Math.round((w-40)*cfg.pct/100);
  const fl=figma.createFrame(); fl.name='Fill'; fl.resize(fw,8);
  setFill(fl,S['brand/default']); fl.setBoundVariable('cornerRadius',SP['Radius/full']);
  fl.x=20; fl.y=106; f.appendChild(fl);

  const tk=cfg.isUp?'positive/soft':'danger/soft';
  const tr=figma.createFrame(); tr.name='TrendRow'; tr.fills=[];
  AL(tr,'HORIZONTAL',6,'CENTER'); hugBoth(tr); tr.x=20; tr.y=124;
  tr.appendChild(ICO(14,S[tk]));
  tr.appendChild(await T(cfg.change,13,'Bold',S[tk]));
  tr.appendChild(await T('vs last month',13,'Medium',S['foreground/tertiary']));
  f.appendChild(tr);
  return f;
}

async function makeInsightCardInst(cfg,w,S,SP) {
  const f=figma.createFrame(); f.name=`InsightCard/${cfg.key}`; f.resize(w,216);
  f.setBoundVariable('cornerRadius',SP['Radius/lg']);
  setFill(f,S['surface/default'],0.6); setStroke(f,S['border/secondary'],1,0.3); f.clipsContent=true;
  const acc=S[cfg.acc];

  const ib=iconBg(36,acc,0.15,16,acc,SP,'Radius/md');
  ib.x=20; ib.y=20; f.appendChild(ib);
  const tT=await T(cfg.typeLabel,11,'SemiBold',S['foreground/tertiary']);
  tT.x=64; tT.y=28; f.appendChild(tT);
  const bdg=await badge(cfg.badge,acc,SP);
  bdg.x=w-bdg.width-20; bdg.y=26; f.appendChild(bdg);
  const hl=await T(cfg.headline,15,'SemiBold',S['foreground/secondary']);
  hl.x=20; hl.y=68; f.appendChild(hl);
  const dc=await T(cfg.desc,13,'Medium',S['foreground/tertiary']);
  dc.x=20; dc.y=88; dc.resize(w-40,52); dc.textAutoResize='HEIGHT'; f.appendChild(dc);
  const ab=await btn(cfg.action,acc,S['foreground/strong'],w-40,SP);
  ab.x=20; ab.y=172; f.appendChild(ab);
  return f;
}

async function buildDetailedTable(w,S,SP) {
  const ROWS=8,RH=48,TH=44,CH=60;
  const totalH=CH+TH+ROWS*RH+8;
  const card=figma.createFrame(); card.name='CitationsTable/Detail'; card.resize(w,totalH);
  card.setBoundVariable('cornerRadius',SP['Radius/lg']);
  setFill(card,S['surface/default'],0.6); setStroke(card,S['border/secondary'],1,0.3); card.clipsContent=true;

  const tT=await T('AI Search Citations',18,'SemiBold',S['foreground/secondary']); tT.x=20; tT.y=14; card.appendChild(tT);
  const sT=await T('Real-time tracking with optimization status',13,'Medium',S['foreground/tertiary']); sT.x=20; sT.y=34; card.appendChild(sT);
  const cT=await T('25 citations',14,'Medium',S['foreground/tertiary']); cT.x=w-120; cT.y=24; card.appendChild(cT);

  const hD=figma.createFrame();hD.name='HdrDiv';hD.resize(w,1);setFill(hD,S['border/secondary'],0.4);hD.y=CH-1;card.appendChild(hD);
  const thB=figma.createFrame();thB.name='TheadBg';thB.resize(w,TH);setFill(thB,S['surface/default'],0.3);thB.y=CH;card.appendChild(thB);

  const cols=[
    {lbl:'☑',x:0,w:48},{lbl:'SOURCE',x:48,w:140},{lbl:'PAGE',x:188,w:260},
    {lbl:'MENTIONS ↓',x:448,w:130,act:true},{lbl:'TREND',x:578,w:90},
    {lbl:'OPTIMIZATION',x:668,w:130},{lbl:'LAST SEEN',x:798,w:120},{lbl:'QUICK ACTION',x:918,w:120},
  ];
  for(const col of cols){const t=await T(col.lbl,11,'SemiBold',col.act?S['foreground/strong']:S['foreground/tertiary']);t.textAlignHorizontal='CENTER';t.resize(col.w-8,14);t.x=col.x+4;t.y=CH+15;card.appendChild(t);}
  const thD=figma.createFrame();thD.name='TheadDiv';thD.resize(w,1);setFill(thD,S['border/secondary'],0.5);thD.y=CH+TH-1;card.appendChild(thD);

  const rData=[
    {chk:true, src:'ChatGPT',   pg:'/best-seo-tools-2026',     men:'847',tr:'↑',opt:96,ok:'positive/default',ls:'2 min ago'},
    {chk:false,src:'Claude',    pg:'/ai-content-optimization',  men:'623',tr:'↑',opt:78,ok:'caution/default', ls:'5 min ago'},
    {chk:true, src:'Perplexity',pg:'/enterprise-seo-guide',     men:'534',tr:'↑',opt:63,ok:'caution/default', ls:'8 min ago'},
    {chk:false,src:'Google AI', pg:'/structured-data-guide',    men:'412',tr:'↑',opt:35,ok:'danger/default',  ls:'11 min ago'},
    {chk:false,src:'Copilot',   pg:'/link-building-strategies', men:'389',tr:'↑',opt:92,ok:'positive/default',ls:'3 min ago'},
    {chk:false,src:'ChatGPT',   pg:'/on-page-seo-checklist',    men:'756',tr:'↑',opt:82,ok:'positive/default',ls:'7 min ago'},
    {chk:false,src:'Claude',    pg:'/keyword-research-2026',    men:'621',tr:'↑',opt:28,ok:'danger/default',  ls:'15 min ago'},
    {chk:false,src:'Perplexity',pg:'/local-seo-strategy',       men:'445',tr:'↑',opt:97,ok:'positive/default',ls:'20 min ago'},
  ];
  for(let ri=0;ri<rData.length;ri++){
    const rd=rData[ri]; const ry=CH+TH+ri*RH;
    if(rd.chk){const hl=figma.createFrame();hl.name='RowHL';hl.resize(w,RH);setFill(hl,S['positive/default'],0.05);hl.y=ry;card.appendChild(hl);}
    else if(ri%2!==0){const rb=figma.createFrame();rb.name='RowBg';rb.resize(w,RH);setFill(rb,S['surface/default'],0.1);rb.y=ry;card.appendChild(rb);}
    const chk=figma.createFrame();chk.name='Chk';chk.resize(16,16);
    setFill(chk,rd.chk?S['primary/default']:S['border/secondary'],rd.chk?1:0.4);
    chk.setBoundVariable('cornerRadius',SP['Radius/sm']);chk.x=16;chk.y=ry+(RH-16)/2;card.appendChild(chk);
    const addT=async(text,x,w2,sz,wt,ck,center=true)=>{const t=await T(text,sz,wt,S[ck]);if(center)t.textAlignHorizontal='CENTER';t.resize(w2-8,18);t.x=x+4;t.y=ry+15;card.appendChild(t);};
    await addT(rd.src,cols[1].x,cols[1].w,14,'SemiBold','foreground/secondary');
    await addT(rd.pg, cols[2].x,cols[2].w,13,'Medium','foreground/tertiary',false);
    await addT(rd.men,cols[3].x,cols[3].w,14,'SemiBold','foreground/secondary');
    await addT(rd.tr, cols[4].x,cols[4].w,14,'Bold','positive/soft');
    const ring=figma.createFrame();ring.name='Ring';ring.resize(36,36);setFill(ring,S[rd.ok],0.15);ring.setBoundVariable('cornerRadius',SP['Radius/full']);
    ring.x=cols[5].x+47;ring.y=ry+6;
    const rT=await T(`${rd.opt}%`,10,'SemiBold',S[rd.ok]);rT.textAlignHorizontal='CENTER';rT.resize(36,12);rT.x=0;rT.y=12;ring.appendChild(rT);card.appendChild(ring);
    await addT(rd.ls,cols[6].x,cols[6].w,13,'Medium','foreground/tertiary');
    const rv=figma.createFrame();rv.name='ReviewBtn';rv.resize(72,28);
    setFill(rv,S['brand/default'],0.1);setStroke(rv,S['brand/default'],1,0.3);
    rv.setBoundVariable('cornerRadius',SP['Radius/sm']);
    AL(rv,'HORIZONTAL',4,'CENTER','CENTER');fixBoth(rv);bindPadHV(rv,SP,'Spacing/2','Spacing/1');
    rv.appendChild(ICO(12,S['brand/faint']));rv.appendChild(await T('Review',12,'SemiBold',S['brand/faint']));
    rv.x=cols[7].x+24;rv.y=ry+10;card.appendChild(rv);
    if(ri<rData.length-1){const rDiv=figma.createFrame();rDiv.name='RowDiv';rDiv.resize(w,1);setFill(rDiv,S['border/secondary'],0.25);rDiv.y=ry+RH-1;card.appendChild(rDiv);}
  }
  return card;
}

// ════════════════════════════════════════════════════════════
// ASSEMBLY
// ════════════════════════════════════════════════════════════

async function assembleDashboard(comps,S,SP) {
  const CW=1440,MX=64,PAD=24,CONTENT=CW-MX-PAD*2;
  const pf=figma.createFrame(); pf.name='📊 Dashboard – 1440px'; pf.resize(CW,100);
  setFill(pf,S['background']); pf.clipsContent=true; pf.x=2200; pf.y=0;
  figma.currentPage.appendChild(pf);

  const sb=await makeSidebarInst(4000,S,SP); sb.x=0; sb.y=0; pf.appendChild(sb);

  // Header
  const hdr=figma.createFrame(); hdr.name='Header'; hdr.resize(CW-MX,64);
  setFill(hdr,S['background'],0.8); setStroke(hdr,S['border/secondary'],1,0.5);
  const tBlk=figma.createFrame(); tBlk.name='TitleBlock'; tBlk.fills=[];
  AL(tBlk,'VERTICAL',2,'MIN'); hugBoth(tBlk); tBlk.x=24; tBlk.y=10;
  tBlk.appendChild(await T('Dashboard Overview',20,'SemiBold',S['foreground/strong']));
  tBlk.appendChild(await T('Track your AI search visibility and performance',13,'Medium',S['foreground/tertiary']));
  hdr.appendChild(tBlk);
  const dBtn=figma.createFrame(); dBtn.name='DateBtn'; dBtn.resize(140,36);
  setFill(dBtn,S['surface/default'],0.3);setStroke(dBtn,S['border/secondary'],1);
  dBtn.setBoundVariable('cornerRadius',SP['Radius/md']);AL(dBtn,'HORIZONTAL',6,'CENTER');fixBoth(dBtn);
  bindPadHV(dBtn,SP,'Spacing/3','Spacing/1');
  dBtn.appendChild(ICO(16,S['foreground/muted']));dBtn.appendChild(await T('Last 30 days',13,'Regular',S['foreground/primary']));dBtn.appendChild(ICO(14,S['foreground/muted']));
  dBtn.x=CW-MX-24-36-8-140; dBtn.y=14; hdr.appendChild(dBtn);
  const bl=figma.createFrame();bl.name='BellBtn';bl.resize(36,36);setFill(bl,S['surface/default'],0.3);setStroke(bl,S['border/secondary'],1);bl.setBoundVariable('cornerRadius',SP['Radius/md']);AL(bl,'HORIZONTAL',0,'CENTER','CENTER');fixBoth(bl);bl.appendChild(ICO(16,S['foreground/muted']));
  const nd=figma.createFrame();nd.name='NotifDot';nd.resize(16,16);setFill(nd,S['primary/default']);nd.setBoundVariable('cornerRadius',SP['Radius/full']);AL(nd,'HORIZONTAL',0,'CENTER','CENTER');fixBoth(nd);nd.appendChild(await T('3',10,'SemiBold',S['foreground/strong']));nd.x=22;nd.y=-4;bl.appendChild(nd);
  bl.x=CW-MX-24-36; bl.y=14; hdr.appendChild(bl);
  hdr.x=MX; hdr.y=0; pf.appendChild(hdr);

  let y=80;

  // Stat cards
  const statW=Math.floor((CONTENT-48)/4);
  const sCfgs=[
    {title:'AI Share of Voice',  value:'34.2%', change:'+12.5%',goal:'40%',pct:86,isUp:true},
    {title:'Content Health',     value:'87',    change:'+8.3%', goal:'95', pct:92,isUp:true},
    {title:'Citation Accuracy',  value:'92.4%', change:'-2.1%', goal:'98%',pct:94,isUp:false},
    {title:'Projected Growth',   value:'+23.8%',change:'+15.7%',goal:'30%',pct:79,isUp:true},
  ];
  for(let i=0;i<4;i++){const sc=await makeStatCardInst(sCfgs[i],statW,S,SP);sc.x=MX+PAD+i*(statW+16);sc.y=y;pf.appendChild(sc);}
  y+=152+24;

  // Insights heading
  const iHdr=figma.createFrame(); iHdr.name='InsightsHdr'; iHdr.fills=[];
  AL(iHdr,'HORIZONTAL',12,'CENTER'); hugBoth(iHdr); iHdr.x=MX+PAD; iHdr.y=y;
  iHdr.appendChild(iconBg(32,S['brand/default'],0.15,16,S['brand/soft'],SP,'Radius/md','SparkIcon'));
  const iTxt=figma.createFrame(); iTxt.name='InsTextCol'; iTxt.fills=[];
  AL(iTxt,'VERTICAL',2,'MIN'); hugBoth(iTxt);
  iTxt.appendChild(await T('AI-Generated Strategic Insights',18,'SemiBold',S['foreground/secondary']));
  iTxt.appendChild(await T('Actionable recommendations powered by Intelligence',13,'Medium',S['foreground/tertiary']));
  iHdr.appendChild(iTxt); pf.appendChild(iHdr); y+=40+16;

  // Insight cards
  const insW=Math.floor((CONTENT-32)/3);
  for(let i=0;i<3;i++){const ic=await makeInsightCardInst(INS_CFGS[i],insW,S,SP);ic.x=MX+PAD+i*(insW+16);ic.y=y;pf.appendChild(ic);}
  y+=216+24;

  // Trends chart instance
  const chart=comps.trendChart.createInstance();
  chart.resize(CONTENT,404); chart.x=MX+PAD; chart.y=y; pf.appendChild(chart); y+=404+24;

  // Citations table instance
  const tbl=comps.citTable.createInstance();
  const tblH=comps.citTable.height;
  tbl.resize(CONTENT,tblH); tbl.x=MX+PAD; tbl.y=y; pf.appendChild(tbl); y+=tblH+32;

  pf.resize(CW,y); sb.resize(64,y);
  figma.viewport.scrollAndZoomIntoView([pf]);
}

async function assembleSearchVisibility(comps,S,SP) {
  const CW=1440,MX=64,PAD=24,CONTENT=CW-MX-PAD*2;
  const pf=figma.createFrame(); pf.name='🔍 Search Visibility – 1440px'; pf.resize(CW,100);
  setFill(pf,S['background']); pf.clipsContent=true; pf.x=4000; pf.y=0;
  figma.currentPage.appendChild(pf);

  const sb=await makeSidebarInst(4000,S,SP); sb.x=0; sb.y=0; pf.appendChild(sb);

  // Back-nav header
  const hb=figma.createFrame(); hb.name='Header'; hb.resize(CW-MX,64);
  setFill(hb,S['background'],0.8); setStroke(hb,S['border/secondary'],1,0.5);
  const bRow=figma.createFrame(); bRow.name='BackButton'; bRow.fills=[];
  AL(bRow,'HORIZONTAL',8,'CENTER'); hugBoth(bRow); bindPadHV(bRow,SP,'Spacing/2','Spacing/1');
  bRow.appendChild(ICO(16,S['foreground/strong']));
  bRow.appendChild(await T('Back to Dashboard',14,'Medium',S['foreground/strong']));
  bRow.x=16; bRow.y=14; hb.appendChild(bRow);
  hb.x=MX; hb.y=0; pf.appendChild(hb);

  let y=80;

  const fb=comps.filterBar.createInstance();
  fb.resize(CONTENT,100); fb.x=MX+PAD; fb.y=y; pf.appendChild(fb); y+=100+24;

  const dtbl=await buildDetailedTable(CONTENT,S,SP);
  dtbl.x=MX+PAD; dtbl.y=y; pf.appendChild(dtbl); y+=dtbl.height+80;

  const bb=comps.bulkBar.createInstance();
  bb.name='BulkActionBar/Floating'; bb.x=(CW-480)/2; bb.y=y-60; pf.appendChild(bb);

  pf.resize(CW,y); sb.resize(64,y);
  figma.viewport.scrollAndZoomIntoView([pf]);
}

// ════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════

async function main() {
  for(const style of ['Regular','Medium','Semi Bold','Bold']) {
    try { await figma.loadFontAsync({family:'Inter',style}); }
    catch(e) { console.warn('Font load failed:',style,e); }
  }

  figma.notify('⚙️ Creating variable collections...');
  const { S, SP } = await createVariables();

  figma.notify('⚙️ Building component library...');
  const sidebar    = await buildSidebar(S,SP);
  const { header, headerBack } = await buildHeaders(S,SP);
  const statCardSet = await buildStatCards(S,SP);
  const insightSet  = await buildInsightCards(S,SP);
  const trendChart  = await buildTrendsChart(S,SP);
  const citTable    = await buildCitationsTable(S,SP);
  const filterBar   = await buildFilterBar(S,SP);
  const bulkBar     = await buildBulkBar(S,SP);

  // Layout component library (x=0)
  sidebar.x=0;       sidebar.y=40;
  header.x=200;      header.y=40;
  headerBack.x=200;  headerBack.y=120;
  statCardSet.x=40;  statCardSet.y=220;
  insightSet.x=720;  insightSet.y=220;
  trendChart.x=40;   trendChart.y=560;
  citTable.x=40;     citTable.y=1000;
  filterBar.x=40;    filterBar.y=1420;
  bulkBar.x=40;      bulkBar.y=1540;

  figma.notify('⚙️ Assembling Dashboard frame...');
  await assembleDashboard({ trendChart, citTable }, S, SP);

  figma.notify('⚙️ Assembling Search Visibility frame...');
  await assembleSearchVisibility({ filterBar, bulkBar }, S, SP);

  figma.closePlugin('✅ 완료! Primitives · Semantic · Spacing 변수 생성 및 전체 바인딩 완료.');
}

main().catch(err => {
  console.error(err);
  figma.closePlugin('❌ Error: ' + (err.message || String(err)));
});
