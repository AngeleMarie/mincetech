import express from "express";
import passport from "passport";
import userController from "../../controllers/userControllers/auth.js";
import authenticateToken  from "../../middleware/authMiddleware.js";
import registerBillingInfo from "../../controllers/userControllers/billing.js";
import basicRegistration from "../../controllers/userControllers/personal.js";
import upload from "../../config/multerConfig.js";
import { body } from "express-validator";
import validateRequest from "../../middleware/validateRequest.js";

const router = express.Router();

// Google OAuth Routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login?error=auth" }),
  (req, res) => {
    res.redirect("/");
  }
);

// User Registration
router.post(
  "/register",
  [
    body("firstname").isString().notEmpty(),
    body("lastname").isString().notEmpty(),
    body("email").isEmail(),
    body("phone").isString().notEmpty(),
    body("password")
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])/),
    body("confirmPassword").custom(
      (value, { req }) => value === req.body.password
    ),
  ],
  validateRequest,
  userController.registerUser
);

// Email Confirmation
router.get("/confirm/:token", userController.confirmEmail);

// User Login
router.post(
  "/login",
  [body("email").isEmail(), body("password").isString().notEmpty()],
  validateRequest,
  userController.loginUser
);

// // Setup PIN
// router.post(
//   "/setupPin/:userId",
//   authenticateToken,
//   [body("pin").isString()?body("pin").length==4:""],
//   validateRequest,
//   userController.setupPin
// );

router.get("/logout", authenticateToken, userController.logoutUser);

// Register Personal Information
router.post(
  "/register/personal/:userId",
  authenticateToken,
  upload.single("profilePicture"),
  basicRegistration
);

// Register Billing Information
router.post(
  "/register/billing/:userId",
  authenticateToken,
  [
    body("plan").isIn(["Basic", "Premium", "Free Trial"]),
    body("accounts").isArray(),
    body("accounts.*.method").isIn([
      "MoMo Pay",
      "PayPal",
      "Creditcard",
      "Mastercard",
      "Visa",
    ]),
  ],
  validateRequest,
  registerBillingInfo
);

export default router;
