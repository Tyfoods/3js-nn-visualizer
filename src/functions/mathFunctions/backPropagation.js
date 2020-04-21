

import sigmoidSquishification from './sigmoidSquishification.js';
import calculate_DcostDweight_Array from './calculate_DcostDweight_Array.js';
import calculate_DzDweight_Array from './calculate_DzDweight_Array.js';

const backPropagation = (costFunction, activationFunction, trainingData, weights, z, pred, target)=>{
    //GOAL - Calculate gradient with respect to each weight and return an array of gradients.
    console.log("Weights: ", weights);
    console.log("Training data: ", trainingData);
    console.log("z value: ", z);


    //generate pre_dcost_dweight
    const calculate_pre_Dcost_Dweight = (costFunction, activationFunction)=>{
        let dcost_dpred;
        let dpred_dz;
        if(costFunction === 'squaredError'){
            dcost_dpred = 2 * (pred - target);
        }
        if(activationFunction === 'sigmoid'){
            dpred_dz = sigmoidSquishification(z) * (1-sigmoidSquishification(z));
        }


        return dcost_dpred * dpred_dz;
    }

    //calculates the product of the derivative of the cost function with respect to the prediction
    //AND the derivative of the prediction with respect to the pre-activated output value
    let pre_dcost_dweight = calculate_pre_Dcost_Dweight(costFunction, activationFunction);
    console.log("pre_decost_dweight: ", pre_dcost_dweight);
    
    //calculates derivative of z with respect to weights, which is just equal to the input associated with the weight
    let DzDweight_Array = calculate_DzDweight_Array(weights, trainingData);
    console.log("DzDweight Array: ", DzDweight_Array);
    
    //calculates derivative of the cost function with respect to each weight;
    let DcostDweight_Array = calculate_DcostDweight_Array(pre_dcost_dweight, DzDweight_Array);
    console.log("DcostDweight Array: ", DcostDweight_Array);

    return DcostDweight_Array;
}

export default backPropagation;