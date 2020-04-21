import * as THREE from '../../three/build/three.module.js';
import makeArr from './makeArr.js';

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
        var geometry = new THREE.SphereGeometry(1, 32, 32);
        var material = new THREE.MeshBasicMaterial( { color: 0x501885 } );
        var neuron = new THREE.Mesh( geometry, material );


        // console.log("X coord of neurons set to ", xcoord);
        // sphere.position.set( xcoord, spaceBetweenNeuronsYAxis, 0 );
        // console.log(ycoordsArray[i-1]);

        nn_params.neuron_coordinates_per_layer[`Layer ${layerNumber}`][`n${i}`] = [xcoord, ycoordsArray[i-1], 0];

        neuron.position.set( xcoord, ycoordsArray[i-1], 0 );
        neuron.name = 'neuron';
        scene.add( neuron );


        // spaceBetweenNeuronsYAxis+=6;
        // spaceBetweenNeuronsYAxis*=-1;
        // console.log(`Layer ${layerNumber} - neuron y position: ${spaceBetweenNeuronsYAxis}`);
    }
}

export default createNeurons;