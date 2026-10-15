class TrainTimesError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "TrainTimesError";
  }
}

class ApiError extends TrainTimesError {
  constructor(statusCode: number, message: string) {
    super(statusCode, message);
    this.name = "ApiError";
  }
}

class NetworkError extends TrainTimesError {
  constructor(statusCode: number, message: string) {
    super(statusCode, message);
    this.name = "NetworkError";
  }
}

export { TrainTimesError, ApiError, NetworkError };
