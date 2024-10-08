import express from "express";
import branchController from "../../controllers/storeController/branchController.js";
import { body } from "express-validator";
import validateRequest from "../../middleware/validateRequest.js";
import authenticateToken from "../../middleware/authMiddleware.js";

const router = express.Router();

// Get All Branches
router.get("/getAll/:storeId", authenticateToken, branchController.getBranches);

// Add New Branch
router.post(
  "/createBranch/:storeId",
  authenticateToken,
  [body("branchName").isString().notEmpty()],
  validateRequest,
  branchController.addBranch
);

// Update Branch
router.put(
  "/alterBranch/:storeId/:branchId",
  authenticateToken,
  [
    body("branchName").optional().isString().notEmpty(),
    body("balance").optional().isNumeric(),
  ],
  validateRequest,
  branchController.updateBranch
);

// Delete Branch
router.delete(
  "/deleteBranch/:storeId/:branchId",
  authenticateToken,
  branchController.deleteBranch
);

export default router;
