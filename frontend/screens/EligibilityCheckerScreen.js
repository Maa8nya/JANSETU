import React, { useState, useEffect} from "react";
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
} from "react-native";

export default function EligibilityCheckerScreen({
  route,
  navigation,
}) {

 const {
  schemeId,
  schemeName
} = route.params;

const [questions, setQuestions] =
useState([]);

const [answers, setAnswers] =
useState({});

  const [income, setIncome] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [state, setState] = useState("");

  const [result, setResult] = useState("");
  const [reasons, setReasons] = useState([]);

  useEffect(() => {

  fetchQuestions();

}, []);

const fetchQuestions = async () => {

  try {

    const response =
      await fetch(
        "http://10.35.21.29:5000/eligibility-questions",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            scheme_id: schemeId
          })
        }
      );

    const data =
      await response.json();

    setQuestions(
      data.questions || []
    );

  }

  catch (error) {

    console.log(error);

  }

};

  const checkEligibility = () => {

  let reasonsList = [];

  Object.keys(answers).forEach(
    (key) => {

      reasonsList.push(
        `✔ ${key}: ${answers[key]}`
      );

    }
  );

  setResult(
    "Eligibility information collected successfully."
  );

  setReasons(
    reasonsList
  );

};

  return (

    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 40,
      }}
    >
        
    <View style={styles.header}>

  <TouchableOpacity
    style={styles.backButton}
    onPress={() => navigation.goBack()}
  >
    <Ionicons
      name="arrow-back"
      size={22}
      color="#4F46E5"
    />
  </TouchableOpacity>

  <Text style={styles.headerTitle}>
    Eligibility Checker
  </Text>

</View>

      {/* Scheme Card */}

      <View style={styles.schemeCard}>

        <Text style={styles.schemeTitle}>
            {schemeName}
            </Text>

        <Text style={styles.schemeSubtitle}>
          Check whether you qualify for
          this government scheme.
        </Text>

      </View>

      {/* DYNAMIC QUESTIONS */}

{
  questions.map((question) => (

    <View
      key={question.field}
    >

      <Text style={styles.label}>
        {question.question}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter answer"
        onChangeText={(value) =>

          setAnswers({
            ...answers,
            [question.field]: value
          })

        }
      />

    </View>

  ))
}

      {/* BUTTON */}

      <TouchableOpacity
        style={styles.button}
        onPress={checkEligibility}
      >

        <Text style={styles.buttonText}>
          Check Eligibility
        </Text>

      </TouchableOpacity>

      {/* RESULT */}

      {result !== "" && (

        <View style={styles.resultCard}>

          <Text style={styles.resultTitle}>
            Eligibility Result
          </Text>

          <Text style={styles.result}>
            {result}
          </Text>

          <View
            style={{
              marginTop: 15,
            }}
          >

            <Text
              style={{
                fontWeight: "700",
                marginBottom: 10,
              }}
            >
              Reasons:
            </Text>

            {reasons.map(
              (reason, index) => (

                <Text
                  key={index}
                  style={styles.reasonText}
                >
                  {reason}
                </Text>

              )
            )}

          </View>

        </View>

      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 20,
  },

 header: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 20,
  marginTop:
    Platform.OS === "android"
      ? StatusBar.currentHeight
      : 0,
},

backButton: {
  width: 40,
  height: 40,
  borderRadius: 12,
  backgroundColor: "#EEF2FF",
  justifyContent: "center",
  alignItems: "center",
},

headerTitle: {
  fontSize: 24,
  fontWeight: "700",
  marginLeft: 12,
  color: "#111827",
},

  schemeCard: {
    backgroundColor: "#EEF2FF",
    padding: 20,
    borderRadius: 18,
    marginBottom: 25,
  },

  schemeTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4F46E5",
  },

  schemeSubtitle: {
    color: "#6B7280",
    marginTop: 8,
    lineHeight: 22,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 5,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  button: {
    backgroundColor: "#4F46E5",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
    elevation: 4,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  resultCard: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 16,
    marginTop: 25,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  resultTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#111827",
  },

  result: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4F46E5",
  },

  reasonText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 6,
  },

});