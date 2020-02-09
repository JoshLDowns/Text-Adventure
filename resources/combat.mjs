import { ValidInput } from './inputValidation.mjs'
import { ask, wrap, random } from './functions.mjs'

let width = process.stdout.columns - 8;

let useableItems = ['use_particlebattery', 'use_carboncoating', 'use_rbox', 'use_repairkit', 'use_grenade', 'use_shield', 'use_bomb', 'use_heatray'];

//useable item lookup object
let useableItemLookUp = {
    use_repairkit: 'Repair Kit',
    use_particlebattery: 'Particle Battery',
    use_carboncoating: 'Thick Carbon Coating',
    use_grenade: 'Plasma Grenade',
    use_shield: 'Portable Shield',
    use_bomb: 'Smoke Bomb',
    use_heatray: 'Nuclear Heat Ray',
    use_rbox: ['West Riddle Box', 'East Riddle Box']
}

export async function combat(comp, user) {
    let damageUser = 0;
    let damageComp = 0;
    let criticalHit;
    let miss;
    let compAbility;
    let statusCount;
    let shieldHP = 0;
    user.status = undefined;

    //displays text on user victory (there were 5 victory conditions so I used this to save some code)
    function victoryText() {
        console.log(`You have defeated ${comp.name}, congratulations!`);
        console.log(`You received ${comp.reward} for winning!\n`);
        console.log(`----------------------------------------------------------------------\n`);
        user.inventory.push(comp.reward);
        return [true, user];
    }

    while (user.health > 0 || comp.health > 0) {  //Loop that breaks when either user or computer hits 0 or less HP
        //user Turn
        user.status2 = undefined; //emergency reset to status in case it gets skipped (happened once, can't figure out why still...)
        if (user.status === 'status_stun') {
            statusCheck(comp, user);
        } else {
            if (user.status === 'status_dot') {
                statusCheck(comp, user);
                if (statusCount !== 0) {
                    statusCount = statusCount - 1
                    if (statusCount === 0) {
                        user.status = undefined;
                        console.log(`${comp.name}'s ${comp.ability} is no longer active!\n`);
                    }
                }
            }
            let input = await ask(wrap(`What would you like to do? (Try things like 'attack' or use an item!)\n`, width));
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
                damageUser = user.damageBase + random(user.damageModifier);  //damage + modifier (like dice roll)
                if (miss === 5) {
                    console.log(`Your ${user.attack} missed!\n`)
                } else if (criticalHit === 5) {
                    damageUser = damageUser + (Math.ceil(user.damageBase * .75));
                    console.log(`You fired your ${user.attack}!  It was a Critical Hit!!\nIt dealt ${damageUser} damage!\n`);
                    comp.health = comp.health - damageUser;
                    if (comp.health <= 0) {
                        return victoryText();
                    }
                } else {
                    console.log(`You fired your ${user.attack}!  It dealt ${damageUser} damage!\n`);
                    comp.health = comp.health - damageUser;
                    if (comp.health <= 0) {
                        return victoryText();
                    }
                }
            } else if (input === 'throw_metal') {
                if (user.inventory.includes('Scrap Metal')) {
                    console.log(wrap(`You threw a piece of Scrap Metal at ${comp.name} ... it did nothing ...\n`, width));
                    user.useItem('Scrap Metal');
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
                let userInventory = user.inventory;
                if (userInventory.includes(itemToUse) && input !== 'use_rbox') {
                    itemEffect(input, comp, undefined, user);
                    if (user.status2 === 'shield') {
                        shieldHP = 30;
                        user.status2 = undefined;
                    }
                } else {
                    console.log(wrap(`You don't have that item in your bag! Better go find one if you want to use it!\n`));
                }
                if (comp.health <= 0) {
                    return victoryText();
                }
            } else {
                console.log('Now is not the time or place for that! ... ATTACK!\n');
                criticalHit = random(5);
                miss = random(5);
                damageUser = user.damageBase + random(user.damageModifier);  //damage + modifier (like dice roll)
                if (miss === 5) {
                    console.log(`Your ${user.attack} missed!`)
                } else if (criticalHit === 5) {
                    damageUser = damageUser + (Math.ceil(user.damageBase * .75));
                    console.log(`You fired your ${user.attack}!  It was a Critical Hit!!\nIt dealt ${damageUser} damage!\n`);
                    comp.health = comp.health - damageUser;
                    if (comp.health <= 0) {
                        return victoryText();
                    }
                } else {
                    console.log(`You fired your ${user.attack}!  It dealt ${damageUser} damage!\n`);
                    comp.health = comp.health - damageUser;
                    if (comp.health <= 0) {
                        return victoryText();
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
                        console.log(wrap(`Your shield absorbed the damage... but was destroyed in the process\n`, width));
                    } else {
                        console.log(`Your shield absorbed the damage!\n`);
                    }
                } else {
                    user.health = user.health - damageComp;
                    if (user.health <= 0) {
                        return [false];
                    } else {
                        console.log(`Your currently have ${user.health} HP!\n`);
                    }
                }
            } else {
                console.log(`${comp.name} fired a ${comp.attack}, it dealt ${damageComp} damage!\n`);
                if (shieldHP > 0) {
                    shieldHP = shieldHP - damageComp;
                    if (shieldHP <= 0) {
                        console.log(wrap(`Your shield absorbed the damage... but was destroyed in the process\n`, width));
                    } else {
                        console.log(`Your shield absorbed the damage!\n`);
                    }
                } else {
                    user.health = user.health - damageComp;
                    if (user.health <= 0) {
                        return [false];
                    } else {
                        console.log(`Your currently have ${user.health} HP!\n`);
                    }
                }
            }
        } else {
            useCompAbility(comp, user);
            if (statusCount !== 0 && user.status === 'status_dot') {
                statusCount = random(4);
            }
        }
    }
}

