import os from 'os';
import natural from 'natural';
import chalk from 'chalk';
import { Episode, Search, IOmdbApi } from '../interfaces/omdb.js';
import { checkOnlineDbEpisode, checkOnlineDbSeries } from './omdb.js';
import { omdbRejected } from '../interfaces/error.js';
import path, { dirname } from 'path';
import inquirer, { DistinctQuestion, Answers, ListQuestion } from 'inquirer';
import { appendToFile, createFile } from './files.js';
import { trackEntry } from '../interfaces/local.js';

interface nameSelected extends ListQuestion {
    seriesName: string
}

async function ask(titles: Array<string>, fileName: string): Promise<nameSelected> {

    const b: DistinctQuestion<nameSelected> = {
        type: 'list',
        name: 'seriesName',
        message: `Select the correct title: \n\n ${chalk.bgGrey.white(fileName)}\n\n`,
        choices: titles,
        filter(val) {
            return val;
        }
    };

    return inquirer.prompt(b);
}

async function resolveSeriesName(omdb: IOmdbApi, firstWord: string, fileName: string): Promise<Search> {
    const { config, data, headers, status, statusText, request } = await checkOnlineDbSeries(firstWord, omdb.key, omdb.url);
    const { Search } = data;

    const sTitles = Search.map(s => s.Title);

    const answer = await ask(sTitles, fileName);



    const omdInf = Search.filter(s => s.Title === answer.seriesName);

    return omdInf[0];
}
async function resolveEpisodeName(omdb: IOmdbApi, seriesName: string, seasonNr: number, episodeNr: number): Promise<Episode> {
    return new Promise<Episode>(async (resolve, reject) => {
        try {
            const { config, data, headers, status, statusText, request } = await checkOnlineDbEpisode(seriesName, seasonNr, episodeNr, omdb.key, omdb.url);
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
}
export async function series(arrFileNames: string[], omdb: IOmdbApi, extensions: Array<string>): Promise<void> {

    const tokenizer = new natural.WordTokenizer();

    let counter = 0;

    const tPath = `C:/dev/renamer/dist/pseudoScripts`;
    const tFileDirs = `createDirs.ps1`;
    const tFileFiles = `createFiles.ps1`;
    const pseudoPath = `C:/dev/renamer/dist/bleh`;

    const foldersCreated = new Array<string>();
    const renameEntries = new Array<string>();

    const trackEntries: trackEntry = {};

    createFile(tPath, tFileDirs, `#This is an auto generated file;${os.EOL}`);
    createFile(tPath, tFileFiles, `#This is an auto generated file;${os.EOL}`);

    try {
        const titles = new Array<string[]>();
        let currentTitle = ``;
        let currentImdbId = ``;
        let prevFirstWord = ``;
        let renamePathTo = ``;
        let sName: Search;

        for (const fullpath of arrFileNames) {

            const filename = fullpath.replace(dirname(fullpath), ``);

            try {

                const filenameOnly = filename.substring(0, filename.lastIndexOf('.'));
                const regex = /s(\d{2})e(\d{2})/i;
                const extension = filename.substring(filename.lastIndexOf('.') + 1);

                let timer: NodeJS.Timeout;

                let psEntryMoveRename;

                if (extensions.includes(extension)) { //only use video type extension
                    try {
                        const [ident, sNr, epNr] = filenameOnly.match(regex)!;;

                        if (Number(sNr) !== 0 && Number(epNr) !== 0) {

                            const fNameClean = filenameOnly.split(ident)[0].replace(/[^a-zA-Z]/g, ' ').trim();

                            const [firstWord] = tokenizer.tokenize(fNameClean.toLowerCase())?.filter(word => !natural.stopwords.includes(word))!;


                            if (firstWord !== prevFirstWord) {

                                console.log(chalk.yellow(`Fetching info`));

                                sName = await resolveSeriesName(omdb, firstWord, fNameClean);

                                currentImdbId = sName.imdbID;

                                trackEntries[currentImdbId] = trackEntries[sName.imdbID] || new Array<string>();

                                currentTitle = sName.Title;

                                renamePathTo = `${pseudoPath}/${sName.Title}`;

                                const psEntryFolder = `New-Item -Path "${renamePathTo}" -ItemType Directory${os.EOL}`;

                                if (!foldersCreated.includes(sName.Title)) {
                                    appendToFile(tPath, tFileDirs, psEntryFolder.split('/').join(path.sep)); //Don't create a folder again
                                    foldersCreated.push(sName.Title);
                                }

                                prevFirstWord = firstWord;
                            }

                            if (trackEntries[currentImdbId].indexOf(ident.toUpperCase()) == -1) {
                                trackEntries[currentImdbId].push(ident.toUpperCase());

                                timer = setInterval(() => { process.stdout.write(chalk.yellow(`.`)) }, 500);

                                const epname = await resolveEpisodeName(omdb, currentTitle, Number(sNr), Number(epNr));
                                clearTimeout(timer);

                                psEntryMoveRename = `Move-Item -LiteralPath "${fullpath}" "${renamePathTo}/${ident} - ${epname.Title}.${extension}"${os.EOL}`;
                            } else {
                                console.log(`Found duplicate`);
                            }



                            try {
                                counter++;
                            } catch (error) {
                                console.log(`Couldn't do something right, yeah?`);
                            } finally {
                                clearTimeout(timer!);
                            }

                            if (typeof psEntryMoveRename !== 'undefined')
                                appendToFile(tPath, tFileFiles, psEntryMoveRename.split('/').join(path.sep));
                            else
                                console.log(`psEntryMoveRename is undefined`);
                        } else {
                            console.log(`What happens here`);
                        }

                        // console.log(`tkzd: ${tkzd.join(' ')}`);
                    } catch (error) {
                        console.log(`${counter}:${filename}`);

                    }
                }
                // else {
                //     console.log(`Skipping ${filename.substring(filename.lastIndexOf('.') + 1)}`);
                // }

            } catch (error) {
                console.log(`Something else`);
            }
        }

        // for await (const title of titles) {
        //     const titleFour = title.slice(0, 4);
        //     const [yyyy, ...words] = titleFour;
        //     const [firstWord] = words;

        //     try {
        //         const { config, data, headers, status, statusText, request } = await checkOnlineDbSeries(firstWord, Number(yyyy), omdb.key, omdb.url);
        //         const { Search } = data;

        //         let foundTitle = ``;
        //         let lastHitCount = 0;

        //         if (typeof Search !== 'undefined')
        //             for (const omdbInf of Search) {
        //                 let hitCount = 0;
        //                 let tkzOmdbTitle = tokenizer.tokenize(omdbInf.Title.toLowerCase())?.filter(word => !natural.stopwords.includes(word))!;

        //                 for (let index = 0; index < words.length; index++) {
        //                     if (index <= tkzOmdbTitle.length && (words[index] == tkzOmdbTitle[index])) {
        //                         hitCount++
        //                     } else {
        //                         hitCount -= tkzOmdbTitle.slice(index).length;
        //                         index = words.length; //exit loop
        //                     }
        //                 }

        //                 if (hitCount > lastHitCount) {
        //                     lastHitCount = hitCount;
        //                     foundTitle = `${omdbInf.Title} (${yyyy})`;
        //                     console.log(`MATCHED: ${title} to [${foundTitle}]`);
        //                 }

        //                 // console.log(`hit count: ${hitCount}: ${omdbInf.Title}`);
        //             }
        //         else
        //             console.log(`Unusable title: ${title}`);

        //     } catch (error: any) {
        //         if ('config' in error) {
        //             const omdbRejErr = error as omdbRejected;
        //             console.log(`It looks like your didn't change the apikey in config/omdb.json - here's the message from the server:\n\t${chalk.redBright(omdbRejErr.message)}`);
        //         }
        //         else {
        //             console.log(`Title: ${title}`)
        //             console.log(chalk.red(`Something else went wrong:\n-------------------------`));
        //             console.log(JSON.stringify(error));
        //         }
        //     }
        // }
        console.log('done');

    } catch (error) {
        console.dir(error);
        console.log(`ERROR:`);
    }
}