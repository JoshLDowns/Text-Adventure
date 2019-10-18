const readline = require('readline');
const rl = readline.createInterface(process.stdin, process.stdout);

function ask(questionText) {
    return new Promise((resolve, reject) => {
        rl.question(questionText, resolve);
    });
}

class ValidInput {
    constructor (string) {
        this.firstWord = string.slice(0, string.indexOf(' ')).toUpperCase();
        this.lastWord = string.slice((string.lastIndexOf(' '))+1).toUpperCase();
        this.return = undefined;
        this.affirmative = ['YES', 'Y', 'YEAH', 'YUP', 'YUPPER', 'MHM', 'MMHMM', 'AFFIRMATIVE', '\r'];
        this.negatory = ['NO', 'N', 'NOPE', 'NADA', 'NEGATORY'];
        this.direction = ['GO', 'TRAVEL', 'LEAVE', 'EXIT', 'NORTH', 'SOUTH', 'EAST', 'WEST'];
        this.inventory = ['B', 'INVENTORY', 'BAG', 'BACKPACK'];
        this.status = ['STATUS', 'INFO'];
        this.inspect = ['INSPECT'];
        this.instructions = ['D', 'DIRECTIONS', 'INSTRUCTIONS', 'INST', 'HOW'];
        this.pickUpItem = ['PICK UP', 'PICK', 'GRAB', 'AQUIRE', 'METAL', 'BATTERY', 'COATING', 'BOX1', 'BOX2'];
        this.validInputs = [this.affirmative, this.negatory, this.direction, this.inventory, this.status, this.inspect, this.instructions, this.pickUpItem];
    }

    firstInputTrue () {
        for (let arr of this.validInputs) {
            for (let item of arr) {
                if (this.firstWord === item.toString()) {
                    return true;
                }
            }
        }
        return false;
    }

    lastWordTrue () {
        for (let arr of this.validInputs) {
            for (let item of arr) {
                if (this.lastWord === item.toString()) {
                    return true;
                }
            }
        }
        return false;
    }

    returnInput (obj) {
        if (this.affirmative.includes(obj.firstWord) || this.affirmative.includes(obj.lastWord)){
            this.return = 'y';
        } else if (this.negatory.includes(obj.firstWord) || this.negatory.includes(obj.lastWord)){
            this.return = 'n';
        } else if (this.inventory.includes(obj.firstWord) || this.inventory.includes(obj.lastWord)){
            this.return = 'i';
        } else if (this.status.includes(obj.firstWord) || this.status.includes(obj.lastWord)){
            this.return = 's';
        } else if (this.inspect.includes(obj.firstWord) || this.inspect.includes(obj.lastWord)){
            this.return = 'insp';
        } else if (this.direction.includes(obj.firstWord) || this.direction.includes(obj.lastWord)){
            if (obj.firstWord === 'NORTH' || obj.lastWord === 'NORTH'){
                this.return = 'dn';
            } else if (obj.firstWord === 'SOUTH' || obj.lastWord === 'SOUTH') {
                this.return = 'ds';
            } else if (obj.firstWord === 'EAST' || obj.lastWord === 'EAST') {
                this.return = 'de';
            } else {
                this.return = 'dw';
            }
        } else if (this.pickUpItem.includes(obj.firstWord) || this.pickUpItem.includes(obj.lastWord)){
            if (obj.firstWord === 'METAL' || obj.lastWord === 'METAL') {
                this.return = 'pu_scrapmetal';
            } else if (obj.firstWord === 'BATTERY' || obj.lastWord === 'BATTERY'){
                this.return = 'pu_particlebattery';
            } else if (obj.firstWord === 'COATING' || obj.lastWord === 'COATING'){
                this.return = 'pu_carboncoating';
            } else if (obj.firstWord === 'BOX1' || obj.lastWord === 'BOX1'){
                this.return = 'pu_rboxw'
            } else {
                this.return  = 'pu_rboxe';
            }
        }
        else {
            return 'd';
        }
    }
}

async function whatToDo () {
    let input = await ask('What would you like to do?\n');
    input = new ValidInput(input);
    console.log(input);
    while (input.firstInputTrue() === false && input.lastWordTrue() === false) {
        console.log('Please enter a valid input...\n');
        input = await ask('What would you like to do?\n');
        input = new ValidInput(input);
    }
    input.returnInput(input);
    //console.log(input);
    console.log(input.return);
    process.exit();
}

whatToDo();
