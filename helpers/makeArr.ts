
const makeArr = (startValue: number, stopValue: number, cardinality: number) => {
    if(cardinality === 1){
        var arr = [];
        arr.push(0);
        return arr;
    }
    else{
        var arr = [];
        var step = (stopValue - startValue) / (cardinality - 1);
        for (var i = 0; i < cardinality; i++) {
            arr.push(startValue + (step * i));
        }
        return arr;
    }
}

export default makeArr;