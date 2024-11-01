import { StatusCodes } from "http-status-codes";

class BadRequestError extends Error {
  statusCode: number;
  error: string;

  constructor(message: string) {
    super(message);
    this.error= message
    this.statusCode = StatusCodes.BAD_REQUEST;
    this.message = message;
  }
}

export default BadRequestError;
