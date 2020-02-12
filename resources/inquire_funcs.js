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
      if (answer===undefined) {
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
      return answer;
}
 