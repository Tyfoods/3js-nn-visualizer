// import * as THREE from '../js/three.module.js';

import onWindowResize from '../helpers/onWindowResize';
import * as THREE from '../node_modules/three/build/three.module'
import NetworkControllerUI from './NetworkControllerUI';
import FeedForwardNeuralNetwork from './Neural Networks/feedForwardNeuralNetwork';
import { PointerLockControls } from '../node_modules/three/examples/jsm/controls/PointerLockControls.js';
import SelfOrganizingMap from './Neural Networks/selfOrganizingMap';


var scene = new THREE.Scene();
var NeuralNetwork = new FeedForwardNeuralNetwork(scene)
// var SOM = new SelfOrganizingMap(scene);
// Globals.scene = scene;
var camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer();
var controls = new PointerLockControls( camera, renderer.domElement );
var clock = new THREE.Clock()
onWindowResize(camera, renderer);

//CAMERA CONTROL BY KEYBOARD
function toggleMouseFromCamera ( event: any ) {
    if(event.keyCode === 32){
        event.preventDefault();
        (controls.isLocked ? controls.unlock() : controls.lock())     
    }
}
function controlThreeObject(threeObject: any, moveDistance: number){
	if ( keyboard.pressed("W") )
        threeObject.translateZ( -moveDistance );
	if ( keyboard.pressed("S") )
        threeObject.translateZ(  moveDistance );
	if ( keyboard.pressed("A") )
        threeObject.translateX( -moveDistance );
	if ( keyboard.pressed("D") )
        threeObject.translateX(  moveDistance );	
}

//@ts-ignore
var keyboard = new THREEx.KeyboardState();
//CAMERA CONTROL BY KEYBOARD END


renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
//@ts-ignore
camera.position.y = 2.5;
//@ts-ignore
camera.position.z = 50;

//@ts-ignore
// scene.add( new THREE.GridHelper( 100, 10 ) );


function render() {

	

	window.addEventListener( 'keydown', toggleMouseFromCamera, false );

    renderer.clear();
    
    renderer.render( scene, camera );
    
}


function animate() {
	let deltaTime = clock.getDelta();
	var moveDistance = 75 * deltaTime; // 2
	controlThreeObject(camera, moveDistance);

    requestAnimationFrame( animate );
    render()

    
}
animate();

