

import createWeightValue from './createWeightValue';
import Globals from '../Globals.js'

// var weightsObj = Globals.weightsObj;

const adjustWeightsAndBiases = (learning_rate, scene, gradientArray)=>{

    // GOAL - adjusting weights by adding the product of the negative gradient and learning rate
    // weightsObj.adjustWeightValues(
    //     {0: w1, 1: w2}
    // )

    // let weights = weightsObj.weightValues;

    // let looplabel = 0;
    let weightValuesToRemove = [];
    //@ts-ignore
    scene.children.forEach((child)=>{
        // console.log("Child: ", child);
        // console.log("Loop label: ", looplabel)
        if(child.name.match(/weightValue_\d+/g)){

            //for each child, check all the weights and see if its value matches the weight
            Object.values(Globals.weightsObj.weightValues).forEach((weight)=>{
                if( parseFloat(child.weightValue) === parseFloat(weight)){
                    // console.log("child: ", child);
                    let weightID = `${child.name.replace('weightValue_', "")}`;
                    console.log("Found matching weight");
                    let newWeight = parseFloat(weight) - learning_rate * gradientArray[`${weightID}`];

                    Globals.weightsObj.weightValues[`${weightID}`] = parseFloat(weight) - learning_rate * newWeight;
                    // w1 = parseFloat(w1) - learning_rate * dcost_dw1;
                    weightValuesToRemove.push(child);
                    createWeightValue(newWeight, child.position, scene, weightID);

                    // weightsObj.adjustWeightValues(
                    //     {
                    //         ...weights,
                    //     }
                    // )
    
                }
            })
        }
            // looplabel+=1;
    });

    console.log("Length of weights to remove: ", weightValuesToRemove.length)
    console.log("weightvalues to remove: ", weightValuesToRemove);
    weightValuesToRemove.forEach((child)=>{
            //@ts-ignore
            scene.remove(child);
    })
}

export default adjustWeightsAndBiases;

