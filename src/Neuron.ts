import createCanvasTexturedBox from '../functions/createCanvasTexturedBox'
import createTexture from '../functions/createTexture'
import getRndInteger from '../helpers/getRndInteger'
import multiplyArrays from '../helpers/multiplyArrays'
import sumValuesInArray from '../helpers/sumValuesInArray'
import sigmoidSquishification from '../mathFunctions/sigmoidSquishification'
import * as THREE from '../node_modules/three/build/three.module'



class Neuron {

   name: string
   bias: number
   weights: number[]
   neuronId: number
   layerId: number
   coords: number[]
   activFunc: string = 'sigmoid'
   networkObject: any

   scene:any
   threejs_object: any
   weight_objects: any
   outputDisplayBoxCreated: Boolean = false
   outputDisplayBox: any

   constructor(neuronId: number, layerId: number, coords: number[], scene: any, networkObject: any){
       this.networkObject = networkObject
       this.neuronId = neuronId
       this.layerId = layerId
       this.coords = coords
       this.scene = scene
       this.name = `N${neuronId}L${layerId}`
       this.weight_objects = {}
       this.initBias()
   }

   updateWeight(weightId: number, gradient: number){
        //Getting weight Display Three Obj
        let weight_display_box = this.weight_objects[weightId]['weight_display_box']
        // if(!weight_display_box) return
        let currentWeightValue = this.weight_objects[weightId]['weight_value']
        let newWeightValue = currentWeightValue + gradient
        // console.log(`Layer ${this.layerId} Neuron ${this.neuronId} Weight ${weightId}`)
        // console.log("Gradient: ", gradient);
        // console.log("Current weight value: ", currentWeightValue);
        // console.log("New weight value: ", newWeightValue);
        this.weight_objects[weightId]['weight_value'] = newWeightValue
        //UPDATE TEXTURE/VALUE OF WEIGHT!
        if(!weightId || !weight_display_box) return //Don't do this for bias
        weight_display_box.material.map = createTexture({}, `${newWeightValue}`.substring(0, 4));
        weight_display_box.material.needsUpdate = true;
   }

   calculateLocalGradient(output: number, inputsFromLastLayer: any){

        // console.log(`Layer ${this.layerId} Neuron ${this.neuronId}`);

       let gradients: any = {}
       gradients['weights'] = {}
       gradients['continueChain'] = {}
       let derivActiv: number
       if(this.activFunc === 'sigmoid'){
            //Derivative of Activation Func with respect to local field
            // console.log(`derivActiv = ${output} * (1-${output})`)
            derivActiv = output * (1 - output)
       }
       
       //Derivatives for moving along the chain.
       //@ts-ignore
        Object.values(this.weight_objects).forEach((weight_object)=>{
           //Derivative of local field w/ respect to input
           gradients['continueChain'][weight_object.weight_id] = derivActiv * weight_object.weight_value
        })

        //Derivatives for modifying weights
        //@ts-ignore
        Object.entries(inputsFromLastLayer).forEach(([neuronId, input])=>{
            // console.log(`Layer ${this.layerId} Neuron ${this.neuronId} Weight ${neuronId}`);
            // console.log(`Gradient = ${derivActiv} * ${input}`);
            //Derivative of local field w/ respect to weight
            gradients['weights'][neuronId] = derivActiv * input
        })
        //For Modifying Weight associated with bias
        gradients['weights'][0] = derivActiv * 1

       return gradients
   }

   localField(inputs: number[]){
       //@ts-ignore
       let weights = Object.values(this.weight_objects).map((weightObject)=>{
            return weightObject.weight_value
       })
       //Prepending bias to the input array
       inputs.unshift(1);
       let result: number[] | Boolean = multiplyArrays(inputs, weights)
       if(!result){
        //    alert(`N${this.neuronId}L${this.layerId} Inputs & Weights have different sizes`)
           console.log(`N${this.neuronId}L${this.layerId} Inputs & Weights have different sizes`);
           console.log("Inputs: ", inputs);
           console.log("Weights: ", weights);
           return null
       }
       //@ts-ignore
       let localField = sumValuesInArray(result)
       return localField
   }

   makeOutputDisplayBox(output: number){
                
        let parameters = {
            text: ``,
            weightID: '',
            position: {
                x: this.coords[0],
                y: this.coords[1] + 2,
                z: this.coords[2],
            },
            visible: true
        }

        let outputDisplayBox = createCanvasTexturedBox(`${ output }`.substring(0, 4), parameters)
        this.scene.add(outputDisplayBox)
        this.outputDisplayBoxCreated = true
        this.outputDisplayBox = outputDisplayBox
   }

   updateOutputDisplayBox(output: number){
        this.outputDisplayBox.material.map = createTexture({}, `${output}`.substring(0, 4));
        this.outputDisplayBox.material.needsUpdate = true;
   }

   logNeuronLayerAndId(){
     console.log(`Layer ${this.layerId} Neuron ${this.neuronId}`);
   }

   output(inputs: number[]){
        let localField = this.localField(inputs)
        // this.logNeuronLayerAndId()
        // console.log("Local Field: ", localField);
        let output = this.activationFunction(localField)
        // console.log("Output: ", output);
        if(this.isNeuronVisible()){
            if(this.outputDisplayBoxCreated) this.updateOutputDisplayBox(output)
            else this.makeOutputDisplayBox(output)
        }

        return output
   }

