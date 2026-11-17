# `train-times`

Typed client for the UK Rail Data live departure boards API: live arrivals and departures between two stations.

## Install

```sh
npm install train-times
```

## Usage

```js
import { getJourneysData } from "train-times";

const data = await getJourneysData({
  apiKey: "your-api-key",
  from: "BSK", // Basingstoke
  to: "WIN", // Winchester
});

if (!data.journeys?.length) {
  console.log(
    `No upcoming trains from ${data.fromName} to ${data.toName} found`,
  );
} else {
  console.log(`Upcoming trains from ${data.fromName} to ${data.toName} found:`);
  console.table(data.journeys);
}
```

## API

### `getJourneysData(options)`

Fetches the live departure board for a station and normalizes it into journey data.

```ts
getJourneysData(options: LiveDeparturesApiOptions): Promise<NormalizedTrainServicesData>
```

```js
await getJourneysData({
  apiKey: "your-api-key",
  from: "BSK",
  to: "WIN",
});
// => {
//   fromCode: "BSK",
//   fromName: "Basingstoke",
//   toCode: "WIN",
//   toName: "Winchester",
//   journeys: [ ... ],
// }
```

### `LiveDeparturesApiOptions`

Options accepted by [`getJourneysData`](#getjourneysdataoptions) and [`getDeparturesArrivalsData`](#getdeparturesarrivalsdataoptions).

```ts
interface LiveDeparturesApiOptions {
  /** Your api key from [Rail Data Marketplace](https://raildata.org.uk) */
  apiKey: string;
  /** The CRS code of the station you are departing from */
  from: string;
  /** The CRS code of the destination station */
  to: string;
  /** Number of journey rows to return */
  numRows?: number; // default: 10
  /** Time offset from current time in minutes */
  timeOffset?: number; // default: 0
  /** Time window to search within in minutes. Maximum is `120` minutes */
  timeWindow?: number; // default: 120
}
```

### `getDeparturesArrivalsData(options)`

Fetches the raw live arrivals and departures board response from the API.

```ts
getDeparturesArrivalsData(options: LiveDeparturesApiOptions): Promise<LiveDeparturesArrivalsApiResponse>
```

```js
await getDeparturesArrivalsData({
  apiKey: "your-api-key",
  from: "BSK",
  to: "WIN",
});
// => {
//   generatedAt: "2026-11-17T08:57:41.411Z",
//   locationName: "Basingstoke",
//   crs: "BSK",
//   filterLocationName: "Winchester",
//   filtercrs: "WIN",
//   trainServices: [ ... ],
//   ...
// }
```

### `normalizeTrainServicesData(data)`

Normalizes a raw [`LiveDeparturesArrivalsApiResponse`](#livedeparturesarrivalsapiresponse) into [`NormalizedTrainServicesData`](#normalizedtrainservicesdata). Accepts the data returned by [`getDeparturesArrivalsData`](#getdeparturesarrivalsdataoptions).

```ts
normalizeTrainServicesData(data: LiveDeparturesArrivalsApiResponse): NormalizedTrainServicesData
```

```js
const data = await getDeparturesArrivalsData({
  apiKey: "your-api-key",
  from: "BSK",
  to: "WIN",
});

normalizeTrainServicesData(data);
// => {
//   fromCode: "BSK",
//   fromName: "Basingstoke",
//   toCode: "WIN",
//   toName: "Winchester",
//   journeys: [ ... ],
// }
```

### `NormalizedTrainServicesData`

Normalized departure board data returned by [`getJourneysData`](#getjourneysdataoptions) and [`normalizeTrainServicesData`](#normalizetrainservicesdatadata).

```ts
interface NormalizedTrainServicesData {
  readonly journeys?: TrainJourney[];
  readonly fromCode: string;
  readonly toCode: string;
  readonly fromName: string;
  readonly toName: string;
}
```

### `TrainJourney`

A single train journey, discriminated by `status`.

```ts
type TrainJourney =
  | TrainJourneyOnTime
  | TrainJourneyLate
  | TrainJourneyDelayed
  | TrainJourneyCancelled;

type TrainJourneyNormal = TrainJourneyOnTime | TrainJourneyLate;
type TrainJourneyDisrupted = TrainJourneyCancelled | TrainJourneyDelayed;
```

| Status        | Meaning                                             |
| ------------- | --------------------------------------------------- |
| `"on-time"`   | Train runs on time                                  |
| `"late"`      | Train is late                                       |
| `"delayed"`   | Train is delayed (departure time not yet confirmed) |
| `"cancelled"` | Train is cancelled                                  |

All journeys share the base fields:

```ts
interface TrainJourneyBase {
  readonly scheduleOriginDepartureTime: string | null;
  readonly scheduleOriginArrivalTime: string | null;
  readonly operator: string;
  readonly operatorCode: string;
}
```

On time and late journeys additionally include:

```ts
interface TrainJourneyNormalBase extends TrainJourneyBase {
  readonly originArrivalTime: string | null;
  readonly originDepartureTime: string | null;
  readonly destinationArrivalTime: string | null;
  readonly journeyDurationMinutes: number | null;
  readonly platform: string | null;
}
```

Late journeys also include:

```ts
interface TrainJourneyLate extends TrainJourneyNormalBase {
  readonly status: "late";
  readonly arrivalLateByMinutes: number | null;
  readonly departureLateByMinutes: number | null;
}
```

```js
{
  status: "on-time",
  scheduleOriginDepartureTime: "09:03",
  scheduleOriginArrivalTime: "09:02",
  originArrivalTime: "09:02",
  originDepartureTime: "09:03",
  destinationArrivalTime: "09:21",
  journeyDurationMinutes: 18,
  platform: "2",
  operator: "South Western Railway",
  operatorCode: "SW",
}

{
  status: "late",
  scheduleOriginDepartureTime: "09:11",
  scheduleOriginArrivalTime: "09:10",
  originArrivalTime: "09:22",
  originDepartureTime: "09:23",
  arrivalLateByMinutes: 12,
  departureLateByMinutes: 12,
  destinationArrivalTime: "09:37",
  journeyDurationMinutes: 14,
  platform: "1",
  operator: "CrossCountry",
  operatorCode: "XC",
}

{
  status: "delayed",
  scheduleOriginDepartureTime: "09:11",
  scheduleOriginArrivalTime: "09:10",
  platform: "1",
  operator: "CrossCountry",
  operatorCode: "XC",
}

{
  status: "cancelled",
  scheduleOriginDepartureTime: "09:11",
  scheduleOriginArrivalTime: "09:10",
  operator: "CrossCountry",
  operatorCode: "XC",
}
```

### `TrainTimesError`, `ApiError`, `NetworkError`

Errors thrown when the API request fails. All extend `Error` and carry a `statusCode`.

```ts
class TrainTimesError extends Error {
  statusCode: number;
}

class ApiError extends TrainTimesError {} // API responded with an error message
class NetworkError extends TrainTimesError {} // API responded without an error message
```

```js
import { getJourneysData, ApiError, NetworkError } from "train-times";

try {
  await getJourneysData({ apiKey: "invalid", from: "BSK", to: "WIN" });
} catch (error) {
  if (error instanceof ApiError) {
    console.log(error.statusCode, error.message);
  } else if (error instanceof NetworkError) {
    console.log(error.statusCode, error.message);
  }
}
```

### `LiveDeparturesArrivalsApiResponse`

The raw API response type returned by [`getDeparturesArrivalsData`](#getdeparturesarrivalsdataoptions).

```ts
interface LiveDeparturesArrivalsApiResponse {
  trainServices?: TrainService[];
  generatedAt: string;
  locationName: string;
  crs: string;
  filterLocationName: string;
  filtercrs: string;
  nrccMessages: NrccMessage[];
  platformAvailable: boolean;
  areServicesAvailable: boolean;
}
```
