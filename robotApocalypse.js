const readline = require('readline');
const rl = readline.createInterface(process.stdin, process.stdout);

function ask(questionText) {
    return new Promise((resolve, reject) => {
        rl.question(questionText, resolve);
    });
}

let player = {
    maxHealth : 50,
    health: 50,
    inventory: ['North Tower Keycard', 'Plasma Grenade', 'Portable Shield', 'Smoke Bomb'],
    attack: 'Particle Beam',
    damageBase: 5,
    damageModifier: 4,
    status: undefined,
    status2: undefined,
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
            let newInv = this.inventory.sort();
            let itemCount = 1;
            for (let i = 0; i < newInv.length; i++){
                if (newInv[i] !== newInv[i+1]) {
                    console.log(`  ${itemCount} ${newInv[i]}`)
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

//Enemy Class
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
        this.status = undefined;
    }
}

//Enemy Objects
let enemyW = new Enemy ('Robot Sentry', 30, 'Plasma Ray', 'Static Discharge', 6, 6, 'status_stun', undefined, undefined, 'Killswitch Code 1', 'Sample Info E');
let enemyE = new Enemy('Robot Bruiser', 75, 'Pneumatic Fist', 'Missle Barrage', 3, 3, 'offensive', 6, 12, 'Killswitch Code 2', 'Sample Info W');
let enemyN1 = new Enemy('Mechanical Surveillance Unit', 100, 'Fission Laser', 'Remote Laser', 8, 6, 'status_dot', 3, 3, 'Office Keycard North', 'Sample Info N,S,E,W');
let enemyF = new Enemy('Enforcer Captain', 150, 'Collider Beam', 'Combat Repair', 10, 10, 'defensive', 19, 6, 'Killswitch Code 3', 'Sample Info S');

//Input validation class
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
        this.items = ['KIT', 'METAL', 'BATTERY', 'COATING', 'BOX1', 'BOX2', 'PLASMA GRENADE', 'PORTABLE SHIELD', 'SMOKE BOMB'];
        this.otherActions = ['DROP', 'THROW', 'FART', 'LAUGH', 'LOL', 'HUG', 'READ'];
        this.validInputs = [this.affirmative, this.negatory, this.direction, this.inventory, this.status, this.inspect, this.instructions, this.useItem, this.pickUpItem, this.combat, this.items, this.otherActions];
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
        } else if (obj.firstWord === 'READ' || obj.lastWord === 'READ') {
            if (obj.lastWord === 'BOX1') {
                this.return = 'read_rboxw';
            } else if (obj.lastWord === 'BOX2') {
                this.return = 'read_rboxe';
            } else {
                this.return = 'read_null';
            }
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
            } else if (obj.lastWord === 'GRENADE') {
                this.return = 'use_grenade';
            } else if (obj.lastWord === 'SHIELD'){
                this.return = 'use_shield';
            } else if (obj.lastWord === 'BOMB'){
                this.return = 'use_bomb';
            } else if (obj.lastWord === 'METAL') {
                this.return = 'no_use'
            } else {
                this.return = 'use_null';
            }
        } else if ((this.pickUpItem.includes(obj.firstWord) || this.items.includes(obj.firstWord) || this.items.includes(obj.lastWord)) && !this.otherActions.includes(obj.firstWord)){
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
            } else if (obj.firstWord === 'GRENADE' || obj.lastWord === 'GRENADE') {
                this.return = 'pu_grenade';
            } else if (obj.firstWord === 'SHIELD' || obj.lastWord === 'SHIELD') {
                this.return = 'pu_shield';
            } else if (obj.firstWord === 'BOMB' || obj.lastWord === 'BOMB') {
                this.return = 'pu_bomb';
            } else {
                this.return = 'pu_null';
            }
        } else if (this.combat.includes(obj.firstWord) || this.combat.includes(obj.lastWord)){
            if (obj.firstWord === 'THROW') {
                if (obj.lastWord === 'GRENADE') {
                    this.return = 'use_grenade';
                } else if (obj.lastWord === 'BOMB'){
                    this.return = 'use_bomb';
                }
            } else {
                this.return = 'combat';
            }
        } else if (this.riddle.includes(obj.lastWord)) {
            if (obj.lastWord === 'WET') {
                this.return = 'rboxw_solved';
            } else if (obj.lastWord === 'SILENCE') {
                this.return = 'rboxe_solved';
            }
        }
        else {
            return 'not_sure';
        }
    }
}

