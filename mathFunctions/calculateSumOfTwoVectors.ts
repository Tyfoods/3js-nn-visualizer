const calculateSumOfTwoVectors = (target: number[], pred: number[])=>{
    let vector = [];
    if(target.length !== pred.length){
        alert(`Error Summing: Vectors have difference size ${target.length} !== ${pred.length}`)
        console.log("Vec 1: ", target);
        console.log("Vec 2: ", pred);
        return;
    }
    for (let i=0; i<target.length; i+=1){
        // vector.push(target[i] - pred[i]);
        vector.push(pred[i] + target[i]);
    }
    // console.log("Difference of vectors: ", vector);
    return vector
}

export default calculateSumOfTwoVectors 