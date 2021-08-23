import Neuron from '../Neuron'
import { GUI } from '../../node_modules/three/examples/jsm/libs/dat.gui.module'
import makeArr from '../../helpers/makeArr'
import isObjEmpty from '../../helpers/isObjEmpty'
import createCanvasTexturedBox from '../../functions/createCanvasTexturedBox'
import createTexture from '../../functions/createTexture'
import sumValuesInArray from '../../helpers/sumValuesInArray'
import createGraph from '../../functions/createGraph'
//@ts-ignore - I don't know why compiler doesn't like this T_T
import mnist from 'mnist'
import housingHeaderBinaryData from '../../dataSets/housing.header.binary'


//Training, Test
var set = mnist.set(100, 2000);

var trainingSet = set.training;
var testSet = set.test;


//@ts-ignore
// console.log("Test Set: ", Object.values(testSet));

const convertMnistFormat = (testSet: any)=>{
    let formattedMnist: number[][] = []
    //@ts-ignore
    Object.values(testSet).forEach((dataPoint)=>{
        formattedMnist.push([dataPoint.input, dataPoint.output])
    })

    return formattedMnist
}

let pseudoTrainingData = convertMnistFormat(trainingSet)
// let pseudoTrainingData = housingHeaderBinaryData;
// console.log(housingHeaderBinaryData)
// let formattedMnistTestSet = convertMnistFormat(testSet)

// console.log("Formatted Mnist Training Set: ", formattedMnistTrainingSet)
// console.log("Formatted Mnist Test Set: ", formattedMnistTestSet)

//TODO: Seperate the class from the data points...
//Should be like [[1,1], [0]]
//That way you can work with networks that have multiple outputs

// var pseudoTrainingData = [
//     //Red Points
//     [[1, 1], [0]],
//     [[2, 1], [0]],
//     [[2, .5], [0]],
//     [[3, 1], [0]],

//     //Blue Points
//     [[3, 1.5], [1]],
//     [[3.5, .5], [1]],
//     [[4, 1.5], [1]],
//     [[5.5, 1], [1]],
// ]

class FeedForwardNeuralNetwork {

    scene: any
    main_nn_gui: any
    nn_params: any

    constructor(scene: any){
        this.main_nn_gui = new GUI({name: "Neural Network Parameters"});
        this.scene = scene
        this.initParams()
        this.setUpGui()
        console.log("FF Neural Network INIT")
    }

    initParams(){
        this.nn_params = {
            currentOutputs: {},
            areWeightsInitialized: false,
            areNodesConnected: false,
            outputsLoaded: false,
            inputsLoaded: false,
            learning_rate: .2,
            iterationSpeed: .5,
            iterations: 1,
            currentInputLayer: 1,
            currentOutputLayer: 2,
            layer_amt: 0,
            layers:{},
            neurons_per_layer: {},
            neuron_coordinates_per_layer: {
            },
            inputObjects:{}
        }
    }

    checkIfAnyLayerIsEmpty(){
        let layerIsEmpty = false
        //@ts-ignore
        Object.values(this.nn_params.neurons_per_layer).forEach((layer)=>{
            //@ts-ignore
            if(!Object.values(layer).length) layerIsEmpty = true
        })
        return layerIsEmpty
    }

