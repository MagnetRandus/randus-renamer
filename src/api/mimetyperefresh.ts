import axios, { AxiosResponse } from "axios";
import chalk from "chalk";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { MimeDatabase } from "mime-db";
import { createFile } from "./files.js";
import { sep } from "path";


export class mimetypes {
    public FileExtensions: Array<string>;
    private mimetypeFileName = `mimetypes.json`;
    constructor(private confPath: string, private mimedbUrl: string) {
        this.FileExtensions = new Array<string>();
    }
    private async RefreshFromWeb(): Promise<this> {

        const mimeDb = await axios.get<MimeDatabase>(this.mimedbUrl);

        this.FileExtensions = Object.keys(mimeDb.data)
            .reduce<string[]>((acc, mimetype) => {
                const entry = mimeDb.data[mimetype];
                if ('extensions' in entry && mimetype.includes('video')) {
                    acc.push(...entry.extensions!);
                }
                return acc;
            }, []);

        return new Promise<this>((resolve, reject) => {
            try {
                resolve(this);
            } catch (error) {
                reject(error);
            }
        });
    }
    private MimeTypesFileExists(): boolean {
        return existsSync(`${this.confPath}${sep}${this.mimetypeFileName}`);
    }
    MimeDbDataRead(force = false): Promise<this> {
        return new Promise<this>(async (resolve, reject) => {
            try {
                if (force || !this.MimeTypesFileExists()) {
                    
                    await this.RefreshFromWeb();

                    createFile(`${this.confPath}`, this.mimetypeFileName, JSON.stringify(this.FileExtensions, null, 2));
                    
                    console.log(chalk.yellowBright(`MimeTypes refreshed from web.  If you used` + chalk.blueBright(`--mimetypeRefresh`) + chalk.yellowBright(`, remember to remove it from the parameters on the next run.`)));
                    
                    resolve(this);

                } else {
                    
                    this.FileExtensions = JSON.parse(readFileSync(`${this.confPath}${sep}${this.mimetypeFileName}`, 'utf-8'));
                    
                    resolve(this);
                }
            } catch (error) {
                reject(error);
            }
        });

    }
}
