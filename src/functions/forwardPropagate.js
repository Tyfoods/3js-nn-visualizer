
import * as THREE from '../../three/build/three.module.js';
import sigmoidSquishification from './mathFunctions/sigmoidSquishification.js';
import Globals from '../Globals.js';
import createTextSprite from './createTextSprite.js';

export default (trainingData, nn_params, weightsObj, scene, currentInputLayer)=>{
    var inputIterator = 0;
    console.log(`Forward propagate step layer ${currentInputLayer-1} to ${currentInputLayer}`);
    // console.log("Current layer: ", `Layer ${currentInputLayer}`);
    let inputLayerCoordsArray = Object.values(nn_params.neuron_coordinates_per_layer[`Layer ${currentInputLayer}`]);
    // console.log("Inputlayercoordsarray: ", inputLayerCoordsArray);
    //For each neuron in the "inputLayer"
    let outputValues = {
        zValues: [],
        predictionValues: [],
    }
    for ( let inputLayerNeuron of inputLayerCoordsArray ){

        let inputValue = (()=>{
            //Gets approriate weight for each neuron 
            let weightIterator = (()=>{
                if(inputIterator === 0){
                    return 0;
                }
                else{
                    return inputIterator * inputLayerCoordsArray.length;
                }
            })()



            // console.log("Weights Obj");
            //Summation of (each weight * Input)
            let Z = 0;
            for (let i = weightIterator; i< inputLayerCoordsArray.length; i++){
                // console.log(weightsObj.weightValues[i]);
                Z += weightsObj.weightValues[i] * trainingData[inputIterator];
            }
            // console.log("Internal Z Value", Z);
            // console.log("Internal Prediction Value", sigmoidSquishification(Z));
            // Globals.zValue = Z;
            // nn_params.setZValue(Z);
            Globals.zValues.push(nn_params.setZValue(Z));
            Globals.predictionValues.push(nn_params.setPredictionValue(sigmoidSquishification(Z)));
            // nn_params.predictionValue = sigmoidSquishification(Z);
            return sigmoidSquishification(Z);
        })();

        scene.add(createTextSprite(`${inputValue}`.substring(0,4), {
            text: 'outputValue',
            position: {
                x : inputLayerNeuron[0] + 3,
                // outputValueText.position.y = nn_params.neuron_coordinates_per_layer[`Layer ${nn_params.layer_amt}`]['n1'][1];
                y : inputLayerNeuron[1],
                // outputValueText.position.z = nn_params.neuron_coordinates_per_layer[`Layer ${nn_params.layer_amt}`]['n1'][2];
                z : inputLayerNeuron[2],
            }
        }))

        // (async (inputIterator, inputValue)=>{
        //     // console.log("Input iterator: ", inputIterator);
        //     var loader = new THREE.FontLoader();
        //     await loader.load( '../three/examples/fonts/gentilis_regular.typeface.json', async function ( font ) {
        //         var color = 0x006699;
                
        //         var matDark = new THREE.LineBasicMaterial( {
        //             color: color,
        //             side: THREE.DoubleSide
        //         } );
                
        //         // console.log("inputIterator: ", inputIterator)
        //         // console.log("Current Training data: ", trainingData);
        //         // let outputValueIsSet = false;
        //         let zValue;


        //         // console.log("Input value before added to scene: ", inputValue);

        //         var geometry = new THREE.TextGeometry( `${(inputValue ? inputValue : '0')}`, {
        //             font: font,
        //             size: 1,
        //             height: 1/100,
        //             curveSegments: 12,
        //         } );

        //         var outputValueText = new THREE.Mesh( geometry, matDark );
        //         // outputValueText.position.x = nn_params.neuron_coordinates_per_layer[`Layer ${nn_params.layer_amt}`]['n1'][0] + 3;
        //         outputValueText.position.x = inputLayerNeuron[0] + 3;
        //         // outputValueText.position.y = nn_params.neuron_coordinates_per_layer[`Layer ${nn_params.layer_amt}`]['n1'][1];
        //         outputValueText.position.y = inputLayerNeuron[1];
        //         // outputValueText.position.z = nn_params.neuron_coordinates_per_layer[`Layer ${nn_params.layer_amt}`]['n1'][2];
        //         outputValueText.position.z = inputLayerNeuron[2];
                

        //         // console.log("Setting output value params");
        //         outputValueText.zValue = zValue;
        //         outputValueText.predictionValue = inputValue;
        //         outputValueText.name = "outputValue"

        //         await scene.add( outputValueText );
        //     });
            
        // })(inputIterator, inputValue)
        inputIterator+=1;

    };
    // console.log("Returning output values - ending forwardPropagateStep ");
    return outputValues;
}