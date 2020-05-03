import sigmoidSquishification from './sigmoidSquishification';

const calculate_gradients = (scene, mode, layer_amt, Dcost_Dactiv_X_Dactiv_Dz)=>{

    let dz_dwArray = [];
    //get all neurons & weights
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
    for (let layer_number=1; layer_number<=layer_amt; layer_number++){
        dataByLayer[`layer_${layer_number}`] = {};
        allNeurons.forEach((neuron)=>{
            if( neuron.name.match( new RegExp(`neuron_L${layer_number}N\\d+`,'g') ) ){
                dataByLayer[`layer_${layer_number}`][`${neuron.name}`] = {
                    zValue: neuron.zValue,
                    outputValue: neuron.value,
                }
            }
        })
    }
    
    // console.log("Weights: ", allWeights);
    
    function DerivOfSigmoid (value){
        console.log("Value from deriv sigmoid: ", value);
        return sigmoidSquishification(value) * (1-sigmoidSquishification(value));
    }
    
    let commonGradient = Dcost_Dactiv_X_Dactiv_Dz;
    let gradients = {};
    //depth of network
    let layer_number = layer_amt;
    
    console.log("data by layer: ", dataByLayer);
    while(layer_number !== 0){

        //compute gradients for each bias
        for (let neuron of allNeurons){

            // console.log( "Neuron name: ", neuron.name );

            // console.log( "Neuron in first layer? ", neuron.name.match(/neuron_L1N\d+/g) );

            if(!neuron.name.match(/neuron_L1N\d+/g)){
                gradients[`${neuron.name}`] = commonGradient;
            }
        }

        //compute gradients for each weight
        for (let weight of allWeights){
            if(weight.weightID.match(new RegExp(`L${layer_number-1}N\\d+-L${layer_number}N\\d+`))){

                //Computes gradients for all weights in layer L-1 --> L, where L is last layer.
                if(layer_number === layer_amt){
                    let toNeuron = weight.weightID.slice(weight.weightID.indexOf('-')+1);
                    let fromNeuron = weight.weightID.substring(0, weight.weightID.indexOf('-'));
                    // console.log("ToNeuron: ", toNeuron);
                    console.log("fromNeuron: ", fromNeuron);
                    // console.log("Layer: ", layer_number);
                    // console.log("To neuron: ", toNeuron);
                    // console.log("From data by layer: ", dataByLayer[`layer_${layer_number}`][`neuron_${fromNeuron}`]);
                    // console.log("From Neuron: ", fromNeuron);
                    // console.log("data by layer: ", dataByLayer[`layer_${layer_number-1}`]);
                    console.log("commonGradient for L-1 layer of weights: ", commonGradient);
                    gradients[`${weight.weightID}`] = commonGradient * dataByLayer[`layer_${layer_number-1}`][`neuron_${fromNeuron}`].outputValue;
                    // gradients[`${weight.weightID}`] = commonGradient * dataByLayer[`layer_${layer_number}`][`neuron_${toNeuron}`].outputValue;
                    console.log(`Gradient for ${weight.weightID}: `, gradients[`${weight.weightID}`]);
                }
                //Computes gradients for weights L-X-1 --> L-X. (WORK IN PROGRESS)
                else{
                    let toNeuron = weight.weightID.slice(weight.weightID.indexOf('-')+1);
                    let fromNeuron = weight.weightID.substring(0, weight.weightID.indexOf('-'));
                    let fromNeuronObj = dataByLayer[`layer_${layer_number-1}`][`neuron_${fromNeuron}`];

                    //Go through all gradients, and see if gradient matches the weight.
                    console.log("Gradients: ", gradients);
                    for (let [key, value] of Object.entries(gradients)){
                        //ensure we only use weight gradients from previous layer - don't include gradients for neuron biases,
                        if( ( !key.match('neuron_') && key.match(new RegExp(`L${layer_number}N\\d+-L${layer_number+1}N\\d+`)) ) &&(key.match(toNeuron) )){
                            console.log("Key: ", key);
                            console.log("Layer Number: ", layer_number-1);

                            console.log("fromNeuron: ", fromNeuron);
                            console.log("Matched fromNeuron? ", !!key.match(fromNeuron));
                            console.log("From neuron data: ", fromNeuronObj);



                            let outputOfFromNeuron = fromNeuronObj.zValue || fromNeuronObj.outputValue;

                            console.log(`
                            value ${value} * 
                            weightValue ${weight.weightValue} * 
                            DerivOfSigmoid - outputOfFromNeuron ${DerivOfSigmoid(outputOfFromNeuron)} *
                            outputOfFromNeuron ${outputOfFromNeuron}`);
                            


                            gradients[`${weight.weightID}`] = value * weight.weightValue * DerivOfSigmoid(outputOfFromNeuron) * outputOfFromNeuron


                            console.log(`Gradient for ${weight.weightID}: `, gradients[`${weight.weightID}`]);

                            // commonGradient = commonGradient * weight.weightValue * DerivOfSigmoid(outputOfFromNeuron);
                            // commonGradient = commonGradient * value * DerivOfSigmoid(value);
                            // commonGradient = commonGradient * value * DerivOfSigmoid(value);
                        }
                    }
                }
            }
        }
        layer_number--;
    }
    // console.log("Gradients: ", gradients);
    return gradients;

}

export default calculate_gradients;