//@ts-nocheck
import isObjEmpty from '../helpers/isObjEmpty';
import sigmoidSquishification from '../mathFunctions/sigmoidSquishification';
import * as THREE from '../node_modules/three/build/three.module'


let parameters ={};

const createGraph = (trainingData, params, scene)=>{

    scene.children.forEach((child)=>{
      if(child.name === 'graph'){
        scene.remove(child);
      }
    });


    let graph_size = {width: 7, height: 7};

    let parametersIsEmpty;
    if ( isObjEmpty(parameters) ){
        // console.log("Parameters empty");
        parameters = {};
        parametersIsEmpty = true;
    }
    // console.log("parameters: ", parameters);
    var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
    var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 30;
    // var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4;
    // var borderColor = parameters.hasOwnProperty("borderColor") ?parameters["borderColor"] : 'transparent' /* { r:0, g:0, b:0, a:1.0 } */;
    // var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?parameters["backgroundColor"] : 'transparent' /* { r:255, g:255, b:255, a:1.0 } */;
    // var textColor = parameters.hasOwnProperty("textColor") ?parameters["textColor"] : { r:255, g:255, b:255, a:1.0 };


    
    var canvas = document.createElement('canvas');
    var size = 75;
    canvas.height = size;
    canvas.width = size;

    var context = canvas.getContext('2d');
        // context.font = "Bold " + fontsize + "px " + "fontface";
        context.font = "Helvetica";

    function to_screen(x, y) {
        return {x: (x/graph_size.width)*canvas.width, y: -(y/graph_size.height)*canvas.height + canvas.height};
    }

    // map points from screen coordinates to the graph
    function to_graph(x, y) {
        return {x: x/canvas.width*graph_size.width, y: graph_size.height - y/canvas.height*graph_size.height};
    }


    // function draw_grid() {


        context.strokeStyle = "#fff";
        for (let j = 0; j <= graph_size.width; j++) {
  
          // x lines
          context.beginPath();
          let p = to_screen(j, 0);
          context.moveTo(p.x, p.y);
          p = to_screen(j, graph_size.height);
          context.lineTo(p.x, p.y);
          context.stroke();
  
          // y lines
          context.beginPath();
          p = to_screen(0, j);
          context.moveTo(p.x, p.y);
          p = to_screen(graph_size.width, j);
          context.lineTo(p.x, p.y);
          context.stroke();
        }


    //   }


    
    // function draw_points() {

        // unknown
        // let p = to_screen(dataU[0], dataU[1]);
        // context.fillStyle = "#555555";
        // context.fillText("???", p.x-8, p.y-5);
        // context.fillRect(p.x-2, p.y-2, 4, 4);


        let p;

        // draw points
        context.fillStyle = "#0000FF";
        for (let j = 0; j < trainingData.length; j++) {
          let point = trainingData[j][0];
          if (trainingData[j][1] == 0) {
            context.fillStyle = "#0000FF";
          } else {
            context.fillStyle = "#FF0000";
          }
          p = to_screen(point[0], point[1]);
          context.fillRect(p.x-2, p.y-2, 4, 4);
        }


    // }

    
    // function visualize_params(params) {


        context.save();
        context.globalAlpha = 0.2;
        let step_size = .1;
        let box_size = canvas.width/(graph_size.width/step_size);
  
        for (let xx = 0; xx < graph_size.width; xx += step_size) {
          for (let yy = 0; yy < graph_size.height; yy += step_size) {
            let model_out = sigmoidSquishification( xx * params.w1 + yy * params.w2 + params.b );
            if (model_out < .5) {
              // blue
            //   context.fillStyle = "#0000FF";
              context.fillStyle = "#CCd4FE";
            } else {
              // red
              //FFCCD3
            //   context.fillStyle = "#FF0000";
              context.fillStyle = "#FFCCD3";
            }
            let p = to_screen(xx, yy);
            context.fillRect(p.x, p.y, box_size, box_size);
          }
        }
        context.restore();


    //   }

    var graphTexture = new THREE.Texture(canvas) 
    graphTexture.needsUpdate = true;


    
    // let graphTexture = createTexture({backgroundColor: { r:255, g:255, b:255, a:1.0 }}, "   ");
    const graphMaterial = new THREE.MeshBasicMaterial({
        map: graphTexture, 
      });
    var graphGeometry = new THREE.BoxGeometry( 20, 20, 2.5 );

    var graph = new THREE.Mesh( graphGeometry, graphMaterial );
    graph.position.x = -25;
    graph.name = "graph";
    scene.add(graph);
}

export default createGraph