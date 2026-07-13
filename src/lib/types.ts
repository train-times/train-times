interface TrainJourneyBase {
  /**
   * The train's schedule time of departure
   *
   * This is the time when the train is expected to departure from the station you are departing from, if it is not delayed
   */
  readonly scheduleOriginDepartureTime: string | null;
  /**
   * The train's schedule time of arrival to the station you are departing from
   *
   * This is the time when the train is expected to arrive to the station you are departing from, if it is not delayed
   */
  readonly scheduleOriginArrivalTime: string | null;
  /**
   * The train operator
   */
  readonly operator: string;
  /**
   * The train operator code
   */
  readonly operatorCode: string;
}

interface TrainJourneyNormalBase extends TrainJourneyBase {
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
  /**
   * Platform the train arrives on
   */
  readonly platform: string | null;
}

interface TrainJourneyOnTime extends TrainJourneyNormalBase {
  readonly status: "on-time";
}

interface TrainJourneyLate extends TrainJourneyNormalBase {
  readonly status: "late";
  /**
   * How many minutes the train is late to arriving to the station you are departing from
   */
  readonly arrivalLateByMinutes: number | null;
  /**
   * How many minutes the train is late to departing from the station you are departing from
   */
  readonly departureLateByMinutes: number | null;
}

interface TrainJourneyCancelled extends TrainJourneyBase {
  readonly status: "cancelled";
}

interface TrainJourneyDelayed extends TrainJourneyBase {
  readonly status: "delayed";
  /**
   * Platform the train arrives on
   */
  readonly platform: string | null;
}

type TrainJourneyNormal = TrainJourneyOnTime | TrainJourneyLate;

type TrainJourneyDisrupted = TrainJourneyCancelled | TrainJourneyDelayed;

type TrainJourney = TrainJourneyNormal | TrainJourneyDisrupted;

export type {
  TrainJourney,
  TrainJourneyCancelled,
  TrainJourneyDelayed,
  TrainJourneyDisrupted,
  TrainJourneyLate,
  TrainJourneyNormal,
  TrainJourneyOnTime,
};
