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
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import BottomNav from "../components/BottomNav";
import Loader from "../components/Loader";


const schemesData = [
  {
    id: "1",
    title: "PM Awas Yojana (Urban)",
    subtitle: "Housing for all urban citizens",
    tag: "Housing",
    category: "Central",
    icon: "business",
    iconColor: "#2563EB",
    bg: "#DBEAFE",
  },
  {
    id: "2",
    title: "Pradhan Mantri Scholarship",
    subtitle: "Scheme for students",
    tag: "Education",
    category: "Central",
    icon: "school",
    iconColor: "#4F46E5",
    bg: "#EDE9FE",
  },
  {
    id: "3",
    title: "Ayushman Bharat Yojana",
    subtitle: "Health insurance scheme",
    tag: "Health",
    category: "Central",
    icon: "leaf",
    iconColor: "#16A34A",
    bg: "#DCFCE7",
  },
  {
    id: "4",
    title: "PM Kisan Samman Nidhi",
    subtitle: "Income support to farmers",
    tag: "Agriculture",
    category: "Central",
    icon: "home",
    iconColor: "#F59E0B",
    bg: "#FEF3C7",
  },
  {
    id: "5",
    title: "Rythu Bandhu Scheme",
    subtitle: "Investment support to farmers",
    tag: "Agriculture",
    category: "State",
    icon: "leaf",
    iconColor: "#16A34A",
    bg: "#DCFCE7",
  },
  {
    id: "6",
    title: "KCR Kit Scheme",
    subtitle: "Maternal and child health",
    tag: "Health",
    category: "State",
    icon: "heart",
    iconColor: "#DC2626",
    bg: "#FEE2E2",
  },
  {
    id: "7",
    title: "SC Scholarship Scheme",
    subtitle: "Education support for SC students",
    tag: "Education",
    category: "State",
    icon: "school",
    iconColor: "#4F46E5",
    bg: "#EDE9FE",
  },
  {
    id: "8",
    title: "2BHK Housing Scheme",
    subtitle: "Free housing for poor families",
    tag: "Housing",
    category: "State",
    icon: "business",
    iconColor: "#2563EB",
    bg: "#DBEAFE",
  },
];

const filters = [
  { label: "All", value: "All" },
  { label: "Central", value: "Central" },
  { label: "State", value: "State" },
  { label: "Category", value: "Category" },
];

const categories = [
  "All Categories",
  "Housing",
  "Education",
  "Health",
  "Agriculture",
];

// Rolling placeholder texts
const placeholderTexts = [
  "Search schemes...",
  "Housing schemes...",
  "Education schemes...",
  "Health schemes...",
  "Agriculture schemes...",
  "Central schemes...",
  "State schemes...",
];

// Configuration variables for animation timing
const INITIAL_DELAY = 5000; // 5 seconds before animation starts
const INTERVAL_DURATION = 3000; // 3 seconds between each change
const ANIMATION_DURATION = 300; // 300ms for fade/slide animation

