import Neuron from '../Neuron'
import { GUI } from '../../node_modules/three/examples/jsm/libs/dat.gui.module'
import makeArr from '../../helpers/makeArr'
import isObjEmpty from '../../helpers/isObjEmpty'
import createCanvasTexturedBox from '../../functions/createCanvasTexturedBox'
import createTexture from '../../functions/createTexture'
import sumValuesInArray from '../../helpers/sumValuesInArray'
import createGraph from '../../functions/createGraph'
import calculateDistanceBetweenVectors from '../../mathFunctions/calculateDistanceBetweenVectors'
//@ts-ignore - I don't know why TS compiler doesn't like this T_T, but it doesn't like a lot of things.
import mnist from 'mnist'
import housingHeaderBinaryData from '../../dataSets/housing.header.binary'
import irisData from '../../irisData'
import elementWiseOperationOnVector from '../../mathFunctions/elementWiseOperationOnVector'
import calculateDifferenceBetweenTwoVectors from '../../mathFunctions/calculateDifferenceBetweenTwoVectors'
import RealTimeChart from '../RealTimeChart'
import Graph from '../Graph'

//Trying to figure out backprop with multiple output units...
// https://stats.stackexchange.com/questions/237975/why-do-deep-learning-libraries-force-the-cost-function-to-output-a-scalar
// https://math.stackexchange.com/questions/3152235/partial-derivative-of-mse-cost-function-in-linear-regression
// https://stats.stackexchange.com/questions/323896/explanation-for-mse-formula-for-vector-comparison-with-euclidean-distance
// https://stats.stackexchange.com/questions/152548/what-should-the-divisor-be-in-mse
// https://stackoverflow.com/questions/36310289/creating-a-mean-square-error-function


//All my training data is currently just sitting here outside the class...
//I put the training data inside pseudoTrainingData because that's just the name
//that I happened to start with.


//XOR DATA
// let pseudoTrainingData = [
//     [[1,1],[0]],
//     [[0,1],[1]],
//     [[1,0],[1]],
//     [[0,0],[0]],
// ]

let irisDataWithLabel = irisData.map((data: any, index)=>{
    // if(!data ) console.log("Index: ", index);
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
})


//Training, Test for MNIST
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

