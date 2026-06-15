import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DisclaimerScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent={true}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Platform.OS === "android" ? Math.max(insets.top, 8) : 0,
            paddingBottom: Math.max(insets.bottom, 20) + 20,
          }
        ]}
      >
       
        {/* HEADER */}
<View style={styles.header}>
  <TouchableOpacity
    onPress={() => {
      if (route.params?.from === "Language") {
        navigation.navigate("Language");
      } else {
        navigation.goBack();
      }
    }}
  >
    <Ionicons
      name="arrow-back"
      size={24}
      color="#111827"
    />
  </TouchableOpacity>

  <View style={styles.headerCenter}>
    <Text style={styles.headerTitle}>
      Disclaimer
    </Text>
  </View>

  
  
</View>

        {/* SHIELD IMAGE */}
        <View style={styles.shieldContainer}>
          <Image
            source={require("../assets/disclaimer.png")}
            style={styles.shieldImage}
            resizeMode="contain"
          />
        </View>

        {/* MAIN CARD */}
        <View style={styles.mainCard}>
          <Text style={styles.mainText}>
            JANSETU provides simplified
          </Text>
          <Text style={styles.mainText}>
            legal and policy awareness
          </Text>
          <Text style={styles.mainText}>
            information only.
          </Text>

          <View style={styles.spacing} />

          <Text style={styles.boldText}>
            It does not provide professional
          </Text>
          <Text style={styles.boldText}>
            legal advice, consultation or
          </Text>
          <Text style={styles.boldText}>
            representation.
          </Text>
        </View>

        {/* INFO CARD */}
        <View style={styles.smallCard}>
          <Ionicons
            name="information-circle-outline"
            size={22}
            color="#6D28D9"
            style={styles.infoIcon}
          />

          <Text style={styles.smallCardText}>
            Always consult a qualified legal
            professional for specific legal
            matters.
          </Text>
        </View>

        {/* CONTINUE BUTTON */}
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.continueText}>
            I Understand & Continue
          </Text>

          <Ionicons
            name="arrow-forward"
            size={20}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  scrollContent: {
    flexGrow: 1,
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

  shieldContainer: {
    alignItems: "center",
    marginBottom: 20,
  },

  shieldImage: {
    width: 160,
    height: 160,
  },

  mainCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EEF2FF",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },

  mainText: {
    fontSize: 16,
    color: "#312E81",
    lineHeight: 28,
    fontWeight: "600",
  },

  spacing: {
    height: 16,
  },

  boldText: {
    fontSize: 16,
    color: "#1E1B4B",
    fontWeight: "800",
    lineHeight: 28,
  },

  smallCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#EEF2FF",
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },

  infoIcon: {
    marginTop: 2,
  },

  smallCardText: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 26,
    marginLeft: 10,
    flex: 1,
    fontWeight: "500",
  },

  continueButton: {
    width: "90%",
    maxWidth: 400,
    height: 56,
    backgroundColor: "#5B3DF5",
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 10,
    shadowColor: "#5B3DF5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  continueText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    marginRight: 8,
  },
});