//Room class to build each room
class Room {
    constructor(name, info, inventory, enemy, north, south, east, west, keycard) {
        this.name = name;
        this.info = info;
        this.inventory = inventory;
        this.enemy = enemy;
        this.north = north;
        this.south = south;
        this.east = east;
        this.west = west;
        this.keycard = keycard;
        this.pickUpItem = function (item) {  //removes item from room inventory when picked up
            for (var i = 0; i < this.inventory.length; i++) {
                if (this.inventory[i] === item) {
                    this.inventory.splice(i, 1);
                    break;
                };
            }
        }
    }
    //room "state machine" (I know it's not a state machine lol)
    enterRoom (direction) {
        let newRoom = '';
        if ((direction === 'dn' && this.north) || (direction === 'ds' && this.south) || (direction === 'de' && this.east) || (direction === 'dw' && this.west)) {
            if (direction === 'dn') {
                newRoom = this.north;
                newRoom = roomLookUp[newRoom];
                if (newRoom.keycard && player.inventory.includes(newRoom.keycard)) {
                    console.log('You scan your keycard, the door unlocks!\n');
                    return newRoom;
                } else if (newRoom.keycard && !player.inventory.includes(newRoom.keycard)) {
                    console.log('You do not have the required keycard to enter this area\n');
                    return false;
                } else {
                    return newRoom;
                }
            } else if (direction === 'ds') {
                newRoom = this.south;
                newRoom = roomLookUp[newRoom];
                if (newRoom.keycard && player.inventory.includes(newRoom.keycard)) {
                    console.log('You scan your keycard, the door unlocks!\n');
                    return newRoom;
                } else if (newRoom.keycard && !player.inventory.includes(newRoom.keycard)) {
                    console.log('You do not have the required keycard to enter this area\n');
                    return false;
                } else {
                    return newRoom;
                }
            } else if (direction === 'de') {
                newRoom = this.east;
                newRoom = roomLookUp[newRoom];
                if (newRoom.keycard && player.inventory.includes(newRoom.keycard)) {
                    console.log('You scan your keycard, the door unlocks!\n');
                    return newRoom;
                } else if (newRoom.keycard && !player.inventory.includes(newRoom.keycard)) {
                    console.log('You do not have the required keycard to enter this area\n');
                    return false;
                } else {
                    return newRoom;
                }
            } else {
                newRoom = this.west;
                newRoom = roomLookUp[newRoom];
                if (newRoom.keycard && player.inventory.includes(newRoom.keycard)) {
                    console.log('You scan your keycard, the door unlocks!\n');
                    return newRoom;
                } else if (newRoom.keycard && !player.inventory.includes(newRoom.keycard)) {
                    console.log('You do not have the required keycard to enter this area\n');
                    return false;
                } else {
                    return newRoom;
                }
            }
        } else {
            console.log('There is nothing in that direction')
            return false;
        }
    }

    inspectRoom () {
        if (this.inventory.length !== 0) {
            console.log(`Upon looking around, you notice that the following items are in ${this.name}:`);
            console.log(this.inventory.join(', ') + `\n`);
        } else {
            console.log('There is nothing of interest in this area\n');
        }
    }
}

