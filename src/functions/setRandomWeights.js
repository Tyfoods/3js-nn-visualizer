
import createCanvasTexturedBox from './createCanvasTexturedBox.js';
import getRndInteger from './mathFunctions/getRndInteger.js';



export default function setRandomWeights (weightsObj, scene){

    let inputLayerWeightsCenter = [];
    let centerIterator = 0;
    // console.log("Weight center coords: ", weightsObj.weightCenterCoords);
    scene.children.forEach((weight)=>{
        if(weight.name === 'weight' /* && !weight.position.x */){
            // console.log(`Weight ${centerIterator}: `, weightsObj.weightCenterCoords[`${centerIterator}`]);
            inputLayerWeightsCenter.push( weightsObj.weightCenterCoords[`${centerIterator}`] );
            centerIterator +=1;
        }
    
    });
    let weightNumericID = 0;

    inputLayerWeightsCenter.forEach((weightCenterCoord)=>{
        // ((inputIterator)=>{
            // console.log("Weight Center 3: ", weightCenterCoord[3]);


            //  let weightVal = weightsObj.addWeightValues(Math.random());
            //  let weightVal = weightsObj.addWeightValues(getRndInteger(-1, 1));
            //  let weightVal = weightsObj.addWeightValues(Math.random()*.2-.1);
            let weightVal = weightsObj.weightValues[`${weightCenterCoord[3]}`] = (Math.random()*.2-.1);
            // console.log("Weight Value: ", weightVal);
            // console.log("WeightID: ", weightCenterCoord[3])
            let parameters = {
                text: `weightValue_${weightNumericID}`,
                weightValue: weightVal,
                weightID: weightCenterCoord[3],
                position: {
                    x: weightCenterCoord[0],
                    y: weightCenterCoord[1],
                    z: weightCenterCoord[2],
                },
            }
            scene.add(createCanvasTexturedBox(`${ weightVal }`.substring(0, 4), parameters));

    
            weightNumericID+=1;
    })

    // console.log("WEight values: ", weightsObj.weightValues);


}