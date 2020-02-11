let width = process.stdout.columns - 5;

async function wait(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
}

function wrap(string, w) {
    if (string.length <= w) {
        return string;
    }

    let count = 1;
    let tempString='';
    let sliceNum=0;

    while (string.length > (count * w)) {
        tempString = string.slice(sliceNum, (count*w)-1);
        sliceNum = tempString.lastIndexOf(' ')+sliceNum;
        string = string.slice(0, sliceNum) + `\n` + string.slice(sliceNum+1)
        sliceNum+=1;
        count += 1;
    }

    return string;
}

async function slowLog (string) {
    let stringArray = string.split('\n');
    for (let subString of stringArray) {
        let subArray = subString.split('');
        for (let letter of subArray) {
            process.stdout.write(letter);
            await wait(25);
        }
    }
}

let text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc sit amet iaculis est. Nunc vel tempor augue, eget consectetur neque. Cras erat velit, ullamcorper et feugiat vitae, tempor at mi. Quisque ullamcorper tempor vestibulum.';
slowLog(wrap(text, width));