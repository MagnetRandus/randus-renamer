import chalk from 'chalk';
import { existsSync, readFileSync, mkdirSync, readdirSync, statSync, writeFileSync, renameSync, appendFileSync, readFile } from 'fs';
import path from 'path';

// Define interfaces for errors
class FolderAlreadyExistsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'FolderAlreadyExistsError';
        Object.setPrototypeOf(this, FolderAlreadyExistsError.prototype);
    }
}

class FolderCreationError extends Error {
    code: string;

    constructor(message: string) {
        super(message);
        this.name = 'FolderCreationError';
        this.code = ``;

        Object.setPrototypeOf(this, FolderCreationError.prototype);
    }
}

export function traverseDirectory(dir: string, fileArray: string[] = []): string[] {
    const files = readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = statSync(filePath);

        if (stats.isDirectory()) {
            // Recursively call the function to handle subdirectories
            traverseDirectory(filePath, fileArray);
        } else {
            fileArray.push(filePath);
        }
    }

    return fileArray;
}

export function createFile(directoryPath: string, filename: string, payload: string) {
    try {
        const pFile = `${directoryPath}/${filename}`;

        if (path.isAbsolute(pFile) && !existsSync(directoryPath)) {
            mkdirSync(directoryPath, { recursive: true });
        } else {
            writeFileSync(pFile, payload, 'utf8');
        } 

    } catch (error) {
        console.log(JSON.stringify(error));
    }
}

export function renameFile(directoryPath: string, oldFilename: string, newFilename: string) {
    try {
        const oldPath = `${directoryPath}/${oldFilename}`;
        const newPath = `${directoryPath}/${newFilename}`;

        if (path.isAbsolute(oldPath) && existsSync(oldPath)) {
            renameSync(oldPath, newPath);
        } else {
            console.log(chalk.red(`Please provide an absolute path to the file and ensure that the file exists`));
        }
    } catch (error) {
        console.log(JSON.stringify(error));
    }
}

export function appendToFile(directoryPath: string, filename: string, payload: string) {
    try {
        const pFile = `${directoryPath}/${filename}`;

        if (path.isAbsolute(pFile) && existsSync(pFile)) {
            appendFileSync(pFile, payload, 'utf8');
        } else {
            console.log(chalk.red(`Please provide an absolute path to the file and ensure that the file exists`));
        }
    } catch (error) {
        console.log(JSON.stringify(error));
    }
}
