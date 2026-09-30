/* Bug Hunter Academy — lesson content, pages and progress */
(function(){
const BH = window.BH, el = BH.el, tx = BH.tx;
const $ = s => document.querySelector(s);

/* ================================================================ progress */
const KEY = 'bug-hunter-academy.v1';
let P = {mods:{}, games:{}, sandbox:{}, exit:{}, lang:'en', unlockAll:false};
try{ const s = JSON.parse(localStorage.getItem(KEY)||'null'); if(s) P = Object.assign(P, s); }catch(e){}
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(P)); }catch(e){} }
BH.lang = P.lang || 'en';
const mod = id => (P.mods[id] = P.mods[id] || {spot:{}, quiz:{}});
const gst = id => (P.games[id] = P.games[id] || {bugs:{}});

/* ================================================================ content */
const T = (en, es) => [en, es];
const SHOW_ARCADE = false; // flip to true to bring back the Bug Arcade
const GAMES = SHOW_ARCADE ? BH.GAMES : [];
const MODS = [
{ id:'start', num:0, nav:T('Start here','Empieza aquí'), short:T('The 4 steps','Los 4 pasos'),
  eyebrow:T('Mission 0','Misión 0'), title:T('Welcome, Bug Hunter','Hola, cazador de bugs'),
  lead:T('Games break. Programmers fix them. First you learn 4 debugging skills.' + (SHOW_ARCADE ? ' Then you fix 5 broken arcade games.' : ''),'Los juegos se rompen. Los programadores los arreglan. Primero vas a aprender 4 habilidades para depurar.' + (SHOW_ARCADE ? ' Luego vas a arreglar 5 juegos de arcade rotos.' : '')),
  secs:[
    {t:'vocab', h:T('Key words','Palabras clave'), items:[
      ['bug','error',T('A mistake in the code.','Un error en el código.')],
      ['debug','depurar',T('Find the bug and fix it.','Encontrar el error y arreglarlo.')],
      ['expected','esperado',T('What SHOULD happen.','Lo que DEBERÍA pasar.')],
      ['actual','lo que pasó',T('What REALLY happens.','Lo que REALMENTE pasa.')],
      ['symptom','síntoma',T('What you SEE on the screen.','Lo que VES en la pantalla.')],
      ['test','probar',T('Run it again to check.','Correrlo otra vez para revisar.')]
    ]},
    {t:'points', h:T('The 4 debugging steps','Los 4 pasos para depurar'), items:[
      [T('1 · See it','1 · Míralo'), T('Play the game. Watch closely. What is wrong?','Juega. Mira con atención. ¿Qué está mal?')],
      [T('2 · Say it','2 · Dilo'), T('"I expected ___, but ___ happened."','"Esperaba ___, pero pasó ___."')],
      [T('3 · Find it','3 · Encuéntralo'), T('Click the object that acts wrong. Read its blocks from top to bottom.','Haz clic en el objeto que falla. Lee sus bloques de arriba hacia abajo.')],
      [T('4 · Fix it and test it','4 · Arréglalo y pruébalo'), T('Change ONE thing. Press Run again.','Cambia UNA cosa. Presiona Run otra vez.')]
    ], frame:T('<b>Golden rule:</b> change one thing at a time.','<b>Regla de oro:</b> cambia una sola cosa a la vez.')},
    {t:'points', one:true, h:T('How this page works','Cómo funciona esta página'), items:[
      [T('Watch panel','Panel Watch'), T('Shows every object\'s x and y while the game runs. Use it like a detective.','Muestra la x y la y de cada objeto mientras el juego corre. Úsalo como un detective.')],
      [T('Edit numbers and menus','Edita números y menús'), T('Click a white box to type a number. Click a menu to pick x or y, < or >, or an object.','Haz clic en una caja blanca para escribir un número. Haz clic en un menú para elegir x o y, < o >, o un objeto.')],
      [T('Drag blocks','Arrastra bloques'), T('Drag a block up or down to move it. Drop it further right to put it INSIDE the block above. Drag it to the trash to delete it.','Arrastra un bloque arriba o abajo para moverlo. Suéltalo más a la derecha para meterlo DENTRO del bloque de arriba. Arrástralo a la basura para borrarlo.')],
      [T('Unlock the next mission','Desbloquea la siguiente misión'), T('Finish the Try it, Spot the bug and Checkpoint parts.','Termina las partes Pruébalo, Encuentra el bug y Punto de control.')]
    ]},
    {t:'check', order:true, qs:[
      
      {q:T('You changed one block. What do you do next?','Cambiaste un bloque. ¿Qué haces después?'), opts:[T('Press Run and test it','Presionar Run y probarlo'), T('Change 5 more blocks','Cambiar 5 bloques más'), T('Close the game','Cerrar el juego')], ans:0,
       why:T('Always test after a change, so you know what the change did.','Siempre prueba después de un cambio, para saber qué hizo el cambio.')}
    ]}
  ]},
{ id:'indent', num:1, nav:T('Indentation','Sangría'), short:T('Inside or outside','Adentro o afuera'),
  eyebrow:T('Mission 1 · Indentation','Misión 1 · Sangría'), title:T('Inside or outside?','¿Adentro o afuera?'),
  lead:T('Pushing a block to the right puts it INSIDE the block above it. Where a block sits decides WHEN it runs.','Mover un bloque a la derecha lo pone DENTRO del bloque de arriba. El lugar del bloque decide CUÁNDO corre.'),
  secs:[
    {t:'points', h:T('Learn','Aprende'), items:[
      [T('Read top to bottom','Lee de arriba hacia abajo'), T('Blocks run in order, like steps in a recipe.','Los bloques corren en orden, como los pasos de una receta.')],
      [T('Pushed right = inside','A la derecha = adentro'), T('A block under an if runs ONLY when the answer is yes.','Un bloque debajo de un if corre SOLO cuando la respuesta es sí.')],
      [T('Inside forever = every frame','Dentro de forever = cada cuadro'), T('Outside forever, a block runs only ONCE, at the start. A game runs about 60 frames every second.','Fuera de forever, un bloque corre solo UNA vez, al empezar. Un juego corre unos 60 cuadros por segundo.')],
      [T('if / else = two roads','if / else = dos caminos'), T('Every frame, exactly one road runs: the if part OR the else part.','En cada cuadro corre exactamente un camino: la parte if O la parte else.')]
    ]},
    {t:'code', h:T('Example: the Ground from Dino Run','Ejemplo: el Ground de Dino Run'), sprite:'Ground',
     code:[BH.mk.L(0,'flag'), BH.mk.L(1,'setvar',{v:'score',n:0}), BH.mk.L(1,'forever'), BH.mk.L(2,'change',{ax:'x',n:-0.3}), BH.mk.L(2,'if',{c:BH.mk.C('lt',BH.mk.P('x'),-32)}), BH.mk.L(3,'change',{ax:'x',n:32}), BH.mk.L(2,'changevar',{v:'score',n:0.2})],
     note:T('Follow the lines on the left. change x by 32 is inside the if: it runs only when the ground is far left. change score by 0.2 is inside forever but NOT inside the if: it runs every frame.','Sigue las líneas de la izquierda. change x by 32 está dentro del if: corre solo cuando el suelo está muy a la izquierda. change score by 0.2 está dentro de forever pero NO dentro del if: corre en cada cuadro.')},
    {t:'try', key:'indent'},
    {t:'spot', key:'indent'},
    {t:'check', qs:[
      {q:T('A block is pushed right, under an if. When does it run?','Un bloque está a la derecha, debajo de un if. ¿Cuándo corre?'), opts:[T('Only when the if answer is yes','Solo cuando la respuesta del if es sí'), T('Every frame, always','En cada cuadro, siempre'), T('Never','Nunca')], ans:0,
       why:T('Inside an if = only when the answer is yes.','Dentro de un if = solo cuando la respuesta es sí.')},
      {q:T('A block sits under "when ▶ the game starts", before forever. How many times does it run?','Un bloque está debajo de "when ▶ the game starts", antes de forever. ¿Cuántas veces corre?'), opts:[T('One time, at the start','Una vez, al empezar'), T('Every frame','En cada cuadro'), T('Only when you press SPACE','Solo cuando presionas ESPACIO')], ans:0,
       why:T('Outside forever means once.','Fuera de forever significa una vez.')}
    ]}
  ]},
{ id:'motion', num:2, nav:T('Motion','Movimiento'), short:T('x, y, + and −','x, y, + y −'),
  eyebrow:T('Mission 2 · Motion','Misión 2 · Movimiento'), title:T('Which way? x, y, + and −','¿Hacia dónde? x, y, + y −'),
  lead:T('Every object has a position. x is left and right. y is up and down. The sign of the number (+ or −) picks the direction.','Cada objeto tiene una posición. x es izquierda y derecha. y es arriba y abajo. El signo del número (+ o −) elige la dirección.'),
  secs:[
    {t:'coord', h:T('The map of the Dino Run world','El mapa del mundo de Dino Run')},
    {t:'table', h:T('Direction = axis + sign','Dirección = eje + signo'),
     head:[T('Direction','Dirección'), T('Axis','Eje'), T('Sign','Signo'), T('In Dino Run','En Dino Run')],
     rows:[
      [T('Right →','Derecha →'), 'x', '+', T('the cactus comes back in at x = 20','el cactus vuelve a entrar en x = 20')],
      [T('Left ←','Izquierda ←'), 'x', '−', T('the Ground slides: change x by -0.3','el suelo se desliza: change x by -0.3')],
      [T('Up ↑','Arriba ↑'), 'y', '+', T('the Dino jumps: change y by 0.3','el Dino salta: change y by 0.3')],
      [T('Down ↓','Abajo ↓'), 'y', '−', T('the Dino falls: change y by -0.2','el Dino cae: change y by -0.2')]
     ]},
    {t:'points', h:T('Remember','Recuerda'), items:[
      [T('Horizontal = x','Horizontal = x'), T('x goes across, like the horizon.','x va de lado a lado, como el horizonte.')],
      [T('Vertical = y','Vertical = y'), T('y goes up to the sky and down to the ground.','y sube al cielo y baja al suelo.')],
      [T('change vs set','change o set'), T('change x by -0.3 moves a little every frame. set x to 20 jumps to exactly one spot.','change x by -0.3 mueve un poco en cada cuadro. set x to 20 salta a un solo lugar exacto.')]
    ]},
    {t:'try', key:'motion'},
    {t:'spot', key:'motion'},
    {t:'check', qs:[
      {q:T('A spaceship should move UP. Which block?','Una nave debe subir. ¿Qué bloque?'), opts:['change y by 5','change y by -5','change x by 5'], ans:0, why:T('Up = y and +.','Arriba = y y +.')},
      {q:T('A car should move LEFT. Which block?','Un carro debe ir a la IZQUIERDA. ¿Qué bloque?'), opts:['change x by -1','change x by 1','change y by -1'], ans:0, why:T('Left = x and −.','Izquierda = x y −.')}
    ]}
  ]},
{ id:'operators', num:3, nav:T('Operators','Operadores'), short:T('< > and direction','< > y dirección'),
  eyebrow:T('Mission 3 · Operators','Misión 3 · Operadores'), title:T('Operators: the direction logic','Operadores: la lógica de la dirección'),
  lead:T('Operators ask yes-or-no questions about numbers. They tell the game when something reached an edge, a goal or a target.','Los operadores hacen preguntas de sí o no sobre números. Le dicen al juego cuándo algo llegó a un borde, a una meta o a un objetivo.'),
  secs:[
    {t:'points', h:T('Learn','Aprende'), items:[
      [T('<  less than','<  menor que'), T('x position < -20 is YES when x is further left than -20.','x position < -20 es SÍ cuando x está más a la izquierda que -20.')],
      [T('>  greater than','>  mayor que'), T('y position > 15 is YES when y is higher than 15.','y position > 15 es SÍ cuando y está más arriba que 15.')],
      [T('=  exactly equal','=  exactamente igual'), T('YES only when the two numbers are exactly the same.','SÍ solo cuando los dos números son exactamente iguales.')]
    ]},
    {t:'table', h:T('Match the check to the direction','Une la pregunta con la dirección'),
     head:[T('Moving…','Si se mueve…'), T('Sign','Signo'), T('Edge check','Pregunta del borde')],
     rows:[
      [T('Left ←','Izquierda ←'), '−x', 'x position < -20'],
      [T('Right →','Derecha →'), '+x', 'x position > 20'],
      [T('Up ↑','Arriba ↑'), '+y', 'y position > 15'],
      [T('Down ↓','Abajo ↓'), '−y', 'y position < -15']
     ], frame:T('<b>Rule:</b> the sign of the move and the sign of the check must match.','<b>Regla:</b> el signo del movimiento y el signo de la pregunta deben coincidir.')},
    {t:'numline', h:T('Why = is risky at an edge','Por qué = es riesgoso en un borde')},
    {t:'points', h:T('Chasing logic','La lógica de perseguir'), items:[
      [T('Am I left of you?','¿Estoy a tu izquierda?'), T('if my x position < your x, I am on your LEFT. To chase you, I move + (right).','si mi x position < tu x, estoy a tu IZQUIERDA. Para perseguirte, me muevo + (derecha).')],
      [T('Am I right of you?','¿Estoy a tu derecha?'), T('if my x position > your x, I am on your RIGHT. To chase you, I move − (left).','si mi x position > tu x, estoy a tu DERECHA. Para perseguirte, me muevo − (izquierda).')]
    ]},
    {t:'try', key:'operators'},
    {t:'spot', key:'operators'},
    {t:'check', qs:[
      {q:T('An object moves LEFT. Which question finds the left edge?','Un objeto se mueve a la IZQUIERDA. ¿Qué pregunta encuentra el borde izquierdo?'), opts:['x position < -20','x position > -20','x position > 20'], ans:0, why:T('Left is −, so check < a negative number.','Izquierda es −, así que pregunta < un número negativo.')},
      {q:T('Why is x position = -20 risky?','¿Por qué x position = -20 es riesgoso?'), opts:[T('Moving 0.3 at a time, x can skip past -20','Moviéndose de 0.3 en 0.3, x se puede saltar -20'), T('= is slower than <','= es más lento que <'), T('= only works with y','= solo funciona con y')], ans:0, why:T('20, 19.7, 19.4 … -19.9, -20.2: never exactly -20.','20, 19.7, 19.4 … -19.9, -20.2: nunca exactamente -20.')}
    ]}
  ]},
{ id:'sensing', num:4, nav:T('Sensing','Sensores'), short:T('Touching and keys','Tocar y teclas'),
  eyebrow:T('Mission 4 · Sensing & collision','Misión 4 · Sensores y choques'), title:T('Sensing & collision','Sensores y choques'),
  lead:T('Sensing blocks notice things: keys that are pressed and objects that touch. Most game rules start with a sensing block.','Los bloques de sensores notan cosas: teclas presionadas y objetos que se tocan. Casi todas las reglas de un juego empiezan con un sensor.'),
  secs:[
    {t:'points', h:T('Learn','Aprende'), items:[
      [T('Check inside forever','Revisa dentro de forever'), T('A touching check outside forever looks only once, at the start.','Una pregunta touching fuera de forever mira solo una vez, al empezar.')],
      [T('Pick the right object','Elige el objeto correcto'), T('touching Ground? is not touching Dino?. Read the name.','touching Ground? no es touching Dino?. Lee el nombre.')],
      [T('A collision needs a result','Un choque necesita un resultado'), T('Put something inside the if: stop all, change score, go to.','Pon algo dentro del if: stop all, change score, go to.')],
      [T('Keys: two ways','Teclas: dos formas'), T('"when space key pressed" runs once per press. "key space pressed?" inside forever checks every frame while you hold the key.','"when space key pressed" corre una vez por cada toque. "key space pressed?" dentro de forever revisa cada cuadro mientras mantienes la tecla.')]
    ]},
    {t:'try', key:'sensing'},
    {t:'spot', key:'sensing'},
    {t:'check', qs:[
      {q:T('Where must a crash check go?','¿Dónde debe ir la pregunta del choque?'), opts:[T('Inside forever','Dentro de forever'), T('Before forever','Antes de forever'), T('After forever','Después de forever')], ans:0, why:T('Inside forever, it is checked every frame.','Dentro de forever se revisa en cada cuadro.')},
      
      {q:T('"if touching Car? then" is empty. What happens when a car hits the frog?','"if touching Car? then" está vacío. ¿Qué pasa cuando un carro choca con la rana?'), opts:[T('Nothing','Nada'), T('Game over','Fin del juego'), T('The frog jumps','La rana salta')], ans:0, why:T('An empty if has no result.','Un if vacío no tiene resultado.')}
    ]}
  ]}
];
const MOD_IDS = MODS.map(m=>m.id);
const KINDS = [['indent',T('Indentation','Sangría')],['motion',T('Motion (x, y, + −)','Movimiento (x, y, + −)')],['operators',T('Operators (< > =)','Operadores (< > =)')],['sensing',T('Sensing (touching, keys)','Sensores (touching, teclas)')]];

