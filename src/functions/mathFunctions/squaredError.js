const squaredError = (prediction, target)=>{
    return Math.pow(prediction-target, 2);
}

export default squaredError;