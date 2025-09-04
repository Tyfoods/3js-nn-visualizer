// src/projects/threeJsNNVisualizer/src/utils/touchControls.ts
import * as THREE from 'three';

export interface TouchControlsOptions {
  panScale?: number;       // px -> world units for one‑finger pan
  zoomScale?: number;      // px of pinch delta -> translateZ units
  rotationScale?: number;  // px -> radians for two‑finger rotation
}

export function attachTouchControls(
  element: HTMLElement,
  camera: THREE.PerspectiveCamera,
  opts: TouchControlsOptions = {}
) {
  const panScale      = opts.panScale      ?? 0.20;
  const zoomScale     = opts.zoomScale     ?? 0.12;
  const rotationScale = opts.rotationScale ?? 0.003;

  element.style.touchAction = 'none';
  const isTouch = 'ontouchstart' in window || (navigator as any).maxTouchPoints > 0;

  let panning = false, pinching = false, rotating = false;
  let lastX = 0, lastY = 0, lastDist = 0, lastCx = 0, lastCy = 0;

  const getDist = (e: TouchEvent) => {
    const a = e.touches[0], b = e.touches[1];
    const dx = a.clientX - b.clientX, dy = a.clientY - b.clientY;
    return Math.hypot(dx, dy);
  };
  const getCenter = (e: TouchEvent) => {
    const a = e.touches[0], b = e.touches[1];
    return { cx: (a.clientX + b.clientX) / 2, cy: (a.clientY + b.clientY) / 2 };
  };

  const onTouchStart = (e: TouchEvent) => {
    if (!isTouch) return;
    e.preventDefault();
    if (e.touches.length >= 2) {
      pinching = true; rotating = true; panning = false;
      lastDist = getDist(e);
      const { cx, cy } = getCenter(e);
      lastCx = cx; lastCy = cy;
    } else if (e.touches.length === 1) {
      panning = true; pinching = false; rotating = false;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    }
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!isTouch) return;
    e.preventDefault();

    if (e.touches.length >= 2 && (pinching || rotating)) {
      // Zoom via pinch distance delta
      const dist = getDist(e);
      const dz = dist - lastDist;
      lastDist = dist;
      camera.translateZ(-dz * zoomScale);

      // Look-around via two-finger center movement (yaw/pitch)
      const { cx, cy } = getCenter(e);
      const dx = cx - lastCx;
      const dy = cy - lastCy;
      lastCx = cx; lastCy = cy;

      camera.rotation.y -= dx * rotationScale; // yaw
      camera.rotation.x -= dy * rotationScale; // pitch
      const maxPitch = Math.PI / 2 - 0.01;
      camera.rotation.x = Math.max(-maxPitch, Math.min(maxPitch, camera.rotation.x));
    } else if (panning && e.touches.length === 1) {
      const x = e.touches[0].clientX, y = e.touches[0].clientY;
      const dx = x - lastX, dy = y - lastY;
      lastX = x; lastY = y;
      camera.position.x -= dx * panScale;
      camera.position.y += dy * panScale;
    }
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (!isTouch) return;
    if (e.touches.length === 0) {
      panning = pinching = rotating = false;
      lastX = lastY = lastDist = 0; lastCx = lastCy = 0;
    } else if (e.touches.length === 1) {
      // fall back to panning
      pinching = rotating = false; panning = true;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    } else {
      // still two fingers
      panning = false; pinching = rotating = true;
      lastDist = getDist(e);
      const { cx, cy } = getCenter(e);
      lastCx = cx; lastCy = cy;
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