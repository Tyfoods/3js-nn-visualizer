import Neuron from '../Neuron'
import Dat from 'dat.gui';
import init from 'three-dat.gui'; // Import initialization method
init(Dat); // Init three-dat.gui with Dat
import makeArr from '../../helpers/makeArr'
import isObjEmpty from '../../helpers/isObjEmpty'
import createCanvasTexturedBox from '../../functions/createCanvasTexturedBox'
import createTexture from '../../functions/createTexture'
import sumValuesInArray from '../../helpers/sumValuesInArray'
import createGraph from '../../functions/createGraph'
// import calculateDistanceBetweenVectors from '../../mathFunctions/calculateDistanceBetweenVectors'
//@ts-ignore - I don't know why TS compiler doesn't like this T_T, but it doesn't like a lot of things.
import mnist from 'mnist'
// import housingHeaderBinaryData from '../../dataSets/housing.header.binary'
import irisData from '../data/irisData'
import elementWiseOperationOnVector from '../../mathFunctions/elementWiseOperationOnVector'
import calculateDifferenceBetweenTwoVectors from '../../mathFunctions/calculateDifferenceBetweenTwoVectors'
// import RealTimeChart from '../RealTimeChart'
// import Graph from '../Graph'



//XOR DATA
let xorData = [
    [[1,1],[0]],
    [[0,1],[1]],
    [[1,0],[1]],
    [[0,0],[0]],
]

const generateIrisDataWithLabel = (irisData: number[][]): number[][][] => {
    const dataWithLabel = irisData.map((data: number[], index: number)=>{
        if(index < 50){
            return [data, [1, 0, 0]];
            // return [data, [0]];
        }   
        if(index <= 100){
            return [data, [0, 1, 0]];
            // return [data, [.5]];
        }
        if(index > 100){
            return [data, [0, 0, 1]];
            // return [data, [1]];
        }
        return [data, [0, 0, 0]];
    })
    return dataWithLabel;
}


//Training, Test for MNIST
// var set = mnist.set(100, 2000);
// var trainingSet = set.training;
// var testSet = set.test;

//@ts-ignore
// console.log("Test Set: ", Object.values(testSet));

const convertMnistFormat = (testSet: any)=>{
    let formattedMnist: number[][] = []
    Object.values(testSet).forEach((dataPoint: any)=>{
        formattedMnist.push([dataPoint.input, dataPoint.output])
    })
    return formattedMnist
}

const minMaxNormalize = (data: number[][]): number[][] => {
    if (!data.length) return data;
    const dims = data[0].length;
    const mins = new Array(dims).fill(Infinity);
    const maxs = new Array(dims).fill(-Infinity);
    data.forEach((row) => {
        for (let j = 0; j < dims; j += 1) {
            const v = row[j];
            if (v < mins[j]) mins[j] = v;
            if (v > maxs[j]) maxs[j] = v;
        }
    });
    return data.map((row) =>
        row.map((v, j) => {
            const range = maxs[j] - mins[j];
            if (range === 0) return 0;
            return (v - mins[j]) / range;
        })
    );
};
// let trainingData = convertMnistFormat(trainingSet)
let normalizedIrisData = minMaxNormalize(irisData)
console.log("Normalized Iris Data: ", normalizedIrisData)
const irisDataWithLabel = generateIrisDataWithLabel(normalizedIrisData)
// let trainingData = xorData
let trainingData = irisDataWithLabel
if(trainingData.length){
    console.log("Data Dimensions: ", trainingData[0][0])
    console.log("Label Dimensions: ", trainingData[0][1])
}
else{
    throw new Error("No pseudo training data found");
}
// let trainingData = housingHeaderBinaryData;
// console.log(housingHeaderBinaryData)
// let formattedMnistTestSet = convertMnistFormat(testSet)



