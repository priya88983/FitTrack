import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { editDietPlan } from "../api";

const EditDietPlan = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    planName: "",
    description: "",
    dailyCalories: 2000,
    carbsPercentage: 50,
    proteinPercentage: 30,
    fatPercentage: 20,
    durationWeeks: 4,
  });

  const [macrosError, setMacrosError] = useState("");

  useEffect(() => {
    // Validate macronutrient percentages
    const total =
      formData.carbsPercentage +
      formData.proteinPercentage +
      formData.fatPercentage;

    if (total !== 100) {
      setMacrosError("Macronutrients must add up to 100%");
    } else {
      setMacrosError("");
    }
  }, [
    formData.carbsPercentage,
    formData.proteinPercentage,
    formData.fatPercentage,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name.endsWith("Percentage") ||
        name.endsWith("Calories") ||
        name.endsWith("Weeks") ||
        name.endsWith("PerDay")
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (macrosError) {
      alert("Please fix macronutrient errors before submitting");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("fittrack-app-token");
      await editDietPlan(token, formData);
      setLoading(false);
      navigate("/dietPlanner");
    } catch (error) {
      setLoading(false);

      alert(error.message || "Failed to save diet plan");
    }
  };

  // Modern blue theme styles
  const styles = {
    container: {
      maxWidth: "600px",
      margin: "2rem auto",
      padding: "2rem",
      backgroundColor: "#f8fbff",
      borderRadius: "12px",
      boxShadow: "0 4px 20px rgba(0, 75, 145, 0.15)",
      border: "1px solid #e1f0ff",
    },
    header: {
      textAlign: "center",
      color: "#0a3d62",
      marginBottom: "2rem",
      fontWeight: "600",
      fontSize: "1.8rem",
    },
    inputGroup: {
      marginBottom: "1.5rem",
    },
    label: {
      display: "block",
      marginBottom: "0.5rem",
      color: "#2c5282",
      fontWeight: "500",
      fontSize: "0.9rem",
    },
    input: {
      width: "100%",
      padding: "0.8rem 1rem",
      borderRadius: "8px",
      border: "1px solid #bee3f8",
      backgroundColor: "#fff",
      fontSize: "1rem",
      color: "#2d3748",
      transition: "border-color 0.3s",
      boxSizing: "border-box",
    },
    inputFocus: {
      outline: "none",
      borderColor: "#63b3ed",
      boxShadow: "0 0 0 3px rgba(99, 179, 237, 0.3)",
    },
    rangeContainer: {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
    },
    rangeValue: {
      minWidth: "40px",
      padding: "0.3rem 0.5rem",
      backgroundColor: "#ebf8ff",
      borderRadius: "4px",
      textAlign: "center",
      color: "#2b6cb0",
      fontWeight: "600",
    },
    error: {
      color: "#e53e3e",
      fontSize: "0.85rem",
      marginTop: "0.3rem",
    },
    button: {
      width: "100%",
      padding: "1rem",
      backgroundColor: "#3182ce",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "1.1rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "background-color 0.3s, transform 0.2s",
      marginTop: "1rem",
    },
    macroGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "1rem",
      marginTop: "0.5rem",
    },
    textarea: {
      minHeight: "100px",
      resize: "vertical",
    },
  };

  return loading ? (
    <>
      <div style={styles.header} class="mt10">
        Making a diet plan for you....
      </div>
      <div style={styles.container}>
        <div class="loader"></div>
      </div>
    </>
  ) : (
    <div style={styles.container}>
      <h1 style={styles.header}>Create Diet Plan</h1>

      <form onSubmit={handleSubmit}>
        {/* Plan Name */}
        <div style={styles.inputGroup}>
          <label style={styles.label} htmlFor="planName">
            Plan Name
          </label>
          <input
            style={styles.input}
            type="text"
            id="planName"
            name="planName"
            value={formData.planName}
            onChange={handleChange}
            required
            onFocus={(e) =>
              (e.target.style = { ...styles.input, ...styles.inputFocus })
            }
            onBlur={(e) => (e.target.style = styles.input)}
          />
        </div>

        {/* Description */}
        <div style={styles.inputGroup}>
          <label style={styles.label} htmlFor="description">
            Description
          </label>
          <textarea
            style={{ ...styles.input, ...styles.textarea }}
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        {/* Daily Calories */}
        <div style={styles.inputGroup}>
          <label style={styles.label} htmlFor="dailyCalories">
            Daily Calories:{" "}
            <span style={styles.rangeValue}>{formData.dailyCalories}</span>
          </label>
          <div style={styles.rangeContainer}>
            <span>1200</span>
            <input
              style={{ ...styles.input, padding: 0 }}
              type="range"
              id="dailyCalories"
              name="dailyCalories"
              min="1200"
              max="4000"
              step="50"
              value={formData.dailyCalories}
              onChange={handleChange}
            />
            <span>4000</span>
          </div>
        </div>

        {/* Macronutrient Distribution */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Macronutrient Distribution (%)</label>
          <div style={styles.macroGrid}>
            <div>
              <label style={{ ...styles.label, textAlign: "center" }}>
                Carbs
              </label>
              <input
                style={styles.input}
                type="number"
                name="carbsPercentage"
                min="0"
                max="100"
                value={formData.carbsPercentage}
                onChange={handleChange}
              />
            </div>
            <div>
              <label style={{ ...styles.label, textAlign: "center" }}>
                Protein
              </label>
              <input
                style={styles.input}
                type="number"
                name="proteinPercentage"
                min="0"
                max="100"
                value={formData.proteinPercentage}
                onChange={handleChange}
              />
            </div>
            <div>
              <label style={{ ...styles.label, textAlign: "center" }}>
                Fat
              </label>
              <input
                style={styles.input}
                type="number"
                name="fatPercentage"
                min="0"
                max="100"
                value={formData.fatPercentage}
                onChange={handleChange}
              />
            </div>
          </div>
          {macrosError && <p style={styles.error}>{macrosError}</p>}
          <p
            style={{
              textAlign: "center",
              marginTop: "0.5rem",
              color: "#4a5568",
            }}
          >
            Total:{" "}
            {formData.carbsPercentage +
              formData.proteinPercentage +
              formData.fatPercentage}
            %
          </p>
        </div>
        {/* Plan Duration */}
        <div style={styles.inputGroup}>
          <label style={styles.label} htmlFor="durationWeeks">
            Plan Duration (weeks):{" "}
            <span style={styles.rangeValue}>{formData.durationWeeks}</span>
          </label>
          <input
            style={{ ...styles.input, padding: 0 }}
            type="range"
            id="durationWeeks"
            name="durationWeeks"
            min="1"
            max="12"
            value={formData.durationWeeks}
            onChange={handleChange}
          />
        </div>

        {/* Submit Button */}
        <button type="submit" style={styles.button}>
          Save Diet Plan
        </button>
      </form>
    </div>
  );
};

export default EditDietPlan;
