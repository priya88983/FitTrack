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

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

// ====================================================
// COMMON HELPER
// ====================================================

const getLocalDateString = (date) => {
  const d = new Date(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// ====================================================
// REGISTER USER
// ====================================================

export const UserRegister = async (req, res, next) => {
  try {
    const { email, password, name, img } = req.body;

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

    const token = jwt.sign(
      {
        id: createdUser._id,
      },
      process.env.JWT,
      {
        expiresIn: "9999 years",
      }
    );

    const userResponse = createdUser.toObject();

    // Never return password to frontend
    delete userResponse.password;

    mailsender(
      "Welcome to Fittrack, Enhance your fitness journey with us",
      "Hii Glad to see you on our Platform we would love to be with you throughout your fitness journey",
      email
    );

    return res.status(200).json({
      token,
      user: userResponse,
    });
  } catch (error) {
    return next(error);
  }
};

// ====================================================
// LOGIN USER
// ====================================================

export const UserLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return next(createError(404, "User not found"));
    }

    const isPasswordCorrect = bcrypt.compareSync(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return next(createError(403, "Incorrect password"));
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT,
      {
        expiresIn: "9999 years",
      }
    );

    const userResponse = user.toObject();

    delete userResponse.password;

    return res.status(200).json({
      token,
      user: userResponse,
    });
  } catch (error) {
    return next(error);
  }
};

// ====================================================
// DASHBOARD
// ====================================================

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

    // --------------------------------
    // Calories burned today
    // --------------------------------

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

    // --------------------------------
    // Total workouts today
    // --------------------------------

    const totalWorkouts = await Workout.countDocuments({
      user: user._id,
      date: {
        $gte: startToday,
        $lt: endToday,
      },
    });

    // --------------------------------
    // Average calories/workout
    // --------------------------------

    const avgCaloriesBurntPerWorkout =
      totalWorkouts > 0
        ? totalCaloriesBurnt / totalWorkouts
        : 0;

    // --------------------------------
    // Category-wise calories
    // --------------------------------

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

    const pieChartData = categoryCalories.map(
      (category, index) => ({
        id: index,
        value: category.totalCaloriesBurnt,
        label: category._id,
      })
    );

    // --------------------------------
    // Last 7 days calories
    // --------------------------------

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

// ====================================================
// GET WORKOUTS BY DATE
// ====================================================

export const getWorkoutsByDate = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    const user = await User.findById(userId);

    if (!user) {
      return next(createError(404, "User not found"));
    }

    const date = req.query.date
      ? new Date(req.query.date)
      : new Date();

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
      date: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    });

    const totalCaloriesBurnt = todaysWorkouts.reduce(
      (total, workout) =>
        total + (workout.caloriesBurned || 0),
      0
    );

    return res.status(200).json({
      todaysWorkouts,
      totalCaloriesBurnt,
    });
  } catch (err) {
    next(err);
  }
};

// ====================================================
// WORKOUT ANALYTICS
// ====================================================

