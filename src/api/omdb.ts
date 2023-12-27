import axios, { AxiosResponse, AxiosStatic } from "axios";
import type { Episode, omdbResponse } from '../interfaces/omdb.js'
import axiosRetry, { AxiosRetry } from 'axios-retry';
import chalk from "chalk";

export async function checkOnlineDbMovie(titlePart: string, year: number, omdbapikey: string, url: string): Promise<AxiosResponse<omdbResponse>> {
    const params = { apikey: omdbapikey, s: titlePart, r: 'json', y: String(year), type: 'movie' };
    return axios.get<omdbResponse>(url, { params });
}

export async function checkOnlineDbSeries(titlePart: string, omdbapikey: string, url: string): Promise<AxiosResponse<omdbResponse>> {
    const params = { apikey: omdbapikey, s: titlePart, r: 'json', type: 'series' };
    return axios.get<omdbResponse>(url, { params });
}
export async function checkOnlineDbEpisode(title: string, seasonNr: number, episodeNr: number, omdbapikey: string, url: string): Promise<AxiosResponse<Episode>> {
    const params = { apikey: omdbapikey, t: title, r: 'json', type: 'episode', season: String(seasonNr), episode: String(episodeNr) };

    const client = axios.create({
        url: url,
        params: params,
    });

    axiosRetry(client as any, {
        retries: 3,
        retryDelay: axiosRetry.exponentialDelay,
        onRetry: () => {
            process.stdout.write(chalk.blue(`R`))
        }
    });

    return client.get<Episode>(url, { params });
}