    setUpGui(){

        var testObj = {
            'Test': ((networkObject)=>{
                return(
                    ()=>{
                        //TODO: Extract these into function?
                        if(!networkObject.nn_params.areNodesConnected){
                            alert("You must connect nodes first!");
                            return;
                        }
                        if(!networkObject.nn_params.areWeightsInitialized){
                            alert("You must initialize weights first!");
                            return;
                        }
                        networkObject.test()
                    }
                )
            })(this)
        }
        //@ts-ignore
        this.main_nn_gui.add(testObj,'Test');

        var trainObj = {
            'Train': ((networkObject)=>{
                return(
                    ()=>{
                        //TODO: Extract these into function?
                        if(!networkObject.nn_params.areNodesConnected){
                            alert("You must connect nodes first!");
                            return;
                        }
                        if(!networkObject.nn_params.areWeightsInitialized){
                            alert("You must initialize weights first!");
                            return;
                        }
                        networkObject.trainWithStochasticGradientDescent()
                    }
                )
            })(this)
        }
        //@ts-ignore
        this.main_nn_gui.add(trainObj,'Train');

        ((networkObject)=>{
            this.main_nn_gui.add( networkObject.nn_params, 'learning_rate', ).onChange( function () {
                console.log("Learning Rate: ", networkObject.nn_params.learning_rate);
            });
        })(this);

        ((networkObject)=>{
            this.main_nn_gui.add( networkObject.nn_params, 'iterations', ).onChange( function () {
                console.log("Iterations: ", networkObject.nn_params.iterations);
            });
        })(this);

        ((networkObject)=>{
            this.main_nn_gui.add( networkObject.nn_params, 'iterationSpeed', ).onChange( function () {
                console.log("Iteration Speed: ", networkObject.nn_params.iterationSpeed);
            });
        })(this);

        var randomizeWeights = {
            'Randomize Weight': ((networkObject)=>{
                return(
                    ()=>{
                        if(!networkObject.nn_params.areNodesConnected){
                            alert("You must connect nodes first!");
                            return;
                        }
                        if(networkObject.nn_params.areWeightsInitialized){
                            alert("Weights are already initialized!");
                            return;
                        }
                        networkObject.randomizeWeights()
                        networkObject.nn_params.areWeightsInitialized = true;
                    }
                )
            })(this)
        }
        //@ts-ignore
        this.main_nn_gui.add(randomizeWeights,'Randomize Weight');

        var denselyConnectObj = {
            'Densely Connect': ((networkObject)=>{
                return(
                    ()=>{
                        if(this.checkIfAnyLayerIsEmpty()){
                            alert("You must specify layer amount and neurons per layer! \n (Layers must have at least 1 neuron)");
                            return;
                        }
                        if(networkObject.nn_params.areNodesConnected){
                            alert("Nodes are already densely connected");
                            return;
                        }
                        networkObject.denselyConnectNeurons()
                    }
                )
            })(this)
        }
        //@ts-ignore
        this.main_nn_gui.add(denselyConnectObj,'Densely Connect');

        ((networkObject)=>{
            this.main_nn_gui.add( networkObject.nn_params, 'layer_amt', ).onChange( function (number_of_layers: number) {
                networkObject.createLayers(number_of_layers);
            });
        })(this)
    }

    forwardPropagate(trainingData: number[]){
        let inputLayerId = 1
        let layerId: number;
        let outputs: any  = {}
        for (layerId = inputLayerId; layerId<= this.nn_params.layer_amt; layerId+=1){
            outputs[layerId] = {}
            //@ts-ignore
            Object.values(this.nn_params.neurons_per_layer[layerId])
            .forEach((neuron: any)=>{

                let dataPoint = trainingData[neuron.neuronId-1]

                if(neuron.layerId === inputLayerId){
                    outputs[layerId][neuron.neuronId] = dataPoint
                }
                else{
                    //TODO: Make forward propagation handle sparse connections 
                    //@ts-ignore
                    let lastLayerInputs = Object.values(outputs[neuron.layerId-1])
                    let result = neuron.output(lastLayerInputs)
                    outputs[layerId][neuron.neuronId] = result
                }

            })

        }

        this.nn_params.currentOutputs = outputs
        return outputs[this.nn_params.layer_amt]
    }

    //TODO: Take a closer look at promise/iteration speed.
    //I'm just not sure it's working properly

    //@ts-ignore
    async test(){

        let totalError = 0
        // let totalAccuracy = 0;
        for (let currentIteration = 0; currentIteration<this.nn_params.iterations; currentIteration++){
            let i = Math.floor(Math.random() * pseudoTrainingData.length)
            this.loadInputs(pseudoTrainingData[i][0])
            let networkOutput = this.forwardPropagate(pseudoTrainingData[i][0])

            let target = pseudoTrainingData[i][1]

            // let targetValue = pseudoTrainingData[i][1][0]
            // if(this.threshold(networkOutput[1]) === targetValue){
            //     totalAccuracy+=1
            // }
            //@ts-ignore
            let error = this.squaredError(target, Object.values(networkOutput))
            totalError+=error;
            // this.showGraph()
            //@ts-ignore
            await new Promise(r => setTimeout(r, this.nn_params.iterationSpeed));
        }

        console.log("Total Squared Error: ", totalError/this.nn_params.iterations)
        // console.log("Accuracy: ", (totalAccuracy/this.nn_params.iterations)*100)
    }

