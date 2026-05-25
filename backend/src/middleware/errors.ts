import type { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response } from "express";
import { ZodError, type ZodSchema } from "zod";

export type ErrorCode = "VALIDATION_ERROR" | "NOT_FOUND" | "INTERNAL_ERROR";

export type ErrorResponse = {
  error: {
    code: ErrorCode;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
};

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: ErrorResponse["error"]["details"]
  ) {
    super(message);
  }
}

export const notFoundHandler = (message = "Resource not found") => new HttpError(404, "NOT_FOUND", message);

const detailsFromZod = (error: ZodError): ErrorResponse["error"]["details"] =>
  error.issues.map((issue) => ({
    field: issue.path.join(".") || "body",
    message: issue.message
  }));

export const validationError = (error: ZodError) =>
  new HttpError(400, "VALIDATION_ERROR", "Request validation failed", detailsFromZod(error));

export const validateBody =
  <T>(schema: ZodSchema<T>): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      next(validationError(parsed.error));
      return;
    }

    req.body = parsed.data;
    next();
  };

export const validateQuery =
  <T>(schema: ZodSchema<T>): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      next(validationError(parsed.error));
      return;
    }

    res.locals.query = parsed.data;
    next();
  };

export const errorHandler: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
  if (err instanceof HttpError) {
    const body: ErrorResponse = {
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {})
      }
    };
    res.status(err.status).json(body);
    return;
  }

  const message = err instanceof Error ? err.message : "Unknown error";
  console.error(`Unexpected error: ${message}`);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Unexpected server error"
    }
  } satisfies ErrorResponse);
};
