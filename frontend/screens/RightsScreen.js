import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  StatusBar,
  Platform,
  Animated,
  TextInput,
  useWindowDimensions,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import BottomNav from "../components/BottomNav";
import Loader from "../components/Loader";

const rightsData = [
  {
    id: "1",
    title: "Women Rights",
    subtitle: "Rights & legal protection for women",
    icon: "female",
    color: "#F3E8FF",
    iconColor: "#9333EA",
  },
  {
    id: "2",
    title: "Labor Rights",
    subtitle: "Rights for employees and workers",
    icon: "briefcase",
    color: "#FEE2E2",
    iconColor: "#DC2626",
  },
  {
    id: "3",
    title: "Consumer Rights",
    subtitle: "Protect yourself as a consumer",
    icon: "card",
    color: "#DBEAFE",
    iconColor: "#2563EB",
  },
  {
    id: "4",
    title: "Cyber Crime",
    subtitle: "Stay safe in digital world",
    icon: "shield-checkmark",
    color: "#E0F2FE",
    iconColor: "#0284C7",
  },
  {
    id: "5",
    title: "Tenant Rights",
    subtitle: "Rights of tenants & renters",
    icon: "home",
    color: "#FEF3C7",
    iconColor: "#D97706",
  },
];

export default function RightsScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchAnimation = useRef(new Animated.Value(0)).current;
  const inputRef = useRef(null);
  const { width } = useWindowDimensions();

  const bannerHeight = Math.min(width * 0.38, 140);
  const bannerTextSize = Math.min(width * 0.042, 17);
  const imageWidth = Math.min(width * 0.42, 160);
  const imageHeight = Math.min(width * 0.48, 180);

  const openSearch = () => {
    setIsSearchOpen(true);
    Animated.timing(searchAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      // Focus the input after animation completes
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    });
  };

  const closeSearch = () => {
    // Dismiss keyboard first
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

  const handleSearch = () => {
  setIsLoading(true);

  setTimeout(() => {
    setIsLoading(false);
  }, 1200);
};

  const searchBarWidth = searchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const searchBarOpacity = searchAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const headerTitleOpacity = searchAnimation.interpolate({
    inputRange: [0, 0.5],
    outputRange: [1, 1],
  });

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
      onPress={() =>
        navigation.navigate("RightsDetail", {
          title: item.title,
          subtitle: item.subtitle,
          icon: item.icon,
          color: item.color,
          iconColor: item.iconColor,
        })
      }
    >
      <View style={styles.leftSection}>
        <View style={[styles.iconBox, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon} size={22} color={item.iconColor} />
        </View>
        <View style={styles.textSection}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#6B7280" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>

          {/* Search Bar Container */}
          <View style={styles.headerCenter}>
            {/* Original Title */}
            {!isSearchOpen && (
              <Animated.Text
                style={[
                  styles.headerTitle,
                  {
                    opacity: searchAnimation.interpolate({
                      inputRange: [0, 0.3, 1],
                      outputRange: [1, 0, 0],
                    }),
                  },
                ]}
              >
                Know Your Rights
              </Animated.Text>
            )}

            {/* Animated Search Bar */}
            {isSearchOpen && (
              <Animated.View
                style={[
                  styles.searchContainer,
                  {
                    width: searchBarWidth,
                    opacity: searchBarOpacity,
                  },
                ]}
              >
                <Ionicons
                  name="search"
                  size={18}
                  color="#9CA3AF"
                  style={styles.searchIcon}
                />
                <TextInput
  ref={inputRef}
  style={styles.searchInput}
  placeholder="Search rights..."
  placeholderTextColor="#9CA3AF"
  value={searchQuery}
  onChangeText={setSearchQuery}
  autoFocus={false}
  returnKeyType="search"
  onSubmitEditing={handleSearch}
/>
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery("")}
                    style={styles.clearButton}
                  >
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                )}
              </Animated.View>
            )}
          </View>

          {/* Search Toggle Button */}
          <TouchableOpacity
            onPress={isSearchOpen ? closeSearch : openSearch}
          >
            <Ionicons
              name={isSearchOpen ? "close" : "search"}
              size={22}
              color="#111827"
            />
          </TouchableOpacity>
        </View>

        {/* TOP CARD */}
        <View
          style={[
            styles.banner,
            {
              height: bannerHeight,
            },
          ]}
        >
          <View style={styles.bannerLeft}>
            <Text style={[styles.bannerText, { fontSize: bannerTextSize }]}>
              Be aware.
            </Text>
            <Text style={[styles.bannerText, { fontSize: bannerTextSize }]}>
              Be empowered.
            </Text>
            <Text style={[styles.bannerText, { fontSize: bannerTextSize }]}>
              Know your rights.
            </Text>
          </View>
          <Image
            source={require("../assets/rights.png")}
            style={[
              styles.bannerImage,
              {
                width: imageWidth,
                height: imageHeight,
              },
            ]}
            resizeMode="contain"
          />
        </View>

        {/* RIGHTS LIST */}
        <FlatList
          data={rightsData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 110 }}
        />

        {/* BOTTOM NAV */}
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
    size: 27,
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
    marginBottom: 26,
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