    threshold(output: number){
        if(output >= .5) return 1
        else return 0
    }

    //@ts-ignore
    async trainWithStochasticGradientDescent(){
        let totalError = 0
        // let totalAccuracy = 0
        for (let currentIteration = 0; currentIteration<this.nn_params.iterations; currentIteration++){
            // console.log("Iteration: ", currentIteration);
            let i = Math.floor(Math.random() * pseudoTrainingData.length)
            // console.log("Data Point: ", pseudoTrainingData[i][0])
            // console.log("Data Point Length: ", pseudoTrainingData[i][0].length)
            //@ts-ignore
            this.loadInputs(pseudoTrainingData[i][0])
            //@ts-ignore
            let networkOutput = this.forwardPropagate(pseudoTrainingData[i][0])
            let target = pseudoTrainingData[i][1]

            // let targetValue = pseudoTrainingData[i][1][0]
            // if(this.threshold(networkOutput[1]) === targetValue){
            //     totalAccuracy+=1
            // }

            this.backPropagate(target, networkOutput)

            //@ts-ignore
            let error = this.squaredError(target, Object.values(networkOutput))
            totalError+=error;
            // this.showGraph();

            //@ts-ignore
            await new Promise(r => setTimeout(r, this.nn_params.iterationSpeed));
        }
        console.log("Total Squared Error: ", totalError/this.nn_params.iterations)
        // console.log("Accuracy: ", (totalAccuracy/this.nn_params.iterations)*100)

    }

    showGraph(){
        if(this.nn_params.layer_amt <= 2){
            // console.log("Neurons per layer: ", this.nn_params.neurons_per_layer);
            //@ts-ignore
            createGraph(pseudoTrainingData, {
                //@ts-ignore
                w1: this.nn_params.neurons_per_layer[2][1].weight_objects[1]['weight_value'],
                //@ts-ignore
                w2: this.nn_params.neurons_per_layer[2][1].weight_objects[2]['weight_value'],
                //@ts-ignore
                b: this.nn_params.neurons_per_layer[2][1].weight_objects[0]['weight_value'],
            }
            , this.scene);
        }
    }

    backPropagate(target: number[], pred: any){
        let targetValue: number[] = target
        //TODO Fix this to handle multi-dimensional output
        //I think this should work now...
        //@ts-ignore
        let predValue: number[] = Object.values(pred)

        // console.log("Target Value: ", targetValue);
        // console.log("Pred Value: ", predValue);

        let derivSquaredError = this.derivSquaredError(targetValue, predValue)
        let gradientObj = this.getLocalGradients();
        // console.log("Deriv Squared Error: ", derivSquaredError);
        // console.log("Gradient Obj: ", gradientObj);
        this.updateWeights(derivSquaredError, gradientObj)
    }

    derivSquaredError(target: number[], pred: number[]){
        let sum = 0;
        for (let i=0; i<target.length; i+=1){
            console.log(`Target: ${target[i]} \n Pred: ${pred[i]}`)
            let result = 2 * (pred[i] - target[i])
            // let result = 2 * (target[i] - pred[i])
            sum+=result
        }
        return sum;
    }
    
    squaredError(target: number[], pred: number[]){
        let sum = 0;
        for (let i=0; i<target.length; i+=1){
            // console.log(`Target: ${target[i]} \n Pred: ${pred[i]}`)
            let result = Math.pow(pred[i] - target[i], 2)/2
            // let result = Math.pow(target[i] - pred[i], 2)/2
            sum+=result
        }
        return sum;
        // return Math.pow(target - pred, 2)/2
    }

    explainBackpropagation(gradientStore: any){
        //Given target weight 1 in of neuron 1 in layer 2
        //In layer i these neurons connect to layer neuron 1 and therefore to weight 1
    }