/* ================================================================ unlocking */
function modDone(id){ return !!(P.mods[id] && P.mods[id].done); }
function modOpen(i){ return P.unlockAll || i===0 || modDone(MOD_IDS[i-1]); }
const arcadeOpen = () => P.unlockAll || MOD_IDS.every(modDone);
function gameDone(g){ const s = P.games[g.id]; return !!s && g.bugs.every(b=>s.bugs[b.id] && s.bugs[b.id].st==='done'); }
function gameOpen(g){ if(!arcadeOpen()) return false; if(P.unlockAll || g.tier==='must') return true; return BH.GAMES.filter(x=>x.tier==='must').every(gameDone); }
function checkModDone(m){
  const s = mod(m.id);
  const need = [];
  m.secs.forEach(sec=>{
    if(sec.t==='try') need.push(!!s.tried);
    if(sec.t==='spot') need.push(BH.SPOT[sec.key].every((_,i)=>s.spot[i]));
    if(sec.t==='check'){ need.push(sec.qs.every((_,i)=>s.quiz[i])); if(sec.order) need.push(!!s.order); }
  });
  const was = s.done; s.done = need.every(Boolean); save();
  if(s.done && !was){ renderRail(); updateMeter(); return true; }
  return false;
}

/* ================================================================ shell */
function updateMeter(){
  const total = MODS.length + GAMES.reduce((a,g)=>a+g.bugs.length,0);
  let got = MODS.filter(m=>modDone(m.id)).length;
  GAMES.forEach(g=>{ const s = P.games[g.id]; if(s) g.bugs.forEach(b=>{ if(s.bugs[b.id] && s.bugs[b.id].st==='done') got++; }); });
  const pct = Math.round(got/total*100);
  $('#meterTxt').textContent = pct + '%'; $('#meterBar').style.width = pct + '%';
}
const LOCK = '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="5" width="8" height="6" rx="1.5" fill="currentColor"/><path d="M4 5V3.6a2 2 0 014 0V5" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>';
function navItem(href, label, sub, state, num){
  const a = el('a', 'nav'); a.href = '#'+href;
  const st = el('span', 'st' + (state==='done'?' done':''));
  if(state==='done') st.textContent = '✓'; else if(state==='locked') st.innerHTML = LOCK; else st.textContent = num;
  const t = el('span'); t.appendChild(document.createTextNode(label)); if(sub){ t.appendChild(el('small', null, sub)); }
  a.appendChild(st); a.appendChild(t);
  if(state==='locked'){ a.classList.add('locked'); a.setAttribute('aria-disabled','true'); a.addEventListener('click', e=>e.preventDefault()); }
  if(location.hash.slice(1)===href || (!location.hash && href==='start')) a.setAttribute('aria-current','page');
  return a;
}
function renderRail(){
  const r = $('#rail'); r.innerHTML = '';
  r.appendChild(el('h4', null, tx(['Training','Entrenamiento'])));
  MODS.forEach((m,i)=> r.appendChild(navItem(m.id, tx(m.nav), tx(m.short), modDone(m.id)?'done':(modOpen(i)?'open':'locked'), m.num)));
  if(SHOW_ARCADE){
  r.appendChild(el('h4', null, tx(['Bug Arcade','Arcade de bugs'])));
  r.appendChild(navItem('arcade', tx(['All games','Todos los juegos']), tx(['5 broken games','5 juegos rotos']), BH.GAMES.every(gameDone)?'done':(arcadeOpen()?'open':'locked'), '★'));
  BH.GAMES.forEach(g=> r.appendChild(navItem('game-'+g.id, g.title, tx(g.tier==='must'?['Must-do','Obligatorio']:['Challenge','Reto']), gameDone(g)?'done':(gameOpen(g)?'open':'locked'), g.num)));
  }
  r.appendChild(el('h4', null, tx(['Finish','Final'])));
  r.appendChild(navItem('exit', tx(['Exit ticket','Boleto de salida']), tx(['3 sentences','3 oraciones']), P.exit.done?'done':(arcadeOpen()?'open':'locked'), '✎'));
  const d = el('details', 'teacher'); d.appendChild(el('summary', null, tx(['For teachers','Para maestros'])));
  const row = el('div', 'row');
  const u = el('button', 'btn', P.unlockAll ? tx(['Lock order again','Volver a bloquear']) : tx(['Unlock everything','Desbloquear todo'])); u.type='button';
  u.addEventListener('click', ()=>{ P.unlockAll = !P.unlockAll; save(); renderRail(); route(); });
  const rs = el('button', 'btn', tx(['Reset progress','Borrar progreso'])); rs.type='button';
  let armed = false;
  rs.addEventListener('click', ()=>{ if(!armed){ armed = true; rs.textContent = tx(['Click again to erase','Haz clic otra vez para borrar']); return; } P = {mods:{}, games:{}, sandbox:{}, exit:{}, lang:BH.lang, unlockAll:false}; save(); location.hash = 'start'; renderRail(); route(); updateMeter(); });
  row.appendChild(u); row.appendChild(rs); d.appendChild(row);
  d.appendChild(el('p', 'small', tx(['Progress is saved in this browser only.','El progreso se guarda solo en este navegador.'])));
  r.appendChild(d);
}

