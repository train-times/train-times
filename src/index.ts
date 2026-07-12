import type { CallingPointElement, LiveDeparturesApiResponse } from "./types";

const API_URL =
  "https://api1.raildata.org.uk/1010-live-arrival-and-departure-boards-arr-and-dep1_1/LDBWS/api/20220120/GetArrDepBoardWithDetails";

export interface LiveDeparturesApiOptions {
  apiKey: string;
  from: string;
  to: string;
}

export interface NormalizedTrainJourney {
  status: string;
  originArrivalTime: string;
  originDepartureTime: string;
  platform: string;
  destinationArrivalTime: string;
  duration: string;
}

async function getJourneyInfo({
  apiKey,
  from,
  to,
}: LiveDeparturesApiOptions): Promise<NormalizedTrainJourney[]> {
  const url = new URL(`${API_URL}/${from}`);

  url.searchParams.append("numRows", "10");
  url.searchParams.append("filterCrs", to);
  url.searchParams.append("filterType", "to");
  url.searchParams.append("timeOffset", "0");
  url.searchParams.append("timeWindow", "120");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { "x-apikey": apiKey, Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`HTTP network error! status Code: ${response.status}`);
  }

  const data: LiveDeparturesApiResponse = await response.json();

  return data.trainServices.map((service) => {
    let destinationStop: CallingPointElement | undefined = undefined;
    if (
      service.subsequentCallingPoints &&
      service.subsequentCallingPoints.length > 0
    ) {
      const pointsList = service.subsequentCallingPoints[0]?.callingPoint || [];
      destinationStop = pointsList.find((cp) => cp.crs === to);
    }

    const originArrivalStr =
      service.eta === "On time"
        ? (service.sta ?? service.std ?? "?")
        : (service.eta ?? service.sta ?? "?");

    if (service.isCancelled || destinationStop?.isCancelled) {
      return {
        status: "Cancelled",
        originArrivalTime: originArrivalStr,
        originDepartureTime: "Cancelled",
        platform: service.platform ?? "-",
        destinationArrivalTime: "Cancelled",
        duration: "-",
      } as const;
    }

    const originDepartStr =
      service.etd === "On time" ? service.std : (service.etd ?? service.std);
    const destArriveStr = destinationStop
      ? destinationStop.et === "On time"
        ? destinationStop.st
        : (destinationStop.et ?? destinationStop.st)
      : "?";

    let durationStr = "-";
    if (
      originDepartStr &&
      destArriveStr &&
      !originDepartStr.includes("Delayed") &&
      !destArriveStr.includes("Delayed")
    ) {
      const [depH, depM] = originDepartStr.split(":").map(Number);
      const [arrH, arrM] = destArriveStr.split(":").map(Number);

      const depDate = new Date();
      depDate.setHours(depH!, depM, 0, 0);
      const arrDate = new Date();
      arrDate.setHours(arrH!, arrM, 0, 0);

      if (arrDate.getTime() < depDate.getTime()) {
        arrDate.setDate(arrDate.getDate() + 1);
      }

      const diffMins = Math.round(
        (arrDate.getTime() - depDate.getTime()) / 60000,
      );
      durationStr = `${diffMins}m`;
    }

    return {
      status:
        service.etd === "On time"
          ? originArrivalStr
          : (service.etd ?? "Delayed"),
      originArrivalTime: originArrivalStr,
      originDepartureTime: originDepartStr ?? "?",
      platform: service.platform ?? "TBD",
      destinationArrivalTime: destArriveStr,
      duration: durationStr,
    } as const;
  });
}

export { getJourneyInfo };
