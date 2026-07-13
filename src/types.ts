export interface LiveDeparturesArrivalsApiResponse {
  trainServices: TrainService[];
  Xmlns: Xmlns;
  generatedAt: string;
  locationName: string;
  crs: string;
  filterLocationName: string;
  filtercrs: string;
  filterType: string;
  nrccMessages: NrccMessage[];
  platformAvailable: boolean;
  areServicesAvailable: boolean;
}

export interface Xmlns {
  Count: number;
}

export interface NrccMessage {
  Value: string;
}

export interface TrainService {
  previousCallingPoints?: CallingPoint[];
  subsequentCallingPoints?: CallingPoint[];
  futureCancellation: boolean;
  futureDelay: boolean;
  origin: Destination[];
  destination: Destination[];
  sta?: string;
  eta?: string;
  std?: string;
  etd?: string;
  platform?: string;
  operator: string;
  operatorCode: string;
  isCircularRoute: boolean;
  isCancelled: boolean;
  filterLocationCancelled: boolean;
  serviceType: "train";
  length: number;
  detachFront: boolean;
  isReverseFormation: boolean;
  delayReason?: string;
  serviceID: string;
  rsid?: string;
  cancelReason?: string;
}

export interface Destination {
  locationName: string;
  crs: string;
  assocIsCancelled: boolean;
  via?: string;
}

export interface CallingPoint {
  callingPoint: CallingPointElement[];
  serviceType: "train";
  serviceChangeRequired: boolean;
  assocIsCancelled: boolean;
}

export interface CallingPointElement {
  locationName: string;
  crs: string;
  st: string;
  at?: string;
  isCancelled: boolean;
  length: number;
  detachFront: boolean;
  delayReason?: string;
  affectedByDiversion: boolean;
  rerouteDelay: number;
  et?: string;
  cancelReason?: string;
}