/* ================================================================ playground */
let ACTIVE = null;
function Playground(host, o){
  const def = o.def, code = o.code;
  const game = new BH.Game(def, code);
  const v = def.view, W = 800, H = Math.round(800*(v.ymax-v.ymin)/(v.xmax-v.xmin));
  const pg = el('div', 'pg');
  const left = el('div', 'stagecol'), right = el('div');
  const stage = el('div', 'stage'); stage.style.background = def.bg || '#F7F6F2';
  const cv = el('canvas'); cv.width = W; cv.height = H; cv.setAttribute('role','img'); cv.setAttribute('aria-label', tx(['Game screen','Pantalla del juego']));
  const ov = el('div', 'ov'); const ovt = el('span'); ov.appendChild(ovt);
  stage.appendChild(cv); stage.appendChild(ov);
  const ctl = el('div', 'controls');
  const run = el('button', 'runb', '▶ ' + tx(['Run','Run'])); run.type='button';
  const stop = el('button', 'stopb', '■ ' + tx(['Stop','Stop'])); stop.type='button';
  const chg = el('span', 'changed', '');
  ctl.appendChild(run); ctl.appendChild(stop); ctl.appendChild(chg);
  const pad = el('div', 'pad');
  const padKeys = o.keys || ['left arrow','up arrow','down arrow','right arrow','space'];
  const lbl = {'left arrow':'←','up arrow':'↑','down arrow':'↓','right arrow':'→','space':'SPACE'};
  padKeys.forEach(k=>{
    const b = el('button', k==='space'?'wide':'', lbl[k]); b.type='button'; b.setAttribute('aria-label', k);
    const dn = e=>{ e.preventDefault(); game.keyDown(k); }, up = ()=>game.keyUp(k);
    b.addEventListener('pointerdown', dn); b.addEventListener('pointerup', up); b.addEventListener('pointerleave', up); b.addEventListener('pointercancel', up);
    pad.appendChild(b);
  });
  ctl.appendChild(pad);
  left.appendChild(stage); left.appendChild(ctl);
  if(o.controls) left.appendChild(el('p', 'ctrl-note', tx(['Keys: ','Teclas: ']) + tx(o.controls) + tx([' · click the game or use the buttons',' · haz clic en el juego o usa los botones'])));
  const watch = el('div', 'watch'); watch.appendChild(el('h3', null, tx(['Watch: live numbers','Watch: números en vivo'])));
  const wt = el('table'); watch.appendChild(wt); left.appendChild(watch);
  if(o.below) left.appendChild(o.below);
  const edHost = el('div'); right.appendChild(edHost);
  pg.appendChild(left); pg.appendChild(right); host.appendChild(pg);

  const names = def.sprites.map(s=>s.name);
  const editor = new BH.Editor(edHost, {code, names: names.filter(n=>code[n]), objects: def.objects || names, bin: def.bin, onChange(){ chg.textContent = game.running || ran ? tx(['Code changed: press Run to test','Cambiaste el código: presiona Run para probar']) : ''; o.onChange && o.onChange(); }});
  let ran = false, frames = 0, testedFired = false;
  const ctx = cv.getContext('2d');
  function msg(s){ ovt.textContent = s; ov.hidden = !s; }
  function drawWatch(){
    let h = '<tr><th>'+tx(['object','objeto'])+'</th><th>x</th><th>y</th><th>'+tx(['shown','visible'])+'</th></tr>';
    game.sprites.forEach(s=>{ if(s.shape==='ground') return; h += '<tr><td>'+s.name+'</td><td>'+s.x.toFixed(2)+'</td><td>'+s.y.toFixed(2)+'</td><td>'+(s.visible?'✓':'–')+'</td></tr>'; });
    const vs = Object.keys(game.vars);
    if(vs.length) h += '<tr><th colspan="4">'+vs.map(k=>k+' = '+(Math.round(parseFloat(game.vars[k])*100)/100)).join(' · ')+'</th></tr>';
    wt.innerHTML = h;
  }
  this.game = game;
  this.tick = ()=>{
    if(!game.running) return;
    game.step(); frames++;
    if(frames%6===0) drawWatch();
    if(!testedFired && (frames>=90 || !game.running)){ testedFired = true; o.onTested && o.onTested(); }
    if(!game.running){ drawWatch(); msg(game.stopReason==='stop' ? tx(['A "stop all" block ran. Game stopped.','Corrió un bloque "stop all". El juego se detuvo.']) : ''); }
  };
  this.draw = ()=> BH.draw(ctx, game, W, H);
  function start(){ ACTIVE = self; game.start(); ran = true; frames = 0; testedFired = false; chg.textContent = ''; msg(''); drawWatch(); cv.focus && cv.focus(); }
  const self = this;
  run.addEventListener('click', start);
  stop.addEventListener('click', ()=>{ if(game.running){ game.running = false; msg(tx(['Stopped.','Detenido.'])); } });
  cv.tabIndex = 0;
  cv.addEventListener('click', ()=>{ if(!game.running) start(); });
  game.reset(); this.draw(); drawWatch();
  msg(tx(['Press ▶ Run to play','Presiona ▶ Run para jugar']));
  ACTIVE = this;
  this.editor = editor;
}
(function loop(){
  let last = performance.now(), acc = 0;
  function f(t){
    const dt = Math.min(100, t-last); last = t;
    if(ACTIVE){ acc += dt; let n = 0; while(acc >= 1000/60 && n < 5){ ACTIVE.tick(); acc -= 1000/60; n++; } if(n===5) acc = 0; ACTIVE.draw(); }
    requestAnimationFrame(f);
  }
  requestAnimationFrame(f);
})();
function typing(e){ const t = e.target; return t && (t.tagName==='INPUT' || t.tagName==='TEXTAREA' || t.tagName==='SELECT'); }
window.addEventListener('keydown', e=>{
  const k = BH.KEYMAP[e.key]; if(!k || !ACTIVE || typing(e)) return;
  if(ACTIVE.game.running){ e.preventDefault(); ACTIVE.game.keyDown(k); }
});
window.addEventListener('keyup', e=>{ const k = BH.KEYMAP[e.key]; if(k && ACTIVE) ACTIVE.game.keyUp(k); });
window.addEventListener('blur', ()=>{ if(ACTIVE) ACTIVE.game.keys.clear(); });

