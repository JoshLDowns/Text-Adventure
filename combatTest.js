const readline = require('readline');
const rl = readline.createInterface(process.stdin, process.stdout);

function ask(questionText) {
    return new Promise((resolve, reject) => {
        rl.question(questionText, resolve);
    });
}

let player = {
    health: 50,
    inventory: ['Repair Kit', 'Room Key', 'Repair Kit'],
    ability: 'Particle Beam',
    damageBase: 5,
    damageModifier: 4,
    useRepairKit: function () {
        for (var i = 0; i < this.inventory.length; i++) {
            if (this.inventory[i] === 'Repair Kit') {
                this.inventory.splice(i, 1);
                break;
            }
        }
    }
}

let enemy = {
    name: 'Robot Sentry',
    health: 35,
    ability: 'Plasma Ray',
    damageBase: 6,
    damageModifier: 6,
    reward : 'Metal Scraps'
}

async function combat(user, comp) {
    let damageUser = 0;
    let damageComp = 0;
    let userMaxHealth = user.health;

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
                process.exit();
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
                    user.useRepairKit();  //removes a Repair Kit from inventory if you used one
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
                        process.exit();
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
                    process.exit();
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

combat(player, enemy);