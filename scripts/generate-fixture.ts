import { getDeparturesArrivalsData } from "../src/api";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly API_KEY?: string;
    }
  }
}

const apiKey = process.env.API_KEY;

if (!apiKey) {
  throw new Error("Missing API key");
}

const data = await getDeparturesArrivalsData({
  apiKey,
  from: "BSK",
  to: "WIN",
});

console.log(JSON.stringify(data));
