const calculate_DcostDweight_Array = (pre_dcost_dweight, dz_dwArray)=>{
    //calculates cost with respect to each weight;
    let dcost_dw_id = 0;
    let dcost_dw_array = [];
    dz_dwArray.forEach((dz_dw)=>{
        dcost_dw_array.push(pre_dcost_dweight * dz_dw);
        dcost_dw_id+=1;
    })

    return dcost_dw_array;
}

export default calculate_DcostDweight_Array;