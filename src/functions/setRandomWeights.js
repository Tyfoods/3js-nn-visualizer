
import createTextSprite from './createTextSprite.js';

export default function setRandomWeights (weightsObj, scene){

    let inputLayerWeightsCenter = [];
    let centerIterator = 0;
    // console.log("weightsData: ", weightsObj.weightsData);
    scene.children.forEach((weight)=>{
        if(weight.name === 'weight' /* && !weight.position.x */){
            // console.log(`Weight ${centerIterator}: `, weightsObj.weightCenterCoords[`${centerIterator}`]);
            inputLayerWeightsCenter.push( weightsObj.weightCenterCoords[`${centerIterator}`] );
            centerIterator +=1;
        }
    
    });
    let weightID = 0;
    inputLayerWeightsCenter.forEach(async (weightCenterCoord)=>{
        // ((inputIterator)=>{
            // console.log("Weight Center Coordinate: ", weightCenterCoord);
            let weightVal = weightsObj.setWeightValues(Math.random());

            let parameters = {
                text: `weightValue_${weightID}`,
                weightValue: weightVal,
                position: {
                    x: weightCenterCoord[0],
                    y: weightCenterCoord[1],
                    z: weightCenterCoord[2],
                },
            }
            scene.add(createTextSprite(`${ weightVal }`.substring(0, 4), parameters));

    
        weightID+=1;
    })
}