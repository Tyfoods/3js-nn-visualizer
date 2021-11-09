// import { GUI } from '../../three/examples/jsm/libs/dat.gui.module.js';
import { GUI } from '../node_modules/three/examples/jsm/libs/dat.gui.module'


class NetworkControllerUI {

    main_nn_gui: any
    networkObject: any

    constructor(networkObject: any){
        this.main_nn_gui = new GUI({name: "Neural Network Parameters"});
        this.networkObject = networkObject
        console.log("Neural Network Controller UI rendered");
        this.setUpGui()
    }



    setUpGui(){

        ((networkObject)=>{
            this.main_nn_gui.add( this.networkObject, 'layer_amt', ).onChange( function (number_of_layers: number) {
                // console.log("Layer amt is: ", number_of_layers);
    
                networkObject.createLayers(number_of_layers);
        
            //     if(nn_params.layer_amt === 0){
            //         // console.log(`Deleting Layers`)
            //         //     currentLayerAmount: ${nn_params.layer_amt}
            //         //     lastLayerAmt: ${lastLayerAmt}`);
            //         // main__nn_gui.destroy();
            //         deleteLayers();
            //     }
            //     else if(nn_params.layer_amt && nn_params.layer_amt !== lastLayerAmt){
        
            //         // console.log(`Updating layers`)
            //         //     currentLayerAmount: ${nn_params.layer_amt}
            //         //     lastLayerAmt: ${lastLayerAmt}`);
            //         deleteLayers();
            //         createLayers();
            //     }
            });
        })(this.networkObject)
        //@ts-ignore
    }


 

}


        


export default NetworkControllerUI