const calculateDifferenceBetweenTwoVectors = (arr1: number[], arr2: number[])=>{
    let vector = [];
    if(arr1.length !== arr2.length){
        alert(`Error Subtracting: Vectors have difference size ${arr1.length} !== ${arr2.length}`)
        console.log("Vec 1: ", arr1);
        console.log("Vec 2: ", arr2);
        return;
    }
    for (let i=0; i<arr1.length; i+=1){
        vector.push(arr1[i] - arr2[i]);
    }
    // console.log("Difference of vectors: ", vector);
    return vector
}

export default calculateDifferenceBetweenTwoVectors 