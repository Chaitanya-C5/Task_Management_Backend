export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT: 'RATE_LIMIT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  DUPLICATE_USERNAME: 'DUPLICATE_USERNAME',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TASK_NOT_FOUND: 'TASK_NOT_FOUND',
  CATEGORY_NOT_FOUND: 'CATEGORY_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  INVALID_CATEGORY: 'INVALID_CATEGORY'
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
};

export class AppError extends Error {
  constructor(message, statusCode, errorCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, details) {
    super(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }
}

export class ConflictError extends AppError {
  constructor(message, errorCode = ERROR_CODES.CONFLICT) {
    super(message, HTTP_STATUS.CONFLICT, errorCode);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, HTTP_STATUS.TOO_MANY_REQUESTS, ERROR_CODES.RATE_LIMIT);
  }
}

export const errorHandler = (err, req, res) => {
  let error = { ...err };
  error.message = err.message;

  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message
    }));
    error = new ValidationError('Validation failed', details);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    let errorCode = ERROR_CODES.CONFLICT;
    let message = 'Duplicate field value';

    if (field === 'email') {
      errorCode = ERROR_CODES.DUPLICATE_EMAIL;
      message = 'Email already exists';
    } else if (field === 'username') {
      errorCode = ERROR_CODES.DUPLICATE_USERNAME;
      message = 'Username already exists';
    }

    error = new ConflictError(message, errorCode);
  }

  if (err.name === 'CastError') {
    error = new NotFoundError('Resource');
  }

  if (err.name === 'JsonWebTokenError') {
    error = new UnauthorizedError('Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new UnauthorizedError('Token expired');
  }

  if (err.type === 'entity.parse.failed') {
    error = new ValidationError('Invalid JSON format');
  }

  if (!error.isOperational) {
    error = new AppError(
      'Internal server error',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_CODES.INTERNAL_ERROR
    );
  }

  const errorResponse = {
    success: false,
    error: {
      code: error.errorCode || ERROR_CODES.INTERNAL_ERROR,
      message: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    }
  };

  if (error.details) {
    errorResponse.error.details = error.details;
  }

  res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errorResponse);
};

export const asyncHandler = (fn) => (req, res) => {
  Promise.resolve(fn(req, res)).catch(err => {
    // Forward to error handling middleware
    throw err;
  });
};
export const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError('Route');
  next(error);
};
