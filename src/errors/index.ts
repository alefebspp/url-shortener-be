import { HTTP_STATUS } from "@/constants";

export class AppError extends Error {
  public readonly message: string;

  public readonly statusCode: number;

  constructor(statusCode = 400, message: string) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad Request") {
    super(HTTP_STATUS.BAD_REQUEST, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not Found") {
    super(HTTP_STATUS.NOT_FOUND, message);
  }
}
