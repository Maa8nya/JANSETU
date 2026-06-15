import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  StatusBar,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  Ionicons,
  MaterialIcons,
  Feather,
  FontAwesome5,
} from "@expo/vector-icons";
import Loader from "../components/Loader";

const lawsData = [
  {
    id: "1",
    title: "Indian Penal Code, 1860",
    subtitle: "Defines offences and punishments.",
    tag: "Criminal Law",
    category: "Criminal",
    icon: "gavel",
    iconColor: "#7C4DFF",
    bg: "#F3EEFF",
  },
  {
    id: "2",
    title: "Constitution of India",
    subtitle: "Guarantees fundamental rights.",
    tag: "Constitution",
    category: "Constitution",
    icon: "balance-scale",
    iconColor: "#16A34A",
    bg: "#E9F9EE",
  },
  {
    id: "3",
    title: "Civil Procedure Code",
    subtitle: "Rules for civil court cases.",
    tag: "Civil Law",
    category: "Civil",
    icon: "file-alt",
    iconColor: "#2563EB",
    bg: "#EEF4FF",
  },
  {
    id: "4",
    title: "Payment of Wages Act",
    subtitle: "Ensures timely wage payment.",
    tag: "Labour Law",
    category: "Labour",
    icon: "briefcase",
    iconColor: "#D97706",
    bg: "#FFF7E8",
  },
  {
    id: "5",
    title: "RTI Act, 2005",
    subtitle: "Provides information access rights.",
    tag: "Civil Rights",
    category: "Civil",
    icon: "users",
    iconColor: "#059669",
    bg: "#ECFDF5",
  },
];

const filters = [
  { label: "All", value: "All" },
  { label: "Constitution", value: "Constitution" },
  { label: "Criminal", value: "Criminal" },
  { label: "Civil", value: "Civil" },
  { label: "Labour", value: "Labour" },
];

export default function PopularLawsScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedLaws, setSavedLaws] = useState([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = () => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
    }, 1200);
  };

  // Toggle save/unsave a law
  const toggleSave = (lawId) => {
    setSavedLaws((prev) => {
      if (prev.includes(lawId)) {
        return prev.filter((id) => id !== lawId);
      } else {
        return [...prev, lawId];
      }
    });
  };

  // Filter and search logic
  const filteredLaws = useMemo(() => {
    let result = lawsData;

    // Apply category filter
    if (activeFilter !== "All") {
      result = result.filter((law) => law.category === activeFilter);
    }

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (law) =>
          law.title.toLowerCase().includes(query) ||
          law.subtitle.toLowerCase().includes(query) ||
          law.tag.toLowerCase().includes(query)
      );
    }

    // Apply saved filter
    if (showSavedOnly) {
      result = result.filter((law) => savedLaws.includes(law.id));
    }

    return result;
  }, [activeFilter, searchQuery, savedLaws, showSavedOnly]);

  const renderLaw = ({ item }) => {
    const isSaved = savedLaws.includes(item.id);

    return (
      <TouchableOpacity activeOpacity={0.85} style={styles.card}>
        <View style={styles.cardLeft}>
          <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
            <FontAwesome5 name={item.icon} size={22} color={item.iconColor} />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.lawTitle}>{item.title}</Text>
            <Text style={styles.lawSubtitle}>{item.subtitle}</Text>

            <View style={styles.tagBox}>
              <Text style={[styles.tagText, { color: item.iconColor }]}>
                {item.tag}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardRight}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => toggleSave(item.id)}
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

  // Empty state component
  const EmptyList = () => (
    <View style={styles.emptyContainer}>
      <Feather name="book-open" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No laws found</Text>
      <Text style={styles.emptySubtitle}>
        {showSavedOnly
          ? "You haven't saved any laws yet"
          : "Try adjusting your search or filter"}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Popular Laws</Text>

          <TouchableOpacity
            style={[
              styles.headerIcon,
              showSavedOnly && styles.savedHeaderActive,
            ]}
            onPress={() => setShowSavedOnly(!showSavedOnly)}
          >
            <Ionicons
              name={showSavedOnly ? "bookmark" : "bookmark-outline"}
              size={24}
              color={showSavedOnly ? "#4F46E5" : "#111827"}
            />
          </TouchableOpacity>
        </View>

        {/* SEARCH */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
  placeholder="Search laws..."
  placeholderTextColor="#9CA3AF"
  style={styles.searchInput}
  value={searchQuery}
  onChangeText={setSearchQuery}
  returnKeyType="search"
  onSubmitEditing={handleSearch}
/>
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* SAVED BADGE */}
        {showSavedOnly && (
          <View style={styles.savedBadge}>
            <Ionicons name="bookmark" size={16} color="#FFFFFF" />
            <Text style={styles.savedBadgeText}>
              Showing saved laws ({savedLaws.length})
            </Text>
            <TouchableOpacity onPress={() => setShowSavedOnly(false)}>
              <Ionicons name="close" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* FILTERS */}
        <View style={styles.filterRow}>
          <FlatList
            horizontal
            data={filters}
            keyExtractor={(item) => item.value}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  activeFilter === item.value && styles.activeFilter,
                ]}
                onPress={() => setActiveFilter(item.value)}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === item.value && styles.activeFilterText,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* LIST */}
        <FlatList
          data={filteredLaws}
          keyExtractor={(item) => item.id}
          renderItem={renderLaw}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContainer,
            filteredLaws.length === 0 && styles.emptyListContainer,
          ]}
          ListEmptyComponent={EmptyList}
        />
      </SafeAreaView>
      {isLoading && <Loader />}
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
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  savedHeaderActive: {
    backgroundColor: "#EEF2FF",
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
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    fontSize: 14,
    color: "#111827",
  },
  savedBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#4F46E5",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    marginHorizontal: 16,
    gap: 8,
  },
  savedBadgeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  filterRow: {
    marginBottom: 22,
  },
  filterButton: {
    paddingHorizontal: 18,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
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
  listContainer: {
    paddingBottom: 30,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
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
  lawTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  lawSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 10,
  },
  tagBox: {
    alignSelf: "flex-start",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "700",
  },
  cardRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  saveButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
  },
});