export const getWorkoutAnalytics = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    let days = Number(req.query.days) || 30;

    days = Math.min(
      Math.max(days, 1),
      365
    );

    const endDate = new Date();

    const startDate = new Date();

    startDate.setDate(
      startDate.getDate() - (days - 1)
    );

    startDate.setHours(
      0,
      0,
      0,
      0
    );

    const workouts = await Workout.find({
      user: userId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({
      date: 1,
    });

    // ==================================================
    // 1. BASIC SUMMARY
    // ==================================================

    const totalWorkouts = workouts.length;

    const totalCalories = workouts.reduce(
      (sum, workout) =>
        sum + (workout.caloriesBurned || 0),
      0
    );

    const totalDuration = workouts.reduce(
      (sum, workout) =>
        sum + (workout.duration || 0),
      0
    );

    const activeDaysSet = new Set();

    workouts.forEach((workout) => {
      const date =
        getLocalDateString(workout.date);

      activeDaysSet.add(date);
    });

    const activeDays =
      activeDaysSet.size;

    // ==================================================
    // 2. CATEGORY BREAKDOWN
    // ==================================================

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

      categoryMap[category].calories +=
        workout.caloriesBurned || 0;
    });

    const categoryBreakdown =
      Object.values(categoryMap);

    // ==================================================
    // 3. DAILY ACTIVITY
    // ==================================================

    const dailyMap = {};

    workouts.forEach((workout) => {
      const date =
        getLocalDateString(workout.date);

      if (!dailyMap[date]) {
        dailyMap[date] = {
          date,
          workouts: 0,
          calories: 0,
          duration: 0,
        };
      }

      dailyMap[date].workouts += 1;

      dailyMap[date].calories +=
        workout.caloriesBurned || 0;

      dailyMap[date].duration +=
        workout.duration || 0;
    });

    const dailyActivity =
      Object.values(dailyMap);

    // ==================================================
    // 4. EXERCISE PROGRESS HISTORY
    // ==================================================

    const exerciseMap = {};

    workouts.forEach((workout) => {
      const exercise =
        workout.workoutName;

      if (!exerciseMap[exercise]) {
        exerciseMap[exercise] = [];
      }

      exerciseMap[exercise].push({
        date: workout.date,
        weight: workout.weight || 0,
        sets: workout.sets || 0,
        reps: workout.reps || 0,
        duration: workout.duration || 0,
      });
    });

    const exerciseProgress =
      Object.entries(exerciseMap).map(
        ([exercise, history]) => ({
          exercise,
          history,
        })
      );

    // ==================================================
    // 5. EXERCISE PROGRESS INSIGHTS
    // ==================================================

    const exerciseInsights =
      Object.entries(exerciseMap).map(
        ([exercise, history]) => {
          const sortedHistory = [
            ...history,
          ].sort(
            (a, b) =>
              new Date(a.date) -
              new Date(b.date)
          );

          const firstWorkout =
            sortedHistory[0];

          const latestWorkout =
            sortedHistory[
              sortedHistory.length - 1
            ];

          // Workouts having an actual weight
          const weightedHistory =
            sortedHistory.filter(
              (item) =>
                Number(item.weight) > 0
            );

          const isWeightedExercise =
            weightedHistory.length > 0;

          // --------------------------------
          // Days since exercise was done
          // --------------------------------

          const todayForExercise =
            new Date();

          todayForExercise.setHours(
            0,
            0,
            0,
            0
          );

          const lastPerformedDate =
            new Date(
              latestWorkout.date
            );

          lastPerformedDate.setHours(
            0,
            0,
            0,
            0
          );

          const difference =
            todayForExercise.getTime() -
            lastPerformedDate.getTime();

          const daysSinceLastPerformed =
            Math.max(
              0,
              Math.floor(
                difference /
                  (1000 *
                    60 *
                    60 *
                    24)
              )
            );

          // =================================
          // WEIGHT-BASED EXERCISE
          // =================================

          if (isWeightedExercise) {
            const firstWeightedWorkout =
              weightedHistory[0];

            const latestWeightedWorkout =
              weightedHistory[
                weightedHistory.length -
                  1
              ];

            const startingWeight =
              Number(
                firstWeightedWorkout.weight
              ) || 0;

            const currentWeight =
              Number(
                latestWeightedWorkout.weight
              ) || 0;

            const bestWeight =
              Math.max(
                ...weightedHistory.map(
                  (item) =>
                    Number(
                      item.weight
                    ) || 0
                )
              );

            let progressPercentage = 0;

            if (startingWeight > 0) {
              progressPercentage =
                Math.round(
                  ((currentWeight -
                    startingWeight) /
                    startingWeight) *
                    100
                );
            }

            return {
              exercise,
              type: "weight",

              startingWeight,
              currentWeight,
              bestWeight,
              progressPercentage,

              totalSessions:
                sortedHistory.length,

              lastPerformed:
                latestWorkout.date,

              daysSinceLastPerformed,
            };
          }

          // =================================
          // DURATION-BASED EXERCISE
          // =================================

          const durations =
            sortedHistory.map(
              (item) =>
                Number(
                  item.duration
                ) || 0
            );

          const startingDuration =
            Number(
              firstWorkout.duration
            ) || 0;

          const currentDuration =
            Number(
              latestWorkout.duration
            ) || 0;

          const longestDuration =
            durations.length > 0
              ? Math.max(
                  ...durations
                )
              : 0;

          let progressPercentage = 0;

          if (startingDuration > 0) {
            progressPercentage =
              Math.round(
                ((currentDuration -
                  startingDuration) /
                  startingDuration) *
                  100
              );
          }

          return {
            exercise,
            type: "duration",

            startingDuration,
            currentDuration,
            longestDuration,
            progressPercentage,

            totalSessions:
              sortedHistory.length,

            lastPerformed:
              latestWorkout.date,

            daysSinceLastPerformed,
          };
        }
      );

    // ==================================================
    // 6. MOST TRAINED CATEGORY
    // ==================================================

    let mostTrainedCategory = null;

    if (
      categoryBreakdown.length > 0
    ) {
      mostTrainedCategory =
        categoryBreakdown.reduce(
          (max, category) =>
            category.count >
            max.count
              ? category
              : max
        ).category;
    }

    // ==================================================
    // 7. CURRENT STREAK
    // ==================================================

    const activeDates = [
      ...new Set(
        workouts.map(
          (workout) =>
            getLocalDateString(
              workout.date
            )
        )
      ),
    ];

    const activeDateSet =
      new Set(activeDates);

    let currentStreak = 0;

    let checkDate = new Date();

    checkDate.setHours(
      0,
      0,
      0,
      0
    );

    /*
      If no workout today,
      streak can continue from yesterday.
    */

    if (
      !activeDateSet.has(
        getLocalDateString(
          checkDate
        )
      )
    ) {
      checkDate.setDate(
        checkDate.getDate() - 1
      );
    }

    while (
      activeDateSet.has(
        getLocalDateString(
          checkDate
        )
      )
    ) {
      currentStreak++;

      checkDate.setDate(
        checkDate.getDate() - 1
      );
    }

    // ==================================================
    // 8. THIS WEEK VS LAST WEEK
    // ==================================================

    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    const dayOfWeek =
      today.getDay();

    const daysFromMonday =
      dayOfWeek === 0
        ? 6
        : dayOfWeek - 1;

    const startThisWeek =
      new Date(today);

    startThisWeek.setDate(
      today.getDate() -
        daysFromMonday
    );

    const startLastWeek =
      new Date(startThisWeek);

    startLastWeek.setDate(
      startThisWeek.getDate() -
        7
    );

    let thisWeekWorkouts = 0;
    let lastWeekWorkouts = 0;

    workouts.forEach((workout) => {
      const workoutDate =
        new Date(workout.date);

      if (
        workoutDate >=
        startThisWeek
      ) {
        thisWeekWorkouts++;
      } else if (
        workoutDate >=
          startLastWeek &&
        workoutDate <
          startThisWeek
      ) {
        lastWeekWorkouts++;
      }
    });

    let weeklyChangePercentage = 0;

    if (lastWeekWorkouts > 0) {
      weeklyChangePercentage =
        Math.round(
          ((thisWeekWorkouts -
            lastWeekWorkouts) /
            lastWeekWorkouts) *
            100
        );
    }

    // ==================================================
    // 9. WORKOUT CONSISTENCY
    // ==================================================

    const workoutConsistency =
      Math.round(
        (activeDays / days) *
          100
      );

    // ==================================================
    // 10. DAYS SINCE EACH CATEGORY
    // ==================================================

    const categoryLastTrained =
      {};

    workouts.forEach((workout) => {
      const category =
        workout.category
          ?.trim()
          .toLowerCase();

      if (!category) {
        return;
      }

      const workoutDate =
        new Date(
          workout.date
        );

      if (
        !categoryLastTrained[
          category
        ] ||
        workoutDate >
          categoryLastTrained[
            category
          ]
      ) {
        categoryLastTrained[
          category
        ] = workoutDate;
      }
    });

    const daysSinceCategory = {};

    Object.entries(
      categoryLastTrained
    ).forEach(
      ([category, lastDate]) => {
        const last =
          new Date(lastDate);

        last.setHours(
          0,
          0,
          0,
          0
        );

        const difference =
          today.getTime() -
          last.getTime();

        daysSinceCategory[
          category
        ] = Math.max(
          0,
          Math.floor(
            difference /
              (1000 *
                60 *
                60 *
                24)
          )
        );
      }
    );

    // ==================================================
    // FINAL RESPONSE
    // ==================================================

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

      insights: {
        currentStreak,

        weeklyComparison: {
          thisWeekWorkouts,
          lastWeekWorkouts,
          changePercentage:
            weeklyChangePercentage,
        },

        workoutConsistency,

        daysSinceCategory,
      },

      categoryBreakdown,
      dailyActivity,
      exerciseProgress,
      exerciseInsights,
    });
  } catch (error) {
    console.error(
      "Workout Analytics Error:",
      error
    );

    next(error);
  }
};

