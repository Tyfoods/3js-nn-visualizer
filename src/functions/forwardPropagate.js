
import * as THREE from '../../three/build/three.module.js';
import sigmoidSquishification from './mathFunctions/sigmoidSquishification.js';
import derivOfSigmoid from './mathFunctions/derivOfSigmoid.js';


import Globals from '../Globals.js';
import createCanvasTexturedBox from './createCanvasTexturedBox.js';


export default (trainingData, nn_params, weightsObj, scene, currentInputLayer)=>{
    var inputIterator = 0;
    console.log(`Forward propagate step layer ${currentInputLayer-1} to ${currentInputLayer}`);
    // console.log("Current layer: ", `Layer ${currentInputLayer}`);
    let inputLayerCoordsArray = Object.values(nn_params.neuron_coordinates_per_layer[`Layer ${currentInputLayer}`]);
    // console.log("Inputlayercoordsarray: ", inputLayerCoordsArray);
    

    let weightsBetweenLayers = [];
    let previousLayerNeurons = [];
    let currentOutputLayer = [];
    scene.children.forEach((child)=>{
        //Get current output Layer Neuron info
        if( child.name.match( new RegExp(`neuron_L${currentInputLayer}N\\d+`,'g') ) ){
            let {name, value, position, bias} = child;
            currentOutputLayer.push({name, value, position, child, bias});
        }
        //Get previous layer neuron info
        if( child.name.match( new RegExp(`neuron_L${currentInputLayer-1}N\\d+`,'g') ) ){
            let {name, value, bias} = child;
            previousLayerNeurons.push({name, value, bias});
        }
        //get weights between layers
        if( child.weightID && child.weightID.match( new RegExp(`L${currentInputLayer-1}N\\d+-L${currentInputLayer}N\\d+`,'g') ) ){
            let {weightID: name, weightValue} = child;
            if(weightValue){
                weightsBetweenLayers.push({name, weightValue});
            }
        }
    });
    // console.log("Current layer neurons: ", currentOutputLayer);
    // console.log("Previous layer neurons: ", previousLayerNeurons);
    // console.log("weights between layers: ", weightsBetweenLayers);

    let dot_product = 0;
    // let bias = 10;
    //Below is the is of (each weight * Input)
    //I.E. Dot Product of the weight and input vectors between current and prev layer
    //I.E. I.E. for each neuron in output layer I.E. current layer computer the output
    for (let outputLayerNeuron of currentOutputLayer){
        //All inputs will be multipled against weights associated with this input.
        //Therefore we loop through weights to find the weight associated with this neuron.
        let weightsAssociatedWithOutputNeuron = {}
        weightsBetweenLayers.forEach((weight)=>{
            //if weight is associated with this neuron then store it
            // console.log("Associated neuron: ", outputLayerNeuron.name)
            // console.log("Storing weight: ", weight.name);
            if(weight.name.match( new RegExp(`${outputLayerNeuron.name.replace("neuron_", "")}`))){
            // if(weight.name.match(new RegExp(`${outputLayerNeuron.name.replace("neuron_", "")}`))){
                // console.log("Associated neuron: ", outputLayerNeuron.name)
                // console.log("Storing weight: ", weight.name);
                weightsAssociatedWithOutputNeuron[`${weight.name}`] = weight.weightValue;
            }
        })

        let dZ_dW_obj = {}; //calculating derivative of z with respect to weight which is just equal to the input.value.
        let dZ_dActivPrev_obj = {}; //calculating derivative of z with respective to activation of previous neuron which is just equal to the associated weightValue
        let dZ_dBiasPrev_obj = {}; //calculating derivative of z with respect to bias of previous neuron which is just equal to 1

        //find input associated with this weight and calculate dot product
        previousLayerNeurons.forEach((input)=>{
            for (let [weightName, weightValue] of Object.entries(weightsAssociatedWithOutputNeuron)){
                // console.log(`Weight: ${weightName} is associated with ${outputLayerNeuron.name}`)
                // console.log("Prev layer neuron name: ", input.name)
                if( weightName.match(new RegExp(`${input.name.replace("neuron_", "")}`) )){
                    // console.log("weight Name: ", weightName);
                    // console.log("input name: ", input.name);
                    dZ_dW_obj[`${weightName}`] = input.value;
                    dZ_dActivPrev_obj[`${weightName}`] = weightValue;
                    dZ_dBiasPrev_obj[`${weightName}`] = 1;
                    console.log(`Calculation for Z component: ${weightValue} * ${input.value} *  + ${outputLayerNeuron.bias}`)
                    dot_product += weightValue * input.value /* + outputLayerNeuron.bias */
                }
            }

        })

        let Z = dot_product + outputLayerNeuron.bias

        let outputValue = nn_params.setPredictionValue(sigmoidSquishification(Z));
        let dActiv_dZ = derivOfSigmoid(Z);

       
        console.log("dZ_dW_obj: ", dZ_dW_obj);
        console.log("dZ_dActivPrev_obj: ", dZ_dActivPrev_obj);

        outputLayerNeuron.child.dZ_dBiasPrev_obj = dZ_dBiasPrev_obj;
        outputLayerNeuron.child.dZ_dActivPrev_obj = dZ_dActivPrev_obj;
        outputLayerNeuron.child.dZ_dW_obj = dZ_dW_obj;
        outputLayerNeuron.child.dActiv_dZ = dActiv_dZ;
        outputLayerNeuron.child.value = outputValue;
        outputLayerNeuron.child.zValue = Z;
        if(currentInputLayer !== nn_params.layer_amt){
            // console.log("adding input value to ", outputLayerNeuron.child.name);
            outputLayerNeuron.child.inputValue = outputValue;
        }

        console.log("Z value: ", Z);
        console.log("Output value: ", outputValue);
        // Globals.zValues.push(nn_params.setZValue(Z));
        // Globals.predictionValues.push(outputValue);
        Globals.zValues[0] = (nn_params.setZValue(Z));
        Globals.predictionValues[0] = (outputValue);
        
        scene.add(createCanvasTexturedBox(`${outputValue}`.substring(0,4), {
            text: 'outputValue',
            position: {
                x : outputLayerNeuron.position.x,
                y : outputLayerNeuron.position.y + 3,
                z : outputLayerNeuron.position.z,
            }
        }))

    }
            
            
            
            //For each neuron in the "current inputLayer"
    // for ( let inputLayerNeuron of inputLayerCoordsArray ){

    //     console.log("Input layer neuron: ", inputLayerNeuron);

    //     let inputValue = (()=>{
    //         console.log(`Calculating output for neuron ${inputIterator} in layer ${currentInputLayer}`)
    //         //Gets approriate weight for each neuron 
    //         let weightIterator = (()=>{
    //             if(inputIterator === 0){
    //                 return 0;
    //             }
    //             else{
    //                 return inputIterator * inputLayerCoordsArray.length;
    //             }
    //         })()

    //         console.log("Weight Iterator: ", weightIterator);




    //         //Summation of (each weight * Input)
    //         //I.E. Dot Product of the weight and input vectors between current and prev layer
    //         let Z = 0;
    //         for (let i = weightIterator; i<= inputLayerCoordsArray.length; i++){
    //             Z += weightsObj.weightValues[i] * trainingData[inputLayerCoordsArray];

    //             console.log( `Weight: ${weightsObj.weightValues[i]}`);
    //             console.log( `Input: ${trainingData[i]}`);
    //         }
    //         // console.log("Internal Z Value", Z);
    //         // console.log("Internal Prediction Value", sigmoidSquishification(Z));
    //         // Globals.zValue = Z;
    //         // nn_params.setZValue(Z);
    //         Globals.zValues.push(nn_params.setZValue(Z));
    //         Globals.predictionValues.push(nn_params.setPredictionValue(sigmoidSquishification(Z)));
    //         // nn_params.predictionValue = sigmoidSquishification(Z);

    //         console.log("Sigmoid squishification: ", sigmoidSquishification(Z))
    //         return sigmoidSquishification(Z);
    //     })();

    //     scene.add(createCanvasTexturedBox(`${inputValue}`.substring(0,4), {
    //         text: 'outputValue',
    //         position: {
    //             x : inputLayerNeuron[0],
    //             y : inputLayerNeuron[1] + 3,
    //             z : inputLayerNeuron[2],
    //         }
    //     }))
    //     inputIterator+=1;

    // };
}