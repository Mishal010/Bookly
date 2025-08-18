import jwt from "jsonwebtoken";

export const verifyToken = (roles = []) => {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "No token" });
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err)
        return res
          .status(403)
          .json({ message: "Invalid Token", error: err.message });
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      req.user = decoded;
      next();
    });
  };
};
