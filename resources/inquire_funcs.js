import input from '@inquirer/input';
import select from '@inquirer/select';

export async function menuSelect(listTitle, listObj) {
    let answer;
    answer = await select({
        message: listTitle,
        choices: listObj,
    });
    return answer;
}

export async function ask(question) {
    let answer;
    answer = await input({
        message: question,
    });
    if (answer === undefined) {
        answer = '';
    }
    //   console.log(process.stdin.eventNames())
    //   console.log(process.stdout.eventNames())
    //   console.log(process.stdin.listenerCount('end'))
    //   console.log(process.stdin.listenerCount('pause'))
    //   console.log(process.stdin.listenerCount('data'))
    //   console.log(process.stdout.listenerCount('end'))
    //   console.log(process.stdout.listenerCount('drain'))
    //   console.log(process.stdout.listenerCount('error'))
    //   console.log(process.stdout.listenerCount('close'))
    process.stdout.removeAllListeners();
    console.log(answer)
    return answer;
}

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
        useableInventory.push({ name: 'Nuclear Fuel Cell: 5 Scrap Metal', value: 'Nuclear Fuel Cell' });
    }
    if (user.inventory.includes('Office Keycard West') && user.inventory.includes('Office Keycard East') && !user.inventory.includes('Office Keycard North')) {
        useableInventory.push({ name: 'Office Keycard North', value: 'Office Keycard North' })
    }
    if (metalCount >= 3) {
        useableInventory.push({ name: 'Repair', value: 'Repair' })
    }

    if (useableInventory.length !== 0) {
        let item = await menuSelect('You can craft the following items:', useableInventory);
        if (item === 'Missle Launcher') {
            user.ability1 = item;
            user.ability1Supply = 2;
            user.ability1Damage = 15;
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
            user.ability2Base = 10;
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
            user.ability3Base = 20;
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
        } else if (item === 'Office Keycard North') {
            user.inventory.push('Office Keycard North');
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
        }

    } else {
        console.log(`You don't have enough materials to craft anything!\n`);
        return user;
    }
}

export async function combatChoice (user) {
    //builds list of possible choices to send to menuSelect
    let possibleChoices = [{name: `Particle Beam................∞`, value: 'Particle Beam'}];
    if (user.ability1) {
        possibleChoices.push({name: `Missle Launcher..............${user.ability1Supply}`, value: 'Missle Launcher'});
    }
    if (user.ability2) {
        possibleChoices.push({name: `Combat Repair Module.........${user.ability2Supply}`, value: 'Combat Repair Module'});
    }
    if (user.ability3) {
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
            possibleItems.push({name: `Repair Kit...................${kitCount}`, value: 'Repair Kit'});
        }
        if (user.inventory.inventory('Plasma Grenade')) {
            let grenadeCount = 0;
            for (let i = 0; i < user.inventory.length; i++) {
                if (user.inventory[i] === 'Plasma Grenade') {
                    grenadeCount = grenadeCount + 1;
                }
            }
            possibleItems.push({name: `Plasma Grenade...............${grenadeCount}`, value: 'Plasma Grenade'});
        }
        if (user.inventory.includes('Smoke Bomb')) {
            let bombCount = 0;
            for (let i = 0; i < user.inventory.length; i++) {
                if (user.inventory[i] === 'Smoke Bomb') {
                    bombCount = bombCount + 1;
                }
            }
            possibleItems.push({name: `Smoke Bomb...................${bombCount}`, value: 'Smoke Bomb'});
        }
        if (user.inventory.includes('Portable Shield')) {
            let shieldCount = 0;
            for (let i = 0; i < user.inventory.length; i++) {
                if (user.inventory[i] === 'Portable Shield') {
                    shieldCount = shieldCount + 1;
                }
            }
            possibleItems.push({name: `Portable Shield..............${shieldCount}`, value: 'Portable Shield'});
        }
        if (user.inventory.includes('Nuclear Heat Ray')) {
            possibleItems.push({name: 'Nuclear Heat Ray.............1', value: 'Nuclear Heat Ray'})
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
