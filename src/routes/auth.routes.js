import { Router } from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
  refreshAccessToken,
  verifyEmail,
  resendVerificationEmail,
} from "../controllers/auth.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", upload.single("avatar"), registerUser);

router.post("/login", loginUser);

router.post("/logout", verifyAccessToken, logoutUser);

router.post("refresh-token", refreshAccessToken);

router.get("/verifyemail", verifyEmail);

router.post("/resend-verification", resendVerificationEmail);
export default router;
