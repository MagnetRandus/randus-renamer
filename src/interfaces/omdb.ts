export interface omdbResponse {
    Search: Search[];
    totalResults: string;
    Response: string;
}
export interface Search {
    Title: string;
    Year: string;
    imdbID: string;
    Type: string;
    Poster: string;
}
export interface iOmdbApi {
    key: string;
    url: string;
}

export interface Episode {
    Title: string;
    Year: string;
    Rated: string;
    Released: string;
    Season: string;
    Episode: string;
    Runtime: string;
    Genre: string;
    Director: string;
    Writer: string;
    Actors: string;
    Plot: string;
    Language: string;
    Country: string;
    Awards: string;
    Poster: string;
    Ratings: Rating[];
    Metascore: string;
    imdbRating: string;
    imdbVotes: string;
    imdbID: string;
    seriesID: string;
    Type: string;
    Response: string;
}

interface Rating {
    Source: string;
    Value: string;
}

