import React, { useEffect, useState } from "react";
import styled from "styled-components";
import WorkoutCard from "../components/cards/WorkoutCard";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers";
import { getWorkouts, getWorkoutAnalytics } from "../api";
import { CircularProgress } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { LineChart } from "@mui/x-charts/LineChart";

const Container = styled.div`
  flex: 1;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding: 22px 0px;
  overflow-y: auto;
`;

const Wrapper = styled.div`
  flex: 1;
  max-width: 1600px;
  display: flex;
  gap: 22px;
  padding: 0px 16px;

  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

const Left = styled.div`
  flex: 0.2;
  min-width: 300px;
  height: fit-content;
  padding: 18px;
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  border-radius: 14px;
  box-shadow: 1px 6px 20px 0px ${({ theme }) => theme.primary + 15};

  @media (max-width: 900px) {
    min-width: 0;
    width: 100%;
  }
`;

const Title = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 10px;
`;

const Right = styled.div`
  flex: 1;
  min-width: 0;
`;

const AnalyticsWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 0px 16px;
  margin-bottom: 28px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const AnalyticsCard = styled.div`
  padding: 20px;
  min-height: 105px;
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  border-radius: 14px;
  box-shadow: 1px 6px 20px 0px ${({ theme }) => theme.primary + 15};
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const AnalyticsTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.text_secondary};
  margin-bottom: 10px;
`;

const AnalyticsValue = styled.div`
  font-size: 26px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_primary};
  text-transform: capitalize;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 18px;
  padding: 0px 16px;
  margin-bottom: 28px;

  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  border-radius: 14px;
  box-shadow: 1px 6px 20px 0px ${({ theme }) => theme.primary + 15};
`;

const ChartTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_primary};
  margin-bottom: 16px;
`;

const ProgressSection = styled.div`
  padding: 0px 16px;
  margin-bottom: 30px;
`;

const ProgressGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0px 16px;
  gap: 22px;
`;

const SecTitle = styled.div`
  font-size: 22px;
  color: ${({ theme }) => theme.text_primary};
  font-weight: 500;
`;

const CardWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 20px;
  margin-bottom: 100px;
