// import * as readline from 'node:readline/promises';
// import { stdin as input, stdout as output } from 'process';
import { EOL } from 'os';
import { sep, dirname } from 'path';

import chalk from 'chalk';
import type { iOmdbApi } from './interfaces/omdb.js';
import { movies } from './api/movies.js';
import { traverseDirectory } from './api/files.js';

import yargs, { Options } from 'yargs';
import { hideBin } from 'yargs/helpers';
import { LogLevel } from './interfaces/loglevel.js';
import { DetermineTitle } from './api/determine.js';
import { mimetypeRefresh } from './api/mimetyperefresh.js';
import { IConfig, InitConfig } from './config.js';
import { existsSync, mkdirSync, readFileSync } from 'fs';

let didSomething = false;
interface MyArgs {
    $0: string | undefined;
    help: boolean;
    readDir: boolean;
    init: boolean;
    movie: boolean;
    series: boolean;
    targetDir: string;
    logLevel: LogLevel;
    testFilesReset: boolean;
    mimetypeRefresh: boolean;

}

const options: Record<keyof MyArgs, Options> = {
    help: {
        type: 'boolean',
        description: 'Gets you some info',
    },
    readDir: {
        type: 'boolean',
        description: 'Use this to read a directory structure (must be used with --targetDir'
    },
    init: {
        type: 'boolean',
        description: 'Create config files in config/',
    },
    movie: {
        type: 'boolean',
        description: 'Resolve some movie titles.',
    },
    series: {
        type: 'boolean',
        description: 'Resolve some series.',
    },
    targetDir: {
        type: 'string',
        description: 'Provide the target directory that contains the files that need to be renamed',
    },
    logLevel: {
        type: 'string',
        description: 'How much do you need to see',
        choices: ['verbose', 'info', 'warning'],
    },
    testFilesReset: {
        type: 'boolean',
        description: `Meddled with the filelist.json? Use this to reset it.`,
    },
    mimetypeRefresh: {
        type: 'boolean',
        description: `Software gets old, so you might need to manually refresh the mimetypes from mimedb`,
    },
    $0: {}
};

const parser = yargs(hideBin(process.argv)).options(options);

const argv = await parser.argv as unknown as MyArgs;

if (argv.init) {
    if (!existsSync(`${dirname(argv.$0!)}${sep}config`)) {
        mkdirSync(`${dirname(argv.$0!)}${sep}config`, { recursive: true });
    }
} else {
    if (!existsSync(`${dirname(argv.$0!)}${sep}config${sep}config.json`)){
        console.log(`Please run --init`);
    }
}

// let iniData = readFileSync(`${argv.$0!}${sep}config${sep}config.json`, 'utf-8');

// const ini = JSON.parse(await getFile()) as IConfig;

// if (typeof ini !== 'undefined') {
//     console.log(`hello`);
//     // const currentDir = path.dirname('.');
//     // const configPath = `${currentDir}/config`;
//     // const configOmdb = `${currentDir}/config/omdb.json`;
//     // const configFilelist = `${currentDir}/config/filelist.json`;
//     // const mimedbVideo = `${currentDir}/config/mimedb-extensions.json`;

//     const { configPath, configOmdb, configFilelist, mimedbVideo } = ini;



//     if (argv.init) {
//         didSomething = true;

//         const vars = new InitConfig(argv.$0!);
//         vars.writeConfig();

//         try {
//             await mimetypeRefresh(mimedbVideo);
//         } catch (error) {
//             console.log(chalk.redBright(`Could not refresh mime-types`));
//         }

//         if (!fs.existsSync(configPath)) { //fs.lstatSync(configPath).isDirectory()
//             fs.mkdirSync(configPath, { recursive: true });
//         }

//         if (!fs.existsSync(configOmdb)) {
//             fs.writeFileSync(configOmdb, `{\n\t"key": "XXXXX",\n\t"url": "http://www.omdbapi.com/"\n}`, 'utf8');
//         }

//         console.log(chalk.greenBright(`
//     Good job!
    
//     1. Please edit ${chalk.blueBright(`config/omdb.json`)} and provide a valid api key!
//     2. To create dummy/test files to see how this works run node main.js --testFilesCreate.
//     2a.To test various file patterns, edit the ${chalk.blueBright(`config/filelist.json`)} file and provide as many filenames as needed.
    
//     Thanks for trying my stuff!

//     ${chalk.cyanBright(`MagnetRandus`)}`));

//     }
//     if (argv.series) {

//         const omdbConfig = JSON.parse(fs.readFileSync(configOmdb, 'utf8')) as iOmdbApi;
//         const extensions = JSON.parse(fs.readFileSync(mimedbVideo, 'utf8')) as Array<string>;

//         if (argv.mimetypeRefresh) {

//             didSomething = true;

//             try {

//                 await mimetypeRefresh(mimedbVideo);

//             } catch (error) {

//                 console.dir(error);

//             }
//         }

//         /**
//          * MAIN
//          */
//         const filelistPath = `D:\\renamer\\filelists\\filelist.txt`;
//         const tDir = argv.targetDir;
//         // const fInf = fs.readFileSync(configFilelist, 'utf-8');
//         const fileListTemplatePath = fs.readFileSync(filelistPath, 'utf-8');
//         const fileListContent = fileListTemplatePath.split(EOL);

//         if (fs.statSync(filelistPath).isFile()) {

//             try {
//                 DetermineTitle(fileListContent, extensions);
//             } catch (err) {
//                 console.log(chalk.red(`The title got messed up!`));
//                 console.error(err);
//             }

//             try {

//                 // const tpath = `${path.dirname(import.meta.url)}/pseudoFiles/${argv.testFilesCreate}`.replace('file:///', '');


//                 const iterateContent = fileListContent.values();
//                 let next = iterateContent.next();


//                 while (!next.done) {
//                     // await Detective(next.value, omdbConfig, extensions, argv.logLevel);
//                     next = iterateContent.next();
//                 }

//             } catch (err) {
//                 console.log(chalk.red(`Something weird, really?!?`));
//                 console.error(err);
//             }

//             didSomething = true;


//         } else {
//             console.log(`Please provide parameter --testFileSourcePath`)
//         }

//         if (typeof argv.targetDir !== 'undefined') {
//             didSomething = true;
//         }

//         if (!didSomething) console.log(chalk.yellow(`Try node dist/main.js --help`));

//     }

//     if (argv.movie) {
//         const omdbConfig = JSON.parse(fs.readFileSync(configOmdb, 'utf8')) as iOmdbApi;
//         const extensions = JSON.parse(fs.readFileSync(mimedbVideo, 'utf8')) as Array<string>;
//         const filelist = traverseDirectory.call(new Array<string>(), argv.targetDir!);

//         if (typeof argv.targetDir !== 'undefined') {
//             didSomething = true;
//             movies(filelist, omdbConfig, extensions);
//         } else {
//             console.log(`Missing argument -targetDir=[${chalk.italic.blueBright(`path-to-dir`)}]`)
//         }
//     }

// }