export default function SchemesScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [savedSchemeIds, setSavedSchemeIds] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
  
  // Animation for rolling placeholder
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Load saved schemes when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadSavedSchemes();
    }, [])
  );

  useEffect(() => {
    // Set initial delay before starting the rolling animation
    const initialTimeout = setTimeout(() => {
      // Start the interval after initial delay
      const interval = setInterval(() => {
        // Animate out
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
          // Change text
          setCurrentPlaceholderIndex((prev) => 
            prev === placeholderTexts.length - 1 ? 0 : prev + 1
          );
          
          // Reset position for animation in
          slideAnim.setValue(20);
          
          // Animate in
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

  // Filter schemes based on active filter and category
  const getFilteredSchemes = () => {
    let filtered = schemesData;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (scheme) =>
          scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          scheme.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          scheme.tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (activeFilter === "Category" && selectedCategory !== "All Categories") {
      filtered = filtered.filter(
        (scheme) => scheme.tag === selectedCategory
      );
    } else if (activeFilter === "Central") {
      filtered = filtered.filter(
        (scheme) => scheme.category === "Central"
      );
    } else if (activeFilter === "State") {
      filtered = filtered.filter(
        (scheme) => scheme.category === "State"
      );
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

  const renderScheme = ({ item }) => {
    const isSaved = savedSchemeIds.includes(item.id);
    
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.card}
        onPress={() => {
          // Navigate to scheme details
          navigation.navigate("SchemeDetails", { scheme: item });
        }}
      >
        <View style={styles.cardLeft}>
          <View
            style={[
              styles.iconBox,
              {
                backgroundColor: item.bg,
              },
            ]}
          >
            <Ionicons
              name={item.icon}
              size={24}
              color={item.iconColor}
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.schemeTitle}>
              {item.title}
            </Text>

            <Text style={styles.schemeSubtitle}>
              {item.subtitle}
            </Text>

            <View style={styles.tagRow}>
              <View style={styles.tagBox}>
                <Text style={styles.tagText}>
                  {item.tag}
                </Text>
              </View>
              
              <View style={[styles.tagBox, styles.categoryTag]}>
                <Text style={[styles.tagText, styles.categoryTagText]}>
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
            <Ionicons
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={22}
              color={isSaved ? "#4F46E5" : "#6B7280"}
            />
          </TouchableOpacity>
          
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#6B7280"
            style={{ marginLeft: 8 }}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const handleSearch = () => {
  setIsLoading(true);

  setTimeout(() => {
    setIsLoading(false);
  }, 1200);
};

  const filteredSchemes = getFilteredSchemes();

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
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
            Government Schemes
          </Text>

          {/* SAVED ICON */}
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => navigation.navigate("SavedSchemes")}
          >
            <Ionicons
              name="bookmark-outline"
              size={24}
              color="#111827"
            />
          </TouchableOpacity>
        </View>

        {/* SEARCH WITH ANIMATED PLACEHOLDER */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons
              name="search"
              size={20}
              color="#9CA3AF"
            />

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
                    {placeholderTexts[currentPlaceholderIndex].replace("Search ", "").replace("schemes...", "").trim()}
                  </Text>
                  <Text style={styles.placeholderSuffix}>
                    {" "}schemes...
                  </Text>
                </Animated.View>
              )}
            </View>

            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearButton}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* FILTERS */}
        <View style={styles.filterRow}>
          {filters.map((item) => (
            <TouchableOpacity
              key={item.value}
              onPress={() => handleFilterPress(item.value)}
              style={[
                styles.filterButton,
                activeFilter === item.value &&
                  styles.activeFilter,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === item.value &&
                    styles.activeFilterText,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* LIST */}
        <FlatList
          data={filteredSchemes}
          keyExtractor={(item) => item.id}
          renderItem={renderScheme}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 110,
          }}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Ionicons
                name="search-outline"
                size={48}
                color="#D1D5DB"
              />
              <Text style={styles.emptyStateText}>
                No schemes found
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your search or filters
              </Text>
            </View>
          )}
        />

        {/* CATEGORY MODAL */}
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
              <Text style={styles.modalTitle}>
                Select Category
              </Text>
              
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryOption,
                    selectedCategory === category && styles.selectedCategory,
                  ]}
                  onPress={() => handleCategorySelect(category)}
                >
                  <Text
                    style={[
                      styles.categoryOptionText,
                      selectedCategory === category && styles.selectedCategoryText,
                    ]}
                  >
                    {category}
                  </Text>
                  
                  {selectedCategory === category && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#4F46E5"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* BOTTOM NAV */}
        <BottomNav
          active="Schemes"
          navigation={navigation}
        />

{isLoading && <Loader />}

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 0,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18,
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

  searchContainer: {
    marginHorizontal: 16,
    marginBottom: 18,
  },

  searchBox: {
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  inputWrapper: {
    flex: 1,
    marginLeft: 10,
    position: "relative",
    justifyContent: "center",
  },

  searchInput: {
    fontSize: 14,
    color: "#111827",
    height: 40,
    zIndex: 2,
  },

  placeholderContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
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

  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 22,
  },

  filterButton: {
    paddingHorizontal: 18,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  activeFilter: {
    backgroundColor: "#4F46E5",
  },

  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },

  activeFilterText: {
    color: "#FFFFFF",
  },

  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 14,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },

  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  textContainer: {
    flex: 1,
  },

  schemeTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },

  schemeSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 10,
  },

  tagRow: {
    flexDirection: "row",
    gap: 8,
  },

  tagBox: {
    alignSelf: "flex-start",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  categoryTag: {
    backgroundColor: "#F3E8FF",
  },

  tagText: {
    fontSize: 11,
    color: "#4F46E5",
    fontWeight: "700",
  },

  categoryTagText: {
    color: "#7C3AED",
  },

  cardRight: {
    flexDirection: "row",
    alignItems: "center",
  },

  saveButton: {
    padding: 4,
  },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },

  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 16,
  },

  emptyStateSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "85%",
    maxWidth: 400,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
  },

  categoryOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },

  selectedCategory: {
    backgroundColor: "#EEF2FF",
  },

  categoryOptionText: {
    fontSize: 16,
    color: "#374151",
  },

  selectedCategoryText: {
    color: "#4F46E5",
    fontWeight: "600",
  },
});