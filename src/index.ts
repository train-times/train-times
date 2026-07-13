import { normalizeTrainServicesData } from "./lib/normalize";
import type { TrainJourney } from "./lib/normalize";
import { getDeparturesArrivalsData } from "./api";
import type { LiveDeparturesApiOptions } from "./api";

async function getJourneyInfo(
  options: LiveDeparturesApiOptions,
): Promise<TrainJourney[]> {
  const data = await getDeparturesArrivalsData(options);
  return normalizeTrainServicesData(data, options.to);
}

export { getJourneyInfo };

export type * from "./lib/types";
