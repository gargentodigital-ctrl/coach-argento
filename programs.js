/* Schede di allenamento. Ogni scheda nuova va aggiunta in coda a PROGRAMS.
   id: univoco · name: nome · from: data di inizio (AAAA-MM-GG) · seds: sedute
   tendon: sedute con il check del tendine · calf: esercizi di polpaccio (freno carichi) */
(function(){
const P=(n,k,v,kg=true)=>({n,k,v,kg});
window.PROGRAMS=[
{id:"argento5",name:"Scheda G. Argento 5",from:"2026-10-16",
 tendon:["B","C","D"],calf:["b2","b3","b4","b5","c7","d2","d2b","d3","d3b"],
 seds:{
 A:{t:"Upper 1",ex:[
  {id:"a1",p:[P("Mobility a terra e con bacchetta","time",300,false)],sets:1,rest:0,free:1},
  {id:"a2",p:[P("Panca piana con bilanciere","reps",10)],var:[[4,10,75],[5,4,105]]},
  {id:"a3",p:[P("Rematore con bilanciere","reps",6)],var:[[5,6,90],[4,10,75]]},
  {id:"a4",p:[P("Croci con manubri","reps",12),P("Deficit push up","max",0,false)],sets:4,rest:90,note:"Superserie: croci e subito push up al cedimento. Recupero solo dopo entrambi."},
  {id:"a5",p:[P("Pulley braccio singolo","reps",10)],sets:3,rest:45,side:1,note:"Per braccio. Recupero dopo il secondo braccio."},
  {id:"a6",p:[P("Low row machine","reps",12)],sets:3,rest:60},
  {id:"a7",p:[P("French press","reps",10),P("EZ curl","reps",10)],sets:3,rest:60,note:"Superserie: recupero dopo entrambi."},
  {id:"a8",p:[P("Alzata laterale al cavo basso","reps",12)],sets:3,rest:60,side:1,note:"Per lato. 2 o 3 serie: la terza solo se la tecnica regge."}]},
 B:{t:"Lower forza",ex:[
  {id:"b1",p:[P("Mobility a terra","time",300,false)],sets:1,rest:0,free:1},
  {id:"b2",p:[P("Tenuta isometrica su singolo avampiede","time",30)],sets:3,rest:60,leg:1,note:"Quando diventa facile, aggiungi peso."},
  {id:"b3",p:[P("Saltelli monopodalici veloci","reps",30,false)],sets:2,rest:60,leg:1},
  {id:"b4",p:[P("Calf raise gamba singola","reps",10)],sets:3,rest:60,leg:1,note:"Angolo debole come visto col fisio. Carica tanto."},
  {id:"b5",p:[P("Bulgarian split squat su avampiede","reps",8)],sets:4,rest:45,leg:1,note:"Due manubri. 45\" tra una gamba e l'altra."},
  {id:"b6",p:[P("Stacchi rumeni con manubri","reps",15)],sets:3,rest:60},
  {id:"b7",p:[P("Wall sit","time",50,false),P("Squat jump","reps",8,false)],sets:4,rest:90,note:"Superserie. Salto bello alto."},
  {id:"b8",p:[P("Wall run","time",10,false)],sets:4,rest:60,note:"Massima intensità, mani appoggiate al muro."}]},
 C:{t:"Total body",ex:[
  {id:"c1",p:[P("Mobility a terra e con bacchetta","time",300,false)],sets:1,rest:0,free:1},
  {id:"c2",p:[P("Spinte in alto con bilanciere","reps",10)],var:[[4,10,75],[5,6,105]]},
  {id:"c3",p:[P("Lat machine presa supina","reps",6)],var:[[5,6,90],[4,12,75]]},
  {id:"c4",p:[P("Vertical traction","reps",10)],sets:3,rest:75,note:"2\" di tenuta in basso."},
  {id:"c5",p:[P("Cyclist goblet squat","reps",10)],sets:4,rest:75},
  {id:"c6",p:[P("Leg extension","reps",12)],sets:3,rest:60},
  {id:"c7",p:[P("Calf raise su leg press","reps",10)],sets:4,rest:60,note:"2\" di tenuta nell'angolo debole."},
  {id:"c8",p:[P("Tapis roulant","time",720,false)],sets:1,rest:0,note:"1' camminata + 1' corsa, alternati."}]},
 D:{t:"Total body",ex:[
  {id:"d1",p:[P("Mobility a terra","time",300,false)],sets:1,rest:0,free:1},
  {id:"d2b",since:"2026-10-30",p:[P("Tenuta isometrica su avampiede alla leg press basculante","time",30)],sets:3,rest:60,leg:1,note:"Quando diventa facile, aggiungi peso. Alla leg press basculante dal 30 ottobre."},
  {id:"d3b",since:"2026-10-27",p:[P("Calf raise su leg press gamba singola","reps",8)],sets:3,rest:60,leg:1,note:"Per singolo piede: 8 ripetizioni, poi 10\" di isometria alla fine della serie. Su indicazione del PT dal 27 ottobre."},
  {id:"d4",p:[P("Stacchi rumeni con bilanciere","reps",6)],sets:4,rest:90,note:"Peso alto."},
  {id:"d5",p:[P("Leg curl","reps",12)],sets:3,rest:60},
  {id:"d6",p:[P("Croci ai cavi alti","reps",10)],sets:3,rest:60},
  {id:"d7",p:[P("Spinte manubri su panca piana","reps",8)],sets:4,rest:90,note:"Peso alto."},
  {id:"d8",p:[P("Pulley","reps",10)],sets:4,rest:75},
  {id:"d9",p:[P("Push down al cavo alto","reps",12),P("Curl con due manubri","reps",12)],sets:3,rest:75,note:"Superserie: recupero dopo entrambi."}],
  /* esercizi sostituiti: non compaiono più in seduta, restano per lo storico */
  old:[{id:"d2",p:[P("Tenuta isometrica su avampiede al multipower","time",30)],sets:3,rest:60,leg:1,note:"Sostituito il 30 ottobre."},
       {id:"d3",p:[P("Calf raise al multipower","reps",8)],sets:3,rest:60,note:"Bipodalico, peso alto. Sostituito il 27 ottobre."}]}
}}
];
})();
