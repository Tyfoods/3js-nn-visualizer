export default {
    zValues: [],
    predictionValues: [],
    weightsObj: {
        weightValues: {},
        weightCenterCoords: {},
        setWeightCenterCoords (value){
            let weightID = Object.keys(this.weightCenterCoords).length;
            // console.log("Weight ID: ", weightID);
            // console.log("Value: ", value);
            // console.log("Value from setWeightCenterCoords: ", value);
            this.weightCenterCoords[`${weightID}`] = value;
            return;
        },
        setWeightValues (value){
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
    }
}