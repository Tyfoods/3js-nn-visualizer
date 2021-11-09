const multiplyArrays = (arr1: number[], arr2: number[])=>{
    if(arr1.length !== arr2.length) return false;
    let result: number[] = []
    let i;
    for(i = 0; i<arr1.length; i+=1){
        result.push(arr1[i] * arr2[i])
    }
    return result
}


export default multiplyArrays



