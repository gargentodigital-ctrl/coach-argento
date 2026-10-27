/* Animazioni esercizi: figura stilizzata vista di lato (o di fronte), pose chiave interpolate lentamente.
   Coordinate mondo: x a destra, y in alto, pavimento y=0. Angoli in gradi: 0 = destra, 90 = su. */
(function(){
const T=50,NECK=6,HR=10,U=28,F=26,TH=42,SH=40,FT=12,SW=17,HW=8;
const rad=d=>d*Math.PI/180;
const P=(o,a,l)=>[o[0]+l*Math.cos(rad(a)),o[1]+l*Math.sin(rad(a))];
const M=(b,o)=>Object.assign({},b,o);

function ik(S,tg,a,b,pref){
  const dx=tg[0]-S[0],dy=tg[1]-S[1];let d=Math.hypot(dx,dy);const base=Math.atan2(dy,dx);
  if(d>=a+b-0.01){const e=[S[0]+a*Math.cos(base),S[1]+a*Math.sin(base)];return [e,[S[0]+(a+b)*Math.cos(base),S[1]+(a+b)*Math.sin(base)]]}
  d=Math.max(d,Math.abs(a-b)+0.01);
  const al=Math.acos(Math.min(1,Math.max(-1,(a*a+d*d-b*b)/(2*a*d))));
  const e1=[S[0]+a*Math.cos(base+al),S[1]+a*Math.sin(base+al)],e2=[S[0]+a*Math.cos(base-al),S[1]+a*Math.sin(base-al)];
  const mx=(S[0]+tg[0])/2,my=(S[1]+tg[1])/2;
  const s1=(e1[0]-mx)*pref[0]+(e1[1]-my)*pref[1],s2=(e2[0]-mx)*pref[0]+(e2[1]-my)*pref[1];
  return [s1>=s2?e1:e2,tg];
}
function limb(S,spec,a,b,pref){
  if(Array.isArray(spec)){const e=P(S,spec[0],a);return [e,P(e,spec[1],b)]}
  if(spec.a){const s=spec.s==null?1:spec.s;const e=P(S,spec.a[0],a*s);return [e,P(e,spec.a[1],b*s)]}
  return ik(S,spec.p,a,b,spec.b||pref);
}
function joints(p,view){
  const J={};const H=p.h;J.hip=H;
  const t=p.t==null?90:p.t;const S=P(H,t,T);J.shoulder=S;
  const hd=t+(p.hd||0);const N=P(S,hd,NECK);J.head=P(N,hd,HR);J.neck=N;
  if(view==="front"){
    const sR=[S[0]+SW,S[1]],sL=[S[0]-SW,S[1]],hR=[H[0]+HW,H[1]],hL=[H[0]-HW,H[1]];
    const mir=s=>Array.isArray(s)?[180-s[0],180-s[1]]:{a:[180-s.a[0],180-s.a[1]],s:s.s};
    const a1=limb(sR,p.A1,U,F),a2=limb(sL,mir(p.A2||p.A1),U,F);
    const l1=limb(hR,p.L1,TH,SH),l2=limb(hL,mir(p.L2||p.L1),TH,SH);
    Object.assign(J,{sR,sL,hR,hL,elbow1:a1[0],hand1:a1[1],elbow2:a2[0],hand2:a2[1],knee1:l1[0],ankle1:l1[1],knee2:l2[0],ankle2:l2[1]});
    J.toe1=P(J.ankle1,-80,6);J.toe2=P(J.ankle2,-100,6);
  }else{
    const a2=limb([S[0]-2,S[1]+1],p.A2||p.A1,U,F,[-1,-0.3]),a1=limb(S,p.A1,U,F,[-1,-0.3]);
    const l2=limb([H[0]-2,H[1]],p.L2||p.L1,TH,SH,[1,0]),l1=limb(H,p.L1,TH,SH,[1,0]);
    Object.assign(J,{elbow1:a1[0],hand1:a1[1],elbow2:a2[0],hand2:a2[1],knee1:l1[0],ankle1:l1[1],knee2:l2[0],ankle2:l2[1]});
    J.toe1=P(J.ankle1,p.F1||0,FT);J.toe2=P(J.ankle2,p.F2==null?(p.F1||0):p.F2,FT);
  }
  J.ar=p.ar||0;J.t=t;J.hdd=p.hd||0;
  return J;
}
function lerp(a,b,k){
  if(typeof a==="number")return a+(b-a)*k;
  if(Array.isArray(a))return a.map((v,i)=>lerp(v,b[i],k));
  if(a&&typeof a==="object"){const o={};for(const key in a)o[key]=(b&&key in b)?lerp(a[key],b[key],k):a[key];return o}
  return a;
}
const ease=k=>k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
function poseAt(ex,time){
  const fr=ex.frames,n=fr.length;if(n===1)return fr[0];
  const seq=ex.loop?[...fr.map((_,i)=>i),0]:[...fr.map((_,i)=>i),...fr.map((_,i)=>i).reverse().slice(1)];
  const holds=seq.slice(0,-1).map(i=>fr[i].hold||0.25);
  const totalHold=holds.reduce((a,b)=>a+b,0);
  const mv=Math.max(0.3,(ex.dur||4)-totalHold)/(seq.length-1);
  const cyc=totalHold+mv*(seq.length-1);
  let tt=time%cyc;
  for(let i=0;i<seq.length-1;i++){
    if(tt<holds[i])return fr[seq[i]];tt-=holds[i];
    if(tt<mv)return lerp(fr[seq[i]],fr[seq[i+1]],ease(tt/mv));tt-=mv;
  }
  return fr[seq[seq.length-1]];
}

/* ---------- pose di base ---------- */
const ST={h:[0,86],t:90,hd:0,L1:{p:[5,4]},L2:{p:[-3,4]},A1:[-90,-90],A2:[-91,-91],F1:0,F2:0};
const FR={h:[0,88],t:90,L1:[-87,-90],A1:{a:[-84,-86],s:1}};
const BENCH={h:[22,47],t:180,L1:{p:[64,6],b:[0,1]},L2:{p:[60,6],b:[0,1]},F1:0,F2:0};
const QUAD={h:[-25,54],t:0,hd:-10,ar:0,A1:{p:[25,4],b:[1,0]},A2:{p:[22,4],b:[1,0]},L1:{p:[-66,8],b:[0,-1]},L2:{p:[-63,8],b:[0,-1]},F1:180,F2:180};
const STEP=[{k:"box",x1:-26,y1:0,x2:26,y2:10}];
const POLE={k:"rail",x:52,y2:170};
const SEATROW={h:[-8,42],L1:{p:[56,22],b:[0,1]},L2:{p:[53,22],b:[0,1]},F1:80,F2:80};
const ROWPROPS=[{k:"bench",x1:-38,x2:20,y:34},{k:"box",x1:60,y1:4,x2:66,y2:44},{k:"box",x1:98,y1:0,x2:112,y2:160},{k:"cable",from:[98,56],to:"hand1"},{k:"plate",at:"hand1",r:3.5}];
const LAT={h:[-4,42],t:100,L1:{p:[42,4],b:[0,1]},L2:{p:[39,4],b:[0,1]},F1:0};
const LATPROPS=[{k:"bench",x1:-32,x2:20,y:34},{k:"box",x1:26,y1:50,x2:52,y2:58},{k:"cable",from:[-2,172],to:"hand1"},{k:"plate",at:"hand1",r:4}];
const SMITH={h:[0,96],t:90,A1:[-125,70],A2:[-127,68],L1:{p:[2,14]},L2:{p:[-1,14]},F1:0,F2:0};
const SMITHP=[...STEP,{k:"rail",x:-14,y2:150},{k:"plate",at:"shoulder",off:[-6,3],r:5}];

const EX={
 mob_dowel:{dur:6,frames:[M(ST,{A1:[-75,-75],A2:[-76,-76]}),M(ST,{A1:[90,90],A2:[89,89]}),M(ST,{A1:[235,235],A2:[234,234]})],props:[{k:"plate",at:"hand1",r:4.5,c:"fg"}]},
 mob_floor:{dur:5,frames:[M(QUAD,{ar:14,hd:-55}),M(QUAD,{ar:-10,hd:35})],props:[]},
 panca:{dur:4.5,frames:[M(BENCH,{A1:{p:[-28,99],b:[0.4,-1]},A2:{p:[-30,98],b:[0.4,-1]}}),M(BENCH,{A1:{p:[-21,64],b:[0.4,-1]},A2:{p:[-23,63],b:[0.4,-1]}})],props:[{k:"bench",x1:-78,x2:34,y:40},{k:"plate",at:"hand1",r:17}]},
 dbpress:{dur:4.5,frames:[M(BENCH,{A1:{p:[-28,99],b:[0.4,-1]},A2:{p:[-30,98],b:[0.4,-1]}}),M(BENCH,{A1:{p:[-24,58],b:[0.4,-1]},A2:{p:[-26,57],b:[0.4,-1]}})],props:[{k:"bench",x1:-78,x2:34,y:40},{k:"db",at:"hand1",r:7}]},
 french:{dur:4.5,frames:[M(BENCH,{A1:[100,100],A2:[99,99]}),M(BENCH,{A1:[100,192],A2:[99,191]})],props:[{k:"bench",x1:-78,x2:34,y:40},{k:"plate",at:"hand1",r:9}]},
 row:{dur:4,frames:[M(ST,{h:[-14,80],t:38,hd:-25,L1:{p:[6,4]},L2:{p:[3,4]},A1:{p:[25,58]},A2:{p:[23,58]}}),M(ST,{h:[-14,80],t:38,hd:-25,L1:{p:[6,4]},L2:{p:[3,4]},A1:{p:[4,86],b:[-1,0.6]},A2:{p:[2,86],b:[-1,0.6]}})],props:[{k:"plate",at:"hand1",r:17}]},
 croci:{view:"front",dur:4.5,frames:[M(FR,{A1:{a:[0,12],s:1}}),M(FR,{A1:{a:[160,148],s:0.4}})],props:[{k:"box",x1:-18,y1:60,x2:18,y2:150,c:"line"},{k:"dbf",at:"hand1"},{k:"dbf",at:"hand2"}],cap:"Vista dall'alto, sdraiato sulla panca"},
 pushup:{dur:4,frames:[{h:[0,42],t:26.6,hd:-10,A1:{p:[48,13],b:[-1,0.4]},A2:{p:[46,13],b:[-1,0.4]},L1:{p:[-73,10],b:[0,-1]},L2:{p:[-75,10],b:[0,-1]},F1:-60,F2:-60},{h:[6,26],t:9,hd:-5,A1:{p:[48,13],b:[-1,0.4]},A2:{p:[46,13],b:[-1,0.4]},L1:{p:[-73,10],b:[0,-1]},L2:{p:[-75,10],b:[0,-1]},F1:-60,F2:-60}],props:[{k:"box",x1:38,y1:0,x2:58,y2:9}]},
 pulley1:{dur:4.5,frames:[M(SEATROW,{t:72,A1:{p:[60,56]},A2:[-50,-15]}),M(SEATROW,{t:94,A1:{p:[6,64],b:[-1,0.2]},A2:[-55,-15]})],props:ROWPROPS},
 lowrow:{dur:4.5,frames:[M(SEATROW,{t:74,A1:{p:[60,58]},A2:{p:[58,57]}}),M(SEATROW,{t:94,A1:{p:[6,66],b:[-1,0.2]},A2:{p:[4,65],b:[-1,0.2]}})],props:ROWPROPS},
 ezcurl:{dur:4,frames:[M(ST,{A1:[-92,-90],A2:[-93,-91]}),M(ST,{A1:[-92,102],A2:[-93,101]})],props:[{k:"plate",at:"hand1",r:11}]},
 dbcurl:{dur:4,frames:[M(ST,{A1:[-92,-90],A2:[-93,-91]}),M(ST,{A1:[-92,102],A2:[-93,101]})],props:[{k:"db",at:"hand1",r:7}]},
 latraise:{view:"front",dur:4.5,frames:[M(FR,{A1:{a:[-108,-104],s:1},A2:{a:[-60,-40],s:1}}),M(FR,{A1:{a:[4,-2],s:1},A2:{a:[-60,-40],s:1}})],props:[{k:"box",x1:-80,y1:0,x2:-70,y2:160},{k:"cable",from:[-70,10],to:"hand1"}]},
 iso1:{dur:5,frames:[M(ST,{h:[0,96],L1:{p:[2,14]},L2:[-100,-150],F1:0,A1:{p:[48,130],b:[0,-1]},A2:[-90,-90],hold:.4}),M(ST,{h:[3,106],L1:{p:[7,24]},L2:[-100,-150],F1:-55,A1:{p:[48,130],b:[0,-1]},A2:[-90,-90],hold:2.2})],props:[...STEP,POLE,{k:"db",at:"hand2",r:7}]},
 calf1:{dur:4,frames:[M(ST,{h:[-1,91],L1:{p:[1,9]},L2:[-100,-150],F1:25,A1:{p:[48,128],b:[0,-1]},A2:[-90,-90],hold:.3}),M(ST,{h:[3,106],L1:{p:[7,24]},L2:[-100,-150],F1:-55,A1:{p:[48,128],b:[0,-1]},A2:[-90,-90],hold:.6})],props:[...STEP,POLE,{k:"db",at:"hand2",r:7}]},
 pogo:{dur:1.6,frames:[M(ST,{h:[0,84],L1:{p:[3,6]},F1:-20,L2:[-100,-150],A1:[-70,-55],A2:[-110,-80],hold:.1}),M(ST,{h:[0,98],L1:{p:[3,18]},F1:-55,L2:[-100,-150],A1:[-60,-45],A2:[-120,-90],hold:.1})],props:[]},
 bulgarian:{dur:4.5,frames:[M(ST,{h:[0,84],t:84,L1:{p:[30,11]},F1:-25,L2:{p:[-62,47],b:[0,-1]},F2:180,A1:[-90,-90],A2:[-90,-90]}),M(ST,{h:[-6,50],t:78,L1:{p:[30,11]},F1:-25,L2:{p:[-62,47],b:[0,-1]},F2:180,A1:[-90,-90],A2:[-90,-90]})],props:[{k:"bench",x1:-84,x2:-44,y:40},{k:"box",x1:30,y1:0,x2:46,y2:6},{k:"db",at:"hand1",r:7}]},
 rdlDb:{dur:4.5,frames:[M(ST,{L1:{p:[6,4]},L2:{p:[3,4]},A1:[-90,-90],A2:[-90,-90]}),M(ST,{h:[-24,80],t:22,hd:-15,L1:{p:[6,4]},L2:{p:[3,4]},A1:[-90,-90],A2:[-90,-90]})],props:[{k:"db",at:"hand1",r:7}]},
 rdlBb:{dur:4.5,frames:[M(ST,{L1:{p:[6,4]},L2:{p:[3,4]},A1:[-90,-90],A2:[-90,-90]}),M(ST,{h:[-24,80],t:22,hd:-15,L1:{p:[6,4]},L2:{p:[3,4]},A1:[-90,-90],A2:[-90,-90]})],props:[{k:"plate",at:"hand1",r:17}]},
 wallsit:{dur:4.5,frames:[M(ST,{h:[-32,72],L1:{p:[14,4]},L2:{p:[11,4]},A1:[-60,-10],A2:[-62,-12],hold:.3}),M(ST,{h:[-32,46],L1:{p:[14,4]},L2:{p:[11,4]},A1:[-50,-5],A2:[-52,-7],hold:2.2})],props:[{k:"wall",x:-46}]},
 squatjump:{dur:2.4,frames:[M(ST,{h:[-14,54],t:50,hd:20,L1:{p:[6,4]},L2:{p:[3,4]},A1:[-140,-130],A2:[-142,-132],hold:.35}),M(ST,{h:[0,110],t:88,L1:{p:[4,26]},L2:{p:[1,26]},F1:-60,F2:-60,A1:[85,85],A2:[83,83],hold:.1})],props:[]},
 wallrun:{dur:1.8,frames:[{h:[0,72],t:48,hd:-10,A1:{p:[78,128],b:[0,-1]},A2:{p:[78,126],b:[0,-1]},L1:{p:[22,46]},F1:-30,L2:{p:[-34,10]},F2:-45,hold:.15},{h:[0,72],t:48,hd:-10,A1:{p:[78,128],b:[0,-1]},A2:{p:[78,126],b:[0,-1]},L1:{p:[-34,10]},F1:-45,L2:{p:[22,46]},F2:-30,hold:.15}],props:[{k:"wall",x:80}]},
 ohp:{dur:4,frames:[M(ST,{A1:{p:[10,139],b:[1,-0.6]},A2:{p:[8,139],b:[1,-0.6]}}),M(ST,{A1:{p:[2,191],b:[1,-0.6]},A2:{p:[0,190],b:[1,-0.6]}})],props:[{k:"plate",at:"hand1",r:17}]},
 lat:{dur:4.5,frames:[M(LAT,{A1:{p:[-4,144]},A2:{p:[-6,143]}}),M(LAT,{A1:{p:[2,98],b:[-0.6,-1]},A2:{p:[0,97],b:[-0.6,-1]}})],props:LATPROPS},
 vt:{dur:5,frames:[M(LAT,{t:94,A1:{p:[-2,144]},A2:{p:[-4,143]}}),M(LAT,{t:94,A1:{p:[4,98],b:[-0.6,-1]},A2:{p:[2,97],b:[-0.6,-1]},hold:1.6})],props:LATPROPS},
 cyclist:{dur:4.5,frames:[M(ST,{h:[-2,96],t:88,L1:{p:[0,15]},L2:{p:[-3,15]},F1:-25,F2:-25,A1:[-55,100],A2:[-58,98]}),M(ST,{h:[-8,46],t:84,L1:{p:[0,15]},L2:{p:[-3,15]},F1:-25,F2:-25,A1:[-55,100],A2:[-58,98]})],props:[{k:"poly",pts:[[-14,0],[28,0],[-14,12]]},{k:"plate",at:"hand1",r:8}]},
 legext:{dur:4,frames:[{h:[-12,50],t:100,L1:[-3,-95],L2:[-4,-96],F1:0,F2:0,A1:[-80,-40],A2:[-82,-42]},{h:[-12,50],t:100,L1:[-3,-8],L2:[-4,-9],F1:80,F2:80,A1:[-80,-40],A2:[-82,-42]}],props:[{k:"bench",x1:-30,x2:30,y:42},{k:"box",x1:-36,y1:42,x2:-27,y2:122},{k:"pad",at:"ankle1",r:6}]},
 lpcalf:{dur:4,frames:[{h:[0,42],t:140,L1:{p:[76,72],b:[0,1]},L2:{p:[74,71],b:[0,1]},F1:112,F2:112,A1:[-60,-90],A2:[-62,-92],hold:.3},{h:[0,42],t:140,L1:{p:[76,72],b:[0,1]},L2:{p:[74,71],b:[0,1]},F1:55,F2:55,A1:[-60,-90],A2:[-62,-92],hold:1.2}],props:[{k:"bench",x1:-40,x2:12,y:34},{k:"seg",a:[-42,40],b:[-80,98],w:8},{k:"lp",at:"toe1",ang:112,len:58}]},
 tread:{dur:1.4,loop:false,frames:[{h:[0,92],t:86,L1:{p:[24,12]},F1:10,L2:{p:[-26,18]},F2:-40,A1:[-120,-70],A2:[-60,-5],hold:.05},{h:[0,92],t:86,L1:{p:[-26,18]},F1:-40,L2:{p:[24,12]},F2:10,A1:[-60,-5],A2:[-120,-70],hold:.05}],props:[{k:"box",x1:-62,y1:0,x2:72,y2:6},{k:"seg",a:[62,6],b:[66,112],w:4}]},
 isoSmith:{dur:5,frames:[M(SMITH,{hold:.4}),M(SMITH,{h:[3,106],L1:{p:[7,24]},L2:{p:[4,24]},F1:-55,F2:-55,hold:2.2})],props:SMITHP},
 calfSmith:{dur:4,frames:[M(SMITH,{h:[-1,91],L1:{p:[1,9]},L2:{p:[-2,9]},F1:25,F2:25,hold:.3}),M(SMITH,{h:[3,106],L1:{p:[7,24]},L2:{p:[4,24]},F1:-55,F2:-55,hold:.6})],props:SMITHP},
 legcurl:{dur:4,frames:[{h:[-12,46],t:0,hd:-25,L1:[180,180],L2:[181,181],F1:-90,F2:-90,A1:[-30,-80],A2:[-32,-82]},{h:[-12,46],t:0,hd:-25,L1:[180,72],L2:[181,73],F1:160,F2:160,A1:[-30,-80],A2:[-32,-82]}],props:[{k:"bench",x1:-70,x2:50,y:38},{k:"pad",at:"ankle1",r:6}]},
 cablefly:{view:"front",dur:4.5,frames:[M(FR,{A1:{a:[35,25],s:1}}),M(FR,{A1:{a:[-110,-118],s:1}})],props:[{k:"box",x1:-100,y1:0,x2:-92,y2:190},{k:"box",x1:92,y1:0,x2:100,y2:190},{k:"cable",from:[92,182],to:"hand1"},{k:"cable",from:[-92,182],to:"hand2"}]},
 pushdown:{dur:4,frames:[M(ST,{t:82,hd:-8,A1:[-100,72],A2:[-101,71]}),M(ST,{t:82,hd:-8,A1:[-96,-88],A2:[-97,-89]})],props:[{k:"box",x1:40,y1:0,x2:52,y2:186},{k:"cable",from:[40,180],to:"hand1"},{k:"plate",at:"hand1",r:3.5}]}
};
const MAP={
 "Mobility a terra e con bacchetta":["mob_dowel","Bacchetta tesa: passa da davanti a dietro la testa, braccia sempre dritte."],
 "Mobility a terra":["mob_floor","Gatto e cammello: inarca e arrotonda la schiena con il respiro."],
 "Panca piana con bilanciere":["panca","Scapole addotte, bilanciere sul basso petto, gomiti a circa 45°."],
 "Spinte manubri su panca piana":["dbpress","Scendi controllato, i manubri arrivano ai lati del petto."],
 "French press":["french","Gomiti fermi, muovi solo gli avambracci verso la fronte."],
 "Rematore con bilanciere":["row","Busto inclinato e fermo, tira il bilanciere verso l'ombelico."],
 "Croci con manubri":["croci","Gomiti leggermente piegati, apri ad arco e richiudi sopra il petto."],
 "Deficit push up":["pushup","Corpo in linea, scendi con il petto sotto il livello delle mani."],
 "Pulley braccio singolo":["pulley1","Busto fermo, tira il gomito indietro vicino al fianco."],
 "Low row machine":["lowrow","Petto alto, tira verso l'addome e stringi le scapole."],
 "Pulley":["lowrow","Petto alto, tira verso l'addome e stringi le scapole."],
 "EZ curl":["ezcurl","Gomiti incollati ai fianchi, sali e scendi lento."],
 "Curl con due manubri":["dbcurl","Gomiti fermi, niente slancio con la schiena."],
 "Alzata laterale al cavo basso":["latraise","Il cavo parte dal lato opposto: sali fino all'altezza della spalla."],
 "Tenuta isometrica su singolo avampiede":["iso1","Sali in punta e resta fermo in alto per tutto il tempo."],
 "Calf raise gamba singola":["calf1","Tallone giù sotto lo step, poi su in punta piena."],
 "Saltelli monopodalici veloci":["pogo","Rimbalzi piccoli e rapidi sull'avampiede, ginocchio quasi teso."],
 "Bulgarian split squat su avampiede":["bulgarian","Piede dietro sulla panca, scendi in verticale col busto quasi dritto."],
 "Stacchi rumeni con manubri":["rdlDb","Spingi il bacino indietro, schiena neutra, ginocchia appena piegate."],
 "Stacchi rumeni con bilanciere":["rdlBb","Spingi il bacino indietro, bilanciere vicino alle gambe."],
 "Wall sit":["wallsit","Schiena al muro, cosce parallele al pavimento, tieni la posizione."],
 "Squat jump":["squatjump","Accosciata, poi esplodi verso l'alto e atterra morbido."],
 "Wall run":["wallrun","Mani al muro, corpo inclinato, alterna le ginocchia più veloce che puoi."],
 "Spinte in alto con bilanciere":["ohp","Addome contratto, spingi in linea retta sopra la testa."],
 "Lat machine presa supina":["lat","Palmi verso di te, tira la barra al petto con i gomiti in basso."],
 "Vertical traction":["vt","Tira giù e tieni 2 secondi in basso."],
 "Cyclist goblet squat":["cyclist","Talloni rialzati, piedi stretti, ginocchia avanti e busto dritto."],
 "Leg extension":["legext","Estendi fino in fondo e scendi controllato."],
 "Calf raise su leg press":["lpcalf","Gambe tese, spingi con l'avampiede e tieni 2 secondi."],
 "Tapis roulant":["tread","Alterna 1 minuto di camminata e 1 di corsa."],
 "Tenuta isometrica su avampiede al multipower":["isoSmith","Sali in punta sotto il bilanciere e tieni fermo."],
 "Calf raise al multipower":["calfSmith","Tallone giù, poi su in punta piena con peso alto."],
 "Calf raise su leg press gamba singola":["lpcalf","Un piede alla volta: 8 spinte con l'avampiede, poi tieni 10 secondi alla fine."],
 "Leg curl":["legcurl","Bacino schiacciato sulla panca, porta i talloni verso i glutei."],
 "Croci ai cavi alti":["cablefly","Dall'alto verso il basso, le mani si incontrano davanti al bacino."],
 "Push down al cavo alto":["pushdown","Gomiti fermi ai fianchi, spingi fino a braccia tese."]
};

/* ---------- disegno ---------- */
function css(n,fb){try{const v=getComputedStyle(document.documentElement).getPropertyValue(n).trim();return v||fb}catch{return fb}}
function bounds(ex){
  let x0=1e9,x1=-1e9,y0=0,y1=-1e9;
  const add=(p)=>{if(!p)return;x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])};
  for(let i=0;i<=24;i++){const J=joints(poseAt(ex,i/24*((ex.dur||4)+3)),ex.view);for(const k in J)if(Array.isArray(J[k]))add(J[k]);add([J.head[0]+HR,J.head[1]+HR]);add([J.head[0]-HR,J.head[1]-HR])}
  (ex.props||[]).forEach(p=>{if(p.x1!=null){add([p.x1,p.y1||0]);add([p.x2,p.y2||p.y||0])}if(p.x!=null)add([p.x,p.y2||150]);if(p.from)add(p.from);if(p.pts)p.pts.forEach(add);if(p.a)add(p.a);if(p.b)add(p.b)});
  return [x0-14,x1+14,y0,y1+14];
}
/* muscoli che lavorano, per esercizio */
const MUS={mob_dowel:["delt","chest"],mob_floor:["abs","back"],panca:["chest","delt","tri"],dbpress:["chest","delt","tri"],french:["tri"],row:["lats","back","bi"],
 croci:["chest"],pushup:["chest","tri","delt"],pulley1:["lats","back","bi"],lowrow:["lats","back","bi"],ezcurl:["bi"],dbcurl:["bi"],latraise:["delt"],
 iso1:["calf"],calf1:["calf"],pogo:["calf"],isoSmith:["calf"],calfSmith:["calf"],lpcalf:["calf"],bulgarian:["quad","glute"],rdlDb:["ham","glute"],rdlBb:["ham","glute"],
 wallsit:["quad"],squatjump:["quad","glute","calf"],wallrun:["quad","glute","calf"],ohp:["delt","tri"],lat:["lats","bi"],vt:["lats","bi"],cyclist:["quad"],
 legext:["quad"],tread:["quad","calf","ham"],legcurl:["ham"],cablefly:["chest"],pushdown:["tri"]};
