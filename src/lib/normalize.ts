import type {
  LiveDeparturesArrivalsApiResponse,
  TrainService,
} from "#api/types";

import type {
  NormalizedTrainServicesData,
  TrainJourney,
  TrainJourneyCancelled,
  TrainJourneyDelayed,
  TrainJourneyLate,
  TrainJourneyOnTime,
} from "./types";

const isValidNumber = (n: number | undefined): n is number =>
  !Number.isNaN(n) && n !== undefined;

function getDurationMinutes(
  fromTime: string | null,
  toTime: string | null,
): number | null {
  if (fromTime === null || toTime === null) return null;

  if (fromTime.includes("Delayed") || toTime.includes("Delayed")) {
    return null;
  }

  const [depH, depM] = fromTime.split(":").map(Number);
  const [arrH, arrM] = toTime.split(":").map(Number);

  if (
    !isValidNumber(depH) ||
    !isValidNumber(depM) ||
    !isValidNumber(arrH) ||
    !isValidNumber(arrM)
  ) {
    return null;
  }

  const depDate = new Date();
  depDate.setHours(depH, depM, 0, 0);
  const arrDate = new Date();
  arrDate.setHours(arrH, arrM, 0, 0);

  if (arrDate.getTime() < depDate.getTime()) {
    arrDate.setDate(arrDate.getDate() + 1);
  }

  return Math.ceil((arrDate.getTime() - depDate.getTime()) / 60_000);
}

function resolveTime(estimated?: string, scheduled?: string): string | null {
  const time = estimated === "On time" ? scheduled : (estimated ?? scheduled);
  if (
    !time ||
    time === "On time" ||
    time === "Delayed" ||
    time === "Cancelled"
  ) {
    return null;
  }
  return time;
}

function normalizeTrainServiceData(
  service: TrainService,
  to: string,
): TrainJourney {
  const destinationStop = service.subsequentCallingPoints
    ?.flatMap((scp) => scp.callingPoint)
    .find((cp) => cp.crs === to);

  const scheduleOriginArrivalTime = service.sta ?? null;

  const scheduleOriginDepartureTime = service.std ?? null;

  const platform = service.platform ?? null;

  const { operator, operatorCode } = service;

  if (service.isCancelled || destinationStop?.isCancelled) {
    return {
      status: "cancelled",
      scheduleOriginArrivalTime,
      scheduleOriginDepartureTime,
      operator,
      operatorCode,
    } satisfies TrainJourneyCancelled;
  }

  if (service.etd === "Delayed") {
    return {
      status: "delayed",
      scheduleOriginArrivalTime,
      scheduleOriginDepartureTime,
      platform,
      operator,
      operatorCode,
    } satisfies TrainJourneyDelayed;
  }

  const originDepartureTime = resolveTime(service.etd, service.std);

  const destinationArrivalTime = resolveTime(
    destinationStop?.et,
    destinationStop?.st,
  );

  const journeyDurationMinutes = getDurationMinutes(
    originDepartureTime,
    destinationArrivalTime,
  );

  const originArrivalTime = resolveTime(service.eta, service.sta);

  const status = service.etd === "On time" || !service.etd ? "on-time" : "late";

  if (status === "late") {
    const arrivalLateByMinutes = getDurationMinutes(
      scheduleOriginArrivalTime,
      originArrivalTime,
    );

    const departureLateByMinutes = getDurationMinutes(
      scheduleOriginDepartureTime,
      originDepartureTime,
    );

    return {
      status,
      scheduleOriginArrivalTime,
      scheduleOriginDepartureTime,
      originArrivalTime,
      originDepartureTime,
      arrivalLateByMinutes,
      departureLateByMinutes,
      platform,
      destinationArrivalTime,
      journeyDurationMinutes,
      operator,
      operatorCode,
    } satisfies TrainJourneyLate;
  }

  return {
    status,
    scheduleOriginArrivalTime,
    scheduleOriginDepartureTime,
    originArrivalTime,
    originDepartureTime,
    platform,
    destinationArrivalTime,
    journeyDurationMinutes,
    operator,
    operatorCode,
  } satisfies TrainJourneyOnTime;
}

function normalizeTrainServicesData(
  data: LiveDeparturesArrivalsApiResponse,
): NormalizedTrainServicesData {
  const journeys = data.trainServices?.map((service) =>
    normalizeTrainServiceData(service, data.filtercrs),
  );

  return {
    journeys,
    fromCode: data.crs,
    fromName: data.locationName,
    toCode: data.filtercrs,
    toName: data.filterLocationName,
  };
}

export { getDurationMinutes, normalizeTrainServicesData };
export type { TrainJourney };
