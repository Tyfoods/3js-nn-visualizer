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


        for (let [layer_ID, current_layer_data] of Object.entries(nn_params.neuron_coordinates_per_layer)){
            // console.log(`${layer_ID} data: `, current_layer_data);
            //For each neuron in the layer
            if(layer_ID === 'Layer 1' && typeof input_layer_data === 'undefined'){
                first_layer_data = Object.values(current_layer_data);
            }
            else{
                let input_layer_data;
                for (let [neuron_ID, neuron_coords] of Object.entries(current_layer_data)){
                    
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

                        let weightID = (()=>{
                            let startingPoint = parseInt(layer_ID.replace("Layer ", "")) - 1;
                            let endPoint = parseInt(layer_ID.replace("Layer ", ""));
                            return `L${startingPoint}N${i}-L${endPoint}${neuron_ID}`

                        })()


                        if(first_layer_data){
                            weightsObj.addWeightCenterCoords([
                                (neuron_coords[0] + input_layer_data[i][0] / 2)/2,
                                neuron_coords[1] + input_layer_data[i][1] / 2,
                                neuron_coords[2] + input_layer_data[i][2] / 2,
                                weightID,
                            ])
                        }

                        var material = new THREE.LineBasicMaterial( { color: 0x501885 } );
                        var geometry = new THREE.BufferGeometry().setFromPoints( points );
                        var weight = new THREE.Line( geometry, material );
                        weight.name = 'weight';
                        weight.weightID = weightID;

                        // console.log("Layer ID before adding weight: ", layer_ID);
                        // console.log("Neuron ID in current layer: ", i);
                        // console.log("Previous layer ", input_layer_data);
                        // console.log(`Current Layer Data: ${current_layer_data} layer number ${layer_ID}`);
                        
                        scene.add( weight );
                    }

                }
                prev_layer_data = Object.values(current_layer_data);
            }
        }
    }
// };

export default denselyConnectNeurons;

