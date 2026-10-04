import mongoose from "mongoose";

const weeklyDietPlan = [
  {
    day: "Sunday",
    meals: {
      morning: {
        name: "Oatmeal with Fruits",
        calories: 320,
        image:
          "https://img.freepik.com/free-photo/rolled-oats-healthy-breakfast-cereal-oat-flakes-bowl-isolated-white-background_123827-35208.jpg?ga=GA1.1.1014426227.1740502388&semt=ais_hybrid&w=740",
        description: "Warm bowl of oatmeal topped with berries and honey.",
      },
      afternoon: {
        name: "Grilled Chicken Salad",
        calories: 450,
        image:
          "https://img.freepik.com/free-photo/raw-chicken-breasts-wooden-cutting-board_1150-13465.jpg?ga=GA1.1.1014426227.1740502388&semt=ais_hybrid&w=740",
        description: "Mixed greens with grilled chicken and fresh veggies.",
      },
      snacks: {
        name: "Greek Yogurt with Almonds",
        calories: 180,
        image:
          "https://img.freepik.com/premium-photo/green-bowl-greek-yogurt-fresh-berries-isolated-white-background_974206-6156.jpg?ga=GA1.1.1014426227.1740502388&semt=ais_hybrid&w=740",
        description: "Creamy Greek yogurt topped with crunchy almonds.",
      },
      night: {
        name: "Vegetable Stir Fry with Quinoa",
        calories: 400,
        image:
          "https://img.freepik.com/free-photo/stir-fry-chicken-sweet-peppers-green-beans_2829-20109.jpg?ga=GA1.1.1014426227.1740502388&semt=ais_hybrid&w=740",
        description: "Colorful veggies stir-fried and served over quinoa.",
      },
    },
  },
  {
    day: "Monday",
    meals: {
      morning: {
        name: "Smoothie Bowl",
        calories: 300,
        image:
          "https://img.freepik.com/free-photo/delicious-green-smoothie-with-avocado_23-2148858664.jpg?ga=GA1.1.1014426227.1740502388&semt=ais_hybrid&w=740",
        description: "Mixed berry smoothie with granola and chia.",
      },
      afternoon: {
        name: "Paneer Wrap",
        calories: 430,
        image:
          "https://img.freepik.com/premium-photo/homemade-indian-paneer-cheese-wooden-bowl_114420-600.jpg?ga=GA1.1.1014426227.1740502388&semt=ais_hybrid&w=740",
        description: "Whole wheat wrap filled with spiced paneer and veggies.",
      },
      snacks: {
        name: "Apple & Peanut Butter",
        calories: 200,
        image:
          "https://img.freepik.com/free-photo/cashew-butter-dark-background_1150-45402.jpg?ga=GA1.1.1014426227.1740502388&semt=ais_hybrid&w=740",
        description: "Fresh apple slices with creamy peanut butter.",
      },
      night: {
        name: "Brown Rice with Lentil Curry",
        calories: 420,
        image:
          "https://img.freepik.com/free-photo/close-up-spicy-indian-food-dish_23-2148295015.jpg?ga=GA1.1.1014426227.1740502388&semt=ais_hybrid&w=740",
        description: "Hearty lentil curry served with brown rice.",
      },
    },
  },
  {
    day: "Tuesday",
    meals: {
      morning: {
        name: "Vegetable Upma",
        calories: 280,
        image:
          "https://img.freepik.com/free-photo/front-view-vegetable_140725-103355.jpg?ga=GA1.1.1014426227.1740502388&semt=ais_hybrid&w=740",
        description: "Steamed semolina cooked with veggies and spices.",
      },
      afternoon: {
        name: "Grilled Fish with Veggies",
        calories: 460,
        image:
          "https://img.freepik.com/premium-photo/fried-fish_36082-14.jpg?ga=GA1.1.1014426227.1740502388&semt=ais_hybrid&w=740",
        description: "Grilled fish fillet served with fresh vegetables.",
      },
      snacks: {
        name: "Trail Mix",
        calories: 210,
        image:
          "https://img.freepik.com/free-photo/rolled-oats-healthy-breakfast-cereal-oat-flakes-bowl-isolated-white-background_123827-35208.jpg?ga=GA1.1.1014426227.1740502388&semt=ais_hybrid&w=740",
        description: "Mixture of nuts, seeds, and dried fruits.",
      },
      night: {
        name: "Vegetable Soup & Multigrain Bread",
        calories: 350,
        image:
          "https://img.freepik.com/free-photo/front-view-vegetable_140725-103355.jpg?ga=GA1.1.1014426227.1740502388&semt=ais_hybrid&w=740",
        description: "Light vegetable broth served with toast.",
      },
    },
  },
  {
    day: "Wednesday",
    meals: {
      morning: {
        name: "Besan Chilla",
        calories: 310,
        image:
          "https://img.freepik.com/free-photo/rolled-oats-healthy-breakfast-cereal-oat-flakes-bowl-isolated-white-background_123827-35208.jpg?ga=GA1.1.1014426227.1740502388&semt=ais_hybrid&w=740",
        description: "Savory chickpea flour pancakes with veggies.",
      },
      afternoon: {
        name: "Rajma Chawal",
        calories: 480,
        image:
          "https://img.freepik.com/free-photo/close-up-spicy-indian-food-dish_23-2148295015.jpg?ga=GA1.1.1014426227.1740502388&semt=ais_hybrid&w=740",
        description: "Kidney bean curry served with steamed rice.",
      },
      snacks: {
        name: "Fruit Salad",
        calories: 150,
        image:
          "https://img.freepik.com/free-photo/bananas-white-background_1187-1671.jpg?ga=GA1.1.1014426227.1740502388&semt=ais_hybrid&w=740",
        description: "Fresh seasonal fruits tossed with lemon.",
      },
      night: {
        name: "Grilled Paneer with Veggies",
        calories: 400,
        image:
          "https://img.freepik.com/premium-photo/homemade-indian-paneer-cheese-wooden-bowl_114420-600.jpg?ga=GA1.1.1014426227.1740502388&semt=ais_hybrid&w=740",
        description: "Paneer cubes grilled and served with veggies.",
      },
    },
  },
  {
    day: "Thursday",
    meals: {
      morning: {
        name: "Poha with Peanuts",
        calories: 290,
        image:
          "https://img.freepik.com/free-photo/rolled-oats-healthy-breakfast-cereal-oat-flakes-bowl-isolated-white-background_123827-35208.jpg?ga=GA1.1.1014426227.1740502388&semt=ais_hybrid&w=740",
        description: "Flattened rice cooked with peanuts and spices.",
      },
      afternoon: {
        name: "Vegetable Pasta",
        calories: 460,
        image:
          "https://img.freepik.com/free-photo/front-view-vegetable_140725-103355.jpg?ga=GA1.1.1014426227.1740502388&semt=ais_hybrid&w=740",
        description: "Whole wheat pasta tossed with tomato and veggies.",
      },
      snacks: {
        name: "Hummus & Carrot Sticks",
        calories: 180,
        image:
          "https://img.freepik.com/free-photo/front-view-vegetable_140725-103355.jpg?ga=GA1.1.1014426227.1740502388&semt=ais_hybrid&w=740",
        description: "Creamy hummus served with crunchy carrots.",
      },
      night: {
        name: "Grilled Tofu Bowl",
        calories: 400,
        image:
          "https://img.freepik.com/free-photo/front-view-vegetable_140725-103355.jpg?ga=GA1.1.1014426227.1740502388&semt=ais_hybrid&w=740",
        description: "Grilled tofu with quinoa and broccoli.",
      },
    },
  },
  {
    day: "Friday",
    meals: {
      morning: {
        name: "Avocado Toast with Eggs",
        calories: 350,
        image:
          "https://img.freepik.com/premium-photo/close-up-beautiful-fresh-brown-chicken-eggs_295969-53.jpg?ga=GA1.1.1014426227.1740502388&semt=ais_hybrid&w=740",
        description: "Toasted bread topped with smashed avocado and eggs.",
      },
      afternoon: {
        name: "Chicken Biryani",
        calories: 520,
        image:
          "https://img.freepik.com/free-photo/raw-chicken-breasts-wooden-cutting-board_1150-13465.jpg?ga=GA1.1.1014426227.1740502388&semt=ais_hybrid&w=740",
        description: "Spiced chicken biryani with fragrant rice.",
      },
      snacks: {
        name: "Protein Bar",
        calories: 220,
        image:
          "https://img.freepik.com/free-photo/rolled-oats-healthy-breakfast-cereal-oat-flakes-bowl-isolated-white-background_123827-35208.jpg?ga=GA1.1.1014426227.1740502388&semt=ais_hybrid&w=740",
        description: "Quick and energizing protein bar.",
      },
      night: {
        name: "Lentil Salad",
        calories: 370,
        image:
          "https://img.freepik.com/free-photo/close-up-spicy-indian-food-dish_23-2148295015.jpg?ga=GA1.1.1014426227.1740502388&semt=ais_hybrid&w=740",
        description: "Cold lentil salad with veggies and lemon.",
      },
    },
  },
  {
    day: "Saturday",
    meals: {
      morning: {
        name: "Multigrain Pancakes",
        calories: 380,
        image:
          "https://img.freepik.com/free-photo/rolled-oats-healthy-breakfast-cereal-oat-flakes-bowl-isolated-white-background_123827-35208.jpg?ga=GA1.1.1014426227.1740502388&semt=ais_hybrid&w=740",
        description: "Fluffy multigrain pancakes topped with fruits.",
      },
      afternoon: {
        name: "Veggie Burger",
        calories: 490,
        image:
          "https://img.freepik.com/free-photo/front-view-vegetable_140725-103355.jpg?ga=GA1.1.1014426227.1740502388&semt=ais_hybrid&w=740",
        description: "Grilled veggie patty in a whole wheat bun.",
      },
      snacks: {
        name: "Banana & Dark Chocolate",
        calories: 190,
        image:
          "https://img.freepik.com/free-photo/bananas-white-background_1187-1671.jpg?ga=GA1.1.1014426227.1740502388&semt=ais_hybrid&w=740",
        description: "Banana slices drizzled with dark chocolate.",
      },
      night: {
        name: "Stuffed Bell Peppers",
        calories: 400,
        image:
          "https://img.freepik.com/free-photo/stir-fry-chicken-sweet-peppers-green-beans_2829-20109.jpg?ga=GA1.1.1014426227.1740502388&semt=ais_hybrid&w=740",
        description: "Bell peppers stuffed with quinoa and beans.",
      },
    },
  },
];

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    img: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
    },
    diet: {
      type: Object,
      default: () => ({
        weeklyDietPlan,
      }),
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