   activationFunction(z: number){
        if(this.activFunc === 'sigmoid'){
            return sigmoidSquishification(z)
        }
   }



   randomizeWeights(){
       //Should be some random weights according to how many inputs it has.
       this.weights = []
       //@ts-ignore
       let weightObjects = Object.values(this.weight_objects)
    //    console.log("Number of objects: ", weightObjects.length)
       //@ts-ignore
       weightObjects.forEach((weight)=>{

            let randInt = getRndInteger(0,2);
            let randomWeight = Math.random();
            let weightVal = randInt === 1 ? randomWeight : -randomWeight
            // let weightVal = (Math.random()*.2-.1);
            // let weightVal = Math.random()*100
            // let weightVal = Math.random()
            if(!weight.weight_object){
                this.weight_objects[weight.weight_id]['weight_value'] = weightVal
                return;
            }

            const {weight_center_coords} = weight
            
            let parameters = {
                text: `weightValue_${weight.weight_id}`,
                weightValue: weightVal,
                weightID: weight_center_coords[3],
                position: {
                    x: weight_center_coords[0],
                    y: weight_center_coords[1],
                    z: weight_center_coords[2],
                },
                // visible: (!(weight_center_coords[1] < 54 && weight_center_coords[1] > -54) ? false : true)
                // visible: weight.visible ? true : false
                visible: true
            }

            let weightDisplayBox = createCanvasTexturedBox(`${ weightVal }`.substring(0, 4), parameters)
            weightDisplayBox.visible = weight.weight_object.visible

            this.weight_objects[weight.weight_id]['weight_value'] = weightVal
            this.weight_objects[weight.weight_id]['weight_display_box'] = weightDisplayBox
     
            if(weight.weight_object.visible) this.scene.add(weightDisplayBox);
        })

        let randInt = getRndInteger(0,2);
        let randomWeight = Math.random();
        let weightVal = randInt === 1 ? randomWeight : -randomWeight

        //Adding weight for BIAS
        this.weight_objects[0] = {
            weight_id: 0,
            weight_object: null,
            weight_center_coords: null,
            // weight_value: Math.random()
            weight_value: weightVal
            // weight_value: Math.random()*100
        }

    }


   initBias(){
    this.bias = Math.random()*.2-.1;;
   }

   isPostSynpaticNeuronVisible(neuron: any){
        if(neuron.threejs_object.visible) return true
        else return false
   }

   denselyConnect(){
       //Connect to each neuron in the layer in behind me (layerId + 1)
       let previousLayer = this.networkObject.nn_params.neurons_per_layer[this.layerId-1]
       if(!previousLayer) return;
       //Make weight for each neuron.
       //@ts-ignore
       Object.values(previousLayer).forEach((neuron)=>{

            //If current neuron or post synpatic neuron is invisible then don't render weight
            if(!this.isPostSynpaticNeuronVisible(neuron) || !this.isNeuronVisible()){
                this.weight_objects[neuron.neuronId] = {
                    weight_id: neuron.neuronId,
                    weight_object: null,
                    weight_center_coords: null
                }
                return;
            }


            let points = []

            points.push(new THREE.Vector3(this.coords[0], this.coords[1], this.coords[2]));
            points.push(new THREE.Vector3(neuron.coords[0], neuron.coords[1], neuron.coords[2]));


            let weight_center_coords = (()=>{
                    return [
                        (this.coords[0] + neuron.coords[0]) / 2,
                        (this.coords[1] + neuron.coords[1]) / 2,
                        (this.coords[2] + neuron.coords[2]) / 2,
                    ]    
            })()

            var material = new THREE.LineBasicMaterial( { color: 0x501885 } );
            var geometry = new THREE.BufferGeometry().setFromPoints( points );
            var weight = new THREE.Line( geometry, material );
            weight.name = 'weight';
            weight.visible = this.isPostSynpaticNeuronVisible(neuron)

            // console.log(`Neuron ${this.neuronId} Layer ${this.layerId} connecting to ${neuron.neuronId}`)
            this.weight_objects[neuron.neuronId] = {
                weight_id: neuron.neuronId,
                weight_object: weight,
                weight_center_coords
            }
            if(this.isPostSynpaticNeuronVisible(neuron)) this.scene.add( weight );
       })


    //    console.log(`Neuron ${this.neuronId} weight Objs: `, this.weight_objects)
       
   }

    isNeuronVisible(){
        // if(this.coords[1] > 54 || this.coords[1] <-54) return false
        if(this.coords[1] > 30 || this.coords[1] <-30) return false
        else return true
    }

   createNeuronInScene(){
        var geometry = new THREE.SphereGeometry(1, 32, 32);
        var material = new THREE.MeshBasicMaterial( { color: 0x501885 ,/*  map: texture, */} );
        var neuron = new THREE.Mesh( geometry, material );

        const [xcoord, ycoord, zcoord] = this.coords;

    

        //@ts-ignore
        neuron.position.set( xcoord, ycoord, zcoord );
        neuron.visible = this.isNeuronVisible()

        this.threejs_object = neuron
        if(this.isNeuronVisible()) this.scene.add( neuron );
   }
  

}

export default Neuron;