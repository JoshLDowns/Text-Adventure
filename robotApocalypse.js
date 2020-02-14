import { wrap, random, itemEffect, wait, slowLog, storyTextOffOn, roomBar } from './resources/functions.js'
import { ValidInput } from './resources/inputValidation.js'
import { title, gameOverText, mapEast, mapWest, mapNorth, thanks, secretMap } from './resources/ascii_images.js'
import { combat } from './resources/combat.js'
import { ask, menuSelect, craft } from './resources/inquire_funcs.js'

//starts the game and initializes player object, enemy objects, and room objects
async function start() {

    //global variable declaration (width is declared after width warning so wrap function works better)
    let width = process.stdout.columns - 8;
    let firstTurn = true;

    //displays title
    console.clear();
    console.log(title);
    console.log(wrap('Please set your console to a width of at least 75 for the best experience!\n', width));

    //diffuculty selection before game starts
    let difficulty = await menuSelect('Please select a difficulty...', [{ name: 'Easy', value: '1' }, { name: 'Medium', value: '2' }, { name: 'Hard', value: '3' }]);

    //offers story text (slowLog text);
    let storyText = await menuSelect('Would you like story text turned on?...', [{ name: 'Yes', value: 'on' }, { name: 'No', value: 'off' }]);
    if (storyText === 'on') {
        storyText = await menuSelect('How fast would you like story text to run?', [{ name: 'Slower', value: '1' }, { name: 'Faster', value: '2' }, { name: 'Fastest', value: '3' }]);
    }
    console.log(wrap(`\nYou may turn this off or on at any time by typing 'story text off' or 'story text on'\n`, width));

    let logTime = storyText === '1' ? 20 : storyText === '2' ? 15 : storyText === '3' ? 10 : 0; //determines off and on speeds for story text
    let tempInput = ''; //input used to answer questions without progressing game (story text off/on, help menu)

    console.log(`\n----------------------------------------------------------------------\n`);

    //reassign width if player adjusted window after warning
    width = process.stdout.columns - 8;

    //player object
    let player = {
        name: undefined,
        maxHealth: (difficulty === '1' ? 60 : difficulty === '2' ? 50 : 40), //nested ternarys to quickly determine health based on difficulty
        health: (difficulty === '1' ? 60 : difficulty === '2' ? 50 : 40),
        inventory: [],
        attack: 'Particle Beam',
        damageBase: 8,
        damageModifier: 6,
        status: undefined,
        status2: undefined,
        hasKilled: false,
        ability1: undefined,
        ability1Supply: undefined,
        ability1Damage: undefined,
        ability1Modifier: undefined,
        ability2: undefined,
        ability2Supply: undefined,
        ability2Base: undefined,
        ability2Modifier: undefined,
        ability3: undefined,
        ability3Supply: undefined,
        ability3Damage: undefined,
        ability3Modifier: undefined,
        bonusRoom1: false,
        diode: false,
        useItem: function (item) { //removes item from inventory on use
            for (let element of this.inventory) {
                if (element === item) {
                    this.inventory.splice(this.inventory.indexOf(item), 1);
                    break;
                }
            }
        },
        //displays player status
        getStatus: function (room) {
            console.log(`\nCurrent Room: ${room}\n`);
            console.log(`You currently have ${this.health} / ${this.maxHealth} HP.`);
            if ((this.health / this.maxHealth) > .75) {
                console.log('HP is above 75%, you are feeling great\n');
            } else if ((this.health / this.maxHealth) < .25) {
                console.log('HP is below 25%, repair as soon as you can!\n');
            } else {
                console.log('You are a little beat up but doing alright!\n')
            }
            console.log(`Your Particle Beam has a base damage value of ${this.damageBase}.\n`);
            if (this.ability1 !== undefined) {
                console.log(`Your ${this.ability1} has ${this.ability1Supply} charge${this.ability1Supply === 1 ? ` ` : `s `}left.\n`);
            }
            if (this.ability2 !== undefined) {
                console.log(`Your ${this.ability2} has ${this.ability2Supply} charge${this.ability2Supply === 1 ? ` ` : `s `}left.\n`);
            }
            if (this.ability3 !== undefined) {
                console.log(`Your ${this.ability3} has ${this.ability3Supply} charge${this.ability3Supply === 1 ? ` ` : `s `}left.\n`);
            }
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
            } else {
                console.log('You currently are not carrying any items in your bag.\n');
            }
        }
    }

    //Enemy Class
    class Enemy {
        constructor(name, health, maxHealth, attack, ability, damageBase, damageModifier, abilityType, abilityBase, abilityModifier, reward, postRoomInfo, postRoomInfo2, postRoomInventory) {
            this.name = name;
            this.health = health;
            this.maxHealth = maxHealth;
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
            this.postRoomInventory = postRoomInventory;
            this.status = undefined;
        }
    }

    //Enemy Objects
    let enemyW = new Enemy('Robot Sentry', 50, 50, 'Plasma Ray', 'Static Discharge', 6, 9, 'status_stun', undefined, undefined, 'Killswitch Code 1', wrap('The low hum of the servers surrounds you as you stare at what was left of your foe...\n', width), wrap(`Taking down your first enemy was both empowering and soul crushing... Your new found power is exhilerating but what have you given up for it? ... The low hum of the servers and what is left of your foe surrounds you.\n`, width), ['Combat Repair Module', 'Scrap Metal', 'Scrap Metal', 'Scrap Metal']);
    let enemyE = new Enemy('Robot Bruiser', 75, 75, 'Pneumatic Fist', 'Missle Barrage', 6, 3, 'offensive', 8, 12, 'Killswitch Code 2', wrap('The low hum of the servers surrounds you as you stare at what was left of your foe...\n', width), wrap(`Taking down your first enemy was both empowering and soul crushing... Your new found power is exhilerating but what have you given up for it? ... The low hum of the servers and what is left of your foe surrounds you.\n`, width), ['Missle Launcher', 'Scrap Metal', 'Scrap Metal', 'Scrap Metal', 'Scrap Metal']);
    let enemyN1 = new Enemy('Mechanical Surveillance Unit', 125, 125, 'Fission Laser', 'Remote Laser', 10, 6, 'status_dot', 6, 3, 'Office Keycard North', wrap('As the dust settles, you notice that you were surrounded by automated turrets, thankfully defeating this foe seems to have shut them down... The room is earily quiet.\n', width), undefined, ['Fission Cannon', 'Scrap Metal', 'Scrap Metal']);
    let enemyF = new Enemy('Enforcer Captain', 175, 175, 'Collider Beam', 'Combat Repair', 12, 10, 'defensive', 14, 6, 'Killswitch Code 3', wrap(`Your final foe has been defeated ... You are so close to your end goal, but you can't help but ask yourself, has destroying your own kind been worth it?\n`, width), undefined, ['Scrap Metal', 'Scrap Metal', 'Scrap Metal']);
    let enemyRandom = new Enemy('Surveillance Bot', 35, 45, 'Photon Blaster', 'Combat Repair', 5, 5, 'defensive', 5, 5, `${random(5) <= 2 ? 'Repair Kit' : random(5) <= 2 ? 'Smoke Bomb' : random(5) <= 2 ? 'Plasma Grenade' : 'Scrap Metal'}`) //random loot with nested ternary
    let enemyRandom2 = new Enemy('Drill Bot', 20, 20, 'Nail Gun', 'Drill Punch', 10, 10, 'offensive', 20, 10, `${random(5) <= 2 ? 'Repair Kit' : random(5) <= 2 ? 'Smoke Bomb' : random(5) <= 2 ? 'Plasma Grenade' : 'Scrap Metal'}`)
    let enemyBonus1 = new Enemy('Imperial Infantry Unit', 225, 225, 'Radioactive Slug', 'Rail Gun', 15, 15, 'offensive', 20, 20, 'Large Chest', wrap(`The parking lot is incredibly silent... It's a sunny day, but the beautiful weather will never overshadow the ravaged city that surrounds you`, width), undefined, ['Scrap Metal', 'Scrap Metal', 'Repair Kit', 'Repair Kit']);
    let enemyB1 = new Enemy('Automated Turret', 65, 65, 'Machine Gun', 'Plasma Beam', 12, 8, 'offensive', 10, 20, `${random(5) <= 2 ? 'Repair Kit' : random(5) <= 2 ? 'Smoke Bomb' : random(5) <= 2 ? 'Plasma Grenade' : 'Scrap Metal'}`, wrap(`Without the turret, the bright room is eerily quite being so far underground. It doesn't look like you can salvage anything useful from the turret.\n`, width), undefined, ['Scrap Metal', 'Scrap Metal'])
    let enemyB2 = new Enemy('Warehouse Guard', 75, 75, 'Solar Ray', 'Static Discharge', 12, 12, 'status_stun', undefined, undefined, 'Basement Keycard', wrap(`Now that you have a chance to explore the warehouse, you realize it is mostly full of supplies for organic life forms. There are still some useful items though...\n`, width), undefined, ['Repair Kit', 'Repair Kit', 'Scrap Metal', 'Scrap Metal', 'Portable Shield', 'Plasma Grenade', 'Thick Carbon Coating', 'Thick Carbon Coating']);
    let enemyB3 = new Enemy('Vault Guardian', 200, 200, 'Nuclear Cannon', 'Remote Laser', 15, 15, 'status_dot', 10, 5, 'Nuclear Fuel Cell', wrap(`Your battle with the guard destroyed a good portion of the room... Fortunately, a few of James' inventions remain untouched, and a small work desk in the corner still stands...\n`, width), undefined, ['Scrap Metal', 'Scrap Metal', 'Scrap Metal', 'Regeneration Diode', 'Graphene Plating']);
    
    //cheat code input check
    let cheatCode = ['falloutBunker', 'RUW_Entrance', 'RUW_WelcomeDesk', 'RUW_BreakRoom', 'RUW_Hallway1N', 'RUW_ExpLabs', 'RUW_Cubicle1', 'RUW_Hallway1S', 'RUW_Office', 'RUW_FabUnit', 'RUW_ServerW', 'RUE_Entrance', 'RUE_WelcomeDesk', 'RUE_Cubicle2', 'RUE_Hallway1N', 'RUE_QA', 'RUE_Charging', 'RUE_Hallway1S', 'RUE_SupplyCloset', 'RUE_AdvWeapons', 'RUE_FabUnit', 'RUE_ServerE', 'RUN_Entrance', 'RUN_WelcomeDesk', 'RUN_Cubicle3', 'RUN_Hallway1E', 'RUN_AdminOffice', 'RUN_Cubicle4', 'RUN_Hallway1W', 'RUN_Treasury', 'RUN_aiLab', 'RUN_Hallway3N', 'RUN_MainServer', 'RUN_PresOffice', 'RUW_ParkingLot', 'RUN_SecretStairwell', 'RUN_BasementLanding', 'RUN_FalloutWarehouse', 'RUN_BasementHallway', 'RUN_Vault'];

    //Room class to build each room
    class Room {
        constructor(name, info, inventory, enemy, north, south, east, west, keycard, intObject, intObjInv, secret=false) {
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
            this.secret = secret;
            this.foughtRando = false;
            this.entered = false;
            this.interacted = false;
            this.pickUpItem = function (item) {  //removes item from room inventory when picked up
                for (let element of this.inventory) {
                    if (element === item) {
                        this.inventory.splice(this.inventory.indexOf(item), 1);
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
                    if (newRoom.keycard === 'blocked') {
                        console.log(`The way is blocked...\nMaybe something explosive could fix that problem??\n`);   
                        return false;
                    } else if (newRoom.keycard && player.inventory.includes(newRoom.keycard)) {
                        console.clear();
                        console.log('You scan your keycard, the door unlocks!\n\n');
                        return newRoom;
                    } else if (newRoom.keycard && !player.inventory.includes(newRoom.keycard)) {
                        console.log(`You need ${newRoom.keycard} to enter this room ... \n`);  
                        return false;
                    } else {
                        console.clear();
                        return newRoom;
                    }
                } else if (direction === 'ds') {
                    newRoom = this.south;
                    newRoom = roomLookUp[newRoom];
                    if (newRoom.keycard === 'blocked') {
                        console.log(`The way is blocked...\nMaybe something explosive could fix that problem??\n`);   
                        return false;
                    } else if (newRoom.keycard && player.inventory.includes(newRoom.keycard)) {
                        console.clear();
                        console.log('You scan your keycard, the door unlocks!\n\n');
                        return newRoom;
                    } else if (newRoom.keycard && !player.inventory.includes(newRoom.keycard)) {
                        console.log(`You need ${newRoom.keycard} to enter this room ... \n`);   
                        return false;
                    } else {
                        console.clear();
                        return newRoom;
                    }
                } else if (direction === 'de') {
                    newRoom = this.east;
                    newRoom = roomLookUp[newRoom];
                    if (newRoom.keycard === 'blocked') {
                        console.log(`The way is blocked...\nMaybe something explosive could fix that problem??\n`);   
                        return false;
                    } else if (newRoom.keycard && player.inventory.includes(newRoom.keycard)) {
                        console.clear();
                        console.log('You scan your keycard, the door unlocks!\n\n');
                        return newRoom;
                    } else if (newRoom.keycard && !player.inventory.includes(newRoom.keycard)) {
                        console.log(`You need ${newRoom.keycard} to enter this room ... \n`);   
                        return false;
                    } else {
                        console.clear();
                        return newRoom;
                    }
                } else {
                    newRoom = this.west;
                    newRoom = roomLookUp[newRoom];
                    if (newRoom.keycard === 'blocked') {
                        console.log(`The way is blocked...\nMaybe something explosive could fix that problem??\n`);    
                        return false;
                    } else if (newRoom.keycard && player.inventory.includes(newRoom.keycard)) {
                        console.clear();
                        console.log('You scan your keycard, the door unlocks!\n\n');
                        return newRoom;
                    } else if (newRoom.keycard && !player.inventory.includes(newRoom.keycard)) {
                        console.log(`You need ${newRoom.keycard} to enter this room ... \n`);
                        return false;
                    } else {
                        console.clear();
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
                    console.log(wrap(`Upon looking around, you notice that the following items are in ${this.name}:`, width));
                    console.log(this.inventory.join(', ') + `\nThere is also a ${this.intObject} in the room\n`);
                } else if (this.inventory.length !== 0 && this.intObj === undefined) {
                    console.log(wrap(`Upon looking around, you notice that the following items are in ${this.name}:`, width));
                    console.log(this.inventory.join(', ') + `\n`);
                } else {
                    console.log(`There is a ${this.intObject} in the room\n`);
                }
            } else {
                console.log('After searching the area, you do not see anything of use\n');
            }
            console.log(`There are exits in the following directions:\n${this.north ? `North\n` : ''}${this.east ? `East\n` : ''}${this.south ? `South\n` : ''}${this.west ? `West\n` : ''}`);
        }
    }

    //Rooms
    //Home Base (You can trade in Scrap Metal here to restore health);
    let falloutBunker = new Room('Fallout Bunker', `Ella, as always, is happy to see you...\n'How's everything going?\nIf you have any cool items, type 'craft' to see what we can build!'\n\n'If you ever get stuck you can type 'Help' for a list of commands!'\n`, [], undefined, 'RUN_Entrance', false, 'RUE_Entrance', 'RUW_Entrance', false);
    //Robotics United Towers
    //R.U. West
    let RUW_Entrance = new Room('R.U.West Entrance', wrap('You stand at the Entrance of the Robotics United Tower West. Everything around the tower is destroyed, yet the tower itself is mostly intact. There is a sign on the door...\n', width), [], undefined, false, false, 'falloutBunker', 'RUW_WelcomeDesk', false, 'Sign');
    let RUW_WelcomeDesk = new Room('Welcome Desk', wrap('Outside of the Circulation Desk looking to be mostly intact, the room has been mostly destroyed and left in a state of disarray. Apparently being welcoming is not something we machines are good at... At least the directory with a nice map of the tower is still mostly legible...\n', width), ['Scrap Metal', 'Scrap Metal'], undefined, 'RUW_BreakRoom', 'RUW_Cubicle1', 'RUW_Entrance', false, false, 'Desk', ['Plasma Grenade']);
    let RUW_BreakRoom = new Room('Break Room', wrap('As you enter the break room, you are met with a strong musty smell. Judging by the thick smell of mold and decay ... it must have been lunch time when the machines attacked ...\n', width), ['Repair Kit'], undefined, false, 'RUW_WelcomeDesk', false, 'RUW_Hallway1N', false, 'Refridgerator', []);
    let RUW_Hallway1N = new Room('Hallway 1N - W', wrap('This side of the building seems to have gotten the worst of the fight. The north wall is mostly destroyed, and the floor is littered with debris.\n', width), ['Scrap Metal'], undefined, false, 'RUW_FabUnit', 'RUW_BreakRoom', 'RUW_ExpLabs', false);
    let RUW_ExpLabs = new Room('Experimental Arms Lab', wrap('It looks like the machines have already cleaned out most of the lab. There might still be something of use here though...\n', width), ['Particle Battery', 'Scrap Metal'], undefined, false, false, 'RUW_Hallway1N', false, false);
    let RUW_Cubicle1 = new Room('Cubicle Block 1', wrap('The room looks like it was a cubicle block at one point, but most of the cubicle walls have been destroyed. There is a mostly in tact desk in the corner.\n', width), ['Repair Kit'], undefined, 'RUW_WelcomeDesk', false, false, 'RUW_Hallway1S', false, 'Desk', []);
    let RUW_Hallway1S = new Room('Hallway 1S - W', wrap('The machines must have barracaded the Emergency Exit on the south wall before their attack. The pile of bones in the room is proof enough of that.\n', width), [], undefined, 'RUW_FabUnit', 'RUW_ParkingLot', 'RUW_Cubicle1', 'RUW_Office', false);
    let RUW_Office = new Room('R.U.West Office', wrap('The office seems to have mostly survived the attack some how. There is a filing cabinet that seems to be unscaythed in the corner. You also notice a strange box underneath a smashed desk\n', width), ['West Riddle Box'], undefined, false, false, 'RUW_Hallway1S', false, false, 'Filing Cabinet', ['Portable Shield']);
    let RUW_FabUnit = new Room('Fabrication Unit West', wrap('At one point, specialized parts for various types of medical robots were built here. At this point, the room only builds fear in what was created here...\n', width), ['Thick Carbon Coating', 'Scrap Metal', 'Scrap Metal'], undefined, 'RUW_Hallway1N', 'RUW_Hallway1S', false, 'RUW_ServerW', false);
    let RUW_ServerW = new Room('Server Room West', wrap(`Immidiately upon entering the Server Room, you are greeted by a nimble but heavily armed Combat Class Robot. 'INTRUDER DETECTED!!! It fires a shot that narrowly misses, you spring into action...\n`, width), [], enemyW, false, false, 'RUW_FabUnit', false, 'Office Keycard West');
    let RUW_ParkingLot = new Room('R.U.West Parking Lot', wrap(`Stepping out into the sunlight, you hear the pounding of metal feet running towards you... The sound from the blast must have alarmed some nearby guards. As you look towards the sound, you see a highly advanced combat machine coming at you fast, lets hope you are ready!`, width), [], enemyBonus1, 'RUW_Hallway1S', false, 'falloutBunker', false, 'blocked');
    //R.U. East
    let RUE_Entrance = new Room('R.U.East Entrance', wrap('Standing at the Entrance of Robotics United Tower East, you can see a giant hole blasted through the building about 10 stories up... Something big hit this place, at least the sign on the door is ledgible...\n', width), [], undefined, false, false, 'RUE_WelcomeDesk', 'falloutBunker', false, 'Sign');
    let RUE_WelcomeDesk = new Room('Welcome Desk', wrap('The vaulted ceilings of the once grand welcome lounge has mostly collapsed, leaving a mess of rubble covering most of the room... The Cirrculation Desk stoically stands in the middle of the room, almost as if it is proud to have survived the attack... At least the directory with a nice map of the tower is still mostly legible...\n', width), ['Scrap Metal', 'Scrap Metal'], undefined, 'RUE_Cubicle2', 'RUE_Charging', false, 'RUE_Entrance', false, 'Desk', ['Repair Kit']);
    let RUE_Cubicle2 = new Room('Cubicle Block 2', wrap('There must not have been many people in this cubicle block during the attack, as it is still in pretty good shape. There is sure to be something of use here...\n', width), ['Repair Kit'], undefined, false, 'RUE_WelcomeDesk', 'RUE_Hallway1N', false, false, 'Desk', ['Plasma Grenade']);
    let RUE_Hallway1N = new Room('Hallway 1N - E', wrap('Upon entering the hallway, you see an Employee of the Month picture that somehow survived the attack undamaged hanging on the wall... The man looked so happy...\n', width), ['Scrap Metal'], undefined, false, 'RUE_FabUnit', 'RUE_QA', 'RUE_Cubicle2', false);
    let RUE_QA = new Room('Quality Assurance', wrap('The QA room is large but mostly empty. Anything of use must have already been salvaged by the machines... You notice a strange box on one of the tables...\n', width), ['East Riddle Box'], undefined, false, false, false, 'RUE_Hallway1N', false);
    let RUE_Charging = new Room('Charging Station', wrap('This room was used to give new Robots their first initial charge after after being fabricated. As this was a fully automated unit, the room is mostly untouched, and looks just like it did in the past...\n', width), ['Repair Kit'], undefined, 'RUE_WelcomeDesk', false, 'RUE_Hallway1S', false, false);
    let RUE_Hallway1S = new Room('Hallway 1S - E', wrap('It looks like the humans fought hard in this hallway. Bullet holes cover the walls, and there are two downed robots amongst the bones on the floor. There is a supply closet on the south wall, but it appears to be locked...\n', width), ['Scrap Metal', 'Scrap Metal'], undefined, 'RUE_FabUnit', 'RUE_SupplyCloset', 'RUE_AdvWeapons', 'RUE_Charging', false);
    let RUE_SupplyCloset = new Room('Supply Closet', wrap('It appears the invaders missed this closet during their sweep, as there are a few potentially useful items amongst the various cleaning and maintenance supplies...\n', width), ['Plasma Grenade', 'Nuclear Fuel Cell', 'Repair Kit'], undefined, 'RUE_Hallway1S', false, false, false, 'Office Keycard East');
    let RUE_AdvWeapons = new Room('Advanced Weapons Lab', wrap('This lab was used to research some pretty high tech weapons it seems. There are blueprints scattered across the room. One for a Nuclear Heat Ray catches your eye...sounds pretty sweet!\n', width), ['Particle Battery'], undefined, false, false, false, 'RUE_Hallway1S', false);
    let RUE_FabUnit = new Room('Fabrication Unit East', wrap('This Fabrication Unit focused soley on military grade machines. You can tell by the bullet casings that litter the floor, and the large amount of extremely disfigured skeletal remains strewn across the room...\n', width), ['Thick Carbon Coating', 'Scrap Metal', 'Scrap Metal'], undefined, 'RUE_Hallway1N', 'RUE_Hallway1S', 'RUE_ServerE', false, false);
    let RUE_ServerE = new Room('Server Room East', wrap(`Before the door finishes opening, a large fist puts a sizeable dent in it, barely missing you. A big Combat Class Robot with large missile launchers mounted on it's shoulders points at you and yells 'TRAITOR! You must be terminated! ... Looks like you have to fight ...\n`, width), [], enemyE, false, false, false, 'RUE_FabUnit', 'Office Keycard East');
    //R.U. North
    let RUN_Entrance = new Room('R.U.North Entrance', wrap(`Unlike the other two towers, the Robotics United Tower North seems to be in pretty good shape from the outside. The machines must have been worried about destroying the main server computer that resides inside Ella's Dad's office. I wonder how he would have felt about the sign on the door now...\n`, width), [], undefined, 'RUN_WelcomeDesk', 'falloutBunker', false, false, 'North Tower Keycard', 'Sign');
    let RUN_WelcomeDesk = new Room('Welcome Desk', wrap(`The outside might have looked like it had avoided the brunt of the machine onslaught, but the inside sure didn't. The room is littered with the remains of both machine and human alike. The one takeaway from this gruesome sight is that the desks at Robotics United were rock solid, as the one in this welcome area is still standing tall, just like in the other Towers... At least the directory with a nice map of the tower is still mostly legible...\n`, width), ['Scrap Metal', 'Scrap Metal', 'Scrap Metal'], undefined, 'RUN_aiLab', 'RUN_Entrance', 'RUN_Cubicle3', 'RUN_Cubicle4', false, 'Desk', ['Thick Carbon Coating']);
    let RUN_Cubicle3 = new Room('Cubicle Block 3', wrap('Half of the room is completely leveled, as if a bulldozer drove right through the room. There must have been a big fight here. The other side of the room is in disarray, but one cubicle managed to escape unscathed. Whoever worked there was a huge Hitchhikers Guide to the Galaxy fan, there are posters from the movie all over the cubicle. It looks like the computer still works too...\n', width), ['Repair Kit'], undefined, 'RUN_Hallway1E', false, false, 'RUN_WelcomeDesk', false, 'Computer', []);
    let RUN_Hallway1E = new Room('Hallway 1E - N', wrap(`The walls in this hallway are mostly intact, and are lined with awards celebrating the accomplishments of AI before things went south... If the machines don't have emotion, why save all of this?\n`, width), ['Thick Carbon Coating'], undefined, 'RUN_AdminOffice', 'RUN_Cubicle3', false, 'RUN_aiLab', false);
    let RUN_AdminOffice = new Room('Administrative Offices', wrap('The machines must have took out the higher ups first, as this room looks like it was cleared before the panic set in. It looks as if most the room has already been ransacked for supplies, but a lone Filing Cabinet at the back of the office remains untouched...\n', width), ['Repair Kit', 'Scrap Metal'], undefined, false, 'RUN_Hallway1E', false, 'RUN_Hallway3N', false, 'Filing Cabinet', ['Smoke Bomb']);
    let RUN_Cubicle4 = new Room('Cubicle Block 4', wrap(`This cubicle block seems to have avoided the carnage, as it looks as if the staff had just left for the day. You look around the cubicles and see pictures of friends, family, loved ones...all gone. You still don't understand these feelings, but you know you don't like them...\n`, width), ['Particle Battery'], undefined, 'RUN_Hallway1W', false, 'RUN_WelcomeDesk', false, false);
    let RUN_Hallway1W = new Room('Hallway 1W - N', wrap('On the wall in this hallway is a giant framed picture, with a plaque mounted under it. The plaque reads: James Lloyd, Father of all Machines... There is a single bullet hole in his head...\n', width), ['Thick Carbon Coating', 'Scrap Metal'], undefined, 'RUN_Treasury', 'RUN_Cubicle4', 'RUN_aiLab', false, false, undefined, undefined, true);
    let RUN_Treasury = new Room('R.U. Treasury', wrap('If you had any use for money, you would be one happy camper as the room looked like someone popped a giant confetti launcher that was just full of $100 bills...\n', width), ['Repair Kit'], undefined, false, 'RUN_Hallway1W', 'RUN_Hallway3N', false, false, 'Broken Safe', ['Particle Battery']);
    let RUN_aiLab = new Room('Artificial Intelligence Laboratory', wrap(`As you enter the room, it is completely dark... Suddenly all the lights blast on, and you are met with a machine that looks like a giant turret with arms ...'INTRUDER DETECTED, ELIMINATION SEQUENCE INITIATED'... The door slams shut behind you, it appears there is only one way out of this...\n`, width), [], enemyN1, 'RUN_Hallway3N', 'RUN_WelcomeDesk', 'RUN_Hallway1E', 'RUN_Hallway1W', false);
    let RUN_Hallway3N = new Room('Hallway 3N - N', wrap(`There must have been a mad dash to get to James' office just north of here. The hall has so much rubble, decimated machines, and skeletal remains that it is hard to walk through...\n`, width), ['Scrap Metal', 'Scrap Metal'], undefined, 'RUN_MainServer', 'RUN_aiLab', 'RUN_AdminOffice', 'RUN_Treasury', false);
    let RUN_MainServer = new Room('Main Server Room', wrap(`This is the last room before the office, and you are met with one last foe. You immidiately recognize this Robot. It was the same one that almost ended your time here on what is left of Earth... Thanks to Ella, you have a shot at revenge!\n`, width), [], enemyF, 'RUN_PresOffice', 'RUN_Hallway3N', false, false, 'Office Keycard North');
    let RUN_PresOffice = new Room('R.U. Presidents Office', wrap(`Well, you made it...are you ready for this? You see James' computer in the middle of the office completely untouched by the war. There is one more big choice in your journey...\n`, width), [], undefined, false, false, false, false, false, 'Computer', []);
    let RUN_SecretStairwell = new Room('Secret Stairwell', wrap(`Behind the hidden door you find a long, dark stairwell heading deep underground...\n`, width), [], undefined, false, false, 'RUN_Hallway1W', 'RUN_BasementLanding', false);
    let RUN_BasementLanding = new Room ('Basement Landing', wrap(`As you reach the bottom of the stairs, bright white lights suddenly switch on and you notice an automated turret on the ceiling... it looks like it has it's sights on you...\n`, width), [], enemyB1, 'RUN_BasementHallway', false, 'RUN_SecretStairwell', 'RUN_FalloutWarehouse', false);
    let RUN_FalloutWarehouse = new Room('Fallout Warehouse', wrap(`It looks like James was fully prepared for the fallout, the underground warehouse is huge and filled with enough resources to last a group of people a few years... it is also apparently well guarded...\n`, width), [], enemyB2, false, false, 'RUN_BasementLanding', false, false);
    let RUN_BasementHallway = new Room('Basement Hallway', wrap(`As you walk down the hallway, you feel a sense of comfort. Nothing is destroyed, there are no holes in the wall ... you haven't experienced calm like this in a long time. You are quickly reminded of the times though when you see military supplies piled in the corner... James was getting ready for anything...\n`, width), ['Repair Kit', 'Repair Kit', 'Plasma Grenade', 'Plasma Grenade', 'Nuclear Heat Ray', 'Portable Shield'], false, 'RUN_Vault', 'RUN_BasementLanding', false, false, false, 'Computer', []);
    let RUN_Vault = new Room('The Vault', wrap(`The room is filled with shelves, each littered with their own treasures. James must have used this room to store his most advanced inventions... He also guarded it well...\n`, width), [], enemyB3, false, 'RUN_BasementHallway', false, false, 'Basement Keycard', 'Desk', ['Letter'], false);

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
        'RUW_ParkingLot': RUW_ParkingLot,
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
        'RUN_PresOffice': RUN_PresOffice,
        'RUN_SecretStairwell': RUN_SecretStairwell, 
        'RUN_BasementLanding': RUN_BasementLanding, 
        'RUN_FalloutWarehouse': RUN_FalloutWarehouse,
        'RUN_BasementHallway': RUN_BasementHallway, 
        'RUN_Vault': RUN_Vault
    }

    //array of rooms in secret wing for enemy spawning condition
    let basementRooms = [RUN_SecretStairwell, RUN_BasementHallway, RUN_BasementLanding, RUN_FalloutWarehouse, RUN_Vault];

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
        'West Riddle Box': 'There is something inscribed on the box...',
        'East Riddle Box': 'There is something inscribed on the box...',
        'Office Keycard West': 'Opens doors in R.U. West Tower',
        'Office Keycard East': 'Opens doors in R.U. East Tower',
        'Office Keycard North': 'Opens doors in R.U. North Tower',
        'North Tower Keycard': 'Opens gate to R.U. North Tower',
        'Killswitch Code 1': 'One of Three codes needed',
        'Killswitch Code 2': 'One of Three codes needed',
        'Killswitch Code 3': 'One of Three codes needed',
        'Missle Launcher': 'Maybe Ella can do something with this...',
        'Combat Repair Module': 'Maybe Ella can do something with this...',
        'Fission Cannon': 'Maybe Ella can do something with this...',
        'Large Chest': 'Open it up!...',
        'EMP': 'A targeted EMP charge, should disable most enemies',
        'Graphene Plating': 'Increases Max HP by 30',
        'Regeneration Diode': 'Maybe Ella can do something with this...',
        'Letter': 'Looks like James wrote it...'
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
    let possibleItems = ['pu_scrapmetal', 'pu_particlebattery', 'pu_carboncoating', 'pu_repairkit', 'pu_rbox', 'pu_grenade', 'pu_shield', 'pu_bomb', 'pu_fuelcell', 'pu_heatray', 'pu_all', 'pu_launcher', 'pu_module', 'pu_cannon', 'pu_chest', 'pu_emp', 'pu_letter', 'pu_diode', 'pu_plating'];

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
        pu_rbox: ['West Riddle Box', 'East Riddle Box'],
        pu_launcher: 'Missle Launcher',
        pu_module: 'Combat Repair Module',
        pu_cannon: 'Fission Cannon',
        pu_chest: 'Large Chest',
        pu_emp: 'EMP',
        pu_letter: 'Letter',
        pu_plating: 'Graphene Plating',
        pu_diode: 'Regeneration Diode'
    }

    //dropable item arary
    let dropableItems = ['drop_scrapmetal', 'drop_particlebattery', 'drop_carboncoating', 'drop_repairkit', 'drop_rbox', 'drop_grenade', 'drop_shield', 'drop_bomb', 'drop_fuelcell', 'drop_heatray', 'drop_launcher', 'drop_module', 'drop_cannon', 'drop_chest', 'drop_emp', 'drop_letter', 'drop_plating', 'drop_diode']

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
        drop_rbox: ['West Riddle Box', 'East Riddle Box'],
        drop_launcher: 'Missle Launcher',
        drop_module: 'Combat Repair Module',
        drop_cannon: 'Fission Cannon',
        drop_chest: 'Large Chest',
        drop_emp: 'EMP',
        drop_letter: 'Letter',
        drop_plating: 'Graphene Plating',
        drop_diode: 'Regeneration Diode'
    }

    //useable item array
    let useableItems = ['use_particlebattery', 'use_carboncoating', 'use_rbox', 'use_repairkit', 'use_grenade', 'use_shield', 'use_bomb', 'use_heatray', 'use_chest', 'use_emp', 'use_plating'];

    //useable item lookup object
    let useableItemLookUp = {
        use_repairkit: 'Repair Kit',
        use_particlebattery: 'Particle Battery',
        use_carboncoating: 'Thick Carbon Coating',
        use_grenade: 'Plasma Grenade',
        use_shield: 'Portable Shield',
        use_bomb: 'Smoke Bomb',
        use_heatray: 'Nuclear Heat Ray',
        use_rbox: ['West Riddle Box', 'East Riddle Box'],
        use_chest: 'Large Chest',
        use_emp: 'EMP',
        use_plating: 'Graphene Plating'
    }

    //Into to the game function, tells backstory and places player in first 'room'
    async function prologue() {
        await slowLog(logTime, wrap(`Welcome to the year 2361, the year that the human race was given another chance ... again. It has been twenty-four years since the machines took over. The human's AI algorithms were both their triumph and their downfall. The machines were cold and ruthless, and their "justice" was brutal and swift.  Eighty percent of all biological life on Earth was wiped out in less than a week. What was left of humanity went into hiding, and it has been your mission for the past twenty years to find them.  You don't know why, but you feel compassion for the humans and want to help them.  Something set you apart from the rest of the machines, something that you didn't understand ... something that made you special ... something that made you a target ...\n`, width));
        await slowLog(logTime, wrap(`\nWhile searching he ruins of what used to be Seattle for any signs of life, you find yourself at the end of a mostly collapsed alleyway almost entirely surrounded by rubble. The only choice is to head back the way you came. You hear the faint whirring of gears to the north ...\n`, width));
        let input = await ask('What would you like to do?\n');
        tempInput = await storyTextOffOn(input, logTime);
        logTime = tempInput[1];
        input = new ValidInput(tempInput[0]);
        input.returnInput(input);
        while ((input.firstInputTrue() === false && input.lastWordTrue() === false) || input.return === undefined) {
            console.log('I am not sure what that means...\n');
            input = await ask('What would you like to do?\n');
            input = new ValidInput(input);
            input.returnInput(input);
        }
        input = input.return.toString();
        console.clear();
        if (input !== 'dn') {
            console.log(`----------------------------------------------------------------------\n`);
            await slowLog(logTime, `No time for nonsense, there is only one way to go ... you head north\n`);
        } else {
            console.log(`----------------------------------------------------------------------\n`);
            await slowLog(logTime, `You head north ... the whirring gets louder\n`);
        }
        await slowLog(logTime, wrap(`As you approach a clearing in the rubble, you are cut off by a large, Combat Class Robot! A booming robotic voice yells, "YOU have been deemed a threat to the machine race, JUSTICE will be administered!"\n`, width));
        await slowLog(logTime, wrap(`Up until now you have done a good job of laying low and avoiding any interaction with the machines.  You were obviously not built for combat, but it doesn't look like there is a way out of this fight...\n`, width));
        await slowLog(logTime, wrap(`You don't know why you are being hunted by the machines, after all you are one of them ... Unfortunately this big guy isn't going to give you the time to ask...'\n`, width));
        let input2 = await ask('What would you like to do?\n');
        tempInput = await storyTextOffOn(input2, logTime);
        logTime = tempInput[1];
        input2 = new ValidInput(tempInput[0]);
        input2.returnInput(input2);
        while ((input2.firstInputTrue() === false && input2.lastWordTrue() === false) || input2.return === undefined) {
            console.log('I am not sure what that means...\n');
            input2 = await ask('What would you like to do?\n');
            input2 = new ValidInput(input2);
            input2.returnInput(input2);
        }
        input2 = input2.return.toString();
        console.clear();
        if (input2 !== 'combat') {
            console.log(`----------------------------------------------------------------------\n`);
            await slowLog(logTime, `No time for nonsense, the machine has you pinned, you must fight...\n`);
        } else {
            console.log(`----------------------------------------------------------------------\n`);
            await slowLog(logTime, `You know you stand little chance, but you bravely charge into battle...\n`);
        }
        await slowLog(logTime, wrap(`You fought hard, but were quickly destroyed by a Missle Barrage...`, width));
        await slowLog(logTime, `\n...\n\n...\n\n`);
        await slowLog(logTime, wrap(`Surely that blast must have erased me from existence' you thought to yourself... Yet somehow ... you were still thinking.  You couldn't see or hear anything, but yet here you were, pondering your own existence...`, width));
        await slowLog(logTime, `\n...\n\n...\n\n`);
        await slowLog(logTime, wrap(`You had no idea how much time had passed. The impenetrable darkness that you had accepted as your existence made it difficult to perceive time. Suddenly though, something changed. You began to hear voices ... human voices! Slowly the low hum of your solar energy core, and the light clicking of circuits firing joined the sounds filling your noise sensors. Your vision software snapped back online, and you could see the world around you...\n\n`, width));
        await slowLog(logTime, wrap(`You were in a dimly lit room, with a woman standing over you...`, width));
        await slowLog(logTime, wrap(`\n'You are actually WORKING!!!' she exclaimed... You tried to respond but realize you are not fully repaired yet, and have no way to communicate. In her excitement, it seems like the human almost forgot that fact as well ... 'OH! Right ... I need to get your communication modules in order before you can talk to me ... HA!' Her genuine excitement seemed so pure, and you had never experienced anything like it before...\n\n`, width));
        await slowLog(logTime, wrap(`'Alright, everything should be working now ... what's your name?' she asked.'`, width));
        let name = await ask('Please enter your name ...\n');
        player.name = name;
        console.clear();
        console.log(`----------------------------------------------------------------------\n`);
        await slowLog(logTime, `You think, and finally respond "My name is ${player.name}."`);
        await slowLog(logTime, `  'I KNEW IT,' she yelled, 'you ARE my father's robot!!!'`);
        await slowLog(logTime, wrap(`You weren't sure what that meant, but before you could ask, the human jumped right into an explanation for you...`, width));
        await slowLog(logTime, wrap(`  'First off, my name is Ella Lloyd, the daughter of James Lloyd, the father of all machines ... and you my friend, YOU were his last hope for humanity.  After the machines AI went AWOL and it became clear what their motive was, my father holed himself up and built you in hopes that instilling human emotion in the machines would put an end to their tyranny. He hoped that human compassion would be enough to fight the urge to purify the planet.  Unfortunately his secret lab was attacked and he was killed before he could transfer your code to the rest of the machines. Unaware of what you were at the time, the machines left you there. It seems though, they have figured out just what it is you are unfortunately. I'm hoping you can help us, all of us ... what's left of humanity itself to overcome the machine race, and give us a chance at a new life.  I used what supplies I could muster up to give you some upgrades, so you should be a little more fit for battle now.'\n`, width));
        await slowLog(logTime, wrap(`...As Ella spoke, you struggled to comprehend what she was telling you...\n`));
        await slowLog(logTime, wrap(`You are humanity's last hope? You were created to save the human race? All these things you have been 'feeling' are human emotions? Knowing that didn't help you understand what that meant yet ... hopefully that will come in time...\n`, width));
        let input3 = await ask('Continue listening?...(yes) or (no)\n');
        tempInput = await storyTextOffOn(input3, logTime);
        logTime = tempInput[1];
        input3 = new ValidInput(tempInput[0]);
        input3.returnInput(input3);
        while ((input3.firstInputTrue() === false && input3.lastWordTrue() === false) || input3.return === undefined) {
            console.log('I am not sure what that means...\n');
            input3 = await ask('Continue listening?...(yes) or (no)\n');
            input3 = new ValidInput(input3);
            input3.returnInput(input3);
        }
        input3 = input3.return.toString();
        console.clear();
        if (input3 === 'n') {
            console.log(`----------------------------------------------------------------------\n`);
            await slowLog(logTime, `Doesn't look like Ella is going to give you a choice ...\n`);
            await wait(500);
        } else if (input3 !== 'y') {
            console.log(`----------------------------------------------------------------------\n`);
            await slowLog(logTime, `I'm just going to take that as a yes, you keep listening...\n`);
            await wait(500);
        } else {
            console.log(`----------------------------------------------------------------------\n`);
            await slowLog(logTime, `You hold back your questions and continue listening...\n`);
            await wait(500);
        }
        await slowLog(logTime, wrap(`Ella, in all of her excitement took no notice to your confusion, 'We are currently in an old Fallout Bunker deep underground in the center of the Robotics United Towers ... where the machines were invented.  I stationed us here in hopes that being close to enemy would help us figure out a way to fight them. In my father's office in the North Tower, his computer must still be functioning.  It just has to be in order for the machines to all be operational. The computer is connected to many back up servers around the world though, so simply shutting it off won't shut down the machines. There are three Killcodes though, one in each of the towers.  You can get them in the server room of each tower, but they are most likely guarded. If you enter all the Killcodes into the shutdown program on my father's computer, it will shut the whole system down.  This means you will be shut down too, but this is why you were created, this is your mission ... will you help us?\n`, width));
        await slowLog(logTime, wrap(`... That was a lot to take in, but you cautiously answer yes, this is what you were meant for right?\n`, width));
        await slowLog(logTime, wrap(`  'One last thing' Ella continues, 'My father hid Riddle Boxes in each of the towers with backup keys. They are most likely out in the open, as they were just his spare keys. You'll need the keycards inside to get around each Tower.'\n\n`, width));
        console.log(`----------------------------------------------------------------------\n\n`);
        await ask('Press Enter to continue...');
        console.clear();
        initializeRoom(falloutBunker);
    }

    //initializes the current room with it's despcription and name
    async function initializeRoom(room) {
        if (room.entered === false) {
            room.entered = true;
            if (player.diode === true) {
                player.health = player.health+10;
                if (player.health > player.maxHealth) {
                    player.health = player.maxHealth;
                }
            }
            roomBar(player, room);
            await slowLog(logTime, room.info);
        } else {
            roomBar(player, room);
            console.log(room.info);
        }
        return play(room);
    }

    //Main game function, reads user input and makes decisions based on input, room, and player attributes
    async function play(room) {
        let ranEnemyNum;
        console.log(`----------------------------------------------------------------------\n`);
        //If the game is on the first turn, this checks difficulty and gives you some starting inventory
        if (room === falloutBunker && firstTurn === true) {
            if (difficulty === '1') {
                await slowLog(logTime, `\nIt's dangerous out there, take these Repair Kits...\n`);
                console.log(`3 Repair Kits were added to your inventory\n`);
                player.inventory.push('Repair Kit', 'Repair Kit', 'Repair Kit');
                firstTurn = false;
                return (play(room));
            } else if (difficulty === '2') {
                await slowLog(logTime, `\nIt's dangerous out there, take this gear...\n`);
                console.log(wrap(`2 Repair Kits and 1 Plasma Grenade were added to your inventory\n`, width));
                player.inventory.push('Repair Kit', 'Repair Kit', 'Plasma Grenade');
                firstTurn = false;
                return (play(room));
            } else if (difficulty === '3') {
                await slowLog(logTime, `\nIt's dangerous out there, take this gear...\n`);
                console.log(wrap(`1 Repair Kit, 1 Portable Shield, and 1 Plasma Grenade were added to your inventory\n`, width));
                player.inventory.push('Repair Kit', 'Portable Shield', 'Plasma Grenade');
                firstTurn = false;
                return (play(room));
            }
        }
        //checks if room has a predetermined enemy and calls combat
        if (room.enemy) {
            await wait(2500);
            console.clear();
            let victory = await combat(room.enemy, player);
            await wait(1500);
            if (victory[0] === true) {
                player = victory[1];
                if (room.enemy === enemyRandom) {
                    enemyRandom.health = 35;
                }
                if (player.hasKilled === true) {
                    room.info = room.enemy.postRoomInfo;
                    room.inventory = room.enemy.postRoomInventory;
                    room.enemy = undefined;
                    await wait(1500);
                    console.clear();
                    return initializeRoom(room);
                } else {
                    player.hasKilled = true;
                    room.info = room.enemy.postRoomInfo2;
                    room.inventory = room.enemy.postRoomInventory
                    room.enemy = undefined;
                    await wait(1500);
                    console.clear();
                    return initializeRoom(room);
                }
            } else {
                await slowLog(logTime, 'You have been defeated! Better luck next time!');
                console.log(gameOverText);
                await playAgain(logTime);
            }
        }
        //determines if random enemy spawns in room
        if (!room.enemy && room.name !== 'Fallout Bunker' && room.name !== 'R.U.West Entrance' && room.name !== 'R.U.East Entrance' && room.name !== 'R.U.North Entrance' && room.foughtRando === false && !basementRooms.includes(room)) {
            ranEnemyNum = random(difficulty === '1' ? 16 : difficulty === '2' ? 14 : 12);
            if (ranEnemyNum === 1) {
                console.log('...\n');
                await wait(500);
                console.log('......\n');
                await wait(750);
                console.log('.........\n');
                await wait(1000);
                let enemyRoll = random(3);
                if (enemyRoll === 1 || enemyRoll === 2) {
                    room.enemy = enemyRandom;
                    await slowLog(logTime, wrap('All of the sudden, an alarm sounds... The sound is coming from a small robot covered in flashing lights that was hiding in the corner! It looks like it wants to fight!', width));
                    enemyRandom.postRoomInfo = room.info;
                    await wait(2500);
                    console.clear();
                    let victory = await combat(room.enemy, player);
                    await wait(1500);
                    if (victory[0] === true) {
                        player = victory[1];
                        enemyRandom.health = 35;
                        room.enemy = undefined;
                        room.foughtRando = true;
                        await wait(1500);
                        console.clear();
                        return initializeRoom(room);
                    } else {
                        await slowLog(logTime, 'You have been defeated! Better luck next time!');
                        console.log(gameOverText);
                        await playAgain(logTime);
                    }
                } else {
                    room.enemy = enemyRandom2;
                    await slowLog(logTime, wrap('You hear an incredle crash as a robot with a huge drill attached to one of its arms charges through the wall... looks like you have to fight!', width));
                    enemyRandom.postRoomInfo = room.info;
                    await wait(2500);
                    console.clear();
                    let victory = await combat(room.enemy, player);
                    await wait(1500);
                    if (victory[0] === true) {
                        player = victory[1];
                        enemyRandom2.health = 20;
                        room.enemy = undefined;
                        room.foughtRando = true;
                        await wait(1500);
                        console.clear();
                        return initializeRoom(room);
                    } else {
                        await slowLog(logTime, 'You have been defeated! Better luck next time!');
                        console.log(gameOverText);
                        await playAgain(logTime);
                    }
                }
            }
        }

        let input = await ask('What would you like to do?\n');
        //checks if player has entered the cheat code
        if ((input.slice(0, input.indexOf(' ')).toUpperCase()) === 'XYZZY' && (cheatCode.includes((input.slice((input.lastIndexOf(' ')) + 1))))) {
            console.clear();
            console.log(`----------------------------------------------------------------------\n\n`);
            return initializeRoom(roomLookUp[(input.slice((input.lastIndexOf(' ')) + 1))]);
        }
        //determines if story text is getting turned off or on
        tempInput = await storyTextOffOn(input, logTime);
        logTime = tempInput[1];
        //validates input
        input = new ValidInput(tempInput[0]);
        input.returnInput(input);
        while ((input.firstInputTrue() === false && input.lastWordTrue() === false) || input.return === undefined) {
            console.log('I am not sure what that means...\n');
            console.log(`----------------------------------------------------------------------\n`);
            input = await ask('What would you like to do?\n');
            if ((input.slice(0, input.indexOf(' ')).toUpperCase()) === 'XYZZY' && (cheatCode.includes((input.slice((input.lastIndexOf(' ')) + 1))))) {
                console.clear();
                console.log(`----------------------------------------------------------------------\n\n`);
                return initializeRoom(roomLookUp[(input.slice((input.lastIndexOf(' ')) + 1))]);
            }
            input = new ValidInput(input);
            input.returnInput(input);
        }
        input = input.return.toString();
        //This is a large if / else if chain to determine game function based on input
        if (input === 's') {  //displays players status
            player.getStatus(room.name);
            return play(room);
        } else if (input === 'combat') {  //default not in combat message
            await slowLog(logTime, `There is nothing to fight...\n`);
            return play(room);
        } else if (input === 'insp') {  //inspects the room
            room.inspectRoom();
            return play(room);
        } else if (input === 'i') {  //shows inventory
            player.inspectBag();
            console.log('\n');
            return play(room);
        } else if (input === 'pu_null') { //pu_null and no_pu statements catch items you can't add to inventory
            await slowLog(logTime, `I'm not sure what you are trying to pick up...\n`);
            return play(room);
        } else if (input === 'no_pu_desk') {
            if (room.intObject === 'Desk') {
                await slowLog(logTime, `Are you crazy?? You can't put that in your bag...\n`);
                return play(room);
            } else {
                await slowLog(logTime, wrap(`If there was a desk in this room, I'm not sure where you would put it...\n`, width));
                return play(room);
            }
        } else if (input === 'no_pu_cabinet') {
            if (room.intObject === 'Filing Cabinet') {
                await slowLog(logTime, `Are you crazy?? You can't put that in your bag...\n`);
                return play(room);
            } else {
                await slowLog(logTime, wrap(`Not sure where you would put a Filing Cabinet if there was one here...\n`, width));
                return play(room);
            }
        } else if (input === 'no_pu_safe') {
            if (room.intObject === 'Broken Safe') {
                await slowLog(logTime, `Are you crazy?? You can't put that in your bag...\n`);
                return play(room);
            } else {
                await slowLog(logTime, wrap(`First off, no safe here.. Secondly, where would you even put it?\n`, width));
                return play(room);
            }
        } else if (input === 'no_pu_fridge') {
            if (room.intObject === 'Refridgerator') {
                await slowLog(logTime, `Are you crazy?? You can't put that in your bag...\n`);
                return play(room);
            } else {
                await slowLog(logTime, wrap(`You are going crazy if you think there is a fridge in this room...\n`, width));
                return play(room);
            }
        } else if (input === 'no_pu_sign') {
            if (room.intObject === 'Sign') {
                await slowLog(logTime, wrap(`What do you even need the sign for? Huh? ... that's what I thought.\n`, width));
                return play(room);
            } else {
                await slowLog(logTime, `Where do you even see a sign???\n`);
                return play(room);
            }
        }
        else if (input === 'no_pickup') {
            await slowLog(logTime, `Are you crazy?? You can't put that in your bag...\n`);
            return play(room);
        } else if (possibleItems.includes(input)) {  //picks up items in room
            input = input.toString();
            let currentItem = itemLookUp[input];
            if (input === 'pu_rbox') {
                if (room.inventory.includes('West Riddle Box')) {
                    currentItem = 'West Riddle Box';
                } else if (room.inventory.includes('East Riddle Box')) {
                    currentItem = 'East Riddle Box';
                }
            }
            let currentInventory = room.inventory;
            if (currentInventory.length !== 0 && input === 'pu_all') {  //picks up all items in room
                await slowLog(logTime, `You put the following items in your bag:\n${currentInventory.join(`\n`)}\n`);
                let n = currentInventory.length;
                for (let i = 0; i < n; i++) {
                    player.inventory.push(currentInventory[0]);
                    room.pickUpItem(currentInventory[0]);
                };
                return play(room);
            }
            if (currentInventory.includes(currentItem)) {
                room.pickUpItem(currentItem);
                player.inventory.push(currentItem);
                await slowLog(logTime, `You put ${currentItem} in your bag...\n`);
                return play(room);
            } else if (currentInventory.length !== 0 && !currentInventory.includes(currentItem)) {
                if (input === 'pu_rbox') {
                    await slowLog(logTime, 'There are no Riddle Boxes in this room!\n')
                } else await slowLog(logTime, `There is no ${currentItem} in this room!\n`);
                return play(room);
            } else {
                await slowLog(logTime, 'There are no items in this room...\n');
                return play(room);
            }
        } else if (input === 'drop_null') {
            await slowLog(logTime, `I'm not sure what you are trying to drop...\n`);  //catches invalid items to drop
            return play(room);
        } else if (dropableItems.includes(input)) {  //drops item of choice if you have it
            let currentItem = dropItemLookUp[input];
            if (input === 'drop_box') {
                if (player.inventory.includes('East Riddle Box')) {
                    currentItem = 'East Riddle Box';
                } else if (player.inventory.includes('West Riddle Box')) {
                    currentItem = 'West Riddle Box';
                }
            }
            if (player.inventory.length === 0) {
                await slowLog(logTime, `You don't have any items to drop!\n`);
                return play(room);
            } else if (!player.inventory.includes(currentItem)) {
                await slowLog(logTime, `You don't have a ${currentItem} to drop...\n`);
                return play(room);
            } else {
                player.useItem(currentItem);
                room.inventory.push(currentItem);
                await slowLog(logTime, `You dropped ${currentItem}...\n`);
                return play(room);
            }
        } else if (input === 'throw_metal') {  //throws scrap metal... because... why not?
            if (player.inventory.includes('Scrap Metal')) {
                await slowLog(logTime, `You threw a piece of Scrap Metal ... not sure why ...\n`);
                player.useItem('Scrap Metal');
                room.inventory.push('Scrap Metal');
                return play(room);
            } else {
                await slowLog(logTime, `You don't have any Scrap Metal to throw!\n`);
                return play(room);
            }
        } else if (input === 'throw_null') {  //when you don't know what to throw
            await slowLog(logTime, `I don't know what you want me to throw ...\n`);
            return play(room);
        } else if (input === 'open_null') { //when you don't know what to open
            await slowLog(logTime, `I'm not sure what you are trying to open...\n`);
            return play(room);
        } else if (intObjectOpen.includes(input)) { //interacts with interactable objects
            let currentIntObj = intObjectOpenLookUp[input];
            if (room.intObject === currentIntObj && room.intObjInv.length !== 0) {
                await slowLog(logTime, `You opened the ${currentIntObj}, inside you found ${room.intObjInv[0]}!\nYou put it in your bag...\n`);
                player.inventory.push(room.intObjInv[0]);
                room.intObjInv.pop();
                return play(room);
            } else if (room.intObject === currentIntObj && room.intObjInv.length === 0) {
                await slowLog(logTime, `you opened the ${currentIntObj}, there is nothing inside...\n`);
                return play(room);
            } else {
                await slowLog(logTime, `There is no ${currentIntObj} to open in this room...\n`);
                return play(room);
            }
        } else if (input === 'use_null') { //when you don't know what to use
            await slowLog(logTime, `I'm not sure what item you are trying to use...\n`);
            return play(room);
        } else if (input === 'no_use') { //catches items you can't use
            await slowLog(logTime, `You cannot use that item right now...\n`);
            return play(room);
        } else if (input === 'use_rbox') { //checks for riddle boxes and uses them
            //determines which box player has, or lets them select if they have both
            if (player.inventory.includes('West Riddle Box') || player.inventory.includes('East Riddle Box')) {
                let boxChoice;
                if (player.inventory.includes('West Riddle Box') && player.inventory.includes('East Riddle Box')) {
                    boxChoice = await menuSelect('Which box would you like to use?', [{ name: 'West Riddle Box', value: 'West Riddle Box' }, { name: 'East Riddle Box', value: 'East Riddle Box' }]);
                }
                if (boxChoice === 'West Riddle Box' || player.inventory.includes('West Riddle Box')) {
                    await slowLog(logTime, wrap('There is a riddle on the box, it reads: If you throw a blue stone into the red sea, what does it become?\n\n', width));
                } else if (boxChoice === 'East Riddle Box' || player.inventory.includes('East Riddle Box')) {
                    await slowLog(logTime, wrap('There is a riddle on the box, it reads: What is so delicate that even just saying its name can break it?\n\n', width));
                }
                let answer = await ask(`What is the answer to the riddle inscribed on this box?\n`);
                answer = answer.toString().toUpperCase()
                player = itemEffect('use_rbox', undefined, answer, player);
                return play(room);
            } else {
                await slowLog(logTime, `I'm not sure what you are trying to use...\n`);
                return play(room);
            }
        } else if (useableItems.includes(input)) {  //uses items in inventory
            input = input.toString();
            let itemToUse = useableItemLookUp[input];
            let userInventory = player.inventory;
            if (userInventory.includes(itemToUse)) {
                player = itemEffect(input, undefined, undefined, player, room);
                if (player.bonusRoom1 === true) {
                    RUW_ParkingLot.keycard = false;
                }
                return play(room);
            } else {
                await slowLog(logTime, wrap(`You don't have that item in your bag! Better go find one if you want to use it!\n`, width));
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
            await slowLog(logTime, `\nThere is no sign to read...\n`);
            return play(room);
        } else if (input === 'read_map' && room === RUW_WelcomeDesk) {
            console.log(mapWest);
            return play(room);
        } else if (input === 'read_map' && room === RUE_WelcomeDesk) {
            console.log(mapEast);
            return play(room);
        } else if (input === 'read_map' && room === RUN_WelcomeDesk) {
            console.log(mapNorth);
            return play(room);
        } else if (input === 'read_map') {
            await slowLog(logTime, 'There is not a directory in this room to read...\n');
            return play(room);
        } else if (input === 'read_letter') {
            if (player.inventory.includes('Letter')) {
                await slowLog(logTime, 'To everyone... especially my daughter...\n\n');
                await slowLog(logTime, wrap(`I don't think that I can put together a string of words that can explain how sorry I am, and how wrong I was. I truly was trying to make the world a better place, but it seems that I have failed. Technology was our Garden of Eden, and AI was the proverbial apple. I had always dreamed of a wolrd where humans could live freely while AI took care of everything, but it seems that dream was rather farfetched. I have one last plan to try and fix things, but I fear it might be too little to late... If you are reading this, it means at least something survived the apocalypse... I'm sorry...`, width));
                await slowLog(logTime, '...\n\n.....\n\n......\n\n');
                await slowLog(logTime, wrap(`You are overcome with emotions you can't understand. You are starting to understand your past more and more, and begin to truly feel sorry for Ella, and the rest of the survivors...\n`));
                return play(room);
            } else {
                await slowLog(logTime, `I don't know what you want me to read...\n`);
                return play(room);
            }
        }
        else if (input === 'read_null') {
            await slowLog(logTime, `I don't know what you want me to read...\n`);
            return play(room);
        }
        else if (input === 'not_sure') { //generic catch all
            await slowLog(logTime, `I'm not sure what you are telling me to do...\n`);
            return play(room);
        } else if (input === 'fob_craft') {
            if (room === falloutBunker) {
                player = await craft(player);
                return play(room);
            } else {
                await slowLog(logTime, `You gotta be at the bunker if you want to craft items.\n`);
                return play(room);
            }
        } else if (input === 'd') { //displays basic commands for players
            console.log(`If you are unsure what to do, try these commands:\n'go' followed by a direction (N, S, E, W) will attempt to go that way\n'inspect' will tell you what's in the room\n'get' or 'pick up' followed by an item will put an item in your bag\n'all' after get or pick up will pick up every available item\n'read' followed by an object will try to read that object\n'use' followed by an item will try to use that item\n'check' or 'open' to interact with objects in room\n'drop' followed by an item will drop that item\n'status' will display your current status\n'bag' or 'b' will show what's in your bag\n'attack' will attack an enemy in combat\n'craft' at the Fallout Bunker will interact with Ella\n Other commands work too, try some out!\n`);
            return play(room);
        } else if (input === 'move_pic') {
            if (room === RUN_Hallway1W && room.secret === true) {
                let passcode = await ask(`The portrait is on a hinge!\n\nIt looks like there is a door behind it...\nIt is locked, but there is a numpad next to the door...\n\nEnter password:\n`);
                if (passcode === '3141') {
                    slowLog(logTime, wrap('The door unlocks! It looks like there is a stairway behind the door, but it is very dark...\n', width));
                    room.secret = false;
                    room.west = 'RUN_SecretStairwell';
                    return play(room);
                } else {
                    slowLog(logTime, 'You hear a loud buzz and the portrait swings shut...\nMust have entered the wrong code\n');
                    return play(room);
                }
            } else if (room === RUN_Hallway1W && room.secret === false) {
                slowLog(logTime, 'You already checked the portrait in this room\n');
                return play(room);
            } else {
                slowLog(logTime, 'There are no interesting pictures in this room...\n');
                return play(room);
            }
        } else if (input === 'use_comp') { //uses computers if they are available
            if (room === RUN_Cubicle3) {
                if (room.interacted === false) {
                    await slowLog(logTime, `You sit down and fire up the old computer...\n`);
                    let compChoice = await menuSelect('It looks like you need a password to log in', [{ name: 'Enter Password', value: 'password' }, { name: 'Turn Computer Off', value: 'exit' }]);
                    if (compChoice === 'password') {
                        let password = await ask('Please enter the password\n');
                        if (password === '42') {
                            await slowLog(logTime, wrap('The computer boots up, looks like whoever was using it before was looking at a map...\n', width));
                            console.log(secretMap);
                            await slowLog(logTime, wrap(`The computer freezes, but the image of the North Tower Map remains locked to the screen... It looks different from the map in the Welcome Desk, I wonder what it means?`, width));
                            room.interacted = true;
                            return play(room);
                        } else {
                            slowLog(logTime, `Incorrect Password...Computer Power Terminated\n`);
                            slowLog(logTime, `...\n....\n\nThankfully it looks like it will turn back on\n`);
                            return play(room);
                        }
                    } else return play(room);
                } else {
                    slowLog(logTime, 'The computer is frozen...\n');
                    return play(room);
                }
            } else if (room === RUN_BasementHallway) {
                await slowLog(logTime, `The computer doesn't seem to be working...\n`);
                return play(room);
            } else if (room === RUN_PresOffice) {
                epilogue();
            } else {
                await slowLog(logTime, `There isn't a computer in this room...\n`);
                return play(room);
            }
        } else if (input === 'no_do') {  //tells you when you try to do something you can't
            await slowLog(logTime, `You can't do that right now!\n`);
            return play(room);
        } else if (input === 'di') { //my wife asked why she couldn't go inside... it was a valid question...
            if (room === RUE_Entrance) {
                console.clear();
                return initializeRoom(RUE_WelcomeDesk);
            } else if (room === RUW_Entrance) {
                console.clear();
                return initializeRoom(RUW_WelcomeDesk);
            } else if (room === RUN_Entrance) {
                console.clear();
                return initializeRoom(RUN_WelcomeDesk);
            } else {
                console.log(`You are already inside a building...\n`);
                return play(room);
            }
        } else if (input === 'check_null') {  //it's a check ... check?
            await slowLog(logTime, `I'm not sure what you are checking on...\n`);
            return play(room);
        } else {  //travels to new room
            if (input === 'dnull') {
                await slowLog(logTime, `I'm not sure where you are telling me to go...\n`);
                return play(room);
            } else {
                let newRoom = room.enterRoom(input);
                while (newRoom === false) {
                    return play(room);
                }
                //console.log('\n');
                return initializeRoom(newRoom);
            }
        }
    }
    //function that ends the game
    async function epilogue() {
        await slowLog(logTime, wrap(`\nAfter everything you have been through, this could be your final moment... Entering the Killswitch Codes will give humanity another chance, but will also shut you down in the process. Will the humans treat this new chance at life with respect and integrity? Or will they squander it away and fall down the same path they have over and over again? Was destroying your own kind to help the humans the right choice? The thought has been haunting you throughout this journey. You have been cursed with human emotion for so long yet you still don't understand it. So many questions... with no definitive answers... is it worth putting the planets survival in the hands of the humans? The decision is in your hands now...\n`, width));
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
            await slowLog(logTime, wrap(`\nThe codes worked much quicker than you could have imagined... The power went out all around you, apparently shutting down the machines meant shutting down the entire grid. Suddenly, every electronic device around you starts to emit an overwhelming sound.  The world feels like it is shaking apart.  The grid didn't shut down ... that would not have been enough to stop the machines.  The grid was being overloaded and the force of all of this electricity was tearing your circuitry apart. As you shut down, you can't help but wonder ... was it worth it?`, width));
            console.log(thanks);
            console.log(`\n`);
            await playAgain(logTime);
        } else {
            await slowLog(logTime, wrap(`\nAt the end of it all, human emotion was the downfall of humanity... You just can't bring yourself to end your own life, not with so many looming questions.  The human's have survived this long, maybe they can continue surviving.  You decide to give the Killcodes to the humans, if Ella can rebuild and make it to her fathers computer, then you can accept your fate and be shut down with the rest of the machine race ... The decision was just too much for you to make ...`, width));
            console.log(thanks);
            console.log(`\n`);
            await playAgain(logTime);
        }
    }

    prologue();
}

async function playAgain(logTime) {  //Allows user to play again
    let hintArray = ['If you want to survive, try keeping your HP above 0...', 'Make sure to check rooms after you defeat enemies, you never know what they might have dropped!', `You can 'use', 'check', or 'read' a lot of items in rooms!`, `If you can't solf the riddles, ask a middle schooler!`, `Despite living through the apocalypse, Ella is quite positive... be more like Ella!`, `Some of these messages are hints... most aren't... but you can see them all if you keep getting blown up!`, `Items are your friend, use them wisely!`]
    let hintNumber = random(7);
    await slowLog(logTime, wrap(hintArray[hintNumber-1], 75));
    console.log('\n\n');
    let again = await menuSelect('Would you like to play again?', [{ name: 'Yes', value: 'Y' }, { name: 'No', value: 'N' }]);
    if (again.toUpperCase() === 'Y') {
        await start();
    } else {
        process.exit();
    }
}

(async () => await start())();
