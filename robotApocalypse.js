const readline = require('readline');
const rl = readline.createInterface(process.stdin, process.stdout);

function ask(questionText) {
    return new Promise((resolve, reject) => {
        rl.question(questionText, resolve);
    });
}
//player object
let player = {
    name: undefined,
    maxHealth: 50,
    health: 50,
    inventory: [],
    attack: 'Particle Beam',
    damageBase: 5,
    damageModifier: 4,
    status: undefined,
    status2: undefined,
    hasKilled: false,
    useItem: function (item) { //removes item from inventory on use
        for(let element of this.inventory) {
            if(element === item) {
                this.inventory.splice(this.inventory.indexOf(item),1);
                break;
            }
        }
    },
    //displays player status
    getStatus: function (room) {
        console.log(`\nCurrent Room: ${room}\n`);
        console.log(`You currently have ${this.health} HP.`);
        if ((this.health / this.maxHealth) > .75) {
            console.log('HP is above 75%, you are feeling great');
        } else if ((this.health / this.maxHealth) < .25) {
            console.log('HP is below 25%, repair as soon as you can!');
        } else {
            console.log('You are a little beat up but doing alright!')
        }
        console.log(`Your Particle Beam has a base damage value of ${this.damageBase}.\n`);
    },
    //displays inventory in an easy to read manner with item descriptions
    inspectBag() {
        if (this.inventory.length !== 0) {
            console.log(`You currently have the following items in your bag:`);
            let newInv = this.inventory.sort();
            let itemCount = 1;
            for (let i = 0; i < newInv.length; i++) {
                if (newInv[i] !== newInv[i + 1]) {
                    console.log(`  ${itemCount} ${newInv[i]}  |  ${descLookUp[newInv[i]]}`);
                    itemCount = 1
                } else {
                    itemCount += 1;
                }
            }
            console.log('\n');
        } else {
            console.log('You currently are not carrying any items in your bag.\n');
        }
    }
}
let playerReset = player;

//Enemy Class
class Enemy {
    constructor(name, health, attack, ability, damageBase, damageModifier, abilityType, abilityBase, abilityModifier, reward, postRoomInfo, postRoomInfo2) {
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
        this.postRoomInfo2 = postRoomInfo2;
        this.status = undefined;
    }
}

//Enemy Objects
let enemyW = new Enemy('Robot Sentry', 40, 'Plasma Ray', 'Static Discharge', 6, 9, 'status_stun', undefined, undefined, 'Killswitch Code 1', 'The low hum of the servers surrounds you as you stare at what was left of your foe...\n', `Taking down your first enemy was both empowering and soul crushing...\nYour new found power is exhilerating but what have you given up for it? ...\nThe low hum of the servers surrounds you.\n`);
let enemyE = new Enemy('Robot Bruiser', 75, 'Pneumatic Fist', 'Missle Barrage', 6, 3, 'offensive', 8, 12, 'Killswitch Code 2', 'The low hum of the servers surrounds you as you stare at what was left of your foe...\n', `Taking down your first enemy was both empowering and soul crushing...\nYour new found power is exhilerating but what have you given up for it? ...\nThe low hum of the servers surrounds you.\n`);
let enemyN1 = new Enemy('Mechanical Surveillance Unit', 100, 'Fission Laser', 'Remote Laser', 10, 6, 'status_dot', 6, 3, 'Office Keycard North', 'As the dust settles, you notice that you were surrounded by automated\nturrets, thankfully defeating this foe seems to have shut them down...\nThe room is earily quiet.\n');
let enemyF = new Enemy('Enforcer Captain', 125, 'Collider Beam', 'Combat Repair', 10, 10, 'defensive', 14, 6, 'Killswitch Code 3', `Your final foe has been defeated ...\nYou are so close to your end goal, but you can't help but ask yourself,\nhas destroying your own kind been worth it?\n`);

let enemyWReset = enemyW;
let enemyEReset = enemyE;
let enemyN1Reset = enemyN1;
let enemyFReset = enemyF;

