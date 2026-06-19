import React from "react";

import DisclaimerScreen from "./screens/DisclaimerScreen";
import LanguageScreen from "./screens/LanguageScreen";
import HomeScreen from "./screens/HomeScreen";
import ChatScreen from "./screens/ChatScreen";
import ChatHistoryScreen from './screens/ChatHistoryScreen';
import EmergencyHelpScreen from "./screens/EmergencyHelpScreen";
import RightsScreen from "./screens/RightsScreen";
import GovernmentSchemesScreen from "./screens/GovernmentSchemesScreen";
import SchemeDetailsScreen from "./screens/SchemeDetailsScreen";
import SavedSchemes from "./screens/SavedSchemes";
import PopularLawsScreen from "./screens/PopularLawsScreen";
import RightsDetailScreen from './screens/RightsDetailScreen';
import SchemeChatbotScreen from "./screens/SchemeChatbotScreen";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  ImageBackground,
  Image,
} from "react-native";

import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NavigationContainer } from "@react-navigation/native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { Ionicons } from "@expo/vector-icons";

import { LoadingProvider } from "./context/LoadingContext";

const Stack = createNativeStackNavigator();

/* ================= SPLASH SCREEN ================= */

function SplashScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <ImageBackground
      source={require("./assets/splashbg.png")}
      style={styles.splashContainer}
      resizeMode="cover"
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <SafeAreaView style={styles.safeArea}>
        <View />

        {/* CENTER CONTENT */}
        <View style={styles.centerContent}>
          <Image
            source={require("./assets/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />

          <Text style={styles.subtitle}>
            AI Assistant for
          </Text>

          <Text style={styles.subtitle}>
            Legal & Policy Awareness
          </Text>

          <Text style={styles.description}>
            Empowering citizens with
          </Text>

          <Text style={styles.description}>
            simplified legal and policy
          </Text>

          <Text style={styles.description}>
            information.
          </Text>
        </View>

        {/* BUTTONS */}
        <View style={[styles.bottomSection, { paddingBottom: insets.bottom > 0 ? 0 : 6 }]}>
          <TouchableOpacity
            style={styles.startButton}
            activeOpacity={0.9}
            onPress={() =>
              navigation.navigate("Disclaimer", {
                from: "Splash",
              })
            }
          >
            <Text style={styles.startText}>
              Get Started
            </Text>

            <Ionicons
              name="arrow-forward"
              size={22}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.languageButton}
            activeOpacity={0.9}
            onPress={() => navigation.navigate("Language")}
          >
            <Ionicons
              name="globe-outline"
              size={20}
              color="#FFFFFF"
            />

            <Text style={styles.languageText}>
              Select Language
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

/* ================= MAIN APP ================= */

/* ================= MAIN APP ================= */

export default function App() {
  return (
    <SafeAreaProvider>
      <LoadingProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>

            <Stack.Screen
              name="Splash"
              component={SplashScreen}
            />

            <Stack.Screen
              name="Language"
              component={LanguageScreen}
            />

            <Stack.Screen
              name="Disclaimer"
              component={DisclaimerScreen}
            />

            <Stack.Screen
              name="Home"
              component={HomeScreen}
            />

            <Stack.Screen
              name="Chat"
              component={ChatScreen}
            />

            <Stack.Screen
              name="ChatHistory"
              component={ChatHistoryScreen}
            />

            <Stack.Screen
              name="Rights"
              component={RightsScreen}
            />

            <Stack.Screen
              name="RightsDetail"
              component={RightsDetailScreen}
            />

            <Stack.Screen
              name="EmergencyHelpScreen"
              component={EmergencyHelpScreen}
            />

            <Stack.Screen
              name="Schemes"
              component={GovernmentSchemesScreen}
            />

            <Stack.Screen
              name="SchemeDetails"
              component={SchemeDetailsScreen}
            />

            <Stack.Screen
              name="SavedSchemes"
              component={SavedSchemes}
            />

            <Stack.Screen
              name="PopularLaws"
              component={PopularLawsScreen}
            />

            <Stack.Screen
              name="SchemeChatbot"
              component={SchemeChatbotScreen}
            />

          </Stack.Navigator>
        </NavigationContainer>
      </LoadingProvider>
    </SafeAreaProvider>
  );
}
    
/* ================= STYLES ================= */

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
    paddingHorizontal: 26,
    justifyContent: "space-between",
    paddingBottom: 32,
  },

  centerContent: {
    alignItems: "center",
    marginTop: -98,
  },

  logoImage: {
    width: 250,
    height: 250,
    marginBottom: -8,
  },

  subtitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 18,
    marginBottom: 17,
  },

  description: {
    fontSize: 13,
    color: "#E0E7FF",
    lineHeight: 19,
    textAlign: "center",
    marginTop: 8,
  },

  bottomSection: {
    width: "100%",
    marginBottom: 6,
  },

  startButton: {
    height: 62,
    backgroundColor: "#5B3DF5",
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  startText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 10,
  },

  languageButton: {
    height: 62,
    borderRadius: 18,
    borderWidth: 1.4,
    borderColor: "rgba(255,255,255,0.45)",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  languageText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    marginLeft: 10,
  },
});