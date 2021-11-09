import { GUI } from '../../node_modules/three/examples/jsm/libs/dat.gui.module'
import * as THREE from '../../node_modules/three/build/three.module'
import calculateDifferenceBetweenTwoVectors from '../../mathFunctions/calculateDifferenceBetweenTwoVectors'
import elementWiseOperationOnVector from '../../mathFunctions/elementWiseOperationOnVector'
import calculateSumOfTwoVectors from '../../mathFunctions/calculateSumOfTwoVectors'
import rgbToHex from '../../helpers/rgbToHex'
import normalizeValuesInRanges from '../../mathFunctions/normalizeValuesInRanges'
import calculateDistanceBetweenVectors from '../../mathFunctions/calculateDistanceBetweenVectors'
import irisData from '../../irisData'
import getRndInteger from '../../helpers/getRndInteger'
import rgbaToHex from '../../helpers/rgbaToHex'


class SelfOrganizingMap {

    scene: any

    som_params: any

    pixelObjects: {
        [key: string]: any;
    };
    //Width, Height of the space the pixels fill.
    DEFAULT_SPACE: number[] = [150,150]

    //ROWS X COLUMNS defining the number pixel rows/columns
    DIMENSIONS: number[] = [10,10];

    //Find out height/width of each pixel given the default space.
    //Height = Height Of Space / Number Of Pixels
    //Width = Width of Space / Number Of Pixels
    numberOfPixels = this.DIMENSIONS.reduce((a:number, b:number)=>a*b)
    widthOfPixel: number = this.DEFAULT_SPACE[1]/this.DIMENSIONS[0]
    heightOfPixel: number = this.DEFAULT_SPACE[0]/this.DIMENSIONS[1]
    //This is 3D so, depth can be whatever!
    depthOfPixel: number = 2.5;

    //In otherwords, distance from winning unit.
    radius: number = 1;
    //"Learning rate" for the map
    alpha: number = 0.1;
    //These are for normalization purposes
    smallestWeight: number = 0;
    largestWeight: number = 1;

    constructor(scene: any){
        this.scene = scene
        console.log("Self Organizing Map INIT")
        console.log(`Dimensions of space that surface fills: ${this.DEFAULT_SPACE[0]} X ${this.DEFAULT_SPACE[1]}`)
        console.log(`Dimensions of surface: ${this.DIMENSIONS[0]} X ${this.DIMENSIONS[1]}`);
        console.log("Height Of Pixel: ", this.heightOfPixel);
        console.log("Width Of Pixel: ", this.widthOfPixel);

        //Create grid of pixels from "dimensions"
        //Pixels fill the "Default Space"
        this.pixelObjects = this.createPixelGrid();
        //Neighbors for each pixel.
        this.getNeighborsForEveryPixel();
        //Define this based on which function you're running.
        let weightDimensionSize = 3;

        this.randomizeWeights(weightDimensionSize);

        //Weight dimension size 3 for RGB
        this.trainOnRandomRBG(2000);

        //Weight diensions size 4 for Iris Data.
        //Going through entire data set and updating weights each trial.
        //Basically just like notion of "Epochs" in training a neural network.
        // this.trainOnIrisDataInSeries(10);

        //Sampling a random data point each trial, like stochastic gradient descent.
        // this.trainOnIrisDataStochastically(100000);
        
    }

    //Gets the label for the particular piece of fisher data
    generateFisherDataLabel(index: number){
        // return [1, 0, 0, 1];
        if(index < 50){
            return [1, 0, 0, 1];
            // return [255, 0, 0, 255];
        }   
        if(index <= 100){
            return [0, 1, 0, 1];
            // return [0, 255, 0, 255];
        }
        if(index > 100){
            return [0, 0, 1, 1];
            // return [0, 0, 255, 255];
        }
    }

    //Debugging purposes.
    getPixelsWithUnmodifiedWeights(){
        //@ts-ignore
        Object.values(this.pixelObjects).forEach((pixelObject: any)=>{
            if(!pixelObject.wasWeightModified){
                console.log(`Pixel ${pixelObject.id} was not modified`);
            }
        })
    }

    //Beware - Sometimes there is trouble normalizing values
    //because the range of the difference between weight/inputs can become unknown