`;

const EmptyMessage = styled.div`
  padding: 24px;
  width: 100%;
  text-align: center;
  color: ${({ theme }) => theme.text_secondary};
  border: 1px dashed ${({ theme }) => theme.text_primary + 30};
  border-radius: 12px;
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 30px;
`;

const Workouts = () => {
  const [todaysWorkouts, setTodaysWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [date, setDate] = useState("");
  const [analytics, setAnalytics] = useState(null);

  const getTodaysWorkout = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("fittrack-app-token");

      const response = await getWorkouts(
        token,
        date ? `?date=${date}` : ""
      );

      setTodaysWorkouts(response?.data?.todaysWorkouts || []);
    } catch (error) {
      console.error("Failed to fetch workouts:", error);
      setTodaysWorkouts([]);
    } finally {
      setLoading(false);
    }
  };

  const getAnalytics = async () => {
    try {
      setAnalyticsLoading(true);

      const token = localStorage.getItem("fittrack-app-token");

      const response = await getWorkoutAnalytics(token, 30);

      setAnalytics(response.data);

      console.log("Workout Analytics:", response.data);
    } catch (error) {
      console.error("Failed to fetch workout analytics:", error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    getTodaysWorkout();
  }, [date]);

  useEffect(() => {
    getAnalytics();
  }, []);

  const dailyActivity = analytics?.dailyActivity || [];
  const categories = analytics?.categoryBreakdown || [];
  const exerciseProgress = analytics?.exerciseProgress || [];

  return (
    <Container>
      <Wrapper>
        <Left>
          <Title>Select Date</Title>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
              onChange={(value) => {
                if (value) {
                  setDate(value.format("MM/DD/YYYY"));
                }
              }}
            />
          </LocalizationProvider>
        </Left>

        <Right>
          {analyticsLoading ? (
            <LoadingWrapper>
              <CircularProgress />
            </LoadingWrapper>
          ) : (
            <>
              {analytics?.summary && (
                <AnalyticsWrapper>
                  <AnalyticsCard>
                    <AnalyticsTitle>Total Workouts</AnalyticsTitle>
                    <AnalyticsValue>
                      {analytics.summary.totalWorkouts}
                    </AnalyticsValue>
                  </AnalyticsCard>

                  <AnalyticsCard>
                    <AnalyticsTitle>Active Days</AnalyticsTitle>
                    <AnalyticsValue>
                      {analytics.summary.activeDays}
                    </AnalyticsValue>
                  </AnalyticsCard>

                  <AnalyticsCard>
                    <AnalyticsTitle>Calories Burned</AnalyticsTitle>
                    <AnalyticsValue>
                      {analytics.summary.totalCalories} kcal
                    </AnalyticsValue>
                  </AnalyticsCard>

                  <AnalyticsCard>
                    <AnalyticsTitle>Most Trained Category</AnalyticsTitle>
                    <AnalyticsValue>
                      {analytics.summary.mostTrainedCategory || "N/A"}
                    </AnalyticsValue>
                  </AnalyticsCard>
                </AnalyticsWrapper>
              )}

              <ChartsGrid>
                <ChartCard>
                  <ChartTitle>30-Day Calorie Activity</ChartTitle>

                  {dailyActivity.length > 0 ? (
                    <BarChart
                      xAxis={[
                        {
                          scaleType: "band",
                          data: dailyActivity.map((item) =>
                            new Date(item.date).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                            })
                          ),
                        },
                      ]}
                      series={[
                        {
                          data: dailyActivity.map(
                            (item) => item.calories
                          ),
                          label: "Calories Burned",
                        },
                      ]}
                      height={280}
                    />
                  ) : (
                    <EmptyMessage>
                      No activity data available yet.
                    </EmptyMessage>
                  )}
                </ChartCard>

                <ChartCard>
                  <ChartTitle>Workout Categories</ChartTitle>

                  {categories.length > 0 ? (
                    <PieChart
                      series={[
                        {
                          data: categories.map((item, index) => ({
                            id: index,
                            value: item.count,
                            label: item.category,
                          })),
                          innerRadius: 35,
                          outerRadius: 100,
                          paddingAngle: 4,
                          cornerRadius: 4,
                        },
                      ]}
                      height={280}
                    />
                  ) : (
                    <EmptyMessage>
                      No category data available yet.
                    </EmptyMessage>
                  )}
                </ChartCard>
              </ChartsGrid>

              {exerciseProgress.length > 0 && (
                <ProgressSection>
                  <SecTitle style={{ marginBottom: "18px" }}>
                    Exercise Progress
                  </SecTitle>

                  <ProgressGrid>
                    {exerciseProgress.map((exercise) => (
                      <ChartCard key={exercise.exercise}>
                        <ChartTitle
                          style={{
                            textTransform: "capitalize",
                          }}
                        >
                          {exercise.exercise}
                        </ChartTitle>

                        <LineChart
                          xAxis={[
                            {
                              scaleType: "point",
                              data: exercise.history.map((item) =>
                                new Date(
                                  item.date
                                ).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                })
                              ),
                            },
                          ]}
                          series={[
                            {
                              data: exercise.history.map(
                                (item) => item.weight
                              ),
                              label: "Weight (kg)",
                            },
                          ]}
                          height={260}
                        />
                      </ChartCard>
                    ))}
                  </ProgressGrid>
                </ProgressSection>
              )}
            </>
          )}

          <Section>
            <SecTitle>
              {date ? `Workouts on ${date}` : "Today's Workouts"}
            </SecTitle>

            {loading ? (
              <LoadingWrapper>
                <CircularProgress />
              </LoadingWrapper>
            ) : (
              <CardWrapper>
                {todaysWorkouts.length > 0 ? (
                  todaysWorkouts.map((workout) => (
                    <WorkoutCard
                      key={workout._id}
                      workout={workout}
                    />
                  ))
                ) : (
                  <EmptyMessage>
                    No workouts found for this date.
                  </EmptyMessage>
                )}
              </CardWrapper>
            )}
          </Section>
        </Right>
      </Wrapper>
    </Container>
  );
};

export default Workouts;