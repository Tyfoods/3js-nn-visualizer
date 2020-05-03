

import createWeightValue from './createWeightValue.js';
import Globals from '../Globals.js'

// var weightsObj = Globals.weightsObj;

const adjustWeightsAndBiases = (learning_rate, scene, gradientArray)=>{

    // GOAL - adjusting weights by adding the product of the negative gradient and learning rate
    // weightsObj.adjustWeightValues(
    //     {0: w1, 1: w2}
    // )

    // let weights = weightsObj.weightValues;
    // console.log("Before adjusting, these are the weight values:", Globals.weightsObj.weightValues);

    // let looplabel = 0;
    let weightValuesToRemove = [];
    //@ts-ignore
    scene.children.forEach((child)=>{
        // console.log("Child: ", child);
        // console.log("Loop label: ", looplabel)
        if(child.name.match(/weightValue_\d+/g)){
            //for each child, check all the weights and see if its value matches the weight
            Object.values(Globals.weightsObj.weightValues).forEach((weight)=>{
                // console.log("Child weight value: ", child.weightValue);
                // console.log("Stored weight value: ", weight);
                if( parseFloat(child.weightValue) === parseFloat(weight)){
                    // console.log("child: ", child);
                    let incrementedWeightID = `${child.name.replace('weightValue_', "")}`;
                    // console.log(`Calculating new weight: weight ${weight} - learning_rate ${learning_rate} * gradient ${gradientArray[`${child.weightID}`]}`);
                    let newWeight = parseFloat(weight) - learning_rate * gradientArray[`${child.weightID}`];
                    // console.log("new weight: ", newWeight);
                    // Globals.weightsObj.weightValues[`${incrementedWeightID}`] = parseFloat(weight) - learning_rate * newWeight;
                    // Globals.weightsObj.weightValues[`${incrementedWeightID}`] = newWeight;
                    Globals.weightsObj.weightValues[`${child.weightID}`] = newWeight;
                    // w1 = parseFloat(w1) - learning_rate * dcost_dw1;
                    weightValuesToRemove.push(child);
                    // scene.remove(child);
                    createWeightValue(newWeight, child.position, scene, incrementedWeightID, child.weightID);
    
                }
            })
        }
        // console.log("Child name: ", child.name);
        if(child.name.match(/neuron_L\d+N\d+/g) && !child.name.match(/neuron_L1N\d+/g)){
            // console.log("Matched neuron: ", child.name);
            Object.values(Globals.biasesObj).forEach((bias)=>{
                if(parseFloat(child.bias) === bias){
                    //change bias accordingly
                    // console.log("Adjusting bias for: ", child.name);
                    let newBias = parseFloat(bias) - learning_rate * gradientArray[`${child.name}`];
                    child.bias = newBias;
                    Globals.biasesObj[`${child.name}`] = newBias;
                }
            });
        }
        else{
            // console.log("No neuron biases were adjusted");
        }
            // looplabel+=1;
    });

    // console.log("Length of weights to remove: ", weightValuesToRemove.length)
    // console.log("weightvalues to remove: ", weightValuesToRemove);
    weightValuesToRemove.forEach((child)=>{
            //@ts-ignore
            scene.remove(child);
    })
}

export default adjustWeightsAndBiases;

