import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshTokenAccess,
  changeCurrentPassword,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJwt, logoutUser);
router.route("/refresh-token").post(refreshTokenAccess);
router.route("/change-password").patch(verifyJwt, changeCurrentPassword);

export default router;
