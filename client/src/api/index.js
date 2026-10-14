import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

export const UserSignUp = async (data) =>
  API.post("/user/signup", data);

export const UserSignIn = async (data) =>
  API.post("/user/signin", data);

export const getDashboardDetails = async (token) =>
  API.get("/user/dashboard", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getWorkouts = async (token, date) =>
  API.get(`/user/workout${date}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const addWorkout = async (token, data) =>
  API.post("/user/workout", data, {
    headers: { Authorization: `Bearer ${token}` },
  });

// NEW: Workout analytics
export const getWorkoutAnalytics = async (token, days = 30) =>
  API.get(`/user/workout/analytics?days=${days}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const dietDetails = async (token) =>
  API.get("/user/dietDetails", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const editDietPlan = async (token, data) =>
  API.post("/user/editDietPlan", data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const sendchat = async (token, data) =>
  API.post("/user/chat", data, {
    headers: { Authorization: `Bearer ${token}` },
  });