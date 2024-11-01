import { StatusCodes } from "http-status-codes";

class UnAuthorizedError extends Error {
  statusCode: number;
  error: string;

  constructor(message: string) {
    super(message);
    this.error = message;
    this.statusCode = StatusCodes.UNAUTHORIZED;
    this.message = message;
  }
}

export default UnAuthorizedError;
