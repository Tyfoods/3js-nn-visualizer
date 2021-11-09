//Credit: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb 
import componentToHex from "./componentToHex";

const rgbToHex=(r: number, g: number, b: number, prefix = '0x')=>{
    return prefix + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export default rgbToHex;