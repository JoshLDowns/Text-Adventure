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
    inventory: ['Office Keycard West', 'Office Keycard East', 'Repair Kit', 'Particle Battery', 'Thick Carbon Coating'],
    ability: 'Particle Beam',
    damageBase: 5,
    damageModifier: 4,
    useItem: function (item) { //removes repair kit from inventory on use
        for (var i = 0; i < this.inventory.length; i++) {
            if (this.inventory[i] === item) {
                this.inventory.splice(i, 1);
                break;
            }
        }
    },
    status: function () {
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

let enemyW = {
    name: 'Robot Sentry',
    health: 30,
    ability: 'Plasma Ray',
    damageBase: 6,
    damageModifier: 6,
    reward : 'Killswitch Code 1',
    postRoomInfo : 'Sample Info E'
}

let enemyE = {
    name: 'Robot Bruiser',
    health: 75,
    ability: 'Pneumatic Fist',
    damageBase: 3,
    damageModifier: 3,
    reward: 'Killswitch Code 2',
    postRoomInfo : 'Sample Info W'
}

let enemyN1 = {
    name: 'Mechanical Surveillance Unit',
    health: 100,
    ability: 'Fission Laser',
    damageBase: 8,
    damageModifier: 6,
    reward: 'Office Keycard North',
    postRoomInfo : 'Sample Info N,S,E,W'
}

let enemyF = {
    name: 'Enforcer Captain',
    health: 150,
    ability: 'Collider Beam',
    damageBase: 10,
    damageModifier: 10,
    reward: 'Killswitch Code 3',
    postRoomInfo : 'Sample Info S'
}

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
        this.pickUpItem = ['PICK UP', 'PICK', 'GRAB', 'GET', 'AQUIRE', 'KIT', 'METAL', 'BATTERY', 'COATING', 'BOX1', 'BOX2'];
        this.useItem = ['USE', 'KIT', 'BATTERY', 'COATING', 'BOX1', 'BOX2'];
        this.validInputs = [this.affirmative, this.negatory, this.direction, this.inventory, this.status, this.inspect, this.instructions, this.useItem, this.pickUpItem];
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
        } else if (obj.firstWord === 'USE' && this.useItem.includes(obj.lastWord)) {
            if (obj.lastWord === 'BATTERY') {
                this.return = 'use_particlebattery';
            } else if (obj.lastWord === 'COATING') {
                this.return = 'use_carboncoating';
            } else if (obj.lastWord === 'KIT') {
                this.return = 'use_repairkit';
            } else if (obj.lastWord === 'BOX1') {
                this.return = 'use_rboxw';
            } else {
                this.return = 'use_rboxe';
            }
        } else if (this.pickUpItem.includes(obj.firstWord) || this.pickUpItem.includes(obj.lastWord)){
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
            } else {
                this.return  = 'pu_rboxe';
            }
        } else {
            return 'd';
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
                    return newRoom;
                } else if (newRoom.keycard && !player.inventory.includes(newRoom.keycard)) {
                    console.log('You do not have the required keycard to enter this area');
                    return false;
                } else {
                    return newRoom;
                }
            } else if (direction === 'ds') {
                newRoom = this.south;
                newRoom = roomLookUp[newRoom];
                if (newRoom.keycard && player.inventory.includes(newRoom.keycard)) {
                    return newRoom;
                } else if (newRoom.keycard && !player.inventory.includes(newRoom.keycard)) {
                    console.log('You do not have the required keycard to enter this area');
                    return false;
                } else {
                    return newRoom;
                }
            } else if (direction === 'de') {
                newRoom = this.east;
                newRoom = roomLookUp[newRoom];
                if (newRoom.keycard && player.inventory.includes(newRoom.keycard)) {
                    return newRoom;
                } else if (newRoom.keycard && !player.inventory.includes(newRoom.keycard)) {
                    console.log('You do not have the required keycard to enter this area');
                    return false;
                } else {
                    return newRoom;
                }
            } else {
                newRoom = this.west;
                newRoom = roomLookUp[newRoom];
                if (newRoom.keycard && player.inventory.includes(newRoom.keycard)) {
                    return newRoom;
                } else if (newRoom.keycard && !player.inventory.includes(newRoom.keycard)) {
                    console.log('You do not have the required keycard to enter this area');
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
let possibleItems = ['pu_scrapmetal', 'pu_particlebattery', 'pu_carboncoating', 'pu_repairkit', 'pu_rboxw', 'pu_rboxe'];

//useable item array
let useableItems = ['use_particlebattery', 'use_carboncoating', 'use_rboxw', 'use_rboxe', 'use_repairkit'];

// pick up item lookup object
let itemLookUp = {
    pu_scrapmetal : 'Scrap Metal',
    pu_particlebattery : 'Particle Battery',
    pu_carboncoating : 'Thick Carbon Coating',
    pu_repairkit: 'Repair Kit',
    pu_rboxw : 'Riddle Box1',
    pu_rboxe : 'Riddle Box2'
}

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

//combat function
async function combat(user, comp) {
    let damageUser = 0;
    let damageComp = 0;
    let userMaxHealth = user.maxHealth;

    while (user.health > 0 || comp.health > 0) {  //Loop that breaks when either user or computer hits 0 or less HP
        let choice = await ask('Would you like to (1) Attack, (2) Use item?\n');
        if (choice === '1') {
            damageUser = user.damageBase + Math.floor(Math.random() * (user.damageModifier) + 1);  //damage + modifier (like dice roll)
            console.log(`You fired your ${user.ability}!  It dealt ${damageUser} damage!\n`);  //lines 40 - 42 are reused, will try to rewrite into function
            comp.health = comp.health - damageUser;
            if (comp.health <= 0) {
                console.log(`You have defeated ${comp.name}, congratulations!`);
                console.log(`You received ${comp.reward} for winning!`);
                user.inventory.push(comp.reward);
                console.log(user.inventory);
                return true;
            }
        } else {
            if (user.inventory.includes('Repair Kit')) {
                let kitCount = 0;
                for (let item of user.inventory) {  //determines the amount of Repair Kits you have available
                    if (item === 'Repair Kit') {
                        kitCount = kitCount + 1;
                    }
                }
                let itemChoice = await ask(`You have ${kitCount} Repair Kits to use, would you like to use one?\n`);
                if (itemChoice === 'y') {
                    user.useItem('Repair Kit');  //removes a Repair Kit from inventory if you used one
                    user.health = user.health + 20;
                    if (user.health > userMaxHealth) {
                        user.health = userMaxHealth;
                    }
                    console.log(`Your health has been restored!  You currently have ${user.health} HP!\n`);
                } else {
                    console.log('You have chosen not to use an item ... ATTACK!');
                    damageUser = user.damageBase + Math.floor(Math.random() * (user.damageModifier) + 1);
                    console.log(`You fired your ${user.ability}!  It dealt ${damageUser} damage!\n`);
                    comp.health = comp.health - damageUser;
                    if (comp.health <= 0) {
                        console.log(`You have defeated ${comp.name}, congratulations!`);
                        console.log(`You received ${comp.reward} for winning!`);
                        user.inventory.push(comp.reward);
                        console.log(user.inventory);
                        return true;
                    }
                }
            } else {
                console.log('You do not have any items you can use... ATTACK!');
                damageUser = user.damageBase + Math.floor(Math.random() * (user.damageModifier) + 1);
                console.log(`You fired your ${user.ability}!  It dealt ${damageUser} damage!\n`);
                comp.health = comp.health - damageUser;
                if (comp.health <= 0) {
                    console.log(`You have defeated ${comp.name}, congratulations!`);
                    console.log(`You received ${comp.reward} for winning!`);
                    user.inventory.push(comp.reward);
                    console.log(user.inventory);
                    return true;
                }
            }
        }

        damageComp = comp.damageBase + Math.floor(Math.random() * (comp.damageModifier) + 1);
        user.health = user.health - damageComp;
        console.log(`${comp.name} fired a ${comp.ability}, it dealt ${damageComp} damage!`);
        if (user.health <= 0) {
            console.log('You have been defeated! Better luck next time!');
            process.exit();
        } else {
            console.log(`Your currently have ${user.health} HP!\n`);
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
        let victory = await combat(player, room.enemy);
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
        player.status();
        return play(room);
    } else if (input === 'insp') {  //inspects the room
        room.inspectRoom();
        return play(room);
    } else if (input === 'i') {  //shows inventory
        player.inspectBag();
        return play(room);
    } else if (possibleItems.includes(input)){  //picks up items in room
        input = input.toString();
        let currentItem = itemLookUp[input];
        let currentInventory = room.inventory;
        if (currentInventory.includes(currentItem)) {
            room.pickUpItem(currentItem);
            player.inventory.push(currentItem);
            console.log(`You put ${currentItem} in your bag...`);
            return play(room);
        } else if (currentInventory.length !== 0 && !currentInventory.includes(currentItem)) {
            console.log(`There is no ${currentItem} in this room!`);
            return play(room);
        } else {
            console.log('There are no items in this room');
            return play(room);
        }
    } else if (useableItems.includes(input)){  //uses items in inventory
        input = input.toString();
        let itemToUse = useableItemLookUp[input];
        let userInventory = player.inventory;
        if (userInventory.includes(itemToUse)){
            itemEffect(input);
            return play(room);
        } else {
            console.log(`You don't have that item in your bag! Better go find one if you want to use it!`);
            return play(room);
        }
    }
    else {  //travels to new room
        let newRoom = room.enterRoom(input);
        while (newRoom === false){
            return play(room);
        }
        console.log('\n');
        return initializeRoom(newRoom);
    }
}

initializeRoom(falloutBunker);

