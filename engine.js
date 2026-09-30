/* Bug Hunter Academy — block engine
   Code is a flat list of lines per object: {i: indent, op, a: args}.
   Indentation decides what is inside what, exactly like the Dino Run editor. */
(function(){
const BH = (window.BH = window.BH || {});

/* ------------------------------------------------------------ language */
BH.lang = 'en';
BH.tx = function(p){ if(p==null) return ''; if(typeof p==='string') return p; return (BH.lang==='es' && p[1]) ? p[1] : p[0]; };

/* ------------------------------------------------------------ blocks */
const HAT = {flag:1, key:1};
const CONTAINER = {forever:1, repeat:1, if:1};
const CAT = {flag:'ev', key:'ev', goto:'mo', change:'mo', set:'mo', forever:'ct', repeat:'ct', if:'ct', else:'ct',
  wait:'ct', stop:'ct', show:'lo', hide:'lo', say:'lo', setvar:'va', changevar:'va'};
BH.HAT = HAT; BH.CONTAINER = CONTAINER; BH.CAT = CAT;

/* ------------------------------------------------------------ parse */
function groupEnd(lines, i){
  const L = lines[i]; let j = i+1;
  while(j < lines.length && !HAT[lines[j].op]){
    if(lines[j].i > L.i){ j++; continue; }
    if(L.op==='if' && lines[j].op==='else' && lines[j].i===L.i){ j++; continue; }
    break;
  }
  return j;
}
BH.groupEnd = groupEnd;

function build(seg, start, level, warn){
  const nodes = []; let i = start;
  while(i < seg.length){
    const {l, idx} = seg[i];
    if(l.i < level) break;
    if(l.op==='else'){ warn.add(idx); i++; continue; }
    if(l.i > level) warn.add(idx);
    const node = {op:l.op, a:l.a || {}, idx};
    i++;
    if(CONTAINER[l.op]){
      const r = build(seg, i, l.i+1, warn); node.body = r.nodes; i = r.i;
      if(l.op==='if' && i < seg.length && seg[i].l.op==='else' && seg[i].l.i===l.i){
        const e = build(seg, i+1, l.i+1, warn); node.else = e.nodes; node.elseIdx = seg[i].idx; i = e.i;
      }
    }
    nodes.push(node);
  }
  return {nodes, i};
}
function parseSprite(lines){
  const scripts = [], warn = new Set(), detached = [];
  let i = 0;
  while(i < lines.length){
    const L = lines[i];
    if(HAT[L.op]){
      let j = i+1; while(j < lines.length && !HAT[lines[j].op]) j++;
      const seg = []; for(let k=i+1;k<j;k++) seg.push({l:lines[k], idx:k});
      const r = build(seg, 0, 1, warn);
      scripts.push({hat:L, hatIdx:i, body:r.nodes});
      i = j;
    } else { detached.push(i); i++; }
  }
  return {scripts, warn, detached};
}
BH.parseSprite = parseSprite;

/* walk every node with its chain of ancestors */
function walk(nodes, fn, anc){
  anc = anc || [];
  nodes.forEach(n=>{
    fn(n, anc);
    if(n.body) walk(n.body, fn, anc.concat([{n, part:'body'}]));
    if(n.else) walk(n.else, fn, anc.concat([{n, part:'else'}]));
  });
}
/* find nodes in an object's code: returns [{n, anc, hat}] */
BH.find = function(code, sprite, pred){
  const out = []; const lines = code[sprite] || [];
  parseSprite(lines).scripts.forEach(s=>{
    walk(s.body, (n, anc)=>{ if(pred(n, anc, s.hat)) out.push({n, anc, hat:s.hat}); });
  });
  return out;
};
BH.inside = (anc, op)=> anc.some(x=>x.n.op===op);
BH.parentOf = anc => anc.length ? anc[anc.length-1] : null;
/* does a node's subtree contain a node matching pred */
BH.has = function(node, pred, part){
  let found = false;
  const list = part==='else' ? (node.else||[]) : (node.body||[]);
  walk(list, n=>{ if(pred(n)) found = true; });
  return found;
};

/* ------------------------------------------------------------ values */
function num(g, sp, v){
  if(v==null) return 0;
  if(typeof v==='number') return v;
  if(typeof v==='string'){ const f = parseFloat(v); return isFinite(f) ? f : 0; }
  switch(v.r){
    case 'pos': return sp[v.ax];
    case 'posOf': { const o = g.byName(v.o); return o ? o[v.ax] : 0; }
    case 'var': { const f = parseFloat(g.vars[v.v]); return isFinite(f) ? f : 0; }
    case 'rand': {
      const a = num(g,sp,v.a), b = num(g,sp,v.b);
      const lo = Math.min(a,b), hi = Math.max(a,b);
      if(Number.isInteger(lo) && Number.isInteger(hi)) return lo + Math.floor(Math.random()*(hi-lo+1));
      return lo + Math.random()*(hi-lo);
    }
    case 'sub': return num(g,sp,v.a) - num(g,sp,v.b);
  }
  return 0;
}
function cond(g, sp, c){
  if(!c) return false;
  switch(c.op){
    case 'lt': return num(g,sp,c.a) <  num(g,sp,c.b);
    case 'gt': return num(g,sp,c.a) >  num(g,sp,c.b);
    case 'eq': return num(g,sp,c.a) === num(g,sp,c.b);
    case 'touch': return g.touching(sp, c.o);
    case 'key': return g.keys.has(c.k);
  }
  return false;
}

/* ------------------------------------------------------------ interpreter */
function* runList(g, sp, list){
  for(const n of list){ if(g.halt) return; yield* runNode(g, sp, n); }
}
function* runNode(g, sp, n){
  const a = n.a || {};
  switch(n.op){
    case 'forever':
      while(true){ yield* runList(g, sp, n.body); if(g.halt) return; yield; }
    case 'repeat': {
      const c = Math.round(num(g,sp,a.n));
      for(let k=0;k<c;k++){ yield* runList(g, sp, n.body); if(g.halt) return; yield; }
      return;
    }
    case 'if':
      if(cond(g, sp, a.c)) yield* runList(g, sp, n.body);
      else if(n.else) yield* runList(g, sp, n.else);
      return;
    case 'wait': { const f = Math.max(1, Math.round(num(g,sp,a.n)*60)); for(let k=0;k<f;k++) yield; return; }
    case 'goto': sp.x = num(g,sp,a.x); sp.y = num(g,sp,a.y); return;
    case 'change': sp[a.ax] += num(g,sp,a.n); return;
    case 'set': sp[a.ax] = num(g,sp,a.n); return;
    case 'stop': g.halt = true; g.stopReason = 'stop'; return;
    case 'show': sp.visible = true; return;
    case 'hide': sp.visible = false; return;
    case 'say': sp.say = String(a.s==null ? '' : a.s); return;
    case 'setvar': g.vars[a.v] = num(g,sp,a.n); return;
    case 'changevar': g.vars[a.v] = (parseFloat(g.vars[a.v])||0) + num(g,sp,a.n); return;
  }
}

/* ------------------------------------------------------------ game */
const KEYMAP = {' ':'space', 'ArrowUp':'up arrow', 'ArrowDown':'down arrow', 'ArrowLeft':'left arrow', 'ArrowRight':'right arrow'};
BH.KEYMAP = KEYMAP;

class Game {
  constructor(def, code){ this.def = def; this.code = code; this.keys = new Set(); this.reset(); }
  reset(){
    this.sprites = this.def.sprites.map(s=>Object.assign({}, s, {say:'', visible: s.visible!==false}));
    this.vars = Object.assign({}, this.def.vars || {});
    this.threads = []; this.running = false; this.halt = false; this.stopReason = null; this.frame = 0;
    this.parsed = {};
  }
  byName(n){ return this.sprites.find(s=>s.name===n); }
  touching(sp, target){
    if(!sp.visible) return false;
    const T = 0.02;
    return this.sprites.some(o=> o!==sp && (o.name===target || o.group===target) && o.visible &&
      Math.abs(o.x-sp.x) <= (o.w+sp.w)/2 + T && Math.abs(o.y-sp.y) <= (o.h+sp.h)/2 + T);
  }
  start(){
    this.reset();
    this.running = true;
    this.sprites.forEach(sp=>{
      const p = parseSprite(this.code[sp.name] || []);
      this.parsed[sp.name] = p;
      p.scripts.forEach(s=>{ if(s.hat.op==='flag') this.spawn(sp, s); });
    });
  }
  spawn(sp, s){ this.threads.push({sp, s, gen: runList(this, sp, s.body)}); }
  keyDown(k){
    if(this.keys.has(k)) return;
    this.keys.add(k);
    if(!this.running) return;
    this.sprites.forEach(sp=>{
      const p = this.parsed[sp.name]; if(!p) return;
      p.scripts.forEach(s=>{
        if(s.hat.op==='key' && s.hat.a.k===k && !this.threads.some(t=>t.s===s && t.sp===sp)) this.spawn(sp, s);
      });
    });
  }
  keyUp(k){ this.keys.delete(k); }
  step(){
    if(!this.running) return;
    this.frame++;
    for(const t of this.threads.slice()){
      if(this.halt) break;
      const r = t.gen.next(); if(r.done) t.done = true;
    }
    this.threads = this.threads.filter(t=>!t.done);
    if(this.halt){ this.running = false; }
  }
}
BH.Game = Game;

/* ------------------------------------------------------------ drawing */
function rr(ctx, x, y, w, h, r){ ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x,y,w,h,r) : ctx.rect(x,y,w,h); }
const SHAPES = {
  dino(c, x, y, w, h, s){ // generic cartoon dinosaur
    c.fillStyle = s.color || '#4E7D3A';
    rr(c, x, y+h*0.35, w*0.72, h*0.45, h*0.12); c.fill();              // body
    rr(c, x+w*0.45, y, w*0.55, h*0.42, h*0.12); c.fill();              // head
    c.fillRect(x+w*0.12, y+h*0.78, w*0.14, h*0.22); c.fillRect(x+w*0.46, y+h*0.78, w*0.14, h*0.22); // legs
    c.beginPath(); c.moveTo(x, y+h*0.45); c.lineTo(x-w*0.22, y+h*0.62); c.lineTo(x, y+h*0.72); c.fill(); // tail
    c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(x+w*0.78, y+h*0.15, h*0.07, 0, 7); c.fill();
    c.fillStyle = '#1B1830'; c.beginPath(); c.arc(x+w*0.8, y+h*0.15, h*0.035, 0, 7); c.fill();
  },
  cactus(c, x, y, w, h){
    c.fillStyle = '#2F8A4B';
    rr(c, x+w*0.3, y, w*0.4, h, w*0.2); c.fill();
    rr(c, x, y+h*0.3, w*0.22, h*0.35, w*0.11); c.fill();
    rr(c, x+w*0.78, y+h*0.2, w*0.22, h*0.35, w*0.11); c.fill();
    c.fillRect(x+w*0.1, y+h*0.55, w*0.25, h*0.1); c.fillRect(x+w*0.65, y+h*0.45, w*0.25, h*0.1);
  },
  ground(c, x, y, w, h){ c.fillStyle = '#6E6A63'; c.fillRect(x, y, w, Math.max(2, h*0.35)); },
  box(c, x, y, w, h, s){ c.fillStyle = s.color || '#2F6FD6'; rr(c, x, y, w, h, w*0.2); c.fill(); eyes(c, x, y, w, h); },
  hero(c, x, y, w, h){ c.fillStyle = '#2F6FD6'; rr(c, x, y, w, h, w*0.3); c.fill(); eyes(c, x, y, w, h); },
  chaser(c, x, y, w, h){
    c.fillStyle = '#D9503F'; c.beginPath();
    c.moveTo(x+w/2, y); c.lineTo(x+w, y+h/2); c.lineTo(x+w/2, y+h); c.lineTo(x, y+h/2); c.closePath(); c.fill();
    eyes(c, x+w*0.1, y+h*0.1, w*0.8, h*0.8);
  },
  dot(c, x, y, w, h){ c.fillStyle = '#E8A800'; c.beginPath(); c.arc(x+w/2, y+h/2, w*0.42, 0, 7); c.fill(); },
  ship(c, x, y, w, h){
    c.fillStyle = '#39C49A'; c.beginPath(); c.moveTo(x+w/2, y); c.lineTo(x+w, y+h); c.lineTo(x, y+h); c.closePath(); c.fill();
    c.fillStyle = '#E9FFF8'; c.fillRect(x+w*0.44, y+h*0.35, w*0.12, h*0.3);
  },
  alien(c, x, y, w, h){
    c.fillStyle = '#B08CF2'; rr(c, x, y+h*0.2, w, h*0.8, h*0.3); c.fill();
    c.strokeStyle = '#B08CF2'; c.lineWidth = Math.max(2, w*0.06);
    c.beginPath(); c.moveTo(x+w*0.3, y+h*0.25); c.lineTo(x+w*0.2, y); c.moveTo(x+w*0.7, y+h*0.25); c.lineTo(x+w*0.8, y); c.stroke();
    eyes(c, x, y+h*0.2, w, h*0.8);
  },
  laser(c, x, y, w, h){ c.fillStyle = '#FF6B5B'; rr(c, x, y, w, h, w/2); c.fill(); },
  paddle(c, x, y, w, h, s){ c.fillStyle = s.color || '#1B1830'; rr(c, x, y, w, h, w/2); c.fill(); },
  ball(c, x, y, w, h){ c.fillStyle = '#1B1830'; c.beginPath(); c.arc(x+w/2, y+h/2, w/2, 0, 7); c.fill(); },
  frog(c, x, y, w, h){
    c.fillStyle = '#3FA34D'; c.beginPath(); c.ellipse(x+w/2, y+h*0.6, w/2, h*0.4, 0, 0, 7); c.fill();
    c.beginPath(); c.arc(x+w*0.28, y+h*0.25, w*0.18, 0, 7); c.arc(x+w*0.72, y+h*0.25, w*0.18, 0, 7); c.fill();
    c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(x+w*0.28, y+h*0.25, w*0.09, 0, 7); c.arc(x+w*0.72, y+h*0.25, w*0.09, 0, 7); c.fill();
  },
  car(c, x, y, w, h, s){
    c.fillStyle = '#1B1830'; c.fillRect(x+w*0.12, y-h*0.08, w*0.2, h*1.16); c.fillRect(x+w*0.68, y-h*0.08, w*0.2, h*1.16);
    c.fillStyle = s.color || '#E0663A'; rr(c, x, y+h*0.1, w, h*0.8, h*0.25); c.fill();
    c.fillStyle = 'rgba(255,255,255,.75)'; rr(c, x+w*0.55, y+h*0.25, w*0.25, h*0.5, h*0.1); c.fill();
  },
  wall(c, x, y, w, h){ c.fillStyle = '#8C889A'; rr(c, x, y, w, h, 4); c.fill(); }
};
function eyes(c, x, y, w, h){
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(x+w*0.33, y+h*0.4, w*0.13, 0, 7); c.arc(x+w*0.67, y+h*0.4, w*0.13, 0, 7); c.fill();
  c.fillStyle = '#1B1830'; c.beginPath(); c.arc(x+w*0.36, y+h*0.42, w*0.06, 0, 7); c.arc(x+w*0.7, y+h*0.42, w*0.06, 0, 7); c.fill();
}

BH.draw = function(ctx, g, W, H){
  const v = g.def.view, sx = W/(v.xmax-v.xmin), sy = H/(v.ymax-v.ymin);
  const tf = {X: x=>(x-v.xmin)*sx, Y: y=>H-(y-v.ymin)*sy, sx, sy, W, H};
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = g.def.bg || '#FAFAF7'; ctx.fillRect(0,0,W,H);
  if(g.def.drawBg) g.def.drawBg(ctx, tf);
  g.sprites.forEach(s=>{
    if(!s.visible) return;
    const w = s.w*sx, h = s.h*sy, x = tf.X(s.x)-w/2, y = tf.Y(s.y)-h/2;
    (SHAPES[s.shape] || SHAPES.box)(ctx, x, y, w, h, s);
  });
  ctx.font = '600 15px "Atkinson Hyperlegible", Arial, sans-serif'; ctx.textBaseline = 'middle';
  g.sprites.forEach(s=>{
    if(!s.visible || !s.say) return;
    const tw = ctx.measureText(s.say).width + 18, bx = Math.min(W-tw-4, Math.max(4, tf.X(s.x)-tw/2)), by = Math.max(4, tf.Y(s.y) - s.h*sy/2 - 38);
    ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#1B1830'; ctx.lineWidth = 1.5; rr(ctx, bx, by, tw, 28, 10); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#1B1830'; ctx.fillText(s.say, bx+9, by+14);
  });
  if(g.def.hud !== false){
    ctx.font = '700 18px "JetBrains Mono", monospace'; ctx.textAlign = 'right';
    ctx.fillStyle = g.def.hudColor || '#1B1830';
    const sc = parseFloat(g.vars.score); ctx.fillText('SCORE ' + (isFinite(sc) ? Math.floor(sc) : 0), W-14, 20);
    ctx.textAlign = 'left';
  }
};

/* ------------------------------------------------------------ editor */
const OPS = [['lt','<'],['gt','>'],['eq','=']];
const KEYS = ['space','up arrow','down arrow','left arrow','right arrow'];

function el(tag, cls, txt){ const e = document.createElement(tag); if(cls) e.className = cls; if(txt!=null) e.textContent = txt; return e; }
BH.el = el;

function fmt(n){ return (Math.round(n*1000)/1000).toString(); }

/* Build the editable pieces of one line */
function renderLine(line, ctx){
  const a = line.a || (line.a = {});
  const row = el('span', 'blk-text');
  const T = s => row.appendChild(el('span', 'w', s));
  const N = (obj, key) => row.appendChild(numSlot(obj, key, ctx));
  const S = (obj, key, opts) => row.appendChild(selSlot(obj, key, opts, ctx));
  switch(line.op){
    case 'flag': T('when ▶ the game starts'); break;
    case 'key': T('when'); S(a, 'k', KEYS); T('key pressed'); break;
    case 'goto': T('go to x'); V(a, 'x'); T('y'); V(a, 'y'); break;
    case 'change': T('change'); S(a, 'ax', ['x','y']); T('by'); V(a, 'n'); break;
    case 'set': T('set'); S(a, 'ax', ['x','y']); T('to'); V(a, 'n'); break;
    case 'forever': T('forever'); break;
    case 'repeat': T('repeat'); V(a, 'n'); break;
    case 'if': T('if'); row.appendChild(condPill(a.c, ctx)); T('then'); break;
    case 'else': T('else'); break;
    case 'wait': T('wait'); V(a, 'n'); T('seconds'); break;
    case 'stop': T('stop all'); break;
    case 'show': T('show'); break;
    case 'hide': T('hide'); break;
    case 'say': T('say'); row.appendChild(textSlot(a, 's', ctx)); break;
    case 'setvar': T('set'); row.appendChild(el('span', 'rep rep-va', a.v)); T('to'); V(a, 'n'); break;
    case 'changevar': T('change'); row.appendChild(el('span', 'rep rep-va', a.v)); T('by'); V(a, 'n'); break;
  }
  function V(obj, key){ row.appendChild(valueNode(obj, key, ctx)); }
  return row;
}
function valueNode(obj, key, ctx){
  const v = obj[key];
  if(v==null || typeof v!=='object') return numSlot(obj, key, ctx);
  let p;
  switch(v.r){
    case 'pos': p = el('span', 'rep rep-mo'); p.appendChild(selSlot(v, 'ax', ['x','y'], ctx)); p.appendChild(el('span','w','position')); break;
    case 'posOf': p = el('span', 'rep rep-se'); p.appendChild(selSlot(v, 'ax', ['x','y'], ctx)); p.appendChild(el('span','w','of')); p.appendChild(selSlot(v, 'o', ctx.objects, ctx)); break;
    case 'var': p = el('span', 'rep rep-va', v.v); break;
    case 'rand': p = el('span', 'rep rep-op'); p.appendChild(el('span','w','pick random')); p.appendChild(valueNode(v,'a',ctx)); p.appendChild(el('span','w','to')); p.appendChild(valueNode(v,'b',ctx)); break;
    case 'sub': p = el('span', 'rep rep-op'); p.appendChild(valueNode(v,'a',ctx)); p.appendChild(el('span','w','−')); p.appendChild(valueNode(v,'b',ctx)); break;
    default: p = el('span', 'rep', '?');
  }
  return p;
}
function condPill(c, ctx){
  if(!c) return el('span', 'rep rep-empty', '◇');
  let p;
  if(c.op==='touch'){ p = el('span','rep rep-se'); p.appendChild(el('span','w','touching')); p.appendChild(selSlot(c,'o',ctx.objects,ctx)); p.appendChild(el('span','w','?')); }
  else if(c.op==='key'){ p = el('span','rep rep-se'); p.appendChild(el('span','w','key')); p.appendChild(selSlot(c,'k',KEYS,ctx)); p.appendChild(el('span','w','pressed?')); }
  else {
    p = el('span','rep rep-op');
    p.appendChild(valueNode(c,'a',ctx));
    p.appendChild(selSlot(c,'op',OPS,ctx));
    p.appendChild(valueNode(c,'b',ctx));
  }
  return p;
}
function numSlot(obj, key, ctx){
  const v = obj[key];
  if(ctx.readOnly) return el('span', 'slot', fmt(typeof v==='number' ? v : parseFloat(v)||0));
  const inp = el('input', 'slot'); inp.type = 'text'; inp.inputMode = 'decimal';
  inp.value = fmt(typeof v==='number' ? v : parseFloat(v)||0);
  inp.setAttribute('aria-label', 'number');
  inp.style.width = Math.max(3, inp.value.length+0.5) + 'ch';
  inp.addEventListener('input', ()=>{ inp.style.width = Math.max(3, inp.value.length+0.5)+'ch'; });
  const commit = ()=>{
    const f = parseFloat(inp.value.replace('−','-').replace(',', '.'));
    if(isFinite(f)){ if(obj[key]!==f){ ctx.snapshot(); obj[key] = f; ctx.changed(); } }
    inp.value = fmt(obj[key]); inp.style.width = Math.max(3, inp.value.length+0.5)+'ch';
  };
  inp.addEventListener('change', commit);
  inp.addEventListener('keydown', e=>{ if(e.key==='Enter'){ inp.blur(); } e.stopPropagation(); });
  inp.addEventListener('click', e=>e.stopPropagation());
  return inp;
}
function textSlot(obj, key, ctx){
  if(ctx.readOnly) return el('span', 'slot slot-t', obj[key]);
  const inp = el('input', 'slot slot-t'); inp.type = 'text'; inp.value = obj[key] || '';
  inp.setAttribute('aria-label', 'text');
  inp.style.width = Math.max(4, inp.value.length+1)+'ch';
  inp.addEventListener('input', ()=>{ inp.style.width = Math.max(4, inp.value.length+1)+'ch'; });
  inp.addEventListener('change', ()=>{ ctx.snapshot(); obj[key] = inp.value; ctx.changed(); });
  inp.addEventListener('keydown', e=>{ if(e.key==='Enter') inp.blur(); e.stopPropagation(); });
  inp.addEventListener('click', e=>e.stopPropagation());
  return inp;
}
function selSlot(obj, key, opts, ctx){
  const pairs = opts.map(o=> Array.isArray(o) ? o : [o, o]);
  const cur = pairs.find(p=>p[0]===obj[key]);
  if(ctx.readOnly) return el('span', 'slot slot-s', cur ? cur[1] : obj[key]);
  const s = el('select', 'slot slot-s');
  s.setAttribute('aria-label', 'choose');
  pairs.forEach(p=>{ const o = el('option', null, p[1]); o.value = p[0]; s.appendChild(o); });
  if(!cur){ const o = el('option', null, obj[key]); o.value = obj[key]; s.appendChild(o); }
  s.value = obj[key];
  s.addEventListener('change', ()=>{ ctx.snapshot(); obj[key] = s.value; ctx.changed(); });
  s.addEventListener('click', e=>e.stopPropagation());
  s.addEventListener('keydown', e=>e.stopPropagation());
  return s;
}

/* The code panel. opts: {code, names, objects, readOnly, bin, onChange, onPick(sprite, idx), tab} */
BH.Editor = function(host, opts){
  const code = opts.code;
  let tab = opts.tab || opts.names[0];
  const undo = [];
  const STEP = 34; // px per indent level: guide width + margin
  const GUT = 30;  // px for the line number column (.lnum width + margin)
  const ctx = {
    readOnly: !!opts.readOnly,
    objects: opts.objects || opts.names,
    snapshot(){ undo.push(JSON.stringify(code)); if(undo.length>60) undo.shift(); },
    changed(){ render(); opts.onChange && opts.onChange(); }
  };
  host.classList.add('ed');
  host.innerHTML = '';
  const tabs = el('div', 'ed-tabs'); const bar = el('div', 'ed-bar'); const list = el('div', 'ed-lines');
  host.appendChild(tabs);
  if(!ctx.readOnly) host.appendChild(bar);
  host.appendChild(list);
  let trash, bUndo, hint;
  if(!ctx.readOnly){
    hint = el('span', 'tb-hint', BH.tx(['Drag a block to move it. Drop it further right to put it inside.','Arrastra un bloque para moverlo. Suéltalo más a la derecha para meterlo adentro.']));
    trash = el('div', 'trash', BH.tx(['Drop here to delete','Suelta aquí para borrar']));
    bUndo = el('button', 'tb', BH.tx(['Undo','Deshacer'])); bUndo.type = 'button';
    bUndo.addEventListener('click', ()=>{ if(!undo.length) return; const prev = JSON.parse(undo.pop()); Object.keys(code).forEach(k=>{ code[k] = prev[k]; }); render(); opts.onChange && opts.onChange(); });
    bar.appendChild(hint); bar.appendChild(trash); bar.appendChild(bUndo);
  }
  if(opts.bin && opts.bin.length && !ctx.readOnly){
    const bin = el('div', 'ed-bin');
    bin.appendChild(el('div', 'ed-bin-h', BH.tx(['Parts bin: drag a block into the code','Caja de piezas: arrastra un bloque al código'])));
    opts.bin.forEach(b=>{
      const blk = el('div', 'blk blk-'+CAT[b.op]+' bin-b');
      blk.appendChild(renderLine(JSON.parse(JSON.stringify(b)), {readOnly:true, objects:ctx.objects}));
      blk.addEventListener('pointerdown', e=>startPress(e, null, [JSON.parse(JSON.stringify(b))], blk));
      bin.appendChild(blk);
    });
    host.appendChild(bin);
  }
  const lines = () => code[tab];

  /* ---------------- drag and drop */
  let drag = null;
  function startPress(e, from, grp, srcEl){
    if(ctx.readOnly || e.button > 0) return;
    const t = e.target;
    if(t.closest('input,select,textarea')) return;
    const sx = e.clientX, sy = e.clientY;
    const r = srcEl.getBoundingClientRect();
    const press = {from, grp, srcEl, sx, sy, ox: sx - r.left, oy: sy - r.top, started:false, pid:e.pointerId};
    const move = ev=>{
      if(ev.pointerId!==press.pid) return;
      if(!press.started){
        if(Math.hypot(ev.clientX-sx, ev.clientY-sy) < 6) return;
        press.started = true; begin(press);
      }
      ev.preventDefault(); over(ev);
    };
    const up = ev=>{
      if(ev.pointerId!==press.pid) return;
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
      if(press.started) finish(ev, ev.type==='pointercancel');
    };
    window.addEventListener('pointermove', move, {passive:false}); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
  }
  function begin(press){
    drag = press;
    const ghost = el('div', 'drag-ghost');
    const base = press.grp[0].i;
    press.grp.forEach(l=>{
      const row = el('div', 'ln');
      for(let k=0;k<(l.i-base);k++) row.appendChild(el('span','guide'));
      const b = el('div', 'blk blk-'+CAT[l.op]); b.appendChild(renderLine(l, {readOnly:true, objects:ctx.objects})); row.appendChild(b);
      ghost.appendChild(row);
    });
    document.body.appendChild(ghost); drag.ghost = ghost;
    drag.mark = el('div', 'drop-mark'); list.appendChild(drag.mark);
    if(press.from!=null){ for(let k=press.from; k<press.from+press.grp.length; k++){ const n = list.children[k]; if(n) n.classList.add('dragging'); } }
    document.body.classList.add('is-dragging');
  }
  function maxIndent(prev){ if(!prev) return 0; if(HAT[prev.op]) return 1; if(CONTAINER[prev.op] || prev.op==='else') return prev.i+1; return prev.i; }
  function over(ev){
    const d = drag; d.ghost.style.left = (ev.clientX - d.ox) + 'px'; d.ghost.style.top = (ev.clientY - d.oy) + 'px';
    const tr = trash.getBoundingClientRect();
    d.toTrash = ev.clientX>=tr.left && ev.clientX<=tr.right && ev.clientY>=tr.top && ev.clientY<=tr.bottom;
    trash.classList.toggle('hot', d.toTrash);
    if(d.toTrash){ d.mark.hidden = true; d.target = null; return; }
    const L = lines(), rows = Array.from(list.querySelectorAll(':scope > .ln'));
    const lr = list.getBoundingClientRect();
    if(ev.clientX < lr.left-60 || ev.clientX > lr.right+60 || ev.clientY < lr.top-40 || ev.clientY > lr.bottom+40){ d.mark.hidden = true; d.target = null; return; }
    const skip = k => d.from!=null && k>=d.from && k<d.from+d.grp.length;
    let at = L.length;
    for(let k=0;k<rows.length;k++){
      if(skip(k)) continue;
      const rr = rows[k].getBoundingClientRect();
      if(ev.clientY < rr.top + rr.height/2){ at = k; break; }
    }
    if(at===0 && L.length && HAT[L[0].op]) at = 1;
    if(!L.length){ d.mark.hidden = true; d.target = null; return; }
    let pk = at-1; while(pk>=0 && skip(pk)) pk--;
    const prev = pk>=0 ? L[pk] : null;
    if(!prev){ d.mark.hidden = true; d.target = null; return; }
    const hi = Math.max(1, maxIndent(prev));
    const want = Math.round((ev.clientX - d.ox - lr.left - 4 - GUT) / STEP);
    const lvl = Math.max(1, Math.min(hi, want));
    d.target = {at, lvl};
    let y;
    let nk = at; while(nk<rows.length && skip(nk)) nk++;
    if(nk < rows.length) y = rows[nk].offsetTop; else { const lastRow = rows[pk]; y = lastRow.offsetTop + lastRow.offsetHeight; }
    d.mark.hidden = false; d.mark.style.top = (y - 2) + 'px'; d.mark.style.left = (4 + GUT + lvl*STEP) + 'px';
  }
  function finish(ev, cancelled){
    const d = drag; drag = null;
    d.ghost.remove(); d.mark.remove(); trash.classList.remove('hot'); document.body.classList.remove('is-dragging');
    list.querySelectorAll('.dragging').forEach(n=>n.classList.remove('dragging'));
    if(cancelled) return;
    const L = lines();
    if(d.toTrash){ if(d.from!=null){ ctx.snapshot(); L.splice(d.from, d.grp.length); ctx.changed(); } return; }
    if(!d.target) return;
    let {at, lvl} = d.target;
    const delta = lvl - d.grp[0].i;
    if(d.from!=null){
      if(at===d.from && delta===0) return;
      ctx.snapshot();
      const grp = L.splice(d.from, d.grp.length);
      if(at > d.from) at -= grp.length;
      grp.forEach(l=>{ l.i = Math.max(1, l.i + delta); });
      L.splice(at, 0, ...grp);
    } else {
      ctx.snapshot();
      const grp = d.grp.map(l=>Object.assign({}, l, {i: Math.max(1, l.i + delta)}));
      L.splice(at, 0, ...grp);
    }
    ctx.changed();
  }

  /* ---------------- render */
  function render(){
    tabs.innerHTML = '';
    opts.names.forEach(n=>{
      const t = el('button', 'ed-tab' + (n===tab?' on':''), n); t.type = 'button';
      t.setAttribute('aria-pressed', n===tab ? 'true':'false');
      t.addEventListener('click', ()=>{ tab = n; render(); });
      tabs.appendChild(t);
    });
    const L = lines(); const p = parseSprite(L);
    list.innerHTML = '';
    if(!L.length) list.appendChild(el('div', 'ed-empty', BH.tx(['No code on this object.','Este objeto no tiene código.'])));
    L.forEach((line, idx)=>{
      const r = el('div', 'ln');
      if(HAT[line.op] && idx>0) r.classList.add('ln-gap');
      r.appendChild(el('span', 'lnum', idx+1));
      for(let k=0;k<(HAT[line.op]?0:line.i);k++) r.appendChild(el('span', 'guide'));
      const b = el('div', 'blk blk-'+CAT[line.op] + (HAT[line.op]?' hat':''));
      b.appendChild(renderLine(line, ctx));
      if(p.warn.has(idx)) { b.classList.add('warn'); b.title = BH.tx(['This block is not placed right.','Este bloque no está bien colocado.']); }
      if(p.detached.includes(idx)) b.classList.add('detached');
      if(!ctx.readOnly && !HAT[line.op]){
        b.classList.add('grab');
        b.addEventListener('pointerdown', e=>{ const e2 = groupEnd(L, idx); startPress(e, idx, L.slice(idx, e2), b); });
      }
      r.appendChild(b);
      if(opts.mark && opts.mark(tab, idx)) r.classList.add(opts.mark(tab, idx));
      if(opts.onPick) r.addEventListener('click', ()=>opts.onPick(tab, idx, line));
      list.appendChild(r);
    });
    if(bUndo) bUndo.disabled = !undo.length;
  }
  this.render = render;
  this.setTab = n=>{ tab = n; render(); };
  render();
};

/* A small read-only picture of a few blocks, for word cards and tables. */
BH.blockPic = function(lines){
  const box = el('div', 'bpic'); box.setAttribute('aria-hidden', 'true');
  const base = Math.min.apply(null, lines.map(l=>HAT[l.op] ? 0 : l.i));
  lines.forEach((line, idx)=>{
    const r = el('div', 'ln');
    r.appendChild(el('span', 'lnum', idx+1));
    for(let k=0;k<(HAT[line.op]?0:line.i-base);k++) r.appendChild(el('span', 'guide'));
    const b = el('div', 'blk blk-'+CAT[line.op] + (HAT[line.op]?' hat':''));
    b.appendChild(renderLine(JSON.parse(JSON.stringify(line)), {readOnly:true, objects:[]}));
    r.appendChild(b); box.appendChild(r);
  });
  return box;
};
})();
