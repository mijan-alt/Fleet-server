import { StatusCodes } from "http-status-codes";

class NotfoundError extends Error {
  statusCode: number;
  error: string;

  constructor(message: string) {
    super(message);
    this.error= message
    this.statusCode = StatusCodes.NOT_FOUND;
    this.message = message;
  }
}

export default NotfoundError;