//Rooms
//Home Base (You can trade in Scrap Metal here to restore health);
let falloutBunker = new Room('Fallout Bunker', 'Sample Info N,E,W', [], undefined, 'RUN_Entrance', false, 'RUE_Entrance', 'RUW_Entrance', false);
//Robotics United Towers
//R.U. West
let RUW_Entrance = new Room('R.U.West Entrance', 'Sample Info E,W', [], undefined, false, false, 'falloutBunker', 'RUW_WelcomeDesk', false);
let RUW_WelcomeDesk = new Room('Welcome Desk', 'Sample Info N,S,E', ['Scrap Metal', 'Scrap Metal'], undefined, 'RUW_BreakRoom', 'RUW_Cubicle1', 'RUW_Entrance', false, false);
let RUW_BreakRoom = new Room('Break Room', 'Sample Info S,W', ['Repair Kit'], undefined, false, 'RUW_WelcomeDesk', false, 'RUW_Hallway1N', false);
let RUW_Hallway1N = new Room('Hallway 1N - W', 'Sample Info S,E,W', ['Scrap Metal'], undefined, false, 'RUW_FabUnit', 'RUW_BreakRoom', 'RUW_ExpLabs', false);
let RUW_ExpLabs = new Room('Experimental Arms Lab', 'Sample Info E', ['Particle Battery', 'Scrap Metal'], undefined, false, false, 'RUW_Hallway1N', false, false);
let RUW_Cubicle1 = new Room('Cubicle Block 1', 'Sample Info N,W', ['Repair Kit'], undefined, 'RUW_WelcomeDesk', false, false, 'RUW_Hallway1S', false);
let RUW_Hallway1S = new Room('Hallway 1S - W', 'Sample Info N,E,W', [], undefined, 'RUW_FabUnit', false, 'RUW_Cubicle1', 'RUW_Office', false);
let RUW_Office = new Room('R.U.West Office', 'Sample Info E', ['Riddle Box1'], undefined, false, false, 'RUW_Hallway1S', false, false);
let RUW_FabUnit = new Room('Fabrication Unit West', 'Sample Info N,S,W', ['Thick Carbon Coating', 'Scrap Metal', 'Scrap Metal'], undefined, 'RUW_Hallway1N', 'RUW_Hallway1S', false, 'RUW_ServerW', false);
let RUW_ServerW = new Room('Server Room West', 'Sample Info E', [], enemyW, false, false, 'RUW_FabUnit', false, 'Office Keycard West');
//R.U. East
let RUE_Entrance = new Room('R.U.East Entrance', 'Sample Info E,W', [], undefined, false, false, 'RUE_WelcomeDesk', 'falloutBunker', false);
let RUE_WelcomeDesk = new Room('Welcome Desk', 'Sample Info N,S,W', ['Scrap Metal', 'Scrap Metal'], undefined, 'RUE_Cubicle2', 'RUE_Charging', false, 'RUE_Entrance', false);
let RUE_Cubicle2 = new Room('Cubicle Block 2', 'Sample Info S,E', ['Repair Kit'], undefined, false, 'RUE_WelcomeDesk', 'RUE_Hallway1N', false, false);
let RUE_Hallway1N = new Room('Hallway 1N - E', 'Sample Info S,E,W', ['Scrap Metal'], undefined, false, 'RUE_FabUnit', 'RUE_QA', 'RUE_Cubicle2', false);
let RUE_QA = new Room('Quality Assurance', 'Sample Info W', ['Riddle Box2'], undefined, false, false, false, 'RUE_Hallway1N', false);
let RUE_Charging = new Room('Charging Station', 'Sample Info N,E', ['Repair Kit'], undefined, 'RUE_WelcomeDesk', false, 'RUE_Hallway1S', false, false);
let RUE_Hallway1S = new Room('Hallway 1S - E', 'Sample Info N,E,W', ['Scrap Metal', 'Scrap Metal'], undefined, 'RUE_FabUnit', false, 'RUE_AdvWeapons', 'RUE_Charging', false);
let RUE_AdvWeapons = new Room('Advanced Weapons Lab', 'Sample Info W', ['Particle Battery'], undefined, false, false, false, 'RUE_Hallway1S', false);
let RUE_FabUnit = new Room('Fabrication Unit East', 'Sample Info N,S,E', ['Thick Carbon Coating', 'Scrap Metal', 'Scrap Metal'], undefined, 'RUE_Hallway1N', 'RUE_Hallway1S', 'RUE_ServerE', false, false);
let RUE_ServerE = new Room('Server Room East', 'Sample Info W', [], enemyE, false, false, false, 'RUE_FabUnit', 'Office Keycard East');
//R.U. North
let RUN_Entrance = new Room('R.U.North Entrance', 'Sample Info N,S', [], undefined, 'RUN_WelcomeDesk', 'falloutBunker', false, false, 'North Tower Keycard');
let RUN_WelcomeDesk = new Room('Welcome Desk', 'Sample Info N,S,E,W', ['Scrap Metal', 'Scrap Metal', 'Scrap Metal'], undefined, 'RUN_aiLab', 'RUN_Entrance', 'RUN_Cubicle3', 'RUN_Cubicle4', false);
let RUN_Cubicle3 = new Room('Cubicle Block 3', 'Sample Info N,W', ['Repair Kit'], undefined, 'RUN_Hallway1E', false, false, 'RUN_WelcomeDesk', false);
let RUN_Hallway1E = new Room('Hallway 1E - N', 'Sample Info N,S,W', ['Thick Carbon Coating'], undefined, 'RUN_AdminOffice', 'RUN_Cubicle3', false, 'RUN_aiLab', false);
let RUN_AdminOffice = new Room('Administrative Offices', 'Sample Info S,W', ['Repair Kit', 'Scrap Metal'], undefined, false, 'RUN_Hallway1E', false, 'RUN_Hallway3N', false);
let RUN_Cubicle4 = new Room('Cubicle Block 4', 'Sample Info N,E', ['Repair Kit'], undefined, 'RUN_Hallway1W', false, 'RUN_WelcomeDesk', false, false);
let RUN_Hallway1W = new Room('Hallway 1W - N', 'Sample Info N,S,E', ['Thick Carbon Coating','Scrap Metal'], undefined, 'RUN_Treasury', 'RUN_Cubicle4', 'RUN_aiLab', false, false);
let RUN_Treasury = new Room('R.U. Treasury', 'Sample Info S,E', ['Particle Battery'], undefined, false, 'RUN_Hallway1W', 'RUN_Hallway3N', false, false);
let RUN_aiLab = new Room('Artificial Intelligence Laboratory', 'Sample Info N,S,E,W', [], enemyN1, 'RUN_Hallway3N', 'RUN_WelcomeDesk', 'RUN_Hallway1E', 'RUN_Hallway1W', false);
let RUN_Hallway3N = new Room('Hallway 3N - N', 'Sample Info N,S,E,W', ['Scrap Metal', 'Scrap Metal'], undefined, 'RUN_MainServer', 'RUN_aiLab', 'RUN_AdminOffice', 'RUN_Treasury', false);
let RUN_MainServer = new Room('Main Server Room', 'Sample Info N', [], enemyF, 'RUN_PresOffice', 'RUN_Hallway3N', false, false, 'Office Keycard North');
let RUN_PresOffice = new Room('R.U. Presidents Office', 'Sample Info S', [], undefined, false, false, false, false, false);