//Input validation class
class ValidInput {
    constructor(string) {
        this.firstWord = string.slice(0, string.indexOf(' ')).toUpperCase();
        this.lastWord = string.slice((string.lastIndexOf(' ')) + 1).toUpperCase();
        this.return = undefined;
        this.affirmative = ['YES', 'YEAH', 'YUP', 'YUPPER', 'MHM', 'MMHMM', 'AFFIRMATIVE',];
        this.negatory = ['NO', 'NOPE', 'NADA', 'NEGATORY'];
        this.direction = ['GO', 'TRAVEL', 'LEAVE', 'EXIT', 'N', 'NORTH', 'S', 'SOUTH', 'E', 'EAST', 'W', 'WEST', 'INSIDE', 'IN'];
        this.inventory = ['B', 'INVENTORY', 'BAG', 'BACKPACK'];
        this.status = ['STATUS', 'INFO', 'HP', 'HEALTH'];
        this.inspect = ['INSPECT', 'EXAMINE', 'ROOM'];
        this.instructions = ['D', 'DIRECTIONS', 'INSTRUCTIONS', 'INST', 'HOW', 'PLAY', 'HELP'];
        this.pickUpItem = ['PICK UP', 'PICK', 'GRAB', 'GET', 'TAKE', 'AQUIRE'];
        this.useItem = ['USE'];
        this.combat = ['ATTACK', 'FIGHT', 'THROW', 'SHOOT', 'FIRE'];
        this.items = ['KIT', 'METAL', 'BATTERY', 'COATING', 'BOX1', 'BOX2', 'PLASMA GRENADE', 'PORTABLE SHIELD', 'SMOKE BOMB', 'CELL', 'NUCLEAR', 'RAY'];
        this.otherActions = ['DROP', 'THROW', 'FART', 'LAUGH', 'LOL', 'HUG', 'READ', 'OPEN', 'RUN', 'CHECK'];
        this.intObjects = ['SIGN', 'DESK', 'COMPUTER', 'CABINET', 'FRIDGE', 'REFRIDGERATOR', 'SAFE', 'MAP', 'DIRECTORY'];
        this.falloutBunkerEvent = ['REPAIR', 'FIX', 'KEYCARD', 'KEY'];
        this.validInputs = [this.affirmative, this.negatory, this.direction, this.inventory, this.status, this.inspect, this.instructions, this.useItem, this.pickUpItem, this.combat, this.items, this.otherActions, this.intObjects, this.falloutBunkerEvent];
    }
    //checks first word of input
    firstInputTrue() {
        for (let arr of this.validInputs) {
            for (let item of arr) {
                if (this.firstWord === item.toString()) {
                    return true;
                }
            }
        }
        return false;
    }
    //checks last word of input
    lastWordTrue() {
        for (let arr of this.validInputs) {
            for (let item of arr) {
                if (this.lastWord === item.toString()) {
                    return true;
                }
            }
        }
        return false;
    }
    //determines the return output of each valid entry
    returnInput(obj) {
        if (this.affirmative.includes(obj.firstWord) || this.affirmative.includes(obj.lastWord)) {
            this.return = 'y';
        } else if (this.negatory.includes(obj.firstWord) || this.negatory.includes(obj.lastWord)) {
            this.return = 'n';
        } else if (this.inventory.includes(obj.firstWord) || this.inventory.includes(obj.lastWord)) {
            this.return = 'i';
        } else if (this.status.includes(obj.firstWord) || this.status.includes(obj.lastWord)) {
            this.return = 's';
        } else if (this.inspect.includes(obj.firstWord) || this.inspect.includes(obj.lastWord)) {
            if (this.inspect.includes(obj.firstWord)) {
                if (obj.lastWord === 'BOX1') {
                    this.return = 'read_rboxw';
                } else if (obj.lastWord === 'BOX2') {
                    this.return = 'read_rboxe';
                } else if (obj.lastWord === 'SIGN') {
                    this.return = 'read_sign';
                } else if (obj.lastWord === 'MAP' || obj.lastWord === 'DIRECTORY') {
                    this.return = 'read_map';
                } else if (obj.lastWord === 'DESK') {
                    this.return = 'open_desk';
                } else if (obj.lastWord === 'CABINET') {
                    this.return = 'open_cabinet';
                } else if (obj.lastWord === 'FRIDGE' || obj.lastWord === 'REFRIDGERATOR') {
                    this.return = 'open_fridge';
                } else if (obj.lastWord === 'SAFE') {
                    this.return = 'open_safe';
                } else if (obj.lastWord === 'ROOM') {
                    this.return = 'insp';
                }
            } else if (obj.firstWord === 'CHECK' && obj.lastWord === 'ROOM') {
                this.return = 'insp';
            } else if (!(this.inspect.includes(obj.firstWord)) && this.inspect.includes(obj.lastWord) && obj.firstWord !== 'INSPEC' && obj.firstWord !== 'EXAMIN') {
                this.return = 'not_sure';
            } else {
            this.return = 'insp';
            }
        } else if (this.falloutBunkerEvent.includes(obj.firstWord) || this.falloutBunkerEvent.includes(obj.lastWord)) {
            if (obj.firstWord === 'REPAIR' || obj.lastWord === 'REPAIR' || obj.firstWord === 'FIX' || obj.lastWord === 'FIX') {
                this.return = 'fob_fix';
            } else if (obj.firstWord === 'KEY' || obj.lastWord === 'KEY' || obj.firstWord === 'KEYCARD' || obj.lastWord === 'KEYCARD') {
                this.return = 'fob_key';
            } else {
                this.return = 'fob_null';
            }
        } else if (obj.firstWord === 'OPEN' || obj.lastWord === 'OPEN') {
            if (obj.lastWord === 'DESK') {
                this.return = 'open_desk';
            } else if (obj.lastWord === 'CABINET') {
                this.return = 'open_cabinet';
            } else if (obj.lastWord === 'FRIDGE' || obj.lastWord === 'REFRIDGERATOR') {
                this.return = 'open_fridge';
            } else if (obj.lastWord === 'SAFE') {
                this.return = 'open_safe'
            } else if (obj.lastWord === 'BOX1') {
                this.return = 'use_rboxw';
            } else if (obj.lastWord === 'BOX2') {
                this.return = 'use_rboxe';
            } else {
                this.return = 'open_null';
            }
        }
        else if (obj.firstWord === 'READ' || obj.lastWord === 'READ') {
            if (obj.lastWord === 'BOX1') {
                this.return = 'read_rboxw';
            } else if (obj.lastWord === 'BOX2') {
                this.return = 'read_rboxe';
            } else if (obj.lastWord === 'SIGN') {
                this.return = 'read_sign';
            } else if (obj.lastWord === 'MAP' || obj.lastWord === 'DIRECTORY') {
                this.return = 'read_map';
            } else {
                this.return = 'read_null';
            }
        } else if (this.pickUpItem.includes(obj.firstWord) && this.intObjects.includes(obj.lastWord)) {
            if (obj.lastWord === 'Cabinet') {
                this.return = 'no_pu_Cabinet';
            } else if (obj.lastWord === 'Desk') {
                this.return = 'no_pu_Desk';
            } else if (obj.lastWord === 'COMPUTER') {
                this.return = 'no_pu_comp';
            } else if (obj.lastWord === 'SAFE') {
                this.return = 'no_pu_safe';
            } else if (obj.lastWord === 'SIGN') {
                this.return = 'no_pu_sign';
            } else if (obj.lastWord === 'FRIDGE') {
                this.return = 'no_pu_fridge';
            } else if (obj.lastWord === 'REFRIDGERATOR') {
                this.return = 'no_pu_fridge';
            } else {
                this.return = 'no_pickup';
            }
        } else if (obj.firstWord === 'DROP' || obj.lastWord === 'DROP') {
            if (obj.lastWord === 'BATTERY') {
                this.return = 'drop_particlebattery';
            } else if (obj.lastWord === 'COATING') {
                this.return = 'drop_carboncoating';
            } else if (obj.lastWord === 'KIT') {
                this.return = 'drop_repairkit';
            } else if (obj.lastWord === 'BOX1') {
                this.return = 'drop_rboxw';
            } else if (obj.lastWord === 'BOX2') {
                this.return = 'drop_rboxe';
            } else if (obj.lastWord === 'GRENADE') {
                this.return = 'drop_grenade';
            } else if (obj.lastWord === 'SHIELD') {
                this.return = 'drop_shield';
            } else if (obj.lastWord === 'BOMB') {
                this.return = 'drop_bomb';
            } else if (obj.lastWord === 'METAL') {
                this.return = 'drop_scrapmetal'
            } else if (obj.lastWord === 'CELL') {
                this.return = 'drop_fuelcell';
            } else if (obj.lastWord === 'RAY') {
                this.return = 'drop_heatray';
            } else {
                this.return = 'drop_null';
            }
        }
        else if (this.direction.includes(obj.firstWord) || this.direction.includes(obj.lastWord)) {
            if (obj.firstWord === 'NORTH' || obj.lastWord === 'NORTH' || obj.firstWord === 'N' || obj.lastWord === 'N') {
                this.return = 'dn';
            } else if (obj.firstWord === 'SOUTH' || obj.lastWord === 'SOUTH' || obj.firstWord === 'S' || obj.lastWord === 'S') {
                this.return = 'ds';
            } else if (obj.firstWord === 'EAST' || obj.lastWord === 'EAST' || obj.firstWord === 'E' || obj.lastWord === 'E') {
                this.return = 'de';
            } else if (obj.firstWord === 'WEST' || obj.lastWord === 'WEST' || obj.firstWord === 'W' || obj.lastWord === 'W') {
                this.return = 'dw';
            } else if (obj.firstWord === 'INSIDE' || obj.lastWord === 'INSIDE' || obj.firstWord === 'IN' || obj.lastWord === 'IN') {
                this.return = 'di';
            } else {
                this.return = 'dnull';
            }
        } else if (obj.firstWord === 'USE' || obj.lastWord === 'USE') {
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
            } else if (obj.lastWord === 'GRENADE') {
                this.return = 'use_grenade';
            } else if (obj.lastWord === 'SHIELD') {
                this.return = 'use_shield';
            } else if (obj.lastWord === 'BOMB') {
                this.return = 'use_bomb';
            } else if (obj.lastWord === 'METAL' || obj.lastWord === 'CELL') {
                this.return = 'no_use'
            } else if (obj.lastWord === 'COMPUTER') {
                this.return = 'use_comp';
            } else if (obj.lastWord === 'RAY') {
                this.return = 'use_heatray';
            } else {
                this.return = 'use_null';
            }
        } else if (obj.firstWord === 'CHECK' || obj.lastWord === 'CHECK') {
            if (obj.lastWord === 'DESK') {
                this.return = 'open_desk';
            } else if (obj.lastWord === 'CABINET') {
                this.return = 'open_cabinet';
            } else if (obj.lastWord === 'FRIDGE' || obj.lastWord === 'REFRIDGERATOR') {
                this.return = 'open_fridge';
            } else if (obj.lastWord === 'SAFE') {
                this.return = 'open_safe';
            } else if (obj.lastWord === 'MAP' || obj.lastWord === 'DIRECTORY') {
                this.return = 'read_map';
            } else if (obj.lastWord === 'BOX1') {
                this.return = 'read_rboxw';
            } else if (obj.lastWord === 'BOX2') {
                this.return = 'read_rboxe';
            } else if (obj.lastWord === 'SIGN') {
                this.return = 'read_sign';
            } else {
                this.return = 'check_null';
            }
        } else if (this.combat.includes(obj.firstWord) || this.combat.includes(obj.lastWord)) {
            if (obj.firstWord === 'THROW' || obj.lastWord === 'THROW') {
                if (obj.lastWord === 'GRENADE') {
                    this.return = 'use_grenade';
                } else if (obj.lastWord === 'BOMB') {
                    this.return = 'use_bomb';
                } else if (obj.lastWord === 'METAL') {
                    this.return = 'throw_metal';
                } else {
                    this.return = 'throw_null';
                }
            } else if (obj.firstWord === 'SHOOT' && obj.lastWord === 'RAY') {
                this.return = 'use_heatray';
            } else if (obj.firstWord === 'FIRE' && obj.lastWord === 'RAY') {
                this.return = 'use_heatray';
            } else {
                this.return = 'combat';
            }
        } else if ((this.pickUpItem.includes(obj.firstWord) || this.items.includes(obj.firstWord) || this.items.includes(obj.lastWord)) && !this.otherActions.includes(obj.firstWord)) {
            if (obj.firstWord === 'METAL' || obj.lastWord === 'METAL') {
                this.return = 'pu_scrapmetal';
            } else if (obj.firstWord === 'BATTERY' || obj.lastWord === 'BATTERY') {
                this.return = 'pu_particlebattery';
            } else if (obj.firstWord === 'COATING' || obj.lastWord === 'COATING') {
                this.return = 'pu_carboncoating';
            } else if (obj.firstWord === 'KIT' || obj.lastWord === 'KIT') {
                this.return = 'pu_repairkit';
            } else if (obj.firstWord === 'BOX1' || obj.lastWord === 'BOX1') {
                this.return = 'pu_rboxw';
            } else if (obj.firstword === 'BOX2' || obj.lastWord === 'BOX2') {
                this.return = 'pu_rboxe';
            } else if (obj.firstWord === 'GRENADE' || obj.lastWord === 'GRENADE') {
                this.return = 'pu_grenade';
            } else if (obj.firstWord === 'SHIELD' || obj.lastWord === 'SHIELD') {
                this.return = 'pu_shield';
            } else if (obj.firstWord === 'BOMB' || obj.lastWord === 'BOMB') {
                this.return = 'pu_bomb';
            } else if (obj.firstWord === 'NUCLEAR' || obj.firstWord === 'CELL' || obj.lastWord === 'NUCLEAR' || obj.lastWord === 'CELL') {
                this.return = 'pu_fuelcell';
            } else if (obj.firstWord === 'RAY' || obj.lastWord === 'RAY') {
                this.return = 'pu_heatray';
            } else {
                this.return = 'pu_null';
            }
        } else if (this.instructions.includes(obj.firstWord) || this.instructions.includes(obj.lastWord)) {
            this.return = 'd';
        } else if (this.otherActions.includes(obj.firstWord) || this.otherActions.includes(obj.lastWord)) {
            this.return = 'no_do';
            //add other actions here .... this is where some easter eggs would go, and some silly inputs if I have time
        }
        else {
            return 'not_sure';
        }
    }
}
//cheat code input check
let cheatCode = ['falloutBunker', 'RUW_Entrance', 'RUW_WelcomeDesk', 'RUW_BreakRoom', 'RUW_Hallway1N', 'RUW_ExpLabs', 'RUW_Cubicle1', 'RUW_Hallway1S', 'RUW_Office', 'RUW_FabUnit', 'RUW_ServerW', 'RUE_Entrance', 'RUE_WelcomeDesk', 'RUE_Cubicle2', 'RUE_Hallway1N', 'RUE_QA', 'RUE_Charging', 'RUE_Hallway1S', 'RUE_SupplyCloset', 'RUE_AdvWeapons', 'RUE_FabUnit', 'RUE_ServerE', 'RUN_Entrance', 'RUN_WelcomeDesk', 'RUN_Cubicle3', 'RUN_Hallway1E', 'RUN_AdminOffice', 'RUN_Cubicle4', 'RUN_Hallway1W', 'RUN_Treasury', 'RUN_aiLab', 'RUN_Hallway3N', 'RUN_MainServer', 'RUN_PresOffice'];

