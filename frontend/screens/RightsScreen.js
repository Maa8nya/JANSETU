import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  StatusBar,
  Animated,
  TextInput,
  useWindowDimensions,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import BottomNav from "../components/BottomNav";
import Loader from "../components/Loader";
import { API_URL } from "../constants/api";

const categoryColors = [
  { color: "#F3E8FF", iconColor: "#9333EA", icon: "female" },
  { color: "#FEE2E2", iconColor: "#DC2626", icon: "briefcase" },
  { color: "#DBEAFE", iconColor: "#2563EB", icon: "card" },
  { color: "#E0F2FE", iconColor: "#0284C7", icon: "shield-checkmark" },
  { color: "#FEF3C7", iconColor: "#D97706", icon: "home" },
];

export default function RightsScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [laws, setLaws] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const searchAnimation = useRef(new Animated.Value(0)).current;
  const inputRef = useRef(null);
  const { width } = useWindowDimensions();

  const bannerHeight = Math.min(width * 0.38, 140);
  const bannerTextSize = Math.min(width * 0.042, 17);
  const imageWidth = Math.min(width * 0.42, 160);
  const imageHeight = Math.min(width * 0.48, 180);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/rights/categories`);
        const data = await response.json();
        // filter out empty or dummy category entries
        const filtered = (data || []).filter(
          (item) => item && item.name && String(item.name).trim().length > 0
        );
        setCategories(filtered);
        if (filtered.length > 0) {
          setSelectedCategory(filtered[0].value);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadLaws = async () => {
      if (!selectedCategory) return;

      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/rights/laws?category=${encodeURIComponent(selectedCategory)}`);
        const data = await response.json();
        // remove dummy/empty laws (missing name or all-empty fields)
        const cleaned = (data || []).filter((l) => {
          const hasName = l && (l.name || l.law_id || l.law_name);
          // also ensure not entirely empty
          const hasContent = (l.summary && String(l.summary).trim().length > 0) ||
            (l.applicable_situations && l.applicable_situations.length > 0) ||
            (l.important_provisions && l.important_provisions.length > 0) ||
            (l.rights && l.rights.length > 0) ||
            (l.actions && l.actions.length > 0);
          return hasName && hasContent;
        });
        setLaws(cleaned);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLaws();
  }, [selectedCategory]);

  const openSearch = () => {
    setIsSearchOpen(true);
    Animated.timing(searchAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setTimeout(() => inputRef.current?.focus(), 100);
    });
  };

  const closeSearch = () => {
    inputRef.current?.blur();
    setSearchQuery("");
    Animated.timing(searchAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setIsSearchOpen(false);
    });
  };

  const filteredCategories = categories.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLaws = laws.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.summary || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const searchBarWidth = searchAnimation.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });
  const searchBarOpacity = searchAnimation.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });

  const renderCategoryItem = ({ item, index }) => {
    const style = categoryColors[index % categoryColors.length];
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.card}
        onPress={() => setSelectedCategory(item.value)}
      >
        <View style={styles.leftSection}>
          <View style={[styles.iconBox, { backgroundColor: style.color }] }>
            <Ionicons name={style.icon} size={22} color={style.iconColor} />
          </View>
          <View style={styles.textSection}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>Tap to view related laws</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6B7280" />
      </TouchableOpacity>
    );
  };

  const renderLawItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
      onPress={() => navigation.navigate("RightsDetail", {
        title: item.name,
        subtitle: selectedCategory,
        icon: "document-text",
        color: "#EEF2FF",
        iconColor: "#4F46E5",
        lawId: item.law_id,
      })}
    >
      <View style={styles.leftSection}>
        <View style={[styles.iconBox, { backgroundColor: "#EEF2FF" }] }>
          <Ionicons name="document-text" size={22} color="#4F46E5" />
        </View>
        <View style={styles.textSection}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>{item.summary}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#6B7280" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            {!isSearchOpen && (
              <Animated.Text style={[styles.headerTitle, { opacity: searchAnimation.interpolate({ inputRange: [0, 0.3, 1], outputRange: [1, 0, 0] }) }]}>Know Your Rights</Animated.Text>
            )}

            {isSearchOpen && (
              <Animated.View style={[styles.searchContainer, { width: searchBarWidth, opacity: searchBarOpacity }] }>
                <Ionicons name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
                <TextInput
                  ref={inputRef}
                  style={styles.searchInput}
                  placeholder="Search rights..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus={false}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
                    <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </Animated.View>
            )}
          </View>

          <TouchableOpacity onPress={isSearchOpen ? closeSearch : openSearch}>
            <Ionicons name={isSearchOpen ? "close" : "search"} size={22} color="#111827" />
          </TouchableOpacity>
        </View>

        <View style={[styles.banner, { height: bannerHeight }] }>
          <View style={styles.bannerLeft}>
            <Text style={[styles.bannerText, { fontSize: bannerTextSize }]}>Be aware.</Text>
            <Text style={[styles.bannerText, { fontSize: bannerTextSize }]}>Be empowered.</Text>
            <Text style={[styles.bannerText, { fontSize: bannerTextSize }]}>Know your rights.</Text>
          </View>
          <Image source={require("../assets/rights.png")} style={[styles.bannerImage, { width: imageWidth, height: imageHeight }] } resizeMode="contain" />
        </View>

        <Text style={styles.sectionLabel}>Legal categories</Text>
        <FlatList
          data={filteredCategories}
          keyExtractor={(item) => item.value}
          renderItem={renderCategoryItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />

        {selectedCategory && (
          <>
            <Text style={styles.sectionLabel}>Laws in {selectedCategory}</Text>
            <FlatList
              data={filteredLaws}
              keyExtractor={(item) => item.law_id || item.id}
              renderItem={renderLawItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 110 }}
            />
          </>
        )}

        <BottomNav active="Rights" navigation={navigation} />
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 40,
  },
  searchIcon: {
    marginRight: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    padding: 0,
  },
  clearButton: {
    marginLeft: 18,
    padding: 2,
  },
  banner: {
    marginHorizontal: 16,
    backgroundColor: "#EDE9FE",
    borderRadius: 20,
    paddingLeft: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  bannerLeft: {
    flex: 1,
  },
  bannerText: {
    fontWeight: "700",
    color: "#1F2937",
    lineHeight: 30,
  },
  bannerImage: {
    marginRight: 9,
  },
  sectionLabel: {
    marginHorizontal: 16,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginBottom: 14,
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
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  textSection: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
});
