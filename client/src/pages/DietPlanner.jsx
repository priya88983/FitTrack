import React, { useState, useEffect } from "react";
import { dietDetails } from "../api";
import { Link as LinkR, NavLink } from "react-router-dom";

function DietPlanner() {
  const [dietPlan, setDietPlan] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);

  // Meal times with icons
  const mealTimes = [
    { id: "morning", name: "Breakfast", icon: "🌅" },
    { id: "afternoon", name: "Lunch", icon: "☀️" },
    { id: "snacks", name: "Snacks", icon: "🍎" },
    { id: "night", name: "Dinner", icon: "🌙" },
  ];

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("fittrack-app-token");
      try {
        const response = await dietDetails(token);
        setDietPlan(response.data.weeklyDietPlan);
        if (response.data.weeklyDietPlan.length > 0) {
          setSelectedDay(response.data.weeklyDietPlan[0].day);
        }
        setLoading(false);
      } catch (error) {
        alert(error.message || "Something went wrong");
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div style={styles.loading}>Loading your diet plan...</div>;
  }

  const selectedDayData = dietPlan.find((day) => day.day === selectedDay);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Weekly Diet Plan</h1>
        <NavLink to="/editDietPlan">
          <button style={styles.editButton}>Edit Your Diet Plan</button>
        </NavLink>
      </div>

      <div style={styles.daySelector}>
        {dietPlan.map((day) => (
          <button
            key={day.day}
            style={{
              ...styles.dayButton,
              ...(selectedDay === day.day && styles.selectedDayButton),
            }}
            onClick={() => setSelectedDay(day.day)}
          >
            {day.day.slice(0, 3)}
          </button>
        ))}
      </div>

      {selectedDayData && (
        <div style={styles.dayContainer}>
          <h2 style={styles.dayTitle}>{selectedDayData.day}</h2>
          <div style={styles.mealsGrid}>
            {mealTimes.map((meal) => {
              const mealData = selectedDayData.meals[meal.id];
              return (
                <div key={meal.id} style={styles.mealCard}>
                  <div style={styles.mealHeader}>
                    <span style={styles.mealIcon}>{meal.icon}</span>
                    <h3 style={styles.mealName}>{meal.name}</h3>
                  </div>
                  <div style={styles.mealContent}>
                    <div style={styles.imageContainer}>
                      <img
                        src={mealData.image}
                        alt={mealData.name}
                        style={styles.mealImage}
                      />
                    </div>
                    <h4 style={styles.dishName}>{mealData.name}</h4>
                    <p style={styles.calories}>{mealData.calories} calories</p>
                    <p style={styles.description}>{mealData.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default DietPlanner;

// Modern sky blue theme styles
const styles = {
  container: {
    backgroundColor: "#f0f8ff",
    minHeight: "100vh",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    flexWrap: "wrap",
  },
  title: {
    color: "#1e88e5",
    fontSize: "2.2rem",
    fontWeight: "700",
    margin: 0,
  },
  editButton: {
    backgroundColor: "#4fc3f7",
    color: "white",
    border: "none",
    padding: "12px 25px",
    borderRadius: "30px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(79, 195, 247, 0.3)",
    transition: "all 0.3s ease",
    ":hover": {
      backgroundColor: "#29b6f6",
      transform: "translateY(-2px)",
      boxShadow: "0 6px 15px rgba(79, 195, 247, 0.4)",
    },
  },
  daySelector: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "25px",
    overflowX: "auto",
    padding: "5px 0 15px",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    "::-webkit-scrollbar": {
      display: "none",
    },
  },
  dayButton: {
    backgroundColor: "#e1f5fe",
    border: "none",
    borderRadius: "20px",
    padding: "10px 15px",
    minWidth: "90px",
    fontSize: "1rem",
    fontWeight: "600",
    color: "#0288d1",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)",
  },
  selectedDayButton: {
    backgroundColor: "#4fc3f7",
    color: "white",
    boxShadow: "0 4px 8px rgba(79, 195, 247, 0.3)",
    transform: "translateY(-3px)",
  },
  dayContainer: {
    backgroundColor: "white",
    borderRadius: "15px",
    padding: "25px",
    boxShadow: "0 5px 20px rgba(0, 0, 0, 0.05)",
  },
  dayTitle: {
    color: "#01579b",
    marginTop: "0",
    marginBottom: "25px",
    fontSize: "1.8rem",
    fontWeight: "600",
    textAlign: "center",
  },
  mealsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "25px",
  },
  mealCard: {
    backgroundColor: "#f8fdff",
    borderRadius: "15px",
    overflow: "hidden",
    boxShadow: "0 5px 15px rgba(2, 136, 209, 0.1)",
    transition: "transform 0.3s ease",
    ":hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 8px 20px rgba(2, 136, 209, 0.15)",
    },
  },
  mealHeader: {
    backgroundColor: "#4fc3f7",
    color: "white",
    padding: "15px 20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  mealIcon: {
    fontSize: "1.5rem",
  },
  mealName: {
    margin: "0",
    fontSize: "1.3rem",
    fontWeight: "600",
  },
  mealContent: {
    padding: "20px",
  },
  imageContainer: {
    height: "180px",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "15px",
  },
  mealImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.3s ease",
    ":hover": {
      transform: "scale(1.05)",
    },
  },
  dishName: {
    color: "#0288d1",
    fontSize: "1.4rem",
    margin: "0 0 8px 0",
  },
  calories: {
    backgroundColor: "#e1f5fe",
    color: "#0288d1",
    display: "inline-block",
    padding: "5px 12px",
    borderRadius: "20px",
    fontSize: "0.9rem",
    fontWeight: "600",
    margin: "0 0 15px 0",
  },
  description: {
    color: "#546e7a",
    lineHeight: "1.6",
    margin: "0",
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontSize: "1.5rem",
    color: "#0288d1",
    fontWeight: "500",
  },
};
