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

// ======================================================
// STYLED COMPONENTS
// ======================================================

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

// ======================================================
// SUMMARY CARDS
// ======================================================

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

// ======================================================
// FITNESS INSIGHTS
// ======================================================

const InsightsWrapper = styled.div`
  padding: 0px 16px;
  margin-bottom: 28px;
`;

const InsightsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const InsightCard = styled.div`
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  border-radius: 14px;
  box-shadow: 1px 6px 20px 0px ${({ theme }) => theme.primary + 15};
`;

const InsightLabel = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.text_secondary};
  margin-bottom: 8px;
`;

const InsightValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_primary};
`;

// ======================================================
// LAST TRAINED
// ======================================================

const RecoverySection = styled.div`
  padding: 0px 16px;
  margin-bottom: 28px;
`;

const RecoveryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const RecoveryCard = styled.div`
  padding: 18px;
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  border-radius: 14px;
  box-shadow: 1px 6px 20px 0px ${({ theme }) => theme.primary + 15};
`;

const RecoveryCategory = styled.div`
  font-size: 18px;
  font-weight: 600;
  text-transform: capitalize;
  color: ${({ theme }) => theme.text_primary};
`;

const RecoveryText = styled.div`
  font-size: 14px;
  margin-top: 8px;
  color: ${({ theme }) => theme.text_secondary};
`;

// ======================================================
// CHARTS
// ======================================================

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

// ======================================================
// PROGRESS
// ======================================================

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

const ProgressInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const ProgressInfoItem = styled.div`
  padding: 12px;
  border-radius: 10px;
  background: ${({ theme }) => theme.bgLight || theme.bg};
`;

const ProgressLabel = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.text_secondary};
  margin-bottom: 5px;
`;

const ProgressValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_primary};
`;

// ======================================================
// DAILY WORKOUT SECTION
// ======================================================

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

// ======================================================
// COMPONENT
// ======================================================

