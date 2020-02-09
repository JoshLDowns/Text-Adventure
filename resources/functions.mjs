import readline from 'readline';
const rl = readline.createInterface(process.stdin, process.stdout);

let width = process.stdout.columns - 8;

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

//accepts input
export function ask(questionText) {
  return new Promise((resolve, reject) => {
    rl.question(questionText, resolve);
  });
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
export function itemEffect(item, comp, answer, user) {
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
  } else if (item === 'use_grenade') {
      user.useItem(useableItemLookUp[item]);
      if (comp !== undefined) {
          comp.health = comp.health - 20;
          console.log(`You threw a Plasma Grenade! It dealt 20 damage to ${comp.name}!\n`);
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
          comp.health = comp.health - 40;
          console.log(wrap(`You fired the Nuclear Heat Ray! It dealt 40 damage to ${comp.name}!\n`, width));
          return user;
      } else {
          console.log(wrap(`You fired the Nuclear Heat Ray! That hole in the wall would have been more impressive if it was through a robot instead...\n`, width));
          return user;
      }
  } else {
      console.log(wrap(`You can't use that item!!!`, width));
      return user;
  }
}