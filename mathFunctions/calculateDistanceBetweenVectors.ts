function calculateDistanceBetweenVectors(target: number[], pred: number[]){
    let sum = 0;
    for (let i=0; i<target.length; i+=1){
        let differenceBtwnDimensions = (pred[i] - target[i]);
        let result = Math.pow(differenceBtwnDimensions, 2)
        sum+=result
    }
    return Math.sqrt(sum)
}

export default calculateDistanceBetweenVectors