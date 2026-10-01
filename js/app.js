const $=id=>document.getElementById(id);
const IC={
 broom:'<path d="M4 20l5-5M14 4l6 6-8 8-6-6z"/>',
 router:'<rect x="3" y="14" width="18" height="6" rx="2"/><path d="M7 10a7 7 0 0 1 10 0M4 7a11 11 0 0 1 16 0"/>',
 globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
 tag:'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="8" cy="8" r="1.4"/>',
 server:'<rect x="4" y="4" width="16" height="6" rx="2"/><rect x="4" y="14" width="16" height="6" rx="2"/><path d="M8 7h.01M8 17h.01"/>',
 check:'<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
 next:'<path d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"/>',
 redo:'<path d="M4 12a8 8 0 1 0 3-6M4 4v5h5"/>'};
const svg=n=>`<svg viewBox="0 0 24 24">${IC[n]}</svg>`;
const EX=[
 {name:'YouTube',d:'www.youtube.com',tld:'com',tldNs:'a.gtld-servers.net',ns:'ns1.google.com',ip:'142.250.78.14',alias:'youtube-ui.l.google.com'},
 {name:'Un blog',d:'blogdesistemas.com',tld:'com',tldNs:'a.gtld-servers.net',ns:'ns1.mi-hosting.net',ip:'104.21.45.190'},
 {name:'Wikipedia',d:'www.wikipedia.org',tld:'org',tldNs:'a0.org.afilias-nst.info',ns:'ns0.wikimedia.org',ip:'208.80.154.224'}];
const steps=e=>[
 {i:'broom',t:'Empezamos de cero',x:'Borramos la caché de tu computadora para simular que es la primera vez que visitas el sitio.',c:'ipconfig /flushdns',o:['Se vació correctamente la caché de resolución de DNS.']},
 {i:'router',t:'Tu DNS local',x:'Antes de salir a internet, tu equipo le pregunta a tu router. Esa es la IP que aparece abajo.',c:'ipconfig /all | findstr "DNS"',o:['Servidores DNS . . . . : [[192.168.1.1]]']},
 {i:'globe',t:'Preguntamos a la Raíz',x:`Los servidores raíz no conocen la IP, pero saben quién maneja la extensión .${e.tld}. Con -norecurse les pedimos solo lo que saben.`,c:`nslookup -norecurse ${e.d} a.root-servers.net`,o:['AUTHORITY RECORDS:',`  ${e.tld} nameserver = [[${e.tldNs}]]`,'Redirige: pregunta a los de la extensión.']},
 {i:'tag',t:'Servidor TLD',x:`El servidor de .${e.tld} tampoco tiene la IP, pero te dice quién es el dueño del dominio.`,c:`nslookup -norecurse ${e.d} ${e.tldNs}`,o:['AUTHORITY RECORDS:',`  ${e.d.replace('www.','')} nameserver = [[${e.ns}]]`]},
 {i:'server',t:'Servidor autoritativo',x:'Este sí es el dueño de los registros, así que entrega la IP exacta, sin la etiqueta "no autoritativa".',c:`nslookup ${e.d} ${e.ns}`,o:[`Servidor: ${e.ns}`,...(e.alias?[`Nombre: ${e.alias}`,`Alias: ${e.d}`]:[`Nombre: ${e.d}`]),`Direcciones: [[${e.ip}]]`]},
 {i:'check',t:'Guardado en caché',x:'Tu DNS local guarda la IP. La próxima vez responde al instante, sin recorrer raíz, TLD ni autoritativo.',c:`ipconfig /displaydns | findstr /i ${e.d.split('.').slice(-2)[0]}`,o:[`Nombre de registro . : ${e.d}`,`Registro A . . . . . : [[${e.ip}]]`,'Tiempo de vida . . . : 300 s']}];
let ex=0,st=0,S=steps(EX[0]),run=0;
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const wait=ms=>new Promise(r=>setTimeout(r,reduce?0:ms));
function buildPicks(){EX.forEach((e,i)=>{const b=document.createElement('button');b.className='pick'+(i==ex?' on':'');b.textContent=e.name;b.onclick=()=>{ex=i;st=0;S=steps(EX[i]);document.querySelectorAll('.pick').forEach((p,j)=>p.classList.toggle('on',j==i));play()};$('picks').append(b)})}
function dots(){$('dots').innerHTML=S.map((_,i)=>`<i class="${i==st?'on':i<st?'done':''}"></i>`).join('')}
async function play(){
 const id=++run,s=S[st],last=st==S.length-1;dots();$('host').textContent=EX[ex].d;
 $('back').disabled=st==0;$('next').disabled=true;$('loader').classList.remove('on');
 const txt=document.querySelector('.txt');txt.classList.add('swap');
 await wait(250);if(id!=run)return;
 $('ico').innerHTML=svg(s.i);$('ico').classList.remove('pop');void $('ico').offsetWidth;$('ico').classList.add('pop');
 $('title').textContent=s.t;$('text').textContent=s.x;txt.classList.remove('swap');
 $('cmd').textContent='';$('out').innerHTML='';
 await wait(350);
 for(const ch of s.c){if(id!=run)return;$('cmd').textContent+=ch;await wait(28+Math.random()*40)}
 await wait(300);$('loader').classList.add('on');await wait(1100);if(id!=run)return;$('loader').classList.remove('on');
 for(const l of s.o){const d=document.createElement('span');d.className='l';d.style.display='block';d.innerHTML=l.replace(/\[\[(.+?)\]\]/g,'<span class="hi">$1</span>');$('out').append(d);await wait(380);if(id!=run)return}
 $('nextLabel').textContent=last?'Reiniciar':'Continuar';$('nextIco').innerHTML=IC[last?'redo':'next'];$('next').disabled=false;
}
$('next').onclick=()=>{st=st==S.length-1?0:st+1;play()};
$('back').onclick=()=>{if(st>0){st--;play()}};
$('theme').onchange=e=>document.documentElement.dataset.theme=e.target.checked?'dark':'light';
$('theme').checked=true;
buildPicks();play();
