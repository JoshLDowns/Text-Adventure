import readline from 'readline';
const rl = readline.createInterface(process.stdin, process.stdout);

export function ask(questionText) {
  return new Promise((resolve, reject) => {
    rl.question(questionText, resolve);
  });
}

export function wrap(string, w) { //text wrapping function
    if (string.length <= w) {
        return string;
    }

    let count = 1;
    let tempString = '';
    let sliceNum = 0;

    while (string.length > (count * w)) {
        tempString = string.slice(sliceNum, (count * w) - 1);
        sliceNum = tempString.lastIndexOf(' ') + sliceNum;
        string = string.slice(0, sliceNum) + `\n` + string.slice(sliceNum + 1)
        sliceNum += 1;
        count += 1;
    }

    return string;
}

export function random(max) { //random number generator
    return Math.floor(Math.random() * max) + 1;
}