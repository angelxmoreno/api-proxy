import axios from "axios";
import express, { Application, Request, Response } from "express";
import md5 from "md5";
import NodeCache from "node-cache";
const myCache = new NodeCache( { stdTTL: 100, checkperiod: 120 } );
const app: Application = express();
const port: number = 3002;

interface ModuleConfig {
  baseURL: string;
}
interface ModuleConfigCollection {
  [key: string]: ModuleConfig;
}

interface RequestInfo {
  method: string;
  baseURL: string;
  url: string;
  data: string;
}

interface ResponseInfo {
  status: number;
  data: string;
}
const moduleConfig: ModuleConfigCollection = {
  jsonplaceholder: {
    baseURL: "https://jsonplaceholder.typicode.com/"
  }
};

const buildRequestInfoFromServerRequest = (req: Request) => {
  const module = moduleConfig[req.params.module];
  const baseURL = module.baseURL;
  const url = req.params[0];
  const data = req.query;
  const method = req.method;

  return {
    url,
    method,
    baseURL,
    data
  };
};

const getResponseFromRequestInfo = async (
  requestInfo: RequestInfo
): Promise<ResponseInfo> => {
  const response = await axios.request(requestInfo);
  const data: string = response.data;
  const status: number = response.status;
  return { status, data };
};

const buildEtag = (requestInfo: RequestInfo) =>
  md5(JSON.stringify(requestInfo));

app.all("/api/:module/**", async (req: Request, res: Response) => {
  try {
    const requestInfo = buildRequestInfoFromServerRequest(req);
    const etag = buildEtag(requestInfo);
    const cached = await myCache.get(etag);
    let response;
    if (cached === undefined) {
      console.info("cached is undefined: ", etag);
      response = await getResponseFromRequestInfo(requestInfo);
      myCache.set(etag, response);
    } else {
      console.info("found cache: ", etag);
      response = cached as ResponseInfo;
    }

    res.status(response.status).send(response.data);
  } catch (err) {
    res.json({
      error: true,
      msg: err.message,
      err
    });
  }
});

app.listen(port, () => {
  // Success callback
  console.log(`Listening at http://localhost:${port}/`);
});
