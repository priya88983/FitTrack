import express from "express";
import {
  UserLogin,
  UserRegister,
  addWorkout,
  getUserDashboard,
  getWorkoutsByDate,
  getWorkoutAnalytics,
  getUserDiet,
  chatWithBot,
  editDietPlan,
} from "../controllers/User.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();
console.log("checker2");
router.post("/signup", UserRegister);
router.post("/signin", UserLogin);

router.get("/dashboard", verifyToken, getUserDashboard);
router.get("/workout/analytics", verifyToken, getWorkoutAnalytics);
router.get("/workout", verifyToken, getWorkoutsByDate);
router.post("/workout", verifyToken, addWorkout);
router.get("/dietDetails", verifyToken, getUserDiet);
router.post("/editDietPlan", verifyToken, editDietPlan);
router.post("/chat", verifyToken, chatWithBot);
export default router;
