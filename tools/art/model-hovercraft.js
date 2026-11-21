import * as T from 'three';
import { RoomEnvironment } from '/room.js';
import { RoundedBoxGeometry } from '/rounded.js';

const scene = new T.Scene();
const renderer = new T.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
renderer.setSize(2160,1600);
renderer.setClearColor(0x000000,0);
renderer.outputColorSpace = T.SRGBColorSpace;
renderer.toneMapping = T.ACESFilmicToneMapping;
renderer.toneMappingExposure = .94;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = T.PCFSoftShadowMap;
const environment = new T.PMREMGenerator(renderer).fromScene(new RoomEnvironment(),.055);
scene.environment = environment.texture;
scene.environmentIntensity = .64;
const camera = new T.OrthographicCamera(-4.25,4.25,3.15,-3.15,.1,70);
camera.position.set(5.4,5.95,12.5);
camera.lookAt(.03,1.65,0);
const v = (x,y,z) => new T.Vector3(x,y,z);
const TAU = Math.PI*2;
const material = (color,roughness=.4,metalness=.05,extra={}) => new T.MeshStandardMaterial({color,roughness,metalness,...extra});
const orange = material(0xf45a04,.29,.17);
const lightOrange = material(0xff861c,.30,.18);
const darkOrange = material(0xb8420a,.35,.17);
const sunflower = material(0xffc23d,.31,.23);
const rubber = material(0x242b35,.56,.05);
const rubberEdge = material(0x424a53,.48,.06);
const gasket = material(0x171e25,.70,.03);
const darkTeal = material(0x244457,.40,.13);
const metal = material(0x8c9da7,.26,.78);
const darkMetal = material(0x3e4c55,.34,.55);
const white = material(0xfff0d6,.29,.12);
const glass = new T.MeshPhysicalMaterial({color:0x90dfea,roughness:.16,metalness:.02,clearcoat:1,clearcoatRoughness:.12,transparent:true,opacity:.42,side:T.DoubleSide,depthWrite:false});
scene.add(new T.HemisphereLight(0xfff6e6,0xbccaed,.83));
const key = new T.DirectionalLight(0xfff1d8,2.65);
key.position.set(-4,9,7); key.castShadow=true;
Object.assign(key.shadow.camera,{left:-5,right:5,top:5,bottom:-5,far:26});
key.shadow.mapSize.set(2048,2048);key.shadow.normalBias=.018;key.shadow.bias=-.0002;
scene.add(key);
const fill = new T.DirectionalLight(0xb8daff,1.0);fill.position.set(3,4,-6);scene.add(fill);
const kicker=new T.DirectionalLight(0xffbb7a,.65);kicker.position.set(-6,3,-1);scene.add(kicker);
const vessel = new T.Group();scene.add(vessel);
function mesh(geometry,mat,parent=vessel){
  const obj=new T.Mesh(geometry,mat);
  obj.castShadow=true;obj.receiveShadow=true;parent.add(obj);return obj;
}
function box(x,y,z,w,h,d,r,mat,parent=vessel) {
  const obj=mesh(new RoundedBoxGeometry(w,h,d,3,r),mat,parent);obj.position.set(x,y,z);return obj;
}
function ball(x,y,z,a,b,c,mat,parent=vessel) {
  const obj=mesh(new T.SphereGeometry(1,44,24),mat,parent);obj.position.set(x,y,z);obj.scale.set(a,b,c);return obj;
}
function pipe(points,r,mat,parent=vessel,closed=false) {
  const curve = new T.CatmullRomCurve3(points,closed,'centripetal');
  return mesh(new T.TubeGeometry(curve,Math.max(20,points.length*7),r,10,closed),mat,parent);
}
function line(a,b,r,mat,parent=vessel) {
  const dir=b.clone().sub(a);const obj=mesh(new T.CylinderGeometry(r,r,dir.length(),12),mat,parent);
  obj.position.copy(a.clone().lerp(b,.5));obj.quaternion.setFromUnitVectors(v(0,1,0),dir.normalize());return obj;
}
function skin(fn,us,vs,mat,parent=vessel) {
  const pos=[],idx=[];
  for(let j=0;j<=vs;j++) for(let i=0;i<=us;i++){
    const p=fn(i/us,j/vs);pos.push(p.x,p.y,p.z);
    if(j<vs&&i<us){const n=j*(us+1)+i;idx.push(n,n+1,n+us+2,n,n+us+2,n+us+1);}
  }
  const geom=new T.BufferGeometry();geom.setAttribute('position',new T.Float32BufferAttribute(pos,3));geom.setIndex(idx);geom.computeVertexNormals();
  const surface=mat.clone();surface.side=T.DoubleSide;
  return mesh(geom,surface,parent);
}
function outline(points) {return new T.CatmullRomCurve3(points.map(([x,z])=>v(x,0,z)),true,'centripetal');}
const hull = outline([[3.12,0],[2.86,.62],[2.27,1.07],[1.30,1.32],[-.25,1.40],[-1.70,1.32],[-2.58,1.04],[-2.89,.54],[-2.93,0],[-2.89,-.54],[-2.58,-1.04],[-1.70,-1.32],[-.25,-1.40],[1.30,-1.32],[2.27,-1.07],[2.86,-.62]]);
// Winding runs from bow to starboard to stern. The same parameter anchors deck strips to the cockpit opening.
const well=outline([[1.17,0],[1.11,.38],[.90,.67],[.48,.80],[-.18,.83],[-.71,.80],[-1.01,.64],[-1.13,.36],[-1.16,0],[-1.13,-.36],[-1.01,-.64],[-.71,-.80],[-.18,-.83],[.48,-.80],[.90,-.67],[1.11,-.38]]);
function contour(u,scale=1){
  const p=hull.getPointAt(u);
  p.x*=scale;p.z*=scale;
  const tangent=hull.getTangentAt(u);
  return [p,v(tangent.z,0,-tangent.x).normalize()];
}
const lift=x=>.10*Math.pow(Math.max(0,(x-.9)/2.3),1.3);
function skirtProfile(u,angle){
  const [p,n]=contour(u,.92);
  const seam=Math.pow(.5+.5*Math.cos(TAU*u*36),10);
  const rib=1-.075*seam;
  p.addScaledVector(n,Math.cos(angle)*.345*rib);
  p.y=.44+lift(p.x)+Math.sin(angle)*.37*rib;return p;
}
skin((u,t)=>skirtProfile(u,TAU*t),720,40,rubber);
// Fine molded ridges and the flexible black band that secures the cushion.
for(const angle of [1.17,5.66]){
  const pts=Array.from({length:140},(_,i)=>skirtProfile(i/140,angle));
  pipe(pts,.018,angle>4?rubberEdge:gasket,vessel,true);
}
for(let i=0;i<36;i++){
  const u=i/36;
  const stripe=Array.from({length:13},(_,j)=>skirtProfile(u,-1.04+j*.19));
  pipe(stripe,.014,gasket);
}
function shellRing(u,section){
  const [p,n]=contour(u,.91);p.addScaledVector(n,section[0]);p.y=section[1]+lift(p.x);return p;
}
const profile=[[-.02,.59],[.08,.61],[.13,.67],[.125,.75],[.10,.83],[.05,.92],[-.025,.97]];
const bandMats=[gasket,white,white,darkOrange,orange,orange];
for(let k=0;k<profile.length-1;k++)skin((u,t)=>shellRing(u,profile[k]).lerp(shellRing(u,profile[k+1]),t),180,3,bandMats[k]);
// White rub strip immediately above the black skirt, with a narrow vermilion accent at its lower edge.
skin((u,t)=>shellRing(u,[.115-t*.016,.805+t*.041]),200,3,white);
function deck(u,t){
  const out=shellRing(u,profile.at(-1)),inner=well.getPointAt(u);
  inner.y=1.05+.12*Math.max(0,inner.x);
  const p=out.clone().lerp(inner,t);p.y+=Math.sin(t*Math.PI)*.095;
  return p;
}
skin(deck,180,20,orange);
const innerLip=Array.from({length:110},(_,i)=>deck(i/110,1));
pipe(innerLip,.054,darkOrange,vessel,true);
skin((u,t)=>{const p=deck(u,1);p.x*=1-.2*t;p.z*=1-.18*t;p.y-=t*.46;return p;},140,6,darkTeal);
ball(0,.61,0,1.13,.09,.79,gasket);
box(-.30,.75,0,1.05,.24,1.29,.16,darkTeal);
box(-.86,1.16,0,.29,1.05,1.31,.15,darkTeal).rotation.z=.13;
box(-.89,1.59,0,.32,.25,1.12,.1,orange);
// The bow has a raised nose pad, a rub rail and two recessed headlights.
const bowCover=ball(1.89,1.09,0,.67,.13,.49,lightOrange);
for(const z of [-.21,-.07,.07,.21]){
  pipe([v(1.75,1.215,z),v(1.93,1.221,z),v(2.12,1.204,z)],.016,darkOrange);
}
for(const side of [-1,1]) {
  const s=side;
  line(v(2.1,1.08,s*.91),v(2.1,1.27,s*.91),.035,metal);
  line(v(2.72,1.10,s*.51),v(2.72,1.24,s*.51),.035,metal);
  pipe([v(1.87,1.12,s*1.02),v(2.02,1.29,s*.97),v(2.37,1.33,s*.80),v(2.72,1.25,s*.51)],.046,metal);
  const housing=box(2.47,1.016,s*.736,.36,.15,.23,.053,darkTeal);
  housing.rotation.y=s*-.49;
  const lamp=box(2.494,1.031,s*.816,.244,.088,.115,.036,material(0xffeab9,.19,.28,{emissive:0xffcf7a,emissiveIntensity:.13}));lamp.rotation.y=s*-.49;
}
// Safety handles behind the seat.
for(const s of [-1,1]) {
  pipe([v(-1.68,1.01,s*.98),v(-1.64,1.26,s*.98),v(-1.48,1.35,s*.99),v(-1.05,1.37,s*1.02),v(-.92,1.26,s*1.04),v(-.9,1.04,s*1.04)],.051,darkMetal);
  for(const x of [-1.68,-.9])ball(x,1.05,s*1.02,.11,.037,.09,metal);
}
// A working-looking ducted fan: deep orange shroud, desaturated interior, curved blades and a two-ring guard.
const fan=new T.Group();fan.position.set(-1.94,1.94,0);fan.rotation.y=1.02;fan.rotation.x=-.045;vessel.add(fan);
for(const s of [-1,1]) {
  const foot=box(-1.97,1.02,s*.55,.83,.19,.54,.06,darkOrange);
  line(v(-2.1,1.07,s*.57),v(-1.92,1.67,s*.60),.13,metal);
  line(v(-1.55,1.06,s*.6),v(-1.94,1.60,s*.63),.104,darkTeal);
}
const ring=(radius,thickness,z,mat)=>{
  const obj=mesh(new T.TorusGeometry(radius,thickness,18,96),mat,fan);obj.position.z=z;return obj;
};
const fanWall=[[-.34,.89],[-.33,.97],[-.27,1.02],[.12,1.045],[.27,1.00],[.31,.94],[.27,.875],[.17,.857],[-.19,.82],[-.34,.85]];
for(let k=0;k<fanWall.length;k++){
  const a=fanWall[k],b=fanWall[(k+1)%fanWall.length];
  skin((u,t)=>{const r=a[1]+(b[1]-a[1])*t;return v(Math.cos(u*TAU)*r,Math.sin(u*TAU)*r,a[0]+(b[0]-a[0])*t);},100,3,k<5?orange:k<7?lightOrange:darkMetal,fan);
}
ring(1.012,.019,-.18,darkOrange);ring(.879,.023,.274,metal);
for(let i=0;i<7;i++){
  const blade=skin((u,t)=>{
    const radius=.18+u*.65;
    const angle=i*TAU/7+.34*u + (t-.5)*(.65-.15*u);
    return v(radius*Math.cos(angle),radius*Math.sin(angle),-.04+.13*(t-.5)+.04*u);
  },18,8,rubberEdge,fan);
}
ring(.56,.016,.283,darkMetal);ring(.76,.018,.278,darkMetal);
for(let i=0;i<5;i++){
  const a=i*TAU/5+.14;
  line(v(Math.cos(a)*.16,Math.sin(a)*.16,.31),v(Math.cos(a)*.875,Math.sin(a)*.875,.26),.019,darkMetal,fan);
}
ball(0,0,.21,.21,.21,.16,lightOrange,fan);
ball(0,0,.34,.115,.115,.053,metal,fan);
// Windbreak curves around the helm and leaves the side of the cockpit open.
function screen(u,t) {
  const angle=(u-.5)*Math.PI*1.04;
  return v(.57+.78*Math.cos(angle)-.18*t,1.13+.64*t-.10*Math.abs(Math.sin(angle))*t,Math.sin(angle)*(.75+.045*t));
}
const pane=skin(screen,50,7,glass);pane.castShadow=false;
pipe(Array.from({length:30},(_,i)=>screen(i/29,0)),.044,darkTeal);
pipe(Array.from({length:34},(_,i)=>screen(i/33,1)),.031,metal);
for(const u of [0,1])pipe([screen(u,0),screen(u,.5),screen(u,1)],.032,metal);
box(.75,1.09,0,.46,.18,1.09,.07,darkTeal).rotation.z=.15;
line(v(.76,1.08,0),v(.52,1.23,0),.055,darkMetal);
const wheel=mesh(new T.TorusGeometry(.20,.034,10,32),rubber);
wheel.position.set(.52,1.23,0);wheel.rotation.y=Math.PI/2-.30;wheel.rotation.x=.23;
// Soft raised rubbing strips follow the deck surface along the outer side.
for (const s of [-1,1]){
  pipe([v(-.68,1.055,s*1.17),v(-.06,1.071,s*1.205),v(.66,1.08,s*1.13),v(1.02,1.081,s*1.04)],.039,sunflower);
  for(const x of [-1.35,-1.14,-.93]){
    const vent=box(x,1.045,s*1.13,.092,.041,.232,.025,gasket);vent.rotation.y=s*.24;
  }
}
// Anchor emblem pressed into the orange starboard side. Its face is parallel to the actual flank, slightly angled upward.
function sideBadge(){
  const group = new T.Group();
  group.position.set(.31,.995,1.30);group.rotation.x=-.36;group.rotation.y=.07;group.scale.setScalar(.81);vessel.add(group);
  const shape=new T.Shape();
  shape.moveTo(-.23,.18);shape.quadraticCurveTo(0,.29,.23,.18);shape.lineTo(.205,-.032);
  shape.quadraticCurveTo(.13,-.18,0,-.245);shape.quadraticCurveTo(-.14,-.18,-.205,-.032);shape.closePath();
  const base=mesh(new T.ExtrudeGeometry(shape,{depth:.025,bevelThickness:.014,bevelSize:.013,bevelSegments:3}),white,group);
  const medallion=mesh(new T.ExtrudeGeometry(shape,{depth:.012,bevelThickness:.008,bevelSize:.008,bevelSegments:3}),darkTeal,group);
  medallion.scale.set(.84,.84,1);medallion.position.z=.039;
  function badgePipe(points,r){pipe(points.map(([x,y])=>v(x,y,.069)),r,white,group);}
  badgePipe([[0,.095],[0,-.10]],.014);
  badgePipe([[-.105,-.025],[-.075,-.085],[0,-.115],[.075,-.085],[.105,-.025]],.015);
  badgePipe([[-.065,.043],[.065,.043]],.013);
  const eye=mesh(new T.TorusGeometry(.032,.009,8,18),white,group);eye.position.set(0,.111,.072);
}
sideBadge();
// Keep the supplied pup silhouette/color unchanged. The lower part falls inside the well and is hidden by its real geometry.
const dogImage=await new T.ImageLoader().loadAsync('/dog.webp');
const dogCanvas=document.createElement('canvas');dogCanvas.width=dogImage.width;dogCanvas.height=dogImage.height;
const dogCtx=dogCanvas.getContext('2d');dogCtx.drawImage(dogImage,0,0);
dogCtx.globalCompositeOperation='destination-in';
const mask=dogCtx.createLinearGradient(0,0,0,416);mask.addColorStop(0,'white');mask.addColorStop(.72,'white');mask.addColorStop(.765,'transparent');mask.addColorStop(1,'transparent');dogCtx.fillStyle=mask;dogCtx.fillRect(0,0,416,416);
const texture=new T.CanvasTexture(dogCanvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=8;
const pilot=mesh(new T.PlaneGeometry(3.55,3.55),new T.MeshBasicMaterial({map:texture,transparent:true,alphaTest:.035,toneMapped:false,depthWrite:true}));
pilot.position.set(-.35,1.66,.02);pilot.quaternion.copy(camera.quaternion);pilot.renderOrder=1;pilot.castShadow=false;pilot.receiveShadow=false;
// Draw the pilot after opaque objects; the turquoise pane still blends in front where the cockpit actually overlaps.
pane.renderOrder=3;
renderer.render(scene,camera);
const flat=document.createElement('canvas');flat.width=2160;flat.height=1600;
const flatCtx=flat.getContext('2d',{willReadFrequently:true});flatCtx.drawImage(renderer.domElement,0,0);
const {data}=flatCtx.getImageData(0,0,flat.width,flat.height);
let left=flat.width,right=0,top=flat.height,bottom=0;
for(let j=0;j<flat.height;j++)for(let i=0;i<flat.width;i++){
  if(data[(j*flat.width+i)*4+3]>10){left=Math.min(left,i);right=Math.max(right,i);top=Math.min(top,j);bottom=Math.max(bottom,j);}
}
const output=document.createElement('canvas');output.width=1200;output.height=850;
const ctx=output.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
const w=right-left+1,h=bottom-top+1,scale=Math.min(1150/w,815/h);
ctx.drawImage(flat,left,top,w,h,(1200-w*scale)/2,(850-h*scale)/2,w*scale,h*scale);
window.bakedImage=output.toDataURL('image/webp',.97);
