// src/projects/threeJsNNVisualizer/src/utils/touchControls.ts
import * as THREE from 'three';

export interface TouchControlsOptions {
  panScale?: number;   // how fast X/Y pans per pixel moved
  zoomScale?: number;  // how fast Z changes per pixel of pinch delta
}

export function attachTouchControls(
  element: HTMLElement,
  camera: THREE.PerspectiveCamera,
  opts: TouchControlsOptions = {}
) {
  const panScale  = opts.panScale  ?? 0.06;
  const zoomScale = opts.zoomScale ?? 0.05;

  element.style.touchAction = 'none';
  const isTouch = 'ontouchstart' in window || (navigator as any).maxTouchPoints > 0;

  let panning = false, pinching = false;
  let lastX = 0, lastY = 0, lastDist = 0;

  const getDist = (e: TouchEvent) => {
    const a = e.touches[0], b = e.touches[1];
    const dx = a.clientX - b.clientX, dy = a.clientY - b.clientY;
    return Math.hypot(dx, dy);
  };

  const onTouchStart = (e: TouchEvent) => {
    if (!isTouch) return;
    e.preventDefault();
    if (e.touches.length >= 2) {
      pinching = true; panning = false;
      lastDist = getDist(e);
    } else if (e.touches.length === 1) {
      panning = true; pinching = false;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    }
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!isTouch) return;
    e.preventDefault();
    if (pinching && e.touches.length >= 2) {
      const dist = getDist(e);
      const delta = dist - lastDist;
      lastDist = dist;
      camera.translateZ(-delta * zoomScale);     // pinch out -> move forward
    } else if (panning && e.touches.length === 1) {
      const x = e.touches[0].clientX, y = e.touches[0].clientY;
      const dx = x - lastX, dy = y - lastY;
      lastX = x; lastY = y;
      camera.position.x -= dx * panScale;        // left/right
      camera.position.y += dy * panScale;        // up/down
    }
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (!isTouch) return;
    if (e.touches.length === 0) {
      panning = false; pinching = false; lastX = lastY = lastDist = 0;
    } else if (e.touches.length === 1) {
      pinching = false; panning = true;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    }
  };

  element.addEventListener('touchstart', onTouchStart, { passive: false });
  element.addEventListener('touchmove',  onTouchMove,  { passive: false });
  element.addEventListener('touchend',   onTouchEnd,   { passive: false });

  return () => {
    element.removeEventListener('touchstart', onTouchStart as any);
    element.removeEventListener('touchmove',  onTouchMove  as any);
    element.removeEventListener('touchend',   onTouchEnd   as any);
  };
}