// var trainingData = [
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
    // measurementChart: any;
    // measurementChartVisible: Boolean;

    constructor(scene: any){
        this.main_nn_gui = new Dat.GUI({name: "Neural Network Parameters"});
        this.scene = scene
        this.initParams()
        this.setUpGui()
        console.log("FF Neural Network INIT")
        // new testGraph();
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

    checkIfAnyLayerIsEmpty(){
        let layerIsEmpty = false
        //@ts-ignore
        Object.values(this.nn_params.neurons_per_layer).forEach((layer)=>{
            //@ts-ignore
            if(!Object.values(layer).length) layerIsEmpty = true
        })
        return layerIsEmpty
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

    resetLayersBeforeCreatingNewOnes(){
        //Reset all layers/neurons before re-recreating
        if(this.main_nn_gui.__folders){

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
  
    forwardPropagate(trainingData: number[]): number[]{
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
                    //Each neuron takes inputs from last layer and produces it's own input.
                    //I store the results for backpropagation later.
                    //@ts-ignore
                    let lastLayerInputs = Object.values(outputs[neuron.layerId-1])
                    let result = neuron.output(lastLayerInputs)
                    outputs[layerId][neuron.neuronId] = result
                }

            })

        }

        this.nn_params.currentOutputs = outputs
        return Object.values(outputs[this.nn_params.layer_amt])
    }

    //TODO: Take a closer look at promise/iteration speed.
    //I'm just not sure it's working as desired :|

    //@ts-ignore
    //Test the performance of the network by checking the accuracy when
    //Output values are passed through a threshold function.
    async test(){

        let totalError = 0
        let totalAccuracy = 0;
        for (let currentIteration = 0; currentIteration<this.   nn_params.iterations; currentIteration++){
            let i = Math.floor(Math.random() * trainingData.length)
            this.loadInputs(trainingData[i][0])
            let networkOutput = this.forwardPropagate(trainingData[i][0])

            let target = trainingData[i][1]

            // let targetValue = trainingData[i][1][0]
            // console.log("Network Output: ", networkOutput);
            // console.log("Target: ", target);
            // console.log("Target Value: ", targetValue);
            
            if(this.isOutputAccurate(networkOutput, target)){
                totalAccuracy+=1
            }
            // if(this.threshold(networkOutput[1]) === targetValue){
            //     totalAccuracy+=1
            // }

            let error = this.squaredError(target, networkOutput)
            totalError+=error;
            // this.showGraph()
            //@ts-ignore
            await new Promise(r => setTimeout(r, this.nn_params.iterationSpeed));
        }

        console.log("Total Squared Error: ", totalError/this.nn_params.iterations)
        console.log("Accuracy: ", (totalAccuracy/this.nn_params.iterations)*100)
    }

    isOutputAccurate(networkOutput: number[], target: number[]){
        let results = [];
        for (let i=0; i<target.length; i+=1){   
            // console.log(`Target: ${target[i]} \n Pred: ${pred[i]}`)
            let result = this.threshold(networkOutput[i]) === target[i]
            // let result = 2 * (target[i] - pred[i])
            results.push(result);
        }
        //@ts-ignore
        // console.log("Network Output: ", Object.values(networkOutput).map((value)=> this.threshold(value)) );
        // console.log("Target: ", target);
        // console.log("Results:", results);
        let isOutputAccurate = !results.some((value)=>value === false);
        // console.log("Is output accurate? ", isOutputAccurate)
        return isOutputAccurate
    }

    //This is used to classify three classes using only one neuron.
    //Labels for class 1,2,3 are 0, .5 and 1 respectively.
    trinaryThreshold(output: number){
        if(output >= .4 && output <= .6) return .5
        else if(output <= .4) return 0
        else if(output > .6) return 1
    }

    //binaryThreshold function.
    threshold(output: number){
        if(output >= .5) return 1
        else return 0
    }

    //@ts-ignore
    async trainWithStochasticGradientDescent(){
        //Collecting total amount of error
        //Later divided by the number of training iterations.
        let totalError = 0
        //Collecting in total, and per class.
        let errorData: any = [];
        let class1ErrorData = [];
        let class2ErrorData = [];
        let class3ErrorData = [];
        for (let currentIteration = 0; currentIteration<this.nn_params.iterations; currentIteration++){

            //Creating a random index so that I can grab a random data point
            let i = Math.floor(Math.random() * trainingData.length)

            //Loading up that random data point for graphics.
            //First index [i] is the "ID", second index [0] is the actual data.
            this.loadInputs(trainingData[i][0])
            //Performing forward propagation
            let networkOutput = this.forwardPropagate(trainingData[i][0])
            //Getting target associated with data point that was loaded.
            //First index [i] is the "ID", second index [1] is the label of the data.
            let target = trainingData[i][1]

            //Performing backpropagation to update the weights in the network.
            this.backPropagate(target, networkOutput)

            //Pushing data into the error arrays per class.
            let targetValue = trainingData[i][1][0]
            let error = this.squaredError(target, networkOutput)
            errorData.push({error: error, time: currentIteration})
            if(targetValue === 0){
                class1ErrorData.push({error: error, time: currentIteration})
            }
            else if(targetValue === .5){
                class2ErrorData.push({error: error, time: currentIteration})
            }
            else if(targetValue === 1){
                class3ErrorData.push({error: error, time: currentIteration})
            }

            totalError+=error;

            //@ts-ignore
            await new Promise(r => setTimeout(r, this.nn_params.iterationSpeed));
        }

        //Graphing data with graph object.
        // const graph  = new Graph(errorData,class1ErrorData,class2ErrorData,class3ErrorData)
        console.log("Total Squared Error: ", totalError/this.nn_params.iterations)

    }

    //Ignore this for purposes of class.
    showGraph(){
        if(this.nn_params.layer_amt <= 2){
            // console.log("Neurons per layer: ", this.nn_params.neurons_per_layer);
            //@ts-ignore
            createGraph(trainingData, {
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

        //@ts-ignore
        let predValue: number[] = Object.values(pred)

        let derivSquaredErrorVector: number[] = this.derivSquaredError(targetValue, predValue)

        //This approach doesn't use vectors/matrices. It's a "Single Neuron Approach".
        //Therefore, each neuron calculates it's own "Local Gradient"
        //The gradients are then multpled together in a "chain" to get the gradient
        //for the particular weight that needs to be updated.
        //Details of this process are in "updateWeights"

        //When multiple outputs are present, we backpropagate for each output neuron.
        let gradientObj = this.getLocalGradients();
        this.updateWeights(derivSquaredErrorVector, gradientObj)
    }

    //Deriv Squared Error for Vectors
    derivSquaredError(target: number[], pred: number[]): number[]{

        let differenceBetweenVectors = calculateDifferenceBetweenTwoVectors(pred, target);
        if(!differenceBetweenVectors) return [];
        let constant = 2/differenceBetweenVectors.length;
        let errorVector = elementWiseOperationOnVector(differenceBetweenVectors, (val: number)=>val*constant)
        return errorVector
    }

    //Squared Error for Vectors
    squaredError(target: number[], pred: number[]){
        //MSE
        let differenceBetweenVectors = calculateDifferenceBetweenTwoVectors(pred, target);
        if(!differenceBetweenVectors) return 0;
        let squaredVector = elementWiseOperationOnVector(differenceBetweenVectors, (element: number)=>Math.pow(element, 2))
        let vectorLength = squaredVector.length;
        let summedVector = sumValuesInArray(squaredVector)
        let result = summedVector/vectorLength
        // console.log("Squared Error: ", result)
        return result
    }



    //Attempting to do this more intuitively.
    getAllGradientsInChain(gradientObj: any, target: any, errorIndex: number){
        let gradient = gradientObj[target.layerId][target.neuronId]['weights'][target.weightId]
        let gradientStore: any = {gradient}

        let startingLayer = target.layerId+1
        let neuronsInPrevLayer: number[] = [parseInt(target.neuronId)];
        let i: number;

        //If altering weights of an output neuron
        //There is no chain to traverse
        // console.log(`Traversing chain from weight ${target.weightId} of neuron ${target.neuronId} in layer ${target.layerId} to output layer`);
        if(startingLayer > this.nn_params.layer_amt){
            // return gradient
            // console.log(`Returning gradient for weight ${target.weightId} of neuron ${target.neuronId} in layer ${target.layerId}`);
            return gradientStore
        }

        //Kinda like backpropagation backwards in a way...
        //Traversing the network forward
        //We start from the first layer of neurons after the current layer
        //We then proceed forwards towards till output layer
        for (i = startingLayer; i<=this.nn_params.layer_amt; i+=1){
            gradientStore[i] = {}
            //Looping through each neuron in layer i
            // console.log(`Looping through neurons in layer ${i}`);
            let neuronsInCurrentLayer: number[] = []
            //@ts-ignore
            Object.entries(gradientObj[i]).forEach(([neuronId, gradientData])=>{
                //@ts-ignore
                //Looping through input weights to neuronId
                Object.entries(gradientData['continueChain']).forEach(([weightId, value])=>{
                    //@ts-ignore
                    //Check if input weight is connecting to last neuron in chain.
                    if(neuronsInPrevLayer.includes(parseInt(weightId))){
                        const nextLayerTarget = {
                            layerId: i,
                            neuronId: neuronId,
                            weightId: weightId,
                        }

                        //Ensuring that the gradients don't include weights that had nothing to do with the error.
                        const gradientId = `${target.weightId}${target.neuronId}${target.layerId}${weightId}${neuronId}${i}`
                        if(this.isOutputNeuron(nextLayerTarget)){
                            if(this.isErrorAssociatedWithOutputNeuron(nextLayerTarget, errorIndex)) gradientStore[i][gradientId] = value;
                            else gradientStore[i][gradientId] = 0;
                        }
                        else gradientStore[i][gradientId] = value;
                    }
                })
                neuronsInCurrentLayer.push(parseInt(neuronId))
            })
            neuronsInPrevLayer = neuronsInCurrentLayer
        }

        return gradientStore       
    }

    updateWeights(derivSquaredErrorVector: number[], gradientObj: any){
        // console.log("Deriv Squared Error Vector: ", derivSquaredErrorVector);
        // console.log("Gradient Obj: ", gradientObj);
        // console.log("Neurons Per Layer: ", this.nn_params.neurons_per_layer);
        const neuronsPerLayer = Object.entries(this.nn_params.neurons_per_layer).reverse();
        // console.log("neuronsPerLayer entries: ", neuronsPerLayer);
        const inputLayerId = 1
        derivSquaredErrorVector.forEach((derivSquaredError, errorIndex)=>{
            neuronsPerLayer.forEach(([layerId, layer])=>{
                const layerIdInt = parseInt(layerId);
                // console.log("Current Layer ID: ", layerId);
                if(layerIdInt == inputLayerId){
                    // console.log("Layer is equal to input layer - not proceeding");
                    return;
                }
                //@ts-ignore
                //For Each Neuron in layer...
                Object.values(layer).forEach((neuron: Neuron)=>{
                    // console.log("Current Neuron: ", neuron.neuronId);
                    //For each weight associated with neuron...
                    Object.values(neuron.weight_objects).forEach((weight_object)=>{
                        // console.log("Current Weight: ", weight_object.weight_id);
                        let weight_id = weight_object.weight_id
                        //Get all gradients on the way to this weight
                        //In other words, all possible paths along chain.
                        const target = {
                            neuronId: neuron.neuronId,
                            layerId: neuron.layerId,
                            weightId: weight_id
                        }
                        //When you have multiple outputs, you should only adjust the weights of the
                        //output neuron that is associated with the current error. This function
                        //Prevents the weights of other output neurons rfom being modified.
                        if(this.isOutputNeuron(target) && !this.isErrorAssociatedWithOutputNeuron(target, errorIndex)) return;


                        //There are potentially multiple routes to any given weight in the neural network
                        //Here we get all the possible routes and then we sum these routes/gradients in "CombinedGradientPaths"
                        let gradientStore = this.getAllGradientsInChain(gradientObj, target, errorIndex)
                        // console.log("Gradient Store: ", gradientStore);
                        let combinedGradient = this.combineGradientPaths([gradientStore.gradient],gradientStore)
                        // console.log("Combined Gradient: ", combinedGradient);
                        let gradient = -(this.nn_params.learning_rate * (derivSquaredError*combinedGradient))
                        // console.log("Gradient: ", gradient);
                        neuron.updateWeight(weight_id, gradient)
                    })
                })
            })
        })
    }

    isOutputNeuron=(target: any)=>{
        const isNeuronInOutputLayer = target.layerId === this.nn_params.layer_amt;
        if(!isNeuronInOutputLayer){
            // console.log(`Neuron ${target.neuronId} in layer ${target.layerId} is not in output layer`);
            return false;
        }
        return true;
    }

    isErrorAssociatedWithOutputNeuron = (target: any, errorId: number)=>{
        errorId = errorId+1;
        const isNeuronAssociatedWithError = (parseInt(target.neuronId) === errorId);
        return isNeuronAssociatedWithError;
    }

    getGradientPaths = (gradArr: number[], layerObj: any)=>{
		let outputs: number[] = []
        gradArr.forEach((gradient)=>{
            //@ts-ignore
            Object.values(layerObj).forEach((weightGradient: number)=>{
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

    getLocalGradients(){
        let gradientObj: any = {}
        let inputLayerId = 1

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
            Object.values(layer).forEach((neuron: Neuron)=>{
                neuron.randomizeWeights()
            })
        })

    }

    unloadInputs(){
        //@ts-ignore
        Object.values(this.nn_params.inputObjects).forEach((inputObject)=>{
            this.scene.remove(inputObject)
        })
        this.nn_params.inputsLoaded = false
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
                input.material.map = createTexture({}, `${trainingData[inputIterator]}`.substring(0, 4));
                input.material.needsUpdate = true;

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

