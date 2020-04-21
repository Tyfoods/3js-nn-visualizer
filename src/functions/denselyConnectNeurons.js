// var denselyConnectNeurons = {
//     'Densely Connect': 
// import * as THREE from '../three/build/three.module.js';
import * as THREE from '../../three/build/three.module.js';
// import {Line3} from '../../three/src/math/Line3.js';
    
    function denselyConnectNeurons(nn_params, scene, weightsObj){
        console.log("Densely Connecting Neurons");
        // console.log(nn_params.neuron_coordinates_per_layer);

        var prev_layer_data;
        var first_layer_data;
        for (let [layer_ID, layer_data] of Object.entries(nn_params.neuron_coordinates_per_layer)){
            // console.log(`${layer_ID} data: `, layer_data);
            //For each neuron in the layer
            if(layer_ID === 'Layer 1' && typeof input_layer_data === 'undefined'){
                first_layer_data = Object.values(layer_data);
            }
            else{
                let input_layer_data;
                for (let [neuron_ID, neuron_coords] of Object.entries(layer_data)){
                    
                    if(prev_layer_data){
                        input_layer_data = prev_layer_data;
                    }
                    else{
                        input_layer_data = first_layer_data;
                    }
                    //connect neuron in layer X, to every neuron previous layer
                    var points = [];
                    let input_layer_neuron_amt = Object.keys(input_layer_data).length;
                    for (let i=0; i<input_layer_neuron_amt; i++){

                        points.push(new THREE.Vector3(neuron_coords[0], neuron_coords[1], neuron_coords[2]));
                        points.push(new THREE.Vector3(input_layer_data[i][0], input_layer_data[i][1], input_layer_data[i][2]));

                        if(first_layer_data){
                            weightsObj.setWeightCenterCoords([
                                (neuron_coords[0] + input_layer_data[i][0] / 2)/2,
                                neuron_coords[1] + input_layer_data[i][1] / 2,
                                neuron_coords[2] + input_layer_data[i][2] / 2,
                            ])
                        }

                        var material = new THREE.LineBasicMaterial( { color: 0x501885 } );
                        var geometry = new THREE.BufferGeometry().setFromPoints( points );
                        var weight = new THREE.Line( geometry, material );
                        weight.name = 'weight';
                        scene.add( weight );
                    }

                }
                prev_layer_data = Object.values(layer_data);
            }
        }
    }
// };

export default denselyConnectNeurons;

