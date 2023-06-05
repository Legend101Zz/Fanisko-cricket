import * as THREE from "three";
import * as ZapparThree from "@zappar/zappar-threejs";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { scoreMeshData } from "./js/data.js";

let _runStore = [];
// let scene, camera;

let texLoader = new THREE.TextureLoader();
const model = new URL("../public/models/Stadium/Cricket.glb", import.meta.url)
  .href;
$(document).ready(() => {
  if (ZapparThree.browserIncompatible()) {
    ZapparThree.browserIncompatibleUI();
    throw new Error("Unsupported browser");
  }
  const manager = new ZapparThree.LoadingManager();
  const canvas = document.querySelector("canvas");
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
  });
  const scene = new THREE.Scene();
  const camera = new ZapparThree.Camera();
  ZapparThree.permissionRequestUI().then((granted) => {
    if (granted) camera.start();
    else ZapparThree.permissionDeniedUI();
  });

  ZapparThree.glContextSet(renderer.getContext());
  scene.background = camera.backgroundTexture;
  const instantTracker = new ZapparThree.InstantWorldTracker();
  const instantTrackerGroup = new ZapparThree.InstantWorldAnchorGroup(
    camera,
    instantTracker
  );
  scene.add(instantTrackerGroup);
  const arrowHelper = new THREE.ArrowHelper(
    new THREE.Vector3(),
    new THREE.Vector3(),
    0.25,
    0xffff00
  );
  instantTrackerGroup.add(arrowHelper);

  scoreMeshData.map((data) => {
    let material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
    });
    const geometry = new THREE.PlaneGeometry(data.scaleX, data.scaleY);
    let planeScore = new THREE.Mesh(geometry, material);
    // scene.add(planeScore)
    instantTrackerGroup.add(planeScore);
    planeScore.name = "score_" + data.name;
    planeScore.position.set(data.x, data.y, data.z);
    planeScore.rotation.set(0, Math.PI / 2, 0);
    planeScore.visible = false;
  });
  const gltfLoader = new GLTFLoader(manager);
  //   gltfLoader.load(
  //     model,
  //     (gltf) => {
  //       let mesh = gltf.scene;
  //       mesh.traverse((child) => {
  //         if (child.type === "Mesh") {
  //           if (child.name === "playerImage") {
  //             child.material = new THREE.MeshBasicMaterial({
  //               // map:texLoader.load('tex/1234.png'),
  //               transparent: true,
  //               opacity: 0,
  //               depthTest: false,
  //               combine: THREE.MixOperation,
  //               side: THREE.DoubleSide,
  //             });
  //             child.visible = false;
  //           }
  //         }
  //       });
  //       //   gltf.scene.scale.set(0.1, 0.1, 0.1);
  //       //    gltf.scene.position.y = -1;
  //       //    instantTrackerGroup.add(gltf.scene);
  //       mesh.scale.set(0.1, 0.1, 0.1);
  //       mesh.position.set(0, -1, 0);
  //       instantTrackerGroup.add(mesh);
  //     },
  //     (xhr) => {
  //       console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  //     },
  //     (err) => {
  //       console.log("An error ocurred loading the GLTF model", err);
  //     }
  //   );

  gltfLoader.load(
    model,
    (gltf) => {
      console.log(gltf);
      gltf.scene.scale.set(0.08, 0.08, 0.08);
      gltf.scene.position.y = -1;
      gltf.scene.position.z = -3;
      // Now the model has been loaded, we can add it to our instant_tracker_group
      instantTrackerGroup.add(gltf.scene);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (err) => {
      console.log("An error ocurred loading the GLTF model", err);
    }
  );
  const onWindowResize = () => {
    camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    camera._updateProjectionMatrix();
  };

  // Let's add some lighting, first a directional light above the model pointing down
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 5, 0);
  directionalLight.lookAt(0, 0, 0);
  instantTrackerGroup.add(directionalLight);

  // And then a little ambient light to brighten the model up a bit
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  instantTrackerGroup.add(ambientLight);
  camera.position.set(0, 10, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  let hasPlaced = false;
  const placeButton =
    document.getElementById("tap-to-place") || document.createElement("div");
  placeButton.addEventListener("click", () => {
    hasPlaced = true;
    placeButton.remove();
  });
  function render() {
    if (!hasPlaced) {
      instantTrackerGroup.setAnchorPoseFromCameraOffset(0, 0, 0);
    }
    // onWindowResize();
    camera.updateFrame(renderer);
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  // Start things off
  render();
  window.addEventListener("resize", onWindowResize, false);
});

