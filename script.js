import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const canvas = document.getElementById("scene");
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xffd8e7, 0.018);
const camera = new THREE.PerspectiveCamera(45, innerWidth/innerHeight, .1, 1000);
camera.position.set(0, 8.5, 16);

scene.add(new THREE.HemisphereLight(0xffeaf3,0x9e7390,2.4));
const sun = new THREE.DirectionalLight(0xffffff,3);
sun.position.set(-5,12,7); sun.castShadow=true; scene.add(sun);

const water = new THREE.Mesh(
  new THREE.CylinderGeometry(11,11,0.45,96),
  new THREE.MeshPhysicalMaterial({color:0xf2a6c6,roughness:.2,metalness:.05,transparent:true,opacity:.82})
);
water.position.y=-1.7; scene.add(water);

const island = new THREE.Mesh(
  new THREE.CylinderGeometry(6.4,5.3,1.25,64),
  new THREE.MeshStandardMaterial({color:0x8ccf9b,roughness:.85})
);
island.position.y=-.9; island.castShadow=true; island.receiveShadow=true; scene.add(island);

const sand = new THREE.Mesh(
  new THREE.CylinderGeometry(4.7,4.3,.18,64),
  new THREE.MeshStandardMaterial({color:0xffe0a9,roughness:.9})
);
sand.position.y=-.22; scene.add(sand);

const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.22,.38,2.3,16),new THREE.MeshStandardMaterial({color:0x81503d}));
trunk.position.set(-3.5,1.0,-1); scene.add(trunk);
const crown = new THREE.Mesh(new THREE.SphereGeometry(1.7,20,14),new THREE.MeshStandardMaterial({color:0x8dcf92}));
crown.position.set(-3.5,2.7,-1); scene.add(crown);

function lily(x,z,s=1,color=0xf48fb1){
  const g=new THREE.Group();
  for(let i=0;i<6;i++){
    const a=i*Math.PI/3;
    const p=new THREE.Mesh(new THREE.SphereGeometry(.34*s,16,10),new THREE.MeshStandardMaterial({color,roughness:.45}));
    p.scale.set(.8,1.25,.35); p.position.set(Math.cos(a)*.28*s,.1,Math.sin(a)*.28*s); p.rotation.y=a; g.add(p);
  }
  const c=new THREE.Mesh(new THREE.SphereGeometry(.12*s,12,8),new THREE.MeshStandardMaterial({color:0xd4a017,emissive:0x6a4300,emissiveIntensity:.2}));
  c.position.y=.25*s; g.add(c);
  g.position.set(x,.1,z); scene.add(g);
  return g;
}

const flowers=[lily(-2.8,-1.8,.8),lily(-1.7,-2.3,.6,0xffd7e6),lily(2.3,-1.4,.9,0xffffff),lily(3,-.1,.65),lily(1.4,2.1,.8,0xff9ec0),lily(-1.5,2.5,.6,0xffc2d8)];

const boat=new THREE.Group();
const hull=new THREE.Mesh(new THREE.CapsuleGeometry(1.2,.7,8,20),new THREE.MeshStandardMaterial({color:0x7a3f30}));
hull.scale.set(1.7,.45,.8); hull.rotation.z=Math.PI/2; boat.add(hull);
const mast=new THREE.Mesh(new THREE.CylinderGeometry(.06,.08,2.6,10),new THREE.MeshStandardMaterial({color:0x6b422f}));
mast.position.y=1.2; boat.add(mast);
const sail=new THREE.Mesh(new THREE.PlaneGeometry(1.25,1.65),new THREE.MeshStandardMaterial({color:0xfff8fb,side:THREE.DoubleSide}));
sail.position.set(.45,1.35,0); sail.rotation.y=Math.PI/2; boat.add(sail);
boat.position.set(5,-.7,2); boat.rotation.y=-.45; scene.add(boat);

