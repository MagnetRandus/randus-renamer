export interface Entry {
    [x: string]: any;
    entities: Array<string>;
    instructs: Array<string>;
}

export interface trackEntry {
    [x: string]: Entry;
}