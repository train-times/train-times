import { getDeparturesArrivalsData } from "./api";
import type { LiveDeparturesApiOptions } from "./api";
import { normalizeTrainServicesData } from "./normalize";
import type { TrainJourney } from "./normalize";

async function getJourneyInfo(
  options: LiveDeparturesApiOptions,
): Promise<TrainJourney[]> {
  const data = await getDeparturesArrivalsData(options);
  return normalizeTrainServicesData(data, options.to);
}

export { getJourneyInfo };
