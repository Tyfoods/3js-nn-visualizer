const calculate_DzDweight_Array = (weights, trainingData)=>{
    //calculates derivative of the pre-activated output with respect to each weight
    let lengthOfWeightsArray = Object.values(weights).length;
    let dz_dwArray = [];
    for (let weightID = 0; weightID < lengthOfWeightsArray; weightID++){
        // console.log("Adding to dz_dw: ", trainingData[weightID]);
        dz_dwArray.push(trainingData[weightID]);
    }
    return dz_dwArray;
}

export default calculate_DzDweight_Array;