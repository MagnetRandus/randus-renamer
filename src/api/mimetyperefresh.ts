import axios from "axios";
import chalk from "chalk";
import { writeFileSync } from "fs";
import { MimeDatabase } from "mime-db";

export async function mimetypeRefresh(mimedbVideo:string){
    try {
        const memdb = await axios.get<MimeDatabase>(`https://cdn.jsdelivr.net/gh/jshttp/mime-db@master/db.json`);

        const extensions = Object.keys(memdb.data)
            .reduce<string[]>((acc, mimetype) => {
                const entry = memdb.data[mimetype];
                if ('extensions' in entry && mimetype.includes('video')) {
                    acc.push(...entry.extensions!);
                }
                return acc;
            }, []);

        writeFileSync(mimedbVideo, JSON.stringify(extensions), 'utf8');

        console.log(chalk.greenBright(`mime-db refreshed, updated ${chalk.yellow(mimedbVideo)}`));

    } catch (error) {
        console.log(chalk.red(`Something went wrong trying to fetch the mime-db`));
        console.log(JSON.stringify(error));
        return Promise.reject();
    }

    return true;
}