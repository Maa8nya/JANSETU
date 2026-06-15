import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Rights information data
const rightsContent = {
  "Women Rights": {
    description:
      "Women have equal rights under the law. This includes protection against discrimination, harassment, and violence in all spheres of life.",
    keyPoints: [
      "Equal pay for equal work",
      "Protection against workplace harassment",
      "Maternity benefits and leave",
      "Right to file complaints against discrimination",
      "Domestic violence protection laws",
      "Right to education and employment",
    ],
    helpline: "Women Helpline: 1091",
    laws: [
      "The Equal Remuneration Act, 1976",
      "The Maternity Benefit Act, 1961",
      "The Sexual Harassment of Women at Workplace Act, 2013",
      "The Protection of Women from Domestic Violence Act, 2005",
    ],
  },
  "Labor Rights": {
    description:
      "Workers have fundamental rights to fair wages, safe working conditions, and the right to organize and bargain collectively.",
    keyPoints: [
      "Minimum wage protection",
      "Safe working conditions",
      "Right to form unions",
      "Overtime pay regulations",
      "Child labor prohibition",
      "Work hours regulation",
    ],
    helpline: "Labor Helpline: 1800-11-2525",
    laws: [
      "The Minimum Wages Act, 1948",
      "The Factories Act, 1948",
      "The Industrial Disputes Act, 1947",
      "The Employees' Provident Fund Act, 1952",
    ],
  },
  "Consumer Rights": {
    description:
      "Consumers are protected against unfair trade practices and have the right to information about products and services.",
    keyPoints: [
      "Right to safety from hazardous goods",
      "Right to be informed about quality and price",
      "Right to choose from variety of products",
      "Right to be heard in consumer courts",
      "Right to seek redressal against unfair practices",
      "Right to consumer education",
    ],
    helpline: "Consumer Helpline: 1800-11-4000",
    laws: [
      "The Consumer Protection Act, 2019",
      "The Food Safety and Standards Act, 2006",
      "The Legal Metrology Act, 2009",
    ],
  },
  "Cyber Crime": {
    description:
      "Protection against online fraud, identity theft, and other cyber crimes is essential in today's digital age.",
    keyPoints: [
      "Protection against identity theft",
      "Safeguards against online fraud",
      "Social media privacy rights",
      "Reporting cyber stalking and bullying",
      "Data protection and privacy",
      "Online financial transaction safety",
    ],
    helpline: "Cyber Crime Helpline: 1930",
    laws: [
      "The Information Technology Act, 2000",
      "The Indian Penal Code (for cyber crimes)",
      "Data Protection regulations",
    ],
  },
  "Tenant Rights": {
    description:
      "Tenants have specific legal protections regarding rent, eviction, and living conditions in rented properties.",
    keyPoints: [
      "Protection against unfair eviction",
      "Right to essential services (water, electricity)",
      "Fair rent regulations",
      "Maintenance and repairs by landlord",
      "Privacy rights in rented property",
      "Security deposit protection",
    ],
    helpline: "Local Rent Control Office",
    laws: [
      "The Rent Control Act (State-specific)",
      "The Transfer of Property Act, 1882",
      "State-specific tenancy laws",
    ],
  },
};

export default function RightsDetailScreen({ navigation, route }) {
  const { title, subtitle, icon, color, iconColor } = route.params;
  const content = rightsContent[title] || rightsContent["Women Rights"];

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 40,
          }}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Rights Details</Text>
            <View style={styles.headerIcon} />
          </View>

          {/* TOP CARD */}
          <View style={styles.topCard}>
            <View
              style={[
                styles.iconBox,
                {
                  backgroundColor: color,
                },
              ]}
            >
              <Ionicons name={icon} size={34} color={iconColor} />
            </View>
            <View style={styles.topText}>
              <Text style={styles.rightTitle}>{title}</Text>
              <Text style={styles.rightSubtitle}>{subtitle}</Text>
            </View>
          </View>

          {/* ABOUT */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText}>{content.description}</Text>
          </View>

          {/* KEY RIGHTS & PROTECTIONS */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              Key Rights & Protections
            </Text>
            {content.keyPoints.map((item, index) => (
              <View key={index} style={styles.eligibilityRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#16A34A"
                />
                <Text style={styles.eligibilityText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* RELEVANT LAWS */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Relevant Laws</Text>
            {content.laws.map((item, index) => (
              <View key={index} style={styles.eligibilityRow}>
                <Ionicons
                  name="document-text"
                  size={20}
                  color={iconColor}
                />
                <Text style={styles.eligibilityText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* HELPLINE CARD */}
          <View style={[styles.helplineCard, { backgroundColor: color }]}>
            <Ionicons name="call" size={24} color={iconColor} />
            <View style={styles.helplineTextContainer}>
              <Text style={styles.helplineLabel}>Emergency Helpline</Text>
              <Text style={styles.helplineNumber}>
                {content.helpline}
              </Text>
            </View>
          </View>

          {/* BUTTON */}
          <TouchableOpacity activeOpacity={0.9} style={styles.button}>
            <Text style={styles.buttonText}>Learn More</Text>
          </TouchableOpacity>
        </ScrollView>
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
  topCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#EEF2F7",
    marginBottom: 18,
  },
  iconBox: {
    width: 74,
    height: 74,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  topText: {
    flex: 1,
    justifyContent: "center",
  },
  rightTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  rightSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#EEF2F7",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 28,
  },
  eligibilityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  eligibilityText: {
    marginLeft: 12,
    fontSize: 15,
    color: "#374151",
  },
  helplineCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 18,
    padding: 18,
    borderRadius: 22,
  },
  helplineTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  helplineLabel: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 4,
  },
  helplineNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  button: {
    height: 58,
    marginHorizontal: 16,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4F46E5",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});