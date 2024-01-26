// wrapper HOF that will handle asynchronous functions used in our app
// const asyncHandler = (fn) => {
//   return async (req, res, next) => {
//     try {
//       await fn(req, res, next);
//     } catch (error) {
//       res.status(500).json({
//         succuss: false,
//         message: error.message,
//       });
//     }
//   };
// };

const asyncHandler = (callBack) => {
  return (req, res, next) => {
    Promise.resolve(callBack(req, res, next)).catch((error) => next(error));
  };
};

export { asyncHandler };
