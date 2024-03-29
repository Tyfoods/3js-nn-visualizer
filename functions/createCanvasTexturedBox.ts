
import roundRect from './roundRect';
import isObjEmpty from '../helpers/isObjEmpty';
import * as THREE from '../node_modules/three/build/three.module'


function createCanvasTexturedBox (message: string, parameters: any, recreating: Boolean = false){
    // let parameters;
    // let message= weightsObj.setWeightValues(Math.random());
    let parametersIsEmpty;
    if ( isObjEmpty(parameters) ){
        parameters = {};
        parametersIsEmpty = true;
    }
    // console.log("parameters: ", parameters);
    var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
    var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 30;
    var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4;
    var borderColor = parameters.hasOwnProperty("borderColor") ?parameters["borderColor"] : 'transparent' /* { r:0, g:0, b:0, a:1.0 } */;
    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?parameters["backgroundColor"] : 'transparent' /* { r:255, g:255, b:255, a:1.0 } */;
    var textColor = parameters.hasOwnProperty("textColor") ?parameters["textColor"] : { r:255, g:255, b:255, a:1.0 };

    var canvas = document.createElement('canvas');
    var size = 75;
    canvas.height = size;
    canvas.width = size;

    var context = canvas.getContext('2d');
        context.font = "Bold " + fontsize + "px " + fontface;
        context.textAlign = 'center';
        context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
        context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";
        context.lineWidth = borderThickness;
    var metrics = context.measureText( message );
    var textWidth = metrics.width;

    roundRect(
        context,
        borderThickness/2,
        borderThickness/2,
        (textWidth + borderThickness) * 1.1,
        fontsize * 1.4 + borderThickness,
        8
    );  

    context.fillStyle = "rgba("+textColor.r+", "+textColor.g+", "+textColor.b+", 1.0)";
    // context.fillText( message, canvas.width/2, canvas.height/2);

    var texture = new THREE.Texture(canvas) 
    texture.needsUpdate = true;

    const material = new THREE.MeshBasicMaterial({
        map: texture, 
      });
    material.needsUpdate = true;

    var geometry = new THREE.BoxGeometry( 2.5, 2.5, 2.5 );

    var box = new THREE.Mesh( geometry, material );

    if(!parametersIsEmpty){
        //@ts-ignore
        box.position.x = parameters.position.x;
        //@ts-ignore
        box.position.y = (recreating ? parameters.position.y : parameters.position.y + 2);
        //@ts-ignore
        box.position.z = parameters.position.z;
        //@ts-ignore
        box.name = parameters.text;
        //@ts-ignore
        box.weightValue = parameters.weightValue;
        // box.visible = parameters.visible;
        // ( parameters.weightID && ( ()=> console.log(parameters.weightID) )() )
        //@ts-ignore
        box.weightID = (parameters.weightID && parameters.weightID);
        //@ts-ignore
        box.inputValue = (parameters.inputValue && parameters.inputValue);
    }
  
    // scene.add(box);
    return box;  
}

export default createCanvasTexturedBox;