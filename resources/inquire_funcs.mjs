import inquirer from 'inquirer'

export async function difficultyChoice() {
    return await inquirer
        .prompt([
            {
                type: 'list',
                name: 'difficultyLevel',
                message: 'Please select a difficulty',
                choices: [
                    'Easy',
                    'Medium',
                    'Hard'
                ]
            }
        ])
        .then(answers => {
            if (answers.difficultyLevel === 'Easy') {
                console.clear();
                console.log('\n');
                console.log('You selected Easy! Enjoy a relaxing adventure!\n');
                return '1';
            } else if (answers.difficultyLevel === 'Medium') {
                console.clear();
                console.log('\n');
                console.log('You selected Medium! Enjoy your adventure!\n');
                return '2';
            } else {
                console.clear();
                console.log('\n');
                console.log('You selected Hard!!! You must enjoy pain!\n');
                return '3';
            }
        });
}