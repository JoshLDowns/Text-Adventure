const readline = require('readline');
const rl = readline.createInterface(process.stdin, process.stdout);

function ask(questionText) {
    return new Promise((resolve, reject) => {
        rl.question(questionText, resolve);
    });
}

let player = {
    maxHealth : 80,
    health: 80,
    inventory: ['Office Keycard West', 'Office Keycard East', 'North Tower Keycard', 'Repair Kit', 'Repair Kit', 'Repair Kit'],
    attack: 'Particle Beam',
    damageBase: 9,
    damageModifier: 4,
    status: undefined,
    useItem: function (item) { //removes item from inventory on use
        for (var i = 0; i < this.inventory.length; i++) {
            if (this.inventory[i] === item) {
                this.inventory.splice(i, 1);
                break;
            }
        }
    },
    getStatus: function () {
        console.log(`You currently have ${this.health} HP.`);
        if ((this.health / this.maxHealth) > .75){
            console.log('HP is above 75%, you are feeling great');
        } else if ((this.health / this.maxHealth) < .25) {
            console.log('HP is below 25%, repair as soon as you can!');
        } else {
            console.log('You are a little beat up but doing alright!')
        }
        console.log(`Your Particle Beam has a base damage value of ${this.damageBase}.\n`);
    },

    inspectBag () {
        if (this.inventory.length !== 0) {
            console.log(`You currently have the following items in your bag:`);
            console.log(this.inventory.join(', ') + `\n`);
        } else {
            console.log('You currently are not carrying any items in your bag.\n');
        }
    }
}

class Enemy {
    constructor (name, health, attack, ability, damageBase, damageModifier, abilityType, abilityBase, abilityModifier, reward, postRoomInfo) {
        this.name = name;
        this.health = health;
        this.attack = attack;
        this.ability = ability;
        this.damageBase = damageBase;
        this.damageModifier = damageModifier;
        this.abilityType = abilityType;
        this.abilityBase = abilityBase;
        this.abilityModifier = abilityModifier;
        this.reward = reward;
        this.postRoomInfo = postRoomInfo;
    }
}

//let enemyW = new Enemy ('Robot Sentry', 30, 'Plasma Ray', 'Static Discharge', 6, 6, 'status_stun', undefined, undefined, 'Killswitch Code 1', 'Sample Info E');
//let enemyE = new Enemy('Robot Bruiser', 75, 'Pneumatic Fist', 'Missle Barrage', 3, 3, 'offensive', 6, 12, 'Killswitch Code 2', 'Sample Info W');
let enemyN1 = new Enemy('Mechanical Surveillance Unit', 100, 'Fission Laser', 'Remote Laser', 8, 6, 'status_dot', 3, 3, 'Office Keycard North', 'Sample Info N,S,E,W');

