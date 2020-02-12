import chalk from 'chalk'

//console.log(chalk.blue.bgRed.underline.bold('Hello world!'));
//console.log(chalk.redBright.bold('Hello!'));

let health = 25;
let totalHealth = 75;

function buildHealthBar (h, th) {
    let barCount = (Math.ceil((h/th).toPrecision(2)*10))*2;
    return chalk.blue('((') + chalk.redBright('█').repeat(barCount) + chalk.redBright('-').repeat(20-barCount) + chalk.blue('))');
}

console.log(buildHealthBar(health, totalHealth));