    //CREDIT: https://stackoverflow.com/questions/5731863/mapping-a-numeric-range-onto-another
    normalizeValueBetween0and255(input: number){
        let output = Math.round(normalizeValuesInRanges(input, [this.smallestWeight,this.largestWeight], [0,255]));
        return output;
    }


    //This is for normalization later.
    findAndSetMaxAndMinimumWeightValues(){
        let weights: any = []
        //@ts-ignore
        Object.values(this.pixelObjects).forEach((pixelObject: any)=>{
            weights = weights.concat([...pixelObject.weight])
        })
        //@ts-ignore
        let sortedWeights = weights.sort((a: any, b: any)=>{
            return a - b
        });
        let smallestWeight = sortedWeights[0];
        let largestWeight = sortedWeights[sortedWeights.length-1];
        this.smallestWeight = smallestWeight
        this.largestWeight = largestWeight
    }
    
    findPixelWithWeightsClosestToInput(input: number[]){
        let distances: any = {}
        //@ts-ignore
        Object.values(this.pixelObjects).forEach((pixelObject: any)=>{
            let distance = calculateDistanceBetweenVectors(input, pixelObject.weight);
            distances[pixelObject.id] = {pixelObject, distance};
        })
        // console.log("Length of pixel Objects: ", Object.values(distances).length);
        //@ts-ignore
        let sortedDistances = Object.values(distances).sort((a: any, b: any)=>{
            return a.distance - b.distance
        });
        // console.log("Sorted Distances: ", sortedDistances);
        // console.log("Smallest Distance Pixel: ", sortedDistances[0].pixelObject.id);
        // console.log("Smallest Distance Pixel: ", sortedDistances[0].distance);
        let smallestDistancePixel = sortedDistances[0];
        return smallestDistancePixel;
    }

    //@ts-ignore    
    async trainOnRandomRBG(trials: number){
        //Updating Weights  
        for (let i=0; i<trials; i+=1){
            console.log("Trial: ", i);
            let randomInput = this.createArrayWithRandomValues(3);
            const [r,g,b] = elementWiseOperationOnVector(randomInput, this.normalizeValueBetween0and255.bind(this));
            // console.log(`%c Random Color: ${r},${g},${b},`, `background: ${rgbToHex(r,g,b, '#')}; color: #fff`);
            //Update neighbors of each pixelObject, neighbors includes self.
            //I.E. Each pixel is it's own nieghbor.
            let {pixelObject, distance} = this.findPixelWithWeightsClosestToInput(randomInput);
            pixelObject.neighbors.forEach((nPixelObject: any)=>{        
                // weights(indX,indY,:)=weights(indX,indY,:) + alpha.*(input-weights(indX,indY,:));
                let weightDifference = calculateDifferenceBetweenTwoVectors(randomInput, nPixelObject.weight);
                let newWeight = calculateSumOfTwoVectors(nPixelObject.weight, elementWiseOperationOnVector(weightDifference, (val: number)=>val*this.alpha));
                let normalizedNewWeight = elementWiseOperationOnVector(newWeight, this.normalizeValueBetween0and255.bind(this));

                this.pixelObjects[nPixelObject.id].weight = newWeight;
                this.pixelObjects[nPixelObject.id].wasWeightModified = true;

                const [r,g,b, a] = normalizedNewWeight
                let hex = `${rgbToHex(r,g,b)}`;
                //changeObjectWeightMaterial to represent color
                this.pixelObjects[nPixelObject.id].threeJsObject.material.color.setHex(hex);
                this.pixelObjects[nPixelObject.id].threeJsObject.material.needsUpdate = true
                //This is function allows for normalization
                //I define an input range with max and min weight values
                //So that I can later map onto 0-255 output range.
                this.findAndSetMaxAndMinimumWeightValues();
            })
            //Briefly waiting after updating all neighbors.
            //@ts-ignore
            await new Promise(r => setTimeout(r, 50));   
        }
        this.logWeightsOfAllPixels();
    }

    logWeightsOfAllPixels(){
        //@ts-ignore
        const weights = Object.values(this.pixelObjects).map((pixelObject: any)=>{
            return pixelObject.weight
        })
        console.log("Weights: ", JSON.stringify(weights));
    }

