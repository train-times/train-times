import type {
  CallingPointElement,
  LiveDeparturesArrivalsApiResponse,
  TrainService,
} from "./types";

interface TrainJourneyBase {
  /**
   * The train's scheduled time of arrival to the station you are departing from
   * This is the time when the train is expected to arrive to the station you are departing from, if it is not delayed
   */
  readonly scheduledOriginArrivalTime: string | null;
  /**
   * Platform the train arrives on
   */
  readonly platform: string | null;
}

interface TrainJourneyNormal extends TrainJourneyBase {
  readonly status: "on-time" | "delayed";
  /**
   * The time the train is expected to arrive to the station you are departing from
   */
  readonly originArrivalTime: string | null;
  /**
   * The time the train is expected to departure from the station you are departing from
   */
  readonly originDepartureTime: string | null;
  /**
   * The time the train is expected to arrive to the destination
   */
  readonly destinationArrivalTime: string | null;
  /**
   * The duration of the journey in minutes
   */
  readonly durationMinutes: number | null;
}

interface TrainJourneyDisrupted extends TrainJourneyBase {
  readonly status: "significantly-delayed" | "cancelled";
}

type TrainJourney = TrainJourneyNormal | TrainJourneyDisrupted;

function getDurationMinutes(
  originDepartureTime: string,
  destinationArrivalTime: string,
): number | null {
  if (
    originDepartureTime.includes("Delayed") ||
    destinationArrivalTime.includes("Delayed")
  ) {
    return null;
  }

  const [depH, depM] = originDepartureTime.split(":").map(Number);
  const [arrH, arrM] = destinationArrivalTime.split(":").map(Number);

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

  const scheduledOriginArrivalTime = service.sta ?? null;

  const platform = service.platform ?? null;

  if (service.isCancelled || destinationStop?.isCancelled) {
    return {
      status: "cancelled",
      scheduledOriginArrivalTime,
      platform,
    } satisfies TrainJourneyDisrupted;
  }

  if (service.etd === "Delayed") {
    return {
      status: "significantly-delayed",
      scheduledOriginArrivalTime,
      platform,
    } satisfies TrainJourneyDisrupted;
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

  const durationMinutes =
    originDepartureTime && destinationArrivalTime
      ? getDurationMinutes(originDepartureTime, destinationArrivalTime)
      : null;

  const originArrivalTime = cleanTimeStr(
    service.eta === "On time" ? service.sta : (service.eta ?? service.sta),
  );

  const status =
    service.etd === "On time" || !service.etd ? "on-time" : "delayed";

  return {
    status,
    scheduledOriginArrivalTime,
    originArrivalTime,
    originDepartureTime,
    platform,
    destinationArrivalTime,
    durationMinutes,
  } satisfies TrainJourneyNormal;
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
