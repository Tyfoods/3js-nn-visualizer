import componentToHex from "./componentToHex";
import rgbToHex from "./rgbToHex";

//credit: https://stackoverflow.com/questions/49974145/how-to-convert-rgba-to-hex-color-code-using-javascript
//Not sure why I would use .slice(1).
//I don't think it's necessary for what I'm doing here.
function rgbaToHex(r: number,g: number,b: number,a: number, prefix: string = '0x') {

    let hex = rgbToHex(r,g,b,prefix);
    let alpha = componentToHex(a);
    hex = hex + alpha;
    return hex;
}

export default rgbaToHex