// ====================================================
// CALORIE CALCULATION
// ====================================================

const calculateCaloriesBurnt = (
  workoutDetails
) => {
  const duration = Number(
    workoutDetails.duration
  );

  if (
    !duration ||
    duration <= 0
  ) {
    return 0;
  }

  const category =
    workoutDetails.category
      ?.trim()
      .toLowerCase();

  const caloriesPerMinute = {
    strength: 6,
    cardio: 8,
    running: 10,
    cycling: 7,
    yoga: 3,
  };

  const rate =
    caloriesPerMinute[
      category
    ] || 5;

  return Math.round(
    duration * rate
  );
};

// ====================================================
// ADD WORKOUT
// ====================================================

export const addWorkout = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const user =
      await User.findById(
        userId
      );

    if (!user) {
      return next(
        createError(
          404,
          "User not found"
        )
      );
    }

    const payload =
      req.body.workouts ??
      req.body;

    const workoutsArray =
      Array.isArray(payload)
        ? payload
        : [payload];

    if (!workoutsArray.length) {
      return next(
        createError(
          400,
          "No workout data provided"
        )
      );
    }

    const docs =
      workoutsArray.map(
        (w, i) => {
          let {
            category,
            workoutName,
            sets,
            reps,
            weight,
            duration,
            date,
          } = w;

          if (
            !category ||
            !workoutName
          ) {
            throw createError(
              400,
              `Workout at index ${i} is missing required fields: category and workoutName`
            );
          }

          const caloriesBurned =
            calculateCaloriesBurnt(
              {
                duration:
                  duration != null
                    ? Number(
                        duration
                      )
                    : undefined,

                category,
              }
            );

          return {
            user: userId,

            category:
              category.trim(),

            workoutName:
              workoutName.trim(),

            sets:
              sets != null
                ? Number(sets)
                : undefined,

            reps:
              reps != null
                ? Number(reps)
                : undefined,

            weight:
              weight != null
                ? Number(weight)
                : undefined,

            duration:
              duration != null
                ? Number(
                    duration
                  )
                : undefined,

            caloriesBurned,

            date:
              date
                ? new Date(date)
                : undefined,
          };
        }
      );

    const created =
      await Workout.insertMany(
        docs
      );

    mailsender(
      "Another Workout Completed",
      "Hii Glad to know that you have completed one more workout today, keep going",
      user.email
    );

    return res.status(201).json({
      message:
        "Workouts added successfully",

      count: created.length,

      workouts: created,
    });
  } catch (err) {
    next(err);
  }
};

