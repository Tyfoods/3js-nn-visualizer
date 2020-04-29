import * as THREE from '../../three/build/three.module.js';
import makeArr from './makeArr.js';
import createTexture from './createTexture.js';
import Globals from '../Globals.js';


const createNeurons = (nn_layer_params, layerNumber, nn_params, scene)=>{


    var xcoord = (()=>{
        if(layerNumber === 0){
            return 0;
        }
        else{

            return (layerNumber-1)*15;
        }
    })();
    // console.log(`Layer ${layerNumber} xcoord: ${xcoord}`);



    var range = (nn_layer_params.neuron_amt - 1) * 6;

    var ycoordsArray = makeArr(range, -range, nn_layer_params.neuron_amt);
    // console.log(ycoordsArray);

    //on neuron amount change, for particular layer 
    // console.log('init var')
    // var spaceBetweenNeuronsYAxis = 1;
    for( var i = 1; i <= nn_layer_params.neuron_amt; i++){
        // console.log(`adding neuron: ${i}`);

        // let textureParameters = { fontSize: 10, backgroundColor: { r:80, g:24, b:133, a:0.8 }};

        let neuronBias = Math.random()*.2-.1;
        // console.log("Neuron Bias: ", neuronBias);
        // let texture = createTexture(textureParameters, neuronBias.toString().substring(0,3));
        var geometry = new THREE.SphereGeometry(1, 32, 32);
        var material = new THREE.MeshBasicMaterial( { color: 0x501885 ,/*  map: texture, */} );
        var neuron = new THREE.Mesh( geometry, material );


        // console.log("X coord of neurons set to ", xcoord);
        // sphere.position.set( xcoord, spaceBetweenNeuronsYAxis, 0 );
        // console.log(ycoordsArray[i-1]);

        nn_params.neuron_coordinates_per_layer[`Layer ${layerNumber}`][`N${i-1}`] = [xcoord, ycoordsArray[i-1], 0];

        neuron.position.set( xcoord, ycoordsArray[i-1], 0 );
        // neuron.name = `neuron_L${layerNumber}N${i}`;
        neuron.name = `neuron_L${layerNumber}N${i-1}`;
        neuron.bias = neuronBias;
        Globals.biasesObj[`${neuron.name}`] = neuronBias;
        // console.log("Neuron name: ", neuron.name);
        scene.add( neuron );


        // spaceBetweenNeuronsYAxis+=6;
        // spaceBetweenNeuronsYAxis*=-1;
        // console.log(`Layer ${layerNumber} - neuron y position: ${spaceBetweenNeuronsYAxis}`);
    }
}

export default createNeurons;