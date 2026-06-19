import React, { useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function SchemeChatbotScreen({
  route,
  navigation
}) {

  const { scheme } = route.params;

  const [message, setMessage] = useState("");

  const [selectedLanguage, setSelectedLanguage] =
  useState("en");

  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "bot",
      text:
        `👋 Hi! I am JANSETU Scheme Assistant.

I can answer questions about:

${scheme.title}

🌐 Select your preferred language above.

Ask me about:
• Benefits
• Eligibility
• Documents
• Application Process`
    }
  ]);

  const sendMessage = async () => {

    if (!message.trim()) return;

    const userText = message;

    let botReply = "";

    const query = message.toLowerCase();

    if (
      query.includes("benefit") ||
      query.includes("advantage")
    ) {

      botReply =
        scheme.benefits ||
        "Benefits information not available.";

    }

    else if (
      query.includes("eligible") ||
      query.includes("eligibility")
    ) {

      botReply =
        scheme.eligibility ||
        "Eligibility information not available.";

    }

    else if (
      query.includes("document")
    ) {

      botReply =
        scheme.documents ||
        "Document information not available.";

    }

    else if (
      query.includes("apply") ||
      query.includes("application")
    ) {

      botReply =
        scheme.application_process ||
        "Application process not available.";

    }

    else if (
      query.includes("website")
    ) {

      botReply =
        scheme.official_website ||
        "Website not available.";

    }

    else {

      botReply =
        "I can help with:\n\n• Benefits\n• Eligibility\n• Documents\n• Application Process";
    }

    botReply = await translateText(
    botReply,
    selectedLanguage
    );

    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: "user",
        text: userText
      },
      {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: botReply
      }
    ]);

    setMessage("");
  };

  const renderMessage = ({ item }) => (

    <View
      style={[
        styles.messageBubble,
        item.sender === "user"
          ? styles.userBubble
          : styles.botBubble
      ]}
    >

      <Text
        style={[
          styles.messageText,
          item.sender === "user"
            ? { color: "#fff" }
            : { color: "#111827" }
        ]}
      >
        {item.text}
      </Text>

    </View>
  );

  return (

    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >

      {/* HEADER */}

      <View style={styles.header}>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
        >

          <Ionicons
            name="arrow-back"
            size={24}
            color="#111827"
          />

        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Scheme Assistant
        </Text>

        <View style={{ width: 24 }} />

      </View>

      {/* SCHEME NAME */}

      <View style={styles.schemeCard}>

        <Text style={styles.schemeName}>
          {scheme.title}
        </Text>

      </View>


      <View style={styles.languageContainer}>

  <TouchableOpacity
    style={[
  styles.languageChip,
  selectedLanguage === "en" &&
  styles.activeLanguageChip
]}
    onPress={() => setSelectedLanguage("en")}
  >
    <Text>English</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[
  styles.languageChip,
  selectedLanguage === "kn" &&
  styles.activeLanguageChip
]}
    onPress={() => setSelectedLanguage("kn")}
  >
    <Text>ಕನ್ನಡ</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[
  styles.languageChip,
  selectedLanguage === "hi" &&
  styles.activeLanguageChip
]}
    onPress={() => setSelectedLanguage("hi")}
  >
    <Text>हिन्दी</Text>
  </TouchableOpacity>

</View>

      {/* CHAT */}

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{
          padding: 16
        }}
      />

      {/* QUICK BUTTONS */}

      <View style={styles.quickRow}>

        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => setMessage("Benefits")}
        >
          <Text>Benefits</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => setMessage("Eligibility")}
        >
          <Text>Eligibility</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => setMessage("Documents")}
        >
          <Text>Documents</Text>
        </TouchableOpacity>

      </View>

      {/* INPUT */}

      <View style={styles.inputContainer}>

        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Ask about this scheme..."
          style={styles.input}
        />

        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
        >

          <Ionicons
            name="send"
            size={20}
            color="#fff"
          />

        </TouchableOpacity>

      </View>

    </KeyboardAvoidingView>
  );
}

const translateText = async (text, targetLanguage) => {

  try {

    const url =
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;

    const response = await fetch(url);

    const data = await response.json();

    return data[0]
      .map(item => item[0])
      .join("");

  } catch (error) {

    console.log("Translation Error:", error);

    return text;
  }
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC"
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 55,
    paddingBottom: 15,
    backgroundColor: "#fff"
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700"
  },

  schemeCard: {
    backgroundColor: "#EEF2FF",
    margin: 16,
    padding: 16,
    borderRadius: 16
  },

  schemeName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4F46E5"
  },

  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12
  },

  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#4F46E5"
  },

  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF"
  },

  messageText: {
    fontSize: 15,
    lineHeight: 22
  },

  quickRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 10
  },

  quickButton: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20
  },

  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    alignItems: "center"
  },

  input: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 50
  },

  languageContainer: {
  flexDirection: "row",
  justifyContent: "center",
  marginBottom: 10,
},

languageChip: {
  backgroundColor: "#EEF2FF",
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 20,
  marginHorizontal: 5,
},

activeLanguageChip: {
  backgroundColor: "#9b96f7",
},

  sendButton: {
    marginLeft: 10,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center"
  }
});