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
import createCanvasTexturedBox from './functions/createCanvasTexturedBox.js';
import adjustWeightsAndBiases from './functions/adjustWeightsAndBiases.js';
import backPropagation from './functions/mathFunctions/backPropagation.js';
import backPropagationV2 from './functions/mathFunctions/backPropagationV2.js';
import createGraph from './functions/createGraph.js';

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
    learning_rate: .2,
    iterationSpeed: .5,
    iterations: 100,
    currentInputLayer: 1,
    currentOutputLayer: 2,
    layer_amt: 0,
    neuron_coordinates_per_layer: {
    },
    modifyNeuronCoordinatesPerLayer (value: any){
        this.neuron_coordinates_per_layer = value;
        return value;
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
Globals.scene = scene;
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


// 1,1:0
// 2,1:0
// 2,.5:0
// 3,1:0
// 3, 1.5:1
// 3.5,.5:1
// 4, 1.5:1
// 5.5,1:1

    var pseudoTrainingData = [
        [1, 1, 0],
        [2, 1,   0],
        [2, .5, 0],
        [3,   1, 0],
        [3, 1.5, 1],
        [3.5,   .5, 1],
        [4, 1.5, 1],
        [5.5,   1,   1],
    ]

    //example from JSfiddle - https://jsfiddle.net/wbkgb73v/

    // var pseudoTrainingData = [
    //     [6, 10, 16],
    //     [3, 7, 10],
    //     [9, 5, 14],
    //     [1, 4, 5],
    //     [2, 0, 2],
    //     [4, 8, 12],
    //     [3, 6, 9],
    //     [5, 7, 12],
    //     [0, 10, 10],
    // ]


    var Test = {
        //@ts-ignore
        'Test': async function (){
            console.log("Testing Network");

            let totalCost = 0;
            
            for (let currentIteration = 0; currentIteration<nn_params.iterations; currentIteration++){
                
                console.log("Testing Iteration number: ", currentIteration);
                
                let i = Math.floor(Math.random() * pseudoTrainingData.length)
                // console.log("Current training data: ", pseudoTrainingData[i]);
                
                
                loadInputs(pseudoTrainingData[i], nn_params, scene);
                
                
                for (let currentInputLayer=2; currentInputLayer<nn_params.layer_amt+1; currentInputLayer++){
                    
                    forwardPropagate(pseudoTrainingData[i], nn_params, weightsObj, scene, currentInputLayer);
                    let pred = Globals.predictionValues[0]
                    let target = pseudoTrainingData[i][2];
                    let cost = (pred - target) * (pred - target);
                    totalCost += cost
                    console.log("Cost: ", cost)

                    


                    //@ts-ignore
                    await new Promise(r => setTimeout(r, nn_params.iterationSpeed));

                    if(currentIteration === nn_params.iterations){
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
                }
            }
            console.log("Testing complete");
            console.log("Average cost: ", totalCost/nn_params.iterations);
            
        }
    };
    
    //@ts-ignore
    main_nn_gui.add(Test,'Test');

    
    // var currentInputLayer = 2;
    let z: any;
    let pred: any;
    let inputLoaded: boolean;
    // let i=0;

    var train = {
        //@ts-ignore
        'Train': async function (){
            console.log("Training Network");

            let learning_rate = nn_params.learning_rate;


            for (let currentIteration = 0; currentIteration<nn_params.iterations; currentIteration++){
                // console.log("Starting Epoch number: ", currentEpoch);
                console.log("Training Iteration number: ", currentIteration);
                // for(let i=0; i<=pseudoTrainingData.length-1; i++){
                    let i = Math.floor(Math.random() * pseudoTrainingData.length)
                    // console.log("Current training data: ", pseudoTrainingData[i]);
    
                    // if(!inputLoaded){
                        loadInputs(pseudoTrainingData[i], nn_params, scene);
                        // inputLoaded = true;
    
                    // }
    
                    for (let currentInputLayer=2; currentInputLayer<=nn_params.layer_amt+1; currentInputLayer++){
                        // console.log("Current input layer: ", currentInputLayer);
                        // console.log("layer amount: ", nn_params.layer_amt);
                        // console.log("Initate backprop? ", (currentInputLayer > nn_params.layer_amt));
                        if(!(currentInputLayer > nn_params.layer_amt)){
                            
                            forwardPropagate(pseudoTrainingData[i], nn_params, weightsObj, scene, currentInputLayer);
                            z = Globals.zValues[0];
                            pred = Globals.predictionValues[0];
    
                            // currentInputLayer+=1;
                        }
                        else{
                            // console.log("all z: ", Globals.zValues)
                            // console.log("all pred: ", Globals.predictionValues)
                            //@ts-ignore
                            // console.log("Weights: ", weightsObj.weightValues);
                            // console.log("current z: ", Globals.zValues[0])
                            // console.log("current pred: ", Globals.predictionValues[0])
                            
    
    
                            // console.log("Initiating Back Prop!");
                            let target = pseudoTrainingData[i][2];
                            // console.log("Cost: ", (pred - target) * (pred - target))
    
                            
    
                            //@ts-ignore
                            // let gradientArray = backPropagation(
                            let gradientArray = backPropagationV2(
                                "squaredError",
                                "sigmoid",
                                pseudoTrainingData[i],
                                weightsObj.weightValues,
                                z,
                                pred,
                                target,
                                nn_params,
                                scene
                                )
                            adjustWeightsAndBiases(learning_rate, scene, gradientArray);
    
    
                            //@ts-ignore
                            // if(i !== parseInt(pseudoTrainingData.length)-1 ){
                                
                                //pause so we can see values changing
                                
                            //@ts-ignore
                            await new Promise(r => setTimeout(r, nn_params.iterationSpeed));

                            if(currentIteration === nn_params.iterations){
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
                                // console.log("Iteration complete");
                                            //@ts-ignore
                                if(nn_params.layer_amt <= 2){

                                    console.log({
                                        //@ts-ignore
                                        w1: Globals.weightsObj.weightValues['L1N0-L2N0'],
                                        //@ts-ignore
                                        w2: Globals.weightsObj.weightValues['L1N1-L2N0'],
                                        //@ts-ignore
                                        b: Globals.biasesObj['neuron_L2N0']
                                    })
                                    //@ts-ignore
                                    createGraph(pseudoTrainingData, {
                                        //@ts-ignore
                                        w1: Globals.weightsObj.weightValues['L1N0-L2N0'],
                                        //@ts-ignore
                                        w2: Globals.weightsObj.weightValues['L1N1-L2N0'],
                                        //@ts-ignore
                                        b: Globals.biasesObj['neuron_L2N0']}
                                    );
                                }
                            }
                            
                        }
                        // i+=1;
                    }
                    // }
                }
                console.log("Training complete");
            // //@ts-ignore
            // console.log({
            //     //@ts-ignore
            //     w1: Globals.weightsObj.weightValues['L1N0-L2N0'],
            //     //@ts-ignore
            //     w2: Globals.weightsObj.weightValues['L1N1-L2N0'],
            //     //@ts-ignore
            //     b: Globals.biasesObj['neuron_L2N0']
            // })
            // //@ts-ignore
            // createGraph(pseudoTrainingData, {
            //     //@ts-ignore
            //     w1: Globals.weightsObj.weightValues['L1N0-L2N0'],
            //     //@ts-ignore
            //     w2: Globals.weightsObj.weightValues['L1N1-L2N0'],
            //     //@ts-ignore
            //     b: Globals.biasesObj['neuron_L2N0']}
            // );
            // console.log("Training complete");
        }
    };
    //@ts-ignore
    main_nn_gui.add(train,'Train');
    
    //@ts-ignore
    main_nn_gui.add( nn_params, 'learning_rate', ).onChange( function () {
        console.log("Learning Rate: ", nn_params.learning_rate);
    });
    
    //@ts-ignore
    main_nn_gui.add( nn_params, 'iterationSpeed', ).onChange( function () {
        console.log("Iteration speed: ", nn_params.iterationSpeed);
    });
    
    //@ts-ignore
    main_nn_gui.add( nn_params, 'iterations', ).onChange( function () {
        console.log("Iterations: ", nn_params.iterations);
    });

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
            // console.log(`Deleting Layers`)
            //     currentLayerAmount: ${nn_params.layer_amt}
            //     lastLayerAmt: ${lastLayerAmt}`);
            // main__nn_gui.destroy();
            deleteLayers();
        }
        else if(nn_params.layer_amt && nn_params.layer_amt !== lastLayerAmt){

            // console.log(`Updating layers`)
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