function itemEffect(item, comp, answer, player) {
    if (item === 'use_repairkit') {
        player.useItem(useableItemLookUp[item]);
        player.health = player.health + 30;
        if (player.health > player.maxHealth) {
            player.health = player.maxHealth;
        }
        player.status2 = undefined;
        return console.log(wrap(`Your health has been restored!  You currently have ${player.health} HP!\n`, width));
    } else if (item === 'use_particlebattery') {
        player.useItem(useableItemLookUp[item]);
        player.damageBase = player.damageBase + 2;
        return console.log(wrap(`You have upgraded your Particle Beam!  It now hits harder than ever!\n`, width));
    } else if (item === 'use_carboncoating') {
        player.useItem(useableItemLookUp[item]);
        player.maxHealth = player.maxHealth + 10;
        player.health = player.health + 10;
        return console.log(`You have increased your maximum HP by 10 points!\n`);
    } else if (item === 'use_grenade') {
        player.useItem(useableItemLookUp[item]);
        if (comp !== undefined) {
            comp.health = comp.health - 20;
            return console.log(`You threw a Plasma Grenade! It dealt 20 damage to ${comp.name}!\n`);
        } else {
            return console.log(wrap(`You throw a Plasma Grenade! The blast was impressive, but would have been more useful in a fight...\n`, width));
        }
    } else if (item === 'use_shield') {
        player.useItem(useableItemLookUp[item]);
        if (comp !== undefined) {
            player.status2 = 'shield';
            return console.log(`You generate a temporary shield that can absorb damage!\n`);
        } else {
            return console.log(wrap(`You generate a temporary shield! Too bad you aren't being attacked...\n`, width));
        }
    } else if (item === 'use_bomb') {
        player.useItem(useableItemLookUp[item]);
        if (comp !== undefined) {
            comp.status = 'smoke';
            return console.log(wrap(`You throw a Smoke Bomb! It will be harder for ${comp.name} to hit you!\n`, width));
        } else {
            return console.log(`You throw a Smoke Bomb! Gee golly that was exciting!\n`);
        }
    } else if (item === 'use_rbox' && player.inventory.includes('West Riddle Box')) {
        if (answer === 'WET') {
            player.useItem(useableItemLookUp[item[0]]);
            player.inventory.push('Office Keycard West');
            return console.log('You solved the riddle!  There was a Keycard to the West tower inside!\n');
        } else {
            return console.log(`That's a tough riddle, gonna have to think about that one...\n`);
        }
    } else if (item === 'use_rbox' && player.inventory.includes('East Riddle Box')) {
        if (answer === 'SILENCE') {
            player.useItem(useableItemLookUp[item[1]]);
            player.inventory.push('Office Keycard East');
            return console.log('You solved the riddle!  There was a Keycard to the East tower inside!\n');
        } else {
            return console.log(`That's a tough riddle, gonna have to think about that one...\n`);
        }
    } else if (item === 'use_heatray') {
        player.useItem(useableItemLookUp[item]);
        if (comp !== undefined) {
            comp.health = comp.health - 40;
            return console.log(wrap(`You fired the Nuclear Heat Ray! It dealt 40 damage to ${comp.name}!\n`, width));
        } else {
            return console.log(wrap(`You fired the Nuclear Heat Ray! That hole in the wall would have been more impressive if it was through a robot instead...\n`, width));
        }
    } else {
        return console.log(wrap(`You can't use that item!!!`, width));
    }
}

//status checking function for combat
function statusCheck(comp, player) {
    if (player.status === 'status_stun') {
        console.log(`You are still stunned!\n`)
        return player.status = undefined;
    } else if (player.status === 'status_dot') {
        let dotDamage = comp.abilityBase + random(comp.abilityModifier);
        console.log(wrap(`The ${comp.ability} is still active! It dealt ${dotDamage} damage!\n`, width));
        player.health = player.health - dotDamage;
        if (player.health <= 0) {
            console.log('You have been defeated! Better luck next time!\n');
            console.log(gameOverText);
            playAgain();
        } else {
            return console.log(`Your currently have ${player.health} HP!\n`);
        }
    }
}

//called in combat when conditions are met, determines the enemy ability and its effect
function useCompAbility(comp, player) {
    if (comp.abilityType === 'status_stun') {
        let stunChance = random(5);
        if (stunChance !== 1) {
            console.log(`${comp.name} used ${comp.ability}! It dealt 10 damage!\nYou are stunned from the attack!\n`);
            player.health = player.health - 10;
            if (player.health <= 0) {
                console.log('You have been defeated! Better luck next time!');
                console.log(gameOverText);
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
            console.log(wrap(`${comp.name} used ${comp.ability}, it dealt ${abilityDamage} damage!\n`, width));
            player.health = player.health - abilityDamage;
            if (player.health <= 0) {
                console.log('You have been defeated! Better luck next time!');
                console.log(gameOverText);
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
            return console.log(wrap(`${comp.name} used ${comp.ability} ... it plants a remote laser on the ground!\n`, width));
        } else if (dotChance === 5 && player.status === 'status_dot') {
            return console.log(wrap(`${comp.name} used ${comp.ability} ... it already has an active remote laser!\n`, width));
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