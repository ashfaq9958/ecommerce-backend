import { Router } from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
  refreshAccessToken,
} from "../controllers/auth.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", upload.single("avatar"), registerUser);

router.post("/login", loginUser);

router.post("/logout", verifyAccessToken, logoutUser);

router.post("refresh-token", refreshAccessToken);

export default router;
