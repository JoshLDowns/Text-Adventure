import input from '@inquirer/input';
import select from '@inquirer/select';

//builds drop down menu for input selection
export async function menuSelect(listTitle, listObj) {
    let answer;
    answer = await select({
        message: listTitle,
        choices: listObj,
    });
    process.stdout.removeAllListeners();
    return answer;
}

//ask function for accepting input
export async function ask(question) {
    let answer;
    answer = await input({
        message: question,
    });
    if (answer === undefined) {
        answer = '';
    }
    process.stdout.removeAllListeners();
    return answer;
}

//called from fallout bunker, builds a menu of craftable items based on player inventory, and executes selection
export async function craft(user) {
    let metalCount = 0;
    for (let i = 0; i < user.inventory.length; i++) {
        if (user.inventory[i] === 'Scrap Metal') {
            metalCount = metalCount + 1;
        }
    }
    let useableInventory = [];
    if (user.inventory.includes('Missle Launcher') && metalCount >= 4) {
        useableInventory.push({ name: 'Missle Launcher: 4 Scrap Metal', value: 'Missle Launcher' });
    }
    if (user.inventory.includes('Combat Repair Module') && metalCount >= 6) {
        useableInventory.push({ name: 'Combat Repair Module: 6 Scrap Metal', value: 'Combat Repair Module' });
    }
    if (user.inventory.includes('Fission Cannon') && metalCount >= 8) {
        useableInventory.push({ name: 'Fission Cannon: 8 Scrap Metal', value: 'Fission Cannon' });
    }
    if (user.inventory.includes('Nuclear Fuel Cell') && metalCount >= 5) {
        useableInventory.push({ name: 'Nuclear Heat Ray.5 Scrap Metal', value: 'Nuclear Fuel Cell' });
    }
    if (user.inventory.includes('Office Keycard West') && user.inventory.includes('Office Keycard East') && !user.inventory.includes('North Tower Keycard')) {
        useableInventory.push({ name: 'North Tower Keycard', value: 'North Tower Keycard' });
    }
    if (user.inventory.includes('Regeneration Diode')) {
        useableInventory.push({ name: 'Regeneration Diode', value: 'Regeneration Diode'});
    }
    if (user.ability1 && user.inventory.includes('Smoke Bomb') && metalCount >=2) {
        useableInventory.push({ name: 'Missle Launcher Ammo.........2', value: 'launcherAmmo' });
    }
    if (user.ability2 && user.inventory.includes('Repair Kit') && metalCount >=2) {
        useableInventory.push({ name: 'Combat Repair Module Charge..2', value: 'repairCharge'});
    }
    if (user.ability3 && user.inventory.includes('Plasma Grenade') && metalCount >=2) {
        useableInventory.push({ name: 'Fission Cannon Ammo..........2', value: 'fissionAmmo'});
    }
    if (metalCount >= 3) {
        useableInventory.push({ name: 'Repair', value: 'Repair' });
    }
    useableInventory.push({name: 'Exit', value: 'exit'});

    if (useableInventory.length !== 1) {
        let item = await menuSelect('You can craft the following items:', useableInventory);
        if (item === 'Missle Launcher') {
            user.ability1 = item;
            user.ability1Supply = 2;
            user.ability1Damage = 20;
            user.ability1Modifier = 15;
            user.useItem('Missle Launcher');
            for (let i = 1; i <= 4; i++) {
                user.useItem('Scrap Metal');
            }
            console.log(`You now have the ability to use a Missle Launcher in combat!\nCongratulations! Now go blow some stuff up!\n`);
            return user;
        } else if (item === 'Combat Repair Module') {
            user.ability2 = item;
            user.ability2Supply = 4;
            user.ability2Base = 20;
            user.ability2Modifier = 20;
            user.useItem('Combat Repair Module');
            for (let i = 1; i <= 6; i++) {
                user.useItem('Scrap Metal');
            }
            console.log(`You now have the ability to use a Combat Repair Module!\nCongratulations! Now don't get yourself killed out there!\n`);
            return user;
        } else if (item === 'Fission Cannon') {
            user.ability3 = item;
            user.ability3Supply = 3;
            user.ability3Damage = 30;
            user.ability3Modifier = 15;
            user.useItem('Fission Cannon');
            for (let i = 1; i <= 8; i++) {
                user.useItem('Scrap Metal');
            }
            console.log(`You now have the ability to use a Fission Cannon in combat!\nCongratulations! This thing packs a punch!\n`);
            return user;
        } else if (item === 'Nuclear Fuel Cell') {
            user.useItem('Nuclear Fuel Cell');
            user.inventory.push('Nuclear Heat Ray');
            for (let i = 1; i <= 5; i++) {
                user.useItem('Scrap Metal');
            }
            console.log(`You put the Nuclear Heat Ray in your bag...\nIt only has one shot, use it wisely!`);
            return user;
        } else if (item === 'North Tower Keycard') {
            user.inventory.push('North Tower Keycard');
            console.log(`Ella was able to code a new keycard!\nYou now have access to the North Tower!\n`);
            return user;
        } else if (item === 'Repair') {
            user.health = user.health + 10;
            if (user.health > user.maxHealth) {
                user.health = user.maxHealth;
            }
            console.log(`You recovered 10 HP!  Your current HP is now ${user.health}\n`);
            for (let i = 1; i <= 3; i++) {
                user.useItem('Scrap Metal');
            }
            return user;
        } else if (item === 'Regeneration Diode') {
            user.diode = true;
            console.log(`You will now restore health over time!\n`);
            user.useItem('Regeneration Diode');
            return user;
        } else if (item === 'launcherAmmo') {
            user.useItem('Smoke Bomb');
            user.ability1Supply += 2;
            for (let i = 1; i <= 2; i++) {
                user.useItem('Scrap Metal');
            }
            console.log('You got 2 more missles for your Missle Launcher!\n');
            return user;
        } else if (item === 'repairCharge') {
            user.useItem('Repair Kit');
            user.ability2Supply += 2;
            for (let i = 1; i <= 2; i++) {
                user.useItem('Scrap Metal');
            }
            console.log('You got 2 more charges for your Combat Repair Module!\n');
            return user;
        } else if (item === 'fissionAmmo') {
            user.useItem('Plasma Grenade');
            user.ability3Supply += 2;
            for (let i = 1; i <= 2; i++) {
                user.useItem('Scrap Metal');
            }
            console.log('You got 2 more charges for your Fission Cannon!\n');
            return user;
        } else if (item === 'exit') {
            return user;
        }

    } else {
        console.log(`You don't have enough materials to craft anything!\n`);
        return user;
    }
}

