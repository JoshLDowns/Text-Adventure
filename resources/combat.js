import { wrap, random, itemEffect, wait } from './functions.js'
import { combatChoice } from './inquire_funcs.js'
import chalk from 'chalk'

//defines width for wrap function
let width = process.stdout.columns - 8;

//combat function
export async function combat(comp, user) {
    let damageUser = 0;
    let healAmount = 0;
    let damageComp = 0;
    let criticalHit;
    let miss;
    let compAbility;
    let statusCount;
    let shieldHP = 0;
    user.status = undefined;

    function statusBar() {
        let playerBarCount = (Math.ceil((user.health / user.maxHealth).toPrecision(2) * 10)) * 2;
        let playerBar = chalk.blue('((') + chalk.greenBright('█').repeat(playerBarCount) + chalk.greenBright('-').repeat(20 - playerBarCount) + chalk.blue('))');
        let compBarCount = (Math.ceil((comp.health / comp.maxHealth).toPrecision(2) * 10)) * 2;
        let compBar = chalk.blue('((') + chalk.redBright('█').repeat(compBarCount) + chalk.redBright('-').repeat(20 - compBarCount) + chalk.blue('))');

        console.log(`╔════════════════════════════════════════════════════════════════════╗`);
        console.log(`║${playerBar}         ` + chalk.yellowBright(`VS`) + `         ${compBar}║`);
        console.log(`║ ${user.name + ` `.repeat(28 - user.name.length) + `         ` + ` `.repeat(28 - comp.name.length)} ${comp.name} ║`);
        console.log(`╚════════════════════════════════════════════════════════════════════╝\n\n`);
    }

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
        statusBar();

        user.status2 = undefined; //emergency reset to status in case it gets skipped (happened once, can't figure out why still...)
        if (user.status === 'status_stun') {
            console.log('...\n');
            await wait(500);
            console.log('......\n');
            await wait(750);
            console.log('.........\n');
            await wait(1000);
            user = statusCheck(comp, user);
            if (user === false) {
                return [false];
            }
        } else {
            if (user.status === 'status_dot') {
                user = statusCheck(comp, user);
                if (user === false) {
                    return [false];
                }
                if (statusCount !== 0) {
                    statusCount = statusCount - 1
                    if (statusCount === 0) {
                        user.status = undefined;
                        console.log(`${comp.name}'s ${comp.ability} is no longer active!\n`);
                    }
                }
            }

            let input = await combatChoice(user);

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
            } else if (input === 'Missle Launcher') {
                criticalHit = random(5);
                miss = random(5);
                damageUser = user.ability1Damage + random(user.ability1Modifier);  //damage + modifier (like dice roll)
                if (miss === 5) {
                    console.log(`Your Missle Launcher missed!\n`)
                } else if (criticalHit === 5) {
                    damageUser = damageUser + (Math.ceil(user.ability1Damage * .75));
                    console.log(`You fired your Missle Launcher!  It was a Critical Hit!!\nIt dealt ${damageUser} damage!\n`);
                    comp.health = comp.health - damageUser;
                    if (comp.health <= 0) {
                        user.ability1Supply = user.ability1Supply - 1;
                        return victoryText();
                    }
                } else {
                    console.log(`You fired your Missle Launcher!  It dealt ${damageUser} damage!\n`);
                    comp.health = comp.health - damageUser;
                    if (comp.health <= 0) {
                        user.ability1Supply = user.ability1Supply - 1;
                        return victoryText();
                    }
                }
                user.ability1Supply = user.ability1Supply - 1;
            } else if (input === 'Combat Repair Module') {
                criticalHit = random(5);
                healAmount = user.ability2Base + random(user.ability2Modifier);  //heal + modifier (like dice roll)
                if (criticalHit === 5) {
                    healAmount = healAmount + (Math.ceil(user.ability2Base * .75));
                    console.log(`You used your Combat Repair!  It was a Critical Heal!!\nIt restored ${healAmount} HP!\n`);
                    user.health = user.health + healAmount;
                    if (user.health > user.maxHealth) {
                        user.health = user.maxHealth;
                    }
                } else {
                    console.log(`You used your Combat Repair!  It restored ${healAmount} HP!\n`);
                    user.health = user.health + healAmount;
                    if (user.health > user.maxHealth) {
                        user.health = user.maxHealth;
                    }
                }
                user.ability2Supply = user.ability2Supply - 1;
            } else if (input === 'Fission Cannon') {
                criticalHit = random(5);
                miss = random(5);
                damageUser = user.ability3Damage + random(user.ability3Modifier);  //damage + modifier (like dice roll)
                if (miss === 5) {
                    console.log(`Your Fission Cannon missed!\n`)
                } else if (criticalHit === 5) {
                    damageUser = damageUser + (Math.ceil(user.ability3Damage * .75));
                    console.log(`You fired your Fission Cannon!  It was a Critical Hit!!\nIt dealt ${damageUser} damage!\n`);
                    comp.health = comp.health - damageUser;
                    if (comp.health <= 0) {
                        user.ability3Supply = user.ability3Supply - 1;
                        return victoryText();
                    }
                } else {
                    console.log(`You fired your Fission Cannon!  It dealt ${damageUser} damage!\n`);
                    comp.health = comp.health - damageUser;
                    if (comp.health <= 0) {
                        user.ability3Supply = user.ability3Supply - 1;
                        return victoryText();
                    }
                }
                user.ability3Supply = user.ability3Supply - 1;
            } else if (input === 'use_repairkit') {
                user = itemEffect(input, comp, undefined, user);
            } else if (input === 'use_shield') {
                user = itemEffect(input, comp, undefined, user);
                if (user.status2 === 'shield') {
                    shieldHP = 30;
                    user.status2 = undefined;
                }
            } else if (input === 'use_bomb') {
                user = itemEffect(input, comp, undefined, user);
            } else if (input === 'use_grenade') {
                user = itemEffect(input, comp, undefined, user);
                if (comp.health <= 0) {
                    return victoryText();
                }
            } else if (input === 'use_heatray') {
                user = itemEffect(input, comp, undefined, user);
                if (comp.health <= 0) {
                    return victoryText();
                }
            }
        }
        await wait(1000);
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
            let afterAbility = useCompAbility(comp, user);
            if (afterAbility === false) {
                return [false];
            } else {
                user = afterAbility;
                if (statusCount !== 0 && user.status === 'status_dot') {
                    statusCount = random(4);
                }
            }
        }
        await wait(2000);
        console.clear();
    }

    //status checking function for combat
    function statusCheck(comp, player) {
        if (player.status === 'status_stun') {
            console.log(`You are still stunned!\n`)
            player.status = undefined;
            return player;
        } else if (player.status === 'status_dot') {
            let dotDamage = comp.abilityBase + random(comp.abilityModifier);
            console.log(wrap(`The ${comp.ability} is still active! It dealt ${dotDamage} damage!\n`, width));
            player.health = player.health - dotDamage;
            if (player.health <= 0) {
                return false;
            } else {
                console.log(`Your currently have ${player.health} HP!\n`);
                return player;
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
                    return false;
                } else {
                    console.log(`Your currently have ${player.health} HP!\n`);
                    player.status = 'status_stun';
                    return player;
                }
            } else {
                console.log(`${comp.name} used ${comp.ability} ... it failed!\n`);
                player.status = undefined;
                return player;
            }
        } else if (comp.abilityType === 'offensive') {
            let miss = random(5);
            if (miss !== 5) {
                let abilityDamage = comp.abilityBase + random(comp.abilityModifier);
                console.log(wrap(`${comp.name} used ${comp.ability}, it dealt ${abilityDamage} damage!\n`, width));
                player.health = player.health - abilityDamage;
                if (player.health <= 0) {
                    return false;
                } else {
                    console.log(`Your currently have ${player.health} HP!\n`);
                    return player;
                }
            } else {
                console.log(`${comp.name} used ${comp.ability} ... it missed!\n`);
                return player;
            }
        } else if (comp.abilityType === 'status_dot') {
            let dotChance = random(5);
            if (dotChance !== 5 && player.status !== 'status_dot') {
                player.status = 'status_dot';
                console.log(wrap(`${comp.name} used ${comp.ability} ... it plants a remote laser on the ground!\n`, width));
                return player;
            } else if (dotChance === 5 && player.status === 'status_dot') {
                console.log(wrap(`${comp.name} used ${comp.ability} ... it already has an active remote laser!\n`, width));
                return player;
            } else {
                console.log(`${comp.name} used ${comp.ability} ... it failed!\n`);
                player.status = undefined;
                return player;
            }
        } else if (comp.abilityType === 'defensive') {
            let totalHeal = comp.abilityBase + random(comp.abilityModifier);
            comp.health = comp.health + totalHeal;
            if (comp.health > comp.maxHealth) {
                comp.health = comp.maxHealth;
            }
            console.log(`${comp.name} used ${comp.ability} ... it restored ${totalHeal} HP!\n`)
            return player;
        }
    }
}