import * as THREE from 'three';
import SelfOrganizingMap from './Neural Networks/selfOrganizingMap.ts';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { attachTouchControls } from './utils/touchControls';

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: PointerLockControls;
let clock: THREE.Clock;
let animationId: number | null = null;
let keyboard: any;
let nn: SelfOrganizingMap | null = null;

export function init(container: HTMLElement) {
  scene = new THREE.Scene();

  const width  = container.clientWidth  || container.parentElement?.clientWidth  || window.innerWidth;
  const height = container.clientHeight || container.parentElement?.clientHeight || Math.max(500, Math.floor(width * 0.6));

  camera = new THREE.PerspectiveCamera(100, width / height, 0.1, 1000);
  camera.position.y = 2.5;
  camera.position.x = 10;
  camera.position.z = 125;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  // Touch controls (swipe=pan, two‑finger swipe=look around, pinch=zoom)
  const detachTouch = attachTouchControls(renderer.domElement, camera, {
    panScale: 0.25,
    zoomScale: 0.15,
    rotationScale: 0.004,
  });

  // Pass container so GUI mounts inside it
  nn = new SelfOrganizingMap(scene);

  controls = new PointerLockControls(camera, renderer.domElement);
  clock = new THREE.Clock();
  keyboard = new (window as any).THREEx.KeyboardState();

  const handleResize = () => {
    const w = container.clientWidth  || window.innerWidth;
    const h = container.clientHeight || Math.max(500, Math.floor(w * 0.6));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', handleResize);

  const toggleMouseFromCamera = (e: KeyboardEvent) => {
    if (e.key === ' ') {
      e.preventDefault();
      controls.isLocked ? controls.unlock() : controls.lock();
    }
  };
  window.addEventListener('keydown', toggleMouseFromCamera, false);

  const render = () => { renderer.clear(); renderer.render(scene, camera); };

  const animate = () => {
    animationId = requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const move = 75 * delta;
    if (keyboard.pressed('W')) camera.translateZ(-move);
    if (keyboard.pressed('S')) camera.translateZ( move);
    if (keyboard.pressed('A')) camera.translateX(-move);
    if (keyboard.pressed('D')) camera.translateX( move);
    render();
  };

  const cleanup = () => {
    if (animationId) cancelAnimationFrame(animationId);
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('keydown', toggleMouseFromCamera);
    detachTouch(); // remove touch listeners
    controls.dispose();
    renderer.dispose();

    //Exitting loops etc... neural net clean up
    if (nn) {
      nn.dispose();
      nn = null;
    }
    console.log('[NN] index-wrapper cleanup complete');
  };

  return { scene, camera, renderer, animate, cleanup };
}

export function cleanup() {}