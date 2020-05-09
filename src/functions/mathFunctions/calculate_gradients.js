import sigmoidSquishification from './sigmoidSquishification';
import derivOfSigmoid from './derivOfSigmoid.js';

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
    
    // function derivOfSigmoid (value){
    //     return sigmoidSquishification(value) * (1-sigmoidSquishification(value));
    // }
    
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


            //OLD
            // if(!neuron.name.match(/neuron_L1N\d+/g)){
            //     if(layer_number === layer_amt){
            //         gradients[`${neuron.name}`] = commonGradient;
            //     }
            // }


            // if(!neuron.name.match(/neuron_L1N\d+/g)){
                // if(neuron.name.match(new RegExp(`neuron_L${layer_number}N\\d+`))){
                //     if(layer_number === layer_amt){
                //         gradients[`${neuron.name}`] = commonGradient;
                //     }
                //     else{
                //         //don't calculate the gradient for the bias here
                //         //instead calculate it while calcuating weight biases in L-X where X>1 layers
                //     }
                // }
            // }
        }

        //compute gradients for each weight
        for (let weight of allWeights){
            if(weight.weightID.match(new RegExp(`L${layer_number-1}N\\d+-L${layer_number}N\\d+`))){

                //Computes gradients for all weights in layer L-1 --> L, where L is last layer.
                if(layer_number === layer_amt){
                    let toNeuron = weight.weightID.slice(weight.weightID.indexOf('-')+1);

                    //compute gradient of neuron in last layer
                    gradients[`neuron_${toNeuron}`] = commonGradient;

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
                            commonGradient ${commonGradient} * 
                            weightValue ${weight.weightValue} * 
                            derivOfSigmoid - outputOfFromNeuron ${derivOfSigmoid(outputOfFromNeuron)} *
                            outputOfFromNeuron ${outputOfFromNeuron}`);
                            

                            //gradient of previous weight * derivative_
                            gradients[`${weight.weightID}`] = commonGradient * weight.weightValue * derivOfSigmoid(outputOfFromNeuron) * outputOfFromNeuron;

                            //compute bias gradient for neuron in L-X layer where X>1
                            gradients[`neuron_${toNeuron}`] = commonGradient * weight.weightValue * derivOfSigmoid(outputOfFromNeuron);
                            console.log(`Gradient for neuron_${toNeuron}: `, gradients[`neuron_${toNeuron}`]);

                            console.log(`Gradient for ${weight.weightID}: `, gradients[`${weight.weightID}`]);

                            // commonGradient = commonGradient * weight.weightValue * derivOfSigmoid(outputOfFromNeuron);
                            // commonGradient = commonGradient * value * derivOfSigmoid(value);
                            // commonGradient = commonGradient * value * derivOfSigmoid(value);
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