    getAllGradientsInChain(gradientObj: any, target: any, ){
        let gradient = gradientObj[target.layerId][target.neuronId]['weights'][target.weightId]
        let gradientStore: any = {gradient}

        let startingLayer = target.layerId+1
        let neuronsInPrevLayer: number[] = [parseInt(target.neuronId)];
        let i: number;

        //If altering weights of an output neuron
        //There is no chain to traverse
        if(startingLayer > this.nn_params.layer_amt){
            // return gradient
            // console.log("Returning gradient");
            return gradientStore
        }

        //Kinda like backpropagation backwards in a way...

        //Traverse the chain starting from layer first layer after input layer
        for (i = startingLayer; i<=this.nn_params.layer_amt; i+=1){
            gradientStore[i] = {}
            //Looping through each neuron in layer i
            //@ts-ignore
            Object.entries(gradientObj[i]).forEach(([neuronId, gradientData])=>{
                //@ts-ignore
                //Looping through input weights to neuronId
                Object.entries(gradientData['continueChain']).forEach(([preNeuronId, value])=>{
                    //@ts-ignore
                    //Check if input weight is connecting to last neuron in chain.
                    if(neuronsInPrevLayer.includes(parseInt(preNeuronId))){
                        // gradientStore[i][preNeuronId] = value
                        gradientStore[i][neuronId] = value
                        neuronsInPrevLayer.push(parseInt(preNeuronId))
                    }
                })
            })
            //TODO: Pretty sure this should handle sparse connections too.
            neuronsInPrevLayer = Object.keys(gradientObj[i]).map((key)=>parseInt(key))
        }

        /* 	//Loop through all layers for each weightId
            Object.entries(gradientObj).forEach(([layerId, gradientDataPerNeuron])=>{
                Object.entries(gradientDataPerNeuron).forEach(([neuronId, gradientData])=>{
                    
                })
            })
        */

        return gradientStore    
    }

    updateWeights(derivSquaredError: number, gradientObj: any){
        let inputLayerId = 1
        //@ts-ignore
        Object.entries(this.nn_params.neurons_per_layer).forEach(([layerId, layer])=>{
            if(layerId == inputLayerId){
                // console.log("Layer is equal to input layer - not proceeding");
                return;
            }
            // console.log("LAYER ID: ", layerId)
            //@ts-ignore
            Object.values(layer).forEach((neuron)=>{
                //@ts-ignore
                Object.values(neuron.weight_objects).forEach((weight_object)=>{
                    let weight_id = weight_object.weight_id
                    //Get all gradients on the way to this weight
                    const target = {
                        neuronId: neuron.neuronId,
                        layerId: neuron.layerId,
                        weightId: weight_id
                    }
                    // console.log(`Layer ${neuron.layerId} Neuron ${neuron.neuronId} Weight ${weight_id}`)

                    //There are potentially multiple routes to any given weight in the neural network
                    //Here we get all the possible routes and then we sum these routes.
                    let gradientStore = this.getAllGradientsInChain(gradientObj, target)
                    // console.log("Gradient Store: ", gradientStore);
                    let combinedGradient = this.combineGradientPaths([gradientStore.gradient],gradientStore)
                    // console.log("Combined Gradient: ", combinedGradient);
                    let gradient = -(this.nn_params.learning_rate * (derivSquaredError*combinedGradient))
                    // console.log("Gradient: ", gradient);
                    neuron.updateWeight(weight_id, gradient)
                })
            })
        })
    }

    getGradientPaths = (gradArr: number[], layerObj: any)=>{
		let outputs: number[] = []
        gradArr.forEach((gradient)=>{
            //@ts-ignore
            Object.values(layerObj).forEach((weightGradient)=>{
                let result = gradient * weightGradient
                outputs.push(result)
            })
        })
        return outputs
    }

    combineGradientPaths = (gradientArray: number[], gradientStore: any)=>{
        //@ts-ignore
        Object.entries(gradientStore).forEach(([layerId, weightGradients])=>{
            if(layerId === 'gradient') return;
            gradientArray = this.getGradientPaths(gradientArray, weightGradients)
        })
        return sumValuesInArray(gradientArray)
    }

