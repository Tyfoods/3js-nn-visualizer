import createTextSprite from './createTextSprite.js';

const createWeightValue = (weightVal, position, scene, incrementedWeightID, weightID)=>{
    //@ts-ignore
    // console.log("Creating new weight");
    // console.log("Weight name: weightValue_", incrementedWeightID);
    // console.log("WeightID: ", weightID)
    scene.add(createTextSprite(`${ weightVal }`.substring(0, 4),
        {
            position,
            text: `weightValue_${incrementedWeightID}`,
            weightValue: weightVal,
            weightID,
        }
    , true));

}

export default createWeightValue;