export const wagonWheel = (data) => {
  _runStore.map((data) => {
    let _G = scene.getObjectByName(data.name);
    scene.remove(_G);
  });
  _runStore = [];
  data.balls_details.map((data) => {
    let _N, color;
    if (data.runsBat === 1) {
      _N = "Ones";
      color = "0xfafafa";
    } else if (data.runsBat === 2) {
      _N = "Twos";
      color = "0xf4ff80";
    } else if (data.runsBat === 3) {
      _N = "Three";
      color = "0x87911c";
    } else if (data.runsBat === 4) {
      _N = "Four";
      color = "0x0f7df2";
    } else if (data.runsBat === 6) {
      _N = "Six";
      color = "0xfc0303";
    }
    let _Wx = data.battingAnalysis.shots.wagonWheel.x;
    let _Wy = data.battingAnalysis.shots.wagonWheel.y;
    drawWagonWheels(_Wx, _Wy, color, _N);
  });
};
export const displayLines = (data) => {
  if (data !== "all") {
    let _P = "WagonWheels_" + data;
    _runStore.map((data) => {
      data.name === _P ? (data.visible = true) : (data.visible = false);
    });
  } else {
    _runStore.map((data) => {
      data.visible = true;
    });
  }
};

function drawWagonWheels(xVal, yVal, color, name) {
  var numPoints = 100;
  var start = new THREE.Vector3(50, 0, -43.5);
  // var middle = new THREE.Vector3(38, 0,-50);
  var middle = new THREE.Vector3(38, 0, -55);
  var end = new THREE.Vector3(yVal, 0, -xVal);

  var curveQuad = new THREE.QuadraticBezierCurve3(start, middle, end);

  var tube = new THREE.TubeGeometry(curveQuad, numPoints, 1, 50, false);
  var mesh = new THREE.Mesh(
    tube,
    new THREE.MeshPhongMaterial({
      side: THREE.DoubleSide,
    })
  );
  scene.add(mesh);
  mesh.position.set(0, 10, 0);
  mesh.name = "WagonWheels_" + name;
  mesh.material.color.setHex(color);
  _runStore.push(mesh);
}
export const displayRunMesh = (data) => {
  let _displayPlayerMesh = scene.getObjectByName("playerImage");
  _displayPlayerMesh.material.map = texLoader.load(data.player_image);
  _displayPlayerMesh.needsUpdate = true;
  _displayPlayerMesh.visible = true;
  scoreDisplay(data, "runball", 30, 150, 300);
  scoreDisplay(data, "runs", 35, 150, 300);
  scoreDisplay(data, "sixes", 40, 100, 200);
  scoreDisplay(data, "fours", 40, 100, 200);
  scoreDisplay(data, "profile", 30, 100, 200);
};

var PIXEL_RATIO = (function () {
  var ctx = document.createElement("canvas").getContext("2d"),
    dpr = window.devicePixelRatio || 1,
    bsr =
      ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio ||
      1;
  return dpr / bsr;
})();

let createRetinaCanvas = function (w, h, ratio) {
  if (!ratio) {
    ratio = PIXEL_RATIO;
  }
  var can = document.createElement("canvas");
  can.width = w * ratio;
  can.height = h * ratio;
  can.style.width = w + "px";
  can.style.height = h + "px";
  can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
  return can;
};

function scoreDisplay(data, name, size, right, rightCan) {
  let text;
  if (name === "runball") {
    text = data.runs + " RUNS" + " (" + data.balls + "balls)";
  } else if (name === "runs") {
    text =
      "1s- " +
      data.run_details[1] +
      ", 2s- " +
      data.run_details[2] +
      ", 3s- " +
      data.run_details[3];
  } else if (name === "fours") {
    text = "4s- " + data.run_details[4];
  } else if (name === "sixes") {
    text = "6s- " + data.run_details[6];
  } else if (name === "profile") {
    text = data.name;
  }
  //create image
  var bitmap = createRetinaCanvas(rightCan, 65); //300 ,65
  var ctx = bitmap.getContext("2d", { antialias: false });
  ctx.font = "Bold " + size + "px Arial, sans-serif"; //50 for six

  ctx.beginPath();
  // ctx.rect(0, 0, 300, 65);
  // ctx.fillStyle = 'rgba(255,255,255,.3)'
  // ctx.fill();
  // To change the color on the rectangle, just manipulate the context
  ctx.strokeStyle = "rgb(255, 255, 255)";
  ctx.lineWidth = 3;
  ctx.fillStyle = "rgba(255,255,255, .3)";
  ctx.beginPath();
  ctx.roundRect(0, 5, 400, 58, 10);
  ctx.stroke();
  ctx.fill();
  ctx.fillStyle = "blue";
  ctx.textAlign = "center";
  ctx.fillText(text, right, 45); //150 ,40
  var texture = new THREE.Texture(bitmap);
  texture.needsUpdate = true;
  let _SM = scene.getObjectByName("score_" + name);
  _SM.material.map = texture;
  _SM.visible = true;
}
