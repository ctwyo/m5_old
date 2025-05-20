// middleware/auth.js
import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token)
    return res
      .status(401)
      .json({ message: "Не авторизован, токен отсутствует" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    res.status(401).json({ message: "Неверный токен", error: error.message });
  }
};

export { protect }; // Именованный экспорт вместо export default { protect }