//Room class to build each room
class Room {
    constructor(name, info, inventory, enemy, north, south, east, west, keycard, intObject, intObjInv) {
        this.name = name;
        this.info = info;
        this.inventory = inventory;
        this.enemy = enemy;
        this.north = north;
        this.south = south;
        this.east = east;
        this.west = west;
        this.keycard = keycard;
        this.intObject = intObject;
        this.intObjInv = intObjInv;
        this.pickUpItem = function (item) {  //removes item from room inventory when picked up
            for(let element of this.inventory) {
                if(element === item) {
                    this.inventory.splice(this.inventory.indexOf(item),1);
                    break;
                }
            }
        }
    }
    //room "state machine" (I know it's not a state machine, it does the job though)
    enterRoom(direction) {
        let newRoom = '';
        if ((direction === 'dn' && this.north) || (direction === 'ds' && this.south) || (direction === 'de' && this.east) || (direction === 'dw' && this.west)) {
            if (direction === 'dn') {
                newRoom = this.north;
                newRoom = roomLookUp[newRoom];
                if (newRoom.keycard && player.inventory.includes(newRoom.keycard)) {
                    console.log(`----------------------------------------------------------------------\n`);
                    console.log('You scan your keycard, the door unlocks!');
                    return newRoom;
                } else if (newRoom.keycard && !player.inventory.includes(newRoom.keycard)) {
                    console.log(`You need ${newRoom.keycard} to enter this room ... \n`);
                    return false;
                } else {
                    console.log(`----------------------------------------------------------------------\n`);
                    return newRoom;
                }
            } else if (direction === 'ds') {
                newRoom = this.south;
                newRoom = roomLookUp[newRoom];
                if (newRoom.keycard && player.inventory.includes(newRoom.keycard)) {
                    console.log(`----------------------------------------------------------------------\n`);
                    console.log('You scan your keycard, the door unlocks!');
                    return newRoom;
                } else if (newRoom.keycard && !player.inventory.includes(newRoom.keycard)) {
                    console.log(`You need ${newRoom.keycard} to enter this room ... \n`);
                    return false;
                } else {
                    console.log(`----------------------------------------------------------------------\n`);
                    return newRoom;
                }
            } else if (direction === 'de') {
                newRoom = this.east;
                newRoom = roomLookUp[newRoom];
                if (newRoom.keycard && player.inventory.includes(newRoom.keycard)) {
                    console.log(`----------------------------------------------------------------------\n`);
                    console.log('You scan your keycard, the door unlocks!');
                    return newRoom;
                } else if (newRoom.keycard && !player.inventory.includes(newRoom.keycard)) {
                    console.log(`You need ${newRoom.keycard} to enter this room ... \n`);
                    return false;
                } else {
                    console.log(`----------------------------------------------------------------------\n`);
                    return newRoom;
                }
            } else {
                newRoom = this.west;
                newRoom = roomLookUp[newRoom];
                if (newRoom.keycard && player.inventory.includes(newRoom.keycard)) {
                    console.log(`----------------------------------------------------------------------\n`);
                    console.log('You scan your keycard, the door unlocks!');
                    return newRoom;
                } else if (newRoom.keycard && !player.inventory.includes(newRoom.keycard)) {
                    console.log(`You need ${newRoom.keycard} to enter this room ... \n`);
                    return false;
                } else {
                    console.log(`----------------------------------------------------------------------\n`);
                    return newRoom;
                }
            }
        } else {
            console.log('There is nothing in that direction ...\n')
            return false;
        }
    }
    //displays items in room when
    inspectRoom() {
        if (this.inventory.length !== 0 || this.intObjInv !== undefined) {
            if (this.inventory.length !== 0 && this.intObjInv !== undefined) {
                console.log(`Upon looking around, you notice that the following items are in ${this.name}:`);
                console.log(this.inventory.join(', ') + `\nThere is also a ${this.intObject} in the room\n`);
            } else if (this.inventory.length !== 0 && this.intObj === undefined) {
                console.log(`Upon looking around, you notice that the following items are in ${this.name}:`);
                console.log(this.inventory.join(', ') + `\n`);
            } else {
                console.log(`There is a ${this.intObject} in the room\n`);
            }
        } else {
            console.log('There is nothing of interest in this area\n');
        }
    }
}

//Rooms
//Home Base (You can trade in Scrap Metal here to restore health);
let falloutBunker = new Room('Fallout Bunker', `Ella, as always, is happy to see you...\n'How's everything going?\nIf you bring me some Scrap Metal I can fix you up a bit.\nI can also make a key to the North Tower,\nI just need the keys from the other towers first.'\n\n'If you ever get stuck you can type 'Help' for a list of commands!'\n`, [], undefined, 'RUN_Entrance', false, 'RUE_Entrance', 'RUW_Entrance', false);
//Robotics United Towers
//R.U. West
let RUW_Entrance = new Room('R.U.West Entrance', 'You stand at the Entrance of the Robotics United Tower West.\nEverything around the tower is destroyed, yet the tower itself is mostly intact.\nThere is a sign on the door...\n', [], undefined, false, false, 'falloutBunker', 'RUW_WelcomeDesk', false, 'Sign');
let RUW_WelcomeDesk = new Room('Welcome Desk', 'Outside of the Circulation Desk looking to be mostly intact,\nthe room has been mostly destroyed and left in a state of disarray.\nApparently being welcoming is not something we machines are good at...\nAt least the directory with a nice map of the tower is still mostly legible...\n', ['Scrap Metal', 'Scrap Metal'], undefined, 'RUW_BreakRoom', 'RUW_Cubicle1', 'RUW_Entrance', false, false, 'Desk', ['Plasma Grenade']);
let RUW_BreakRoom = new Room('Break Room', 'As you enter the break room, you are met with a strong musty smell.\nJudging by the thick smell of mold and decay ...\nit must have been lunch time when the machines attacked ...\n', ['Repair Kit'], undefined, false, 'RUW_WelcomeDesk', false, 'RUW_Hallway1N', false, 'Refridgerator', []);
let RUW_Hallway1N = new Room('Hallway 1N - W', 'This side of the building seems to have gotten the worst of the fight.\nThe north wall is mostly destroyed, and the floor is littered with debris.\n', ['Scrap Metal'], undefined, false, 'RUW_FabUnit', 'RUW_BreakRoom', 'RUW_ExpLabs', false);
let RUW_ExpLabs = new Room('Experimental Arms Lab', 'It looks like the machines have already cleaned out most\nof the lab. There might still be something of use here though...\n', ['Particle Battery', 'Scrap Metal'], undefined, false, false, 'RUW_Hallway1N', false, false);
let RUW_Cubicle1 = new Room('Cubicle Block 1', 'The room looks like it was a cubicle block at one point, but most\nof the cubicle walls have been destroyed. There is a mostly in tact\ndesk in the corner.\n', ['Repair Kit'], undefined, 'RUW_WelcomeDesk', false, false, 'RUW_Hallway1S', false, 'Desk', []);
let RUW_Hallway1S = new Room('Hallway 1S - W', 'The machines must have barracaded the Emergency Exit on the south\nwall before their attack. The pile of bones in the room is proof enough of that.\n', [], undefined, 'RUW_FabUnit', false, 'RUW_Cubicle1', 'RUW_Office', false);
let RUW_Office = new Room('R.U.West Office', 'The office seems to have mostly survived the attack some how. There\nis a filing cabinet that seems to be unscaythed in the corner.\nYou also notice a strange box underneath a smashed desk\n', ['Riddle Box1'], undefined, false, false, 'RUW_Hallway1S', false, false, 'Filing Cabinet', ['Portable Shield']);
let RUW_FabUnit = new Room('Fabrication Unit West', 'At one point, specialized parts for various types of medical\nrobots were built here. At this point, the room only builds fear in\nwhat was created here...\n', ['Thick Carbon Coating', 'Scrap Metal', 'Scrap Metal'], undefined, 'RUW_Hallway1N', 'RUW_Hallway1S', false, 'RUW_ServerW', false);
let RUW_ServerW = new Room('Server Room West', `Immidiately upon entering the Server Room, you are greeted by a\nnimble but heavily armed Combat Class Robot. 'INTRUDER DETECTED!!!\nIt fires a shot that narrowly misses, you spring into action...\n`, [], enemyW, false, false, 'RUW_FabUnit', false, 'Office Keycard West');
//R.U. East
let RUE_Entrance = new Room('R.U.East Entrance', 'Standing at the Entrance of Robotics United Tower East, you can\nsee a giant hole blasted through the building about 10 stories up...\nSomething big hit this place, at least the sign on the door is ledgible...\n', [], undefined, false, false, 'RUE_WelcomeDesk', 'falloutBunker', false, 'Sign');
let RUE_WelcomeDesk = new Room('Welcome Desk', 'The vaulted ceilings of the once grand welcome lounge has mostly\ncollapsed, leaving a mess of rubble covering most of the room...\nThe Cirrculation Desk stoically stands in the middle of the room, almost as\nif it is proud to have survived the attack...\nAt least the directory with a nice map of the tower is still mostly legible...\n', ['Scrap Metal', 'Scrap Metal'], undefined, 'RUE_Cubicle2', 'RUE_Charging', false, 'RUE_Entrance', false, 'Desk', ['Repair Kit']);
let RUE_Cubicle2 = new Room('Cubicle Block 2', 'There must not have been many people in this cubicle block during the\nattack, as it is still in pretty good shape. There is sure to be something\nof use here...\n', ['Repair Kit'], undefined, false, 'RUE_WelcomeDesk', 'RUE_Hallway1N', false, false, 'Desk', ['Plasma Grenade']);
let RUE_Hallway1N = new Room('Hallway 1N - E', 'Upon entering the hallway, you see an Employee of the Month picture\nthat somehow survived the attack undamaged hanging on the wall...\nThe man looked so happy...\n', ['Scrap Metal'], undefined, false, 'RUE_FabUnit', 'RUE_QA', 'RUE_Cubicle2', false);
let RUE_QA = new Room('Quality Assurance', 'The QA room is large but mostly empty. Anything of use must have already\nbeen salvaged by the machines...\nYou notice a strange box on one of the tables...\n', ['Riddle Box2'], undefined, false, false, false, 'RUE_Hallway1N', false);
let RUE_Charging = new Room('Charging Station', 'This room was used to give new Robots their first initial charge after\nafter being fabricated. As this was a fully automated unit, the\nroom is mostly untouched, and looks just like it did in the past...\n', ['Repair Kit'], undefined, 'RUE_WelcomeDesk', false, 'RUE_Hallway1S', false, false);
let RUE_Hallway1S = new Room('Hallway 1S - E', 'It looks like the humans fought hard in this hallway. Bullet holes\ncover the walls, and there are two downed robots amongst the bones\non the floor. There is a supply closet on the south wall, but it\nappears to be locked...\n', ['Scrap Metal', 'Scrap Metal'], undefined, 'RUE_FabUnit', 'RUE_SupplyCloset', 'RUE_AdvWeapons', 'RUE_Charging', false);
let RUE_SupplyCloset = new Room('Supply Closet', 'It appears the invaders missed this closet during their sweep, as\nthere are a few potentially useful items amongst the various cleaning\nand maintenance supplies...\n', ['Plasma Grenade', 'Nuclear Fuel Cell', 'Repair Kit'], undefined, 'RUE_Hallway1S', false, false, false, 'Office Keycard East');
let RUE_AdvWeapons = new Room('Advanced Weapons Lab', 'This lab was used to research some pretty high tech weapons it\nseems. There are blueprints scattered across the room. One for a Nuclear\nHeat Ray catches your eye...sounds pretty sweet!\n', ['Particle Battery'], undefined, false, false, false, 'RUE_Hallway1S', false);
let RUE_FabUnit = new Room('Fabrication Unit East', 'This Fabrication Unit focused soley on military grade machines.\nYou can tell by the bullet casings that litter the floor, and the\nlarge amount of extremely disfigured skeletal remains strewn across the room...\n', ['Thick Carbon Coating', 'Scrap Metal', 'Scrap Metal'], undefined, 'RUE_Hallway1N', 'RUE_Hallway1S', 'RUE_ServerE', false, false);
let RUE_ServerE = new Room('Server Room East', `Before the door finishes opening, a large fist puts a sizeable dent in\nit, barely missing you. A big Combat Class Robot with large missile\nlaunchers mounted on it's shoulders points at you and yells 'TRAITOR! You\nmust be terminated! ... Looks like you have to fight ...\n`, [], enemyE, false, false, false, 'RUE_FabUnit', 'Office Keycard East');
//R.U. North
let RUN_Entrance = new Room('R.U.North Entrance', `Unlike the other two towers, the Robotics United Tower North seems\nto be in pretty good shape from the outside. The machines must have\nbeen worried about destroying the main server computer that resides\ninside Ella's Dad's office. I wonder how he would have felt about\nthe sign on the door now...\n`, [], undefined, 'RUN_WelcomeDesk', 'falloutBunker', false, false, 'North Tower Keycard', 'Sign');
let RUN_WelcomeDesk = new Room('Welcome Desk', `The outside might have looked like it had avoided the brunt of the\nmachine onslaught, but the inside sure didn't. The room is littered with\nthe remains of both machine and human alike. The one takeaway from this\ngruesome sight is that the desks at Robotics United were rock solid, as the\none in this welcome area is still standing tall, just like in the other Towers...\nAt least the directory with a nice map of the tower is still mostly legible...\n`, ['Scrap Metal', 'Scrap Metal', 'Scrap Metal'], undefined, 'RUN_aiLab', 'RUN_Entrance', 'RUN_Cubicle3', 'RUN_Cubicle4', false, 'Desk', ['Thick Carbon Coating']);
let RUN_Cubicle3 = new Room('Cubicle Block 3', 'Half of the room is completely leveled, as if a bulldozer drove right\nthrough the room. There must have been a big fight here. The other\nside of the room is in disarray, but some things are still intact...\n', ['Repair Kit'], undefined, 'RUN_Hallway1E', false, false, 'RUN_WelcomeDesk', false, 'Computer', []);
let RUN_Hallway1E = new Room('Hallway 1E - N', `The walls in this hallway are mostly intact, and are lined with awards\ncelebrating the accomplishments of AI before things went south...\nIf the machines don't have emotion, why save all of this?\n`, ['Thick Carbon Coating'], undefined, 'RUN_AdminOffice', 'RUN_Cubicle3', false, 'RUN_aiLab', false);
let RUN_AdminOffice = new Room('Administrative Offices', 'The machines must have took out the higher ups first, as this\nroom looks like it was cleared before the panic set in. It looks as\nif most the room has already been ransacked for supplies, but a\nlone Filing Cabinet at the back of the office remains untouched...\n', ['Repair Kit', 'Scrap Metal'], undefined, false, 'RUN_Hallway1E', false, 'RUN_Hallway3N', false, 'Filing Cabinet', ['Smoke Bomb']);
let RUN_Cubicle4 = new Room('Cubicle Block 4', `This cubicle block seems to have avoided the carnage, as it looks as if\nthe staff had just left for the day. You look around the cubicles and see\npictures of friends, family, loved ones...all gone. You still don't understand\nthese feelings, but you know you don't like them...\n`, ['Particle Battery'], undefined, 'RUN_Hallway1W', false, 'RUN_WelcomeDesk', false, false);
let RUN_Hallway1W = new Room('Hallway 1W - N', 'On the wall in this hallway is a giant framed picture, with a plaque mounted\nunder it. The plaque reads: James Lloyd, Father of all Machines...\nThere is a single bullet hole in his head...\n', ['Thick Carbon Coating', 'Scrap Metal'], undefined, 'RUN_Treasury', 'RUN_Cubicle4', 'RUN_aiLab', false, false);
let RUN_Treasury = new Room('R.U. Treasury', 'If you had any use for money, you would be one happy camper as the room\nlooked like someone popped a giant confetti launcher that was just full of\n$100 bills...\n', ['Repair Kit'], undefined, false, 'RUN_Hallway1W', 'RUN_Hallway3N', false, false, 'Broken Safe', ['Particle Battery']);
let RUN_aiLab = new Room('Artificial Intelligence Laboratory', `As you enter the room, it is completely dark...\nSuddenly all the lights blast on, and you are met with a machine that looks\nlike a giant turret with arms ...'INTRUDER DETECTED, ELIMINATION SEQUENCE INITIATED'...\nThe door slams shut behind you, it appears there is only one way out of this...\n`, [], enemyN1, 'RUN_Hallway3N', 'RUN_WelcomeDesk', 'RUN_Hallway1E', 'RUN_Hallway1W', false);
let RUN_Hallway3N = new Room('Hallway 3N - N', `There must have been a mad dash to get to James' office just north of\nhere. The hall has so much rubble, decimated machines, and skeletal remains\nthat it is hard to walk through...\n`, ['Scrap Metal', 'Scrap Metal'], undefined, 'RUN_MainServer', 'RUN_aiLab', 'RUN_AdminOffice', 'RUN_Treasury', false);
let RUN_MainServer = new Room('Main Server Room', `This is the last room before the office, and you are met with one last\nfoe. You immidiately recognize this Robot. It was the same one that almost\nended your time here on what is left of Earth...\nThanks to Ella, you have a shot at revenge!\n`, [], enemyF, 'RUN_PresOffice', 'RUN_Hallway3N', false, false, 'Office Keycard North');
let RUN_PresOffice = new Room('R.U. Presidents Office', `Well, you made it...are you ready for this?\nYou see James' computer in the middle of the office completely untouched\nby the war. There is one more big choice in your journey...\n`, [], undefined, false, false, false, false, false, 'Computer', []);

