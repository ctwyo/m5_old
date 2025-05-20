// controllers/userController.js
import User from "../models/user.js";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Неверный логин" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Неверный пароль" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({
      user: {
        id: user._id,
        username,
        fullName: user.fullName,
        role: user.role,
        email: user.email,
        warehouseId: user.warehouseId,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка входа", error: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ошибка получения пользователя", error: error.message });
  }
};