const petals=new THREE.Group(); scene.add(petals);
for(let i=0;i<65;i++){
  const p=new THREE.Mesh(new THREE.PlaneGeometry(.11,.17),new THREE.MeshBasicMaterial({color: i%3?0xff9ec0:0xffffff,transparent:true,side:THREE.DoubleSide,opacity:.75}));
  p.position.set((Math.random()-.5)*24,Math.random()*10-1,(Math.random()-.5)*20);
  p.userData={speed:.008+Math.random()*.018,drift:Math.random()*.02};
  petals.add(p);
}

let targetX=0,targetY=7.8,camX=0,camY=7.8;
addEventListener("pointermove",e=>{
  targetX=(e.clientX/innerWidth-.5)*2.2;
  targetY=7.8+(e.clientY/innerHeight-.5)*1.1;
});

function animate(){
  requestAnimationFrame(animate);
  camX += (targetX-camX)*.025; camY += (targetY-camY)*.025;
  camera.position.x=camX; camera.position.y=camY; camera.lookAt(0,0,0);
  water.rotation.y+=.0007;
  island.rotation.y+=.00012;
  boat.position.x=5+Math.sin(Date.now()*.00055)*1.1;
  boat.position.y=-.7+Math.sin(Date.now()*.0014)*.08;
  flowers.forEach((f,i)=>f.rotation.y+=.002+(i%2)*.001);
  petals.children.forEach(p=>{
    p.position.y-=p.userData.speed;
    p.position.x+=Math.sin(Date.now()*.001+p.position.z)*p.userData.drift;
    p.rotation.z+=.01;
    if(p.position.y<-3){p.position.y=10;p.position.x=(Math.random()-.5)*24;}
  });
  renderer.render(scene,camera);
}
animate();

addEventListener("resize",()=>{
  camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});

const intro=document.getElementById("intro");
const loader=document.getElementById("loader");
setTimeout(()=>{loader.style.opacity="0";setTimeout(()=>loader.remove(),700)},500);

function petalsRain(){
  for(let i=0;i<32;i++){
    const p=document.createElement("div"); p.className="petal";
    p.textContent=Math.random()>.25?"🌸":"💗";
    p.style.left=Math.random()*100+"vw";
    p.style.top="-30px";
    p.style.setProperty("--drift",(Math.random()*180-90)+"px");
    p.style.animationDuration=(3+Math.random()*3)+"s";
    p.style.animationDelay=(Math.random()*.8)+"s";
    document.body.appendChild(p);
    setTimeout(()=>p.remove(),7000);
  }
}

document.getElementById("startBtn").onclick=()=>{
  intro.classList.add("hidden"); setSectionMusic("home", true); petalsRain(); showToast("¡La aventura comienza! 🌸"); count();
};

function showToast(t){const x=document.getElementById("toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),1800)}
function count(){let n=+localStorage.getItem("aventuras")||0;n++;localStorage.setItem("aventuras",n);document.getElementById("adventureCount").textContent=n}
function go(id){
  document.querySelectorAll(".panel").forEach(x=>x.classList.remove("active"));
  document.getElementById(id)?.classList.add("active");
  setSectionMusic(id, true);
  count(); petalsRain();
}
document.querySelectorAll("[data-target]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.target)));

// Tarjetas desplegables de One Piece y Lirios.
document.querySelectorAll(".expand-toggle, .crew-toggle").forEach(button=>{
  button.addEventListener("click",()=>{
    const card=button.closest(".accordion-card");
    const open=card.classList.toggle("open");
    button.setAttribute("aria-expanded",String(open));
    if(open) showToast(`Carta abierta 💌`);
  });
});

document.getElementById("envelope").addEventListener("click",()=>document.getElementById("envelope").classList.toggle("open"));
document.getElementById("envelope").addEventListener("keydown",e=>{
  if(e.key==="Enter"||e.key===" "){
    e.preventDefault();
    document.getElementById("envelope").classList.toggle("open");
  }
});

document.getElementById("adventureCount").textContent=localStorage.getItem("aventuras")||0;
