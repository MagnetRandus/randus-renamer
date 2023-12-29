// import { stdin as input, stdout as output } from 'process';
import { EOL } from 'os';
import { sep, dirname } from 'path';

import chalk from 'chalk';
import type { IOmdbApi } from '../interfaces/omdb.js';
import { movies } from '../api/movies.js';
import { traverseDirectory } from '../api/files.js';

import yargs, { Options } from 'yargs';
import { hideBin } from 'yargs/helpers';
import { LogLevel } from '../interfaces/loglevel.js';
import { DetermineTitle } from '../api/determine.js';
import { mimetypes } from '../api/mimetyperefresh.js';
import { IConfig, InitConfig } from '../config.js';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';


export function argv_init(currentDir: string, ini: InitConfig) {
    
    const configDirExists = existsSync(ini.config.configPath);

    if (!configDirExists) {
        mkdirSync(`${currentDir}${sep}config`, { recursive: true });
    }

    try {
        ini.iniConfigWrite();
    } catch (error) {
        if (error instanceof Error)
            console.log(chalk.yellowBright(error.message));
    }

    try {
        ini.OmdbConfigWrite();
    } catch (error) {
        if (error instanceof Error)
            console.log(chalk.yellowBright(error.message));
    }

    try {
        const mimTypesInf = new mimetypes(ini.config.configPath, ini.config.mimedbDataUrl);
        mimTypesInf.MimeDbDataRead(true);
        console.log(chalk.yellowBright(`Please review/update config .json and omdb.json`));
    } catch (error) {
        if (error instanceof Error)
            console.log(chalk.yellowBright(error.message));
    }
}