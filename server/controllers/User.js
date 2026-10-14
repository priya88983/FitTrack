import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { createError } from "../error.js";
import User from "../models/User.js";
import Workout from "../models/Workout.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { mailsender } from "./mailsender.js";
dotenv.config();


const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const UserRegister = async (req, res, next) => {
  try {
    const { email, password, name, img } = req.body;
    console.log("khub bhalooo");
    // Check if the email is in use
    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      return next(createError(409, "Email is already in use."));
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      img,
    });
    const createdUser = await user.save();
    const token = jwt.sign({ id: createdUser._id }, process.env.JWT, {
      expiresIn: "9999 years",
    });

    mailsender(
      "Welcome to Fittrack, Enhance your fitness journey with us",
      "Hii Glad to see you on our Platform we would love to be with you throughout your fitness journey",
      email
    );

    return res.status(200).json({ token, user });
  } catch (error) {
    return next(error);
  }
};

export const UserLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    // Check if user exists
    if (!user) {
      return next(createError(404, "User not found"));
    }
    // console.log(user);
    // Check if password is correct
    const isPasswordCorrect = await bcrypt.compareSync(password, user.password);
    if (!isPasswordCorrect) {
      return next(createError(403, "Incorrect password"));
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT, {
      expiresIn: "9999 years",
    });

    return res.status(200).json({ token, user });
  } catch (error) {
    return next(error);
  }
};

export const getUserDashboard = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    const user = await User.findById(userId);

    if (!user) {
      return next(createError(404, "User not found"));
    }

    const currentDate = new Date();

    const startToday = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );

    const endToday = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + 1
    );

    // Total calories burned today
    const totalCaloriesResult = await Workout.aggregate([
      {
        $match: {
          user: user._id,
          date: {
            $gte: startToday,
            $lt: endToday,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalCaloriesBurnt: {
            $sum: "$caloriesBurned",
          },
        },
      },
    ]);

    const totalCaloriesBurnt =
      totalCaloriesResult.length > 0
        ? totalCaloriesResult[0].totalCaloriesBurnt
        : 0;

    // Total workouts today
    const totalWorkouts = await Workout.countDocuments({
      user: user._id,
      date: {
        $gte: startToday,
        $lt: endToday,
      },
    });

    // Average calories burned per workout
    const avgCaloriesBurntPerWorkout =
      totalWorkouts > 0
        ? totalCaloriesBurnt / totalWorkouts
        : 0;

    // Category-wise calories
    const categoryCalories = await Workout.aggregate([
      {
        $match: {
          user: user._id,
          date: {
            $gte: startToday,
            $lt: endToday,
          },
        },
      },
      {
        $group: {
          _id: "$category",
          totalCaloriesBurnt: {
            $sum: "$caloriesBurned",
          },
        },
      },
    ]);

    const pieChartData = categoryCalories.map((category, index) => ({
      id: index,
      value: category.totalCaloriesBurnt,
      label: category._id,
    }));

    // Last 7 days calories
    const weeks = [];
    const caloriesBurnt = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(
        currentDate.getTime() - i * 24 * 60 * 60 * 1000
      );

      weeks.push(
        `${date.getDate()}/${date.getMonth() + 1}`
      );

      const startOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );

      const endOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 1
      );

      const dayData = await Workout.aggregate([
        {
          $match: {
            user: user._id,
            date: {
              $gte: startOfDay,
              $lt: endOfDay,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalCaloriesBurnt: {
              $sum: "$caloriesBurned",
            },
          },
        },
      ]);

      caloriesBurnt.push(
        dayData.length > 0
          ? dayData[0].totalCaloriesBurnt
          : 0
      );
    }

    return res.status(200).json({
      totalCaloriesBurnt,
      totalWorkouts,
      avgCaloriesBurntPerWorkout,

      totalWeeksCaloriesBurnt: {
        weeks,
        caloriesBurned: caloriesBurnt,
      },

      pieChartData,
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    next(err);
  }
};

export const getWorkoutsByDate = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    console.log(userId);
    const user = await User.findById(userId);
    let date = req.query.date ? new Date(req.query.date) : new Date();
    if (!user) {
      return next(createError(404, "User not found"));
    }
    const startOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const endOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + 1
    );

    const todaysWorkouts = await Workout.find({
      user: userId,
      date: { $gte: startOfDay, $lt: endOfDay },
    });

    const totalCaloriesBurnt = todaysWorkouts.reduce(
      (total, workout) => total + workout.caloriesBurned,
      0
    );

    console.log(todaysWorkouts);

    return res.status(200).json({ todaysWorkouts, totalCaloriesBurnt });
  } catch (err) {
    next(err);
  }
};

