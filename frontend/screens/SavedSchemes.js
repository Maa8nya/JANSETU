import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Dimensions,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

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

export default function SavedSchemes({ navigation }) {
  const [savedSchemes, setSavedSchemes] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadSavedSchemes();
    }, [])
  );

  const loadSavedSchemes = async () => {
    try {
      const saved = await AsyncStorage.getItem('savedSchemes');
      if (saved) {
        setSavedSchemes(JSON.parse(saved));
      } else {
        setSavedSchemes([]);
      }
    } catch (error) {
      console.log('Using fallback storage');
      setSavedSchemes([]);
    }
  };

  const removeScheme = async (schemeId) => {

    if (Platform.OS === "web") {

      const ok = window.confirm(
        "Remove this scheme from your saved list?"
      );

      if (!ok) return;

    } else {

      Alert.alert(
        "Remove Scheme",
        "Are you sure you want to remove this scheme from your saved list?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Remove",
            style: "destructive",
            onPress: async () => {

              const updated = savedSchemes.filter(
                s => s.id !== schemeId
              );

              await AsyncStorage.setItem(
                "savedSchemes",
                JSON.stringify(updated)
              );

              setSavedSchemes(updated);
            }
          }
        ]
      );

      return;
    }

    // Web deletion
    const updated = savedSchemes.filter(
      s => s.id !== schemeId
    );

    await AsyncStorage.setItem(
      "savedSchemes",
      JSON.stringify(updated)
    );

    setSavedSchemes(updated);
  };
  

  const removeAllSchemes = async () => {

    if (savedSchemes.length === 0) return;

    if (Platform.OS === "web") {

      const ok = window.confirm(
        "Are you sure you want to remove all saved schemes?"
      );

      if (!ok) return;

      await AsyncStorage.setItem("savedSchemes", JSON.stringify([]));
      setSavedSchemes([]);

    } else {

      Alert.alert(
        "Remove All Schemes",
        "Are you sure you want to remove all schemes from your saved list?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Remove All",
            style: "destructive",
            onPress: async () => {

              await AsyncStorage.setItem(
                "savedSchemes",
                JSON.stringify([])
              );

              setSavedSchemes([]);
            },
          },
        ]
      );

    }
  };

  const renderSavedScheme = ({ item }) => (
    
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
      onPress={() => {
        navigation.navigate("SchemeDetails", { scheme: item });
      }}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F9FAFB']}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardLeft}>
            <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
              <Ionicons name={item.icon} size={28} color={item.iconColor} />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.schemeTitle}>{item.title}</Text>
              <Text style={styles.schemeSubtitle} numberOfLines={2}>
                {item.subtitle}
              </Text>

              <View style={styles.tagRow}>
                <View style={styles.tagBox}>
                  <Text style={styles.tagText}>{item.tag}</Text>
                </View>
                <View style={[styles.tagBox, styles.categoryTag]}>
                  <Text style={[styles.tagText, styles.categoryTagText]}>
                    {item.category}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => removeScheme(item.id)}
            style={styles.removeButton}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={GRADIENTS.danger}
              style={styles.removeButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={GRADIENTS.primaryLight}
              style={styles.headerIconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Saved Schemes</Text>

          {savedSchemes.length > 0 && (
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={removeAllSchemes}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={GRADIENTS.danger}
                style={styles.headerIconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Count Banner */}
        {savedSchemes.length > 0 && (
          <View style={styles.countBanner}>
            <LinearGradient
              colors={GRADIENTS.primaryLight}
              style={styles.countBannerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="bookmark" size={18} color={COLORS.primary} />
              <Text style={styles.countText}>
                {savedSchemes.length} {savedSchemes.length === 1 ? 'Scheme' : 'Schemes'} Saved
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* List */}
        <FlatList
          data={savedSchemes}
          keyExtractor={(item) => item.id}
          renderItem={renderSavedScheme}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <LinearGradient
                colors={GRADIENTS.primaryLight}
                style={styles.emptyIconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="bookmark-outline" size={56} color={COLORS.primary} />
              </LinearGradient>
              <Text style={styles.emptyStateText}>No saved schemes</Text>
              <Text style={styles.emptyStateSubtext}>
                Tap the bookmark icon on any scheme to save it here for quick access
              </Text>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={GRADIENTS.primary}
                  style={styles.browseButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="search-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.browseButtonText}>Browse Schemes</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
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

  // Count Banner
  countBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  countBannerGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 8,
  },
  countText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },

  // Cards
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    flexGrow: 1,
  },
  card: {
    marginTop: 14,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  schemeTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.gray[900],
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  schemeSubtitle: {
    fontSize: 13,
    color: COLORS.gray[500],
    marginBottom: 8,
    lineHeight: 18,
  },
  tagRow: {
    flexDirection: "row",
    gap: 6,
  },
  tagBox: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryTag: {
    backgroundColor: COLORS.secondaryLight,
  },
  tagText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  categoryTagText: {
    color: COLORS.secondary,
  },

  // Remove Button
  removeButton: {
    borderRadius: 10,
    overflow: "hidden",
  },
  removeButtonGradient: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.gray[700],
    marginTop: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.gray[400],
    marginTop: 8,
    marginBottom: 28,
    textAlign: "center",
    lineHeight: 20,
  },
  browseButton: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  browseButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 14,
    gap: 8,
  },
  browseButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});