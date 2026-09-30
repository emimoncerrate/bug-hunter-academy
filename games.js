/* Bug Hunter Academy — the five broken arcade games, the practice sandboxes
   and the "spot the bug" snippets. Every game is written with the same
   blocks as Dino Run. */
(function(){
const BH = window.BH;
const L = (i, op, a) => ({i, op, a: a || {}});
const P = ax => ({r:'pos', ax});
const PO = (ax, o) => ({r:'posOf', ax, o});
const VR = v => ({r:'var', v});
const RND = (a, b) => ({r:'rand', a, b});
const C = (op, a, b) => ({op, a, b});
const TOUCH = o => ({op:'touch', o});
const KEY = k => ({op:'key', k});
BH.mk = {L, P, PO, VR, RND, C, TOUCH, KEY};

/* ---------- helpers for bug checks */
const find = BH.find;
const inForever = anc => BH.inside(anc, 'forever');
const ifWith = (code, spr, pred) => find(code, spr, n => n.op==='if' && n.a.c && pred(n.a.c, n));
const bodyHas = (n, pred) => BH.has(n, pred);
const ch = (ax, sign) => n => n.op==='change' && n.a.ax===ax && typeof n.a.n==='number' && Math.sign(n.a.n)===sign;
/* direction logic: moving toward the target means (a < target and +) or (a > target and -) */
const towards = (c, n, ax) => {
  const b = (n.body||[]).find(x=>x.op==='change' && x.a.ax===ax && typeof x.a.n==='number');
  if(!b) return false;
  return (c.op==='lt' && b.a.n>0) || (c.op==='gt' && b.a.n<0);
};

const view40 = {xmin:-20, xmax:20, ymin:-15, ymax:15};

/* ================================================================ games */
const GAMES = [];

/* 1 ---------------------------------------------------------- Dino Run */
GAMES.push({
  id:'dino', num:1, title:'Dino Run', tier:'must',
  blurb:['Jump over the cactus. Every time it leaves the screen, you get a point.','Salta el cactus. Cada vez que sale de la pantalla, ganas un punto.'],
  controls:['SPACE = jump','ESPACIO = saltar'],
  view:{xmin:-20, xmax:20, ymin:-3, ymax:11}, bg:'#F7F6F2',
  sprites:[
    {name:'Dino', shape:'dino', w:1.6, h:2, x:-12, y:0},
    {name:'Cactus', shape:'cactus', w:1, h:2, x:20, y:0},
    {name:'Ground', shape:'ground', w:80, h:0.4, x:0, y:-1.2}
  ],
  vars:{score:0},
  code:{
    Dino:[
      L(0,'flag'),
      L(1,'goto',{x:-12, y:0}),
      L(1,'forever'),
      L(2,'if',{c:TOUCH('Ground')}),
      L(3,'if',{c:KEY('space')}),
      L(4,'repeat',{n:20}),
      L(5,'change',{ax:'y', n:0.3}),
      L(2,'else'),
      L(3,'change',{ax:'y', n:-0.2})
    ],
    Cactus:[
      L(0,'flag'),
      L(1,'goto',{x:20, y:0}),
      L(1,'if',{c:TOUCH('Dino')}),
      L(2,'stop'),
      L(1,'forever'),
      L(2,'change',{ax:'x', n:0.3}),
      L(2,'if',{c:C('gt', P('x'), -20)}),
      L(3,'set',{ax:'x', n:20}),
      L(3,'changevar',{v:'score', n:1})
    ],
    Ground:[]
  },
  bugs:[
    {id:'d1', kind:['motion'],
      report:['The cactus should slide LEFT toward the Dino.','El cactus debe deslizarse a la IZQUIERDA hacia el Dino.'],
      hints:[['Look at the Cactus.','Mira el Cactus.'],['Module 2: Motion (+ and −).','Módulo 2: Movimiento (+ y −).'],['Look at change x by 0.3.','Mira change x by 0.3.']],
      fixed: c => find(c,'Cactus',(n,a)=>ch('x',-1)(n) && inForever(a)).length>0 },
    {id:'d2', kind:['operators'],
      report:['The cactus should come back on the right after it leaves on the left. The score should only go up then.','El cactus debe volver por la derecha después de salir por la izquierda. Solo entonces debe subir el puntaje.'],
      hints:[['Look at the Cactus.','Mira el Cactus.'],['Module 3: Operators (< > =).','Módulo 3: Operadores (< > =).'],['Look at the if with x position.','Mira el if con x position.']],
      fixed: c => ifWith(c,'Cactus',cc=>cc.op==='lt' && cc.a && cc.a.r==='pos' && cc.a.ax==='x' && typeof cc.b==='number' && cc.b<=-15).length>0 },
    {id:'d3', kind:['indent','sensing'],
      report:['When the Dino hits the cactus, the game should end. It keeps going.','Cuando el Dino choca con el cactus, el juego debe terminar. Sigue y sigue.'],
      hints:[['Look at the Cactus.','Mira el Cactus.'],['Module 1 and 4: inside forever? touching?','Módulos 1 y 4: ¿dentro de forever? ¿touching?'],['Look at if touching Dino?. Is it inside forever?','Mira if touching Dino?. ¿Está dentro de forever?']],
      fixed: c => find(c,'Cactus',(n,a)=>n.op==='if' && n.a.c && n.a.c.op==='touch' && n.a.c.o==='Dino' && inForever(a) && bodyHas(n,x=>x.op==='stop')).length>0 }
  ]
});

/* 2 ---------------------------------------------------------- Dot Chase */
GAMES.push({
  id:'chase', num:2, title:'Dot Chase', tier:'must',
  blurb:['Grab the yellow dots. Stay away from the red chaser.','Atrapa los puntos amarillos. Aléjate del perseguidor rojo.'],
  controls:['Arrow keys = move','Flechas = moverse'],
  view:view40, bg:'#F2F4FA',
  drawBg(c, t){ c.strokeStyle='rgba(27,24,48,.07)'; c.lineWidth=1; for(let x=-20;x<=20;x+=2){ c.beginPath(); c.moveTo(t.X(x),0); c.lineTo(t.X(x),t.H); c.stroke(); } for(let y=-15;y<=15;y+=2){ c.beginPath(); c.moveTo(0,t.Y(y)); c.lineTo(t.W,t.Y(y)); c.stroke(); } },
  sprites:[
    {name:'Hero', shape:'hero', w:2, h:2, x:0, y:0},
    {name:'Chaser', shape:'chaser', w:2, h:2, x:15, y:10},
    {name:'Dot', shape:'dot', w:1.2, h:1.2, x:-10, y:5}
  ],
  vars:{score:0},
  code:{
    Hero:[
      L(0,'flag'),
      L(1,'goto',{x:0, y:0}),
      L(1,'forever'),
      L(2,'if',{c:KEY('right arrow')}), L(3,'change',{ax:'x', n:0.3}),
      L(2,'if',{c:KEY('left arrow')}), L(3,'change',{ax:'x', n:0.3}),
      L(2,'if',{c:KEY('up arrow')}), L(3,'change',{ax:'y', n:0.3}),
      L(2,'if',{c:KEY('down arrow')}), L(3,'change',{ax:'y', n:-0.3})
    ],
    Chaser:[
      L(0,'flag'),
      L(1,'goto',{x:15, y:10}),
      L(1,'wait',{n:1}),
      L(1,'forever'),
      L(2,'if',{c:C('gt', P('x'), PO('x','Hero'))}), L(3,'change',{ax:'x', n:0.12}),
      L(2,'else'), L(3,'change',{ax:'x', n:-0.12}),
      L(2,'if',{c:C('lt', P('y'), PO('y','Hero'))}), L(3,'change',{ax:'y', n:0.12}),
      L(2,'else'), L(3,'change',{ax:'y', n:-0.12}),
      L(2,'if',{c:TOUCH('Hero')}), L(3,'stop')
    ],
    Dot:[
      L(0,'flag'),
      L(1,'goto',{x:-10, y:5}),
      L(1,'forever'),
      L(2,'if',{c:TOUCH('Chaser')}),
      L(3,'changevar',{v:'score', n:1}),
      L(3,'goto',{x:RND(-18,18), y:RND(-13,13)})
    ]
  },
  bugs:[
    {id:'c1', kind:['motion'],
      report:['Pressing ← makes the hero go the wrong way.','Al presionar ← el héroe va hacia el lado equivocado.'],
      hints:[['Look at the Hero.','Mira al Hero.'],['Module 2: Motion (+ and −).','Módulo 2: Movimiento (+ y −).'],['Look inside if key left arrow pressed?.','Mira dentro de if key left arrow pressed?.']],
      fixed: c => ifWith(c,'Hero',cc=>cc.op==='key' && cc.k==='left arrow').some(r=>bodyHas(r.n, ch('x',-1))) },
    {id:'c2', kind:['sensing'],
      report:['When the hero touches the dot, there are no points. (Watch what happens when the chaser touches it!)','Cuando el héroe toca el punto, no hay puntos. (¡Mira qué pasa cuando el perseguidor lo toca!)'],
      hints:[['Look at the Dot.','Mira el Dot.'],['Module 4: Sensing & collision.','Módulo 4: Sensores y choques.'],['Who should the dot be touching?','¿A quién debe tocar el punto?']],
      fixed: c => ifWith(c,'Dot',cc=>cc.op==='touch' && cc.o==='Hero').some(r=>bodyHas(r.n, x=>x.op==='changevar')) },
    {id:'c3', kind:['operators'],
      report:['The chaser runs away from the hero, left and right. It should chase the hero.','El perseguidor se escapa del héroe, a la izquierda y a la derecha. Debe perseguirlo.'],
      hints:[['Look at the Chaser.','Mira el Chaser.'],['Module 3: Operators and direction.','Módulo 3: Operadores y dirección.'],['Compare the x if with the y if. What is different?','Compara el if de x con el if de y. ¿Qué es diferente?']],
      fixed: c => ifWith(c,'Chaser',cc=>cc.a && cc.a.r==='pos' && cc.a.ax==='x' && cc.b && cc.b.r==='posOf').some(r=>towards(r.n.a.c, r.n, 'x')) }
  ]
});

/* 3 ---------------------------------------------------------- Space Defenders */
GAMES.push({
  id:'space', num:3, title:'Space Defenders', tier:'must',
  blurb:['Shoot the alien before it reaches you.','Dispárale al alien antes de que llegue hasta ti.'],
  controls:['← → = move · SPACE = shoot','← → = moverse · ESPACIO = disparar'],
  view:view40, bg:'#141225', hudColor:'#EDEBFF',
  drawBg(c, t){ c.fillStyle='rgba(255,255,255,.55)'; const st=[[-17,9],[-9,13],[-2,6],[6,11],[14,3],[17,12],[-13,-2],[3,-6],[10,-9],[-6,-10],[18,-4],[-18,4]]; st.forEach(s=>{ c.fillRect(t.X(s[0]), t.Y(s[1]), 2, 2); }); },
  sprites:[
    {name:'Alien', shape:'alien', w:2.4, h:1.8, x:-14, y:12},
    {name:'Ship', shape:'ship', w:2.4, h:1.6, x:0, y:-13},
    {name:'Laser', shape:'laser', w:0.35, h:1.2, x:0, y:-40, visible:false}
  ],
  vars:{score:0, dir:0.3},
  code:{
    Ship:[
      L(0,'flag'),
      L(1,'goto',{x:0, y:-13}),
      L(1,'forever'),
      L(2,'if',{c:KEY('right arrow')}), L(3,'change',{ax:'x', n:0.4}),
      L(2,'if',{c:KEY('left arrow')}), L(3,'change',{ax:'x', n:-0.4})
    ],
    Laser:[
      L(0,'flag'),
      L(1,'hide'),
      L(1,'forever'),
      L(2,'change',{ax:'y', n:-0.8}),
      L(2,'if',{c:C('gt', P('y'), 15)}), L(3,'hide'),
      L(0,'key',{k:'space'}),
      L(1,'goto',{x:PO('x','Ship'), y:-12}),
      L(1,'show')
    ],
    Alien:[
      L(0,'flag'),
      L(1,'goto',{x:-14, y:12}),
      L(1,'setvar',{v:'dir', n:0.3}),
      L(1,'forever'),
      L(2,'change',{ax:'x', n:VR('dir')}),
      L(2,'if',{c:C('eq', P('x'), 18)}), L(3,'setvar',{v:'dir', n:-0.3}), L(3,'change',{ax:'y', n:-1}),
      L(2,'if',{c:C('lt', P('x'), -18)}), L(3,'setvar',{v:'dir', n:0.3}), L(3,'change',{ax:'y', n:-1}),
      L(2,'if',{c:TOUCH('Ship')}), L(3,'changevar',{v:'score', n:1}), L(3,'goto',{x:-14, y:12}),
      L(2,'if',{c:C('lt', P('y'), -11)}), L(3,'stop')
    ]
  },
  bugs:[
    {id:'s1', kind:['motion'],
      report:['The laser shoots DOWN. It should shoot UP.','El láser dispara hacia ABAJO. Debe disparar hacia ARRIBA.'],
      hints:[['Look at the Laser.','Mira el Laser.'],['Module 2: Motion (+ and −).','Módulo 2: Movimiento (+ y −).'],['Look at change y by -0.8.','Mira change y by -0.8.']],
      fixed: c => find(c,'Laser',(n,a)=>ch('y',1)(n) && inForever(a)).length>0 },
    {id:'s2', kind:['operators'],
      report:['The alien flies off the right side and never comes back.','El alien se va por el lado derecho y nunca vuelve.'],
      hints:[['Look at the Alien.','Mira el Alien.'],['Module 3: why is = risky for edges?','Módulo 3: ¿por qué = es riesgoso para los bordes?'],['Look at if x position = 18.','Mira if x position = 18.']],
      fixed: c => ifWith(c,'Alien',cc=>cc.a && cc.a.r==='pos' && cc.a.ax==='x' && typeof cc.b==='number' && cc.b>0).some(r=>r.n.a.c.op==='gt') },
    {id:'s3', kind:['sensing'],
      report:['Lasers go right through the alien. No points.','Los láseres atraviesan al alien. No hay puntos.'],
      hints:[['Look at the Alien.','Mira el Alien.'],['Module 4: Sensing & collision.','Módulo 4: Sensores y choques.'],['What should hit the alien?','¿Qué debe chocar con el alien?']],
      fixed: c => ifWith(c,'Alien',cc=>cc.op==='touch' && cc.o==='Laser').some(r=>bodyHas(r.n, x=>x.op==='changevar')) }
  ]
});

/* 4 ---------------------------------------------------------- Paddle Ball */
GAMES.push({
  id:'paddle', num:4, title:'Paddle Ball', tier:'challenge',
  blurb:['Hit the ball back with your paddle on the left.','Devuelve la pelota con tu paleta a la izquierda.'],
  controls:['↑ ↓ = move paddle','↑ ↓ = mover la paleta'],
  view:view40, bg:'#F6F6F3',
  drawBg(c, t){ c.strokeStyle='rgba(27,24,48,.18)'; c.setLineDash([8,10]); c.lineWidth=2; c.beginPath(); c.moveTo(t.X(0),0); c.lineTo(t.X(0),t.H); c.stroke(); c.setLineDash([]); },
  sprites:[
    {name:'Paddle', shape:'paddle', w:0.8, h:5, x:-18, y:0},
    {name:'CPU', shape:'paddle', w:0.8, h:5, x:18, y:0, color:'#8A5CD1'},
    {name:'Ball', shape:'ball', w:1, h:1, x:0, y:0}
  ],
  vars:{score:0, dx:0.3, dy:0.2},
  code:{
    Paddle:[
      L(0,'flag'),
      L(1,'goto',{x:-18, y:0}),
      L(1,'forever'),
      L(2,'if',{c:KEY('up arrow')}), L(3,'change',{ax:'x', n:0.5}),
      L(2,'if',{c:KEY('down arrow')}), L(3,'change',{ax:'x', n:-0.5})
    ],
    CPU:[
      L(0,'flag'),
      L(1,'goto',{x:18, y:0}),
      L(1,'forever'),
      L(2,'if',{c:C('lt', P('y'), PO('y','Ball'))}), L(3,'change',{ax:'y', n:0.25}),
      L(2,'else'), L(3,'change',{ax:'y', n:-0.25})
    ],
    Ball:[
      L(0,'flag'),
      L(1,'goto',{x:0, y:0}),
      L(1,'setvar',{v:'dx', n:0.3}),
      L(1,'setvar',{v:'dy', n:0.2}),
      L(1,'forever'),
      L(2,'change',{ax:'x', n:VR('dx')}),
      L(2,'change',{ax:'y', n:VR('dy')}),
      L(2,'if',{c:C('lt', P('y'), 14)}), L(3,'setvar',{v:'dy', n:-0.2}),
      L(2,'if',{c:C('lt', P('y'), -14)}), L(3,'setvar',{v:'dy', n:0.2}),
      L(2,'if',{c:TOUCH('Paddle')}), L(3,'setvar',{v:'dx', n:0.3}),
      L(2,'changevar',{v:'score', n:1}),
      L(2,'if',{c:TOUCH('CPU')}), L(3,'setvar',{v:'dx', n:-0.3}),
      L(2,'if',{c:C('lt', P('x'), -20)}), L(3,'stop')
    ]
  },
  bugs:[
    {id:'p1', kind:['motion'],
      report:['The ↑ and ↓ keys move my paddle sideways.','Las teclas ↑ y ↓ mueven mi paleta de lado.'],
      hints:[['Look at the Paddle.','Mira la Paddle.'],['Module 2: x is across, y is up and down.','Módulo 2: x es de lado, y es arriba y abajo.'],['Fix BOTH change blocks.','Arregla LOS DOS bloques change.']],
      fixed: c => ifWith(c,'Paddle',cc=>cc.op==='key' && cc.k==='up arrow').some(r=>bodyHas(r.n, ch('y',1))) &&
                  ifWith(c,'Paddle',cc=>cc.op==='key' && cc.k==='down arrow').some(r=>bodyHas(r.n, ch('y',-1))) },
    {id:'p2', kind:['operators'],
      report:['The ball hugs the bottom wall and wiggles. It should bounce off the top wall.','La pelota se pega a la pared de abajo y tiembla. Debe rebotar en la pared de arriba.'],
      hints:[['Look at the Ball.','Mira la Ball.'],['Module 3: Operators and direction.','Módulo 3: Operadores y dirección.'],['Look at if y position < 14. Which way is the top?','Mira if y position < 14. ¿Hacia dónde está arriba?']],
      fixed: c => ifWith(c,'Ball',cc=>cc.a && cc.a.r==='pos' && cc.a.ax==='y' && typeof cc.b==='number' && cc.b>0).some(r=>r.n.a.c.op==='gt') &&
                  ifWith(c,'Ball',cc=>cc.a && cc.a.r==='pos' && cc.a.ax==='y' && typeof cc.b==='number' && cc.b>0).every(r=>r.n.a.c.op==='gt') },
    {id:'p3', kind:['indent'],
      report:['The score goes up all the time. It should go up only when my paddle hits the ball.','El puntaje sube todo el tiempo. Solo debe subir cuando mi paleta golpea la pelota.'],
      hints:[['Look at the Ball.','Mira la Ball.'],['Module 1: Indentation (inside vs outside).','Módulo 1: Sangría (adentro o afuera).'],['Where is change score by 1? Is it inside the right if?','¿Dónde está change score by 1? ¿Está dentro del if correcto?']],
      fixed: c => { const r = find(c,'Ball',n=>n.op==='changevar' && n.a.v==='score'); return r.length>0 && r.every(x=>x.anc.some(a=>a.n.op==='if' && a.n.a.c && a.n.a.c.op==='touch' && a.n.a.c.o==='Paddle')); } }
  ]
});

/* 5 ---------------------------------------------------------- Road Hopper */
const lanes = [-8, -3, 2, 7];
GAMES.push({
  id:'road', num:5, title:'Road Hopper', tier:'challenge',
  blurb:['Hop the frog across the road to the grass at the top.','Haz saltar a la rana por la calle hasta el pasto de arriba.'],
  controls:['Arrow keys = hop','Flechas = saltar'],
  view:view40, bg:'#CFE6C3',
  drawBg(c, t){
    c.fillStyle = '#55526A'; c.fillRect(0, t.Y(9.5), t.W, t.Y(-10.5)-t.Y(9.5));
    c.strokeStyle = 'rgba(255,255,255,.6)'; c.setLineDash([14,14]); c.lineWidth = 2;
    [-5.5, -0.5, 4.5].forEach(y=>{ c.beginPath(); c.moveTo(0,t.Y(y)); c.lineTo(t.W,t.Y(y)); c.stroke(); });
    c.setLineDash([]);
    c.fillStyle = '#9DD08A'; c.fillRect(0, 0, t.W, t.Y(12.5));
    c.fillStyle = 'rgba(27,24,48,.55)'; c.font = '700 14px "JetBrains Mono", monospace'; c.fillText('GOAL: y > 12', 10, 16);
  },
  sprites:[
    {name:'Frog', shape:'frog', w:1.6, h:1.6, x:0, y:-13},
    {name:'Car A', group:'Car', shape:'car', w:3.2, h:1.6, x:-20, y:lanes[0], color:'#E0663A'},
    {name:'Car B', group:'Car', shape:'car', w:3.2, h:1.6, x:20, y:lanes[1], color:'#3B82C4'},
    {name:'Car C', group:'Car', shape:'car', w:3.2, h:1.6, x:-5, y:lanes[2], color:'#E8A800'},
    {name:'Car D', group:'Car', shape:'car', w:3.2, h:1.6, x:10, y:lanes[3], color:'#C24A8F'}
  ],
  vars:{score:0}, hud:false,
  objects:['Car','Frog','Car A','Car B','Car C','Car D'],
  code:{
    Frog:[
      L(0,'flag'),
      L(1,'goto',{x:0, y:-13}),
      L(1,'say',{s:''}),
      L(1,'forever'),
      L(2,'if',{c:TOUCH('Car')}),
      L(2,'if',{c:C('lt', P('y'), 12)}), L(3,'say',{s:'You win!'}), L(3,'stop'),
      L(0,'key',{k:'up arrow'}), L(1,'change',{ax:'y', n:-2.5}),
      L(0,'key',{k:'down arrow'}), L(1,'change',{ax:'y', n:-2.5}),
      L(0,'key',{k:'left arrow'}), L(1,'change',{ax:'x', n:-2}),
      L(0,'key',{k:'right arrow'}), L(1,'change',{ax:'x', n:2})
    ],
    'Car A':[ L(0,'flag'), L(1,'goto',{x:-20, y:lanes[0]}), L(1,'forever'), L(2,'change',{ax:'x', n:0.25}), L(2,'if',{c:C('gt',P('x'),21)}), L(3,'set',{ax:'x', n:-21}) ],
    'Car B':[ L(0,'flag'), L(1,'goto',{x:20, y:lanes[1]}), L(1,'forever'), L(2,'change',{ax:'x', n:-0.35}), L(2,'if',{c:C('lt',P('x'),-21)}), L(3,'set',{ax:'x', n:21}) ],
    'Car C':[ L(0,'flag'), L(1,'goto',{x:-5, y:lanes[2]}), L(1,'forever'), L(2,'change',{ax:'x', n:0.3}), L(2,'if',{c:C('gt',P('x'),21)}), L(3,'set',{ax:'x', n:-21}) ],
    'Car D':[ L(0,'flag'), L(1,'goto',{x:10, y:lanes[3]}), L(1,'forever'), L(2,'change',{ax:'x', n:-0.25}), L(2,'if',{c:C('lt',P('x'),-21)}), L(3,'set',{ax:'x', n:21}) ]
  },
  bin:[ L(1,'goto',{x:0, y:-13}), L(1,'goto',{x:0, y:13}), L(1,'say',{s:'Oops!'}) ],
  bugs:[
    {id:'r1', kind:['operators'],
      report:['The game says "You win!" as soon as it starts.','El juego dice "You win!" apenas empieza.'],
      hints:[['Look at the Frog.','Mira la Frog.'],['Module 3: Operators and direction.','Módulo 3: Operadores y dirección.'],['The goal is at the TOP. Look at if y position < 12.','La meta está ARRIBA. Mira if y position < 12.']],
      fixed: c => ifWith(c,'Frog',cc=>cc.a && cc.a.r==='pos' && cc.a.ax==='y').some(r=>r.n.a.c.op==='gt' && r.n.a.c.b>=10) &&
                  !ifWith(c,'Frog',cc=>cc.a && cc.a.r==='pos' && cc.a.ax==='y').some(r=>r.n.a.c.op!=='gt') },
    {id:'r2', kind:['motion'],
      report:['The ↑ key moves the frog DOWN.','La tecla ↑ mueve la rana hacia ABAJO.'],
      hints:[['Look at the Frog.','Mira la Frog.'],['Module 2: Motion (+ and −).','Módulo 2: Movimiento (+ y −).'],['Look under when up arrow key pressed.','Mira debajo de when up arrow key pressed.']],
      fixed: c => { const lines = c.Frog||[]; const p = BH.parseSprite(lines); return p.scripts.some(s=>s.hat.op==='key' && s.hat.a.k==='up arrow' && s.body.some(ch('y',1))); } },
    {id:'r3', kind:['sensing'],
      report:['Cars drive right through the frog. Nothing happens.','Los carros pasan a través de la rana. No pasa nada.'],
      hints:[['Look at the Frog.','Mira la Frog.'],['Module 4: a collision needs a result.','Módulo 4: un choque necesita un resultado.'],['if touching Car? is empty. Drag a block from the parts bin into it.','if touching Car? está vacío. Arrastra un bloque de la caja de piezas adentro.']],
      fixed: c => ifWith(c,'Frog',cc=>cc.op==='touch' && cc.o==='Car').some(r=>bodyHas(r.n, x=>x.op==='goto' && typeof x.a.y==='number' && x.a.y<=-10)) }
  ]
});

BH.GAMES = GAMES;

/* ================================================================ sandboxes */
BH.SANDBOX = {
  indent:{
    title:['Score Counter','Contador de puntos'],
    view:{xmin:-20, xmax:20, ymin:-6, ymax:6}, bg:'#F7F6F2',
    sprites:[{name:'Box', shape:'box', w:2, h:2, x:20, y:0}], vars:{score:0},
    code:{ Box:[ L(0,'flag'), L(1,'setvar',{v:'score',n:0}), L(1,'goto',{x:20, y:0}), L(1,'forever'),
      L(2,'change',{ax:'x', n:-0.3}), L(2,'if',{c:C('lt',P('x'),-20)}), L(3,'set',{ax:'x', n:20}), L(3,'changevar',{v:'score', n:1}) ] },
    goals:[
      {text:['Press Run. The score only goes up when the box comes back. Now make the score go up EVERY frame: drag change score by 1 to the LEFT so it lines up with change x by -0.3 (inside forever, not inside the if). Then press Run.','Presiona Run. El puntaje solo sube cuando la caja vuelve. Ahora haz que suba en CADA cuadro: arrastra change score by 1 a la IZQUIERDA para que quede alineado con change x by -0.3 (dentro de forever, no dentro del if). Luego presiona Run.'],
       ok: c => BH.find(c,'Box',(n,a)=>n.op==='changevar' && a.length && a[a.length-1].n.op==='forever').length>0 }
    ]
  },
  motion:{
    title:['Arrow Test','Prueba de flechas'],
    view:{xmin:-20, xmax:20, ymin:-12, ymax:12}, bg:'#F2F4FA',
    drawBg(c,t){ c.strokeStyle='rgba(27,24,48,.25)'; c.lineWidth=1.5; c.beginPath(); c.moveTo(t.X(0),0); c.lineTo(t.X(0),t.H); c.moveTo(0,t.Y(0)); c.lineTo(t.W,t.Y(0)); c.stroke();
      c.fillStyle='rgba(27,24,48,.6)'; c.font='600 13px "JetBrains Mono", monospace'; c.fillText('+x →', t.W-52, t.Y(0)-10); c.fillText('← −x', 8, t.Y(0)-10); c.fillText('+y ↑', t.X(0)+8, 16); c.fillText('−y ↓', t.X(0)+8, t.H-10); },
    sprites:[{name:'Box', shape:'box', w:2, h:2, x:0, y:0}], vars:{}, hud:false,
    code:{ Box:[ L(0,'flag'), L(1,'goto',{x:0, y:0}), L(1,'forever'), L(2,'change',{ax:'x', n:0.2}) ] },
    goals:[
      {text:['Press Run: the box goes right (+x). Now make it go UP.','Presiona Run: la caja va a la derecha (+x). Ahora haz que vaya hacia ARRIBA.'], ok: c => BH.find(c,'Box',ch('y',1)).length>0 },
      {text:['Now make it go LEFT.','Ahora haz que vaya a la IZQUIERDA.'], ok: c => BH.find(c,'Box',ch('x',-1)).length>0 },
      {text:['Now make it go DOWN.','Ahora haz que vaya hacia ABAJO.'], ok: c => BH.find(c,'Box',ch('y',-1)).length>0 }
    ]
  },
  operators:{
    title:['Edge Check','Revisar el borde'],
    view:{xmin:-20, xmax:20, ymin:-6, ymax:6}, bg:'#F7F6F2',
    drawBg(c,t){ c.strokeStyle='#D9503F'; c.setLineDash([6,6]); c.lineWidth=2; [-20,20].forEach(x=>{ c.beginPath(); c.moveTo(t.X(x)+(x<0?2:-2),0); c.lineTo(t.X(x)+(x<0?2:-2),t.H); c.stroke(); }); c.setLineDash([]); },
    sprites:[{name:'Box', shape:'box', w:2, h:2, x:20, y:0}], vars:{}, hud:false,
    code:{ Box:[ L(0,'flag'), L(1,'goto',{x:20, y:0}), L(1,'forever'), L(2,'change',{ax:'x', n:-0.3}), L(2,'if',{c:C('gt',P('x'),-20)}), L(3,'set',{ax:'x', n:20}) ] },
    goals:[
      {text:['Press Run. The box is stuck on the right. It moves LEFT, so which check finds the LEFT edge? Fix the if so the box loops around.','Presiona Run. La caja está atascada a la derecha. Se mueve a la IZQUIERDA: ¿qué pregunta encuentra el borde IZQUIERDO? Arregla el if para que la caja dé la vuelta.'],
       ok: c => BH.find(c,'Box',n=>n.op==='if' && n.a.c.op==='lt' && typeof n.a.c.b==='number' && n.a.c.b<=-15 && n.a.c.b>=-25).length>0 },
      {text:['Bonus: change < to = and Run. Watch x in the Watch panel. Why does = never catch the edge?','Extra: cambia < por = y presiona Run. Mira x en el panel Watch. ¿Por qué = nunca atrapa el borde?'], ok: c => BH.find(c,'Box',n=>n.op==='if' && n.a.c.op==='eq').length>0 }
    ]
  },
  sensing:{
    title:['Crash Test','Prueba de choque'],
    view:{xmin:-20, xmax:20, ymin:-8, ymax:8}, bg:'#F2F4FA',
    sprites:[{name:'Player', shape:'hero', w:2, h:2, x:-10, y:0}, {name:'Cactus', shape:'cactus', w:1.4, h:2.8, x:6, y:0}, {name:'Wall', shape:'wall', w:1, h:14, x:-18.5, y:0}],
    vars:{}, hud:false,
    code:{
      Player:[ L(0,'flag'), L(1,'goto',{x:-10, y:0}), L(1,'forever'),
        L(2,'if',{c:KEY('right arrow')}), L(3,'change',{ax:'x', n:0.3}),
        L(2,'if',{c:KEY('left arrow')}), L(3,'change',{ax:'x', n:-0.3}),
        L(2,'if',{c:KEY('up arrow')}), L(3,'change',{ax:'y', n:0.3}),
        L(2,'if',{c:KEY('down arrow')}), L(3,'change',{ax:'y', n:-0.3}) ],
      Cactus:[ L(0,'flag'), L(1,'goto',{x:6, y:0}), L(1,'if',{c:TOUCH('Wall')}), L(2,'say',{s:'Ouch!'}), L(1,'else'), L(2,'say',{s:'...'}), L(1,'forever') ],
      Wall:[]
    },
    goals:[
      {text:['The cactus should say "Ouch!" while the Player touches it. Fix the object in the touching block.','El cactus debe decir "Ouch!" mientras el Player lo toca. Arregla el objeto en el bloque touching.'],
       ok: c => BH.find(c,'Cactus',n=>n.op==='if' && n.a.c.op==='touch' && n.a.c.o==='Player').length>0 },
      {text:['Run it. Still nothing? The check runs only once. Drag the if block down below forever, and drop it pushed to the right so it goes INSIDE forever.','¿Sigue sin funcionar? La pregunta se revisa solo una vez. Arrastra el bloque if debajo de forever y suéltalo más a la derecha para que quede DENTRO de forever.'],
       ok: c => BH.find(c,'Cactus',(n,a)=>n.op==='if' && n.a.c.op==='touch' && n.a.c.o==='Player' && inForever(a)).length>0 }
    ]
  }
};

/* ================================================================ spot the bug
   Read-only snippets. `ans` is the line index of the bug. */
BH.SPOT = {
  indent:[
    {sym:['Symptom: the Dino never crashes.','Síntoma: el Dino nunca choca.'], sprite:'Cactus',
     code:[L(0,'flag'), L(1,'goto',{x:20,y:0}), L(1,'if',{c:TOUCH('Dino')}), L(2,'stop'), L(1,'forever'), L(2,'change',{ax:'x',n:-0.3})], ans:2,
     why:['The crash check is outside forever, so it is checked only once, at the start.','La pregunta del choque está fuera de forever, así que se revisa solo una vez, al empezar.']},
    
    {sym:['Symptom: the score almost never goes up.','Síntoma: el puntaje casi nunca sube.'], sprite:'Ground',
     code:[L(0,'flag'), L(1,'forever'), L(2,'change',{ax:'x',n:-0.3}), L(2,'if',{c:C('lt',P('x'),-32)}), L(3,'change',{ax:'x',n:32}), L(3,'changevar',{v:'score',n:0.2})], ans:5,
     why:['change score is inside the if, so it only runs when the ground jumps back.','change score está dentro del if, así que solo corre cuando el suelo vuelve.']}
  ],
  motion:[
    {sym:['Symptom: the cactus slides to the RIGHT.','Síntoma: el cactus se desliza a la DERECHA.'], sprite:'Cactus',
     code:[L(0,'flag'), L(1,'goto',{x:20,y:0}), L(1,'forever'), L(2,'change',{ax:'x',n:0.3})], ans:3,
     why:['+0.3 moves right. Left is negative: -0.3.','+0.3 mueve a la derecha. La izquierda es negativa: -0.3.']},
    
    {sym:['Symptom: the Dino jumps sideways.','Síntoma: el Dino salta de lado.'], sprite:'Dino',
     code:[L(0,'key',{k:'space'}), L(1,'repeat',{n:20}), L(2,'change',{ax:'x',n:0.3})], ans:2,
     why:['Up and down is y, not x.','Arriba y abajo es y, no x.']}
  ],
  operators:[
    {sym:['Symptom: the cactus leaves and never comes back.','Síntoma: el cactus se va y nunca vuelve.'], sprite:'Cactus',
     code:[L(0,'flag'), L(1,'forever'), L(2,'change',{ax:'x',n:-0.3}), L(2,'if',{c:C('gt',P('x'),20)}), L(3,'set',{ax:'x',n:20})], ans:3,
     why:['It moves LEFT, so check the LEFT edge: x position < -20.','Se mueve a la IZQUIERDA: revisa el borde IZQUIERDO: x position < -20.']},
    {sym:['Symptom: the ground runs out.','Síntoma: el suelo se acaba.'], sprite:'Ground',
     code:[L(0,'flag'), L(1,'forever'), L(2,'change',{ax:'x',n:-0.3}), L(2,'if',{c:C('eq',P('x'),-32)}), L(3,'change',{ax:'x',n:32})], ans:3,
     why:['Moving 0.3 at a time, x skips past -32 and is never exactly -32. Use <.','Moviéndose de 0.3 en 0.3, x se salta -32 y nunca es exactamente -32. Usa <.']}
  ],
  sensing:[
    {sym:['Symptom: game over the moment the game starts.','Síntoma: el juego termina apenas empieza.'], sprite:'Cactus',
     code:[L(0,'flag'), L(1,'forever'), L(2,'change',{ax:'x',n:-0.3}), L(2,'if',{c:TOUCH('Ground')}), L(3,'stop')], ans:3,
     why:['The cactus always touches the Ground. It should check touching Dino?.','El cactus siempre toca el Ground. Debe revisar touching Dino?.']},
    {sym:['Symptom: the Dino hits the cactus and nothing happens.','Síntoma: el Dino choca con el cactus y no pasa nada.'], sprite:'Cactus',
     code:[L(0,'flag'), L(1,'forever'), L(2,'change',{ax:'x',n:-0.3}), L(2,'if',{c:TOUCH('Dino')}), L(2,'if',{c:C('lt',P('x'),-20)}), L(3,'set',{ax:'x',n:20})], ans:3,
     why:['The touching if is empty. A collision needs a result, like stop all.','El if de touching está vacío. Un choque necesita un resultado, como stop all.']}
  ]
};
})();