export const getWorkoutAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Default: analyse last 30 days
    let days = Number(req.query.days) || 30;

    // Avoid unnecessarily huge queries
    days = Math.min(Math.max(days, 1), 365);

    const endDate = new Date();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    // Get workouts of the logged-in user
    const workouts = await Workout.find({
      user: userId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ date: 1 });

    // ----------------------------
    // 1. BASIC SUMMARY
    // ----------------------------

    const totalWorkouts = workouts.length;

    const totalCalories = workouts.reduce(
      (sum, workout) => sum + (workout.caloriesBurned || 0),
      0
    );

    const totalDuration = workouts.reduce(
      (sum, workout) => sum + (workout.duration || 0),
      0
    );

    // Count unique workout days
    const activeDaysSet = new Set();

    workouts.forEach((workout) => {
      const date = new Date(workout.date).toISOString().split("T")[0];
      activeDaysSet.add(date);
    });

    const activeDays = activeDaysSet.size;

    // ----------------------------
    // 2. CATEGORY BREAKDOWN
    // ----------------------------

    const categoryMap = {};

    workouts.forEach((workout) => {
      const category = workout.category;

      if (!categoryMap[category]) {
        categoryMap[category] = {
          category,
          count: 0,
          calories: 0,
        };
      }

      categoryMap[category].count += 1;
      categoryMap[category].calories += workout.caloriesBurned || 0;
    });

    const categoryBreakdown = Object.values(categoryMap);

    // ----------------------------
    // 3. DAILY ACTIVITY
    // ----------------------------

    const dailyMap = {};

    workouts.forEach((workout) => {
      const date = new Date(workout.date).toISOString().split("T")[0];

      if (!dailyMap[date]) {
        dailyMap[date] = {
          date,
          workouts: 0,
          calories: 0,
          duration: 0,
        };
      }

      dailyMap[date].workouts += 1;
      dailyMap[date].calories += workout.caloriesBurned || 0;
      dailyMap[date].duration += workout.duration || 0;
    });

    const dailyActivity = Object.values(dailyMap);

    // ----------------------------
    // 4. EXERCISE PROGRESS
    // ----------------------------

    const exerciseMap = {};

    workouts.forEach((workout) => {
      const exercise = workout.workoutName;

      if (!exerciseMap[exercise]) {
        exerciseMap[exercise] = [];
      }

      exerciseMap[exercise].push({
        date: workout.date,
        weight: workout.weight || 0,
        sets: workout.sets || 0,
        reps: workout.reps || 0,
      });
    });

    const exerciseProgress = Object.entries(exerciseMap).map(
      ([exercise, history]) => ({
        exercise,
        history,
      })
    );

    // ----------------------------
    // 5. MOST TRAINED CATEGORY
    // ----------------------------

    let mostTrainedCategory = null;

    if (categoryBreakdown.length > 0) {
      mostTrainedCategory = categoryBreakdown.reduce((max, category) =>
        category.count > max.count ? category : max
      ).category;
    }

    // Final response
    return res.status(200).json({
      period: {
        days,
        startDate,
        endDate,
      },

      summary: {
        totalWorkouts,
        activeDays,
        totalCalories,
        totalDuration,
        mostTrainedCategory,
      },

      categoryBreakdown,
      dailyActivity,
      exerciseProgress,
    });
  } catch (error) {
    next(error);
  }
};

// Function to calculate calories burnt for a workout
const calculateCaloriesBurnt = (workoutDetails) => {
  const duration = Number(workoutDetails.duration);

  if (!duration || duration <= 0) {
    return 0;
  }

  const category = workoutDetails.category?.trim().toLowerCase();

  const caloriesPerMinute = {
    strength: 6,
    cardio: 8,
    running: 10,
    cycling: 7,
    yoga: 3,
  };

  const rate = caloriesPerMinute[category] || 5;

  return Math.round(duration * rate);
};
export const addWorkout = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return next(createError(404, "User not found"));

    // Allow either a single workout object or an array of them:
    const payload = req.body.workouts ?? req.body;

    const workoutsArray = Array.isArray(payload) ? payload : [payload];

    if (!workoutsArray.length) {
      return next(createError(400, "No workout data provided"));
    }

    // Prepare documents
    const docs = workoutsArray.map((w, i) => {
      let {
        category,
        workoutName,
        sets,
        reps,
        weight,
        duration,
        caloriesBurned,
        date,
      } = w;

      if (!category || !workoutName) {
        throw createError(
          400,
          `Workout at index ${i} is missing required fields: category and workoutName`
        );
      }

      caloriesBurned = calculateCaloriesBurnt({
      duration: duration != null ? Number(duration) : undefined,
      category,
    });

      return {
        user: userId,
        category: category.trim(),
        workoutName: workoutName.trim(),
        sets: sets != null ? Number(sets) : undefined,
        reps: reps != null ? Number(reps) : undefined,
        weight: weight != null ? Number(weight) : undefined,
        duration: duration != null ? Number(duration) : undefined,
        caloriesBurned,
        date: date ? new Date(date) : undefined,
      };
    });

    // Insert all at once
    const created = await Workout.insertMany(docs);

    mailsender(
      "Another Workout Completed",
      "Hii Glad to know that you have completed one more workout today, keep going",
      user.email
    );

    res.status(201).json({
      message: "Workouts added successfully",
      count: created.length,
      workouts: created,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserDiet = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return next(createError(404, "User not found"));
    }
    if (!user.diet) {
      return next(createError(404, "User's diet details not found"));
    }
    return res.status(200).json(user.diet);
  } catch (error) {
    next(error);
  }
};

