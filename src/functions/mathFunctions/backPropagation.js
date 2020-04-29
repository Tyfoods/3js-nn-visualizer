

import sigmoidSquishification from './sigmoidSquishification.js';
// import calculate_DcostDweight_Array from './calculate_DcostDweight_Array.js';
import calculate_gradients from './calculate_gradients.js';

const backPropagation = (costFunction, activationFunction, trainingData, weights, z, pred, target, nn_params, scene)=>{
    //GOAL - Calculate gradient with respect to each weight and return an array of gradients.
    // console.log("Weights: ", weights);
    // console.log("Training data: ", trainingData);
    // console.log("z value: ", z);



    //generate Dcost_Dactiv_X_Dactiv_Dz
    const calculate_Dcost_Dactiv_X_Dactiv_Dz = (costFunction, activationFunction)=>{
        let Dcost_Dactiv;
        let Dactiv_Dz;
        if(costFunction === 'squaredError'){
            Dcost_Dactiv = 2 * (pred - target);
        }
        if(activationFunction === 'sigmoid'){
            Dactiv_Dz = sigmoidSquishification(z) * (1-sigmoidSquishification(z));
        }

        // console.log("Dcost_Dactiv: ", Dcost_Dactiv);
        // console.log("Dactiv_Dz: ", Dactiv_Dz);
        return Dcost_Dactiv * Dactiv_Dz;
    }

    //calculates the product of the derivative of the cost function with respect to the prediction
    //AND the derivative of the prediction with respect to the pre-activated output value
    let Dcost_Dactiv_X_Dactiv_Dz = calculate_Dcost_Dactiv_X_Dactiv_Dz(costFunction, activationFunction);
    // console.log("Dcost_Dactiv_X_Dactiv_Dz: ", Dcost_Dactiv_X_Dactiv_Dz);
    
    //calculates derivative of z with respect to weights, which is just equal to the input associated with the weight
    // let DzDweight_Array = calculate_DzDweight_Array(weights, trainingData);
    let gradientsArray = calculate_gradients(scene, 'inputs', nn_params.layer_amt, Dcost_Dactiv_X_Dactiv_Dz);
    console.log("Gradients Array: ", gradientsArray);
    
    //calculates derivative of the cost function with respect to each weight
    //I.E. this is our gradient for each weight
    // let DcostDweight_Array = calculate_DcostDweight_Array(Dcost_Dactiv_X_Dactiv_Dz, DzDweight_Array);
    // console.log("DcostDweight Array: ", DcostDweight_Array);

    return gradientsArray;
}

export default backPropagation;