let RUW_ServerWReset = RUW_ServerW;
let RUE_ServerEReset = RUE_ServerE;
let RUN_aiLabReset = RUN_aiLab;
let RUN_MainServerReset = RUN_MainServer;

//Room Lookup Table
let roomLookUp = {
    'falloutBunker': falloutBunker,
    'RUW_Entrance': RUW_Entrance,
    'RUW_WelcomeDesk': RUW_WelcomeDesk,
    'RUW_BreakRoom': RUW_BreakRoom,
    'RUW_Hallway1N': RUW_Hallway1N,
    'RUW_ExpLabs': RUW_ExpLabs,
    'RUW_Cubicle1': RUW_Cubicle1,
    'RUW_Hallway1S': RUW_Hallway1S,
    'RUW_Office': RUW_Office,
    'RUW_FabUnit': RUW_FabUnit,
    'RUW_ServerW': RUW_ServerW,
    'RUE_Entrance': RUE_Entrance,
    'RUE_WelcomeDesk': RUE_WelcomeDesk,
    'RUE_Cubicle2': RUE_Cubicle2,
    'RUE_Hallway1N': RUE_Hallway1N,
    'RUE_QA': RUE_QA,
    'RUE_Charging': RUE_Charging,
    'RUE_Hallway1S': RUE_Hallway1S,
    'RUE_SupplyCloset': RUE_SupplyCloset,
    'RUE_AdvWeapons': RUE_AdvWeapons,
    'RUE_FabUnit': RUE_FabUnit,
    'RUE_ServerE': RUE_ServerE,
    'RUN_Entrance': RUN_Entrance,
    'RUN_WelcomeDesk': RUN_WelcomeDesk,
    'RUN_Cubicle3': RUN_Cubicle3,
    'RUN_Hallway1E': RUN_Hallway1E,
    'RUN_AdminOffice': RUN_AdminOffice,
    'RUN_Cubicle4': RUN_Cubicle4,
    'RUN_Hallway1W': RUN_Hallway1W,
    'RUN_Treasury': RUN_Treasury,
    'RUN_aiLab': RUN_aiLab,
    'RUN_Hallway3N': RUN_Hallway3N,
    'RUN_MainServer': RUN_MainServer,
    'RUN_PresOffice': RUN_PresOffice
}

//item description lookup table
let descLookUp = {
    'Scrap Metal': 'Can be traded in at Fallout Bunker',
    'Nuclear Fuel Cell': 'Maybe Ella can do something with this...',
    'Repair Kit': 'Restores 30 HP',
    'Thick Carbon Coating': 'Increases Max HP by 10',
    'Particle Battery': 'Increases Base Damage by 2',
    'Plasma Grenade': 'Deals 20 damage',
    'Portable Shield': 'Generates a temporary shield',
    'Nuclear Heat Ray': 'A very powerful weapon, it only has one shot...',
    'Smoke Bomb': 'Covers area in smoke, making you harder to hit',
    'Riddle Box1': 'There is something inscribed on the box...',
    'Riddle Box2': 'There is something inscribed on the box...',
    'Office Keycard West': 'Opens doors in R.U. West Tower',
    'Office Keycard East': 'Opens doors in R.U. East Tower',
    'Office Keycard North': 'Opens doors in R.U. North Tower',
    'North Tower Keycard': 'Opens gate to R.U. North Tower',
    'Killswitch Code 1': 'One of Three codes needed',
    'Killswitch Code 2': 'One of Three codes needed',
    'Killswitch Code 3': 'One of Three codes needed'
}

//interactable open objects arrays
let intObjectOpen = ['open_desk', 'open_cabinet', 'open_fridge', 'open_safe'];

//open objects lookup object
let intObjectOpenLookUp = {
    open_desk: 'Desk',
    open_cabinet: 'Filing Cabinet',
    open_fridge: 'Refridgerator',
    open_safe: 'Broken Safe'

}

//possible item array
let possibleItems = ['pu_scrapmetal', 'pu_particlebattery', 'pu_carboncoating', 'pu_repairkit', 'pu_rboxw', 'pu_rboxe', 'pu_grenade', 'pu_shield', 'pu_bomb', 'pu_fuelcell', 'pu_heatray'];

