import { ModuleConfigCollection } from "./types";

const moduleConfig: ModuleConfigCollection = {
  jsonplaceholder: {
    baseURL: "https://jsonplaceholder.typicode.com/"
  },
  tmdb: {
    baseURL: "https://api.themoviedb.org/",
    params: {
      api_key: process.env.TMDB_API_KEY
    }
  }
};

export default moduleConfig;
