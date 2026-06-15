import React, { useState, useRef } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  StatusBar,
  Image,
  Linking,
  Animated,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import BottomNav from "../components/BottomNav";

const helplines = [
  {
    id: "1",
    title: "Police",
    number: "100",
    icon: "shield-checkmark",
  },
  {
    id: "2",
    title: "Ambulance",
    number: "108",
    icon: "medkit",
  },
  {
    id: "3",
    title: "Women Helpline",
    number: "1091",
    icon: "female",
  },
  {
    id: "4",
    title: "Cyber Crime Helpline",
    number: "1930",
    icon: "globe",
  },
  {
    id: "5",
    title: "Child Helpline",
    number: "1098",
    icon: "happy",
  },
  {
    id: "6",
    title: "Disaster Management",
    number: "1078",
    icon: "warning",
  },
];

export default function EmergencyHelpScreen({ navigation }) {
  // Banner animation
  const bannerAnimation = useRef(new Animated.Value(1)).current;
  const scrollOffset = useRef(0);
  const isBannerVisible = useRef(true);

  const makeCall = (number) => {
    Linking.openURL(`tel:${number}`);
  };

  const handleScroll = (event) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    
    // Scrolling down
    if (currentOffset > scrollOffset.current && currentOffset > 50) {
      if (isBannerVisible.current) {
        isBannerVisible.current = false;
        Animated.timing(bannerAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    }
    // Scrolling up
    else if (currentOffset < scrollOffset.current) {
      if (!isBannerVisible.current) {
        isBannerVisible.current = true;
        Animated.timing(bannerAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    }
    
    scrollOffset.current = currentOffset;
  };

  const bannerAnimatedStyle = {
    height: bannerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 128],
    }),
    opacity: bannerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    marginBottom: bannerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 30],
    }),
    transform: [
      {
        scale: bannerAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.95, 1],
        }),
      },
    ],
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
      onPress={() => makeCall(item.number)}
    >
      <View style={styles.leftSection}>
        <View style={styles.iconBox}>
          <Ionicons name={item.icon} size={20} color="#5B3DF5" />
        </View>

        <View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.number}>{item.number}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.callButton}
        onPress={() => makeCall(item.number)}
      >
        <Ionicons name="call" size={18} color="#5B3DF5" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
        translucent={false}
      />

      <SafeAreaView style={styles.safeAreaTop} edges={["top"]}>
        {/* FIXED HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Emergency Help</Text>
          </View>

          {/* Empty View for perfect center alignment */}
          <View style={{ width: 24 }} />
        </View>

        {/* SCROLLABLE CONTENT */}
        <FlatList
          data={helplines}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingBottom: 10,
          }}
          ListHeaderComponent={
            <>
              {/* ANIMATED SOS CARD */}
              <Animated.View style={[styles.sosCard, bannerAnimatedStyle]}>
                <View>
                  <Text style={styles.sosTitle}>In an Emergency?</Text>
                  <Text style={styles.sosSubtitle}>
                    We are here to help you.
                  </Text>
                </View>

                <Image
                  source={require("../assets/sos.png")}
                  style={styles.sosImage}
                  resizeMode="contain"
                />
              </Animated.View>

              {/* QUICK CALL */}
              <Text style={styles.quickCall}>Quick Call</Text>
            </>
          }
          ListFooterComponent={
            /* INFO BOX */
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                These are official helplines.
              </Text>

              <Text style={styles.infoText}>
                Use them in genuine emergencies only.
              </Text>
            </View>
          }
        />

        {/* BOTTOM NAV */}
        <BottomNav active="Help" navigation={navigation} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  safeAreaTop: {
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
    backgroundColor: "#FFFFFF",
    zIndex: 10,
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

  sosCard: {
    marginHorizontal: 16,
    borderRadius: 22,
    backgroundColor: "#F9E4E2",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
  },

  sosTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#000000",
    marginBottom: 6,
  },

  sosSubtitle: {
    fontSize: 16,
    color: "#4A5D73",
    fontWeight: "500",
  },

  sosImage: {
    width: 86,
    height: 86,
  },

  quickCall: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 18,
    marginLeft: 16,
  },

  card: {
    backgroundColor: "#F8F8FC",
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 14,
    marginBottom: 14,
    marginHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#EEE9FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 3,
  },

  number: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },

  callButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#EEE9FF",
    justifyContent: "center",
    alignItems: "center",
  },

  infoBox: {
    backgroundColor: "#EEF0FF",
    marginHorizontal: 16,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 99,
  },

  infoText: {
    color: "#4F46E5",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 24,
  },
});