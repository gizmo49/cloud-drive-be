import { Response } from "express";

export interface ResponseData {
  success: boolean;
  message: string;
  data?: any;
  timestamp?: number;
  requestId?: string;
  path?: string;
}

export interface ResponseOptions {
  cacheControl?: string;
  customHeaders?: Record<string, string>;
}

const RESPONSE_MESSAGES = {
  SUCCESS: "Action completed successfully",
  BAD_REQUEST: "Bad Request",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  NOT_FOUND: "Not found",
  DUPLICATE: "Duplicate records found",
  VALIDATION_FAILED: "Validation failed",
  INTERNAL_SERVER_ERROR: "Internal Server Error"
} as const;

const HTTP_STATUS_CODES = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  DUPLICATE: 409,
  VALIDATION_FAILED: 422,
  INTERNAL_SERVER_ERROR: 500
} as const;

class ResponseBuilder {
  private response: ResponseData = {
    success: true,
    message: RESPONSE_MESSAGES.SUCCESS,
    timestamp: Date.now()
  };

  private statusCode: number = HTTP_STATUS_CODES.SUCCESS;
  private options: ResponseOptions = {};

  withSuccess(success: boolean): ResponseBuilder {
    this.response.success = success;
    return this;
  }

  withMessage(message: string): ResponseBuilder {
    this.response.message = message;
    return this;
  }

  withData(data: any): ResponseBuilder {
    this.response.data = data;
    return this;
  }

  withStatusCode(code: number): ResponseBuilder {
    this.statusCode = code;
    return this;
  }

  withRequestContext(req: any): ResponseBuilder {
    this.response.requestId = req.id;
    this.response.path = req.path;
    return this;
  }

  withCacheControl(value: string): ResponseBuilder {
    this.options.cacheControl = value;
    return this;
  }

  withCustomHeaders(headers: Record<string, string>): ResponseBuilder {
    this.options.customHeaders = headers;
    return this;
  }

  send(res: Response): Response {
    if (this.options.cacheControl) {
      res.setHeader('Cache-Control', this.options.cacheControl);
    }

    if (this.options.customHeaders) {
      Object.entries(this.options.customHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
    }

    return res.status(this.statusCode).json(this.response);
  }
}

export function createResponseBuilder(): ResponseBuilder {
  return new ResponseBuilder();
}


// Helper Functions
export const _SUCCESS = (res: Response, data?: any, message?: string) => {
  return createResponseBuilder()
    .withSuccess(true)
    .withMessage(message || RESPONSE_MESSAGES.SUCCESS)
    .withData(data)
    .send(res);
};

export const _BAD_REQUEST = (res: Response, data?: any, message?: string) => {
  return createResponseBuilder()
    .withSuccess(false)
    .withStatusCode(HTTP_STATUS_CODES.BAD_REQUEST)
    .withMessage(message || RESPONSE_MESSAGES.BAD_REQUEST)
    .withData(data)
    .send(res);
};

export const _UNAUTHORIZED = (res: Response, data?: any, message?: string) => {
  return createResponseBuilder()
    .withSuccess(false)
    .withStatusCode(HTTP_STATUS_CODES.UNAUTHORIZED)
    .withMessage(message || RESPONSE_MESSAGES.UNAUTHORIZED)
    .withData(data)
    .send(res);
};

export const _FORBIDDEN = (res: Response, data?: any, message?: string) => {
  return createResponseBuilder()
    .withSuccess(false)
    .withStatusCode(HTTP_STATUS_CODES.FORBIDDEN)
    .withMessage(message || RESPONSE_MESSAGES.FORBIDDEN)
    .withData(data)
    .send(res);
};

export const _NOT_FOUND = (res: Response, data?: any, message?: string) => {
  return createResponseBuilder()
    .withSuccess(false)
    .withStatusCode(HTTP_STATUS_CODES.NOT_FOUND)
    .withMessage(message || RESPONSE_MESSAGES.NOT_FOUND)
    .withData(data)
    .send(res);
};

export const _DUPLICATE = (res: Response, data?: any, message?: string) => {
  return createResponseBuilder()
    .withSuccess(false)
    .withStatusCode(HTTP_STATUS_CODES.DUPLICATE)
    .withMessage(message || RESPONSE_MESSAGES.DUPLICATE)
    .withData(data)
    .send(res);
};

export const _VALIDATION_FAILED = (res: Response, data?: any, message?: string) => {
  return createResponseBuilder()
    .withSuccess(false)
    .withStatusCode(HTTP_STATUS_CODES.VALIDATION_FAILED)
    .withMessage(message || RESPONSE_MESSAGES.VALIDATION_FAILED)
    .withData(data)
    .send(res);
};

export const _INTERNAL_ERROR = (res: Response, message?: string) => {
  return createResponseBuilder()
    .withSuccess(false)
    .withStatusCode(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
    .withMessage(message || RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR)
    .send(res);
};