/* ================================================================ sections */
function secBox(h, tagTxt, done){
  const s = el('section', 'sec'); const hd = el('div', 'sec-h');
  const h2 = el('h2', null, h); h2.setAttribute('data-say',''); hd.appendChild(h2);
  if(tagTxt){ const t = el('span', 'tag' + (done?' ok':''), tagTxt); hd.appendChild(t); }
  s.appendChild(hd); return s;
}
function sayP(text, cls){ const p = el('p', cls||'say'); p.innerHTML = text; p.setAttribute('data-say',''); return p; }

function secPoints(sec){
  const s = secBox(tx(sec.h)); const g = el('div', 'points');
  sec.items.forEach(it=>{ const d = el('div', 'point'); const b = el('b', null, tx(it[0])); b.setAttribute('data-say',''); d.appendChild(b); d.appendChild(sayP(tx(it[1]))); g.appendChild(d); });
  s.appendChild(g); if(sec.frame) s.appendChild(sayP(tx(sec.frame), 'frame')); return s;
}
function secVocab(sec){
  const s = secBox(tx(sec.h)); const g = el('div', 'vocab');
  sec.items.forEach(it=>{ const d = el('div'); d.appendChild(el('b', null, it[0])); d.appendChild(el('i', null, 'Español: '+it[1])); d.appendChild(sayP(tx(it[2]))); g.appendChild(d); });
  s.appendChild(g); return s;
}
function secTable(sec){
  const s = secBox(tx(sec.h)); const w = el('div', 'tablewrap'); const t = el('table', 't');
  const hr = el('tr'); sec.head.forEach(h=>hr.appendChild(el('th', null, tx(h)))); t.appendChild(hr);
  sec.rows.forEach(r=>{ const tr = el('tr'); r.forEach((c,i)=>{ const td = el('td'); if(typeof c==='string' && i>0){ td.appendChild(el('span','code',c)); } else td.textContent = tx(c); tr.appendChild(td); }); t.appendChild(tr); });
  w.appendChild(t); s.appendChild(w); if(sec.frame) s.appendChild(sayP(tx(sec.frame), 'frame')); return s;
}
function secCode(sec){
  const s = secBox(tx(sec.h)); const two = el('div', 'two');
  const h = el('div'); const code = {}; code[sec.sprite] = JSON.parse(JSON.stringify(sec.code));
  new BH.Editor(h, {code, names:[sec.sprite], readOnly:true});
  two.appendChild(h); two.appendChild(sayP(tx(sec.note))); s.appendChild(two); return s;
}
function secCoord(sec){
  const s = secBox(tx(sec.h));
  const X = x => 86 + (x+12)*24.6;       // the real game: Dino at x -12, cactus at x 10
  const G = 218, U = 24.6;                // ground line and pixels per square
  const lab = (x, y, t, anchor, col, size) => `<text x="${x}" y="${y}" text-anchor="${anchor||'middle'}" font-family="JetBrains Mono, monospace" font-size="${size||15}" font-weight="700" fill="${col||'#1B1830'}" paint-order="stroke" stroke="#F7F7F7" stroke-width="5">${t}</text>`;
  s.insertAdjacentHTML('beforeend', `<div class="shot"><svg class="fig" viewBox="0 0 800 300" role="img" aria-label="${tx(['The real Dino Run game with labels. The ground is y 0. The Dino stands at x -12. The cactus starts at x 10. The middle of the screen is x 0. Right is plus x, left is minus x, up is plus y, down is minus y. The top of a jump is y 6. x -20 and x 20 are just off the screen.','El juego real de Dino Run con etiquetas. El suelo es y 0. El Dino está en x -12. El cactus empieza en x 10. El centro de la pantalla es x 0. Derecha es más x, izquierda es menos x, arriba es más y, abajo es menos y. Lo más alto de un salto es y 6. x -20 y x 20 están justo fuera de la pantalla.'])}">
    <rect x="0" y="0" width="800" height="300" fill="#F7F7F7"/>
    <image href="dino-world.jpg" x="0" y="40" width="800" height="200"/>
    <line x1="0" y1="${G}" x2="800" y2="${G}" stroke="#17805F" stroke-width="3" opacity=".8"/>
    <line x1="${X(0)}" y1="44" x2="${X(0)}" y2="${G+10}" stroke="#5B5773" stroke-width="2" stroke-dasharray="6 6"/>
    <line x1="30" y1="${G-6*U}" x2="330" y2="${G-6*U}" stroke="#3A6FF2" stroke-width="2.5" stroke-dasharray="8 6"/>
    ${lab(338, G-6*U+5, tx(['y = 6: top of a jump','y = 6: lo más alto del salto']), 'start', '#3A6FF2', 14)}
    <line x1="${X(-12)}" y1="${G-62}" x2="${X(-12)}" y2="${G-6*U+10}" stroke="#3A6FF2" stroke-width="2.5" marker-end="url(#ar)"/>
    ${lab(X(-12)+10, G-80, '+y ↑', 'start', '#3A6FF2', 16)}
    <circle cx="${X(-12)}" cy="${G}" r="6" fill="#B83A28"/>
    ${lab(X(-12), G+26, 'Dino: x = -12, y = 0', 'start', '#B83A28', 14)}
    <circle cx="${X(10)}" cy="${G}" r="6" fill="#B83A28"/>
    ${lab(X(10), G+26, tx(['Cactus: x = 10','Cactus: x = 10']), 'middle', '#B83A28', 14)}
    ${lab(X(0), G+26, 'x = 0', 'middle', '#5B5773', 14)}
    ${lab(790, G-8, tx(['ground: y = 0','suelo: y = 0']), 'end', '#17805F', 14)}
    ${lab(12, 26, tx(['← x = -20 is just off screen','← x = -20 está fuera de la pantalla']), 'start', '#5B5773', 13)}
    ${lab(788, 26, tx(['x = 20 is just off screen →','x = 20 está fuera de la pantalla →']), 'end', '#5B5773', 13)}
    <g>
      <line x1="150" y1="282" x2="70" y2="282" stroke="#B83A28" stroke-width="3" marker-end="url(#ar2)"/>
      ${lab(160, 288, tx(['−x = left','−x = izquierda']), 'start', '#B83A28', 16)}
      ${lab(400, 288, tx(['+y = up ↑   −y = down ↓','+y = arriba ↑   −y = abajo ↓']), 'middle', '#3A6FF2', 15)}
      ${lab(640, 288, tx(['+x = right','+x = derecha']), 'end', '#17805F', 16)}
      <line x1="650" y1="282" x2="730" y2="282" stroke="#17805F" stroke-width="3" marker-end="url(#ar3)"/>
    </g>
    <defs>
      <marker id="ar" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#3A6FF2"/></marker>
      <marker id="ar2" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#B83A28"/></marker>
      <marker id="ar3" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#17805F"/></marker>
    </defs>
  </svg></div>`);
  s.appendChild(sayP(tx(['This is the real Dino Run screen. The ground is y 0. The Dino stands at x -12. The middle is x 0. Things start just off the right edge (x 20) and leave past the left edge (x -20).','Esta es la pantalla real de Dino Run. El suelo es y 0. El Dino está en x -12. El centro es x 0. Las cosas empiezan justo fuera del borde derecho (x 20) y salen pasando el borde izquierdo (x -20).'])));
  return s;
}
function secNumline(sec){
  const s = secBox(tx(sec.h));
  const X = x => 30 + (x+22)*16.4;
  const steps = []; for(let x=20; x>-21; x-=0.3) steps.push(Math.round(x*10)/10);
  s.insertAdjacentHTML('beforeend', `<svg class="fig" viewBox="0 0 780 150" role="img" aria-label="${tx(['A number line from -22 to 20. Dots show x moving 0.3 at a time. The dots land on -19.9 and then -20.2. None lands exactly on -20.','Una recta numérica de -22 a 20. Los puntos muestran x moviéndose de 0.3 en 0.3. Caen en -19.9 y luego en -20.2. Ninguno cae exactamente en -20.'])}">
    <rect x="0" y="0" width="780" height="150" rx="14" fill="var(--panel-2)"/>
    <rect x="${X(-22)}" y="30" width="${X(-20)-X(-22)}" height="60" fill="var(--bad-bg)"/>
    <line x1="${X(-22)}" y1="60" x2="${X(20)}" y2="60" stroke="var(--ink)" stroke-width="2"/>
    ${steps.map(x=>`<circle cx="${X(x)}" cy="60" r="2.6" fill="var(--muted)"/>`).join('')}
    <line x1="${X(-20)}" y1="26" x2="${X(-20)}" y2="94" stroke="var(--bug)" stroke-width="3"/>
    <text x="${X(-20)}" y="116" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="15" font-weight="700" fill="var(--bug)">-20</text>
    <text x="${X(-19.9)+8}" y="22" font-family="JetBrains Mono, monospace" font-size="13" fill="var(--ink)">-19.9</text>
    <text x="${X(-20.2)-4}" y="22" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="13" fill="var(--ink)">-20.2</text>
    <text x="${X(20)}" y="116" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="15" fill="var(--ink)">20</text>
    <text x="${X(-21)}" y="140" text-anchor="middle" font-family="Atkinson Hyperlegible, Arial" font-size="13" fill="var(--ink)">x &lt; -20</text>
  </svg>`);
  s.appendChild(sayP(tx(['The cactus starts at 20 and moves 0.3 each frame: 20, 19.7, 19.4 … -19.9, -20.2. It jumps right over -20. So x position = -20 is never yes, but x position < -20 is yes as soon as it passes (the red zone).','El cactus empieza en 20 y se mueve 0.3 en cada cuadro: 20, 19.7, 19.4 … -19.9, -20.2. Se salta el -20. Así que x position = -20 nunca es sí, pero x position < -20 es sí apenas lo pasa (la zona roja).'])));
  return s;
}
function secTry(sec, m){
  const sb = BH.SANDBOX[sec.key]; const s = mod(m.id);
  const box = secBox(tx(['Try it: ','Pruébalo: ']) + tx(sb.title), s.tried ? tx(['Done','Listo']) : tx(['To do','Por hacer']), s.tried);
  const code = P.sandbox[sec.key] || (P.sandbox[sec.key] = JSON.parse(JSON.stringify(sb.code)));
  const goalBox = el('div', 'goal'); box.appendChild(goalBox);
  const reset = el('button', 'btn', tx(['Start over','Empezar de nuevo'])); reset.type='button';
  function goalIdx(){ let i = 0; while(i < sb.goals.length && sb.goals[i].ok(code)) i++; return i; }
  function showGoal(){
    const i = goalIdx(); goalBox.innerHTML = '';
    const req = sb.goals.filter(g=>!g.optional).length;
    if(i >= sb.goals.length){ goalBox.classList.add('done'); goalBox.appendChild(el('b', null, tx(['All goals done','Todas las metas listas']))); goalBox.appendChild(sayP(tx(['Great work. Press Run to see it, then go on to Spot the bug.','Buen trabajo. Presiona Run para verlo y sigue con Encuentra el bug.']))); }
    else { goalBox.classList.remove('done'); goalBox.appendChild(el('b', null, tx(['Goal','Meta']) + ' ' + (i+1) + ' / ' + sb.goals.length)); goalBox.appendChild(sayP(tx(sb.goals[i].text))); }
    if(i >= req && !s.tried){ s.tried = true; save(); const tg = box.querySelector('.tag'); if(tg){ tg.textContent = tx(['Done','Listo']); tg.classList.add('ok'); } afterProgress(m); }
  }
  sb.goals.forEach((g,i)=>{ if(i===sb.goals.length-1 && sec.key==='operators') g.optional = true; });
  const hostDiv = el('div'); box.appendChild(hostDiv);
  new Playground(hostDiv, {def:sb, code, onChange(){ save(); showGoal(); }});
  const row = el('div', 'row'); row.appendChild(reset); box.appendChild(row);
  reset.addEventListener('click', ()=>{ P.sandbox[sec.key] = JSON.parse(JSON.stringify(sb.code)); save(); route(); });
  showGoal();
  return box;
}
/* ---------- one-thing-at-a-time steps */
function stepPoint(sec, it, i){
  const s = el('section', 'sec step-card');
  s.appendChild(el('p', 'eyebrow', tx(sec.h) + ' · ' + (i+1) + ' / ' + sec.items.length));
  const h = el('h2', 'big-h', tx(it[0])); h.setAttribute('data-say',''); s.appendChild(h);
  s.appendChild(sayP(tx(it[1]), 'big-p'));
  if(sec.frame && i===sec.items.length-1) s.appendChild(sayP(tx(sec.frame), 'frame'));
  return s;
}
function spotOne(sec, m, it, i){
  const s = mod(m.id);
  const box = secBox(tx(['Spot the bug','Encuentra el bug']) + ' · ' + (i+1) + ' / ' + BH.SPOT[sec.key].length);
  box.appendChild(sayP(tx(['Read the symptom. Click the block that causes it.','Lee el síntoma. Haz clic en el bloque que lo causa.'])));
  const sym = el('p', 'frame'); sym.innerHTML = '<b>' + tx(it.sym) + '</b>'; sym.setAttribute('data-say',''); box.appendChild(sym);
  const edh = el('div', 'spot-ed'); box.appendChild(edh);
  const fb = el('p', 'fb'); fb.hidden = true; box.appendChild(fb);
  const code = {}; code[it.sprite] = JSON.parse(JSON.stringify(it.code));
  let picked = s.spot[i] ? it.ans : -1, wrong = -1;
  const good = ()=>{ fb.hidden = false; fb.className = 'fb good'; fb.textContent = tx(['Found it! ','¡Lo encontraste! ']) + tx(it.why); };
  const ed = new BH.Editor(edh, {code, names:[it.sprite], readOnly:true,
    mark:(tab, idx)=> idx===picked ? 'hit' : (idx===wrong ? 'miss' : ''),
    onPick:(tab, idx)=>{
      if(s.spot[i]) return;
      if(idx===it.ans){ picked = idx; wrong = -1; s.spot[i] = true; save(); good(); afterProgress(m); }
      else { wrong = idx; fb.hidden = false; fb.className = 'fb bad'; fb.textContent = tx(['Not that one. Read the symptom again and think: which block controls it?','Ese no. Lee el síntoma otra vez y piensa: ¿qué bloque lo controla?']); }
      ed.render();
    }});
  if(s.spot[i]) good();
  return box;
}
function orderStep(m){
  const s = mod(m.id);
  const box = secBox(tx(['Checkpoint','Punto de control']));
  const steps = [T('See it','Míralo'), T('Say it','Dilo'), T('Find it','Encuéntralo'), T('Fix it and test it','Arréglalo y pruébalo')];
  const qh = el('p', 'big-p'); qh.innerHTML = '<b>' + tx(['Tap the 4 debugging steps in order.','Toca los 4 pasos para depurar en orden.']) + '</b>'; qh.setAttribute('data-say',''); box.appendChild(qh);
  const opts = el('div', 'opts big-opts'); const fb = el('p', 'fb'); fb.hidden = true;
  let next = s.order ? 4 : 0;
  [2,0,3,1].forEach(k=>{
    const b = el('button', 'opt' + (s.order?' right':''), (s.order ? (k+1)+'. ' : '') + tx(steps[k])); b.type='button';
    b.addEventListener('click', ()=>{
      if(s.order || b.classList.contains('right')) return;
      if(k===next){ b.classList.add('right'); b.textContent = (k+1) + '. ' + tx(steps[k]); next++; fb.hidden = true;
        if(next===4){ s.order = true; save(); fb.hidden = false; fb.className = 'fb good'; fb.textContent = tx(['Correct order!','¡Orden correcto!']); afterProgress(m); } }
      else { fb.hidden = false; fb.className = 'fb bad'; fb.textContent = tx(['Not yet. Which step comes next?','Todavía no. ¿Qué paso sigue?']); }
    });
    opts.appendChild(b);
  });
  box.appendChild(opts); box.appendChild(fb);
  return box;
}
function qStep(m, sec, i){
  const s = mod(m.id), qq = sec.qs[i];
  const box = secBox(tx(['Checkpoint','Punto de control']) + ' · ' + tx(['Question','Pregunta']) + ' ' + (i+1) + ' / ' + sec.qs.length);
  const qh = el('p', 'big-p'); qh.innerHTML = '<b>' + tx(qq.q) + '</b>'; qh.setAttribute('data-say',''); box.appendChild(qh);
  const opts = el('div', 'opts big-opts'); const fb = el('p', 'fb'); fb.hidden = true;
  const rot = i % 3;
  [0,1,2].map(k=>(k+rot)%3).forEach(k=>{
    const b = el('button', 'opt', tx(qq.opts[k])); b.type='button';
    if(s.quiz[i] && k===qq.ans) b.classList.add('right');
    b.addEventListener('click', ()=>{
      if(s.quiz[i]) return;
      opts.querySelectorAll('.opt').forEach(x=>x.classList.remove('wrong'));
      if(k===qq.ans){ b.classList.add('right'); s.quiz[i] = true; save(); fb.hidden = false; fb.className = 'fb good'; fb.textContent = tx(['Yes! ','¡Sí! ']) + tx(qq.why); afterProgress(m); }
      else { b.classList.add('wrong'); fb.hidden = false; fb.className = 'fb bad'; fb.textContent = tx(['Not quite. Try another answer.','Casi. Prueba otra respuesta.']); }
    });
    opts.appendChild(b);
  });
  if(s.quiz[i]){ fb.hidden = false; fb.className = 'fb good'; fb.textContent = tx(qq.why); }
  box.appendChild(opts); box.appendChild(fb);
  return box;
}
function doneStep(m){
  const s = mod(m.id); const i = MOD_IDS.indexOf(m.id);
  const box = el('section', 'sec step-card');
  if(!s.done){
    box.appendChild(el('h2', 'big-h', tx(['Almost there','Ya casi'])));
    box.appendChild(sayP(tx(['Some steps are not finished yet. Use the bar at the top to go back to them.','Algunos pasos no están terminados. Usa la barra de arriba para volver a ellos.']), 'big-p'));
    return box;
  }
  box.classList.add('win');
  box.insertAdjacentHTML('beforeend', '<svg width="64" height="64" viewBox="0 0 30 30" aria-hidden="true"><rect x="3" y="3" width="24" height="24" rx="7" fill="#7FE0C0"/><path d="M9 15.5l4 4 8-9" stroke="#1B1830" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  const h = el('h2', 'big-h', tx(['Mission complete!','¡Misión cumplida!'])); h.setAttribute('data-say',''); box.appendChild(h);
  const next = i < MODS.length-1 ? MODS[i+1] : null;
  box.appendChild(sayP(next ? tx(['Next mission: ','Siguiente misión: ']) + tx(next.nav) + '.' : (SHOW_ARCADE ? tx(['You finished training. The Bug Arcade is open!','Terminaste el entrenamiento. ¡El Arcade de bugs está abierto!']) : tx(['You finished training. Now fill out your exit ticket.','Terminaste el entrenamiento. Ahora llena tu boleto de salida.'])), 'big-p'));
  const a = el('a', 'btn primary big-btn', next ? tx(['Start ','Empezar ']) + tx(next.nav) + ' →' : (SHOW_ARCADE ? tx(['Open the Bug Arcade →','Abrir el Arcade de bugs →']) : tx(['Exit ticket →','Boleto de salida →'])));
  a.href = '#' + (next ? next.id : (SHOW_ARCADE ? 'arcade' : 'exit')); box.appendChild(a);
  return box;
}
function buildSteps(m){
  const s = mod(m.id), steps = [];
  const learn = T('Learn','Aprende');
  m.secs.forEach(sec=>{
    switch(sec.t){
      case 'points':
        if(sec.items.length > 3 && !sec.one) sec.items.forEach((it,i)=>steps.push({kind:learn, render:()=>stepPoint(sec, it, i)}));
        else steps.push({kind:learn, render:()=>secPoints(sec)});
        break;
      case 'vocab': steps.push({kind:learn, render:()=>secVocab(sec)}); break;
      case 'table': steps.push({kind:learn, render:()=>secTable(sec)}); break;
      case 'code': steps.push({kind:learn, render:()=>secCode(sec)}); break;
      case 'coord': steps.push({kind:learn, render:()=>secCoord(sec)}); break;
      case 'numline': steps.push({kind:learn, render:()=>secNumline(sec)}); break;
      case 'try': steps.push({kind:T('Try it','Pruébalo'), render:()=>secTry(sec, m), done:()=>!!s.tried}); break;
      case 'spot': BH.SPOT[sec.key].forEach((it,i)=>steps.push({kind:T('Spot the bug','Encuentra el bug'), render:()=>spotOne(sec, m, it, i), done:()=>!!s.spot[i]})); break;
      case 'check':
        if(sec.order) steps.push({kind:T('Checkpoint','Punto de control'), render:()=>orderStep(m), done:()=>!!s.order});
        sec.qs.forEach((q,i)=>steps.push({kind:T('Checkpoint','Punto de control'), render:()=>qStep(m, sec, i), done:()=>!!s.quiz[i]}));
        break;
    }
  });
  steps.push({kind:T('Finish','Final'), render:()=>doneStep(m)});
  return steps;
}
let refreshStep = null;
function afterProgress(m){ checkModDone(m); if(refreshStep) refreshStep(); }
function pageHead(eyebrow, title, lead){
  const h = el('div', 'page-h');
  const e = el('p', 'eyebrow', eyebrow); h.appendChild(e);
  const t = el('h1', null, title); t.setAttribute('data-say',''); h.appendChild(t);
  if(lead) h.appendChild(sayP(lead, 'lead'));
  return h;
}
function lockedPage(){
  const pg = el('div', 'page');
  pg.appendChild(pageHead(tx(['Locked','Bloqueado']), tx(['Finish the mission before this one first.','Primero termina la misión anterior.'])));
  const a = el('a', 'btn primary', tx(['Go to Start','Ir al inicio'])); a.href = '#start'; pg.appendChild(a);
  return pg;
}
function renderModule(m){
  const mi = MOD_IDS.indexOf(m.id);
  if(!modOpen(mi)) return lockedPage();
  const s = mod(m.id), steps = buildSteps(m);
  const pg = el('div', 'page page-steps');
  const head = el('div', 'page-h');
  head.appendChild(el('p', 'eyebrow', tx(m.eyebrow)));
  const h1 = el('h1', 'h1-sm', tx(m.title)); h1.setAttribute('data-say',''); head.appendChild(h1);
  pg.appendChild(head);
  const bar = el('div', 'stepper'); bar.setAttribute('role','list'); pg.appendChild(bar);
  const label = el('p', 'step-label'); pg.appendChild(label);
  const stage = el('div', 'step-stage'); pg.appendChild(stage);
  const nav = el('div', 'stepnav');
  const back = el('button', 'btn big-btn', '← ' + tx(['Back','Atrás'])); back.type='button';
  const next = el('button', 'btn primary big-btn', tx(['Next','Siguiente']) + ' →'); next.type='button';
  const why = el('span', 'small', '');
  nav.appendChild(back); nav.appendChild(why); nav.appendChild(next); pg.appendChild(nav);
  const doneAt = i => !steps[i].done || steps[i].done();
  let far = Math.min(steps.length-1, s.far || 0);
  let cur = Math.min(far, s.step || 0);
  function canLeave(i){ return P.unlockAll || doneAt(i); }
  function paint(){
    bar.innerHTML = '';
    steps.forEach((st, i)=>{
      const d = el('button', 'seg-dot'); d.type='button'; d.setAttribute('role','listitem');
      const ok = doneAt(i) && i < far || (steps[i].done && steps[i].done());
      if(i===cur) d.classList.add('cur'); else if(ok) d.classList.add('ok');
      d.setAttribute('aria-label', tx(['Step ','Paso ']) + (i+1) + ': ' + tx(st.kind));
      if(i > far && !P.unlockAll) d.disabled = true;
      d.addEventListener('click', ()=>show(i));
      bar.appendChild(d);
    });
    label.textContent = tx(['Step ','Paso ']) + (cur+1) + tx([' of ',' de ']) + steps.length + ' · ' + tx(steps[cur].kind);
    back.disabled = cur===0;
    const last = cur===steps.length-1;
    next.hidden = last;
    next.disabled = !canLeave(cur);
    why.textContent = next.disabled ? tx(['Finish this step to go on.','Termina este paso para seguir.']) : '';
  }
  function show(i){
    ACTIVE = null; stopSpeech();
    cur = i; far = Math.max(far, i); s.step = cur; s.far = far; save();
    stage.innerHTML = '';
    if(i===0) stage.appendChild(sayP(tx(m.lead), 'lead step-lead'));
    stage.appendChild(steps[i].render());
    paint();
    window.scrollTo(0, 0);
  }
  back.addEventListener('click', ()=>{ if(cur>0) show(cur-1); });
  next.addEventListener('click', ()=>{ if(cur<steps.length-1 && canLeave(cur)) show(cur+1); });
  refreshStep = ()=>{ paint(); if(cur===steps.length-1) show(cur); };
  show(cur);
  return pg;
}
function stars(n){ return '★'.repeat(n) + '☆'.repeat(Math.max(0,3-n)); }
function renderArcade(){
  if(!arcadeOpen()) return lockedPage();
  const pg = el('div', 'page');
  pg.appendChild(pageHead(tx(['Bug Arcade','Arcade de bugs']), tx(['Five broken games','Cinco juegos rotos']),
    tx(['Each game has 3 bugs. Play it, read the player reports, find the bugs, fix them, and press Run to test. Must-do: games 1 to 3. Challenge: games 4 and 5.','Cada juego tiene 3 bugs. Juega, lee los reportes de los jugadores, encuentra los bugs, arréglalos y presiona Run para probar. Obligatorio: juegos 1 a 3. Reto: juegos 4 y 5.'])));
  const grid = el('div', 'cabinets');
  BH.GAMES.forEach(g=>{
    const open = gameOpen(g); const s = P.games[g.id] || {bugs:{}};
    const fixed = g.bugs.filter(b=>s.bugs[b.id] && s.bugs[b.id].st==='done');
    const st = fixed.reduce((a,b)=>a+(s.bugs[b.id].stars||0),0);
    const c = el('button', 'cab'); c.type='button'; if(!open) c.disabled = true;
    c.appendChild(el('span', 'no', String(g.num)));
    c.appendChild(el('h3', null, g.title));
    c.appendChild(el('p', 'small', tx(g.blurb)));
    const meta = el('div', 'meta'); meta.appendChild(el('span', null, fixed.length + '/3 ' + tx(['bugs fixed','bugs arreglados'])));
    const sv = el('span', 'stars'); sv.textContent = '★ ' + st + '/9'; meta.appendChild(sv); c.appendChild(meta);
    c.appendChild(el('span', 'tag' + (gameDone(g)?' ok':''), gameDone(g) ? tx(['Complete','Completo']) : (open ? tx(g.tier==='must'?['Must-do','Obligatorio']:['Challenge','Reto']) : tx(['Finish games 1–3 first','Primero termina los juegos 1–3']))));
    c.addEventListener('click', ()=>{ location.hash = 'game-' + g.id; });
    grid.appendChild(c);
  });
  pg.appendChild(grid);
  const how = secPoints({h:T('How to hunt','Cómo cazar'), items:[
    [T('1 · Play','1 · Juega'), T('Press Run. Read the player reports. Which one do you see?','Presiona Run. Lee los reportes. ¿Cuál ves?')],
    [T('2 · Watch','2 · Observa'), T('Use the Watch panel. Which numbers go the wrong way?','Usa el panel Watch. ¿Qué números van al revés?')],
    [T('3 · Fix','3 · Arregla'), T('Change one thing in the code, then press Run to test it.','Cambia una cosa en el código y presiona Run para probar.')],
    [T('4 · Report','4 · Reporta'), T('Say what kind of bug it was. Fewer hints = more stars.','Di qué tipo de bug era. Menos pistas = más estrellas.')]
  ]});
  pg.appendChild(how);
  return pg;
}
function renderGame(g){
  if(!gameOpen(g)) return lockedPage();
  const s = gst(g.id);
  if(!s.code) s.code = JSON.parse(JSON.stringify(g.code));
  const pg = el('div', 'page');
  const back = el('a', 'small', '← ' + tx(['All games','Todos los juegos'])); back.href = '#arcade';
  pg.appendChild(back);
  pg.appendChild(pageHead(tx(['Game ','Juego ']) + g.num + ' · ' + tx(g.tier==='must'?['Must-do','Obligatorio']:['Challenge','Reto']), g.title, tx(g.blurb)));

  const reports = el('div', 'reports');
  const rh = el('h3', null, tx(['Player reports','Reportes de jugadores'])); rh.style.fontSize = '18px'; reports.appendChild(rh);
  const box = el('section', 'sec'); pg.appendChild(box);
  const hostDiv = el('div'); box.appendChild(hostDiv);
  const doneBox = el('div', 'pass'); doneBox.hidden = true;
  const bstate = b => (s.bugs[b.id] = s.bugs[b.id] || {st:'todo', hints:0});
  let pgc;
  function renderReports(){
    reports.querySelectorAll('.rep-card').forEach(n=>n.remove());
    g.bugs.forEach((b, i)=>{
      const st = bstate(b);
      const card = el('div', 'rep-card' + (st.st==='done'?' done':''));
      const top = el('div', 'rep-top');
      top.appendChild(el('span', 'n', String(i+1)));
      const p = sayP(tx(b.report)); p.style.flex = '1'; top.appendChild(p);
      const chipTxt = {todo:['Not fixed','Sin arreglar'], fixed:['Fixed? Press Run to test','¿Arreglado? Presiona Run'], tested:['Works! What kind of bug?','¡Funciona! ¿Qué tipo de bug?'], done:['Done','Listo']}[st.st];
      top.appendChild(el('span', 'chip ' + ({todo:'todo', fixed:'fix', tested:'fix', done:'ok'}[st.st]), tx(chipTxt)));
      card.appendChild(top);
      if(st.st==='done'){ card.appendChild(el('span', 'stars', stars(st.stars))); }
      if(st.hints && st.st!=='done'){ const ul = el('ol', 'hintlist'); b.hints.slice(0, st.hints).forEach(h=>ul.appendChild(el('li', null, tx(h)))); card.appendChild(ul); }
      if(st.st==='tested'){
        const kq = el('div', 'kinds'); const fb = el('p', 'fb'); fb.hidden = true;
        KINDS.forEach(k=>{
          const kb = el('button', 'opt', tx(k[1])); kb.type='button';
          kb.addEventListener('click', ()=>{
            if(b.kind.includes(k[0])){ st.st = 'done'; st.stars = Math.max(1, 3 - (st.hints||0)); save(); renderReports(); renderRail(); updateMeter(); }
            else { kb.classList.add('wrong'); fb.hidden = false; fb.className = 'fb bad'; fb.textContent = tx(['Not quite. Look at the block you changed. Try again.','Casi. Mira el bloque que cambiaste. Intenta otra vez.']); }
          });
          kq.appendChild(kb);
        });
        card.appendChild(kq); card.appendChild(fb);
      }
      if(st.st!=='done' && (st.hints||0) < 3){
        const hb = el('button', 'btn', tx(['Hint','Pista']) + ' ' + ((st.hints||0)+1) + '/3 (−1 ★)'); hb.type='button'; hb.style.alignSelf = 'flex-start';
        hb.addEventListener('click', ()=>{ st.hints = (st.hints||0)+1; save(); renderReports(); });
        card.appendChild(hb);
      }
      reports.appendChild(card);
    });
    const all = g.bugs.every(b=>bstate(b).st==='done');
    doneBox.hidden = !all; doneBox.innerHTML = '';
    if(all){
      doneBox.appendChild(el('b', null, tx(['All 3 bugs fixed!','¡Los 3 bugs arreglados!'])));
      const nx = BH.GAMES.find(x=>x.num===g.num+1);
      const a = el('a', 'btn primary', nx ? tx(['Next game: ','Siguiente juego: ']) + nx.title + ' →' : tx(['Exit ticket →','Boleto de salida →']));
      a.href = '#' + (nx ? 'game-'+nx.id : 'exit'); doneBox.appendChild(a);
    }
  }
  function checkBugs(){
    let ch = false;
    g.bugs.forEach(b=>{ const st = bstate(b); const ok = b.fixed(s.code);
      if(st.st==='todo' && ok){ st.st = 'fixed'; ch = true; }
      else if(st.st==='fixed' && !ok){ st.st = 'todo'; ch = true; } });
    if(ch){ save(); renderReports(); }
  }
  reports.appendChild(doneBox);
  const reset = el('button', 'btn', tx(['Start this game over','Empezar este juego de nuevo'])); reset.type='button';
  let armed = false;
  reset.addEventListener('click', ()=>{ if(!armed){ armed = true; reset.textContent = tx(['Click again: your code goes back to the broken version','Haz clic otra vez: tu código vuelve a la versión rota']); return; }
    s.code = JSON.parse(JSON.stringify(g.code)); g.bugs.forEach(b=>{ if(bstate(b).st!=='done') s.bugs[b.id] = {st:'todo', hints:bstate(b).hints||0}; }); save(); route(); });
  const below = el('div'); below.appendChild(reports);
  pgc = new Playground(hostDiv, {def:g, code:s.code, controls:g.controls, below,
    onChange(){ save(); checkBugs(); },
    onTested(){ let ch = false; g.bugs.forEach(b=>{ const st = bstate(b); if(st.st==='fixed' && b.fixed(s.code)){ st.st = 'tested'; ch = true; } }); if(ch){ save(); renderReports(); } }
  });
  const row = el('div', 'row'); row.appendChild(reset); box.appendChild(row);
  checkBugs(); renderReports();
  return pg;
}
function renderExit(){
  if(!arcadeOpen()) return lockedPage();
  const pg = el('div', 'page');
  pg.appendChild(pageHead(tx(['Exit ticket','Boleto de salida']), tx(['Finish the sentences','Termina las oraciones']), tx(['Write, or use the words from the lesson. Your answers stay on this computer.','Escribe o usa las palabras de la lección. Tus respuestas se quedan en esta computadora.'])));
  const sec = el('section', 'sec');
  const prompts = [
    T('Moving LEFT uses ___ x. To check the LEFT edge, I use ___.','Moverse a la IZQUIERDA usa ___ x. Para revisar el borde IZQUIERDO uso ___.'),
    T('A collision check must be inside ___ because ___.','La pregunta de choque debe estar dentro de ___ porque ___.'),
    T('The hardest bug was ___. I found it by ___.','El bug más difícil fue ___. Lo encontré ___.')
  ];
  prompts.forEach((p, i)=>{
    const f = el('div', 'field'); const id = 'exit' + i;
    const l = el('label', null, (i+1) + '. ' + tx(p)); l.htmlFor = id; l.setAttribute('data-say',''); f.appendChild(l);
    const ta = el('textarea'); ta.id = id; ta.value = P.exit['a'+i] || '';
    ta.addEventListener('input', ()=>{ P.exit['a'+i] = ta.value; P.exit.done = [0,1,2].every(k=>(P.exit['a'+k]||'').trim().length>3); save(); renderRail(); });
    f.appendChild(ta); sec.appendChild(f);
  });
  sec.appendChild(el('p', 'small', tx(['Word bank: forever · inside · < · > · negative · positive · touching · x · y · every frame','Banco de palabras: forever · adentro · < · > · negativo · positivo · touching · x · y · cada cuadro'])));
  pg.appendChild(sec);
  const mods = MODS.filter(m=>modDone(m.id)).length;
  let bugs = 0, st = 0; GAMES.forEach(g=>{ const s = P.games[g.id]; if(s) g.bugs.forEach(b=>{ const x = s.bugs[b.id]; if(x && x.st==='done'){ bugs++; st += x.stars||0; } }); });
  const badge = el('div', 'badge');
  badge.insertAdjacentHTML('beforeend', '<svg width="72" height="72" viewBox="0 0 30 30" aria-hidden="true"><rect x="3" y="3" width="24" height="24" rx="7" fill="#7FE0C0"/><circle cx="15" cy="16" r="6" fill="#1B1830"/><path d="M9 9l3 3M21 9l-3 3M7 16h2M21 16h2M9 23l3-2M21 23l-3-2" stroke="#1B1830" stroke-width="2" stroke-linecap="round"/></svg>');
  const bt = el('div'); bt.appendChild(el('div', 'big', tx(['Bug Hunter','Cazador de bugs'])));
  bt.appendChild(el('p', null, tx(['Missions: ','Misiones: ']) + mods + '/' + MODS.length + (SHOW_ARCADE ? ' · ' + tx(['Bugs fixed: ','Bugs arreglados: ']) + bugs + '/15 · ★ ' + st + '/45' : '')));
  bt.appendChild(el('p', null, tx(['Show this screen to your teacher.','Muéstrale esta pantalla a tu maestro.'])));
  badge.appendChild(bt); pg.appendChild(badge);
  const cp = el('button', 'btn', tx(['Copy my answers','Copiar mis respuestas'])); cp.type='button';
  cp.addEventListener('click', ()=>{
    const t = prompts.map((p,i)=>(i+1)+'. '+tx(p)+'\n'+(P.exit['a'+i]||'')).join('\n\n') + '\n\nMissions ' + mods + '/' + MODS.length + (SHOW_ARCADE ? ' · Bugs ' + bugs + '/15 · Stars ' + st + '/45' : '');
    const ok = ()=>{ cp.textContent = tx(['Copied','Copiado']); };
    if(navigator.clipboard) navigator.clipboard.writeText(t).then(ok, ()=>{ cp.textContent = tx(['Copy failed: select the text instead','No se pudo copiar: selecciona el texto']); });
  });
  pg.appendChild(cp);
  return pg;
}

/* ================================================================ router */
function route(){
  const id = location.hash.slice(1) || 'start';
  ACTIVE = null; stopSpeech(); refreshStep = null;
  const main = $('#main'); main.innerHTML = '';
  let node;
  const m = MODS.find(x=>x.id===id);
  if(m) node = renderModule(m);
  else if(SHOW_ARCADE && id==='arcade') node = renderArcade();
  else if(SHOW_ARCADE && id.startsWith('game-')){ const g = BH.GAMES.find(x=>'game-'+x.id===id); node = g ? renderGame(g) : renderModule(MODS[0]); }
  else if(id==='exit') node = renderExit();
  else node = renderModule(MODS[0]);
  main.appendChild(node);
  renderRail(); updateMeter();
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);

/* ================================================================ language + read aloud */
function setLang(l){
  BH.lang = l; P.lang = l; save();
  $('#langEn').setAttribute('aria-pressed', l==='en'); $('#langEs').setAttribute('aria-pressed', l==='es');
  document.documentElement.lang = l;
  $('#readBtn').textContent = tx(['Read aloud','Leer en voz alta']);
  route();
}
$('#langEn').addEventListener('click', ()=>setLang('en'));
$('#langEs').addEventListener('click', ()=>setLang('es'));
let speaking = false;
function stopSpeech(){ try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){} speaking = false; const b = $('#readBtn'); if(b) b.textContent = tx(['Read aloud','Leer en voz alta']); }
$('#readBtn').addEventListener('click', ()=>{
  if(!window.speechSynthesis){ $('#readBtn').textContent = tx(['Not available here','No disponible aquí']); return; }
  if(speaking){ stopSpeech(); return; }
  const text = Array.from(document.querySelectorAll('#main [data-say]')).map(n=>n.textContent).join('. ');
  const u = new SpeechSynthesisUtterance(text); u.lang = BH.lang==='es' ? 'es-US' : 'en-US'; u.rate = 0.92;
  u.onend = stopSpeech; speaking = true; $('#readBtn').textContent = tx(['Stop reading','Dejar de leer']);
  speechSynthesis.speak(u);
});

setLang(BH.lang);
})();