function draw(ctx,ex,time,W,H,box){
  const C={bg:"#FFFFFF",ground:"#E6E9EC",skin:"#ECEEF0",skinFar:"#D3D8DC",out:"#8C959C",outFar:"#A3ABB1",shorts:"#262B30",
    red:"#E2412C",red2:"#F2885C",metal:"#9AA3AA",iron:"#24292E",pad:"#3A4148",mach:"#E3E7EA",machLine:"#C6CDD2",cable:"#7D868D"};
  ctx.clearRect(0,0,W,H);ctx.fillStyle=C.bg;ctx.fillRect(0,0,W,H);
  const [x0,x1,y0,y1]=box;const pad=10;
  const sc=Math.min((W-2*pad)/(x1-x0),(H-2*pad-10)/(y1-y0));
  const ox=W/2-(x0+x1)/2*sc,oy=H-pad-10+y0*sc;
  const X=p=>[ox+p[0]*sc,oy-p[1]*sc];
  const J=joints(poseAt(ex,time),ex.view);
  const mus=new Set(MUS[ex._key]||[]);
  const at=(p)=>{let q=typeof p.at==="string"?J[p.at]:p.at;if(p.off)q=[q[0]+p.off[0],q[1]+p.off[1]];return q};
  ctx.lineCap="round";ctx.lineJoin="round";
  const g0=X([x0,0]),g1=X([x1,0]);ctx.strokeStyle=C.ground;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(g0[0],g0[1]);ctx.lineTo(g1[0],g1[1]);ctx.stroke();
  const line=(a,b,w,col)=>{const A=X(a),B=X(b);ctx.strokeStyle=col;ctx.lineWidth=w*sc;ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(B[0],B[1]);ctx.stroke()};
  const circ=(c,r,fill,stroke,w)=>{const A=X(c);ctx.beginPath();ctx.arc(A[0],A[1],r*sc,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=w||1.2;ctx.stroke()}};
  const rect=(x1,y1,x2,y2,fill,stroke)=>{const A=X([x1,y2]),B=X([x2,y1]);ctx.beginPath();const r=2*sc;ctx.roundRect?ctx.roundRect(A[0],A[1],B[0]-A[0],B[1]-A[1],r):ctx.rect(A[0],A[1],B[0]-A[0],B[1]-A[1]);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.2;ctx.stroke()}};
  const back=[],front=[];
  (ex.props||[]).forEach(p=>{(["plate","db","dbf","pad","lp","cable"].includes(p.k)?front:back).push(p)});
  const drawProp=p=>{
    switch(p.k){
      case"bench":line([p.x1+7,p.y-5],[p.x1+7,0],3.5,C.metal);line([p.x2-7,p.y-5],[p.x2-7,0],3.5,C.metal);rect(p.x1,p.y-6,p.x2,p.y,C.pad);break;
      case"box":if(p.c==="line")rect(p.x1,p.y1,p.x2,p.y2,"#EEF1F3");else rect(p.x1,p.y1,p.x2,p.y2,C.mach,C.machLine);break;
      case"wall":rect(p.x-4,0,p.x+4,p.y2||170,C.mach,C.machLine);break;
      case"rail":line([p.x,0],[p.x,p.y2||170],3,C.metal);break;
      case"seg":line(p.a,p.b,p.w||6,C.pad);break;
      case"poly":{ctx.fillStyle=C.mach;ctx.strokeStyle=C.machLine;ctx.lineWidth=1.2;ctx.beginPath();p.pts.forEach((q,i)=>{const A=X(q);i?ctx.lineTo(A[0],A[1]):ctx.moveTo(A[0],A[1])});ctx.closePath();ctx.fill();ctx.stroke();break}
      case"cable":{line(p.from,J[p.to],1,C.cable);circ(p.from,3.5,"#fff",C.cable,1.5);break}
      case"plate":{const c=at(p);if(p.c==="fg"){circ(c,p.r,C.iron);break}circ(c,p.r,C.iron);circ(c,p.r*0.78,null,"#3C434A",1);circ(c,Math.max(1.6,p.r*.2),C.metal);break}
      case"db":{const c=at(p);const r=p.r,A=X(c);ctx.fillStyle=C.iron;ctx.beginPath();for(let i=0;i<6;i++){const a=Math.PI/3*i+Math.PI/6;const px=A[0]+r*sc*Math.cos(a),py=A[1]+r*sc*Math.sin(a);i?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath();ctx.fill();circ(c,1.4,C.metal);break}
      case"dbf":{const c=at(p);line([c[0]-9,c[1]],[c[0]+9,c[1]],2.5,C.metal);rect(c[0]-14,c[1]-6,c[0]-7,c[1]+6,C.iron);rect(c[0]+7,c[1]-6,c[0]+14,c[1]+6,C.iron);break}
      case"pad":circ(at(p),p.r,C.pad);break;
      case"lp":{const c=at(p);const a=p.ang,l=p.len/2;line(P(c,a,l),P(c,a+180,l),5,C.pad);break}
    }
  };
  back.forEach(drawProp);

  /* --- forme anatomiche --- */
  const bump=(u,pk)=>{const v=u<pk?u/pk*0.5:0.5+(u-pk)/(1-pk)*0.5;return Math.sin(Math.PI*v)};
  const prof=(a,b,c,pk)=>u=>a+(b-a)*u+c*bump(u,pk==null?.5:pk);
  const PR={
    thigh:[prof(7,4.6,2.2,.4),prof(7.6,4.6,1.6,.45)],
    shin:[prof(4,2.5,.4,.3),prof(4.3,2.2,3.4,.28)],
    uarm:[prof(4.6,3.4,1.5,.55),prof(4.9,3.4,1.6,.4)],
    farm:[prof(3.6,2.1,1.1,.25),prof(3.4,2.1,.7,.3)],
    foot:[prof(2.6,1.3,.4,.3),prof(2.4,1.2,0,.5)]
  };
  // punti lungo un segmento (o curva) con profilo fronte/retro
  const segPts=(A,B,pf,pb,u0=0,u1=1,n=10)=>{
    const ang=Math.atan2(B[1]-A[1],B[0]-A[0]),nx=Math.cos(ang+Math.PI/2),ny=Math.sin(ang+Math.PI/2);
    const f=[],bk=[];for(let i=0;i<=n;i++){const u=u0+(u1-u0)*i/n;const px=A[0]+(B[0]-A[0])*u,py=A[1]+(B[1]-A[1])*u;f.push([px+nx*pf(u),py+ny*pf(u)]);bk.push([px-nx*pb(u),py-ny*pb(u)])}
    return f.concat(bk.reverse());
  };
  const fillPts=(pts,fill,stroke)=>{ctx.beginPath();pts.forEach((q,i)=>{const A=X(q);i?ctx.lineTo(A[0],A[1]):ctx.moveTo(A[0],A[1])});ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.1;ctx.stroke()}};
  const grad=(c,r,far)=>{const A=X(c);const g=ctx.createRadialGradient(A[0],A[1],0,A[0],A[1],r*sc);g.addColorStop(0,far?"rgba(242,136,92,.85)":C.red2);g.addColorStop(1,far?"rgba(226,65,44,.7)":C.red);return g};
  // ellisse muscolo su un lato del segmento
  const muscle=(A,B,u0,u1,side,depth,far)=>{
    const ang=Math.atan2(B[1]-A[1],B[0]-A[0]),len=Math.hypot(B[0]-A[0],B[1]-A[1]);
    const um=(u0+u1)/2,cx=A[0]+(B[0]-A[0])*um,cy=A[1]+(B[1]-A[1])*um;
    const off=side*depth*0.45,c=[cx+Math.cos(ang+Math.PI/2)*off,cy+Math.sin(ang+Math.PI/2)*off];
    const S=X(c);ctx.save();ctx.translate(S[0],S[1]);ctx.rotate(-ang);ctx.beginPath();ctx.ellipse(0,0,(u1-u0)*len/2*sc,depth*0.62*sc,0,0,Math.PI*2);
    ctx.fillStyle=grad(c,Math.max((u1-u0)*len/2,depth),far);ctx.fill();ctx.restore();
  };
  const limbShape=(A,B,kind,far,musF,musB)=>{
    const [pf,pb]=PR[kind];const pts=segPts(A,B,pf,pb);
    fillPts(pts,far?C.skinFar:C.skin);
    if(musF)muscle(A,B,musF[0],musF[1],1,pf((musF[0]+musF[1])/2),far);
    if(musB)muscle(A,B,musB[0],musB[1],-1,pb((musB[0]+musB[1])/2),far);
    fillPts(pts,"rgba(0,0,0,0)",far?C.outFar:C.out);
  };
  const shortsOn=(A,B,kind,u1,far)=>{const [pf,pb]=PR[kind];fillPts(segPts(A,B,u=>pf(u)+.6,u=>pb(u)+.6,0,u1),C.shorts)};
  const joint=(c,r,far)=>circ(c,r,far?C.skinFar:C.skin);
  const head=(c,dir,far)=>{
    circ(c,HR*.95,C.skin,C.out,1.1);
    // naso e capelli
    const n1=P(c,dir,HR*.95),n2=P(c,dir-25,HR*.62),n3=P(c,dir-70,HR*.9);
    fillPts([n1,P(n1,dir-120,3),n2],C.skin,null);
  };

  if(ex.view==="front"){
    const sideMus=(arm)=>arm;
    // gambe
    [[J.hR,J.knee1,J.ankle1,J.toe1],[J.hL,J.knee2,J.ankle2,J.toe2]].forEach(([h,k,a,t])=>{
      limbShape(k,a,"shin",false,null,null);limbShape(h,k,"thigh",false,mus.has("quad")?[.2,.85]:null,null);shortsOn(h,k,"thigh",.33);
      fillPts(segPts(a,t,()=>2.6,()=>2.6),C.skin,C.out);
    });
    // busto
    const hL=J.hL,hR=J.hR,sL=J.sL,sR=J.sR;
    const tp=[[hL[0]-3,hL[1]],[hR[0]+3,hR[1]],[hR[0]+1,hR[1]+18],[sR[0]+3,sR[1]-6],[sR[0],sR[1]+2],[sL[0],sL[1]+2],[sL[0]-3,sL[1]-6],[hL[0]-1,hL[1]+18]];
    fillPts(tp,C.skin);
    if(mus.has("chest")){[[-8,-9],[8,-9]].forEach(o=>{const c=[J.shoulder[0]+o[0],J.shoulder[1]+o[1]];const A=X(c);ctx.beginPath();ctx.ellipse(A[0],A[1],8*sc,6*sc,0,0,Math.PI*2);ctx.fillStyle=grad(c,8);ctx.fill()})}
    if(mus.has("abs")){const c=[J.hip[0],J.hip[1]+24];const A=X(c);ctx.beginPath();ctx.ellipse(A[0],A[1],6*sc,11*sc,0,0,Math.PI*2);ctx.fillStyle=grad(c,10);ctx.fill()}
    fillPts(tp,"rgba(0,0,0,0)",C.out);
    fillPts([[hL[0]-3.6,hL[1]-4],[hR[0]+3.6,hR[1]-4],[hR[0]+3,hR[1]+9],[hL[0]-3,hL[1]+9]],C.shorts);
    line(J.shoulder,J.neck,7,C.skin);
    head(J.head,90,false);
    // braccia
    [[sR,J.elbow1,J.hand1],[sL,J.elbow2,J.hand2]].forEach(([s,e,h])=>{
      limbShape(e,h,"farm",false,null,null);limbShape(s,e,"uarm",false,mus.has("bi")?[.3,.85]:null,mus.has("tri")?[.25,.8]:null);
      if(mus.has("delt")){const A=X(s);ctx.beginPath();ctx.arc(A[0],A[1],6.2*sc,0,Math.PI*2);ctx.fillStyle=grad(s,6);ctx.fill();ctx.strokeStyle=C.out;ctx.lineWidth=1.1;ctx.stroke()}
      else circ(s,5.6,C.skin,C.out,1.1);
      circ(h,3,C.skin,C.out,1);
    });
  }else{
    const legs=(h,k,a,t,far)=>{
      fillPts(segPts(a,t,PR.foot[0],PR.foot[1]),far?C.skinFar:C.skin,far?C.outFar:C.out);circ(a,3.4,far?C.skinFar:C.skin);
      limbShape(k,a,"shin",far,null,mus.has("calf")?[.08,.55]:null);
      joint(k,5,far);
      limbShape(h,k,"thigh",far,mus.has("quad")?[.22,.9]:null,mus.has("ham")?[.25,.9]:null);
      shortsOn(h,k,"thigh",.34,far);circ(h,7.6,C.shorts);
    };
    const arms=(s,e,hd,far)=>{
      limbShape(e,hd,"farm",far,null,null);
      circ(hd,3.1,far?C.skinFar:C.skin,far?C.outFar:C.out,1);
      limbShape(s,e,"uarm",far,mus.has("bi")?[.28,.85]:null,mus.has("tri")?[.15,.8]:null);
      const dr=6.2;
      if(mus.has("delt")){circ(s,dr,grad(s,dr,far),far?C.outFar:C.out,1.1)}else circ(s,dr-.6,far?C.skinFar:C.skin,far?C.outFar:C.out,1.1);
    };
    // lato lontano
    legs([J.hip[0]-2,J.hip[1]],J.knee2,J.ankle2,J.toe2,true);
    arms([J.shoulder[0]-2,J.shoulder[1]+1],J.elbow2,J.hand2,true);
    // busto lungo la colonna (curva)
    const H0=J.hip,S0=J.shoulder,t=J.t;const mx=(H0[0]+S0[0])/2,my=(H0[1]+S0[1])/2;const cp=P([mx,my],t+90,J.ar*1.8);
    const q=u=>[(1-u)*(1-u)*H0[0]+2*(1-u)*u*cp[0]+u*u*S0[0],(1-u)*(1-u)*H0[1]+2*(1-u)*u*cp[1]+u*u*S0[1]];
    const qt=u=>{const dx=2*(1-u)*(cp[0]-H0[0])+2*u*(S0[0]-cp[0]),dy=2*(1-u)*(cp[1]-H0[1])+2*u*(S0[1]-cp[1]);return Math.atan2(dy,dx)};
    const lerpK=(ks,u)=>{for(let i=0;i<ks.length-1;i++){if(u<=ks[i+1][0]){const k=(u-ks[i][0])/(ks[i+1][0]-ks[i][0]);const s=.5-.5*Math.cos(Math.PI*k);return ks[i][1]+(ks[i+1][1]-ks[i][1])*s}}return ks[ks.length-1][1]};
    const FRONT=[[0,8.5],[.35,7.4],[.72,11],[.92,9],[1,6.5]],BACK=[[0,10.5],[.12,10.8],[.38,7.2],[.75,9.8],[1,7]];
    const torsoPts=(u0,u1,add=0)=>{const f=[],b=[];const n=16;for(let i=0;i<=n;i++){const u=u0+(u1-u0)*i/n;const p=q(u),a=qt(u);const fr=a-Math.PI/2;
      f.push([p[0]+Math.cos(fr)*(lerpK(FRONT,u)+add),p[1]+Math.sin(fr)*(lerpK(FRONT,u)+add)]);b.push([p[0]-Math.cos(fr)*(lerpK(BACK,u)+add),p[1]-Math.sin(fr)*(lerpK(BACK,u)+add)])}return f.concat(b.reverse())};
    const TP=torsoPts(0,1);
    // collo
    line(S0,J.neck,7.5,C.skin);
    fillPts(TP,C.skin);
    const tm=(u0,u1,side,dep)=>{const pA=q(u0),pB=q(u1);muscle(pA,pB,0,1,side,dep)};
    // lato frontale del busto = -1 rispetto alla normale (+90) del segmento
    if(mus.has("chest"))tm(.62,.9,-1,11);
    if(mus.has("abs"))tm(.22,.6,-1,8);
    if(mus.has("lats"))tm(.42,.82,1,9.5);
    if(mus.has("back"))tm(.6,.95,1,9);
    if(mus.has("glute"))tm(.0,.22,1,11);
    fillPts(TP,"rgba(0,0,0,0)",C.out);
    fillPts(torsoPts(0,.17,.5),C.shorts);circ(H0,8.6,C.shorts);
    // testa
    head(J.head,t-90+(J.hd||0)*0+((J.hdd)||0),false);
    // lato vicino
    legs(H0,J.knee1,J.ankle1,J.toe1,false);
    arms(S0,J.elbow1,J.hand1,false);
  }
  front.forEach(drawProp);
}

