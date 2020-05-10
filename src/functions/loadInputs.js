
import * as THREE from '../../three/build/three.module.js';
import createCanvasTexturedBox from './createCanvasTexturedBox.js';
import Globals from '../Globals.js';
import createTexture from './createTexture.js';

export default (trainingData, nn_params, scene)=>{
    var inputIterator = 0;
    // console.log("Loading Input");
    // console.log("Current layer: ", `Layer ${currentInputLayer}`);
    let inputLayerCoordsArray = Object.values(nn_params.neuron_coordinates_per_layer[`Layer 1`]);
    //For each neuron in the "inputLayer"
    // console.log("inputLayerCoordsArray: ", inputLayerCoordsArray);


    
    
    if(!nn_params.inputsLoaded){
        for ( let inputLayerNeuron of inputLayerCoordsArray ){
            (async (inputIterator)=>{
                
                
                //add value to each neuron object.
                scene.children.forEach((child)=>{
                    if(child.name.match(/neuron_L1N\d+/g)){
                            // console.log("Input layer neuron coords: ", inputLayerNeuron);
                            // console.log("Matched neuron: ", child.position);
                        if( inputLayerNeuron[0] === child.position.x &&
                            inputLayerNeuron[1] === child.position.y &&
                            inputLayerNeuron[2] === child.position.z){
                                // console.log(`Adding value ${trainingData[inputIterator]} to ${child.name}`);
                                child.value = trainingData[inputIterator];
                        }
                    }
                });
    
                scene.add(createCanvasTexturedBox(`${(trainingData[inputIterator] ? trainingData[inputIterator] : '0')}`, {
                    text: 'inputValue',
                    inputValue: (trainingData[inputIterator] ? trainingData[inputIterator] : '0'),
                    position: {
                        x: inputLayerNeuron[0],
                        y: inputLayerNeuron[1] + 2,
                        z: inputLayerNeuron[2],
                    }
                }))
            })(inputIterator)
            inputIterator+=1;
            
        };
        nn_params.inputsLoaded = true;
        // console.log("Input loaded");
    }
    else{
        for ( let inputLayerNeuron of inputLayerCoordsArray ){
            (async (inputIterator)=>{
                
                
                //add value to each neuron object.
                scene.children.forEach((child)=>{
                    if(child.name.match(/neuron_L1N\d+/g)){
                            // console.log("Input layer neuron coords: ", inputLayerNeuron);
                            // console.log("Matched neuron: ", child.position);
                        if( inputLayerNeuron[0] === child.position.x &&
                            inputLayerNeuron[1] === child.position.y &&
                            inputLayerNeuron[2] === child.position.z){
                                // console.log(`Adding value ${trainingData[inputIterator]} to ${child.name}`);
                                child.value = trainingData[inputIterator];
                        }
                    }
                    if(child.name === 'inputValue'){
                        // console.log("inputLayerNeuron: ", inputLayerNeuron);
                        // console.log("input coords: ", child.position);
                        if( inputLayerNeuron[0] === child.position.x &&
                            inputLayerNeuron[1] === child.position.y -4 &&
                            inputLayerNeuron[2] === child.position.z){
                                // console.log(`Adding value ${trainingData[inputIterator]} to ${child.name}`);
                                // child.value = trainingData[inputIterator];
                                // console.log(`${child.inputValue} becomes ${trainingData[inputIterator]}`);
                               
                                child.inputValue = trainingData[inputIterator];
                                child.material.map = createTexture({}, `${trainingData[inputIterator]}`.substring(0, 4));
                                child.material.needsUpdate = true;
                        }

                    }
                });
    
                // scene.add(createCanvasTexturedBox(`${(trainingData[inputIterator] ? trainingData[inputIterator] : '0')}`, {
                //     text: 'inputValue',
                //     inputValue: (trainingData[inputIterator] ? trainingData[inputIterator] : '0'),
                //     position: {
                //         x: inputLayerNeuron[0],
                //         y: inputLayerNeuron[1] + 2,
                //         z: inputLayerNeuron[2],
                //     }
                // }))

            })(inputIterator)
            inputIterator+=1;
            
        };
        // console.log("Input modified");
    }

    // if(!nn_params.training){
    //     nn_params.setTraining(true);
    // }
}