// ====================================================
// GET USER DIET
// ====================================================

export const getUserDiet = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const user =
      await User.findById(
        userId
      );

    if (!user) {
      return next(
        createError(
          404,
          "User not found"
        )
      );
    }

    if (!user.diet) {
      return next(
        createError(
          404,
          "User's diet details not found"
        )
      );
    }

    return res.status(200).json(
      user.diet
    );
  } catch (error) {
    next(error);
  }
};

// ====================================================
// EDIT / GENERATE DIET PLAN
// ====================================================

export const editDietPlan = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const user =
      await User.findById(
        userId
      );

    if (!user) {
      return next(
        createError(
          404,
          "User not found"
        )
      );
    }

    const params = req.body;

    if (
      !params ||
      Object.keys(params).length ===
        0
    ) {
      return next(
        createError(
          400,
          "Please provide diet parameters in request body"
        )
      );
    }

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
You are a diet-planner assistant.

Generate a 7-day weekly diet plan strictly as a valid JSON array.

Example structure:

[
  {
    "day": "Sunday",
    "meals": {
      "morning": {
        "name": "...",
        "calories": 0,
        "image": "...",
        "description": "..."
      },
      "afternoon": {
        "name": "...",
        "calories": 0,
        "image": "...",
        "description": "..."
      },
      "snacks": {
        "name": "...",
        "calories": 0,
        "image": "...",
        "description": "..."
      },
      "night": {
        "name": "...",
        "calories": 0,
        "image": "...",
        "description": "..."
      }
    }
  }
]

