import * as THREE from 'three';
import * as ZapparThree from '@zappar/zappar-threejs';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {scoreMeshData} from './js/data.js';

const gltfpath = new URL("../public/models/cricket_stadium.glb", import.meta.url).href;
let init, modelLoad;
let texLoader = new THREE.TextureLoader();

let _runStore = [];
$(document).ready(()=>{
    let detect = detectWebGL();
    if (detect == 1) {
        init = new sceneSetup(70, 1, 1000, 70, 150, 70);//100,100,50
        modelLoad = new objLoad();
        modelLoad.Model();
    //    drawWagonWheels();
           //FOR SCORE MESH LOADING
        scoreMeshData.map((data)=>{
            let material = new THREE.MeshBasicMaterial({ transparent: true ,opacity:1,side:THREE.DoubleSide });
            const geometry = new THREE.PlaneGeometry( data.scaleX, data.scaleY );
            let planeScore = new THREE.Mesh(geometry, material);        
            init.scene.add(planeScore)
            planeScore.name ="score_" + data.name;
            planeScore.position.set(data.x,data.y,data.z);
            planeScore.rotation.set(0,Math.PI/2,0);
            planeScore.visible=false;
         }); 
        //   modelLoad.groundRef();
    }else if (detect == 0) {
        alert("PLEASE ENABLE WEBGL IN YOUR BROWSER....");
    } else if (detect == -1) {
        alert(detect);
        alert("YOUR BROWSER DOESNT SUPPORT WEBGL.....");
    }
});
function drawWagonWheels(xVal,yVal,color,name){
    var numPoints = 100;
    var start = new THREE.Vector3(50, 0, -43.5);
    // var middle = new THREE.Vector3(38, 0,-50);
    var middle = new THREE.Vector3(38, 0,-55);
    var end = new THREE.Vector3(yVal, 0, -xVal);

    var curveQuad = new THREE.QuadraticBezierCurve3(start, middle, end);

    var tube = new THREE.TubeGeometry(curveQuad, numPoints, .45, 50, false);
    var mesh = new THREE.Mesh(tube, new THREE.MeshPhongMaterial({
        side:THREE.DoubleSide
    }));
    init.scene.add(mesh);
    mesh.position.set(0,10,0);
    mesh.name = "WagonWheels_" + name;
    mesh.material.color.setHex(color);
    _runStore.push(mesh);        
}

    
var PIXEL_RATIO = (function () {
var ctx = document.createElement('canvas').getContext('2d'),
    dpr = window.devicePixelRatio || 1,
    bsr = ctx.webkitBackingStorePixelRatio ||
          ctx.mozBackingStorePixelRatio ||
          ctx.msBackingStorePixelRatio ||
          ctx.oBackingStorePixelRatio ||
          ctx.backingStorePixelRatio || 1;
    return dpr / bsr;
})();


let createRetinaCanvas = function(w, h, ratio) {
    if (!ratio) { ratio = PIXEL_RATIO; }
    let can = document.createElement('canvas');
    can.width = w * ratio;
    can.height = h * ratio;
    can.style.width = w + 'px';
    can.style.height = h + 'px';
    can.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
    return can;
}

function scoreDisplay(data,name,size,right,rightCan) {
    let text;
    if(name === 'runball'){
        text = data.runs + ' RUNS' + ' ('+ data.balls+'balls)'
    }else if(name === 'runs'){
        text = '1s- '+data.run_details[1]+', 2s- '+data.run_details[2]+', 3s- '+data.run_details[3];
    }else if(name === 'fours'){
        text = '4s- '+data.run_details[4];
    }else if(name === 'sixes'){
        text = '6s- '+data.run_details[6];
    }else if(name === "profile"){
        text = data.name;
    }
    //create image
    let bitmap = createRetinaCanvas(rightCan, 65);//300 ,65
        ctx = bitmap.getContext('2d', {antialias: false});
        ctx.font = 'Bold '+size+'px Arial, sans-serif';//50 for six
        ctx.beginPath();
    // To change the color on the rectangle, just manipulate the context
        ctx.strokeStyle = "rgb(255, 255, 255)";
        ctx.lineWidth = 3;
        ctx.fillStyle = "rgba(255,255,255, .3)";
        ctx.beginPath();
        ctx.roundRect(0, 5, 400, 58, 10);
        ctx.stroke();
        ctx.fill();
        
        ctx.fillStyle = 'blue';
        ctx.textAlign = "center";
        ctx.fillText(text, right, 45); //150 ,40

    let texture = new THREE.Texture(bitmap) 
        texture.needsUpdate = true;
    let _SM = init.scene.getObjectByName('score_' + name);
        _SM.material.map = texture;
        _SM.visible = true;
}
export const displayRunMesh = (data) => {
    let _displayPlayerMesh = init.scene.getObjectByName('playerImage');
        _displayPlayerMesh.material.map = texLoader.load(data.player_image);
        _displayPlayerMesh.needsUpdate = true;
        _displayPlayerMesh.visible = true;
    scoreDisplay(data,"runball",30,150,300);
    scoreDisplay(data,"runs",35,150,300);
    scoreDisplay(data,"sixes",40,100,200);
    scoreDisplay(data,"fours",40,100,200);
    scoreDisplay(data,"profile",30,100,200);
}

