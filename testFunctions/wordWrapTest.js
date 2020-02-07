let width = process.stdout.columns - 5;

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

let text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc sit amet iaculis est. Nunc vel tempor augue, eget consectetur neque. Cras erat velit, ullamcorper et feugiat vitae, tempor at mi. Quisque ullamcorper tempor vestibulum.';
console.log(wrap(text, width));