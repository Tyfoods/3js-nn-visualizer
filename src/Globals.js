export default {
    zValues: [],
    predictionValues: [],
    biasesObj: {},
    weightsObj: {
        weightValues: {},
        weightCenterCoords: {},
        addWeightCenterCoords (value){
            let weightID = Object.keys(this.weightCenterCoords).length;
            // console.log("Weight ID: ", weightID);
            // console.log("Value: ", value);
            // console.log("Value from setWeightCenterCoords: ", value);
            this.weightCenterCoords[`${weightID}`] = value;
            return;
        },
        addWeightValues (value){
            let weightID = Object.keys(this.weightValues).length;
            // console.log("Weight ID: ", weightID);
            // console.log("Value: ", value);
            // console.log("Value from setWeightCenterCoords: ", value);
            this.weightValues[`${weightID}`] = value;
            return value;
        },
        adjustWeightValues (value){
            this.weightValues = value;
            return value;
        }
    },
    scene: null,
}