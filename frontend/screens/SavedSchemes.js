import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

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
    try {
      const updatedSchemes = savedSchemes.filter(scheme => scheme.id !== schemeId);
      await AsyncStorage.setItem('savedSchemes', JSON.stringify(updatedSchemes));
      setSavedSchemes(updatedSchemes);
    } catch (error) {
      console.log('Error removing scheme:', error);
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
      <View style={styles.cardLeft}>
        <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
          <Ionicons name={item.icon} size={24} color={item.iconColor} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.schemeTitle}>{item.title}</Text>
          <Text style={styles.schemeSubtitle}>{item.subtitle}</Text>

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
      >
        <Ionicons name="bookmark" size={24} color="#4F46E5" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Saved Schemes</Text>

          <View style={styles.headerIcon} />
        </View>

        <FlatList
          data={savedSchemes}
          keyExtractor={(item) => item.id}
          renderItem={renderSavedScheme}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ 
            paddingBottom: 30,
            flexGrow: 1 
          }}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Ionicons name="bookmark-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>No saved schemes</Text>
              <Text style={styles.emptyStateSubtext}>
                Tap the bookmark icon on any scheme to save it here
              </Text>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.browseButtonText}>Browse Schemes</Text>
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
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
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
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 14,
    marginTop: 16,
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
  removeButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
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
    marginBottom: 24,
    textAlign: "center",
  },
  browseButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});