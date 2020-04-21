import * as THREE from '../three/build/three.module.js';
// import { PointerLockControls } from '../three/examples/jsm/controls/PointerLockControls.js';
import { OrbitControls } from '../three/examples/jsm/controls/OrbitControls.js';
import { GUI } from '../three/examples/jsm/libs/dat.gui.module.js';
import denselyConnectNeurons from './functions/denselyConnectNeurons.js';
import createLayersFunc from './functions/createLayers.js';
import deleteLayersFunc from './functions/deleteLayers.js';
import setRandomWeights from './functions/setRandomWeights.js';
import forwardPropagate from './functions/forwardPropagate.js';
import loadInputs from './functions/loadInputs.js';
import Globals from './Globals.js'
import adjustWeightsAndBiases from './functions/adjustWeightsAndBiases.js';
import backPropagation from './functions/mathFunctions/backPropagation.js';



var lastLayerAmt = 0;


var lastLayerAmtObj = {
    lastLayerAmt: 0,
    setLastLayerAmt (value: any){
        // console.log("this: ", this);
        this.lastLayerAmt = value;
        return;
    }
}

var weightsObj = Globals.weightsObj;

var nn_params = {

    predictionValue: Number,
    zValue: Number,

    currentInputLayer: 1,
    currentOutputLayer: 2,
    layer_amt: 0,
    neuron_coordinates_per_layer: {
    },
    setPredictionValue (value: any){
        // console.log("Setting Prediction Value");
        this.predictionValue = value;
        return value;
    },
    setZValue (value: any){
        // console.log("Setting Z Value");
        this.zValue = value;
        return value;
    },
}

var main_nn_gui = new GUI({name: "Neural Network Parameters"});

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
    //@ts-ignore
    var controls = new OrbitControls( camera, renderer.domElement );
    // var controls = new PointerLockControls( camera, renderer.domElement );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    //@ts-ignore
    camera.position.y = 2.5;
    //@ts-ignore
    camera.position.z = 20;
    
var createLayers = ((nn_params, lastLayerAmtObj, main_nn_gui, scene)=>{


    return(
        ()=>createLayersFunc(nn_params, lastLayerAmtObj, main_nn_gui, scene)
    )
})(nn_params, lastLayerAmtObj, main_nn_gui, scene)

var deleteLayers = ((main_nn_gui, scene, lastLayerAmtObj, nn_params)=>{


    return(
        ()=>deleteLayersFunc(main_nn_gui, scene, lastLayerAmtObj, nn_params)
        )
})(main_nn_gui, scene, lastLayerAmtObj, nn_params)



var pseudoTrainingData = [
    [6, 10, 16],
    [3, 7, 10],
    [9, 5, 14],
    [1, 4, 5],
    [2, 0, 2],
    [4, 8, 12],
    [3, 6, 9],
    [5, 7, 12],
    [0, 10, 10],
]


    var train = {
        'Train': function (){
            console.log("Training Network");

            let learning_rate = 0.2;
            let z;
            let pred;

            for(let i=0; i<=pseudoTrainingData.length-1; i++){

                console.log("Current training data: ", pseudoTrainingData[i]);

                loadInputs(pseudoTrainingData[i], nn_params, scene);
                for (let currentInputLayer=2; currentInputLayer<=nn_params.layer_amt+1; currentInputLayer++){

                    if(!(currentInputLayer > nn_params.layer_amt)){
                        
                        forwardPropagate(pseudoTrainingData[i], nn_params, weightsObj, scene, currentInputLayer);
                        z = Globals.zValues[i];
                        pred = Globals.predictionValues[i];

                    }
                    else{

                        // console.log("outputValues: ", Globals);
                        // console.log("w1: ", w1)
                        // console.log("w2: ", w2)

                        //@ts-ignore
                        // console.log("Weights: ", weightsObj.weightValues);
                        // console.log("z: ", Globals.zValues[i])
                        // console.log("pred: ", Globals.predictionValues[i])
                        
                        let target = pseudoTrainingData[i][2];

                        console.log("Initiating Back Prop!");

                        let gradientArray = backPropagation("squaredError", "sigmoid", pseudoTrainingData[i], weightsObj.weightValues, z, pred, target)
                        adjustWeightsAndBiases(learning_rate, scene, gradientArray);

                        if(i !== pseudoTrainingData.length -1){
                            //@ts-ignore
                            scene.children.forEach((child)=>{
                                if(child.name === 'inputValue'){
                                    // console.log("Removing old inputs");
                                    //@ts-ignore
                                    scene.remove(child);
                                }
                            });
                            //@ts-ignore
                            scene.children.forEach((child)=>{
                                if(child.name === 'outputValue'){
                                    // console.log("Removing old outputs");
                                    //@ts-ignore
                                    scene.remove(child);
                                }
                            });
                        }
                        else{
                            console.log("Training complete");
                        }
                    }
                }
            }
        }
    };
    //@ts-ignore
    main_nn_gui.add(train,'Train');

    var randomizeWeights = {
        'randomizeWeights': function (){
            console.log("Setting weights");
            //SET RANDOM WEIGHTS
            setRandomWeights(weightsObj, scene);
        }
    }
    //@ts-ignore
    main_nn_gui.add(randomizeWeights,'randomizeWeights');
    

    var denselyConnectObj = {
        'Densely Connect': ((nn_params, scene, weightsObj)=>{
            return(
                ()=>{
                    // console.log(nn_params);
                    // console.log("scene: ", scene);
                    denselyConnectNeurons(nn_params, scene, weightsObj);
                }
            )
        })(nn_params, scene, weightsObj)
    }
    //@ts-ignore
    main_nn_gui.add(denselyConnectObj,'Densely Connect');

    //@ts-ignore
    main_nn_gui.add( nn_params, 'layer_amt', ).onChange( function () {
        // console.log("Layer amt is: ", nn_params.layer_amt);
        if(nn_params.layer_amt === 0){
            // console.log(`Deleting Layers
            //     currentLayerAmount: ${nn_params.layer_amt}
            //     lastLayerAmt: ${lastLayerAmt}`);
            // main__nn_gui.destroy();
            deleteLayers();
        }
        else if(nn_params.layer_amt && nn_params.layer_amt !== lastLayerAmt){

            // console.log(`Updating layers
            //     currentLayerAmount: ${nn_params.layer_amt}
            //     lastLayerAmt: ${lastLayerAmt}`);
            deleteLayers();
            createLayers();
        }
    });

   
    
    window.addEventListener( 'resize', onWindowResize, false );
    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        //@ts-ignore
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    }




// scene.add( new THREE.GridHelper( 100, 10 ) );



function render() {

    // group.rotation.y += ( targetRotation - group.rotation.y ) * 0.05;

    // camera.lookAt( cameraTarget );

    renderer.clear();
    renderer.render( scene, camera );
    // initText();
}

function animate() {

    requestAnimationFrame( animate );
    render()
    // renderer.render( scene, camera );
    
    controls.update();
    
}
// init();

animate();