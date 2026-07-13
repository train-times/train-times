import type {
  CallingPointElement,
  LiveDeparturesArrivalsApiResponse,
  TrainService,
} from "#api/types";

import type {
  TrainJourney,
  TrainJourneyCancelled,
  TrainJourneyDelayed,
  TrainJourneyLate,
  TrainJourneyOnTime,
} from "./types";

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

  if (!depH || !arrH) return null;

  const depDate = new Date();
  depDate.setHours(depH, depM, 0, 0);
  const arrDate = new Date();
  arrDate.setHours(arrH, arrM, 0, 0);

  if (arrDate.getTime() < depDate.getTime()) {
    arrDate.setDate(arrDate.getDate() + 1);
  }

  return Math.ceil((arrDate.getTime() - depDate.getTime()) / 60_000);
}

function cleanTimeStr(time?: string): string | null {
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
  let destinationStop: CallingPointElement | undefined;

  if (service.subsequentCallingPoints) {
    const allCallingPoints = service.subsequentCallingPoints.flatMap(
      (scp) => scp.callingPoint,
    );
    destinationStop = allCallingPoints.find((cp) => cp.crs === to);
  }

  const scheduleOriginArrivalTime = service.sta ?? null;

  const scheduleOriginDepartureTime = service.std ?? null;

  const platform = service.platform ?? null;

  const operator = service.operator;
  const operatorCode = service.operatorCode;

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

  const originDepartureTime = cleanTimeStr(
    service.etd === "On time" ? service.std : (service.etd ?? service.std),
  );

  const destinationArrivalTime = destinationStop
    ? cleanTimeStr(
        destinationStop.et === "On time"
          ? destinationStop.st
          : (destinationStop.et ?? destinationStop.st),
      )
    : null;

  const journeyDurationMinutes = getDurationMinutes(
    originDepartureTime,
    destinationArrivalTime,
  );

  const originArrivalTime = cleanTimeStr(
    service.eta === "On time" ? service.sta : (service.eta ?? service.sta),
  );

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
  to: string,
): TrainJourney[] {
  return data.trainServices.map((service) =>
    normalizeTrainServiceData(service, to),
  );
}

export { normalizeTrainServicesData };
export type { TrainJourney };
