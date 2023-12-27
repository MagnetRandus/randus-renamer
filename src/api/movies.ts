import natural from 'natural';
import chalk from 'chalk';
import { iOmdbApi } from '../interfaces/omdb.js';
import { checkOnlineDbMovie } from './omdb.js';
import { omdbRejected } from '../interfaces/error.js';
import { dirname } from 'path';

export async function movies(arrFileNames: string[], omdb: iOmdbApi, extensions: Array<string>): Promise<void> {

    const tokenizer = new natural.WordTokenizer();
    let counter = 0;

    try {
        const titles = new Array<string[]>();

        for (const fullpath of arrFileNames) {

            if (counter > 35) break;

            try {

                const filename = fullpath.replace(dirname(fullpath), ``);

                const filenameOnly = filename.substring(0, filename.lastIndexOf('.'));
                const extension = filename.substring(filename.lastIndexOf('.') + 1);
                if (extensions.includes(extension)) {
                    const rx4DigitNr = /\b\d{4}\b/g;
                    const year = filenameOnly.match(rx4DigitNr);

                    if (year !== null && (Number(year?.[0]) > 1920 && Number(year?.[0]) <= new Date().getFullYear())) { //Check if not just some bs 4 digit number

                        const yyyy = String(year?.[0]);
                        const filenameNoYear = filenameOnly.replace(yyyy, '');
                        const fNameClean = filenameNoYear.replace(/[^a-zA-Z]/g, ' ').trim();
                        let tkzd = tokenizer.tokenize(fNameClean.toLowerCase())?.filter(word => !natural.stopwords.includes(word))!;
                        tkzd = [yyyy, ...tkzd];
                        titles.push(tkzd);

                    }
                    // else {
                    //     console.log(`Rejecting [${filenameOnly}]`);
                    // }
                } else {
                    console.log(`Skipping ${filename.substring(filename.lastIndexOf('.') + 1)}`);
                }

                counter++;


            } catch (error) {
                console.dir(error);
            }
        }

        for await (const title of titles) {
            const titleFour = title.slice(0, 4);
            const [yyyy, ...words] = titleFour;
            const [firstWord] = words;

            try {
                const { config, data, headers, status, statusText, request } = await checkOnlineDbMovie(firstWord, Number(yyyy), omdb.key, omdb.url);
                const { Search } = data;

                let foundTitle = ``;
                let lastHitCount = 0;

                if (typeof Search !== 'undefined')
                    for (const omdbInf of Search) {
                        let hitCount = 0;
                        let tkzOmdbTitle = tokenizer.tokenize(omdbInf.Title.toLowerCase())?.filter(word => !natural.stopwords.includes(word))!;

                        for (let index = 0; index < words.length; index++) {
                            if (index <= tkzOmdbTitle.length && (words[index] == tkzOmdbTitle[index])) {
                                hitCount++
                            } else {
                                hitCount -= tkzOmdbTitle.slice(index).length;
                                index = words.length; //exit loop
                            }
                        }

                        if (hitCount > lastHitCount) {
                            lastHitCount = hitCount;
                            foundTitle = `${omdbInf.Title} (${yyyy})`;
                            console.log(`MATCHED: ${title} to [${foundTitle}]`);
                        }

                        // console.log(`hit count: ${hitCount}: ${omdbInf.Title}`);
                    }
                else
                    console.log(`Unusable title: ${title}`);

            } catch (error: any) {
                if ('config' in error) {
                    const omdbRejErr = error as omdbRejected;
                    console.log(`It looks like your didn't change the apikey in config/omdb.json - here's the message from the server:\n\t${chalk.redBright(omdbRejErr.message)}`);
                }
                else {
                    console.log(`Title: ${title}`)
                    console.log(chalk.red(`Something else went wrong:\n-------------------------`));
                    console.log(JSON.stringify(error));
                }
            }
        }
        console.log('done');

    } catch (error) {
        console.dir(error);
        console.log(`ERROR:`);
    }
}