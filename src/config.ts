import path, { sep } from "path";
import { createFile } from "./api/files.js";
import { existsSync, readFileSync } from "fs";
import chalk from "chalk";

export interface IConfig {
    configPath: string;
    configFile: string;
    omdbConfigPath: string;
    configFilelist: string;
    mimedbDataUrl:string;
}

interface IOmdb {
    key:string;
    url:string;
}

export class InitConfig {
    public config: IConfig;
    public omdbConf:IOmdb;
    private currentDir: string;
    constructor(scriptPath: string) {

        this.currentDir = path.dirname(scriptPath);

        this.config = {
            configPath: `${this.currentDir}${sep}config`,
            configFile: `${this.currentDir}${sep}config${sep}config.json`,
            omdbConfigPath: `${this.currentDir}${sep}config${sep}omdb.json`,
            configFilelist: `${this.currentDir}${sep}config${sep}filelist.json`,
            mimedbDataUrl: `https://cdn.jsdelivr.net/gh/jshttp/mime-db@master/db.json`,
        }

        this.omdbConf = { key: "XXXXX", url: "http://www.omdbapi.com/" };

    }
    IniConfigExists(): boolean {
        return existsSync(this.config.configFile);
    }
    iniConfigRead(): IConfig {
        if (!this.IniConfigExists()) {
            this.iniConfigWrite();
            throw new Error(chalk.yellowBright(`Default config created, make changes in config/config.json if needed!`));
        } else {
            this.config = JSON.parse(readFileSync(this.config.configFile, 'utf-8'))!;
        }
        return this.config;
    }
    iniConfigWrite(): void {
        createFile(this.config.configPath, `config.json`, JSON.stringify(this.config, null, 2));
    }
    OmdbConfigExists(): boolean {
        return existsSync(this.config.omdbConfigPath);
    }
    OmdbConfigRead(): IOmdb {
        if (!this.OmdbConfigExists()) {
            this.OmdbConfigWrite();
            throw new Error(`Restart the application after updating the OMDB key on config/omdb.json`);
        } else {
            this.omdbConf = JSON.parse(readFileSync(this.config.omdbConfigPath, 'utf-8'))!;
        }
        return this.omdbConf;
    }
    OmdbConfigWrite(): void {
        
        createFile(this.config.omdbConfigPath, `omdb.json`, JSON.stringify(this.omdbConf, null, 2));
    }
}