${IMAGE_MAP}

Customize the plan based on:

\`\`\`json
${JSON.stringify(
  params,
  null,
  2
)}
\`\`\`

Return only the valid JSON array inside a code block.
`;
    }

    const prompt =
      buildPrompt(params);

    const aiResponse =
      await model.generateContent(
        prompt
      );

    const candidates =
      aiResponse?.response?.candidates;

    if (
      !candidates ||
      candidates.length === 0
    ) {
      return next(
        createError(
          502,
          "No candidates returned from Gemini"
        )
      );
    }

    const parts =
      candidates[0]
        ?.content
        ?.parts;

    if (
      !parts ||
      parts.length === 0
    ) {
      return next(
        createError(
          502,
          "No content parts in Gemini response"
        )
      );
    }

    const text =
      parts[0]?.text;

    if (!text) {
      return next(
        createError(
          502,
          "No text found in Gemini response"
        )
      );
    }

    const codeBlockMatch =
      text.match(
        /```(?:\w+)?\n([\s\S]*?)```/
      );

    if (!codeBlockMatch) {
      return next(
        createError(
          502,
          "No code block found in Gemini response"
        )
      );
    }

    const code =
      codeBlockMatch[1].trim();

    let weeklyDietPlan;

    try {
      weeklyDietPlan =
        JSON.parse(code);

      if (
        !Array.isArray(
          weeklyDietPlan
        )
      ) {
        throw new Error(
          "Parsed value is not an array"
        );
      }
    } catch (e) {
      return next(
        createError(
          502,
          "Invalid JSON from Gemini: " +
            e.message
        )
      );
    }

    user.diet = {
      weeklyDietPlan,
    };

    await user.save();

    mailsender(
      "Updated your full diet plan",
      "Hii we have successfully updated your full diet plan. We hope that you will keep doing amazing job and maintain your fitness. You can checkout your diet on our website",
      user.email
    );

    return res.status(200).json({
      weeklyDietPlan,
    });
  } catch (err) {
    next(err);
  }
};

// ====================================================
// CHATBOT
// ====================================================

export const chatWithBot = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    // Never fetch password for AI context
    const user =
      await User.findById(
        userId
      ).select("-password");

    if (!user) {
      return next(
        createError(
          404,
          "User not found"
        )
      );
    }

    const { query } = req.body;

    if (
      !query ||
      !query.trim()
    ) {
      return next(
        createError(
          400,
          "Query is required"
        )
      );
    }

    const prompt = `
You are a professional fitness and diet assistant.

Help the user with personalized advice about:
- workouts
- exercises
- fitness
- nutrition
- healthy diet habits

User profile:

${JSON.stringify(
  user,
  null,
  2
)}

User question:

"${query}"

Give a helpful, clear, direct and friendly answer.
`;

    const result =
      await model.generateContent(
        prompt
      );

    const response =
      result.response.text();

    return res.status(200).json({
      response,
    });
  } catch (error) {
    next(error);
  }
};