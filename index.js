import express from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import dbConnection from "./config/dbConnection.js";
import authRoutes from "./routes/userRoutes/auth.js";
import problemReport from "./routes/problemReport.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import storeRoutes from "./routes/storeRoutes/auth.js";
import storeDashboard from "./routes/storeRoutes/dashboard.js";
import storeBilling from "./routes/storeRoutes/billing.js";
import storeBranches from "./routes/storeRoutes/branch.js";
import stripeWebhookRoutes from "./routes/StripeWebHook.js";
import setupSwagger from "./swaggerSetup.js";
import "./config/passport.js";
import bodyParser from "body-parser";
import usersCards from "./routes/storeRoutes/offerCards.js";
import Card from "./models/cardSchema/cardSchema.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
// const admin = require("firebase-admin");

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "angele",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(cors({
  origin: ["https://mince-web-lmg4.vercel.app", "http://localhost:3000","http://localhost:3000","exp://10.12.75.219:8081"],  
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Database connection
dbConnection();

// User Routes
app.use("/api/users/auth", authRoutes);
app.use("/api/report", problemReport);
app.use("/api/payments", paymentRoutes);

// Store Routes
app.use("/api/store/auth", storeRoutes);
app.use("/api/store/dashboard", storeDashboard);
app.use("/api/store/billing", storeBilling);
app.use("/api/store/branches", storeBranches);
app.use("/api/store/cards", usersCards);
app.use("/api/stripe", stripeWebhookRoutes);

setupSwagger(app);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
  origin: ["https://mince-web-lmg4.vercel.app", "http://localhost:3000","http://localhost:3000","exp://10.12.75.219:8081"],  
   methods: ["GET", "POST"],
  },
});



app.post("/api/store/uid", async (req, res) => {
  const { uid } = req.body;
  console.log(`Received UID: ${uid}`);
  res.status(200).json({ success: true, message: "UID stored", uid });

  try {
    // Check if the card exists in the database
    const card = await Card.findOne({ uid });

    if (card) {
      // Check if the card has an associated user
      if (card.userId) {
        // Card is registered to a user, send notifications
        res.status(200).json({
          success: true,
          message: "Card found and user is registered",
          card,
        });

        // if (card.userDeviceToken) {
        // Notification to the Store Admin
        io.emit("uidReceived", {
          uid,
          message: "A Registered Client UID received",
          card,
          buttons: [
            { text: "View Details", link: "/order-payment" },
            { text: "Cancel", action: "cancel" },
          ],
        });

        // Notification to the User
        const message = {
          notification: {
            title: "Transaction Request",
            body: `A transaction has been initiated for UID: ${uid}. Please confirm.`,
          },
          token: card.userDeviceToken,
        };

        // Send notification via Firebase
        admin
          .messaging()
          .send(message)
          .then((response) => {
            console.log("Notification sent successfully:", response);
          })
          .catch((error) => {
            console.error("Error sending notification:", error);
          });
        // } else {
        //   // No device token found, notify store admin of an unknown client
        //   io.emit("uidReceived", {
        //     uid,
        //     message: "Unknown Client UID received",
        //     card,
        //     buttons: [{ text: "Review the Card", action: "/review-card" }],
        //   });
        // }
      } else {
        // Card exists but is not registered to a user
        res.status(200).json({
          success: true,
          message: "Card found but not registered to a user",
          card,
        });

        // Redirect store admin to the user registration page with the prefilled UID
        io.emit("uidReceived", {
          uid,
          message: "Card found but user not registered",
          card,
          buttons: [
            { text: "Register User", link: `/register-user?uid=${uid}` },
          ],
        });
      }
    } else {
      // Card not found in the database
      res.status(404).json({ success: false, message: "Card not found" });
    }
  } catch (error) {
    console.error("Error fetching card:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/api/updateDeviceToken", async (req, res) => {
  const { userId, deviceToken } = req.body;

  try {
    const card = await Card.findOneAndUpdate(
      { userId },
      { deviceToken },
      { new: true } // Updated Document
    );

    if (card) {
      res
        .status(200)
        .json({ success: true, message: "Device token updated", card });
    } else {
      res.status(404).json({ success: false, message: "Card not found" });
    }
  } catch (error) {
    console.error("Error updating device token:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

const validateAmount = (amount) => {
  return Number.isInteger(amount) && amount > 0;
};

app.post("/create-payment-intent", async (req, res) => {
  const { amount, currency, paymentMethodType } = req.body;

  if (!validateAmount(amount)) {
    return res.status(400).send({ error: "Invalid amount" });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: [paymentMethodType],
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

//card info

const activeUsers = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("register", (userId) => {
    activeUsers[userId] = socket.id;
    console.log(`Registered user ${userId} with socket ID ${socket.id}`);
  });

  socket.on("disconnect", () => {
    for (const userId in activeUsers) {
      if (activeUsers[userId] === socket.id) {
        delete activeUsers[userId];
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io, activeUsers };
