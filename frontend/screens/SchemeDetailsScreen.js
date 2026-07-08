import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Linking,
  Animated,
  Dimensions,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

// JANSETU Color Theme
const COLORS = {
  primary: "#4F46E5",
  primaryLight: "#EEF2FF",
  primaryDark: "#4338CA",
  secondary: "#7C3AED",
  secondaryLight: "#F3E8FF",
  success: "#10B981",
  successLight: "#D1FAE5",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  info: "#0EA5E9",
  infoLight: "#E0F2FE",
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },
  white: "#FFFFFF",
  black: "#000000",
};

const GRADIENTS = {
  primary: ["#4F46E5", "#7C3AED"],
  primaryLight: ["#EEF2FF", "#E0E7FF"],
  success: ["#10B981", "#059669"],
  warning: ["#F59E0B", "#D97706"],
  info: ["#0EA5E9", "#3B82F6"],
  danger: ["#EF4444", "#DC2626"],
};

export default function SchemeDetailsScreen({ navigation, route }) {
  const { scheme } = route.params;
  const [saved, setSaved] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    checkIfSaved();
    animateIn();
  }, []);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const checkIfSaved = async () => {
    try {
      const savedSchemes = JSON.parse(await AsyncStorage.getItem("savedSchemes")) || [];
      const exists = savedSchemes.find((item) => item.id === scheme.id);
      setSaved(!!exists);
    } catch (error) {
      console.log(error);
    }
  };

  const toggleSave = async () => {
    try {
      let savedSchemes = JSON.parse(await AsyncStorage.getItem("savedSchemes")) || [];
      const exists = savedSchemes.find((item) => item.id === scheme.id);

      if (exists) {
        savedSchemes = savedSchemes.filter((item) => item.id !== scheme.id);
        setSaved(false);
      } else {
        savedSchemes.push(scheme);
        setSaved(true);
      }

      await AsyncStorage.setItem("savedSchemes", JSON.stringify(savedSchemes));
    } catch (error) {
      console.log(error);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this scheme: ${scheme.title}\n\n${scheme.subtitle}\n\nEligibility: ${scheme.eligibility || 'N/A'}\n\nBenefits: ${scheme.benefits || 'N/A'}\n\nLearn more on JANSETU App`,
        title: scheme.title,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const SectionCard = ({ icon, title, children, gradient }) => (
    <Animated.View
      style={[
        styles.sectionCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={gradient || GRADIENTS.primaryLight}
        style={styles.sectionHeaderGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconWrapper}>
            <Ionicons name={icon} size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
      </LinearGradient>
      <Text style={styles.sectionContent}>{children}</Text>
    </Animated.View>
  );

  const ActionButton = ({ icon, title, gradient, onPress, style }) => (
    <TouchableOpacity activeOpacity={0.8} style={[styles.actionButton, style]} onPress={onPress}>
      <LinearGradient
        colors={gradient || GRADIENTS.primary}
        style={styles.actionButtonGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Ionicons name={icon} size={20} color="#FFFFFF" style={styles.actionButtonIcon} />
        <Text style={styles.actionButtonText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.goBack()}>
              <LinearGradient
                colors={GRADIENTS.primaryLight}
                style={styles.headerIconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Scheme Details</Text>

            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerIconBtn} onPress={handleShare}>
                <LinearGradient
                  colors={GRADIENTS.primaryLight}
                  style={styles.headerIconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="share-outline" size={20} color={COLORS.primary} />
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIconBtn} onPress={toggleSave}>
                <LinearGradient
                  colors={GRADIENTS.primaryLight}
                  style={styles.headerIconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons
                    name={saved ? "bookmark" : "bookmark-outline"}
                    size={20}
                    color={saved ? COLORS.primary : COLORS.gray[600]}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Top Card with Animation */}
          <Animated.View
            style={[
              styles.topCardWrapper,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={GRADIENTS.primary}
              style={styles.topCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.topCardContent}>
                <View style={styles.topCardLeft}>
                  <View style={[styles.iconBox, { backgroundColor: scheme.bg || 'rgba(255,255,255,0.2)' }]}>
                    <Ionicons name={scheme.icon} size={36} color={scheme.iconColor || '#FFFFFF'} />
                  </View>
                </View>
                <View style={styles.topCardRight}>
                  <Text style={styles.schemeTitle}>{scheme.title}</Text>
                  <Text style={styles.schemeSubtitle}>{scheme.subtitle}</Text>
                  
                  <View style={styles.tagContainer}>
                    <View style={styles.tagBox}>
                      <Text style={styles.tagText}>{scheme.tag}</Text>
                    </View>
                  
                  </View>
                </View>
              </View>

              {/* Stats Row */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <View style={styles.statIconWrapper}>
                    <Ionicons name="people-outline" size={16} color="#FFFFFF" />
                  </View>
                  <View>
                    <Text style={styles.statValue}>State</Text>
                    <Text style={styles.statLabel}>{scheme.state}</Text>
                  </View>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <View style={styles.statIconWrapper}>
                    <Ionicons name="grid-outline" size={16} color="#FFFFFF" />
                  </View>
                  <View>
                    <Text style={styles.statValue}>Category</Text>
                    <Text style={styles.statLabel}>{scheme.category}</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Verified Banner */}
          <Animated.View
            style={[
              styles.infoBanner,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={GRADIENTS.primaryLight}
              style={styles.infoBannerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="shield-checkmark" size={18} color={COLORS.primary} />
              <Text style={styles.infoBannerText}>Verified Government Scheme</Text>
            </LinearGradient>
          </Animated.View>

          {/* About Section */}
          <SectionCard icon="information-circle-outline" title="About Scheme" gradient={GRADIENTS.primaryLight}>
            {scheme.subtitle}
          </SectionCard>

          {/* Eligibility Section */}
          <SectionCard icon="checkmark-circle-outline" title="Eligibility" gradient={GRADIENTS.successLight}>
            {scheme.eligibility || "Eligibility information not available"}
          </SectionCard>

          {/* Benefits Section */}
          <SectionCard icon="gift-outline" title="Benefits" gradient={GRADIENTS.warningLight}>
            {scheme.benefits || "Benefits information not available"}
          </SectionCard>

          {/* Documents Section */}
          <SectionCard icon="document-text-outline" title="Documents Required" gradient={GRADIENTS.infoLight}>
            {scheme.documents || "Documents information not available"}
          </SectionCard>

          {/* Application Process Section */}
          <SectionCard icon="clipboard-outline" title="Application Process" gradient={GRADIENTS.secondaryLight}>
            {scheme.application_process || "Application process not available"}
          </SectionCard>

          {/* Action Buttons */}
          <Animated.View
            style={[
              styles.actionsContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <ActionButton
              icon="open-outline"
              title="Visit Official Website"
              gradient={GRADIENTS.info}
              onPress={() => {
                if (scheme.official_website) {
                  Linking.openURL(scheme.official_website);
                }
              }}
            />

            <ActionButton
              icon="checkmark-circle-outline"
              title="Check My Eligibility"
              gradient={GRADIENTS.warning}
              onPress={() =>
                navigation.navigate("EligibilityChecker", {
                  schemeId: scheme.id,
                  schemeName: scheme.title,
                })
              }
            />

            <ActionButton
              icon="chatbubble-ellipses-outline"
              title="Ask JANSETU AI"
              gradient={GRADIENTS.primary}
              onPress={() =>
                navigation.navigate("SchemeChatbot", {
                  scheme: scheme,
                })
              }
            />
          </Animated.View>

          {/* Website Note */}
          <Animated.View
            style={[
              styles.websiteNote,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={['#FFFFFF', '#F9FAFB']}
              style={styles.websiteNoteGradient}
            >
              <Ionicons name="information-circle-outline" size={18} color={COLORS.gray[400]} />
              <Text style={styles.websiteNoteText}>
                You will be redirected to the official government website for application and complete details.
              </Text>
            </LinearGradient>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerIconBtn: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerIconGradient: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.gray[900],
    letterSpacing: -0.3,
  },
  headerRight: {
    flexDirection: "row",
    gap: 8,
  },

  // Top Card
  topCardWrapper: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  topCard: {
    padding: 20,
    borderRadius: 24,
  },
  topCardContent: {
    flexDirection: "row",
    marginBottom: 16,
  },
  topCardLeft: {
    marginRight: 16,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  topCardRight: {
    flex: 1,
    justifyContent: "center",
  },
  schemeTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  schemeSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.85)",
    marginBottom: 10,
    lineHeight: 20,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tagBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagBoxLight: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  tagText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  tagTextLight: {
    fontWeight: "500",
  },

  // Stats Row
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 12,
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statLabel: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 8,
  },

  // Info Banner
  infoBanner: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 14,
    overflow: "hidden",
  },
  infoBannerGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 8,
  },
  infoBannerText: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 13,
    flex: 1,
  },
  infoBannerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },

  // Section Cards
  sectionCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  sectionHeaderGradient: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(79, 70, 229, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.gray[800],
    letterSpacing: -0.3,
  },
  sectionContent: {
    fontSize: 15,
    color: COLORS.gray[600],
    lineHeight: 26,
    padding: 18,
    paddingTop: 16,
  },

  // Action Buttons
  actionsContainer: {
    marginTop: 4,
  },
  actionButton: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  actionButtonIcon: {
    marginRight: 10,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Website Note
  websiteNote: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 14,
    overflow: "hidden",
  },
  websiteNoteGradient: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: 14,
  },
  websiteNoteText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.gray[500],
    lineHeight: 20,
  },
});