//used in combat to decide which action to take
export async function combatChoice (user) {
    //builds list of possible choices to send to menuSelect
    let possibleChoices = [{name: `Particle Beam................∞`, value: 'combat'}];
    if (user.ability1 && user.ability1Supply > 0) {
        possibleChoices.push({name: `Missle Launcher..............${user.ability1Supply}`, value: 'Missle Launcher'});
    }
    if (user.ability2 && user.ability2Supply > 0) {
        possibleChoices.push({name: `Combat Repair Module.........${user.ability2Supply}`, value: 'Combat Repair Module'});
    }
    if (user.ability3 && user.ability3Supply > 0) {
        possibleChoices.push({name: `Fission Cannon...............${user.ability3Supply}`, value: 'Fission Cannon'});
    }
    possibleChoices.push({name: 'Use Item', value: 'Use Item'});

    let choice = await menuSelect(`What would you like to do?`, possibleChoices);
    //determines what to do with selection
    //if use item is chosen, builds another list of possible items to use and how much the player has of each
    if (choice === 'Use Item') {
        let possibleItems = [];
        if (user.inventory.includes('Repair Kit')) {
            let kitCount = 0;
            for (let i = 0; i < user.inventory.length; i++) {
                if (user.inventory[i] === 'Repair Kit') {
                    kitCount = kitCount + 1;
                }
            }
            possibleItems.push({name: `Repair Kit...................${kitCount}`, value: 'use_repairkit'});
        }
        if (user.inventory.includes('Plasma Grenade')) {
            let grenadeCount = 0;
            for (let i = 0; i < user.inventory.length; i++) {
                if (user.inventory[i] === 'Plasma Grenade') {
                    grenadeCount = grenadeCount + 1;
                }
            }
            possibleItems.push({name: `Plasma Grenade...............${grenadeCount}`, value: 'use_grenade'});
        }
        if (user.inventory.includes('Smoke Bomb')) {
            let bombCount = 0;
            for (let i = 0; i < user.inventory.length; i++) {
                if (user.inventory[i] === 'Smoke Bomb') {
                    bombCount = bombCount + 1;
                }
            }
            possibleItems.push({name: `Smoke Bomb...................${bombCount}`, value: 'use_bomb'});
        }
        if (user.inventory.includes('Portable Shield')) {
            let shieldCount = 0;
            for (let i = 0; i < user.inventory.length; i++) {
                if (user.inventory[i] === 'Portable Shield') {
                    shieldCount = shieldCount + 1;
                }
            }
            possibleItems.push({name: `Portable Shield..............${shieldCount}`, value: 'use_shield'});
        }
        if (user.inventory.includes('Nuclear Heat Ray')) {
            let rayCount = 0;
            for (let i = 0; i < user.inventory.length; i++) {
                if (user.inventory[i] === 'Nuclear Heat Ray') {
                    rayCount = rayCount + 1;
                }
            }
            possibleItems.push({name: `Nuclear Heat Ray.............${rayCount}`, value: 'use_heatray'});
        }
        if (user.inventory.includes('EMP')) {
            possibleItems.push({name: 'EMP..........................1', value: 'use_emp'});
        }
        possibleItems.push({name: 'Back to Combat', value: 'back'})

        let itemChoice = await menuSelect('What Item would you like to use?', possibleItems);
        
        if (itemChoice === 'back') {
            return combatChoice(user);
        } else {
            choice = itemChoice;
        }
    }
    return choice;
}