class ValidInput {
    constructor (string) {
        this.firstWord = string.slice(0, string.indexOf(' ')).toUpperCase();
        this.lastWord = string.slice((string.lastIndexOf(' '))+1).toUpperCase();
        this.return = undefined;
        this.affirmative = ['YES', 'YEAH', 'YUP', 'YUPPER', 'MHM', 'MMHMM', 'AFFIRMATIVE', '\r'];
        this.negatory = ['NO', 'NOPE', 'NADA', 'NEGATORY'];
        this.direction = ['GO', 'TRAVEL', 'LEAVE', 'EXIT', 'N', 'NORTH', 'S', 'SOUTH', 'E', 'EAST', 'W', 'WEST'];
        this.inventory = ['B', 'INVENTORY', 'BAG', 'BACKPACK'];
        this.status = ['STATUS', 'INFO', 'HP', 'HEALTH'];
        this.inspect = ['INSPECT'];
        this.instructions = ['D', 'DIRECTIONS', 'INSTRUCTIONS', 'INST', 'HOW', 'PLAY'];
        this.pickUpItem = ['PICK UP', 'PICK', 'GRAB', 'GET', 'AQUIRE'];
        this.useItem = ['USE'];
        this.combat = ['ATTACK', 'FIGHT', 'THROW', 'SHOOT', 'FIRE'];
        this.items = ['KIT', 'METAL', 'BATTERY', 'COATING', 'BOX1', 'BOX2']
        this.otherActions = ['DROP', 'THROW', 'FART', 'LAUGH', 'LOL', 'HUG', 'READ']
        this.validInputs = [this.affirmative, this.negatory, this.direction, this.inventory, this.status, this.inspect, this.instructions, this.useItem, this.pickUpItem, this.combat];
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
            if (obj.firstWord === 'NORTH' || obj.lastWord === 'NORTH' || obj.firstWord === 'N' || obj.lastWord === 'N'){
                this.return = 'dn';
            } else if (obj.firstWord === 'SOUTH' || obj.lastWord === 'SOUTH' || obj.firstWord === 'S' || obj.lastWord === 'S') {
                this.return = 'ds';
            } else if (obj.firstWord === 'EAST' || obj.lastWord === 'EAST' || obj.firstWord === 'E' || obj.lastWord === 'E') {
                this.return = 'de';
            } else if (obj.firstWord === 'WEST'|| obj.lastWord === 'WEST' || obj.firstWord === 'W' || obj.lastWord === 'W') {
                this.return = 'dw';
            } else {
                this.return ='dnull';
            }
        } else if (obj.firstWord === 'USE') {
            if (obj.lastWord === 'BATTERY') {
                this.return = 'use_particlebattery';
            } else if (obj.lastWord === 'COATING') {
                this.return = 'use_carboncoating';
            } else if (obj.lastWord === 'KIT') {
                this.return = 'use_repairkit';
            } else if (obj.lastWord === 'BOX1') {
                this.return = 'use_rboxw';
            } else if (obj.lastWord === 'BOX2') {
                this.return = 'use_rboxe';
            } else if (obj.lastWord === 'METAL') {
                this.return = 'no_use'
            } else {
                this.return = 'use_null';
            }
        } else if (this.pickUpItem.includes(obj.firstWord)){
            if (obj.firstWord === 'METAL' || obj.lastWord === 'METAL') {
                this.return = 'pu_scrapmetal';
            } else if (obj.firstWord === 'BATTERY' || obj.lastWord === 'BATTERY'){
                this.return = 'pu_particlebattery';
            } else if (obj.firstWord === 'COATING' || obj.lastWord === 'COATING'){
                this.return = 'pu_carboncoating';
            } else if (obj.firstWord === 'KIT' || obj.lastWord === 'KIT') {
                this.return = 'pu_repairkit';
            } else if (obj.firstWord === 'BOX1' || obj.lastWord === 'BOX1'){
                this.return = 'pu_rboxw';
            } else if (obj.firstword === 'BOX2' || obj.lastWord === 'BOX2') {
                this.return  = 'pu_rboxe';
            } else {
                this.return = 'pu_null';
            }
        } else if (this.combat.includes(obj.firstWord) || this.combat.includes(obj.lastWord)){
            if (obj.firstWord === 'THROW') {
                this.return = 'throw';
            } else {
                this.return = 'combat';
            }
        } else {
            return 'd';
        }
    }
}

//useable item array
let useableItems = ['use_particlebattery', 'use_carboncoating', 'use_rboxw', 'use_rboxe', 'use_repairkit'];

//useable item lookup object
let useableItemLookUp = {
    use_repairkit : 'Repair Kit',
    use_particlebattery : 'Particle Battery',
    use_carboncoating : 'Thick Carbon Coating',
    use_rboxw : 'Riddle Box1',
    use_rboxe : 'Riddle Box2'
}

function itemEffect (item) {
    if (item === 'use_repairkit') {
        player.useItem(useableItemLookUp[item]);  
        player.health = player.health + 25;
        if (player.health > player.maxHealth) {
            player.health = player.maxHealth;
        }
        return console.log(`Your health has been restored!  You currently have ${player.health} HP!\n`);
    } else if (item === 'use_particlebattery') {
        player.useItem(useableItemLookUp[item]);
        player.damageBase = player.damageBase + 2;
        return console.log(`You have upgraded your Particle Beam!  It now hits harder than ever!`);
    } else if (item === 'use_carboncoating') {
        player.useItem(useableItemLookUp[item]);
        player.maxHealth = player.maxHealth + 10;
        return console.log(`You have increased your maximum HP by 10 points!`);
    }
}

