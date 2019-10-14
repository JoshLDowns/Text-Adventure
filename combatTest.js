const readline = require('readline');
const rl = readline.createInterface(process.stdin, process.stdout);

function ask(questionText) {
    return new Promise((resolve, reject) => {
        rl.question(questionText, resolve);
    });
}

let player = {
    health: 50,
    inventory: ['Repair Kit', 'Repair Kit'],
    ability: 'Particle Beam',
    damageBase: 5,
    damageModifier: 4,
    useRepairKit: function () {
        for (var i = 0; i < this.inventory.length; i++) {
            if (this.inventory[i] === 'Repair Kit') {
                this.inventory.splice(i, 1);
            }
        }
    }
}

let enemy = {
    name: 'Robot Sentry',
    health: 50,
    ability: 'Plasma Ray',
    damageBase: 3,
    damageModifier: 6
}

async function combat(user, comp) {
    let damageUser = 0;
    let damageComp = 0;
    while (user.health > 0 || comp.health > 0) {
        let choice = await ask('Would you like to (1) Attack, (2) Use item?\n');
        if (choice === '1') {
            damageUser = user.damageBase + Math.floor(Math.random() * (user.damageModifier) + 1);
            console.log(`You fired your ${user.ability}!  It dealt ${damageUser} damage!`);
            comp.health = comp.health - damageUser;
            if (comp.health <= 0) {
                console.log(`You have defeated ${comp.name}, congratulations!`);
                process.exit();
            }
        } else {
            if (user.inventory.length !== 0) {
                let itemChoice = await ask(`You have ${user.inventory.length} Repair Kits to use, would you like to use one?\n`);
                if (itemChoice === 'y') {
                    user.useRepairKit();
                    user.health = user.health + 10;
                    if (user.health > 50) {
                        user.health = 50;
                    }
                    console.log(`Your health has been restored!  You currently have ${user.health} HP!`);
                } else {
                    console.log('You have chosen not to use an item ... ATTACK!');
                    damageUser = user.damageBase + Math.floor(Math.random() * (user.damageModifier) + 1);
                    console.log(`You fired your ${user.ability}!  It dealt ${damageUser} damage!`);
                    comp.health = comp.health - damageUser;
                    if (comp.health <= 0) {
                        console.log(`You have defeated ${comp.name}, congratulations!`);
                        process.exit();
                    }
                }
            } else {
                console.log('You do not have any items ... ATTACK!');
                damageUser = user.damageBase + Math.floor(Math.random() * (user.damageModifier) + 1);
                console.log(`You fired your ${user.ability}!  It dealt ${damageUser} damage!`);
                comp.health = comp.health - damageUser;
                if (comp.health <= 0) {
                    console.log(`You have defeated ${comp.name}, congratulations!`);
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
            console.log(`Your currently have ${user.health} HP!`);
        }
    }
}

combat(player, enemy);