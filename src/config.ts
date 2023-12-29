import path, { sep } from "path";
import { createFile } from "./api/files.js";
import { existsSync, readFileSync } from "fs";
import chalk from "chalk";

export interface IConfig {
    configPath: string;
    configFile: string;
    omdbApiKeyurl: string;
    configFilelist: string;
    mimedbDataUrl: string;
}

interface IOmdb {
    key: string;
    url: string;
}

export class InitConfig {
    public config: IConfig;

    private currentDir: string;
    private omdbConfigFileName = `omdb.json`;
    constructor(scriptPath: string, public omdbConf: IOmdb) {

        this.currentDir = path.dirname(scriptPath);

        this.config = {
            configPath: `${this.currentDir}${sep}config`,
            configFile: `${this.currentDir}${sep}config${sep}config.json`,
            configFilelist: `${this.currentDir}${sep}config${sep}filelist.json`,
            mimedbDataUrl: `https://cdn.jsdelivr.net/gh/jshttp/mime-db@master/db.json`,
            omdbApiKeyurl: `https://www.omdbapi.com/apikey.aspx`
        }

    }
    IniConfigExists(): boolean {
        return existsSync(this.config.configFile);
    }
    iniConfigRead(): this {
        if (!this.IniConfigExists()) {
            this.iniConfigWrite();
            throw new Error(chalk.yellowBright(`Default config created, make changes in config/config.json if needed!`));
        } else {
            this.config = JSON.parse(readFileSync(this.config.configFile, 'utf-8'))!;
        }
        return this;
    }
    iniConfigWrite(): void {
        createFile(this.config.configPath, `config.json`, JSON.stringify(this.config, null, 2));
    }
    OmdbConfigExists(): boolean {
        return existsSync(this.config.configPath);
    }
    OmdbConfigRead(): IOmdb {

        if (!this.OmdbConfigExists()) {
            
            this.OmdbConfigWrite();

            throw new Error(`Restart the application after updating the OMDB key on config/omdb.json`);

        } else {

            this.omdbConf = JSON.parse(readFileSync(`${this.config.configPath}${sep}${this.omdbConfigFileName}`, 'utf-8'))!;

            if (this.omdbConf.key === `TYPE_KEY_HERE`)
                throw new Error(`Please obtain an api key from OMDB at ${this.config.omdbApiKeyurl} and update it in ${this.config.configPath}${sep}${this.omdbConfigFileName}`);

        }

        return this.omdbConf;
    }
    OmdbConfigWrite(): void {
        createFile(this.config.configPath, this.omdbConfigFileName, JSON.stringify(this.omdbConf, null, 2));
    }
}