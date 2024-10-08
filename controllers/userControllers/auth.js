import crypto from "crypto";
import Authentication from "../../models/userModels/AuthInfoSchema.js";
import Pin from "../../models/userModels/Pin.js";
import authSchema from "../../validators/authValidator.js";
import pinValidationSchema from "../../validators/pinValidator.js";
import transporter from "../../config/emailConfig.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import speakeasy from 'speakeasy';

dotenv.config();

//register user
const registerUser = async (req, res) => {
  try {
    const { error } = authSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ errors: error.details.map((detail) => detail.message) });
    }
    const { firstname, lastname, email, phone, password } = req.body;
    let user = await Authentication.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const confirmationToken = crypto.randomBytes(20).toString("hex");
    user = new Authentication({
      firstname,
      lastname,
      email,
      phone,
      password: hashedPassword,
      confirmationToken,
      isConfirmed: false,
    });

    await user.save();

    const confirmationUrl = `http://localhost:6345/api/users/auth/confirm/${confirmationToken}`;
    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Email Confirmation",
      text: `Please confirm your email by clicking the following link: ${confirmationUrl}`,
    };

    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .json({ error: "Error sending confirmation email" });
      }
      console.log("Email sent:", info.response);

      res.status(201).json({
        message:
          "User registered successfully. Please check your email for confirmation.",
      });
    });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const confirmEmail = async (req, res) => {
  const { token } = req.params;

  try {
    console.log(`Confirmation token received: ${token}`);

    const user = await Authentication.findOne({ confirmationToken: token });

    if (!user) {
      console.error("Invalid or expired confirmation token");
      return res
        .status(400)
        .json({ error: "Invalid or expired confirmation token" });
    }
    user.isConfirmed = true;
    await user.save();

    console.log("Email confirmed successfully");
    res.status(200).json({
      message: "Email confirmed successfully",
      redirectUrl: "/https://mince-web-lmg4.vercel.app/admin/dashboard",
    });
  } catch (err) {
    console.error("Error confirming email:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const setupPin = async (req, res) => {
  try {
    const { userId } = req.params;
    const { pin } = req.body;
    const { error } = pinValidationSchema.validate({ userId, pin });
    if (error) {
      return res
        .status(400)
        .json({ errors: error.details.map((detail) => detail.message) });
    }
    const hashedPin = await bcrypt.hash(pin, 10);

    const newPin = new Pin({ userId, pin: hashedPin });
    await newPin.save();

    res.status(200).json({ message: "PIN setup successfully" });
  } catch (err) {
    console.error("Error setting up PIN:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password, twoFactorToken } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await Authentication.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // 2FA
    // if (!user.auth2FA) {
    //   const verified = speakeasy.totp.verify({
    //     secret: user.twoFactorSecret,
    //     encoding: "base32",
    //     token: twoFactorToken,
    //   });

    //   if (!verified) {
    //     return res.status(400).json({ error: "Invalid 2FA token" });
    //   }
    // } else {
    //   return res.status(403).json({ message: "2FA required" });
    // }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error("Error logging in user:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const logoutUser = (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Error logging out:", err);
      return res.status(500).json({ error: "Server error" });
    }
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ error: "Server error" });
      }
      res.status(200).json({ message: "Logout successful" });
    });
  });
};

export default {
  registerUser,
  confirmEmail,
  loginUser,
  logoutUser,
  setupPin,
};
