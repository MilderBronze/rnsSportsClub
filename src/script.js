import "./style.css";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as THREE from "three";
import gsap from "gsap";
const bumpTexture = new THREE.TextureLoader().load("textures/earthbump.jpg");
const mapTexture = new THREE.TextureLoader().load("./textures/earthmap1k.jpg");
const cloudTexture = new THREE.TextureLoader().load("textures/earthCloud.png");
const galaxyTexture = new THREE.TextureLoader().load("textures/galaxy.png");
const canvas = document.querySelector(".webgl");
const scene = new THREE.Scene();

var words = ["HAPPY", "World ENVIRONMENT Day!"],
  part,
  i = 0,
  offset = 0,
  len = words.length,
  forwards = true,
  skip_count = 0,
  skip_delay = 15,
  speed = 70;
var wordflick = function () {
  setInterval(function () {
    if (forwards) {
      if (offset >= words[i].length) {
        ++skip_count;
        if (skip_count == skip_delay) {
          forwards = false;
          skip_count = 0;
        }
      }
    } else {
      if (offset == 0) {
        forwards = true;
        i++;
        offset = 0;
        if (i >= len) {
          i = 0;
        }
      }
    }
    part = words[i].substr(0, offset);
    if (skip_count == 0) {
      if (forwards) {
        offset++;
      } else {
        offset--;
      }
    }
    $("h2").text(part);
  }, speed);
};

$(document).ready(function () {
  wordflick();
});

const track = document.getElementById("image-track");

const handleOnDown = (e) => (track.dataset.mouseDownAt = e.clientX);

const handleOnUp = () => {
  track.dataset.mouseDownAt = "0";
  track.dataset.prevPercentage = track.dataset.percentage;
};

const handleOnMove = (e) => {
  if (track.dataset.mouseDownAt === "0") return;

  const mouseDelta = parseFloat(track.dataset.mouseDownAt) - e.clientX,
    maxDelta = window.innerWidth / 2;

  const percentage = (mouseDelta / maxDelta) * -100,
    nextPercentageUnconstrained =
      parseFloat(track.dataset.prevPercentage) + percentage,
    nextPercentage = Math.max(Math.min(nextPercentageUnconstrained, 0), -100);

  track.dataset.percentage = nextPercentage;

  track.animate(
    {
      transform: `translate(${nextPercentage}%, 0%)`,
    },
    { duration: 1200, fill: "forwards" }
  );

  for (const image of track.getElementsByClassName("image")) {
    image.animate(
      {
        objectPosition: `${100 + nextPercentage}% center`,
      },
      { duration: 1200, fill: "forwards" }
    );
  }
};

/* -- Had to add extra lines for touch events -- */

window.onmousedown = (e) => handleOnDown(e);

window.ontouchstart = (e) => handleOnDown(e.touches[0]);

window.onmouseup = (e) => handleOnUp(e);

window.ontouchend = (e) => handleOnUp(e.touches[0]);

window.onmousemove = (e) => handleOnMove(e);

window.ontouchmove = (e) => handleOnMove(e.touches[0]);
/**
 * cursor
 */
const cursor = {
  x: 0,
  y: 0,
};

const scriptURL =
  "https://script.google.com/macros/s/AKfycbwnUKKa5pwpiZtwDe6BMFo3baEaZ5XFpMN4hhVvQRuxIJUExoWLOpdsGYjuOMaaQL72/exec";
const form = document.forms["submit-to-google-sheet"];
const msg = document.getElementById("msg");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  fetch(scriptURL, { method: "POST", body: new FormData(form) })
    .then((response) => {
      msg.innerHTML = "Message has been sent successfully";
      setTimeout(function () {
        msg.innerHTML = "";
      }, 5000);
      form.reset();
    })
    .catch((error) => console.error("Error!", error.message));
});

// mouse move event
window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
});

/**
 * sizes
 */

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

$(function () {
  $(document).scroll(function () {
    var $nav = $("nav");
    $nav.toggleClass("scrolled", $(this).scrollTop() > $nav.height());
  });
});

/**
 * earth geometry
 */

const earthgeometry = new THREE.SphereGeometry(0.6, 32, 32);

const earthmaterial = new THREE.MeshPhongMaterial({
  map: mapTexture,
  bumpMap: bumpTexture,
  bumpScale: 0.3,
});

const earthmesh = new THREE.Mesh(earthgeometry, earthmaterial);
scene.add(earthmesh);

// set ambientlight

const ambientlight = new THREE.AmbientLight(0xffffff, 0);
scene.add(ambientlight);

// set point light

const pointerlight = new THREE.PointLight(0xffffff, 0.9);

// set light position

pointerlight.position.set(5, 3, 5);
scene.add(pointerlight);

// cloud
const cloudgeometry = new THREE.SphereGeometry(0.63, 32, 32);

const cloudmaterial = new THREE.MeshPhongMaterial({
  map: cloudTexture,
  transparent: true,
});

const cloudmesh = new THREE.Mesh(cloudgeometry, cloudmaterial);
scene.add(cloudmesh);

// star

const stargeometry = new THREE.SphereGeometry(80, 64, 64);

const starmaterial = new THREE.MeshBasicMaterial({
  map: galaxyTexture,
  side: THREE.BackSide,
});

const starmesh = new THREE.Mesh(stargeometry, starmaterial);

scene.add(starmesh);

const group = new THREE.Group();
group.add(earthmesh, cloudmesh);
scene.add(group);
group.position.x = -0.7;
group.position.y = -0.15;
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 2;
scene.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Animate
 */

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  earthmesh.rotation.y -= 0.0015;
  cloudmesh.rotation.y += 0.0015;
  starmesh.rotation.y += 0.0005;
  group.rotation.y += 0.001;
  group.rotation.x += 0.001;
  gsap.to(group.rotation, {
    x: cursor.y * 0.3,
    y: cursor.x * 0.5,
    duration: 2,
  });
}
animate();

addEventListener("mousemove", () => {
  cursor.x = (event.clientX / innerWidth) * 2 - 1;
  cursor.y = (event.clientY / innerHeight) * 2 + 1;
});
