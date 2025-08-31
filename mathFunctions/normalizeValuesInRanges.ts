import isNumberInInterval from "../helpers/isNumberIninterval";

//ad hoc, but sometimes input is not in interval, so I will raise or lower the interval on the fly.
const adHocFixInterval = (inpInterval: number[], input: number)=>{
    if(input < inpInterval[0]){
        inpInterval[0]=input;
        return inpInterval;
    }
    if(input > inpInterval[1]){
        inpInterval[1]=input;
        return inpInterval;
    }
}

const normalizeValuesInRanges=(input: number, inpInterval: number[], outInterval: number[], )=>{
    // slope = (output_end - output_start) / (input_end - input_start)
    // output = output_start + slope * (input - input_start)
    if(!isNumberInInterval(inpInterval[0], inpInterval[1], input)){
        // console.log("Interval: ", inpInterval[0], inpInterval[1])
        // console.log("Input is not in input inveral: ", input);
        // console.log("Fixing interval");
        inpInterval = adHocFixInterval(inpInterval, input)
    }
    let slope = (outInterval[1] - outInterval[0]) / (inpInterval[1] - inpInterval[0])
    let output =  outInterval[0] + ( slope * (input - inpInterval[0]) );
    return output;
}


export default normalizeValuesInRanges