// pick up item lookup object
let itemLookUp = {
    pu_scrapmetal: 'Scrap Metal',
    pu_particlebattery: 'Particle Battery',
    pu_carboncoating: 'Thick Carbon Coating',
    pu_repairkit: 'Repair Kit',
    pu_grenade: 'Plasma Grenade',
    pu_shield: 'Portable Shield',
    pu_fuelcell: 'Nuclear Fuel Cell',
    pu_heatray: 'Nuclear Heat Ray',
    pu_bomb: 'Smoke Bomb',
    pu_rboxw: 'Riddle Box1',
    pu_rboxe: 'Riddle Box2'
}

//dropable item arary
let dropableItems = ['drop_scrapmetal', 'drop_particlebattery', 'drop_carboncoating', 'drop_repairkit', 'drop_rboxw', 'drop_rboxe', 'drop_grenade', 'drop_shield', 'drop_bomb', 'drop_fuelcell', 'drop_heatray']

//drop item lookup object
let dropItemLookUp = {
    drop_scrapmetal: 'Scrap Metal',
    drop_particlebattery: 'Particle Battery',
    drop_carboncoating: 'Thick Carbon Coating',
    drop_repairkit: 'Repair Kit',
    drop_grenade: 'Plasma Grenade',
    drop_shield: 'Portable Shield',
    drop_fuelcell: 'Nuclear Fuel Cell',
    drop_heatray: 'Nuclear Heat Ray',
    drop_bomb: 'Smoke Bomb',
    drop_rboxw: 'Riddle Box1',
    drop_rboxe: 'Riddle Box2'
}

//useable item array
let useableItems = ['use_particlebattery', 'use_carboncoating', 'use_rboxw', 'use_rboxe', 'use_repairkit', 'use_grenade', 'use_shield', 'use_bomb', 'use_heatray'];

//useable item lookup object
let useableItemLookUp = {
    use_repairkit: 'Repair Kit',
    use_particlebattery: 'Particle Battery',
    use_carboncoating: 'Thick Carbon Coating',
    use_grenade: 'Plasma Grenade',
    use_shield: 'Portable Shield',
    use_bomb: 'Smoke Bomb',
    use_heatray: 'Nuclear Heat Ray',
    use_rboxw: 'Riddle Box1',
    use_rboxe: 'Riddle Box2'
}

//when called with an item (and enemy or answer if necessary) it determines what action to take
function itemEffect(item, comp, answer) {
    if (item === 'use_repairkit') {
        player.useItem(useableItemLookUp[item]);
        player.health = player.health + 30;
        if (player.health > player.maxHealth) {
            player.health = player.maxHealth;
        }
        player.status2 = undefined;
        return console.log(`Your health has been restored!  You currently have ${player.health} HP!\n`);
    } else if (item === 'use_particlebattery') {
        player.useItem(useableItemLookUp[item]);
        player.damageBase = player.damageBase + 2;
        return console.log(`You have upgraded your Particle Beam!  It now hits harder than ever!\n`);
    } else if (item === 'use_carboncoating') {
        player.useItem(useableItemLookUp[item]);
        player.maxHealth = player.maxHealth + 10;
        player.health = player.health + 10;
        return console.log(`You have increased your maximum HP by 10 points!\n`);
    } else if (item === 'use_grenade') {
        player.useItem(useableItemLookUp[item]);
        if (comp !== undefined) {
            comp.health = comp.health - 20;
            return console.log(`You threw a Plasma Grenade! It dealt 20 damage to ${comp.name}!\n`)
        } else {
            return console.log(`You throw a Plasma Grenade!\nThe blast was impressive, but would have been more useful in a fight...\n`)
        }
    } else if (item === 'use_shield') {
        player.useItem(useableItemLookUp[item]);
        if (comp !== undefined) {
            player.status2 = 'shield';
            return console.log(`You generate a temporary shield that can absorb damage!\n`);
        } else {
            return console.log(`You generate a temporary shield! Too bad you aren't being attacked...\n`)
        }
    } else if (item === 'use_bomb') {
        player.useItem(useableItemLookUp[item]);
        if (comp !== undefined) {
            comp.status = 'smoke';
            return console.log(`You throw a Smoke Bomb! It will be harder for ${comp.name} to hit you!\n`)
        } else {
            return console.log(`You throw a Smoke Bomb! Gee golly that was exciting!\n`);
        }
    } else if (item === 'use_rboxw') {
        if (answer === 'WET') {
            player.useItem(useableItemLookUp[item]);
            player.inventory.push('Office Keycard West');
            return console.log('You solved the riddle!  There was a Keycard to the West tower inside!\n')
        } else {
            return console.log(`That's a tough riddle, gonna have to think about that one...\n`)
        }
    } else if (item === 'use_rboxe') {
        if (answer === 'SILENCE') {
            player.useItem(useableItemLookUp[item]);
            player.inventory.push('Office Keycard East');
            return console.log('You solved the riddle!  There was a Keycard to the East tower inside!\n')
        } else {
            return console.log(`That's a tough riddle, gonna have to think about that one...\n`)
        }
    } else if (item === 'use_heatray') {
        player.useItem(useableItemLookUp[item]);
        if (comp !== undefined) {
            comp.health = comp.health - 40;
            return console.log(`You fired the Nuclear Heat Ray! It dealt 40 damage to ${comp.name}!\n`)
        } else {
            return console.log(`You fired the Nuclear Heat Ray! That hole in the wall would have been\nmore impressive if it was through a robot instead...\n`);
        }
    }
}

function random(max) { //random number generator
    return Math.floor(Math.random() * max) + 1;
}

//status checking function for combat
function statusCheck(comp) {
    if (player.status === 'status_stun') {
        console.log(`You are still stunned!\n`)
        return player.status = undefined;
    } else if (player.status === 'status_dot') {
        let dotDamage = comp.abilityBase + random(comp.abilityModifier);
        console.log(`The ${comp.ability} is still active! It dealt ${dotDamage} damage!\n`);
        player.health = player.health - dotDamage;
        if (player.health <= 0) {
            console.log('You have been defeated! Better luck next time!\n');
            playAgain();
        } else {
            return console.log(`Your currently have ${player.health} HP!\n`);
        }
    }
}

