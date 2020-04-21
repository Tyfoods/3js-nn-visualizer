
import * as THREE from '../../three/build/three.module.js';
import createTextSprite from './createTextSprite.js';
export default (trainingData, nn_params, scene)=>{
    var inputIterator = 0;
    console.log("Loading Input");
    // console.log("Current layer: ", `Layer ${currentInputLayer}`);
    let inputLayerCoordsArray = Object.values(nn_params.neuron_coordinates_per_layer[`Layer 1`]);
    //For each neuron in the "inputLayer"
    // console.log("inputLayerCoordsArray: ", inputLayerCoordsArray);
    for ( let inputLayerNeuron of inputLayerCoordsArray ){
        (async (inputIterator)=>{
            scene.add(createTextSprite(`${(trainingData[inputIterator] ? trainingData[inputIterator] : '0')}`, {
                text: 'inputValue',
                inputValue: (trainingData[inputIterator] ? trainingData[inputIterator] : '0'),
                position: {
                    x: inputLayerNeuron[0],
                    y: inputLayerNeuron[1] + 2,
                    z: inputLayerNeuron[2],
                }
            }))
                        //     text.position.x = inputLayerNeuron[0];
            //     text.position.y = inputLayerNeuron[1] + 3;
            //     text.position.z = inputLayerNeuron[2];
            // var loader = new THREE.FontLoader();
            // await loader.load( '../three/examples/fonts/gentilis_regular.typeface.json', async function ( font ) {
            //     var color = 0x006699;
                
            //     var matDark = new THREE.LineBasicMaterial( {
            //         color: color,
            //         side: THREE.DoubleSide
            //     } );
                
            //     var geometry = new THREE.TextGeometry( `${(trainingData[inputIterator] ? trainingData[inputIterator] : '0')}`, {
            //         font: font,
            //         size: 1,
            //         height: 1/100,
            //         curveSegments: 12,
            //     } );

            //     var text = new THREE.Mesh( geometry, matDark );
            //     text.position.x = inputLayerNeuron[0];
            //     text.position.y = inputLayerNeuron[1] + 3;
            //     text.position.z = inputLayerNeuron[2];
            //     text.name = "inputValue";

            //     // if(outputValueIsSet){
            //     //     console.log("Setting output value params");
            //     //     text.zValue = zValue;
            //     //     text.predictionValue = inputValue;
            //     // }
            //     // else{
            //     //     text.name = "inputValue"
            //     // }
            //     scene.add( text );
            // });
            
        })(inputIterator)
        inputIterator+=1;

    };
    console.log("Input loaded");

    // if(!nn_params.training){
    //     nn_params.setTraining(true);
    // }
}