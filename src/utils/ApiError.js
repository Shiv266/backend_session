// class ApiError can be used to create and customize error objects with specific status codes, messages,
// additional error details, and stack traces. It provides a structured way to handle and communicate errors
// in JavaScript applications.

class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something Went Wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;
    if (stack) {
      this.stack = stack;
    } else {
        
      // `captureStackTrace` is used to enhance custom error handling by providing
      // detailed stack trace information in custom error objects

      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
