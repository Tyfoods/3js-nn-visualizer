


const backPropagation = (costFunction, activationFunction, trainingData, weights, z, pred, target, nn_params, scene)=>{


    //In this iteration of backpropagation local gradients were calculated during the forward propagation
    //Now it's much easier (possible?) to calculate gradients for arbitrary layer depth.

    //calculate gradients for weights
    //calculate gradients for bias

    //Get all neurons and all weights.
    let allNeurons = [];
    let allWeights = [];
    scene.children.forEach((child)=>{
        if( child.name.match( new RegExp(`neuron_L\\d+N\\d+`,'g') ) ){
            allNeurons.push(child);
        }
        if( child.name.match(/weightValue_\d+/g) ){
            const { weightID, weightValue } = child;
            // console.log("Weight Value: ", child);
            // weightValues.push({weightID, weightValue})
            allWeights.push({weightID, weightValue});
        }
    })

    //seperate neurons into respective layers
    let dataByLayer  = {};
    for (let layer_number=1; layer_number<=nn_params.layer_amt; layer_number++){
        dataByLayer[`layer_${layer_number}`] = {};
        allNeurons.forEach((neuron)=>{
            if( neuron.name.match( new RegExp(`neuron_L${layer_number}N\\d+`,'g') ) ){
                dataByLayer[`layer_${layer_number}`][`${neuron.name}`] = {
                    zValue: neuron.zValue,
                    outputValue: neuron.value,
                    dZ_dBiasPrev_obj: neuron.dZ_dBiasPrev_obj,
                    dZ_dActivPrev_obj: neuron.dZ_dActivPrev_obj,
                    dZ_dW_obj: neuron.dZ_dW_obj,
                    dActiv_dZ: neuron.dActiv_dZ,
                }
            }
        })
    }

    let dCost_dActiv = 2 * (pred - target);


    let gradientsForNextLayerOfWeights = {};
    let gradients = {};
    //depth of network
    let layer_number = nn_params.layer_amt;
    
    // console.log("data by layer: ", dataByLayer);
    while(layer_number !== 0){

        //compute gradients for each weight & the bias of the "from neuron" of that weight.
        for (let weight of allWeights){
            if(weight.weightID.match(new RegExp(`L${layer_number-1}N\\d+-L${layer_number}N\\d+`))){

                //Computes gradients for all weights in layer L-1 --> L, where L is last layer.
                if(layer_number === nn_params.layer_amt){
                    let fromNeuron = weight.weightID.substring(0, weight.weightID.indexOf('-'));
                    let toNeuron = weight.weightID.slice(weight.weightID.indexOf('-')+1);
                    
                    // let dActiv_dZ = dataByLayer[`layer_${layer_number}`][`neuron_${toNeuron}`].dZ;
                    let dZ_dActivPrev_obj = dataByLayer[`layer_${layer_number}`][`neuron_${toNeuron}`].dZ_dActivPrev_obj;
                    let dActiv_dZ = dataByLayer[`layer_${layer_number}`][`neuron_${toNeuron}`].dActiv_dZ;
                    let dZ_dW = dataByLayer[`layer_${layer_number}`][`neuron_${toNeuron}`][`dZ_dW_obj`][`${weight.weightID}`];
                    
                    //create necessary gradients for next layer of weights - the "connection point", I'll elaborate what I mean by "connection point" at some point... lol
                    for (let [id, dZ_dActivPrev] of Object.entries(dZ_dActivPrev_obj)){

                        // console.log("Id for dZ_dactivPrevObj", id);
                        //gradient name is equal to the "from neuron" in the key from the dZ_dActivPrev_obj
                        let gradientName = id.substring(0, weight.weightID.indexOf('-'));
                        // console.log("gradientName produced from ID is", gradientName);

                        gradientsForNextLayerOfWeights[`${gradientName}`] = dCost_dActiv * dActiv_dZ * dZ_dActivPrev;
                    }
                    //Gradient for each weight is a result of the following equation
                    //dCost_dActiv * dActiv_dZ (of - toNeuron) * dZ_dW;
                    gradients[`${weight.weightID}`] = dCost_dActiv * dActiv_dZ * dZ_dW;

                    //calculating bias for to neuron
                    gradients[`neuron_${toNeuron}`] = dCost_dActiv * dActiv_dZ;
                    
                }
                //Computes gradients for weights L-X-1 --> L-X. (WORK IN PROGRESS)
                else{
                    let fromNeuron = weight.weightID.substring(0, weight.weightID.indexOf('-'));
                    let toNeuron = weight.weightID.slice(weight.weightID.indexOf('-')+1);
                    // console.log("To neuron: ", toNeuron);

                    //get appropriate gradient
                    let appropriateGradient = gradientsForNextLayerOfWeights[`${toNeuron}`];
                    // console.log("gradientsForNextLayerOfWeights: ", gradientsForNextLayerOfWeights);
                    // console.log("Appropriate gradient: ", appropriateGradient);

                    
                    
                    

                    let dActiv_dZ = dataByLayer[`layer_${layer_number}`][`neuron_${toNeuron}`].dActiv_dZ;
                    let dZ_dW = dataByLayer[`layer_${layer_number}`][`neuron_${toNeuron}`][`dZ_dW_obj`][`${weight.weightID}`];
                    let dZ_dActivPrev_obj = dataByLayer[`layer_${layer_number}`][`neuron_${toNeuron}`].dZ_dActivPrev_obj;
                    let dZ_dActivPrev;
                    //get correct dZ_dActivPrev
                    for (let [id, dZ_dActivPrevValue] of Object.entries(dZ_dActivPrev_obj)){

                        //gradient name is equal to the "from neuron" in the key from the dZ_dActivPrev_obj
                        let fromNeuronFromID = id.substring(0, weight.weightID.indexOf('-'));
                        if(fromNeuronFromID === fromNeuron){
                            dZ_dActivPrev = dZ_dActivPrevValue;
                        }

                    }
                    
                    //calculate gradient for weights
                    //appropriateGradient * dActiv_dZ * dZ_dW
                    gradients[`${weight.weightID}`] = appropriateGradient * dActiv_dZ * dZ_dW;
                    
                    //calculate gradient for the bias of toNeuron
                    gradients[`neuron_${toNeuron}`] = appropriateGradient * dActiv_dZ;

                    //clear previously made gradients
                    // gradientsForNextLayerOfWeights = {};

                    //create appropriate gradients for next layer
                    //appropriateGradient "connection point gradient" * dActiv_dZ * dZ_dActivPrev
                    gradientsForNextLayerOfWeights[`${fromNeuron}`] = appropriateGradient * dActiv_dZ * dZ_dActivPrev;


                    
                }


                // gradients[]

            }
        }
        layer_number--;
    }
    // console.log("Gradients: ", gradients);
    // console.log("Gradients for next layer of weights: ", gradientsForNextLayerOfWeights);
    return gradients;



}

export default backPropagation