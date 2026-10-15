import type { LiveDeparturesArrivalsApiResponse } from "#api/types";

export const example4 = {
  generatedAt: "2026-10-14T17:28:18.8395411+01:00",
  locationName: "Basingstoke",
  crs: "BSK",
  filterLocationName: "Guildford",
  filtercrs: "GLD",
  filterType: "to",
  nrccMessages: [
    {
      Value:
        "The accessible toilets on platforms 2 and 3, and the gentlemen's &amp; ladies' toilets on platform 4 are out of order at Basingstoke station.",
    },
  ],
  platformAvailable: true,
  areServicesAvailable: true,
  Xmlns: {
    Count: 8,
  },
} satisfies LiveDeparturesArrivalsApiResponse;