    //@ts-ignore    
    async trainOnIrisDataStochastically(trials: number){
        //Updating Weights  
        for (let i=0; i<trials; i+=1){
            let randIndex = getRndInteger(0, irisData.length);
            let randomInput = irisData[randIndex];
            console.log("Trial: ", i);
            const fisherDataLabel = this.generateFisherDataLabel(randIndex);
            const [r,g,b,a] = elementWiseOperationOnVector(fisherDataLabel, this.normalizeValueBetween0and255.bind(this));
            // console.log(`%c Label Color: ${r},${g},${b},${a}`, `background: ${rgbaToHex(r,g,b,a, '#')}; color: #fff`);

            //Update neighbors of each pixelObject, neighbors includes self.
            //I.E. Each pixel is it's own nieghbor.
            let {pixelObject, distance} = this.findPixelWithWeightsClosestToInput(randomInput);
            pixelObject.neighbors.forEach((nPixelObject: any)=>{      
                // weights(indX,indY,:)=weights(indX,indY,:) + alpha.*(input-weights(indX,indY,:));
                //Using fisherDataLabel to restrict output to RGB color spectrum. One color per class.
                let weightDifference = calculateDifferenceBetweenTwoVectors(fisherDataLabel, nPixelObject.weight);
                let newWeight = calculateSumOfTwoVectors(nPixelObject.weight, elementWiseOperationOnVector(weightDifference, (val: number)=>val*this.alpha));
                let normalizedNewWeight = elementWiseOperationOnVector(newWeight, this.normalizeValueBetween0and255.bind(this));

                this.pixelObjects[nPixelObject.id].weight = newWeight;
                this.pixelObjects[nPixelObject.id].wasWeightModified = true;

                const [r,g,b, a] = normalizedNewWeight
                let hex = `${rgbToHex(r,g,b)}`;
                //changeObjectWeightMaterial to represent color
                this.pixelObjects[nPixelObject.id].threeJsObject.material.color.setHex(hex);
                this.pixelObjects[nPixelObject.id].threeJsObject.material.needsUpdate = true
                //This is function allows for normalization
                //I define an input range with max and min weight values
                //So that I can later map onto 0-255 output range.
                this.findAndSetMaxAndMinimumWeightValues();
            })

            //Briefly waiting after updating all neighbors.
            //@ts-ignore
            await new Promise(r => setTimeout(r, 50));   
        }
        // this.getPixelsWithUnmodifiedWeights();
    }

    //@ts-ignore    
    async trainOnIrisDataInSeries(trials: number){
        for (let i=0; i<trials; i+=1){
            console.log("Trial: ", i);
            for (let dataIndex=0; dataIndex<irisData.length; dataIndex+=1){
                let input = irisData[dataIndex];
                let normalizedRandomInput = elementWiseOperationOnVector(input, this.normalizeValueBetween0and255.bind(this));
                const [iR, iB, iG] = normalizedRandomInput;
                const fisherDataLabel = this.generateFisherDataLabel(dataIndex);
                const [r,g,b,a] = elementWiseOperationOnVector(fisherDataLabel, this.normalizeValueBetween0and255.bind(this));
                // console.log(`%c Label Color: ${r},${g},${b},${a}`, `background: ${rgbaToHex(r,g,b,a, '#')}; color: #fff`);
                //Update neighbors of each pixelObject, neighbors includes self.
                //I.E. Each pixel is it's own nieghbor.
                // Object.values(this.pixelObjects).forEach((pixelObject: any)=>{
                let {pixelObject, distance}= this.findPixelWithWeightsClosestToInput(input);
                pixelObject.neighbors.forEach((nPixelObject: any)=>{        
                    // weights(indX,indY,:)=weights(indX,indY,:) + alpha.*(input-weights(indX,indY,:));
                    //Using fisherDataLabel to restrict output to RGB color spectrum. One color per class.
                    let fisherDataLabel = this.generateFisherDataLabel(dataIndex);
                    let weightDifference = calculateDifferenceBetweenTwoVectors(fisherDataLabel, nPixelObject.weight);
                    let newWeight = calculateSumOfTwoVectors(nPixelObject.weight, elementWiseOperationOnVector(weightDifference, (val: number)=>val*this.alpha));
                    let normalizedNewWeight = elementWiseOperationOnVector(newWeight, this.normalizeValueBetween0and255.bind(this));
    
                    //Updating weights.
                    this.pixelObjects[nPixelObject.id].weight = newWeight;
    
                    //Normalized weight for visualization.
                    const [r,g,b] = normalizedNewWeight
                    //Unfortunately, the library for visualization (three.js) doens't handle alpha values.
                    let hex = `${rgbToHex(r,g,b)}`;
                    this.pixelObjects[nPixelObject.id].threeJsObject.material.color.setHex(hex);
                    this.pixelObjects[nPixelObject.id].threeJsObject.material.needsUpdate = true
                    //This is function allows for normalization
                    //I define an input range with max and min weight values
                    //So that I can later map onto 0-255 output range.
                    this.findAndSetMaxAndMinimumWeightValues();
                })
    
                //Briefly waiting after updating all neighbors.
                //@ts-ignore
                // await new Promise(r => setTimeout(r, 50));   
            }
        }
    }