function detectWebGL() {
// Check for the WebGL rendering context
    if (!!window.WebGLRenderingContext) {
        let canvas = document.createElement("canvas"),
        names = ["webgl", "experimental-webgl", "moz-webgl", "webkit-3d"],
        context = false;

    for (var i in names) {
        try {
            context = canvas.getContext(names[i]);
            if (context && typeof context.getParameter === "function") {
                // WebGL is enabled.
                return 1;
            }
        } catch (e) { }
    }

    // WebGL is supported, but disabled.
    return 0;
}

// WebGL not supported.
    return -1;
};

let material = {
cube: new THREE.MeshLambertMaterial({
    //   map:THREE.ImageUtils.loadTexture("assets/Road texture.png"),
    color: 0x000000,
    combine: THREE.MixOperation,
    side: THREE.DoubleSide
}),
}
class sceneSetup {
    constructor(FOV, near, far, x, y, z, ambientColor) {
        this.container = document.getElementById("canvas");
        this.scene = new THREE.Scene();
        this.addingCube();
        this.camera(FOV, near, far, x, y, z);
        this.ambientLight(ambientColor);
        this.render();
}
camera(FOV, near, far, x, y, z) {
        this.cameraMain = new THREE.PerspectiveCamera(FOV, this.container.offsetWidth / this.container.offsetHeight, near, far);
        this.cameraMain.position.set(x, y, z);
        // this.cameraMain.lookAt(this.camPoint);
        this.cameraMain.lookAt(0, 0, 0);
        this.scene.add(this.cameraMain);
        this.rendering();
}
rendering() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true ,alpha:true});
        this.renderer.setClearColor(0x000000,0);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.container.appendChild(this.renderer.domElement);
        this.controls = new OrbitControls(this.cameraMain, this.renderer.domElement);
        this.controls.target = new THREE.Vector3(50,50,-43.5);//50,0,-43.5
        // this.controls.minDistance = 100;
        // this.controls.maxDistance = 300;
        // this.controls.maxPolarAngle = Math.PI / 2 * 115 / 120;
        // this.controls.minPolarAngle = 140 / 120;
        // this.controls.minAzimuthAngle = -280 / 120;
        // this.controls.maxAzimuthAngle = -115 / 120;
}
addingCube() {
        this.geo = new THREE.BoxBufferGeometry(2, 2, 2);
        this.mat = material.cube;
        this.camPoint = new THREE.Mesh(this.geo, this.mat);
        this.scene.add(this.camPoint);
        this.camPoint.position.set(100, 0, -24);
        this.axesHelper = new THREE.AxesHelper( 15 );
        this.scene.add( this.axesHelper );
}
ambientLight(ambientColor) {
        this.ambiLight = new THREE.AmbientLight(0xffffff);
        this.light = new THREE.HemisphereLight(0xd1d1d1, 0x080820, 1);
        this.scene.add(this.ambiLight);
}
animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.controls.update();
        this.renderer.render(this.scene, this.cameraMain);
}
render() {
        this.animate();
}
}

const onWindowResize=()=> {
        init.cameraMain.aspect = init.container.offsetWidth / init.container.offsetHeight;
        init.renderer.setSize(init.container.offsetWidth, init.container.offsetHeight);
        init.cameraMain.updateProjectionMatrix();
}

window.addEventListener('resize', onWindowResize, false);


class objLoad {
    constructor() {

    }

    Model() {
        this.loader = new GLTFLoader();
        this.loader.load(gltfpath, gltf => {            
            this.mesh = gltf.scene;
            this.mesh.traverse((child)=>{
                if(child.type ==='Mesh'){
                    if(child.name === 'playerImage'){
                        child.material = new THREE.MeshBasicMaterial({
                         // map:texLoader.load('tex/1234.png'),
                            transparent:true,
                            opacity:1,
                            depthTest: false,
                            combine: THREE.MixOperation,
                            side: THREE.DoubleSide
                        })
                        child.visible = false;
                 }
                }               
            }) 
            this.mesh.scale.set(11.5, 11.5, 11.5);
            init.scene.add(this.mesh);
        });
    }
groundRef(){
        this.loader = new GLTFLoader();
        this.loader.load('assets/groundRef.glb', gltf => {            
            this.mesh = gltf.scene;
            this.mesh.scale.set(11.5, 11.5, 11.5);
            init.scene.add(this.mesh);
        });
    }
}

export const wagonWheel = (data) => {
    _runStore.map((data)=>{
        let _G = init.scene.getObjectByName(data.name);
        init.scene.remove(_G);
});
    _runStore=[];
        data.balls_details.map((data)=>{
            let _N,color;
            if(data.runsBat === 1){_N = "Ones";color = "0xfafafa"}
            else if(data.runsBat === 2){_N = "Twos";color = "0xf4ff80"}
            else if(data.runsBat === 3){_N = "Three";color = "0x87911c"}
            else if(data.runsBat === 4){_N = "Four";color = "0x0f7df2"}
            else if(data.runsBat === 6){_N = "Six";color = "0xfc0303"}
        let _Wx = data.battingAnalysis.shots.wagonWheel.x;
        let _Wy = data.battingAnalysis.shots.wagonWheel.y;
            drawWagonWheels(_Wx,_Wy,color,_N);
        });    
    }
export const displayLines = (data) =>{
    if(data !== "all"){
        let _P = "WagonWheels_"+data;
        _runStore.map((data)=>{
            (data.name === _P) ? data.visible = true:data.visible=false;
        })
    }else{
        _runStore.map((data)=>{
            data.visible=true;
        })
    }
}

