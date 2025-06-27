import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError";

export const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  const cookieToken = req.cookies?.accessToken;

  const token = bearerToken || cookieToken;

  if (!token) {
    return next(new ApiError(401, "Access token is missing"));
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return next(new ApiError(403, "Invalid or expired access token"));
  }
};
