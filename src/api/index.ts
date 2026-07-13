import type { LiveDeparturesArrivalsApiResponse } from "./types";

const API_URL =
  "https://api1.raildata.org.uk/1010-live-arrival-and-departure-boards-arr-and-dep1_1/LDBWS/api/20220120/GetArrDepBoardWithDetails";

interface LiveDeparturesApiOptions {
  /**
   * Your api key from [Rail Data Marketplace](https://raildata.org.uk)
   */
  apiKey: string;
  /**
   * The station you are departing from
   */
  from: string;
  /**
   * The destination station
   */
  to: string;
  /**
   * Number of journey rows to return
   * @default 10
   */
  numRows?: number;
  /**
   * Time offset from current time in minutes
   * @default 0
   */
  timeOffset?: number;
  /**
   * Time window to search within in minutes
   * @default 120
   */
  timeWindow?: number;
}

async function getDeparturesArrivalsData({
  apiKey,
  from,
  to,
  numRows = 10,
  timeOffset = 0,
  timeWindow = 120,
}: LiveDeparturesApiOptions): Promise<LiveDeparturesArrivalsApiResponse> {
  const url = new URL(`${API_URL}/${from}`);

  url.searchParams.append("numRows", String(numRows));
  url.searchParams.append("filterCrs", to);
  url.searchParams.append("filterType", "to");
  url.searchParams.append("timeOffset", String(timeOffset));
  url.searchParams.append("timeWindow", String(timeWindow));

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { "x-apikey": apiKey, Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`HTTP network error! status Code: ${response.status}`);
  }

  return await response.json();
}

export { getDeparturesArrivalsData };
export type { LiveDeparturesApiOptions };