// let pseudoTrainingData = convertMnistFormat(trainingSet)
let pseudoTrainingData = irisDataWithLabel
console.log("Data Dimensions: ", pseudoTrainingData[0][0])
console.log("Label Dimensions: ", pseudoTrainingData[0][1])
// let pseudoTrainingData = housingHeaderBinaryData;
// console.log(housingHeaderBinaryData)
// let formattedMnistTestSet = convertMnistFormat(testSet)



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
    measurementChart: any;
    measurementChartVisible: Boolean;

    constructor(scene: any){
        this.main_nn_gui = new GUI({name: "Neural Network Parameters"});
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
        return outputs[this.nn_params.layer_amt]
    }

    //TODO: Take a closer look at promise/iteration speed.
    //I'm just not sure it's working as desired

    //@ts-ignore
    //Test the performance of the network by checking the accuracy when
    //Output values are passed through a threshold function.
    async test(){

        let totalError = 0
        let totalAccuracy = 0;
        for (let currentIteration = 0; currentIteration<this.   nn_params.iterations; currentIteration++){
            let i = Math.floor(Math.random() * pseudoTrainingData.length)
            this.loadInputs(pseudoTrainingData[i][0])
            let networkOutput = this.forwardPropagate(pseudoTrainingData[i][0])

            let target = pseudoTrainingData[i][1]

            let targetValue = pseudoTrainingData[i][1][0]

            // @ts-ignore
            let networkOutputArray = Object.values(networkOutput);

            if(this.isOutputAccurate(networkOutputArray, target)){
                totalAccuracy+=1
            }
            // if(this.threshold(networkOutput[1]) === targetValue){
            //     totalAccuracy+=1
            // }

            //@ts-ignore
            let error = this.squaredError(target, networkOutputArray)
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
        console.log("Network Output: ", Object.values(networkOutput).map((value)=> this.threshold(value)) );
        console.log("Target: ", target);
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
            let i = Math.floor(Math.random() * pseudoTrainingData.length)

            //Loading up that random data point for graphics.
            //First index is the "ID", second index is the actual data.
            this.loadInputs(pseudoTrainingData[i][0])
            //Performing forward propagation
            let networkOutput = this.forwardPropagate(pseudoTrainingData[i][0])
            //Getting target associated with data point that was loaded.
            //First index is the "ID", second index is the label of the data.
            let target = pseudoTrainingData[i][1]

            //@ts-ignore
            let networkOutputArray = Object.values(networkOutput);
            //Performing backpropagation to update the weights in the network.
            this.backPropagate(target, networkOutputArray)

            //Pushing data into the error arrays per class.
            let targetValue = pseudoTrainingData[i][1][0]
            let error = this.squaredError(target, networkOutputArray)
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
        let constant = 2/differenceBetweenVectors.length;
        let errorVector = elementWiseOperationOnVector(differenceBetweenVectors, (val: number)=>val*constant)
        // console.log("Deriv Squared Error Vector: ", errorVector)
        return errorVector

        // let differenceBetweenVectors = calculateDifferenceBetweenTwoVectors(pred, target);
        // let constant = 2/differenceBetweenVectors.length;
        // let summedVector = sumValuesInArray(differenceBetweenVectors)
        // let result = summedVector * constant
        // // console.log("Deriv Squared Error: ", result)
        // return result

        let sum = 0;
        for (let i=0; i<target.length; i+=1){
            let differenceBtwnDimensions = (pred[i] - target[i]);
            let result = 2 * differenceBtwnDimensions
            sum+=result
        }
        // return sum
    }

    //Squared Error for Vectors
    squaredError(target: number[], pred: number[]){

        //MSE
        let differenceBetweenVectors = calculateDifferenceBetweenTwoVectors(pred, target);
        let squaredVector = elementWiseOperationOnVector(differenceBetweenVectors, (element: number)=>Math.pow(element, 2))
        let vectorLength = squaredVector.length;
        let summedVector = sumValuesInArray(squaredVector)
        let result = summedVector/vectorLength
        // console.log("Squared Error: ", result)
        return result

        let sum = 0;
        for (let i=0; i<target.length; i+=1){
            let differenceBtwnDimensions = (pred[i] - target[i]);
            let result = Math.pow(differenceBtwnDimensions, 2) / 2
            sum+=result
        }
        return sum

    }

    // derivSquaredError(target: number[], pred: number[]){
    //     // let distance = calculateDistanceBetweenVectors(target, pred);
    //     // console.log("derivSquaredError - Distance: ", distance);
    //     // return distance;
    //     let sum = 0;
    //     for (let i=0; i<target.length; i+=1){
    //         // console.log(`Target: ${target[i]} \n Pred: ${pred[i]}`)
    //         let result = 2 * (pred[i] - target[i])
    //         // let result = 2 * (target[i] - pred[i])
    //         sum+=result
    //     }
    //     return sum;
    // }
    
    // squaredError(target: number[], pred: number[]){
    //     // let distance = calculateDistanceBetweenVectors(target, pred);
    //     // console.log("Squared Error - Distance: ", distance);
    //     // return distance;

    //     let sum = 0;
    //     for (let i=0; i<target.length; i+=1){
    //         // console.log(`Target: ${target[i]} \n Pred: ${pred[i]}`)
    //         let result = Math.pow(pred[i] - target[i], 2)/2
    //         // let result = Math.pow(target[i] - pred[i], 2)/2
    //         sum+=result
    //     }
    //     return sum;
    //     // return Math.pow(target - pred, 2)/2
    // }

    //TODO: Explain backpropagation through the browser console, or UI.
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
            //TODO: Pretty sure this could handle sparse connections too. Verify.
            neuronsInPrevLayer = Object.keys(gradientObj[i]).map((key)=>parseInt(key))
        }

        return gradientStore    
    }

    updateWeights(derivSquaredErrorVector: number[], gradientObj: any){
        const inputLayerId = 1
        derivSquaredErrorVector.forEach((derivSquaredError, errorIndex)=>{
            //@ts-ignore
            Object.entries(this.nn_params.neurons_per_layer).forEach(([layerId, layer])=>{
                if(layerId == inputLayerId){
                    // console.log("Layer is equal to input layer - not proceeding");
                    return;
                }
                //@ts-ignore
                //For Each Neuron in layer...
                Object.values(layer).forEach((neuron)=>{
                    //@ts-ignore
                    //For each weight associated with neuron...
                    Object.values(neuron.weight_objects).forEach((weight_object)=>{
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
                        if(!this.isErrorAssociatedWithOutputNeuron(target, errorIndex)) return;
                        // console.log(`Layer ${neuron.layerId} Neuron ${neuron.neuronId} Weight ${weight_id}`);

                        //There are potentially multiple routes to any given weight in the neural network
                        //Here we get all the possible routes and then we sum these routes/gradients in "CombinedGradientPaths"
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
        })
    }

    isErrorAssociatedWithOutputNeuron = (target: any, errorId: number)=>{
        errorId = errorId+1;
        const isNeuronInOutputLayer = target.layerId === this.nn_params.layer_amt;
        const isNeuronTargetNeuron = (target.neuronId === errorId);
        if(isNeuronInOutputLayer && isNeuronTargetNeuron){
            // console.log("Error is not associated with outputNeuron");
            // console.log("Error ID: ", errorId)
            return true;
        }
        else{
            if(isNeuronInOutputLayer){
                // console.log("Error is not associated with outputNeuron");
                // console.log("Error ID: ", errorId)
                // console.log("Neuron ID: ", target.neuronId)
            }
            return false;
        }
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

