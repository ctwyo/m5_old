// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Произошла ошибка на сервере", error: err.message });
};

export default errorHandler;
