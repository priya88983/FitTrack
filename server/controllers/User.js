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

    const currentDateFormatted = new Date();
    const startToday = new Date(
      currentDateFormatted.getFullYear(),
      currentDateFormatted.getMonth(),
      currentDateFormatted.getDate()
    );
    const endToday = new Date(
      currentDateFormatted.getFullYear(),
      currentDateFormatted.getMonth(),
      currentDateFormatted.getDate() + 1
    );

    //calculte total calories burnt
    const totalCaloriesBurnt = await Workout.aggregate([
      { $match: { user: user._id, date: { $gte: startToday, $lt: endToday } } },
      {
        $group: {
          _id: null,
          totalCaloriesBurnt: { $sum: "$caloriesBurned" },
        },
      },
    ]);

    //Calculate total no of workouts
    const totalWorkouts = await Workout.countDocuments({
      user: userId,
      date: { $gte: startToday, $lt: endToday },
    });

    //Calculate average calories burnt per workout
    const avgCaloriesBurntPerWorkout =
      totalCaloriesBurnt.length > 0
        ? totalCaloriesBurnt[0].totalCaloriesBurnt / totalWorkouts
        : 0;

    // Fetch category of workouts
    const categoryCalories = await Workout.aggregate([
      { $match: { user: user._id, date: { $gte: startToday, $lt: endToday } } },
      {
        $group: {
          _id: "$category",
          totalCaloriesBurnt: { $sum: "$caloriesBurned" },
        },
      },
    ]);

    //Format category data for pie chart

    const pieChartData = categoryCalories.map((category, index) => ({
      id: index,
      value: category.totalCaloriesBurnt,
      label: category._id,
    }));

    const weeks = [];
    const caloriesBurnt = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(
        currentDateFormatted.getTime() - i * 24 * 60 * 60 * 1000
      );
      weeks.push(`${date.getDate()}th`);

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

      const weekData = await Workout.aggregate([
        {
          $match: {
            user: user._id,
            date: { $gte: startOfDay, $lt: endOfDay },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            totalCaloriesBurnt: { $sum: "$caloriesBurned" },
          },
        },
        {
          $sort: { _id: 1 }, // Sort by date in ascending order
        },
      ]);

      caloriesBurnt.push(
        weekData[0]?.totalCaloriesBurnt ? weekData[0]?.totalCaloriesBurnt : 0
      );
    }

    return res.status(200).json({
      totalCaloriesBurnt:
        totalCaloriesBurnt.length > 0
          ? totalCaloriesBurnt[0].totalCaloriesBurnt
          : 0,
      totalWorkouts: totalWorkouts,
      avgCaloriesBurntPerWorkout: avgCaloriesBurntPerWorkout,
      totalWeeksCaloriesBurnt: {
        weeks: weeks,
        caloriesBurned: caloriesBurnt,
      },
      pieChartData: pieChartData,
    });
  } catch (err) {
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

// Function to calculate calories burnt for a workout
const calculateCaloriesBurnt = (workoutDetails) => {
  const durationInMinutes = parseInt(workoutDetails.duration);
  const weightInKg = parseInt(workoutDetails.weight);
  const caloriesBurntPerMinute = 5; // Sample value, actual calculation may vary
  return durationInMinutes * caloriesBurntPerMinute * weightInKg;
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
        weight: weight != null ? Number(weight) : undefined,
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