    calculateGradientFromGradientStore(gradientStore: any, target: any){
        //@ts-ignore
        Object.values(gradientStore).forEach((layer: any)=>{

        })
    }

    getLocalGradients(){
        let gradientObj: any = {}
        let inputLayerId = 1

        // console.log("Current Outputs of All Neurons: ", this.nn_params.currentOutputs)

        //@ts-ignore
        Object.entries(this.nn_params.neurons_per_layer).forEach(([layerId, layer])=>{
            if(layerId == inputLayerId){
                // console.log("Layer is equal to input layer - not proceeding");
                return;
            }
            //Initializing to set it later.
            gradientObj[layerId] = {}
            //@ts-ignore
            Object.values(layer).forEach((neuron)=>{
                let output = this.nn_params.currentOutputs[neuron.layerId][neuron.neuronId]
                // console.log(`Layer ${neuron.layerId} Neuron ${neuron.neuronId} Output: ${output}`)
                let inputsFromLastLayer = this.nn_params.currentOutputs[neuron.layerId-1]
                gradientObj[layerId][neuron.neuronId] = neuron.calculateLocalGradient(output, inputsFromLastLayer)
            })

        })

        return gradientObj
    }


    countWeightsOfEachNeuron(){
        if(isObjEmpty(this.nn_params.neurons_per_layer)) return;
        //@ts-ignore
        let layers = Object.values(this.nn_params.neurons_per_layer)
        layers.forEach((layer: any)=>{
            //@ts-ignore
            Object.values(layer).forEach((neuron: any)=>{
                //@ts-ignore
                let numberOfWeights = Object.values(neuron.weight_objects).length
                console.log(`Neuron ${neuron.neuronId} Layer ${neuron.layerId} Number Of Weights: ${numberOfWeights}`)
            })
        })
    }

    randomizeWeights(){
        if(isObjEmpty(this.nn_params.neurons_per_layer)) return;
        //@ts-ignore
        let layers = Object.values(this.nn_params.neurons_per_layer)
        layers.forEach((layer: any)=>{
            //@ts-ignore
            Object.values(layer).forEach((neuron: any)=>{
                neuron.randomizeWeights()
            })
        })

    }

    removeAllConnections(){
        this.unloadInputs()
        if(isObjEmpty(this.nn_params.neurons_per_layer)) return;
        //@ts-ignore
        let layers = Object.values(this.nn_params.neurons_per_layer)
        layers.forEach((layer: any)=>{
            //@ts-ignore
            Object.values(layer).forEach((neuron: any)=>{
                if(!isObjEmpty(neuron.weight_objects)){
                    //@ts-ignore
                    Object.values(neuron.weight_objects).forEach((weight)=>{
                        this.scene.remove(weight.weight_object)
                        this.scene.remove(weight.weight_display_box)
                    })
                }
                neuron.weight_objects = {}
            })
        })
        // this.unloadInputs()
        this.nn_params.areNodesConnected = false
        this.nn_params.areWeightsInitialized = false
    }

    unloadInputs(){
        //@ts-ignore
        Object.values(this.nn_params.inputObjects).forEach((inputObject)=>{
            this.scene.remove(inputObject)
        })
        this.nn_params.inputsLoaded = false
    }

    deleteOldNeurons(layerName: string){
        if(!this.nn_params.neurons_per_layer[layerName]) return;
        //@ts-ignore
        let layer = Object.values(this.nn_params.neurons_per_layer[layerName])
        // console.log("Layer: ", layer);
        layer.forEach((neuron: any)=>{
            //@ts-ignore
            this.scene.remove(neuron.threejs_object)
            this.scene.remove(neuron.outputDisplayBox)
            if(!isObjEmpty(neuron.weight_objects)){
                //@ts-ignore
                Object.values(neuron.weight_objects).forEach((weight)=>{
                    this.scene.remove(weight.weight_object)
                    this.scene.remove(weight.weight_display_box)
                })
            }
            //Get rid of neuron
            delete this.nn_params.neurons_per_layer[layerName][neuron.neuronId]
        })
    }

