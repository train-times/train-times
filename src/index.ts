import { getDeparturesArrivalsData } from "./api";
import type { LiveDeparturesApiOptions } from "./api";
import { normalizeTrainServicesData } from "./lib/normalize";
import type { NormalizedTrainServicesData } from "./lib/types";

async function getJourneysData(
  options: LiveDeparturesApiOptions,
): Promise<NormalizedTrainServicesData> {
  const data = await getDeparturesArrivalsData(options);
  return normalizeTrainServicesData(data);
}

export {
  getJourneysData,
  getDeparturesArrivalsData,
  normalizeTrainServicesData,
};

export type { LiveDeparturesApiOptions };

export { TrainTimesError, ApiError, NetworkError } from "./api/errors";
export type { LiveDeparturesArrivalsApiResponse } from "./api/types";

export type * from "./lib/types";
