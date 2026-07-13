import { getDeparturesArrivalsData } from "./api";
import type { LiveDeparturesApiOptions } from "./api";
import { normalizeTrainServicesData } from "./lib/normalize";
import type { TrainJourney } from "./lib/normalize";

async function getJourneysData(
  options: LiveDeparturesApiOptions,
): Promise<TrainJourney[]> {
  const data = await getDeparturesArrivalsData(options);
  return normalizeTrainServicesData(data, options.to);
}

export {
  getJourneysData,
  getDeparturesArrivalsData,
  normalizeTrainServicesData,
};

export type { LiveDeparturesApiOptions };

export type { LiveDeparturesArrivalsApiResponse } from "./api/types";

export type * from "./lib/types";
