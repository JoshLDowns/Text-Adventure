import { ask, menuSelect } from './inquire_funcs.js'
import chalk from 'chalk'

let width = process.stdout.columns - 8;

let useableItemLookUp = {
    use_repairkit: 'Repair Kit',
    use_particlebattery: 'Particle Battery',
    use_carboncoating: 'Thick Carbon Coating',
    use_grenade: 'Plasma Grenade',
    use_shield: 'Portable Shield',
    use_bomb: 'Smoke Bomb',
    use_heatray: 'Nuclear Heat Ray',
    use_rbox: ['West Riddle Box', 'East Riddle Box'],
    use_emp: 'EMP',
    use_chest: 'Large Chest',
    use_plating: 'Graphene Plating'
}

//text wrapping function, accepts string and width(w) and wraps text accordingly
export function wrap(string, w) {
    if (string.length <= w) {
        return string;
    }

    let count = 1;
    let tempString = '';
    let sliceNum = 0;

    while (string.length > (count * w)) {
        tempString = string.slice(sliceNum, (count * w) - 1);
        sliceNum = tempString.lastIndexOf(' ') + sliceNum;
        string = string.slice(0, sliceNum) + `\n` + string.slice(sliceNum + 1)
        sliceNum += 1;
        count += 1;
    }

    return string;
}

//random number generator
export function random(max) {
    return Math.floor(Math.random() * max) + 1;
}

//determines effect of items being used by player (user)
export function itemEffect(item, comp, answer, user, room) {
    if (item === 'use_repairkit') {
        user.useItem(useableItemLookUp[item]);
        user.health = user.health + 30;
        if (user.health > user.maxHealth) {
            user.health = user.maxHealth;
        }
        user.status2 = undefined;
        console.log(wrap(`Your health has been restored!  You currently have ${user.health} HP!\n`, width));
        return user;
    } else if (item === 'use_particlebattery') {
        user.useItem(useableItemLookUp[item]);
        user.damageBase = user.damageBase + 2;
        console.log(wrap(`You have upgraded your Particle Beam!  It now hits harder than ever!\n`, width));
        return user;
    } else if (item === 'use_carboncoating') {
        user.useItem(useableItemLookUp[item]);
        user.maxHealth = user.maxHealth + 10;
        user.health = user.health + 10;
        console.log(`You have increased your maximum HP by 10 points!\n`);
        return user;
    } else if (item === 'use_plating') {
        user.useItem(useableItemLookUp[item]);
        user.maxHealth = user.maxHealth + 30;
        user.health = user.health + 30;
        console.log(`You have increased your maximum HP by 30 points!\n`);
        return user;
    } else if (item === 'use_grenade') {
        user.useItem(useableItemLookUp[item]);
        if (comp !== undefined) {
            comp.health = comp.health - 20;
            console.log(`You threw a Plasma Grenade! It dealt 20 damage to ${comp.name}!\n`);
            return user;
        } else if (room.name = 'Hallway 1S - W') {
            console.log(wrap(`You throw a Plasma Grenade at the door! The blast leaves a sizeable hole in the wall that fills the room with sunlight...`, width));
            user.bonusRoom1 = true;
            return user;
        } else {
            console.log(wrap(`You throw a Plasma Grenade! The blast was impressive, but would have been more useful in a fight...\n`, width));
            return user;
        }
    } else if (item === 'use_shield') {
        user.useItem(useableItemLookUp[item]);
        if (comp !== undefined) {
            user.status2 = 'shield';
            console.log(`You generate a temporary shield that can absorb damage!\n`);
            return user;
        } else {
            console.log(wrap(`You generate a temporary shield! Too bad you aren't being attacked...\n`, width));
            return user;
        }
    } else if (item === 'use_bomb') {
        user.useItem(useableItemLookUp[item]);
        if (comp !== undefined) {
            comp.status = 'smoke';
            console.log(wrap(`You throw a Smoke Bomb! It will be harder for ${comp.name} to hit you!\n`, width));
            return user;
        } else {
            console.log(`You throw a Smoke Bomb! Gee golly that was exciting!\n`);
            return user;
        }
    } else if (item === 'use_rbox' && user.inventory.includes('West Riddle Box')) {
        if (answer === 'WET') {
            user.useItem(useableItemLookUp[item][0]);
            user.inventory.push('Office Keycard West');
            console.log('You solved the riddle!  There was a Keycard to the West tower inside!\n');
            return user;
        } else {
            console.log(`That's a tough riddle, gonna have to think about that one...\n`);
            return user;
        }
    } else if (item === 'use_rbox' && user.inventory.includes('East Riddle Box')) {
        if (answer === 'SILENCE') {
            user.useItem(useableItemLookUp[item][1]);
            user.inventory.push('Office Keycard East');
            console.log('You solved the riddle!  There was a Keycard to the East tower inside!\n');
            return user;
        } else {
            console.log(`That's a tough riddle, gonna have to think about that one...\n`);
            return user;
        }
    } else if (item === 'use_heatray') {
        user.useItem(useableItemLookUp[item]);
        if (comp !== undefined) {
            comp.health = comp.health - 75;
            console.log(wrap(`You fired the Nuclear Heat Ray! It dealt 40 damage to ${comp.name}!\n`, width));
            return user;
        } else {
            console.log(wrap(`You fired the Nuclear Heat Ray! That hole in the wall would have been more impressive if it was through a robot instead...\n`, width));
            return user;
        }
    } else if (item === 'use_emp') {
        user.useItem(useableItemLookUp[item]);
        if (comp !== undefined) {
            comp.health = comp.health - 200;
            console.log(wrap(`You set off the EMP! It completely shut down ${comp.name}!\n`, width));
            return user;
        } else {
            console.log(wrap(`You set off the EMP! All the electronics in the room shut off... Might have been useful in a fight...\n`, width));
            return user;
        }
    } else if (item === 'use_chest') {
        user.useItem(useableItemLookUp[item]);
        user.inventory.push('Particle Battery', 'EMP', 'Thick Carbon Coating');
        console.log(`You open the chest, the following items were inside!\nParticle Battery\nThick Carbon Coating\nEMP\n`);
        return user;
    } else {
        console.log(wrap(`You can't use that item!!!`, width));
        return user;
    }
}

