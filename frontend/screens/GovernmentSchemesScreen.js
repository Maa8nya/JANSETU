import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  StatusBar,
  Modal,
  Dimensions,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import BottomNav from "../components/BottomNav";
import Loader from "../components/Loader";

const API_URL = "http://192.168.0.128:5000"; // Replace this with your laptop IP address
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

const filters = [
  { label: "All", value: "All", icon: "apps-outline" },
  { label: "Central", value: "Central", icon: "business-outline" },
  { label: "State", value: "State", icon: "location-outline" },
  { label: "Category", value: "Category", icon: "grid-outline" },
];

const categories = [
  "All Categories",
  "Agriculture & Rural Development",
  "Education & Learning",
  "Health & Wellness",
  "Women & Child",
  "Skills & Employment",
  "Culture & Arts",
  "Social Welfare & Empowerment",
  "Housing",
];

const placeholderTexts = [
  "Search schemes...",
  "Housing schemes...",
  "Education schemes...",
  "Health schemes...",
  "Agriculture schemes...",
  "Central schemes...",
  "State schemes...",
];

const INITIAL_DELAY = 5000;
const INTERVAL_DURATION = 3000;
const ANIMATION_DURATION = 300;

export default function SchemesScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [savedSchemeIds, setSavedSchemeIds] = useState([]);
  const [schemesData, setSchemesData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  // Refs for placeholder animation
useEffect(() => {
  fetchSchemes();

  const initialTimeout = setTimeout(() => {
    const interval = setInterval(() => {

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -20,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start(() => {

        setCurrentPlaceholderIndex((prev) =>
          prev === placeholderTexts.length - 1 ? 0 : prev + 1
        );

        slideAnim.setValue(20);

        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: ANIMATION_DURATION,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: ANIMATION_DURATION,
            useNativeDriver: true,
          }),
        ]).start();
      });

    }, INTERVAL_DURATION);

    return () => clearInterval(interval);
  }, INITIAL_DELAY);

  return () => clearTimeout(initialTimeout);

}, []);

  const fetchSchemes = async () => {
    try {
      console.log("FETCH STARTED");
      const response = await fetch("http://192.168.0.128:5000/schemes");
      console.log("STATUS:", response.status);
      const text = await response.text();
      console.log("RAW RESPONSE:", text.substring(0, 200));
      const data = JSON.parse(text);
      console.log("TOTAL SCHEMES:", data.length);

      const formattedData = data.map((scheme) => ({
        id: String(scheme.id),
        title: scheme.scheme_name,
        subtitle: scheme.brief_description,
        tag: scheme.category,
        category: scheme.level,
        state: scheme.state,
        ...getSchemeIcon(scheme.category),
        eligibility: scheme.eligibility_criteria,
        benefits: scheme.benefits,
        documents: scheme.documents_required,
        application_process: scheme.application_process,
        official_website: scheme.official_website,
      }));

      setSchemesData(formattedData);
      console.log("LOADED:", formattedData.length);
    } catch (error) {
      console.log("FETCH ERROR:", error);
    }
  };

  const getSchemeIcon = (category) => {
    const cat = category?.toLowerCase() || "";
    if (cat.includes("education")) return { icon: "school", iconColor: "#2563EB", bg: "#DBEAFE" };
    if (cat.includes("health")) return { icon: "medkit", iconColor: "#DC2626", bg: "#FEE2E2" };
    if (cat.includes("agriculture")) return { icon: "leaf", iconColor: "#16A34A", bg: "#DCFCE7" };
    if (cat.includes("housing")) return { icon: "home", iconColor: "#EA580C", bg: "#FED7AA" };
    if (cat.includes("social")) return { icon: "people", iconColor: "#7C3AED", bg: "#EDE9FE" };
    if (cat.includes("women") || cat.includes("child")) return { icon: "woman", iconColor: "#DB2777", bg: "#FCE7F3" };
    if (cat.includes("employment") || cat.includes("skill") || cat.includes("livelihood")) 
      return { icon: "briefcase", iconColor: "#0891B2", bg: "#CFFAFE" };
    if (cat.includes("culture") || cat.includes("art")) 
      return { icon: "color-palette", iconColor: "#D97706", bg: "#FEF3C7" };
    if (cat.includes("finance") || cat.includes("financial")) 
      return { icon: "cash", iconColor: "#059669", bg: "#D1FAE5" };
    return { icon: "document-text", iconColor: "#4F46E5", bg: "#EEF2FF" };
  };

  useFocusEffect(
    useCallback(() => {
      loadSavedSchemes();
    }, [])
  );

  const loadSavedSchemes = async () => {
    try {
      const saved = await AsyncStorage.getItem('savedSchemes');
      if (saved) {
        const savedSchemes = JSON.parse(saved);
        setSavedSchemeIds(savedSchemes.map(scheme => scheme.id));
      } else {
        setSavedSchemeIds([]);
      }
    } catch (error) {
      console.error('Error loading saved schemes:', error);
    }
  };

  const toggleSaveScheme = async (scheme) => {
    try {
      let savedSchemes = JSON.parse(await AsyncStorage.getItem('savedSchemes')) || [];
      const exists = savedSchemes.find(item => item.id === scheme.id);
      
      if (exists) {
        savedSchemes = savedSchemes.filter(item => item.id !== scheme.id);
        setSavedSchemeIds(prev => prev.filter(id => id !== scheme.id));
      } else {
        savedSchemes.push(scheme);
        setSavedSchemeIds(prev => [...prev, scheme.id]);
      }
      
      await AsyncStorage.setItem('savedSchemes', JSON.stringify(savedSchemes));
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const getFilteredSchemes = () => {
    let filtered = schemesData;
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (scheme) =>
          scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          scheme.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          scheme.tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (activeFilter === "Category" && selectedCategory !== "All Categories") {
      filtered = filtered.filter(
        (scheme) =>
          selectedCategory.toLowerCase().includes(scheme.tag.toLowerCase()) ||
          scheme.tag.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    } else if (activeFilter === "Central") {
      filtered = filtered.filter((scheme) => scheme.category === "Central");
    } else if (activeFilter === "State") {
      filtered = filtered.filter((scheme) => scheme.category === "State");
    }
    return filtered;
  };

  const handleFilterPress = (filter) => {
    if (filter === "Category") {
      setShowCategoryModal(true);
    } else {
      setActiveFilter(filter);
      setSelectedCategory("All Categories");
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setActiveFilter("Category");
    setShowCategoryModal(false);
  };

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/search?query=${searchQuery}`);
      const data = await response.json();
      console.log("DATA FROM API:", data);
      const formattedData = data.map((scheme) => ({
        id: scheme.id.toString(),
        title: scheme.scheme_name,
        subtitle: scheme.brief_description,
        tag: scheme.category,
        category: scheme.level,
        state: scheme.state,
        ...getSchemeIcon(scheme.category),
        eligibility: scheme.eligibility_criteria,
        benefits: scheme.benefits,
        documents: scheme.documents_required,
        application_process: scheme.application_process,
        official_website: scheme.official_website,
      }));
      setSchemesData(formattedData);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderScheme = ({ item }) => {

     const tagsArray = item.tag?.split(",") || [];

    const visibleTags = tagsArray
      .slice(0, 3)
      .join(", ");

    const remainingCount =
      tagsArray.length - 3;
      
    const isSaved = savedSchemeIds.includes(item.id);
    
    return (
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
                    <Text
                      style={styles.tagText}
                      numberOfLines={1}
                    >
                      {visibleTags}
                      {remainingCount > 0
                        ? ` +${remainingCount}`
                        : ""}
                    </Text>
                  </View>

                  <View style={[styles.tagBox, styles.categoryTag]}>
                    <Text
                      style={[
                        styles.tagText,
                        styles.categoryTagText
                      ]}
                    >
                      {item.category}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.cardRight}>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  toggleSaveScheme(item);
                }}
                style={styles.saveButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <LinearGradient
                  colors={isSaved ? GRADIENTS.primary : ['#F3F4F6', '#F3F4F6']}
                  style={styles.saveButtonGradient}
                >
                  <Ionicons
                    name={isSaved ? "bookmark" : "bookmark-outline"}
                    size={18}
                    color={isSaved ? "#FFFFFF" : "#6B7280"}
                  />
                </LinearGradient>
              </TouchableOpacity>
              <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const filteredSchemes = getFilteredSchemes();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
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

          <Text style={styles.headerTitle}>Government Schemes</Text>

          <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.navigate("SavedSchemes")}>
            <LinearGradient
              colors={GRADIENTS.primaryLight}
              style={styles.headerIconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="bookmark-outline" size={22} color={COLORS.primary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <LinearGradient
            colors={['#FFFFFF', '#F9FAFB']}
            style={styles.searchBox}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder=""
                placeholderTextColor="transparent"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                onSubmitEditing={handleSearch}
              />

              {!searchQuery && (
                <Animated.View
                  style={[
                    styles.placeholderContainer,
                    {
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }],
                    },
                  ]}
                  pointerEvents="none"
                >
                  <Text style={styles.placeholderPrefix}>
                    Search{" "}
                  </Text>

                  <Text style={styles.placeholderText}>
                    {placeholderTexts[currentPlaceholderIndex]
                      .replace("Search ", "")
                      .replace("schemes...", "")
                      .trim()}
                  </Text>

                  <Text style={styles.placeholderSuffix}>
                    {" "}schemes...
                  </Text>
                </Animated.View>
              )}
            </View>
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </LinearGradient>
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {filters.map((item) => (
            <TouchableOpacity
              key={item.value}
              onPress={() => handleFilterPress(item.value)}
              style={[
                styles.filterButton,
                activeFilter === item.value && styles.activeFilter,
              ]}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={activeFilter === item.value ? GRADIENTS.primary : ['#F3F4F6', '#F3F4F6']}
                style={styles.filterGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons
                  name={item.icon}
                  size={14}
                  color={activeFilter === item.value ? '#FFFFFF' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === item.value && styles.activeFilterText,
                  ]}
                >
                  {item.label}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* List */}
        <FlatList
          data={filteredSchemes}
          keyExtractor={(item) => item.id}
          renderItem={renderScheme}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <LinearGradient
                colors={GRADIENTS.primaryLight}
                style={styles.emptyIconContainer}
              >
                <Ionicons name="search-outline" size={48} color={COLORS.primary} />
              </LinearGradient>
              <Text style={styles.emptyStateText}>No schemes found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your search or filters
              </Text>
            </View>
          )}
        />

        {/* Category Modal */}
        <Modal
          visible={showCategoryModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowCategoryModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowCategoryModal(false)}
          >
            <View style={styles.modalContent}>
              <LinearGradient
                colors={GRADIENTS.primary}
                style={styles.modalHeader}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.modalTitle}>Select Category</Text>
                <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </LinearGradient>

              <FlatList
                data={categories}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.categoryOption,
                      selectedCategory === item && styles.selectedCategory,
                    ]}
                    onPress={() => handleCategorySelect(item)}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        selectedCategory === item && styles.selectedCategoryText,
                      ]}
                    >
                      {item}
                    </Text>
                    {selectedCategory === item && (
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Bottom Nav */}
        <BottomNav active="Schemes" navigation={navigation} />
        {isLoading && <Loader />}
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

  // Search
  searchContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  searchBox: {
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  inputWrapper: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "center",
  },
  searchInput: {
    fontSize: 14,
    color: COLORS.gray[900],
    height: 40,
    padding: 0,
  },
  inputWrapper: {
  flex: 1,
  marginLeft: 10,
  position: "relative",
  justifyContent: "center",
},

placeholderContainer: {
  position: "absolute",
  left: 0,
  right: 0,
  flexDirection: "row",
  alignItems: "center",
},

placeholderPrefix: {
  fontSize: 14,
  color: "#9CA3AF",
},

placeholderText: {
  fontSize: 14,
  color: "#4F46E5",
  fontWeight: "600",
},

placeholderSuffix: {
  fontSize: 14,
  color: "#9CA3AF",
},
  clearButton: {
    padding: 4,
  },

  // Filters
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  filterButton: {
    borderRadius: 20,
    overflow: "hidden",
    flex: 1,
  },
  filterGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  filterText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeFilterText: {
    color: "#FFFFFF",
  },
  activeFilter: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  // Cards
  listContent: {
    paddingBottom: 110,
    paddingHorizontal: 16,
  },
  card: {
    marginBottom: 14,
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
  cardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  saveButton: {
    borderRadius: 10,
    overflow: "hidden",
  },
  saveButtonGradient: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.gray[600],
    marginTop: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.gray[400],
    marginTop: 4,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  categoryOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  selectedCategory: {
    backgroundColor: COLORS.primaryLight,
  },
  categoryOptionText: {
    fontSize: 15,
    color: COLORS.gray[700],
  },
  selectedCategoryText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
});