    createArrayWithRandomValues(size: number){
        let arr = [];
        for(let i = 0; i<size; i+=1){
            arr.push(Math.random())
        }
        return arr;
    }

    randomizeWeights(weightDimensionSize: number){
        let vector = [1,2,3]
        let matrix_2x2 = [[1,2,3], [3,2,1]]

        //@ts-ignore
        Object.values(this.pixelObjects).forEach((pixelObject)=>{
            //Creating weight matrix with random values between 0 and 1
            let randomWeight = this.createArrayWithRandomValues(weightDimensionSize);
            //Converting the values between 0 and 1 to RGB values.
            //Thus the normalizedWeight is used to display the color.
            let normalizedWeight = elementWiseOperationOnVector(randomWeight, this.normalizeValueBetween0and255.bind(this));
            this.pixelObjects[pixelObject.id].weight = randomWeight;

            const [r,g,b,a] = normalizedWeight;
            let hex = (()=>{
                if(weightDimensionSize === 4) return `${rgbaToHex(r,g,b,a)}`;
                else if(weightDimensionSize === 3) return `${rgbToHex(r,g,b)}`;
                return 
            })()
            this.pixelObjects[pixelObject.id].threeJsObject.material.color.setHex(hex);
            this.pixelObjects[pixelObject.id].threeJsObject.material.needsUpdate = true
        })
    }

    addOrigin(){
        let origin = this.createThreeJsBox({
            color: 0x00FF00,
            dimensions: [2.5,2.5,2.5],
            position: [0,0,0]
        })
        this.scene.add(origin);
    }

    getNeighborsForEveryPixel(){
        Object.keys(this.pixelObjects).forEach((pixelId: string)=>{
            let neighbors = this.findNearestNeighbors2D(pixelId, this.radius)
            this.pixelObjects[pixelId].neighbors = neighbors;
        })
    }

    public findNearestNeighbors2D(pixelId: string, radius: number){
        let pixelObject = this.pixelObjects[pixelId];
        //Find neighbors within' given radius
        // let pixelLocation = JSON.parse(pixelId); 
        // const [x,y,z] = pixelLocation;
        const x = pixelObject.row;
        const y = pixelObject.column;
        //Get ring of neighbors for each radii
        let neighbors: any = [];
        for (let radii=0; radii<radius; radii+=1){
            [-1, 0, 1].forEach((xN)=>{
                let neighborX = x+xN;
                [-1, 0, 1].forEach((yN)=>{
                    let neighborY = y+yN;
                    if( (neighborX>=0) && (neighborX<this.DIMENSIONS[0]) ){
                        if( (neighborY>=0) && (neighborY<this.DIMENSIONS[1]) ){
                            let neighborId = `${neighborX}x${neighborY}` 
                            //Prevent self as neighbor.
                            // if(neighborId === pixelId) return;
                            let neighbor = this.pixelObjects[neighborId]
                            if(!neighbor){
                                console.log("Neighbor doesn't exist: ", neighborId);
                                console.log("Pixel Objects: ", this.pixelObjects);
                            }
                            neighbors.push(this.pixelObjects[neighborId])
                        }
                    }
                })
            })
        }
        return neighbors;
    }   