//sets pauses in combat for readability and more fluid feeling gameplay
export async function wait(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

//displays large blocks of text slowly
export async function slowLog(time = 15, string) {
    if (time === 0) {
        console.log(string);
    } else {
        let stringArray = string.split('\n');
        for (let subString of stringArray) {
            let subArray = subString.split('');
            for (let letter of subArray) {
                process.stdout.write(letter);
                await wait(time);
            }
            process.stdout.write('\n');
        }
    }
}


export async function storyTextOffOn (text, time) {
    if (text.toLowerCase() === 'story text off') {
        console.log('Story text is now off!\n');
        time = 0;
        text = await ask('What would you like to do?\n');
    }

    if (text.toLowerCase() === 'story text on') {
        let textValue = await menuSelect('How fast would you like story text to run?', [{name: 'Slower', value: '1'}, {name: 'Faster', value: '2'}, {name: 'Fastest', value: '3'}]);
        console.log('Story text is now on!\n');
        time = textValue==='1'?20:textValue==='2'?15:textValue==='3'?10:0;
        text = await ask('What would you like to do?\n');
    }
    return [text, time];
}

export function roomBar (user, room) {
    let playerBarCount = Math.round((user.health/user.maxHealth).toPrecision(2)*100/5);
    let playerBar = chalk.blue(`(${user.health}(`) + chalk.greenBright('█').repeat(playerBarCount) + chalk.greenBright('-').repeat(20 - playerBarCount) + chalk.blue(`)${user.maxHealth})`);
    let exits = `${room.north ? `North   ` : ''}${room.east ? `East   ` : ''}${room.south ? `South   ` : ''}${room.west ? `West` : ''}`;
    console.log(`╔════════════════════════════════════════════════════════════════════╗`);
    console.log(`║${room.name}` + ` `.repeat(34-room.name.length) + `${user.health>=100?'':' '}` + `${user.maxHealth>=100?'':' '}` + `HP: ${playerBar}║`);
    console.log(`║ Exits: `+ exits + ` `.repeat(60-exits.length)+`║`);
    console.log(`╚════════════════════════════════════════════════════════════════════╝\n\n`);
}