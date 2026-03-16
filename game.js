let scene = new THREE.Scene()
scene.background = new THREE.Color(0x87CEEB)

let camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000)

let renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth,window.innerHeight)
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement)

let light = new THREE.DirectionalLight(0xffffff,1)
light.position.set(10,20,10)
light.castShadow=true
scene.add(light)

let ambient = new THREE.AmbientLight(0xaaaaaa)
scene.add(ambient)

let floorGeo = new THREE.PlaneGeometry(500,500)
let floorMat = new THREE.MeshStandardMaterial({color:0x3cb043})
let floor = new THREE.Mesh(floorGeo,floorMat)
floor.rotation.x=-Math.PI/2
floor.receiveShadow=true
scene.add(floor)

let bullets=[]
let enemies=[]

let score=0
let health=100

let gravity=-0.05
let playerVelocityY=0
let groundHeight=2

camera.position.y=2

let moveForward=false
let moveBackward=false
let moveLeft=false
let moveRight=false

document.addEventListener("click",()=>{
document.body.requestPointerLock()
})

let pitch=0

document.addEventListener("mousemove",(e)=>{

if(document.pointerLockElement===document.body){

camera.rotation.y -= e.movementX*0.002

pitch -= e.movementY*0.002
pitch=Math.max(-1.5,Math.min(1.5,pitch))

camera.rotation.x=pitch

}

})

document.addEventListener("keydown",(e)=>{

if(e.code==="KeyW") moveForward=true
if(e.code==="KeyS") moveBackward=true
if(e.code==="KeyA") moveLeft=true
if(e.code==="KeyD") moveRight=true

if(e.code==="Space" && camera.position.y<=groundHeight+0.1){
playerVelocityY=0.8
}

})

document.addEventListener("keyup",(e)=>{

if(e.code==="KeyW") moveForward=false
if(e.code==="KeyS") moveBackward=false
if(e.code==="KeyA") moveLeft=false
if(e.code==="KeyD") moveRight=false

})

document.addEventListener("mousedown",shoot)

let currentWeapon = "pistol"; // L'arma predefinita è la pistola

document.addEventListener("mousedown", shoot);

function shoot() {
    let geo, mat;

    // Se l'arma è la pistola
    if (currentWeapon === "pistol") {
        geo = new THREE.SphereGeometry(0.2);
        mat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    } 
    // Se l'arma è il fucile
    else if (currentWeapon === "rifle") {
        geo = new THREE.SphereGeometry(0.1);
        mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    }

    let bullet = new THREE.Mesh(geo, mat);
    bullet.position.copy(camera.position);
    bullet.direction = new THREE.Vector3(0, 0, -1);
    bullet.direction.applyQuaternion(camera.quaternion);
    scene.add(bullet);
    bullets.push(bullet);
}

document.addEventListener("keydown", (e) => {
    if (e.code === "Digit1") {
        currentWeapon = "pistol"; // Cambia a pistola
    }
    if (e.code === "Digit2") {
        currentWeapon = "rifle"; // Cambia a fucile
    }
});

function spawnEnemy() {
    let geo = new THREE.SphereGeometry(2, 16, 16); // Crea una sfera
    let mat = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Colore verde (per zombie)
    let enemy = new THREE.Mesh(geo, mat);
    enemy.position.x = (Math.random() - 0.5) * 100;
    enemy.position.z = (Math.random() - 0.5) * 100;
    enemy.position.y = 0;
    scene.add(enemy);
    enemies.push(enemy);
}

setInterval(spawnEnemy,4000)

function createTree(x,z){

let trunkGeo=new THREE.CylinderGeometry(0.3,0.3,3)
let trunkMat=new THREE.MeshStandardMaterial({color:0x8b4513})
let trunk=new THREE.Mesh(trunkGeo,trunkMat)

trunk.position.set(x,1.5,z)
scene.add(trunk)

let leavesGeo=new THREE.SphereGeometry(2)
let leavesMat=new THREE.MeshStandardMaterial({color:0x228b22})
let leaves=new THREE.Mesh(leavesGeo,leavesMat)

leaves.position.set(x,4,z)
scene.add(leaves)

}

createTree(20,20)
createTree(-15,10)
createTree(5,-20)
createTree(-25,-15)

let gunGeo=new THREE.BoxGeometry(0.3,0.3,1)
let gunMat=new THREE.MeshStandardMaterial({color:0x222222})
let gun=new THREE.Mesh(gunGeo,gunMat)

gun.position.set(0.5,-0.5,-1)

camera.add(gun)
scene.add(camera)

function animate(){

requestAnimationFrame(animate)

let speed=0.2

if(moveForward) camera.translateZ(-speed)
if(moveBackward) camera.translateZ(speed)
if(moveLeft) camera.translateX(-speed)
if(moveRight) camera.translateX(speed)

playerVelocityY+=gravity
camera.position.y+=playerVelocityY

if(camera.position.y<groundHeight){
camera.position.y=groundHeight
playerVelocityY=0
}

bullets.forEach((b,i)=>{

b.position.add(b.direction.clone().multiplyScalar(1))

if(b.position.length()>200){
scene.remove(b)
bullets.splice(i,1)
}

})

enemies.forEach((e,ei)=>{

e.lookAt(camera.position)
e.translateZ(0.05)

if(e.position.distanceTo(camera.position)<2){

health-=1
document.getElementById("health").innerText=health

if(health <= 0){

document.getElementById("gameover").style.display="flex"

document.exitPointerLock()

}

}

bullets.forEach((b,bi)=>{

if(e.position.distanceTo(b.position)<1.5){

scene.remove(e)
scene.remove(b)

enemies.splice(ei,1)
bullets.splice(bi,1)

score++
document.getElementById("score").innerText=score

}

})

})

renderer.render(scene,camera)

}

function startGame(){
document.getElementById("menu").style.display="none"
}

animate()