    resetLayersBeforeCreatingNewOnes(){
        //Reset all layers/neurons before re-recreating
        if(this.main_nn_gui.__folders){

            //@ts-ignore
            Object.values(this.nn_params.layers).forEach((layer: any)=>{
                this.main_nn_gui.removeFolder(layer);
            })

            if(isObjEmpty(this.nn_params.neurons_per_layer)) return
            Object.keys(this.nn_params.neurons_per_layer).forEach((layerName)=>{
                this.deleteOldNeurons(layerName)
            })

            this.nn_params.neurons_per_layer = {}
            this.nn_params.layers = {}
        }
        this.removeAllConnections()
        this.nn_params.areNodesConnected = false
    }

    createLayers(number_of_layers: number){

        this.resetLayersBeforeCreatingNewOnes()

        // created for each layer
        var nn_layer_params = {
            neuron_amt: 0,
            density: 0,
            recurrent: false,
        }

        var layer_id = 1;
        for( layer_id = 1; layer_id < number_of_layers+1; layer_id+=1 ){
            //Init neurons per layer
            this.nn_params.neurons_per_layer[`${layer_id}`] = {}

            var xcoord = (()=>{
                if(layer_id === 0){
                    return 0;
                }
                else{
        
                    return (layer_id-1)*15;
                }
            })();

            //For each layer, create a GUI folder
            this.nn_params.layers[`${layer_id}`] = this.main_nn_gui.addFolder(`Layer ${layer_id}`);

            //For each layer, add parameter "neuron amount"
            ((xcoord, layer_id)=>{
                this.nn_params.layers[`${layer_id}`].add( nn_layer_params, 'neuron_amt', ).onChange((neuron_amt: number)=>{

                    this.removeAllConnections()
                    this.deleteOldNeurons(`${layer_id}`)
    
                    var range = (neuron_amt - 1) * 6;
                
                    var yCoordsArray = makeArr(range, -range, neuron_amt);
    
                    var neuron_id = 1
                    for( neuron_id = 1; neuron_id < neuron_amt+1; neuron_id+=1 ){
                        let coords = [xcoord, yCoordsArray[neuron_id-1], 0]
                        let neuron_object = new Neuron(neuron_id, layer_id, coords, this.scene, this)
                        neuron_object.createNeuronInScene()
                        this.nn_params.neurons_per_layer[`${layer_id}`][`${neuron_id}`] = neuron_object
                    }
    
                })
            })(xcoord, layer_id)
        }

        this.nn_params.layer_amt = number_of_layers
    }

    denselyConnectNeurons(){
        
        //@ts-ignore
        Object.values(this.nn_params.neurons_per_layer).forEach((layer)=>{
            //@ts-ignore
            Object.values(layer).forEach((neuron)=>{
                neuron.denselyConnect()
            })
        })
        this.nn_params.areNodesConnected = true;

    }

    loadInputs = (trainingData: number[])=>{
        if(!this.nn_params.inputsLoaded){

            

            var inputIterator = 0;
            //@ts-ignore
            Object.values(this.nn_params.neurons_per_layer[1]).forEach((inputNeuron)=>{

                //Don't render input box if nueron isn't visible
                if(!inputNeuron.threejs_object.visible) return

                let input = createCanvasTexturedBox(`${(trainingData[inputIterator] ? trainingData[inputIterator] : '0')}`, {
                    text: 'inputValue',
                    inputValue: (trainingData[inputIterator] ? trainingData[inputIterator] : '0'),
                    position: {
                        x: inputNeuron.threejs_object.position.x,
                        y: inputNeuron.threejs_object.position.y + 2,
                        z: inputNeuron.threejs_object.position.z,
                    },
                    visible: true,
                })

                this.nn_params.inputObjects[inputIterator] = input
                this.scene.add(input)

                inputIterator+=1
            })
            this.nn_params.inputsLoaded = true;

        }
        else{
            var inputIterator = 0;
            //@ts-ignore
            Object.values(this.nn_params.inputObjects).forEach((inputObject)=>{
                inputObject.material.map = createTexture({}, `${trainingData[inputIterator]}`.substring(0, 4));
                inputObject.material.needsUpdate = true;
                inputIterator+=1
            })

        }
    }
}


export default FeedForwardNeuralNetwork

