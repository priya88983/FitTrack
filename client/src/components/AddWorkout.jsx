import React, { useState } from "react";
import styled from "styled-components";
import TextInput from "./TextInput";
import Button from "./Button";

const Card = styled.div`
  flex: 1;
  min-width: 280px;
  padding: 24px;
  border: 1px solid ${({ theme }) => theme.text_primary + "20"};
  border-radius: 14px;
  box-shadow: 1px 6px 20px 0px ${({ theme }) => theme.primary + "15"};
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: 600px) {
    padding: 16px;
    gap: 8px;
  }
`;

const Title = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: ${({ theme }) => theme.primary};
  @media (max-width: 600px) {
    font-size: 14px;
  }
`;

export default function AddWorkout({ addNewWorkout, buttonLoading }) {
  const [form, setForm] = useState({
    category: "",
    workoutName: "",
    sets: "",
    reps: "",
    weight: "",
    duration: "",
  });

  // update by TextInput (uses `e.target.name` + `handelChange`)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await addNewWorkout({
        category: form.category.trim(),
        workoutName: form.workoutName.trim(),
        sets: Number(form.sets),
        reps: Number(form.reps),
        weight: Number(form.weight),
        duration: Number(form.duration),
      });
      setForm({
        category: "",
        workoutName: "",
        sets: "",
        reps: "",
        weight: "",
        duration: "",
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card>
      <Title>Add New Workout</Title>

      <TextInput
        label="Category"
        name="category"
        placeholder="e.g. Strength"
        value={form.category}
        handelChange={handleChange}
      />

      <TextInput
        label="Workout Name"
        name="workoutName"
        placeholder="e.g. Bench Press"
        value={form.workoutName}
        handelChange={handleChange}
      />

      <TextInput
        label="Sets"
        name="sets"
        type="number"
        placeholder="e.g. 4"
        value={form.sets}
        handelChange={handleChange}
      />

      <TextInput
        label="Reps"
        name="reps"
        type="number"
        placeholder="e.g. 8"
        value={form.reps}
        handelChange={handleChange}
      />

      <TextInput
        label="Weight"
        name="weight"
        type="number"
        placeholder="e.g. 60 (kg)"
        value={form.weight}
        handelChange={handleChange}
      />

      <TextInput
        label="Duration"
        name="duration"
        type="number"
        placeholder="e.g. 30 (minutes)"
        value={form.duration}
        handelChange={handleChange}
      />

      <Button
        text="Add Workout"
        small
        onClick={handleSubmit}
        isLoading={buttonLoading}
        isDisabled={buttonLoading}
      />
    </Card>
  );
}