    createPixelGrid(){
        let pixelObjects: any = {};
        const pixelDimensions = [this.widthOfPixel,this.heightOfPixel,this.depthOfPixel];

        const SCALAR = 2;

        let initialBoxPosition = [
            -this.DEFAULT_SPACE[0]/4+(this.widthOfPixel/2),
            this.DEFAULT_SPACE[1]/4-(this.heightOfPixel/2),
            0,
        ]
        let lastBoxPosition = [...initialBoxPosition];
        let counter = 0;
        //Make row for each column
        for (let row=0; row<this.DIMENSIONS[0]; row+=1){   
            for (let column=0; column<this.DIMENSIONS[1]; column+=1){
                let boxPosition = [ 
                    lastBoxPosition[0],
                    lastBoxPosition[1],
                    lastBoxPosition[2],
                ]

                let parameters = {
                    dimensions: pixelDimensions,
                    backgroundColor: { r:255, g:255, b:255, a:1.0 },
                    position: boxPosition,
                }
    
                let pixel = this.createThreeJsBox(parameters)
                this.scene.add(pixel)
                pixelObjects[`${row}x${column}`] = {
                    id: `${row}x${column}`,
                    row,
                    column,
                    threeJsObject: pixel,
                    location: lastBoxPosition,
                    dimensions: pixelDimensions,
                };
                lastBoxPosition = boxPosition;

                //Adding to x
                lastBoxPosition[0] = lastBoxPosition[0] + (this.widthOfPixel/2) * SCALAR
                counter+=1;

            }
            //Reset x value
            lastBoxPosition[0] = initialBoxPosition[0]
            //Move one row down.
            lastBoxPosition[1] = lastBoxPosition[1] - (this.heightOfPixel/2) * SCALAR;
        }
        return pixelObjects
    }

    //Maybe I want to render the input space and weights for teaching purposes?
    renderInputSpace(){}
    renderWeights(){}
    //Later will make some sort of GUI to easily interact with SOM.
    //Perhaps allow for loading in your own data too.
    setUpGui(){}

    //This will be what the GUI interacts with.
    initParams(){
        this.som_params = {
            alpha: 0.1,
            DEFAULT_SPACE: [],
            DIMENSIONS: []
        }
    }

    createThreeJsBox(parameters: any){
        const material = new THREE.MeshBasicMaterial({color: parameters.color || 0xffffff});
        material.needsUpdate = true;
        //@ts-ignore
        var geometry = new THREE.BoxGeometry(
            parameters['dimensions'][0],
            parameters['dimensions'][1],
            parameters['dimensions'][2]
        );
        // var geometry = new THREE.BoxGeometry(2.5, 2.5, 2.5)
        
        //@ts-ignore
        var box = new THREE.Mesh( geometry, material );
        //@ts-ignore
        box.position.set(...parameters['position'])
        return box;
    }

    //Might be good for 3D? - doubt it - I was trying to be fancy.
    // findNearestNeighbors2D(pixelId: string, radius: number){
    //     let pixelObject = this.pixelObjects[pixelId];
    //     let pixelWidth = pixelObject.dimensions[0]
    //     let pixelHeight = pixelObject.dimensions[1]
        
    //     let leftXBound = -this.DEFAULT_SPACE[0]/4
    //     let rightXBound = this.DEFAULT_SPACE[0]/4
    //     let upperYBound = this.DEFAULT_SPACE[1]/4
    //     let lowerYBound = -this.DEFAULT_SPACE[1]/4

    //     // console.log("leftBound: ", leftXBound);
    //     // console.log("rightXBound: ", rightXBound);
    //     // console.log("upperYBound: ", upperYBound);
    //     // console.log("lowerYBound: ", lowerYBound);

    //     //Find neighbors within' given radius
    //     let pixelLocation = JSON.parse(pixelId);
    //     const [x,y,z] = pixelLocation;
    //     //Get ring of neighbors for each radii
    //     let neighbors: any = [];
    //     for (let radii=0; radii<=radius; radii+=1){
    //         [-pixelWidth, 0, pixelWidth].forEach((xN)=>{
    //             [-pixelHeight, 0, pixelHeight].forEach((yN)=>{
    //                 // console.log("x+xN: ", x+xN);
    //                 if((x+xN)>leftXBound && (x+xN)<rightXBound){
    //                     if((y+yN)>lowerYBound && (y+yN)<upperYBound){
    //                         let neighborId = JSON.stringify([x+xN, y+yN, z]);
    //                         neighbors.push(this.pixelObjects[neighborId])
    //                     }
    //                 }
    //             })
    //         })
    //     }
    //     return neighbors;
    // }   



}


export default SelfOrganizingMap

