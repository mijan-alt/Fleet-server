import { StatusCodes } from "http-status-codes";

class UnAuthenticatedError extends Error {
  statusCode: number;
  error: string;

  constructor(message: string) {
    super(message);
    this.message = message;
    this.error = message;
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}

export default UnAuthenticatedError;
