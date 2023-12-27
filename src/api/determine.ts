import chalk from 'chalk';
import natural from 'natural';
import { EOL } from 'os';
import * as readline from 'readline';

function askQuestion(question: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}





export async function DetermineTitle(filedata: Array<string>, extensions: Array<string>) {

    const tokenizer = new natural.WordTokenizer();
    let tkzd = tokenizer.tokenize(filedata.join(' ').toLowerCase())?.filter(word => !natural.stopwords.includes(word))!;

    const tabooWoords = ['season', 'extra', 'episode', 'delete', 'bdrip', 'part', 'sampledata', '1080'];

    const wordCount: { [key: string]: number } = {};

    tkzd.forEach((word) => {
        wordCount[word] = (wordCount[word] || 0) + 1;
    });

    const sortedWords = Object.entries(wordCount)
        .sort((a, b) => b[1] - a[1]) // Sort by frequency in descending order
        .map(([word]) => word);

    const nA = sortedWords.filter(word => {

        let isTaboo = false;

        tabooWoords.forEach((tabooWord, i) => {
            if (!isTaboo)
                isTaboo = word.indexOf(tabooWord) !== -1
        });

        const isNr = !isNaN(Number(word));
        const isExt = extensions.includes(word);
        const isWord = word.length > 1;

        if (!isNr && !isExt && isWord && !isTaboo)
            return word;
    });

    const selectFrom = nA
        .filter(z => isNaN(Number(z)))
        .slice(0, 15)
        .forEach((v, i) => {
            console.log(`${chalk.yellowBright(`${i}) `)}${v}`);
        });

    const userChoice = await askQuestion('Which of these values looks like the title of this series? ');

    // const u = tkzd.filter((value, index, self) => self.indexOf(value) === index); //Remove dups

}