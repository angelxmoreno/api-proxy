import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import express, { Application, Request, Response } from "express";
import md5 from "md5";
import NodeCache from "node-cache";
import moduleConfig from "./modules";
import { ProxyRequestInfo, ProxyResponseInfo } from "./types";
const myCache = new NodeCache({ stdTTL: 100, checkperiod: 120 });
const app: Application = express();
const port: number = 3002;

const buildProxyRequestInfoFromServerRequest = (req: Request) => {
  let params;
  const module = moduleConfig[req.params.module];
  const baseURL = module.baseURL;
  const url = req.params[0];
  params = req.query;
  const method = req.method;
  if (module.params) {
    params = { ...module.params, ...params };
  }

  return {
    url,
    method,
    baseURL,
    params
  };
};

const getResponseFromProxyRequestInfo = async (
  requestInfo: ProxyRequestInfo
): Promise<ProxyResponseInfo> => {
  console.log("calling", requestInfo);
  const response = await axios.request(requestInfo);
  const data: string = response.data;
  const status: number = response.status;
  return { status, data };
};

const buildEtag = (requestInfo: ProxyRequestInfo) =>
  md5(JSON.stringify(requestInfo));

app.all("/api/:module/**", async (req: Request, res: Response) => {
  try {
    const requestInfo = buildProxyRequestInfoFromServerRequest(req);
    const etag = buildEtag(requestInfo);
    const cached = await myCache.get(etag);
    let response;
    if (cached === undefined) {
      console.info("cached is undefined: ", etag);
      response = await getResponseFromProxyRequestInfo(requestInfo);
      myCache.set(etag, response);
    } else {
      console.info("found cache: ", etag);
      response = cached as ProxyResponseInfo;
    }

    res.status(response.status).send(response.data);
  } catch (err) {
    console.info("found error");
    res.json({
      error: true,
      msg: err.message
    });
  }
});

app.listen(port, () => {
  // Success callback
  console.log(`Listening at http://localhost:${port}/`);
});
