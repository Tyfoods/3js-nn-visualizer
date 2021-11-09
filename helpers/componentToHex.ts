const componentToHex=(c: number)=>{
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

export default componentToHex