/* ---------- player ---------- */
let raf=0,cur=null;
function open(name){
  const m=MAP[name];if(!m)return false;
  const ex=EX[m[0]];
  let ov=document.getElementById("vidov");
  if(!ov){ov=document.createElement("div");ov.id="vidov";ov.className="vidov";ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");
    ov.innerHTML='<div class="vidbox"><div class="spread"><h3 class="vidt"></h3><button class="vidx" aria-label="Chiudi">✕</button></div><canvas class="vidc"></canvas><p class="vidcue"></p><p class="vidcap muted"></p><button class="btn btn-primary vidok">Ho capito</button></div>';
    document.body.appendChild(ov);
    ov.addEventListener("click",e=>{if(e.target===ov||e.target.closest(".vidx")||e.target.closest(".vidok"))close()});
    document.addEventListener("keydown",e=>{if(e.key==="Escape")close()});
  }
  ov.querySelector(".vidt").textContent=name;
  ov.querySelector(".vidcue").textContent=m[1];
  ov.querySelector(".vidcap").textContent=(ex.cap?ex.cap+" · ":"")+"In rosso i muscoli che lavorano";
  ov.hidden=false;
  const cv=ov.querySelector(".vidc");const dpr=Math.min(3,window.devicePixelRatio||1);
  const W=cv.clientWidth||320,H=cv.clientHeight||260;cv.width=W*dpr;cv.height=H*dpr;const ctx=cv.getContext("2d");ctx.setTransform(dpr,0,0,dpr,0,0);
  const box=bounds(ex);const t0=performance.now();cur=ex;
  cancelAnimationFrame(raf);
  const step=now=>{if(cur!==ex)return;draw(ctx,ex,(now-t0)/1000,W,H,box);raf=requestAnimationFrame(step)};
  raf=requestAnimationFrame(step);
  return true;
}
function close(){const ov=document.getElementById("vidov");if(ov)ov.hidden=true;cur=null;cancelAnimationFrame(raf)}
for(const k in EX)EX[k]._key=k;
window.ExAnim={open,close,has:n=>!!MAP[n],_EX:EX,_MAP:MAP,_draw:draw,_bounds:bounds};
})();
