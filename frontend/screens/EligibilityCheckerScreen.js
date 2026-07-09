import React, { useState, useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  ScrollView,
  StatusBar,
  Animated,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function EligibilityCheckerScreen({ route, navigation }) {
  const { schemeId, schemeName } = route.params;

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState("");
  const [reasons, setReasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const resultAnim = useRef(new Animated.Value(0)).current;
  const resultSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(
        "http://10.76.98.29:5000/eligibility-questions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scheme_id: schemeId }),
        }
      );
      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

const checkEligibility = async () => {

  setChecking(true);

  try {

    const response =
      await fetch(
        "http://192.168.29.160:5000/check-eligibility",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            scheme_id: schemeId,
            answers: answers,
          }),
        }
      );

    const data =
      await response.json();

    if (data.eligible) {

      setResult(
        "✅ You are eligible for this scheme"
      );

    } else {

      setResult(
        "❌ You are not eligible for this scheme"
      );

    }

    const formattedReasons =
      data.reasons.map(
        (reason, index) => ({
          field: `Rule ${index + 1}`,
          value: reason,
        })
      );

    setReasons(
      formattedReasons
    );

    Animated.parallel([
      Animated.timing(
        resultAnim,
        {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }
      ),

      Animated.spring(
        resultSlide,
        {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }
      ),
    ]).start();

  }

  catch (error) {

    console.log(error);

    setResult(
      "Error checking eligibility."
    );

  }

  finally {

    setChecking(false);

  }

};

  const isFormComplete = questions.length > 0 && 
    questions.every((q) => answers[q.field]?.trim());

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading questions...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#4F46E5" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Eligibility Checker</Text>
            <Text style={styles.headerSubtitle}>Verify your qualification</Text>
          </View>
        </View>

        {/* Scheme Card with Gradient */}
        <Animated.View
          style={[
            styles.schemeCardWrapper,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={["#4F46E5", "#7C3AED"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.schemeCard}
          >
            <Text style={styles.schemeTitle}>{schemeName}</Text>
            <Text style={styles.schemeSubtitle}>
              Answer the questions below to check if you qualify for this scheme.
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Progress Indicator */}
        {questions.length > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                {Object.keys(answers).filter((k) => answers[k]?.trim()).length} of{" "}
                {questions.length} answered
              </Text>
              <Text style={styles.progressPercent}>
                {Math.round(
                  (Object.keys(answers).filter((k) => answers[k]?.trim()).length /
                    questions.length) *
                    100
                )}
                %
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${
                      (Object.keys(answers).filter((k) => answers[k]?.trim())
                        .length /
                        questions.length) *
                      100
                    }%`,
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Questions Section */}
        <View style={styles.questionsSection}>
          <Text style={styles.sectionTitle}>Required Information</Text>

          {questions.map((question, index) => (
            <Animated.View
              key={question.field}
              style={[
                styles.questionCard,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 30],
                        outputRange: [0, 30 + index * 10],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.questionHeader}>
                <View style={styles.questionNumber}>
                  <Text style={styles.questionNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.label}>{question.question}</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  answers[question.field]?.trim() && styles.inputFilled,
                ]}
                placeholder="Enter your answer"
                placeholderTextColor="#9CA3AF"
                value={answers[question.field] || ""}
                onChangeText={(value) =>
                  setAnswers({ ...answers, [question.field]: value })
                }
              />
              {answers[question.field]?.trim() && (
                <View style={styles.checkmarkContainer}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                </View>
              )}
            </Animated.View>
          ))}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.button,
            !isFormComplete && styles.buttonDisabled,
          ]}
          onPress={checkEligibility}
          disabled={!isFormComplete || checking}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isFormComplete ? ["#4F46E5", "#7C3AED"] : ["#9CA3AF", "#9CA3AF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            {checking ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.buttonText}>Check Eligibility</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {!isFormComplete && questions.length > 0 && (
          <Text style={styles.helperText}>
            Please answer all questions to check eligibility
          </Text>
        )}

        {/* Result Card */}
        {result !== "" && (
          <Animated.View
            style={[
              styles.resultCard,
              {
                opacity: resultAnim,
                transform: [{ translateY: resultSlide }],
              },
            ]}
          >
            <View style={styles.resultHeader}>
              <View style={styles.resultIconContainer}>
                <Ionicons
                name={
                  result.includes("eligible")
                    ? "checkmark-circle"
                    : "close-circle"
                }
                size={32}
                color={
                  result.includes("eligible")
                    ? "#10B981"
                    : "#EF4444"
                }
              />
              </View>
              <View style={styles.resultHeaderText}>
                <Text style={styles.resultTitle}>Eligibility Result</Text>
                <Text style={styles.resultSubtitle}>{result}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.reasonsTitle}>Your Responses</Text>

            {reasons.map((reason, index) => (
              <View key={index} style={styles.reasonItem}>
                <View style={styles.reasonDot} />
                <View style={styles.reasonContent}>
                  <Text style={styles.reasonField}>{reason.field}</Text>
                  <Text style={styles.reasonValue}>{reason.value}</Text>
                </View>
              </View>
            ))}

          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 60,
    paddingBottom: 20,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  headerTextContainer: {
    marginLeft: 16,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },

  schemeCardWrapper: {
    marginBottom: 24,
  },

  schemeCard: {
    padding: 24,
    borderRadius: 24,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },

  schemeIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  schemeTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },

  schemeSubtitle: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },

  schemeBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  schemeBadgeText: {
    color: "#4F46E5",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },

  progressContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  progressLabel: {
    fontSize: 14,
    color: "#6B7280",
  },

  progressPercent: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4F46E5",
  },

  progressBarBg: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },

  progressBarFill: {
    height: "100%",
    backgroundColor: "#4F46E5",
    borderRadius: 4,
  },

  questionsSection: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },

  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    position: "relative",
  },

  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  questionNumber: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  questionNumberText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4F46E5",
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    flex: 1,
  },

  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    color: "#111827",
  },

  inputFilled: {
    borderColor: "#10B981",
    backgroundColor: "#F0FDF4",
  },

  checkmarkContainer: {
    position: "absolute",
    top: 18,
    right: 18,
  },

  button: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 8,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },

  buttonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },

  buttonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  helperText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 14,
    marginTop: 12,
  },

  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginTop: 28,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },

  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  resultIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
  },

  resultHeaderText: {
    marginLeft: 16,
    flex: 1,
  },

  resultTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  resultSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 20,
  },

  reasonsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 16,
  },

  reasonItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },

  reasonDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4F46E5",
    marginTop: 6,
    marginRight: 12,
  },

  reasonContent: {
    flex: 1,
  },

  reasonField: {
    fontSize: 13,
    color: "#6B7280",
    textTransform: "capitalize",
  },

  reasonValue: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "600",
    marginTop: 2,
  },

  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2FF",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
  },

  viewDetailsText: {
    color: "#4F46E5",
    fontSize: 15,
    fontWeight: "600",
    marginRight: 8,
  },
});
