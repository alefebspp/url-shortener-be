import { HTTP_STATUS } from "@/constants";
import { AppError } from "@/errors";
import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import {
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
} from "fastify-type-provider-zod";

export function globalErrorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  console.log("ERROR:", error);

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({ message: error.message });
  }

  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.code(HTTP_STATUS.BAD_REQUEST).send({
      error: {
        message: "Request doesn't match the schema",
        statusCode: HTTP_STATUS.BAD_REQUEST,
      },
      details: {
        issues: error.message,
        method: request.method,
        url: request.url,
      },
    });
  }

  if (isResponseSerializationError(error)) {
    return reply.code(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      error: {
        message: "Response doesn't match the schema",
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      },
      details: {
        issues: error.cause.issues,
        method: error.method,
        url: error.url,
      },
    });
  }

  reply
    .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    .send({ message: "Internal server error" });
}
