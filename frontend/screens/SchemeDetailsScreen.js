import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Linking,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SchemeDetailsScreen({
  navigation,
  route,
}) {

  const { scheme } = route.params;

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    checkIfSaved();
  }, []);

  const checkIfSaved = async () => {
    try {

      const savedSchemes =
        JSON.parse(
          await AsyncStorage.getItem(
            "savedSchemes"
          )
        ) || [];

      const exists = savedSchemes.find(
        (item) => item.id === scheme.id
      );

      setSaved(!!exists);

    } catch (error) {
      console.log(error);
    }
  };

  const toggleSave = async () => {
    try {

      let savedSchemes =
        JSON.parse(
          await AsyncStorage.getItem(
            "savedSchemes"
          )
        ) || [];

      const exists = savedSchemes.find(
        (item) => item.id === scheme.id
      );

      if (exists) {

        savedSchemes = savedSchemes.filter(
          (item) => item.id !== scheme.id
        );

        setSaved(false);

      } else {

        savedSchemes.push(scheme);

        setSaved(true);
      }

      await AsyncStorage.setItem(
        "savedSchemes",
        JSON.stringify(savedSchemes)
      );

    } catch (error) {
      console.log(error);
    }
  };

  return (

    <View style={styles.container}>

      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
      />

      <SafeAreaView style={styles.safeArea}>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 40,
          }}
        >

          {/* HEADER */}

          <View style={styles.header}>

            <TouchableOpacity
              style={styles.headerIcon}
              onPress={() => navigation.goBack()}
            >

              <Ionicons
                name="arrow-back"
                size={24}
                color="#111827"
              />

            </TouchableOpacity>

            <Text style={styles.headerTitle}>
              Scheme Details
            </Text>

            <TouchableOpacity
              style={styles.headerIcon}
              onPress={toggleSave}
            >

              <Ionicons
                name={
                  saved
                    ? "bookmark"
                    : "bookmark-outline"
                }
                size={22}
                color={
                  saved
                    ? "#4F46E5"
                    : "#111827"
                }
              />

            </TouchableOpacity>

          </View>

          {/* TOP CARD */}

          <View style={styles.topCard}>

            <View
              style={[
                styles.iconBox,
                {
                  backgroundColor: scheme.bg,
                },
              ]}
            >

              <Ionicons
                name={scheme.icon}
                size={34}
                color={scheme.iconColor}
              />

            </View>

            <View style={styles.topText}>

              <Text style={styles.schemeTitle}>
                {scheme.title}
              </Text>

              <Text style={styles.schemeSubtitle}>
                {scheme.subtitle}
              </Text>

              <View style={styles.statsRow}>

                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>
                    State
                  </Text>

                  <Text style={styles.statLabel}>
                    {scheme.state}
                  </Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>
                    Category
                  </Text>

                  <Text style={styles.statLabel}>
                    {scheme.category}
                  </Text>
                </View>

              </View>

              <View style={styles.tagBox}>

                <Text style={styles.tagText}>
                  {scheme.tag}
                </Text>

              </View>

            </View>

          </View>

          <View style={styles.infoBanner}>

          <Ionicons
            name="shield-checkmark"
            size={18}
            color="#4F46E5"
          />

          <Text style={styles.infoBannerText}>
            Verified Government Scheme
          </Text>

        </View>

          {/* ABOUT */}

          <View style={styles.sectionCard}>

            <Text style={styles.sectionTitle}>
              About Scheme
            </Text>

            <Text style={styles.aboutText}>
             {scheme.subtitle}
            </Text>

          </View>

          {/* ELIGIBILITY */}

            <View style={styles.sectionCard}>

              <View style={styles.sectionHeader}>

              <Ionicons
                name="checkmark-circle"
                size={20}
                color="#4F46E5"
              />

              <Text
                style={[
                  styles.sectionTitle,
                  { marginLeft: 8, marginBottom: 0 }
                ]}
              >
                Eligibility
              </Text>

            </View>

              <Text style={styles.aboutText}>
                {scheme.eligibility || "Eligibility information not available"}
              </Text>

            </View>

            {/* BENEFITS */}

            <View style={styles.sectionCard}>

              <View style={styles.sectionHeader}>

              <Ionicons
                name="gift"
                size={20}
                color="#4F46E5"
              />

              <Text
                style={[
                  styles.sectionTitle,
                  { marginLeft: 8, marginBottom: 0 }
                ]}
              >
                Benefits
              </Text>

            </View>

              <Text style={styles.aboutText}>
                {scheme.benefits || "Benefits information not available"}
              </Text>

            </View>

            {/* DOCUMENTS REQUIRED */}

            <View style={styles.sectionCard}>

              <View style={styles.sectionHeader}>

              <Ionicons
                name="document-text"
                size={20}
                color="#4F46E5"
              />

              <Text
                style={[
                  styles.sectionTitle,
                  { marginLeft: 8, marginBottom: 0 }
                ]}
              >
                Documents Required
              </Text>

            </View>

              <Text style={styles.aboutText}>
                {scheme.documents || "Documents information not available"}
              </Text>

            </View>

            {/* APPLICATION PROCESS */}

            <View style={styles.sectionCard}>

              <View style={styles.sectionHeader}>

              <Ionicons
                name="clipboard"
                size={20}
                color="#4F46E5"
              />

              <Text
                style={[
                  styles.sectionTitle,
                  { marginLeft: 8, marginBottom: 0 }
                ]}
              >
                Application Process
              </Text>

            </View>

              <Text style={styles.aboutText}>
                {scheme.application_process || "Application process not available"}
              </Text>

            </View>

           {/* OFFICIAL WEBSITE BUTTON */}

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.button}
            onPress={() => {
              if (scheme.official_website) {
                Linking.openURL(scheme.official_website);
              }
            }}
          >
           <Ionicons
              name="open-outline"
              size={20}
              color="#FFFFFF"
              style={{ marginRight: 8 }}
            />

            <Text style={styles.buttonText}>
              Visit Official Website
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.eligibilityButton}
            onPress={() =>
              navigation.navigate(
                "EligibilityChecker",
                {
                  schemeId: scheme.id,
                  schemeName: scheme.title
                }
              )
            }
          >
            <Ionicons
              name="checkmark-circle"
              size={20}
              color="#FFFFFF"
              style={{ marginRight: 8 }}
            />

            <Text style={styles.buttonText}>
              Check My Eligibility
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
          activeOpacity={0.9}
          style={styles.aiButton}
          onPress={() =>
            navigation.navigate(
              "SchemeChatbot",
              {
                scheme: scheme
              }
            )
          }
        >
          <Ionicons
            name="chatbubble-ellipses"
            size={20}
            color="#FFFFFF"
            style={{ marginRight: 8 }}
          />

          <Text style={styles.buttonText}>
            Ask JANSETU AI
          </Text>
        </TouchableOpacity>

            <View style={styles.websiteNote}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#6B7280"
            />

            <Text style={styles.websiteNoteText}>
              You will be redirected to the official government website for application and complete details.
            </Text>
          </View>

        </ScrollView>

      </SafeAreaView>

    </View>

  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  safeArea: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },

  headerIcon: {
    width: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  topCard: {
    backgroundColor: "#EEF2FF",
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#EEF2F7",
    marginBottom: 18,
  },

  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
  },

  infoBannerText: {
    marginLeft: 8,
    color: "#4F46E5",
    fontWeight: "600",
  },

  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },

  chip: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },

  chipText: {
    fontSize: 12,
    color: "#374151",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  statsRow: {
    flexDirection: "row",
    marginTop: 14,
  },

  statCard: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 10,
  },

  statNumber: {
    fontWeight: "700",
    color: "#4F46E5",
  },

  statLabel: {
    color: "#6B7280",
    marginTop: 4,
  },

  eligibilityButton: {
    height: 58,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F59E0B",
    flexDirection: "row",
    elevation: 5,
  },

  iconBox: {
    width: 74,
    height: 74,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  topText: {
    flex: 1,
  },

  schemeTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },

  schemeSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },

  tagBox: {
    alignSelf: "flex-start",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },

  tagText: {
    color: "#4F46E5",
    fontSize: 12,
    fontWeight: "700",
  },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#EEF2F7",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },

  aboutText: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 28,
  },

  eligibilityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  eligibilityText: {
    marginLeft: 12,
    fontSize: 15,
    color: "#374151",
  },

 button: {
  height: 58,
  marginHorizontal: 16,
  borderRadius: 18,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#0EA5E9",
  flexDirection: "row",
  shadowColor: "#4F46E5",
  shadowOpacity: 0.25,
  shadowRadius: 8,
  elevation: 5,
},

  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  aiButton: {
  height: 58,
  marginHorizontal: 16,
  marginTop: 12,

  borderRadius: 18,

  justifyContent: "center",
  alignItems: "center",

  backgroundColor: "#4F46E5",

  flexDirection: "row",

  shadowColor: "#10B981",
  shadowOpacity: 0.25,
  shadowRadius: 8,

  elevation: 5,
},

  websiteNote: {
  flexDirection: "row",
  alignItems: "center",
  marginHorizontal: 20,
  marginTop: 14,
  paddingHorizontal: 8,
},

websiteNoteText: {
  flex: 1,
  marginLeft: 8,
  fontSize: 13,
  color: "#6B7280",
  lineHeight: 20,
},

});