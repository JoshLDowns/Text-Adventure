import readline from 'readline';
const rl = readline.createInterface(process.stdin, process.stdout);

export function ask(questionText) {
  return new Promise((resolve, reject) => {
    rl.question(questionText, resolve);
  });
}

export function wrap(string, w) { //text wrapping function
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

export function random(max) { //random number generator
    return Math.floor(Math.random() * max) + 1;
}

/*export function itemEffect(item, comp, answer, user) {
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
      return console.log(wrap(`You have upgraded your Particle Beam!  It now hits harder than ever!\n`, width));
  } else if (item === 'use_carboncoating') {
      user.useItem(useableItemLookUp[item]);
      user.maxHealth = user.maxHealth + 10;
      user.health = user.health + 10;
      return console.log(`You have increased your maximum HP by 10 points!\n`);
  } else if (item === 'use_grenade') {
      user.useItem(useableItemLookUp[item]);
      if (comp !== undefined) {
          comp.health = comp.health - 20;
          return console.log(`You threw a Plasma Grenade! It dealt 20 damage to ${comp.name}!\n`);
      } else {
          return console.log(wrap(`You throw a Plasma Grenade! The blast was impressive, but would have been more useful in a fight...\n`, width));
      }
  } else if (item === 'use_shield') {
      user.useItem(useableItemLookUp[item]);
      if (comp !== undefined) {
          user.status2 = 'shield';
          return console.log(`You generate a temporary shield that can absorb damage!\n`);
      } else {
          return console.log(wrap(`You generate a temporary shield! Too bad you aren't being attacked...\n`, width));
      }
  } else if (item === 'use_bomb') {
      user.useItem(useableItemLookUp[item]);
      if (comp !== undefined) {
          comp.status = 'smoke';
          return console.log(wrap(`You throw a Smoke Bomb! It will be harder for ${comp.name} to hit you!\n`, width));
      } else {
          return console.log(`You throw a Smoke Bomb! Gee golly that was exciting!\n`);
      }
  } else if (item === 'use_rbox' && user.inventory.includes('West Riddle Box')) {
      if (answer === 'WET') {
          user.useItem(useableItemLookUp[item][0]);
          user.inventory.push('Office Keycard West');
          return console.log('You solved the riddle!  There was a Keycard to the West tower inside!\n');
      } else {
          return console.log(`That's a tough riddle, gonna have to think about that one...\n`);
      }
  } else if (item === 'use_rbox' && user.inventory.includes('East Riddle Box')) {
      if (answer === 'SILENCE') {
          user.useItem(useableItemLookUp[item][1]);
          user.inventory.push('Office Keycard East');
          return console.log('You solved the riddle!  There was a Keycard to the East tower inside!\n');
      } else {
          return console.log(`That's a tough riddle, gonna have to think about that one...\n`);
      }
  } else if (item === 'use_heatray') {
      user.useItem(useableItemLookUp[item]);
      if (comp !== undefined) {
          comp.health = comp.health - 40;
          return console.log(wrap(`You fired the Nuclear Heat Ray! It dealt 40 damage to ${comp.name}!\n`, width));
      } else {
          return console.log(wrap(`You fired the Nuclear Heat Ray! That hole in the wall would have been more impressive if it was through a robot instead...\n`, width));
      }
  } else {
      return console.log(wrap(`You can't use that item!!!`, width));
  }
}*/