//code to generate diet plans

export const editDietPlan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return next(createError(404, "User not found"));

    const params = req.body;
    if (!params || Object.keys(params).length === 0) {
      return next(
        createError(400, "Please provide diet parameters in request body")
      );
    }
    //extra code start

    const IMAGE_MAP = `
Use exactly these Freepik URLs when the meal name mentions:
- eggs → https://img.freepik.com/premium-photo/close-up-beautiful-fresh-brown-chicken-eggs_295969-53.jpg
- oats → https://img.freepik.com/free-photo/rolled-oats-healthy-breakfast-cereal-oat-flakes-bowl-isolated-white-background_123827-35208.jpg
- banana → https://img.freepik.com/free-photo/bananas-white-background_1187-1671.jpg
- ghee → https://img.freepik.com/free-photo/ghee-clarified-butter-jar-wooden-table-ai-generative_123827-24203.jpg
- beetroot → https://img.freepik.com/free-photo/round-textured-slices-beetroot_53876-30442.jpg
- chicken → https://img.freepik.com/free-photo/raw-chicken-breasts-wooden-cutting-board_1150-13465.jpg
- yogurt → https://img.freepik.com/premium-photo/green-bowl-greek-yogurt-fresh-berries-isolated-white-background_974206-6156.jpg
- stir-fry → https://img.freepik.com/free-photo/stir-fry-chicken-sweet-peppers-green-beans_2829-20109.jpg
- smoothie → https://img.freepik.com/free-photo/delicious-green-smoothie-with-avocado_23-2148858664.jpg
- paneer → https://img.freepik.com/premium-photo/homemade-indian-paneer-cheese-wooden-bowl_114420-600.jpg
- peanut butter → https://img.freepik.com/free-photo/cashew-butter-dark-background_1150-45402.jpg
- rice & lentils → https://img.freepik.com/free-photo/close-up-spicy-indian-food-dish_23-2148295015.jpg
- vegetables → https://img.freepik.com/free-photo/front-view-vegetable_140725-103355.jpg
- fish → https://img.freepik.com/premium-photo/fried-fish_36082-14.jpg
- avocado → https://img.freepik.com/free-photo/avocado-products-made-from-avocados-food-nutrition-concept_1150-26278.jpg

`;

    function buildPrompt(params) {
      return `
You are a diet-planner assistant.  Generate a 7-day weekly diet plan **strictly** in this form:
[  
  {  
    day: "Sunday",  
    meals: {  
      morning:    {name: "...", calories: 0, image: "...", description: "..."},  
      afternoon:  { /* same shape */ },  
      snacks:     { /* same shape */ },  
      night:      { /* same shape */ }  
    }  
  },  
  { day: "Monday", meals: { … } },  
  …  
]

${IMAGE_MAP}

Now **customize** the plan based on these parameters (follow each end every properly) :
\`\`\`json
${JSON.stringify(params, null, 2)}
\`\`\`

**Output only** the JavaScript array (no extra commentary).  
`;
    }

    //extra code ends
    const prompt = buildPrompt(params);

    const aiResponse = await model.generateContent(prompt);

    const candidates = aiResponse?.response?.candidates;
    if (!candidates || candidates.length === 0) {
      return next(createError(502, "No candidates returned from Gemini"));
    }

    const parts = candidates[0]?.content?.parts;
    if (!parts || parts.length === 0) {
      return next(createError(502, "No content parts in Gemini response"));
    }

    const text = parts[0]?.text;
    if (!text) {
      return next(createError(502, "No text found in Gemini response"));
    }

    // Extract first code block content
    const codeBlockMatch = text.match(/```(?:\w+)?\n([\s\S]*?)```/);
    if (!codeBlockMatch) {
      return next(createError(502, "No code block found in Gemini response"));
    }

    const code = codeBlockMatch[1].trim();

    let weeklyDietPlan;
    try {
      weeklyDietPlan = JSON.parse(code);
      if (!Array.isArray(weeklyDietPlan)) {
        throw new Error("Parsed value is not an array");
      }
    } catch (e) {
      return next(createError(502, "Invalid JSON from Gemini: " + e.message));
    }

    user.diet = { weeklyDietPlan };
    await user.save();
    mailsender(
      "Updated your full diet plan",
      "Hii we have successfully updated your full diet plan. We hope that you will keep doing amazing job and maintain your fitness. You can checkout your diet on our website",
      user.email
    );
    res.status(200).json({ weeklyDietPlan });
  } catch (err) {
    next(err);
  }
};

export const chatWithBot = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return next(createError(404, "User not found"));
    }
    const query = req.body;
    const prompt = `
You are a professional **fitness and diet assistant**. Help the user with personalized advice on **fitness, workouts, exercises, and healthy diet suggestions**.

Consider the user's profile:
${JSON.stringify(user, null, 2)}

Now, answer this query in a helpful, friendly, and motivational tone:
"${query}"

💡 *Response should be informative, direct, and based on modern fitness and nutrition practices.*
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    res.status(200).json({ response });
  } catch (error) {
    next(error);
  }
};
