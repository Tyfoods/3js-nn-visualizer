function elementWiseOperationOnVector(vector: number[], operation: any){
    return vector.map((element)=>{
        return operation(element);
    });
}

export default elementWiseOperationOnVector