import natural from 'natural';
import chalk from 'chalk';
import { IOmdbApi } from '../interfaces/omdb.js';
import { checkOnlineDbEpisode, checkOnlineDbMovie, checkOnlineDbSeries } from './omdb.js';
import { omdbRejected } from '../interfaces/error.js';
import { basename, dirname } from 'path';
import { LogLevel } from '../interfaces/loglevel.js';

const tnFullPath = `%FULLPATH% `;

export type isSM = 'series' | 'movies' | '';
// export async function DetectFilenameType(filename: string, omdb: iOmdbApi, extensions: Array<string>): isSM {
//     const regxTvSS = /S\d{2}E\d{2}/i;
//     const regxTvSEp = /Season\s*\d{2}\s*Episode\s*\d{2}/i;
//     const mRegex = /\b\d{4}\b/;
//     let toReturn: isSM = '';

//     // if (regxTvSEp.test(filename) || regxTvSS.test(filename)) toReturn = 'series';
//     // if (mRegex.test(filename)) toReturn = 'movies';

//     // if (toReturn == '') throw new Error(`Could not identify m or s`)
//     // else return toReturn;

// }

export async function isM(fullpath: string, omdb: IOmdbApi, extensions: Array<string>): Promise<isSM | undefined> {

    const tokenizer = new natural.WordTokenizer();
    let counter = 0;

    try {
        let title = new Array<string>();

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

                    title = [yyyy, ...tokenizer.tokenize(fNameClean.toLowerCase())?.filter(word => !natural.stopwords.includes(word))!];

                    if (title.length !== 0) {

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
                    } else {
                        console.log(`Can't work with: ${fNameClean}`);
                    }
                }

            } //Else: Invalid MimeType

            counter++;


        } catch (error) {
            console.dir(error);
        }



        // for await (const title of titles) {

        // }
        // console.log('done');

        return new Promise((resolve, reject) => {
            resolve('movies');
        })
    } catch (error) {
        console.dir(error);
        console.log(`ERROR:`);
    }
}
function RemoveYYYY(fname: string, YYYY: string): string {
    return fname.replace(YYYY, '')
}
function ExtractYYYY(fname: string) {
    const rx4DigitNr = /\b\d{4}\b/g;
    const year = fname.match(rx4DigitNr);
    if (year !== null) {
        return year;
    }

    throw new TypeError(`0000`)
}



function ExtractSEPInfo(fname: string): RegExpMatchArray | null {
    const seasonInfo = fname.match(/[a-zA-Z]+\s\d+/g);
    if (seasonInfo !== null)
        return seasonInfo;
    return null;
}

function tokenizeFilename(fname: string): Array<string> {
    const tokenizer = new natural.WordTokenizer();
    return tokenizer.tokenize(fname.toLowerCase())?.filter(word => !natural.stopwords.includes(word))!;
}
function PreSweepName(fname: string) {
    const withoutNonPrintingChars = fname.replace(/[^\x20-\x7E]/g, '');
    const withSingleSpace = withoutNonPrintingChars.replace(/\s+/g, ' ');// Replace multiple spaces with a single space
    return withSingleSpace.trim();
}
/**
 * Clean the filename and remove the extension
 * @param fname filename
 * @param ext extension
 * @returns the cleaned filename
 */
function SweepFilename(fname: string, ext: string): string {
    const noExt = fname.replace(`.${ext}`, '');
    return noExt.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, ' ');
}
function IsExtra(fname: string): boolean {
    const terms = ["extra", " extras", "behind the scenes", "deleted scenes", "audio commentary"];
    // const [extras, behindthescens, deletedscenes, audiocommentary] = terms;
    const matches = terms.filter(v => fname.toLowerCase().includes(v));
    return matches.length !== 0;
}

function isMedia(fname: string, extensions: Array<string>): string {

    const loglevel: LogLevel = 'verbose';

    const fExt = fname.substring(fname.lastIndexOf('.') + 1);

    if (extensions.includes(fExt)) {
        return fExt;
    };

    throw new TypeError(`[${loglevel}:] Probably not a video file! %FULLPATH% `);
}

export async function Detective(fullpath: string, omdb: IOmdbApi, extensions: Array<string>, LogLevel: LogLevel) {
    const filename = PreSweepName(basename(fullpath));
    const pathInfo = dirname(fullpath);

    try {
        const ext = isMedia(filename, extensions); //non-media throws (known as an early exit strategy)
        const sanitizedname = SweepFilename(filename, ext);
        const SEPInfo = ExtractSEPInfo(sanitizedname);

        if (SEPInfo !== null) {
            if (IsExtra(sanitizedname)) {
                console.log(`${chalk.cyanBright(`[info]`)} An EXTRA might be: ${chalk.yellowBright(sanitizedname)}`);
            } else {
                console.log(chalk.blueBright(sanitizedname));
            }
        } else {
            console.log(`${chalk.cyanBright(`[info]`)} Not an episode is this: ${chalk.yellowBright(sanitizedname)}`);
        }

    } catch (err) {
        if (err instanceof Error) {
            if (err.message.includes(LogLevel))
                if (err.message.includes(tnFullPath)) {
                    console.log(err.message.replace(tnFullPath, fullpath))
                }
        } else {
            console.log(chalk.red(`Something else happened!`));
            console.error(err);
        }
    }
}