import axios, { AxiosResponse } from "axios";
import chalk from "chalk";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { MimeDatabase } from "mime-db";
import { createFile } from "./files.js";
import { sep } from "path";


export class mimetypes {
    private FileExtensions: Array<string>;
    constructor(private mimedbUrl: string) {
        this.FileExtensions = new Array<string>();

        let mimeJsonFilePath = `${sep}mimedb-extensions.json`
    }
    private async RefreshFromWeb(): Promise<Array<string>> {

        const mimeDb = await axios.get<MimeDatabase>(this.mimedbUrl);

        this.FileExtensions = Object.keys(mimeDb.data)
            .reduce<string[]>((acc, mimetype) => {
                const entry = mimeDb.data[mimetype];
                if ('extensions' in entry && mimetype.includes('video')) {
                    acc.push(...entry.extensions!);
                }
                return acc;
            }, []);

        return new Promise<Array<string>>((resolve, reject) => {
            try {
                resolve(this.FileExtensions);
            } catch (error) {
                reject(error);
            }
        });
    }
    private MimeTypesFileExists(): boolean {
        return existsSync(this.mimeJsonFilePath);
    }
    MimeDbDataRead(force = false): Promise<Array<string>> {
        return new Promise<Array<string>>(async (resolve, reject) => {
            try {
                if (force){
                    
                }
                if (this.MimeTypesFileExists()) {
                    this.FileExtensions = JSON.parse(readFileSync(this.mimeJsonFilePath, 'utf-8'));
                    resolve(this.FileExtensions);

                } else {
                    resolve(await this.RefreshFromWeb());
                }
            } catch (error) {
                reject(error);
            }
        });
    }
    iniConfigWrite(): void {
        createFile(this.mimeJsonFilePath, `config.json`, JSON.stringify(this.config, null, 2));
    }
}
