import path from "path";
import { createFile } from "./api/files.js";

export interface IConfig {
    configPath: string;
    configOmdb: string;
    configFilelist: string;
    mimedbVideo: string;
}

export class InitConfig {
    private config: IConfig;
    private currentDir: string;
    constructor(scriptPath: string) {
        this.currentDir = path.dirname(scriptPath);

        this.config = {
            configPath: `${this.currentDir}/config/omdb.json`,
            configOmdb: `${this.currentDir}/config/omdb.json`,
            configFilelist: `${this.currentDir}/config/filelist.json`,
            mimedbVideo: `${this.currentDir}/config/mimedb-extensions.json`
        }
    }
    writeConfig() {
        createFile(`${this.currentDir}${path.sep}config${path.sep}`, `config.json`, JSON.stringify(this.config));
    }
}