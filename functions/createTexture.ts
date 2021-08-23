
import isObjEmpty from '../helpers/isObjEmpty';
import * as THREE from '../node_modules/three/build/three.module'
import roundRect from './roundRect';

const createTexture = (parameters: any, message: string)=>{
 
    let parametersIsEmpty;
    if ( isObjEmpty(parameters) ){
        // console.log("Parameters empty");
        parameters = {};
        parametersIsEmpty = true;
    }
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
    context.fillText( message, canvas.width/2, canvas.height/2);

    var texture = new THREE.Texture(canvas) 
    texture.needsUpdate = true;

    return texture;
}

export default createTexture;