//Room Lookup Table
let roomLookUp = {
    'falloutBunker' : falloutBunker,
    'RUW_Entrance' : RUW_Entrance, 
    'RUW_WelcomeDesk' : RUW_WelcomeDesk,
    'RUW_BreakRoom' : RUW_BreakRoom,
    'RUW_Hallway1N' : RUW_Hallway1N,
    'RUW_ExpLabs' : RUW_ExpLabs,
    'RUW_Cubicle1' : RUW_Cubicle1, 
    'RUW_Hallway1S' : RUW_Hallway1S,
    'RUW_Office' : RUW_Office,
    'RUW_FabUnit' : RUW_FabUnit,
    'RUW_ServerW' : RUW_ServerW,
    'RUE_Entrance' : RUE_Entrance, 
    'RUE_WelcomeDesk' : RUE_WelcomeDesk,
    'RUE_Cubicle2' : RUE_Cubicle2, 
    'RUE_Hallway1N' : RUE_Hallway1N,
    'RUE_QA' : RUE_QA,
    'RUE_Charging' : RUE_Charging, 
    'RUE_Hallway1S' : RUE_Hallway1S,
    'RUE_AdvWeapons' : RUE_AdvWeapons, 
    'RUE_FabUnit' : RUE_FabUnit,
    'RUE_ServerE' : RUE_ServerE,
    'RUN_Entrance' : RUN_Entrance, 
    'RUN_WelcomeDesk' : RUN_WelcomeDesk,
    'RUN_Cubicle3' : RUN_Cubicle3, 
    'RUN_Hallway1E' : RUN_Hallway1E,
    'RUN_AdminOffice' : RUN_AdminOffice,
    'RUN_Cubicle4' : RUN_Cubicle4, 
    'RUN_Hallway1W' : RUN_Hallway1W,
    'RUN_Treasury' : RUN_Treasury, 
    'RUN_aiLab' : RUN_aiLab,
    'RUN_Hallway3N' : RUN_Hallway3N,
    'RUN_MainServer' : RUN_MainServer, 
    'RUN_PresOffice' : RUN_PresOffice 
}

