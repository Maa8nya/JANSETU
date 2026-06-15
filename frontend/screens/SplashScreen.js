import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ImageBackground,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SplashScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  // Responsive sizing based on screen dimensions
  const logoSize = Math.min(width * 0.085, 34);
  const subtitleSize = Math.min(width * 0.045, 18);
  const descriptionSize = Math.min(width * 0.035, 14);
  const buttonHeight = Math.min(height * 0.065, 52);
  const buttonMarginBottom = Math.min(height * 0.02, 16);

  const subtitleLineHeight = subtitleSize * 1.4;
  const descriptionLineHeight = descriptionSize * 1.5;

  // Top position for logo - adjusts for different notches
  const topPosition = Math.max(insets.top + 20, height * 0.05);

  return (
    <ImageBackground
      source={require("../assets/splashbg.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <SafeAreaView style={styles.safeArea}>
        <View
          style={[
            styles.mainContainer,
            {
              paddingTop: Platform.OS === "android" ? Math.max(insets.top, 20) : 0,
              paddingBottom: Math.max(insets.bottom, 20),
            },
          ]}
        >
          {/* LOGO SECTION */}
          <View style={[styles.content, { top: topPosition }]}>
            <Text
              style={[styles.logo, { fontSize: logoSize }]}
              maxFontSizeMultiplier={1}
            >
              JANSETU
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  fontSize: subtitleSize,
                  lineHeight: subtitleLineHeight,
                },
              ]}
              maxFontSizeMultiplier={1}
            >
              AI Assistant for
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  fontSize: subtitleSize,
                  lineHeight: subtitleLineHeight,
                },
              ]}
              maxFontSizeMultiplier={1}
            >
              Legal & Policy Awareness
            </Text>

            <View style={styles.descriptionContainer}>
              <Text
                style={[
                  styles.description,
                  {
                    fontSize: descriptionSize,
                    lineHeight: descriptionLineHeight,
                  },
                ]}
                maxFontSizeMultiplier={1}
              >
                Empowering citizens with
              </Text>

              <Text
                style={[
                  styles.description,
                  {
                    fontSize: descriptionSize,
                    lineHeight: descriptionLineHeight,
                  },
                ]}
                maxFontSizeMultiplier={1}
              >
                simplified legal and policy
              </Text>

              <Text
                style={[
                  styles.description,
                  {
                    fontSize: descriptionSize,
                    lineHeight: descriptionLineHeight,
                  },
                ]}
                maxFontSizeMultiplier={1}
              >
                information.
              </Text>
            </View>
          </View>

          {/* BUTTONS - Fixed at bottom */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={[
                styles.startButton,
                { 
                  height: buttonHeight,
                  marginBottom: buttonMarginBottom,
                }
              ]}
              activeOpacity={0.9}
              onPress={() => navigation?.navigate("Disclaimer")}
            >
              <Text style={[styles.startText, { fontSize: Math.min(width * 0.04, 16) }]}>
                Get Started
              </Text>
              <Ionicons
                name="arrow-forward"
                size={Math.min(width * 0.05, 20)}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageButton,
                { height: buttonHeight }
              ]}
              activeOpacity={0.9}
              onPress={() => navigation?.navigate("Language")}
            >
              <Ionicons
                name="globe-outline"
                size={Math.min(width * 0.045, 18)}
                color="#FFFFFF"
              />
              <Text style={[styles.languageText, { fontSize: Math.min(width * 0.038, 15) }]}>
                Select Language
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  mainContainer: {
    flex: 1,
    paddingHorizontal: 28,
    
  },

  content: {
    alignItems: "center",
    position: "absolute",
    left: 0,
    right: 0,
  },

  logo: {
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 12,
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  subtitle: {
    fontWeight: "700",
    color: "#FFFFFF",
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  descriptionContainer: {
    marginTop: 10,
    alignItems: "center",
  },

  description: {
    color: "#E0E7FF",
    textAlign: "center",
  },

 bottomSection: {
  position: "absolute",
  left: 28,
  right: 28,
  bottom: 80, // adjust between 70-90
},
  startButton: {
    backgroundColor: "#5B3DF5",
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#5B3DF5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  startText: {
    color: "#FFFFFF",
    fontWeight: "700",
    marginRight: 8,
  },

  languageButton: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  languageText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 8,
  },
});