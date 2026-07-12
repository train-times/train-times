import type {
  CallingPointElement,
  LiveDeparturesApiResponse,
  TrainService,
} from "./types";

interface TrainJourneyOnTimeOrDelayed {
  readonly isCancelled: false;
  readonly status: "on-time" | "delayed" | "significantly-delayed";
  readonly scheduledOriginArrivalTime: string | null;
  readonly originArrivalTime: string | null;
  readonly originDepartureTime: string | null;
  readonly platform: string | null;
  readonly destinationArrivalTime: string | null;
  readonly durationMinutes: number | null;
}

interface TrainJourneyCanceled {
  readonly isCancelled: true;
  readonly status: "cancelled";
  readonly scheduledOriginArrivalTime: string | null;
  readonly platform: string | null;
}

type TrainJourney = TrainJourneyOnTimeOrDelayed | TrainJourneyCanceled;

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

  const scheduledOriginArrivalTime =
    (service.eta === "On time"
      ? (service.sta ?? service.std)
      : (service.eta ?? service.sta)) ?? null;

  const platform = service.platform ?? null;

  if (service.isCancelled || destinationStop?.isCancelled) {
    return {
      isCancelled: true,
      status: "cancelled",
      scheduledOriginArrivalTime,
      platform,
    } satisfies TrainJourneyCanceled;
  }

  const originDepartureTime =
    (service.etd === "On time" ? service.std : (service.etd ?? service.std)) ??
    null;

  const destinationArrivalTime = destinationStop
    ? destinationStop.et === "On time"
      ? destinationStop.st
      : (destinationStop.et ?? destinationStop.st)
    : null;

  const durationMinutes =
    originDepartureTime && destinationArrivalTime
      ? getDurationMinutes(originDepartureTime, destinationArrivalTime)
      : null;

  const originArrivalTime =
    service.etd === "On time"
      ? scheduledOriginArrivalTime
      : (service.etd ?? "Delayed");

  const status =
    service.etd === "On time"
      ? "on-time"
      : service.etd
        ? "delayed"
        : "significantly-delayed";

  return {
    isCancelled: false,
    status,
    scheduledOriginArrivalTime,
    originArrivalTime,
    originDepartureTime,
    platform,
    destinationArrivalTime,
    durationMinutes,
  } satisfies TrainJourneyOnTimeOrDelayed;
}

function normalizeTrainServicesData(
  data: LiveDeparturesApiResponse,
  to: string,
): TrainJourney[] {
  return data.trainServices.map((service) =>
    normalizeTrainServiceData(service, to),
  );
}

export { normalizeTrainServicesData };
export type { TrainJourney };
