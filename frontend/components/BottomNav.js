import React from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function BottomNav({
  active,
  navigation,
}) {

  return (

    <View style={styles.bottomNav}>

      {/* HOME */}

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("Home")}
      >

        <Ionicons
          name={
            active === "Home"
              ? "home"
              : "home-outline"
          }
          size={22}
          color={
            active === "Home"
              ? "#5B3DF5"
              : "#9CA3AF"
          }
        />

        <Text
          style={
            active === "Home"
              ? styles.activeNavText
              : styles.navText
          }
        >
          Home
        </Text>

      </TouchableOpacity>

      {/* CHAT */}

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("Chat")}
      >

        <Ionicons
          name={
            active === "Chat"
              ? "chatbubble-ellipses"
              : "chatbubble-ellipses-outline"
          }
          size={22}
          color={
            active === "Chat"
              ? "#5B3DF5"
              : "#9CA3AF"
          }
        />

        <Text
          style={
            active === "Chat"
              ? styles.activeNavText
              : styles.navText
          }
        >
          Chat
        </Text>

      </TouchableOpacity>

      {/* RIGHTS */}

     <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("Rights")}
      >

        <Ionicons
          name={
            active === "Rights"
              ? "shield-checkmark"
              : "shield-checkmark-outline"
          }
          size={22}
          color={
            active === "Rights"
              ? "#5B3DF5"
              : "#9CA3AF"
          }
        />

        <Text
          style={
            active === "Rights"
              ? styles.activeNavText
              : styles.navText
          }
        >
          Rights
        </Text>

      </TouchableOpacity>


      {/* HELP */}

<TouchableOpacity
  style={styles.navItem}
  onPress={() =>
    navigation.navigate("EmergencyHelpScreen")
  }
>

  <Ionicons
    name={
      active === "Help"
        ? "warning"
        : "warning-outline"
    }
    size={22}
    color={
      active === "Help"
        ? "#5B3DF5"
        : "#9CA3AF"
    }
  />

  <Text
    style={
      active === "Help"
        ? styles.activeNavText
        : styles.navText
    }
  >
    Help
  </Text>

</TouchableOpacity>

      {/* SCHEMES */}

      <TouchableOpacity
        style={styles.navItem}
        onPress={() =>
          navigation.navigate("Schemes")
        }
      >

        <Ionicons
          name={
            active === "Schemes"
              ? "briefcase"
              : "briefcase-outline"
          }
          size={22}
          color={
            active === "Schemes"
              ? "#5B3DF5"
              : "#9CA3AF"
          }
        />

        <Text
          style={
            active === "Schemes"
              ? styles.activeNavText
              : styles.navText
          }
        >
          Schemes
        </Text>

      </TouchableOpacity>

    </View>

  );
}

const styles = StyleSheet.create({

  bottomNav: {
    position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
    
    height: 88,

    backgroundColor: "#FCFCFF",

    borderTopWidth: 1,
    borderColor: "#F1F5F9",

    flexDirection: "row",

    justifyContent: "space-evenly",

    alignItems: "center",

    paddingBottom: 12,

    paddingTop: 8,


    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,

    elevation: 10,
  },

  navItem: {
    alignItems: "center",
  },

  navText: {
    fontSize: 11,

    color: "#9CA3AF",

    marginTop: 5,

    fontWeight: "500",

    textAlign: "center",
  },

  activeNavText: {
    fontSize: 11,

    color: "#5B3DF5",

    marginTop: 5,

    fontWeight: "700",

    textAlign: "center",
  },

});