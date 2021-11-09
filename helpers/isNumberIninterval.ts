const isNumberInInterval = (a: number, b: number, num: number)=> {
    var min = Math.min(a, b),
      max = Math.max(a, b);
    return num >= min && num <= max
}

export default isNumberInInterval