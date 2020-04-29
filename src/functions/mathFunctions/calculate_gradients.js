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
            allWeights.push(weightID);
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
    
    // console.log("data by layer: ", dataByLayer);
    // console.log("Weights: ", allWeights);
    
    function DerivOfSigmoid (value){
        return ( sigmoidSquishification(value) * 1-sigmoidSquishification(value) );
    }
    
    let commonGradient = Dcost_Dactiv_X_Dactiv_Dz;
    let gradients = {};
    //depth of network
    let layer_number = layer_amt;
    //start at second to last layer
    while(layer_number !== 0){
        //get all weights in current layer
        // console.log(`Computing gradients for ${layer_number-1}-L${layer_number}`);
        // console.log("Layer : ", layer_number);

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
            if(weight.match(new RegExp(`L${layer_number-1}N\\d+-L${layer_number}N\\d+`))){

                if(layer_number === layer_amt){
                    let toNeuron = weight.slice(weight.indexOf('-')+1);
                    let fromNeuron = weight.substring(0, weight.indexOf('-'));
                    // console.log("ToNeuron: ", toNeuron);
                    // console.log("fromNeuron: ", fromNeuron);
                    // console.log("Layer: ", layer_number);
                    // console.log("To neuron: ", toNeuron);
                    // console.log("From data by layer: ", dataByLayer[`layer_${layer_number}`][`neuron_${fromNeuron}`]);
                    // console.log("From Neuron: ", fromNeuron);
                    // console.log("data by layer: ", dataByLayer[`layer_${layer_number-1}`]);
                    gradients[`${weight}`] = commonGradient * dataByLayer[`layer_${layer_number-1}`][`neuron_${fromNeuron}`].outputValue;
                    // console.log("New Gradient: ", gradients[`${weight}`]);
                }
                else{
                    let toNeuron = weight.slice(weight.indexOf('-')+1);
                    let fromNeuron = weight.substring(0, weight.indexOf('-'));
                    // console.log("ToNeuron: ", toNeuron);
                    // console.log("fromNeuron: ", fromNeuron);
                    // console.log(" L-X where X>1 weight layerData: ", dataByLayer )
                    // console.log("More detail: ", dataByLayer[`layer_${layer_number}`]);
                    for (let [key, value] of Object.entries(gradients)){
                        // console.log("Key: ", key);
                        if(key.match(toNeuron) || key.match(fromNeuron)){
                            // console.log("To neuron data for L-X where X>1 weight: ", dataByLayer[`layer_${layer_number}`][`neuron_${toNeuron}`]);
                            // console.log("Layer Number: ", layer_number);
                            // console.log("To Neuron: ", toNeuron);
                            // console.log("Layer: ", layer_number);
                            // console.log("To neuron w/ text: ", `neuron_${toNeuron}`);
                            // console.log(`
                            //     commonGradient ${commonGradient} * 
                            //     value ${value} * 
                            //     DerivOfSigmoid ${DerivOfSigmoid(value)} *
                            //     neuronOutputValue ${dataByLayer[`layer_${layer_number-1}`][`neuron_${fromNeuron}`].outputValue}`);
                            // console.log("Data by layer: ", dataByLayer[`layer_${layer_number-1}`][`neuron_${fromNeuron}`].outputValue)
                            // console.log("New Gradient: ", commonGradient * value * DerivOfSigmoid(value) * dataByLayer[`layer_${layer_number-1}`][`neuron_${fromNeuron}`].outputValue)
                            gradients[`${weight}`] = commonGradient * value * DerivOfSigmoid(value) * dataByLayer[`layer_${layer_number-1}`][`neuron_${fromNeuron}`].outputValue;
                            commonGradient = commonGradient * value * DerivOfSigmoid(value);
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