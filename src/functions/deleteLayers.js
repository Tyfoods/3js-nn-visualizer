const deleteLayers = (main_nn_gui, scene, lastLayerAmtObj, nn_params)=>{
    // console.log("Deleting layers");
    let numberOfChildrenInScene = scene.children.length;
    for (let i=0; i<numberOfChildrenInScene; i++){
        // console.log(scene.children[0]);
        if(scene.children[0].name.match(/neuron_L\d+N\d+/g) ||
            scene.children[0].name === 'weight' ||
            scene.children[0].name === 'inputValue' ||
            scene.children[0].name === 'outputValue' ||
            scene.children[0].name === 'graph' ||
            scene.children[0].name.match(/weightValue_\d+/g) ){
            scene.remove(scene.children[0]);
        }
    }

    nn_params.areNodesConnected = false;
    nn_params.areWeightsInitialized = false;
    nn_params.inputsLoaded = false;
    nn_params.outputsLoaded = false;
    console.log("Inputs et all cleared");

    // var neuronObj = scene.getObjectByName('neuron');
    // var weightObj = scene.getObjectByName('weight');
    // scene.remove( neuronObj );
    // scene.remove( weightObj );

    for( var i = 1; i <= lastLayerAmtObj.lastLayerAmt; i++){
        // console.log("iterator: ", i);
        main_nn_gui.removeFolder(nn_params[`Layer ${i}`]);

        //remove neurons in particular layer
        // for( var i = 1; i <= nn_layer_params.neuron_amt; i++){
        //     console.log(`adding neuron: ${i}`);
        //     var geometry = new THREE.SphereGeometry(1, 32, 32);
        //     var material = new THREE.MeshBasicMaterial( { color: 0x501885 } );
        //     var sphere = new THREE.Mesh( geometry, material );

        //     sphere.position.set( xcoord, spaceBetweenNeuronsYAxis, 0 );
        //     scene.add( sphere );
        //     spaceBetweenNeuronsYAxis+=5;
        // }
    }
    // lastLayerAmt = 0;
    lastLayerAmtObj.setLastLayerAmt(0);
}

export default deleteLayers;