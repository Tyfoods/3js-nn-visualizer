
import createNeurons from './createNeurons.js';
    
    const createLayers = (nn_params, lastLayerAmtObj, main_nn_gui, scene)=>{

        //created for each layer
        var nn_layer_params = {
            neuron_amt: 0,
            density: 0,
            recurrent: false,
        }

        // var xcoord = 0;
        for( var i = 1; i <= parseInt(nn_params.layer_amt); i++){

            // console.log(`xcoord before increment: ${xcoord}`)

            //For each layer, create a GUI folder
            nn_params[`Layer ${i}`] = main_nn_gui.addFolder(`Layer ${i}`);
            nn_params.neuron_coordinates_per_layer[`Layer ${i}`] = {};
            //For each layer, add parameter "neuron amount"
            nn_params[`Layer ${i}`].add( nn_layer_params, 'neuron_amt', ).onChange(
                ((i)=>{
                // console.log("i");
                return ()=>{
                    if(nn_layer_params.neuron_amt === 0){
                        console.log("Deleting neurons");
                        //deleteNeurons();
                    }
                    else{
                        // console.log("layer Number", i);
                        createNeurons(nn_layer_params, i, nn_params, scene);
                    }
                }

                })(i)
            );
            
            // xcoord +=5;
        }

        lastLayerAmtObj.setLastLayerAmt(nn_params.layer_amt);
        // lastLayerAmt = nn_params.layer_amt;
    }

    export default createLayers;