import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
} from "react-native";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

export default function LanguageScreen({ navigation }) {
const [selected, setSelected] = useState("English");
const insets = useSafeAreaInsets();
  const languages = [
    {
      title: "English",
      subtitle: "English",
    },
    {
      title: "हिन्दी",
      subtitle: "Hindi",
    },
    {
      title: "ಕನ್ನಡ",
      subtitle: "Kannada",
    },
  ];

  return (
    <SafeAreaView
  style={styles.container}
  edges={['top']}
>
      <StatusBar
  backgroundColor="#FFFFFF"
  barStyle="dark-content"
  translucent={false}
/>

      {/* FIXED HEADER - EXACT match to Emergency page */}
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

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            Choose Language
          </Text>
        </View>

        {/* Empty View for perfect center alignment */}
        <View style={{ width: 24 }} />
      </View>

      {/* SCROLLABLE CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Math.max(insets.bottom, 20) + 20,
          }
        ]}
        bounces={false}
      >
        {/* LANGUAGE LIST */}
        <View style={styles.listContainer}>
          {languages.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.languageCard,
                selected === item.title && styles.selectedCard
              ]}
              activeOpacity={0.9}
              onPress={() => setSelected(item.title)}
            >
              <View style={styles.languageTextContainer}>
                <Text style={styles.languageTitle}>
                  {item.title}
                </Text>
                <Text style={styles.languageSubtitle}>
                  {item.subtitle}
                </Text>
              </View>

              {selected === item.title && (
                <View style={styles.checkCircle}>
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color="#FFFFFF"
                  />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* EARTH IMAGE - REDUCED GAP */}
        <View style={styles.bottomContainer}>
          <Image
            source={require("../assets/hello.png")}
            style={styles.earthImage}
            resizeMode="contain"
          />

          <Text style={styles.bottomText}>
            We support multiple languages
          </Text>
          <Text style={styles.bottomText}>
            to serve you better.
          </Text>

          <TouchableOpacity
            style={styles.continueButton}
            activeOpacity={0.9}
            onPress={() =>
              navigation.navigate("Disclaimer", {
                from: "Language",
              })
            }
          >
            <Text style={styles.continueText}>
              Continue
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

header: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 16,
  paddingTop: 13,
  paddingBottom: 20,
},

headerCenter: {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  marginHorizontal: 10,
},

 headerTitle: {
  fontSize: 20,
  fontWeight: "700",
  color: "#111827",
},

  scrollContent: {
    flexGrow: 1,
  },

  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 1,
  },

  languageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#F3F4F6",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  selectedCard: {
    borderColor: "#5B3DF5",
    backgroundColor: "#F8F7FF",
  },

  languageTextContainer: {
    flex: 1,
    marginRight: 12,
  },

  languageTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },

  languageSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },

  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#5B3DF5",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#5B3DF5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  bottomContainer: {
    alignItems: "center",
    paddingHorizontal: 5,
    marginTop: -20,
  },

  earthImage: {
    width: 280,
    height: 280,
    marginBottom: -35,
  },

  bottomText: {
    fontSize: 16,
    color: "#4B5563",
    lineHeight: 24,
    textAlign: "center",
    fontWeight: "500",
  },

  continueButton: {
    width: "90%",
    maxWidth: 400,
    height: 56,
    backgroundColor: "#5B3DF5",
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
    shadowColor: "#5B3DF5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  continueText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    marginRight: 8,
  },
});