//possible item array
let possibleItems = ['pu_scrapmetal', 'pu_particlebattery', 'pu_carboncoating', 'pu_repairkit', 'pu_rboxw', 'pu_rboxe', 'pu_grenade', 'pu_shield', 'pu_bomb'];

//useable item array
let useableItems = ['use_particlebattery', 'use_carboncoating', 'use_rboxw', 'use_rboxe', 'use_repairkit', 'use_grenade', 'use_shield', 'use_bomb'];

// pick up item lookup object
let itemLookUp = {
    pu_scrapmetal : 'Scrap Metal',
    pu_particlebattery : 'Particle Battery',
    pu_carboncoating : 'Thick Carbon Coating',
    pu_repairkit: 'Repair Kit',
    pu_grenade: 'Plasma Grenade',
    pu_shield: 'Portable Shield',
    pu_bomb: 'Smoke Bomb',
    pu_rboxw : 'Riddle Box1',
    pu_rboxe : 'Riddle Box2'
}

//useable item lookup object
let useableItemLookUp = {
    use_repairkit : 'Repair Kit',
    use_particlebattery : 'Particle Battery',
    use_carboncoating : 'Thick Carbon Coating',
    use_grenade : 'Plasma Grenade',
    use_shield : 'Portable Shield',
    use_bomb : 'Smoke Bomb',
    use_rboxw : 'Riddle Box1',
    use_rboxe : 'Riddle Box2'
}

