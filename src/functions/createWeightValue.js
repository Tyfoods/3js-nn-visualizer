import createTextSprite from './createTextSprite.js';

const createWeightValue = (weightVal, position, scene, weightID)=>{
    //@ts-ignore
    console.log("Creating new weight");
    scene.add(createTextSprite(`${ weightVal }`.substring(0, 4),
        {
            position,
            text: `weightValue_${weightID}`,
            weightValue: weightVal
        }
    , true));

}

export default createWeightValue;