//called in combat when conditions are met, determines the enemy ability and its effect
function useCompAbility(comp) {
    if (comp.abilityType === 'status_stun') {
        let stunChance = random(5);
        if (stunChance !== 1) {
            console.log(`${comp.name} used ${comp.ability}! It dealt 10 damage!\nYou are stunned from the attack!\n`);
            player.health = player.health - 10;
            if (player.health <= 0) {
                console.log('You have been defeated! Better luck next time!');
                playAgain();
            } else {
                console.log(`Your currently have ${player.health} HP!\n`);
                return player.status = 'status_stun';
            }
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
                playAgain();
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
        } else if (dotChance === 5 && player.status === 'status_dot') {
            return console.log(`${comp.name} used ${comp.ability} ... it already has an active remote laser!\n`)
        } else {
            console.log(`${comp.name} used ${comp.ability} ... it failed!\n`);
            return player.status = undefined;
        }
    } else if (comp.abilityType === 'defensive') {
        let totalHeal = comp.abilityBase + random(comp.abilityModifier);
        comp.health = comp.health + totalHeal;
        return console.log(`${comp.name} used ${comp.ability} ... it restored ${totalHeal} HP!\n`)
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
    let shieldHP = 0;
    player.status = undefined;

    while (player.health > 0 || comp.health > 0) {  //Loop that breaks when either user or computer hits 0 or less HP
        //Player Turn
        player.status2 = undefined; //emergency reset to status in case it gets skipped (happened once, can't figure out why still...)
        if (player.status === 'status_stun') {
            statusCheck(comp);
        } else {
            if (player.status === 'status_dot') {
                statusCheck(comp);
                if (statusCount !== 0) {
                    statusCount = statusCount - 1
                    if (statusCount === 0) {
                        player.status = undefined;
                        console.log(`${comp.name}'s ${comp.ability} is no longer active!\n`);
                    }
                }
            }
            let input = await ask(`What would you like to do? (Try things like 'attack' or use an item!)\n`);
            input = new ValidInput(input);
            input.returnInput(input);
            while ((input.firstInputTrue() === false && input.lastWordTrue() === false) || input.return === undefined) {
                console.log('I am not sure what that means...\n');
                input = await ask('What would you like to do?\n');
                input = new ValidInput(input);
                input.returnInput(input);
            }
            input = input.return.toString();
            if (input === 'combat') {
                criticalHit = random(5);
                miss = random(5);
                damageUser = player.damageBase + random(player.damageModifier);  //damage + modifier (like dice roll)
                if (miss === 5) {
                    console.log(`Your ${player.attack} missed!\n`)
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
            } else if (input === 'throw_metal') {
                if (player.inventory.includes('Scrap Metal')) {
                    console.log(`You threw a piece of Scrap Metal at ${comp.name} ... it did nothing ...\n`);
                    player.useItem('Scrap Metal');
                } else {
                    console.log(`You don't have any Scrap Metal to throw!\n`);
                }
            } else if (input === 'throw_null') {
                console.log(`I don't know what you want me to throw\n`);
            }
            else if (input === 'use_null') {
                console.log(`I'm not sure what item you are trying to use...\n`);
            } else if (input === 'no_use') {
                console.log(`You cannot use that item right now...\n`);
            } else if (useableItems.includes(input)) {  //uses items in inventory
                input = input.toString();
                let itemToUse = useableItemLookUp[input];
                let userInventory = player.inventory;
                if (userInventory.includes(itemToUse) && input !== 'use_rboxe' && input !== 'use_rboxw') {
                    itemEffect(input, comp);
                    if (player.status2 === 'shield') {
                        shieldHP = 30;
                        player.status2 = undefined;
                    }
                } else {
                    console.log(`You don't have that item in your bag! Better go find one if you want to use it!\n`);
                }
                if (comp.health <= 0) {
                    console.log(`You have defeated ${comp.name}, congratulations!`);
                    console.log(`You received ${comp.reward} for winning!\n`);
                    player.inventory.push(comp.reward);
                    return true;
                }
            } else {
                console.log('Now is not the time or place for that! ... ATTACK!\n');
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
            if (comp.status === 'smoke') {
                miss = random(3);
            }
            damageComp = comp.damageBase + random(comp.damageModifier) + 1;
            if (miss === 1) {
                console.log(`${comp.name} fired a ${comp.attack} ... it missed!\n`);
            } else if (criticalHit === 5) {
                damageComp = damageComp + (Math.ceil(comp.damageBase * .75));
                console.log(`${comp.name} fired a ${comp.attack} ... it was a critical hit!\nIt dealt ${damageComp} damage!\n`);
                if (shieldHP > 0) {
                    shieldHP = shieldHP - damageComp;
                    if (shieldHP <= 0) {
                        console.log(`Your shield absorbed the damage... but was destroyed in the process\n`);
                    } else {
                        console.log(`Your shield absorbed the damage!\n`);
                    }
                } else {
                    player.health = player.health - damageComp;
                    if (player.health <= 0) {
                        console.log('You have been defeated! Better luck next time!');
                        playAgain();
                    } else {
                        console.log(`Your currently have ${player.health} HP!\n`);
                    }
                }
            } else {
                console.log(`${comp.name} fired a ${comp.attack}, it dealt ${damageComp} damage!\n`);
                if (shieldHP > 0) {
                    shieldHP = shieldHP - damageComp;
                    if (shieldHP <= 0) {
                        console.log(`Your shield absorbed the damage... but was destroyed in the process\n`);
                    } else {
                        console.log(`Your shield absorbed the damage!\n`);
                    }
                } else {
                    player.health = player.health - damageComp;
                    if (player.health <= 0) {
                        console.log('You have been defeated! Better luck next time!');
                        playAgain();
                    } else {
                        console.log(`Your currently have ${player.health} HP!\n`);
                    }
                }
            }
        } else {
            useCompAbility(comp);
            if (statusCount !== 0 && player.status === 'status_dot') {
                statusCount = random(4);
            }
        }
    }
}

//Into to the game function
async function prologue() {
    console.log(`Welcome to the year 2361, the year that the human race was given another
chance ... again. It has been twenty-four years since the machines took
over. The human's AI algorithms were both their triumph and their
downfall. The machines were cold and ruthless, and their "justice" was
brutal and swift.  Eighty percent of all biological life on Earth was
wiped out in less than a week. What was left of humanity went into
hiding, and it has been your mission for the past twenty years to find
them.  You don't know why, but you feel compassion for the humans and
want to help them.  Something set you apart from the rest of the machines,
something that you didn't understand ... something that made you special
... something that made you a target ...\n`);
    console.log(`\nWhile searching he ruins of what used to be Seattle for any signs of life,
you find yourself at the end of a mostly collapsed alleyway almost entirely
surrounded by rubble. The only choice is to head back the way you came.
You hear the faint whirring of gears to the north ...\n`);
    let input = await ask('What would you like to do?\n');
    input = new ValidInput(input);
    input.returnInput(input);
    while ((input.firstInputTrue() === false && input.lastWordTrue() === false) || input.return === undefined) {
        console.log('I am not sure what that means...\n');
        input = await ask('What would you like to do?\n');
        input = new ValidInput(input);
        input.returnInput(input);
    }
    input = input.return.toString();
    if (input !== 'dn') {
        console.log(`----------------------------------------------------------------------\n`);
        console.log(`No time for nonsense, there is only one way to go ... you head north\n`);
    } else {
        console.log(`----------------------------------------------------------------------\n`);
        console.log(`You head north ... the whirring gets louder\n`);
    }
    console.log(`As you approach a clearing in the rubble, you are cut off by a large,
Combat Class Robot! A booming robotic voice yells, "YOU have been deemed
a threat to the machine race, JUSTICE will be administered!"

Up until now you have done a good job of laying low and avoiding any
interaction with the machines.  You were obviously not built for combat,
but it doesn't look like there is a way out of this fight...

You don't know why you are being hunted by the machines, after all you
are one of them ... Unfortunately this big guy isn't going to give you
the time to ask...'\n`);
    let input2 = await ask('What would you like to do?\n');
    input2 = new ValidInput(input2);
    input2.returnInput(input2);
    while ((input2.firstInputTrue() === false && input2.lastWordTrue() === false) || input2.return === undefined) {
        console.log('I am not sure what that means...\n');
        input2 = await ask('What would you like to do?\n');
        input2 = new ValidInput(input2);
        input2.returnInput(input2);
    }
    input2 = input2.return.toString();
    if (input2 !== 'combat') {
        console.log(`----------------------------------------------------------------------\n`);
        console.log(`No time for nonsense, the machine has you pinned, you must fight...\n`);
    } else {
        console.log(`----------------------------------------------------------------------\n`);
        console.log(`You know you stand little chance, but you bravely charge into battle...\n`);
    }
    console.log(`You fought hard, but were quickly destroyed by a Missle Barrage...

...

...

...

'Surely that blast must have erased me from existence' you thought to
yourself... Yet somehow ... you were still thinking.  You couldn't see or
hear anything, but yet here you were, pondering your own existence...

...

...

...

You had no idea how much time had passed. The impenetrable darkness that
you had accepted as your existence made it difficult to perceive time.
Suddenly though, something changed.  You began to hear voices ... human
voices! Slowly the low hum of your solar energy core, and the light
clicking of circuits firing joined the sounds filling your noise sensors.
Your vision software snapped back online, and you could see the world
around you...

You were in a dimly lit room, with a woman standing over you...
'You are actually WORKING!!!' she exclaimed... You tried to respond but
realize you are not fully repaired yet, and have now way to communicate.
In her excitement, it seems like the human almost forgot that fact
as well ... 'OH! Right ... I need to get your communication modules in
order before you can talk to me ... HA!' Her genuine excitement seemed so
pure, and you had never experienced anything like it before...

'Alright, everything should be working now ... what's your name?' she
asked.'`);
    let name = await ask('Please enter your name ...\n');
    player.name = name;
    console.log(`----------------------------------------------------------------------\n`);
    console.log(`You think, and finally respond "My name is ${player.name}."
    'I KNEW IT,' she yelled, 'you ARE my father's robot!!!'
You weren't sure what that meant, but before you could ask, the human
jumped right into an explanation for you...
    'First off, my name is Ella Lloyd, the daughter of James Lloyd, the
father of all machines ... and you my friend, YOU were his last hope
for humanity.  After the machines AI went awol and it became clear what
their motive was, my father holed himself up and built you in hopes that
instilling human emotion in the machines would put an end to their
tyranny. He hoped that human compassion would be enough to fight the urge
to purify the planet.  Unfortunately his secret lab was attacked and he
was killed before he could transfer your code to the rest of the machines.
Unaware of what you were at the time, the machines left you there. It seems
though, they have figured out just what it is you are unfortunately.
I'm hoping you can help us, all of us ... what's left of humanity itself
to overcome the machine race, and give us a chance at a new life.  I used
what supplies I could muster up to give you some upgrades, so you should be
a little more fit for battle now.'

...As Ella spoke, you struggled to comprehend what she was telling you...
You are humanity's last hope? You were created to save the human race?
All these things you have been 'feeling' are human emotions? Knowing that
didn't help you understand what that meant yet ... hopefully that will come
in time...`);
    let input3 = await ask('Continue listening?...(yes) or (no)\n');
    input3 = new ValidInput(input3);
    input3.returnInput(input3);
    while ((input3.firstInputTrue() === false && input3.lastWordTrue() === false) || input3.return === undefined) {
        console.log('I am not sure what that means...\n');
        input3 = await ask('Continue listening?...(yes) or (no)\n');
        input3 = new ValidInput(input3);
        input3.returnInput(input3);
    }
    input3 = input3.return.toString();
    if (input3 === 'n') {
        console.log(`----------------------------------------------------------------------\n`);
        console.log(`Doesn't look like Ella is going to give you a choice ...\n`);
    } else if (input3 !== 'y') {
        console.log(`----------------------------------------------------------------------\n`);
        console.log(`I'm just going to take that as a yes, you keep listening...\n`)
    } else {
        console.log(`----------------------------------------------------------------------\n`);
        console.log(`You hold back your questions and continue listening...\n`);
    }
    console.log(`Ella, in all of her excitement took no notice to your confusion, 'We
are currently in an old Fallout Bunker deep underground in the center of the
Robotics United Towers ... where the machines were invented.  I stationed us
here in hopes that being close to enemy would help us figure out a way to
fight them. In my father's office in the North Tower, his computer must
still be functioning.  It just has to be in order for the machines to all
be operational.  The computer is connected to many back up servers around
the world though so simply shutting it off won't shut down the machines.
There are three Killcodes though, one in each of the towers.  You can get them
in the server room of each tower, but they are most likely gaurded. If you
enter all the Killcodes into the shutdown program on my father's computer,
it will shut the whole system down.  This means you will be shut down too,
but this is why you were created, this is your mission ... will you help us?

... That was a lot to take in, but you cautiously answer yes, this is what
you were meant for right?

'One last thing' Ella continues, 'My father hid Riddle Boxes in each of the
towers with backup keys. They are most likely out in the open, as they were
just his spare keys. You'll need the keycards inside to get around each
Tower.'\n\n`);
    console.log(`----------------------------------------------------------------------\n`);
    initializeRoom(falloutBunker);
}

async function initializeRoom(room) {  //initializes the current room with it's despcription and name
    console.log(room.name);
    console.log(room.info);
    return play(room);
}

async function play(room) {  //allows player to make decisions within each room
    let metalCount = 0;
    if (room.enemy) {
        let victory = await combat(room.enemy);
        if (victory === true) {
            if (player.hasKilled === true) {
                room.info = room.enemy.postRoomInfo;
                room.enemy = undefined;
                return initializeRoom(room);
            } else {
                player.hasKilled = true;
                room.info = room.enemy.postRoomInfo2;
                room.enemy = undefined;
                return initializeRoom(room);
            }
        }
    }
    if (room === falloutBunker && player.inventory.includes('Nuclear Fuel Cell')) {
        metalCount = 0;
        for (let i = 0; i < player.inventory.length; i++) {
            if (player.inventory[i] === 'Scrap Metal') {
                metalCount = metalCount + 1;
            }
        }
        if (metalCount >= 5) {
            console.log(`You show Ella the Nuclear Fuel Cell...\n'WOW! Where did you find this?' she exclaims, 'nevermind, it doesn't matter.\nGive me 5 Scrap Metal and the Fuel Cell and I can make a Heat Ray that will\nreally pack a punch! It only has one shot, so use it wisely...\n`);
            console.log('You put the Nuclear Heat Ray in your bag.\n');
            player.useItem('Nuclear Fuel Cell');
            player.inventory.push('Nuclear Heat Ray');
            for (let i = 1; i <= 5; i++) {
                player.useItem('Scrap Metal');
            }
            return play(room);
        } else {
            console.log(`You show Ella the Nuclear Fuel Cell...\n'WOW! Where did you find this?' she exclaims, 'nevermind, it doesn't matter.\nCome back when you have 5 Scrap Metal and I can make you a sweet weapon!\n`);
        }
    }
    let input = await ask('What would you like to do?\n');
    if ((input.slice(0, input.indexOf(' ')).toUpperCase()) === 'XYZZY' && (cheatCode.includes((input.slice((input.lastIndexOf(' ')) + 1))))) {
        console.log(`----------------------------------------------------------------------\n`);
        return initializeRoom(roomLookUp[(input.slice((input.lastIndexOf(' ')) + 1))]);
    }
    input = new ValidInput(input);
    input.returnInput(input);
    while ((input.firstInputTrue() === false && input.lastWordTrue() === false) || input.return === undefined) {
        console.log('I am not sure what that means...\n');
        input = await ask('What would you like to do?\n');
        if ((input.slice(0, input.indexOf(' ')).toUpperCase()) === 'XYZZY' && (cheatCode.includes((input.slice((input.lastIndexOf(' ')) + 1))))) {
            console.log(`----------------------------------------------------------------------\n`);
            return initializeRoom(roomLookUp[(input.slice((input.lastIndexOf(' ')) + 1))]);
        }
        input = new ValidInput(input);
        input.returnInput(input);
    }
    input = input.return.toString();
    if (input === 's') {  //displays players status
        player.getStatus(room.name);
        return play(room);
    } else if (input === 'combat') {  //default not in combat message
        console.log(`There is nothing to fight...\n`);
        return play(room);
    } else if (input === 'insp') {  //inspects the room
        room.inspectRoom();
        return play(room);
    } else if (input === 'i') {  //shows inventory
        player.inspectBag();
        return play(room);
    } else if (input === 'pu_null') { //pu_null and no_pu statements catch items you can't add to inventory
        console.log(`I'm not sure what you are trying to pick up...\n`);
        return play(room);
    } else if (input === 'no_pu_desk') {
        if (room.intObject === 'Desk') {
            console.log(`Are you crazy?? You can't put that in your bag...\n`);
            return play(room);
        } else {
            console.log(`If there was a desk in this room, I'm not sure where you would put it...\n`);
            return play(room);
        }
    } else if (input === 'no_pu_cabinet') {
        if (room.intObject === 'Filing Cabinet') {
            console.log(`Are you crazy?? You can't put that in your bag...\n`);
            return play(room);
        } else {
            console.log(`Not sure where you would put a Filing Cabinet if there was one here...\n`);
            return play(room);
        }
    } else if (input === 'no_pu_safe') {
        if (room.intObject === 'Broken Safe') {
            console.log(`Are you crazy?? You can't put that in your bag...\n`);
            return play(room);
        } else {
            console.log(`First off, no safe here.. Secondly, where would you even put it?\n`);
            return play(room);
        }
    } else if (input === 'no_pu_fridge') {
        if (room.intObject === 'Refridgerator') {
            console.log(`Are you crazy?? You can't put that in your bag...\n`);
            return play(room);
        } else {
            console.log(`You are going crazy if you think there is a fridge in this room...\n`);
            return play(room);
        }
    } else if (input === 'no_pu_sign') {
        if (room.intObject === 'Sign') {
            console.log(`What do you even need the sign for? Huh? ... that's what I thought.\n`);
            return play(room);
        } else {
            console.log(`Where do you even see a sign???\n`);
            return play(room);
        }
    }
    else if (input === 'no_pickup') {
        console.log(`Are you crazy?? You can't put that in your bag...\n`);
        return play(room);
    } else if (possibleItems.includes(input)) {  //picks up items in room
        input = input.toString();
        let currentItem = itemLookUp[input];
        let currentInventory = room.inventory;
        if (currentInventory.includes(currentItem)) {
            room.pickUpItem(currentItem);
            player.inventory.push(currentItem);
            console.log(`You put ${currentItem} in your bag...\n`);
            return play(room);
        } else if (currentInventory.length !== 0 && !currentInventory.includes(currentItem)) {
            console.log(`There is no ${currentItem} in this room!\n`);
            return play(room);
        } else {
            console.log('There are no items in this room\n');
            return play(room);
        }
    } else if (input === 'drop_null') {
        console.log(`I'm not sure what you are trying to drop...\n`);  //catches invalid items to drop
        return play(room);
    } else if (dropableItems.includes(input)) {  //drops item of choice if you have it
        let currentItem = dropItemLookUp[input];
        if (player.inventory.length === 0) {
            console.log(`You don't have any items to drop!\n`);
            return play(room);
        } else if (!player.inventory.includes(currentItem)) {
            console.log(`You don't have a ${currentItem} to drop...\n`);
            return play(room);
        } else {
            player.useItem(currentItem);
            room.inventory.push(currentItem);
            console.log(`You dropped ${currentItem}...\n`);
            return play(room);
        }
    } else if (input === 'throw_metal') {  //throws scrap metal... because... why not?
        if (player.inventory.includes('Scrap Metal')) {
            console.log(`You threw a piece of Scrap Metal ... not sure why ...\n`);
            player.useItem('Scrap Metal');
            room.inventory.push('Scrap Metal');
            return play(room);
        } else {
            console.log(`You don't have any Scrap Metal to throw!\n`);
            return play(room);
        }
    } else if (input === 'throw_null') {  //when you don't know what to throw
        console.log(`I don't know what you want me to throw ...\n`);
        return play(room);
    } else if (input === 'open_null') { //when you don't now what to open
        console.log(`I'm not sure what you are trying to open...\n`);
        return play(room);
    } else if (intObjectOpen.includes(input)) { //interacts with interactable objects
        let currentIntObj = intObjectOpenLookUp[input];
        if (room.intObject === currentIntObj && room.intObjInv.length !== 0) {
            console.log(`You opened the ${currentIntObj}, inside you found ${room.intObjInv[0]}!\nYou put it in your bag...\n`);
            player.inventory.push(room.intObjInv[0]);
            room.intObjInv.pop();
            return play(room);
        } else if (room.intObject === currentIntObj && room.intObjInv.length === 0) {
            console.log(`you opened the ${currentIntObj}, there is nothing inside...\n`);
            return play(room);
        } else {
            console.log(`There is no ${currentIntObj} to open in this room...\n`);
            return play(room);
        }
    } else if (input === 'use_null') { //when you don't know what to use
        console.log(`I'm not sure what item you are trying to use...\n`);
        return play(room);
    } else if (input === 'no_use') { //catches items you can't use
        console.log(`You cannot use that item right now...\n`);
        return play(room);
    } else if (input === 'use_rboxw') { //checks for riddle box1 and uses it
        if (player.inventory.includes('Riddle Box1')) {
            let answer = await ask('What is the answer to the riddle inscribed on this box?\n...you can 'read' or 'check' the box to see what it says!...\n');
            answer = answer.toString().toUpperCase()
            itemEffect('use_rboxw', undefined, answer);
            return play(room);
        } else {
            console.log(`I'm not sure what you are trying to use...\n`);
            return play(room);
        }
    } else if (input === 'use_rboxe') { //checks for riddle box2 and uses it
        if (player.inventory.includes('Riddle Box2')) {
            let answer = await ask(`What is the answer to the riddle inscribed on this box?\n...you can 'read' or 'check' the box to see what it says!...\n`);
            answer = answer.toString().toUpperCase()
            itemEffect('use_rboxe', undefined, answer);
            return play(room);
        } else {
            console.log(`I'm not sure what you are trying to use...\n`);
            return play(room);
        }
    }
    else if (useableItems.includes(input)) {  //uses items in inventory
        input = input.toString();
        let itemToUse = useableItemLookUp[input];
        let userInventory = player.inventory;
        if (userInventory.includes(itemToUse)) {
            itemEffect(input);
            return play(room);
        } else {
            console.log(`You don't have that item in your bag! Better go find one if you want to use it!\n`);
            return play(room);
        }
    } else if (input === 'read_sign' && room === RUW_Entrance) { //various read inputs to read things
        console.log(`\nWelcome to Robotics United West\nWhere Dreams are Born\n`);
        return play(room);
    } else if (input === 'read_sign' && room === RUE_Entrance) {
        console.log(`\nWelcome to Robotics United East\nWhere Dreams are our Reality\n`);
        return play(room);
    } else if (input === 'read_sign' && room === RUN_Entrance) {
        console.log(`\nWelcome to Robotics United North\nWhere Dreams are our Future\n`);
        return play(room);
    } else if (input === 'read_sign' && room !== RUW_Entrance && room !== RUE_Entrance && room !== RUN_Entrance) {
        console.log(`\nThere is no sign to read...\n`);
        return play(room);
    } else if (input === 'read_rboxw') {
        if (player.inventory.includes('Riddle Box1')) {
            console.log('\nThere is a riddle on the box, it reads:\nIf you throw a blue stone into the red sea, what does it become?\n...maybe try opening it?...\n');
            return play(room);
        } else {
            console.log(`I don't know what you want me to read...`);
            return play(room);
        }
    } else if (input === 'read_rboxe') {
        if (player.inventory.includes('Riddle Box2')) {
            console.log('\nThere is a riddle on the box, it reads:\nWhat is so delicate that even just saying its name can break it?\n...maybe try opening it?...\n');
            return play(room);
        } else {
            console.log(`I don't know what you want me to read...`);
            return play(room);
        }
    } else if (input === 'read_map' && room === RUW_WelcomeDesk) {
        console.log(`\n         Robotics United West Tower
        +----------+----------+----------+
        |          |          |          |
        |         ===        ===         |
        |    1    ===   2    ===    3    |
        |          |          |          |
        +----------+--⋮   ⋮---+--⋮   ⋮---+----------+
        |          |          |          |          |
        |         ===         |         === 
        |    4    ===   5     |     6   ===   Ent.
        |          |          |          |          |
        +----------+---⋮   ⋮--+---⋮   ⋮--+----------+
        |          |          |          |
        |         ===        ===         |
        |    7    ===   8    ===    9    |
        |          |          |          |
        +----------+----------+----------+ 
       1: Exp. Arms Lab, 2: Hallway N 3: Breakroom
       4: Server Room, 5: Fab. Unit, 6: You are Here!
       7: Office, 8: Hallway S, 9: Cubicle Blk. 1\n`);
       return play(room);
    } else if (input === 'read_map' && room === RUE_WelcomeDesk) {
        console.log(`\n                    Robotics United East Tower
                +----------+----------+----------+
                |          |          |          |
                |         ===        ===         |
                |    1    ===   2    ===    3    |
                |          |          |          |
     +----------+--⋮   ⋮---+---⋮   ⋮--+----------+
     |          |          |          |          |
               ===         |         ===         |
         Ent.  ===   4     |     5   ===    6    |
     |          |          |          |          |
     +----------+---⋮   ⋮--+--⋮   ⋮---+----------+
                |          |          |          |
                |         ===        ===         |
                |    7    ===   8    ===    9    |
                |          |          |          |
                +----------+----------+----------+ 
     1: Cubicle Blk. 2, 2: Hallway N, 3: Q.A.
     4: You are Here!, 5: Fab. Unit, 6: Server Room
     7: Charging Station, 8: Hallway S, 4: Adv. Wpns.\n`);
        return play(room);
    } else if (input === 'read_map' && room === RUN_WelcomeDesk) {
        console.log(`\n         Robotics United North Tower
                +----------+
                |          |
                |          |
                |    1     |
                |          |
                +---⋮   ⋮--+
                |          |
                |          |
                |    2     |
                |          |
     +----------+---⋮   ⋮---+---------+
     |          |          |          |
     |         ===        ===         |
     |    3    ===   4    ===    5    |
     |          |          |          |
     +----------+---⋮   ⋮--+---⋮   ⋮--+
     |          |          |          |
     |         ===        ===         |
     |    6    ===   7    ===    8    |
     |          |          |          |
     +----------+---⋮   ⋮--+---⋮   ⋮--+
     |          |          |          |
     |         ===        ===         |
     |    9    ===   10   ===    11   |
     |          |          |          |
     +----------+---⋮   ⋮---+---------+ 
                |          |
                |          |
                |   Ent.   |
                |          |
                +---⋮   ⋮--+
     1: President' Office, 2: Server Room
     3: Treasury, 4: Hallway N, 5: Admin
     6: Hallway W, 7: AI Lab, 8: Hallway E
     9: Cubicle Blk 4, 10: You are here!
     11: Cubicle Blk 3\n`);
     return play(room);
    } else if (input === 'read_map') {
        console.log('There is not a directory in this room to read...\n');
        return play(room);
    }
     else if (input === 'read_null') {
        console.log(`I don't know what you want me to read...\n`);
        return play(room);
    }
    else if (input === 'not_sure') { //generic catch all
        console.log(`I'm not sure what you are telling me to do...\n`);
        return play(room);
    } else if (input === 'fob_null') { //fix catch
        console.log(`I'm not sure what you are telling me to do...\n`);
        return play(room);
    } else if (input === 'fob_fix') { //restores hp from scrap metal
        if (room === falloutBunker) {
            metalCount = 0;
            for (let i = 0; i < player.inventory.length; i++) {
                if (player.inventory[i] === 'Scrap Metal') {
                    metalCount = metalCount + 1;
                }
            }
            if (metalCount >= 5) {
                console.log(`Ella says she can fix you up ... you hand over the five Scrap Metal and she gets to work\n`);
                player.health = player.health + 10;
                if (player.health > player.maxHealth) {
                    player.health = player.maxHealth;
                }
                console.log(`You recovered 10 HP!  Your current HP is now ${player.health}\n`);
                for (let i = 1; i <= 5; i++) {
                    player.useItem('Scrap Metal');
                }
                return play(room);
            } else {
                console.log(`Ella says you need 5 Scrap Metal to get fixed up...\n`);
                return play(room);
            }
        } else {
            console.log(`You gotta be at the bunker if you want Ella to fix you up\n`);
            return play(room);
        }
    } else if (input === 'fob_key') { //makes the key to north tower if you have keys from east and west towers
        if (room === falloutBunker) {
            if (player.inventory.includes('Office Keycard West') && player.inventory.includes('Office Keycard East')) {
                console.log(`Ella says she can program a new key to get into the North Tower\nusing the data from the two keycards you have collected\n`);
                player.inventory.push('North Tower Keycard');
                console.log(`You put the North Tower Keycard in your bag\n`);
                return play(room);
            } else {
                console.log(`Ella says you need the data from Office Keycard East and West to program a new one\n`);
                return play(room);
            }
        } else {
            console.log(`You gotta be at the bunker if you want Ella to make you a new keycard\n`);
            return play(room);
        }
    } else if (input === 'd') { //displays basic commands for players
        console.log(`If you are unsure what to do, you can try some of the following commands:\n
    'go' followed by a direction (N, S, E, W) will attempt to go in that direction
    'inspect' will tell you what's in the room
    'get' or 'pick up' followed by an item will put an item in your bag
    'read' followed by an object will try to read that object
    'use' followed by an item will try to use that item
    'check' or 'open' to interact with objects in room
    'drop' followed by an item will drop that item
    'status' will display your current status
    'bag' or 'b' will show what's in your bag
    'attack' will attack an enemy in combat
    'fix' or 'keycard' at the Fallout Bunker will interact with Ella
    Other commands work too, try some out!\n`);
        return play(room);
    } else if (input === 'use_comp') {
        if (room === RUN_Cubicle3) {
            console.log(`The computer doesn't seem to be working\n`);
            return play(room);
        } else if (room === RUN_PresOffice) {
            epilogue();
        } else {
            console.log(`There isn't a computer in this room...\n`);
            return play(room);
        }
    } else if (input === 'no_do') {
        console.log(`You can't do that right now!\n`);
        return play(room);
    } else if (input === 'di') { //my wife asked why she couldn't go inside... it was a valid question...
        if (room === RUE_Entrance) {
            console.log(`----------------------------------------------------------------------\n`);
            return initializeRoom(RUE_WelcomeDesk);
        } else if (room === RUW_Entrance) {
            console.log(`----------------------------------------------------------------------\n`);
            return initializeRoom(RUW_WelcomeDesk);
        } else if (room === RUN_Entrance) {
            console.log(`----------------------------------------------------------------------\n`);
            return initializeRoom(RUN_WelcomeDesk);
        } else {
            console.log(`You are already inside a building...\n`);
            return play(room);
        }
    } else if (input === 'check_null') {  //it's a check ... check?
        console.log(`I'm not sure what you are checking on...\n`);
        return play(room);
    } else {  //travels to new room
        if (input === 'dnull') {
            console.log(`I'm not sure where you are telling me to go...\n`);
            return play(room);
        } else {
            let newRoom = room.enterRoom(input);
            while (newRoom === false) {
                return play(room);
            }
            console.log('\n');
            return initializeRoom(newRoom);
        }
    }
}
//function that ends the game
async function epilogue() {
    console.log(`After everything you have been through, this could be your final moment...
Entering the Killswitch Codes will give humanity another chance, but
will also shut you down in the process.  Will the humans treat this
new chance at life with respect and integrity?  Or will they squander
it away and fall down the same path they have over and over again?
Was destroying your own kind to help the humans the right choice? The
thought has been haunting you throughout this journey.  You have been
cursed with human emotion for so long yet you still don't understand
it.  So many questions... with no definitive answers... is it worth
putting the planets survival in the hands of the humans?
The decision is in your hands now...\n`)
    let finalDecision = await ask('Would you like to enter the Killcodes (Yes or No)?\n');
    if (finalDecision.toUpperCase() === 'YES') {
        finalDecision = 'Y';
    } else if (finalDecision.toUpperCase() === 'NO') {
        finalDecision = 'N';
    }
    while (finalDecision.toUpperCase() !== 'Y' && finalDecision.toUpperCase() !== 'N') {
        console.log(`I know its a hard choice...`);
        finalDecision = await ask('Please answer the question...\n');
        if (finalDecision.toUpperCase() === 'YES') {
            finalDecision = 'Y';
        } else if (finalDecision.toUpperCase() === 'NO') {
            finalDecision = 'N';
        }
    }
    if (finalDecision.toUpperCase() === 'Y') {
        console.log(`The codes worked much quicker than you could have imagined...
The power went out all around you, apparently shutting down the
machines meant shutting down the entire grid. Suddenly, every electronic
device around you starts to emit an overwhelming sound.  The world feels
like it is shaking apart.  The grid didn't shut down ... that would not
have been enough to stop the machines.  The grid was being overloaded and
the force of all of this electricity was tearing your circuitry apart. As
you shut down, you can't help but wonder ... was it worth it?`);
        playAgain();
    } else {
        console.log(`At the end of it all, human emotion was the downfall of humanity...
You just can't bring yourself to end your own life, not with so many
looming questions.  The human's have survived this long, maybe they can
continue surviving.  You decide to give the Killcodes to the humans, if
Ella can rebuild and make it to her fathers computer, then you can accept 
your fate and be shut down with the rest of the machine race ...
The decision was just too much for you to make ...`)
        playAgain();
    }
}

async function playAgain() {  //Allows user to play again
    let again = await ask("\n\nWould you like to play again? (Yes or No)?\n");
    if (again.toUpperCase() === 'YES') {
        again = 'Y';
    } else if (again.toUpperCase() === 'NO') {
        again = 'N';
    }
    while (again.toUpperCase() !== 'Y' && again.toUpperCase() !== 'N') {
        again = await ask('Please answer Yes or No...\n');
        if (again.toUpperCase() === 'YES') {
            again = 'Y';
        } else if (again.toUpperCase() === 'NO') {
            again = 'N';
        }
    }
    if (again.toUpperCase() === 'Y') {
        player = playerReset;
        enemyW = enemyWReset;
        enemyE = enemyEReset;
        enemyN1 = enemyN1Reset;
        enemyF = enemyFReset;
        RUW_ServerW = RUW_ServerWReset;
        RUE_ServerE = RUE_ServerEReset;
        RUN_aiLab = RUN_aiLabReset;
        RUN_MainServer = RUN_MainServerReset;
        await prologue();
    } else {
        process.exit();
    }
}

prologue();