function random(max) { //random number generator
    return Math.floor(Math.random() * max) + 1;
}

//status checking function for combat
function statusCheck(comp) {
    if (player.status === 'status_stun') {
        console.log(`You are still stunned!`)
        return player.status = undefined;
    } else if (player.status === 'status_dot') {
        let dotDamage = comp.abilityBase + random(comp.abilityModifier);
        console.log(`The ${comp.ability} is still active! It dealt ${dotDamage} damage!`);
        player.health = player.health - dotDamage;
        if (player.health <= 0) {
            console.log('You have been defeated! Better luck next time!');
            process.exit();
            } else {
            return console.log(`Your currently have ${player.health} HP!\n`);
            }
    }
}

function useCompAbility (comp) {
    if (comp.abilityType === 'status_stun') {
        let stunChance = random(2);
        if (stunChance === 1) {
            console.log(`${comp.name} used ${comp.ability}!  You are stunned from the attack!\n`)
            return player.status = 'status_stun';
        } else {
            console.log(`${comp.name} used ${comp.ability} ... it failed!\n`);
            return player.status = undefined;
        }
    } else if (comp.abilityType === 'offensive') {
        let miss = random(5);
        if (miss !== 5) {
            let abilityDamage = comp.abilityBase + random(comp.abilityModifier);
            console.log(`${comp.name} used ${comp.ability}, it dealt ${abilityDamage} damage!\n`);
            player.health = player.health - abilityDamage;
            if (player.health <= 0) {
                console.log('You have been defeated! Better luck next time!');
                process.exit();
                } else {
                return console.log(`Your currently have ${player.health} HP!\n`);
                }
        } else {
            return console.log(`${comp.name} used ${comp.ability} ... it missed!\n`);
        }
    } else if (comp.abilityType === 'status_dot') {
        let dotChance = random(5);
        if (dotChance !== 5 && player.status !== 'status_dot') {
            player.status = 'status_dot';
            return console.log(`${comp.name} used ${comp.ability} ... it plants a remote laser on the ground!\n`)
        } else {
            console.log(`${comp.name} used ${comp.ability} ... it failed!\n`);
            return player.status = undefined;
        }
    }
}

