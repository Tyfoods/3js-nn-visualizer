const sigmoidSquishification = (z: number)=>{
    return 1 / (1 + Math.exp(-z) );
}

export default sigmoidSquishification