function itemEffect (item, comp, answer) {
    if (item === 'use_repairkit') {
        player.useItem(useableItemLookUp[item]);  
        player.health = player.health + 25;
        if (player.health > player.maxHealth) {
            player.health = player.maxHealth;
        }
        player.status2 = undefined;
        return console.log(`Your health has been restored!  You currently have ${player.health} HP!\n`);
    } else if (item === 'use_particlebattery') {
        player.useItem(useableItemLookUp[item]);
        player.damageBase = player.damageBase + 2;
        return console.log(`You have upgraded your Particle Beam!  It now hits harder than ever!`);
    } else if (item === 'use_carboncoating') {
        player.useItem(useableItemLookUp[item]);
        player.maxHealth = player.maxHealth + 10;
        return console.log(`You have increased your maximum HP by 10 points!`);
    } else if (item === 'use_grenade') {
        player.useItem(useableItemLookUp[item]);
        if (comp !== undefined) {
            comp.health = comp.health - 20;
            return console.log(`You threw a Plasma Grenade! It dealt 20 damage to ${comp.name}!`)
        } else {
            return console.log(`You throw a Plasma Grenade!\nThe blast was impressive, but would have been more useful in a fight...`)
        }
    } else if (item === 'use_shield') {
        player.useItem(useableItemLookUp[item]);
        if (comp !== undefined) {
            player.status2 = 'shield';
            return console.log(`You generate a temporary shield that can absorb damage!`);
        } else {
            return console.log(`You generate a temporary shield! Too bad you aren't being attacked...`)
        }
    } else if (item === 'use_bomb') {
        player.useItem(useableItemLookUp[item]);
        if (comp !== undefined) {
            comp.status = 'smoke';
            return console.log(`You throw a Smoke Bomb! It will be harder for ${comp.name} to hit you!`)
        } else {
            return console.log(`You throw a Smoke Bomb! Gee golly that was exciting!`);
        }
    } else if (item === 'use_rboxw') {
        if (answer === 'WET') {
            player.useItem(useableItemLookUp[item]);
            player.inventory.push('Office Keycard West');
            return console.log('You solved the riddle!  There was a Keycard to the West tower inside!')
        } else {
            return console.log(`That's a tough riddle, gonna have to think about that one...`)
        }
    } else if (item === 'use_rboxe') {
        if (answer === 'SILENCE') {
            player.useItem(useableItemLookUp[item]);
            player.inventory.push('Office Keycard East');
            return console.log('You solved the riddle!  There was a Keycard to the East tower inside!')
        } else {
            return console.log(`That's a tough riddle, gonna have to think about that one...`)
        }
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
        let stunChance = random(4);
        if (stunChance !== 1) {
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
        player.status2 = undefined;
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
                        return true;
                    }
                } else {
                console.log(`You fired your ${player.attack}!  It dealt ${damageUser} damage!\n`); 
                comp.health = comp.health - damageUser;
                if (comp.health <= 0) {
                    console.log(`You have defeated ${comp.name}, congratulations!`);
                    console.log(`You received ${comp.reward} for winning!`);
                    player.inventory.push(comp.reward);
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
                    itemEffect(input, comp);
                    if (player.status2 === 'shield'){
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
                    if (shieldHP <= 0){
                        console.log (`Your shield absorbed the damage... but was destroyed in the process\n`);
                    } else {
                        console.log (`Your shield absorbed the damage!\n`);
                    }
                } else {
                    player.health = player.health - damageComp;
                    if (player.health <= 0) {
                    console.log('You have been defeated! Better luck next time!');
                    process.exit();
                    } else {
                    console.log(`Your currently have ${player.health} HP!\n`);
                    }
                }
            } else {
                console.log(`${comp.name} fired a ${comp.attack}, it dealt ${damageComp} damage!\n`);
                if (shieldHP > 0) {
                    shieldHP = shieldHP - damageComp;
                    if (shieldHP <= 0){
                        console.log (`Your shield absorbed the damage... but was destroyed in the process\n`);
                    } else {
                        console.log (`Your shield absorbed the damage!\n`);
                    }
                } else {
                    player.health = player.health - damageComp;
                    if (player.health <= 0) {
                        console.log('You have been defeated! Better luck next time!');
                        process.exit();
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

async function initializeRoom(room) {  //initializes the current room with it's despcription and name
    console.log(room.name);
    console.log(room.info);
    return play(room);
}

async function play(room) {  //allows player to make decisions within each room
    if (room.enemy) {
        let victory = await combat(room.enemy);
        if (victory === true) {
            room.info = room.enemy.postRoomInfo;
            room.enemy = undefined;
            return initializeRoom(room);
        }
    }
    let input = await ask('What would you like to do?\n');
    input = new ValidInput(input);
    while (input.firstInputTrue() === false && input.lastWordTrue() === false) {
        console.log('Please enter a valid input...\n');
        input = await ask('What would you like to do?\n');
        input = new ValidInput(input);
    }
    input.returnInput(input);
    input = input.return.toString();
    if (input === 's') {  //displays players status
        player.getStatus();
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
    } else if (input === 'pu_null') {
        console.log(`I'm not sure what you are trying to pick up...\n`);
        return play(room);
    } 
    else if (possibleItems.includes(input)){  //picks up items in room
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
    } else if (input === 'use_null') {
        console.log(`I'm not sure what item you are trying to use...\n`);
        return play(room);
    } else if (input === 'no_use') {
        console.log(`You cannot use that item right now...\n`);
        return play(room);
    } else if (input === 'use_rboxw') {
        let answer = await ask('What is the answer to the riddle inscribed on this box?\n');
        answer = answer.toString().toUpperCase()
        itemEffect('use_rboxw', undefined, answer);
        return play(room);
    } else if (input === 'use_rboxe') {
        let answer = await ask('What is the answer to the riddle inscribed on this box?\n');
        answer = answer.toString().toUpperCase()
        itemEffect('use_rboxe', undefined, answer);
        return play(room);
    }
    else if (useableItems.includes(input)){  //uses items in inventory
        input = input.toString();
        let itemToUse = useableItemLookUp[input];
        let userInventory = player.inventory;
        if (userInventory.includes(itemToUse)){
            itemEffect(input);
            return play(room);
        } else {
            console.log(`You don't have that item in your bag! Better go find one if you want to use it!\n`);
            return play(room);
        }
    } else if (input === 'read_rboxw') {
        console.log('There is a riddle on the box, it reads:\nIf you throw a blue stone into the red sea, what does it become?\n');
        return play(room);
    } else if (input === 'read_rboxe') {
        console.log('There is a riddle on the box, it reads:\nWhat is so delicate that even just saying its name can break it?\n');
        return play(room);
    } else if (input === 'read_null') {
        console.log(`There is nothing for me to read...`);
        return play(room);
    } 
    else if (input === 'not_sure') {
        console.log(`I'm not sure what you are telling me to do...`);
        return play(room);
    } else {  //travels to new room
        if (input === 'dnull') {
            console.log(`I'm not sure where you are telling me to go...\n`);
            return play(room);
        } else {
            let newRoom = room.enterRoom(input);
            while (newRoom === false){
                return play(room);
            }
            console.log('\n');
            return initializeRoom(newRoom);
        }
    }
}

initializeRoom(falloutBunker);