const Workouts = () => {
  const [todaysWorkouts, setTodaysWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  const [date, setDate] = useState("");

  // ====================================================
  // FETCH WORKOUTS FOR SELECTED DATE
  // ====================================================

  const getTodaysWorkout = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("fittrack-app-token");

      const response = await getWorkouts(token, date ? `?date=${date}` : "");

      setTodaysWorkouts(response?.data?.todaysWorkouts || []);
    } catch (error) {
      console.error("Failed to fetch workouts:", error);

      setTodaysWorkouts([]);
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // FETCH ANALYTICS
  // ====================================================

  const getAnalytics = async () => {
    try {
      setAnalyticsLoading(true);

      const token = localStorage.getItem("fittrack-app-token");

      const response = await getWorkoutAnalytics(token, 30);

      setAnalytics(response?.data || null);
    } catch (error) {
      console.error("Failed to fetch workout analytics:", error);

      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // ====================================================
  // EFFECTS
  // ====================================================

  useEffect(() => {
    getTodaysWorkout();
  }, [date]);

  useEffect(() => {
    getAnalytics();
  }, []);

  // ====================================================
  // ANALYTICS DATA
  // ====================================================

  const dailyActivity = analytics?.dailyActivity || [];

  const categories = analytics?.categoryBreakdown || [];

  const exerciseProgress = analytics?.exerciseProgress || [];

  const exerciseInsights = analytics?.exerciseInsights || [];

  const daysSinceCategory = analytics?.insights?.daysSinceCategory || {};

  // ====================================================
  // UI
  // ====================================================

  return (
    <Container>
      <Wrapper>
        {/* ============================================= */}
        {/* LEFT SIDE - CALENDAR */}
        {/* ============================================= */}

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

        {/* ============================================= */}
        {/* RIGHT SIDE */}
        {/* ============================================= */}

        <Right>
          {analyticsLoading ? (
            <LoadingWrapper>
              <CircularProgress />
            </LoadingWrapper>
          ) : (
            <>
              {/* ======================================= */}
              {/* BASIC SUMMARY */}
              {/* ======================================= */}

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

              {/* ======================================= */}
              {/* FITNESS INSIGHTS */}
              {/* ======================================= */}

              {analytics?.insights && (
                <InsightsWrapper>
                  <SecTitle
                    style={{
                      marginBottom: "18px",
                    }}
                  >
                    Fitness Insights
                  </SecTitle>

                  <InsightsGrid>
                    <InsightCard>
                      <InsightLabel>🔥 Current Streak</InsightLabel>

                      <InsightValue>
                        {analytics.insights.currentStreak}{" "}
                        {analytics.insights.currentStreak === 1
                          ? "day"
                          : "days"}
                      </InsightValue>
                    </InsightCard>

                    <InsightCard>
                      <InsightLabel>📅 This Week</InsightLabel>

                      <InsightValue>
                        {analytics.insights.weeklyComparison
                          ?.thisWeekWorkouts || 0}{" "}
                        workouts
                      </InsightValue>
                    </InsightCard>

                    <InsightCard>
                      <InsightLabel>📈 Weekly Change</InsightLabel>

                      <InsightValue>
                        {(analytics.insights.weeklyComparison
                          ?.changePercentage || 0) > 0
                          ? "+"
                          : ""}
                        {analytics.insights.weeklyComparison
                          ?.changePercentage || 0}
                        %
                      </InsightValue>
                    </InsightCard>

                    <InsightCard>
                      <InsightLabel>🎯 Consistency</InsightLabel>

                      <InsightValue>
                        {analytics.insights.workoutConsistency || 0}%
                      </InsightValue>
                    </InsightCard>
                  </InsightsGrid>
                </InsightsWrapper>
              )}

              {/* ======================================= */}
              {/* LAST TRAINED */}
              {/* ======================================= */}

              {Object.keys(daysSinceCategory).length > 0 && (
                <RecoverySection>
                  <SecTitle
                    style={{
                      marginBottom: "18px",
                    }}
                  >
                    Last Trained
                  </SecTitle>

                  <RecoveryGrid>
                    {Object.entries(daysSinceCategory).map(
                      ([category, days]) => (
                        <RecoveryCard key={category}>
                          <RecoveryCategory>{category}</RecoveryCategory>

                          <RecoveryText>
                            {days === 0
                              ? "Trained today"
                              : days === 1
                                ? "Last trained yesterday"
                                : `Last trained ${days} days ago`}
                          </RecoveryText>
                        </RecoveryCard>
                      ),
                    )}
                  </RecoveryGrid>
                </RecoverySection>
              )}

              {/* ======================================= */}
              {/* PROGRESS INSIGHTS */}
              {/* ======================================= */}

              {exerciseInsights.length > 0 && (
                <ProgressSection>
                  <SecTitle
                    style={{
                      marginBottom: "18px",
                    }}
                  >
                    Progress Insights
                  </SecTitle>

                  <ProgressGrid>
                    {exerciseInsights.map((item) => (
                      <ChartCard key={item.exercise}>
                        <ChartTitle
                          style={{
                            textTransform: "capitalize",
                          }}
                        >
                          {item.exercise}
                        </ChartTitle>

                        <ProgressInfoGrid>
                          {/* WEIGHT BASED EXERCISE */}
                          {item.type === "weight" && (
                            <>
                              <ProgressInfoItem>
                                <ProgressLabel>Starting Weight</ProgressLabel>

                                <ProgressValue>
                                  {item.startingWeight} kg
                                </ProgressValue>
                              </ProgressInfoItem>

                              <ProgressInfoItem>
                                <ProgressLabel>Current Weight</ProgressLabel>

                                <ProgressValue>
                                  {item.currentWeight} kg
                                </ProgressValue>
                              </ProgressInfoItem>

                              <ProgressInfoItem>
                                <ProgressLabel>Best Weight</ProgressLabel>

                                <ProgressValue>
                                  {item.bestWeight} kg
                                </ProgressValue>
                              </ProgressInfoItem>

                              <ProgressInfoItem>
                                <ProgressLabel>Progress</ProgressLabel>

                                <ProgressValue>
                                  {item.progressPercentage > 0 ? "+" : ""}
                                  {item.progressPercentage}%
                                </ProgressValue>
                              </ProgressInfoItem>
                            </>
                          )}

                          {/* DURATION BASED EXERCISE */}
                          {item.type === "duration" && (
                            <>
                              <ProgressInfoItem>
                                <ProgressLabel>Starting Duration</ProgressLabel>

                                <ProgressValue>
                                  {item.startingDuration} min
                                </ProgressValue>
                              </ProgressInfoItem>

                              <ProgressInfoItem>
                                <ProgressLabel>Current Duration</ProgressLabel>

                                <ProgressValue>
                                  {item.currentDuration} min
                                </ProgressValue>
                              </ProgressInfoItem>

                              <ProgressInfoItem>
                                <ProgressLabel>Longest Session</ProgressLabel>

                                <ProgressValue>
                                  {item.longestDuration} min
                                </ProgressValue>
                              </ProgressInfoItem>

                              <ProgressInfoItem>
                                <ProgressLabel>Progress</ProgressLabel>

                                <ProgressValue>
                                  {item.progressPercentage > 0 ? "+" : ""}
                                  {item.progressPercentage}%
                                </ProgressValue>
                              </ProgressInfoItem>
                            </>
                          )}

                          {/* COMMON FIELDS */}

                          <ProgressInfoItem>
                            <ProgressLabel>Total Sessions</ProgressLabel>

                            <ProgressValue>{item.totalSessions}</ProgressValue>
                          </ProgressInfoItem>

                          <ProgressInfoItem>
                            <ProgressLabel>Last Performed</ProgressLabel>

                            <ProgressValue>
                              {item.daysSinceLastPerformed === 0
                                ? "Today"
                                : item.daysSinceLastPerformed === 1
                                  ? "Yesterday"
                                  : `${item.daysSinceLastPerformed} days ago`}
                            </ProgressValue>
                          </ProgressInfoItem>
                        </ProgressInfoGrid>
                      </ChartCard>
                    ))}
                  </ProgressGrid>
                </ProgressSection>
              )}

              {/* ======================================= */}
              {/* ACTIVITY + CATEGORY CHARTS */}
              {/* ======================================= */}

              <ChartsGrid>
                <ChartCard>
                  <ChartTitle>30-Day Calorie Activity</ChartTitle>

                  {dailyActivity.length > 0 ? (
                    <BarChart
                      xAxis={[
                        {
                          scaleType: "band",

                          data: dailyActivity.map((item) =>
                            new Date(
                              `${item.date}T00:00:00`,
                            ).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                            }),
                          ),
                        },
                      ]}
                      series={[
                        {
                          data: dailyActivity.map((item) => item.calories),

                          label: "Calories Burned",
                        },
                      ]}
                      height={280}
                    />
                  ) : (
                    <EmptyMessage>No activity data available yet.</EmptyMessage>
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
                    <EmptyMessage>No category data available yet.</EmptyMessage>
                  )}
                </ChartCard>
              </ChartsGrid>

              {/* ======================================= */}
              {/* EXERCISE PROGRESS CHART */}
              {/* ======================================= */}

              {exerciseProgress.length > 0 && (
                <ProgressSection>
                  <SecTitle
                    style={{
                      marginBottom: "18px",
                    }}
                  >
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
                                new Date(item.date).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                  },
                                ),
                              ),
                            },
                          ]}
                          series={[
                            {
                              data: exercise.history.map((item) => item.weight),

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

          {/* =========================================== */}
          {/* WORKOUTS OF SELECTED DATE */}
          {/* =========================================== */}

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
                    <WorkoutCard key={workout._id} workout={workout} />
                  ))
                ) : (
                  <EmptyMessage>No workouts found for this date.</EmptyMessage>
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