//combat function
async function combat(comp) {
    let damageUser = 0;
    let damageComp = 0;
    let criticalHit;
    let miss;
    let compAbility;
    let statusCount;
    player.status = undefined;

    while (player.health > 0 || comp.health > 0) {  //Loop that breaks when either user or computer hits 0 or less HP
        //Player Turn
        if (player.status === 'status_stun'){
            statusCheck(comp);
        } else {
            if (player.status === 'status_dot'){
                statusCheck(comp);
                if (statusCount !== 0) {
                    statusCount = statusCount - 1
                    if (statusCount === 0) {
                        player.status = undefined;
                        console.log(`${comp.name}'s ${comp.ability} is no longer active!`);
                    }
                }
            }
            let input = await ask(`What would you like to do? (Try things like 'attack' or use and item!)\n`);
            input = new ValidInput(input);
            while (input.firstInputTrue() === false && input.lastWordTrue() === false) {
                console.log('Please enter a valid input...\n');
                input = await ask('What would you like to do?\n');
                input = new ValidInput(input);
            }
            input.returnInput(input);
            input = input.return.toString();
            if (input === 'combat') {
                criticalHit = random(5);
                miss = random(5);
                damageUser = player.damageBase + random(player.damageModifier);  //damage + modifier (like dice roll)
                if (miss === 5) {
                    console.log(`Your ${player.attack} missed!`)
                } else if (criticalHit === 5) {
                    damageUser = damageUser + (Math.ceil(player.damageBase * .75));
                    console.log(`You fired your ${player.attack}!  It was a Critical Hit!!\nIt dealt ${damageUser} damage!\n`); 
                    comp.health = comp.health - damageUser;
                    if (comp.health <= 0) {
                        console.log(`You have defeated ${comp.name}, congratulations!`);
                        console.log(`You received ${comp.reward} for winning!\n`);
                        player.inventory.push(comp.reward);
                        console.log(player.inventory);
                        return true;
                    }
                } else {
                console.log(`You fired your ${player.attack}!  It dealt ${damageUser} damage!\n`); 
                comp.health = comp.health - damageUser;
                if (comp.health <= 0) {
                    console.log(`You have defeated ${comp.name}, congratulations!`);
                    console.log(`You received ${comp.reward} for winning!`);
                    player.inventory.push(comp.reward);
                    console.log(player.inventory);
                    return true;
                    }
                }
            } else if (input === 'use_null') {
                console.log(`I'm not sure what item you are trying to use...\n`);
            } else if (input === 'no_use') {
                console.log(`You cannot use that item right now...\n`);
            } else if (useableItems.includes(input)){  //uses items in inventory
                input = input.toString();
                let itemToUse = useableItemLookUp[input];
                let userInventory = player.inventory;
                if (userInventory.includes(itemToUse) && input !== 'use_rboxe' && input !== 'use_rboxw'){
                    itemEffect(input);
                } else {
                    console.log(`You don't have that item in your bag! Better go find one if you want to use it!\n`);
                }
            } else {
                console.log('Now is not the time or place for that! ... ATTACK!');
                criticalHit = random(5);
                miss = random(5);
                damageUser = player.damageBase + random(player.damageModifier);  //damage + modifier (like dice roll)
                if (miss === 5) {
                    console.log(`Your ${player.attack} missed!`)
                } else if (criticalHit === 5) {
                    damageUser = damageUser + (Math.ceil(player.damageBase * .75));
                    console.log(`You fired your ${player.attack}!  It was a Critical Hit!!\nIt dealt ${damageUser} damage!\n`); 
                    comp.health = comp.health - damageUser;
                    if (comp.health <= 0) {
                        console.log(`You have defeated ${comp.name}, congratulations!`);
                        console.log(`You received ${comp.reward} for winning!\n`);
                        player.inventory.push(comp.reward);
                        return true;
                    }
                } else {
                console.log(`You fired your ${player.attack}!  It dealt ${damageUser} damage!\n`); 
                comp.health = comp.health - damageUser;
                if (comp.health <= 0) {
                    console.log(`You have defeated ${comp.name}, congratulations!`);
                    console.log(`You received ${comp.reward} for winning!\n`);
                    player.inventory.push(comp.reward);
                    return true;
                    }
                }
            }
        }
        //Computer Enemy turn
        compAbility = random(4);
        if (compAbility !== 4) {
            criticalHit = random(5);
            miss = random(5);
            damageComp = comp.damageBase + random(comp.damageModifier) + 1;
            if (miss === 5) {
                console.log(`${comp.name} fired a ${comp.attack} ... it missed!\n`);
            } else if (criticalHit === 5) {
                damageComp = damageComp + (Math.ceil(comp.damageBase * .75));
                player.health = player.health - damageComp;
                console.log(`${comp.name} fired a ${comp.attack} ... it was a critical hit!\nIt dealt ${damageComp} damage!\n`);
                if (player.health <= 0) {
                    console.log('You have been defeated! Better luck next time!');
                    process.exit();
                } else {
                    console.log(`Your currently have ${player.health} HP!\n`);
                }
            } else {
                console.log(`${comp.name} fired a ${comp.attack}, it dealt ${damageComp} damage!\n`);
                player.health = player.health - damageComp;
                if (player.health <= 0) {
                console.log('You have been defeated! Better luck next time!');
                process.exit();
                } else {
                console.log(`Your currently have ${player.health} HP!\n`);
                }
            }
        } else {
            useCompAbility(comp);
            if (statusCount !== 0 && player.status === 'status_dot') {
                statusCount = random(5);
            }
        }
    }   
}



combat(enemyN1);