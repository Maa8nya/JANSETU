import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  FlatList,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import BottomNav from "../components/BottomNav";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Loader from "../components/Loader";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [selectedLanguage, setSelectedLanguage] = React.useState("English");
  const [profileVisible, setProfileVisible] = React.useState(false);
  const [notificationsVisible, setNotificationsVisible] = React.useState(false);
  const [isLoading, setIsLoading] = useState(false);
const [searchQuery, setSearchQuery] = useState("");
  
  // Sidebar slide animation
  const sidebarTranslateX = useRef(new Animated.Value(-SCREEN_WIDTH * 0.85)).current;
  const sidebarOpacity = useRef(new Animated.Value(0)).current;
  
  // Profile subsections
  const [currentProfileSection, setCurrentProfileSection] = React.useState("main");
  
  // Edit Profile states
  const [userName, setUserName] = React.useState("John Doe");
  const [userEmail, setUserEmail] = React.useState("john.doe@email.com");
  const [userPhone, setUserPhone] = React.useState("+91 98765 43210");
  const [userLocation, setUserLocation] = React.useState("Mumbai, Maharashtra");
  
  // Change Password states
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  // Help & Support expanded states
  const [expandedFAQ, setExpandedFAQ] = React.useState(null);

  // Notifications state
  const [notifications, setNotifications] = React.useState([
    {
      id: 1,
      title: "New Law Amendment",
      message: "IPC Section 304B has been updated with new provisions.",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      title: "Scheme Update",
      message: "New housing scheme launched by the government.",
      time: "5 hours ago",
      read: false,
    },
    {
      id: 3,
      title: "Legal Tip",
      message: "Know your rights during a traffic stop.",
      time: "1 day ago",
      read: true,
    },
  ]);

  // Open sidebar with animation
  const openSidebar = () => {
    setMenuVisible(true);
    Animated.parallel([
      Animated.spring(sidebarTranslateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(sidebarOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Close sidebar with animation
  const closeSidebar = () => {
    Animated.parallel([
      Animated.timing(sidebarTranslateX, {
        toValue: -SCREEN_WIDTH * 0.85,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(sidebarOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setMenuVisible(false);
    });
  };

  const hasUnreadNotifications = notifications.some(notif => !notif.read);

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const clearAllNotifications = () => {
    Alert.alert(
      "Clear Notifications",
      "Are you sure you want to clear all notifications?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear All", 
          style: "destructive",
          onPress: () => setNotifications([])
        }
      ]
    );
  };

  // Listen for language changes
  React.useEffect(() => {
    if (route.params?.selectedLanguage) {
      setSelectedLanguage(route.params.selectedLanguage);
    }
  }, [route.params?.selectedLanguage]);

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "J";
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout? Your chat history will be saved.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.setItem("@jansetu_fresh_start", "true");
              await AsyncStorage.removeItem("@jansetu_current_chat");
              setProfileVisible(false);
              setCurrentProfileSection("main");
              navigation.reset({
                index: 0,
                routes: [{ name: 'Splash' }],
              });
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          }
        }
      ]
    );
  };

  const handleSearch = () => {
  setIsLoading(true);

  setTimeout(() => {
    setIsLoading(false);
  }, 1200);
};

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    Alert.alert("Success", "Password changed successfully!", [
      {
        text: "OK",
        onPress: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setCurrentProfileSection("settings");
        }
      }
    ]);
  };

  const faqData = [
    {
      id: 1,
      question: "How to search for laws?",
      answer: "You can search for laws by using the search bar on the home screen. Type keywords related to the law you're looking for, such as 'IPC 302' or 'divorce procedure'. Our AI-powered search will show you relevant results from our comprehensive database of Indian laws and legal provisions."
    },
    {
      id: 2,
      question: "Understanding legal terms",
      answer: "Our platform includes a built-in legal dictionary that explains complex legal terms in simple language. When you encounter any legal terminology, you can tap on it to see its definition. We've simplified over 1000+ legal terms for easy understanding."
    },
    {
      id: 3,
      question: "Privacy & Data Security",
      answer: "We take your privacy seriously. All your data is encrypted using industry-standard encryption. We never share your personal information with third parties. Your search history and queries are stored securely and you can delete them anytime from settings."
    },
    {
      id: 4,
      question: "Emergency Support",
      answer: "For immediate legal emergencies, you can access our Emergency Help section from the home screen. This provides quick access to helpline numbers, nearest police stations, hospitals, and legal aid services. In case of life-threatening emergencies, always call 112 (India's emergency number) first."
    },
    {
      id: 5,
      question: "How accurate is the AI chatbot?",
      answer: "Our AI chatbot JANSETU is trained on verified Indian legal databases and is regularly updated with the latest judgments and amendments. While it provides accurate information, it should not be considered as legal advice. For critical legal matters, we recommend consulting a qualified lawyer."
    },
  ];

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification
      ]}
      onPress={() => markAsRead(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationDot}>
        {!item.read && <View style={styles.unreadDot} />}
      </View>
      
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.notificationTime}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderNotificationsModal = () => (
    <Modal
      visible={notificationsVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setNotificationsVisible(false)}
    >
      <TouchableOpacity
        style={styles.notificationOverlay}
        activeOpacity={1}
        onPress={() => setNotificationsVisible(false)}
      >
        <View style={[styles.notificationModal, { paddingBottom: Math.max(insets.bottom, 20) + 20 }]}>
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.notificationModalHeader}>
              <Text style={styles.notificationModalTitle}>Notifications</Text>
              <TouchableOpacity 
                onPress={() => setNotificationsVisible(false)}
              >
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            {notifications.length > 0 && (
              <View style={styles.notificationActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={markAllAsRead}
                >
                  <Text style={styles.actionButtonText}>Mark All Read</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={clearAllNotifications}
                >
                  <Text style={[styles.actionButtonText, { color: "#EF4444" }]}>Clear All</Text>
                </TouchableOpacity>
              </View>
            )}

            {notifications.length > 0 ? (
              <FlatList
                data={notifications}
                renderItem={renderNotificationItem}
                keyExtractor={item => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.notificationList}
              />
            ) : (
              <View style={styles.emptyNotifications}>
                <Ionicons name="notifications-off-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>No Notifications</Text>
                <Text style={styles.emptySubtitle}>
                  You're all caught up!
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderProfileContent = () => {
    switch(currentProfileSection) {
      case "edit":
        return (
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.profileSection}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
          >
            
            <ScrollView 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setCurrentProfileSection("main")}
              >
                <Ionicons name="arrow-back" size={24} color="#111827" />
                <Text style={styles.backText}>Edit Profile</Text>
              </TouchableOpacity>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Full Name</Text>
                 <TextInput
    style={styles.formInput}
    value={userName}
    onChangeText={setUserName}
    placeholder="Enter your full name"
    placeholderTextColor="#9CA3AF"
  />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email Address</Text>
                <TextInput
                  style={styles.formInput}
                  value={userEmail}
                  onChangeText={setUserEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Phone Number</Text>
                <TextInput
                  style={styles.formInput}
                  value={userPhone}
                  onChangeText={setUserPhone}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Location</Text>
                <TextInput
                  style={styles.formInput}
                  value={userLocation}
                  onChangeText={setUserLocation}
                  placeholder="Enter your city, state"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <TouchableOpacity 
                style={styles.saveButton}
                onPress={() => {
                  Alert.alert("Success", "Profile updated successfully!");
                  setCurrentProfileSection("main");
                }}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        );

      case "changePassword":
        return (
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.profileSection}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
          >
            <ScrollView 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setCurrentProfileSection("settings")}
              >
                <Ionicons name="arrow-back" size={24} color="#111827" />
                <Text style={styles.backText}>Change Password</Text>
              </TouchableOpacity>

              <View style={styles.passwordInfo}>
                <Ionicons name="information-circle-outline" size={20} color="#4F46E5" />
                <Text style={styles.passwordInfoText}>
                  Your password must be at least 6 characters and include a mix of letters and numbers.
                </Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Current Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Enter current password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showCurrentPassword}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons 
                      name={showCurrentPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color="#9CA3AF" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>New Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showNewPassword}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons 
                      name={showNewPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color="#9CA3AF" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Confirm New Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons 
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color="#9CA3AF" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleChangePassword}
              >
                <Text style={styles.saveButtonText}>Change Password</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        );

      case "settings":
        return (
          <View style={styles.profileSection}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setCurrentProfileSection("main")}
              >
                <Ionicons name="arrow-back" size={24} color="#111827" />
                <Text style={styles.backText}>Settings</Text>
              </TouchableOpacity>

              <View style={styles.settingsGroup}>
                <Text style={styles.settingsGroupTitle}>Security</Text>
                
                <TouchableOpacity 
                  style={styles.settingsItem}
                  onPress={() => setCurrentProfileSection("changePassword")}
                >
                  <View style={styles.settingsLeft}>
                    <Ionicons name="lock-closed-outline" size={22} color="#4F46E5" />
                    <View style={styles.settingsTextContainer}>
                      <Text style={styles.settingsItemTitle}>Change Password</Text>
                      <Text style={styles.settingsItemDesc}>Update your account password</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        );

      case "help":
        return (
          <View style={styles.profileSection}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setCurrentProfileSection("main")}
              >
                <Ionicons name="arrow-back" size={24} color="#111827" />
                <Text style={styles.backText}>Help & Support</Text>
              </TouchableOpacity>

              <Text style={styles.settingsGroupTitle}>Frequently Asked Questions</Text>
              
              {faqData.map((faq) => (
                <View key={faq.id} style={styles.faqContainer}>
                  <TouchableOpacity 
                    style={styles.faqItem}
                    onPress={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  >
                    <View style={styles.faqLeft}>
                      <Ionicons 
                        name={expandedFAQ === faq.id ? "chevron-down" : "chevron-forward"} 
                        size={20} 
                        color="#4F46E5" 
                      />
                      <Text style={styles.faqQuestion}>{faq.question}</Text>
                    </View>
                  </TouchableOpacity>
                  
                  {expandedFAQ === faq.id && (
                    <View style={styles.faqAnswerContainer}>
                      <Text style={styles.faqAnswer}>{faq.answer}</Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        );

      case "about":
        return (
          <View style={styles.profileSection}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setCurrentProfileSection("main")}
              >
                <Ionicons name="arrow-back" size={24} color="#111827" />
                <Text style={styles.backText}>About</Text>
              </TouchableOpacity>

              <View style={styles.aboutHeader}>
                <View style={styles.aboutLogo}>
                  <Ionicons name="finger-print-outline" size={40} color="#4F46E5" />
                </View>
                <Text style={styles.aboutAppName}>JANSETU</Text>
                <Text style={styles.aboutVersion}>Version 1.0.0</Text>
                <Text style={styles.aboutTagline}>
                  Your bridge to legal awareness and rights
                </Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>About JANSETU</Text>
                <Text style={styles.aboutDescription}>
                  JANSETU is a comprehensive legal awareness platform designed to bridge the gap between citizens and the legal system. Our mission is to make legal information accessible, understandable, and actionable for everyone.
                </Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>Key Features</Text>
                
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.featureText}>AI-powered legal assistant</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.featureText}>Comprehensive law database</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.featureText}>Emergency legal assistance</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.featureText}>Government schemes information</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.featureText}>Multi-language support</Text>
                </View>
              </View>

              <View style={styles.creditsSection}>
                <Text style={styles.copyrightText}>
                  © 2026 JANSETU. All rights reserved.
                </Text>
              </View>
            </ScrollView>
          </View>
        );

      default:
        return (
          <View style={styles.profileMainContent}>
            <View style={styles.profileHeader}>
              <View style={styles.profileAvatarLarge}>
                <Text style={styles.profileAvatarText}>{getInitial(userName)}</Text>
              </View>
              <Text style={styles.profileName}>{userName}</Text>
              <Text style={styles.profileEmail}>{userEmail}</Text>
            </View>

            <View style={styles.profileMenu}>
              <TouchableOpacity 
                style={styles.profileMenuItem}
                onPress={() => setCurrentProfileSection("edit")}
              >
                <Ionicons name="person-outline" size={22} color="#4F46E5" />
                <Text style={styles.profileMenuText}>Edit Profile</Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.profileMenuItem}
                onPress={() => setCurrentProfileSection("settings")}
              >
                <Ionicons name="settings-outline" size={22} color="#4F46E5" />
                <Text style={styles.profileMenuText}>Settings</Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.profileMenuItem}
                onPress={() => setCurrentProfileSection("help")}
              >
                <Ionicons name="help-circle-outline" size={22} color="#4F46E5" />
                <Text style={styles.profileMenuText}>Help & Support</Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.profileMenuItem}
                onPress={() => setCurrentProfileSection("about")}
              >
                <Ionicons name="information-circle-outline" size={22} color="#4F46E5" />
                <Text style={styles.profileMenuText}>About</Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.profileMenuItem, styles.logoutButton]}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={22} color="#EF4444" />
                <Text style={[styles.profileMenuText, { color: "#EF4444" }]}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        backgroundColor="transparent" 
        barStyle="dark-content"
        translucent={true}
      />

      {/* ================= SIDEBAR ================= */}
      <Modal visible={menuVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.sidebar}>
            <Image
              source={require("../assets/sidebar.png")}
              style={styles.sidebarBg}
              resizeMode="cover"
            />

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setMenuVisible(false)}
            >
              <Ionicons name="close" size={22} color="#312E81" />
            </TouchableOpacity>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sidebarScroll}
            >
              <View style={styles.sidebarTop}>
                <Image
                  source={require("../assets/sidebarl.png")}
                  style={styles.sidebarLogo}
                  resizeMode="contain"
                />
                <Text style={styles.sidebarSubtitle}>
                  Your Rights. Your Voice.
                </Text>
                <Text style={styles.sidebarSubtitle}>Our Support.</Text>
              </View>

              <View style={styles.menuContainer}>
                <TouchableOpacity 
                  style={styles.menuCard}
                  onPress={() => {
                    setMenuVisible(false);
                    navigation.navigate("PopularLaws");
                  }}
                >
                  <View style={styles.menuLeft}>
                    <View style={styles.iconPurple}>
                      <Image
                        source={require("../assets/balance.png")}
                        style={styles.menuIcon}
                        resizeMode="contain"
                      />
                    </View>
                    <View>
                      <Text style={styles.menuTitle}>Popular Laws</Text>
                      <Text style={styles.menuSub}>
                        Simplified insights for
                      </Text>
                      <Text style={styles.menuSub}>everyday law</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={22} color="#5B3DF5" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuCard}
                  onPress={() => {
                    setMenuVisible(false);
                    navigation.navigate("Rights");
                  }}
                >
                  <View style={styles.menuLeft}>
                    <View style={styles.iconBlue}>
                      <Image
                        source={require("../assets/sheild.png")}
                        style={styles.menuIcon}
                        resizeMode="contain"
                      />
                    </View>
                    <View>
                      <Text style={styles.menuTitle}>Know Your Rights</Text>
                      <Text style={styles.menuSub}>
                        Learn about your rights
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={22} color="#5B3DF5" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuCard}
                  onPress={() => {
                    setMenuVisible(false);
                    navigation.navigate("EmergencyHelpScreen");
                  }}
                >
                  <View style={styles.menuLeft}>
                    <View style={styles.iconRed}>
                      <Image
                        source={require("../assets/sos.png")}
                        style={styles.menuIcon}
                        resizeMode="contain"
                      />
                    </View>
                    <View>
                      <Text style={styles.menuTitle}>Emergency Help</Text>
                      <Text style={styles.menuSub}>Quick access to</Text>
                      <Text style={styles.menuSub}>emergency services</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={22} color="#5B3DF5" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuCard}
                  onPress={() => {
                    setMenuVisible(false);
                    navigation.navigate("Schemes");
                  }}
                >
                  <View style={styles.menuLeft}>
                    <View style={styles.iconPurple}>
                      <Image
                        source={require("../assets/law.png")}
                        style={styles.menuIcon}
                        resizeMode="contain"
                      />
                    </View>
                    <View>
                      <Text style={styles.menuTitle}>
                        Government Schemes
                      </Text>
                      <Text style={styles.menuSub}>
                        Explore welfare schemes
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={22} color="#5B3DF5" />
                </TouchableOpacity>
              </View>

              <View style={styles.languageBox}>
                <Text style={styles.languageLabel}>Select Language</Text>
                <TouchableOpacity
                  style={styles.languageSelector}
                  onPress={() => {
                    setMenuVisible(false);
                    navigation.navigate("Language");
                  }}
                >
                  <Text style={styles.languageText}>
                    {selectedLanguage}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#312E81" />
                </TouchableOpacity>
              </View>

              <View style={styles.bottomSafe}>
                <Ionicons
                  name="shield-checkmark"
                  size={15}
                  color="#6D28D9"
                />
                <Text style={styles.bottomText}>
                  Your data is safe and secure
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ================= PROFILE MODAL ================= */}
      <Modal
        visible={profileVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setProfileVisible(false);
          setCurrentProfileSection("main");
        }}
      >
        <TouchableOpacity
          style={styles.profileOverlay}
          activeOpacity={1}
          onPress={() => {
            setProfileVisible(false);
            setCurrentProfileSection("main");
          }}
        >
          <View style={[styles.profileModal, { paddingBottom: Math.max(insets.bottom, 20) + 20 }]}>
            <TouchableOpacity activeOpacity={1}>
              {renderProfileContent()}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ================= NOTIFICATIONS MODAL ================= */}
      {renderNotificationsModal()}

      {/* ================= FIXED HEADER ================= */}
      <View style={[styles.fixedHeader, { paddingTop: Platform.OS === "android" ? Math.max(insets.top, 8) : 0 }]}>
        <View style={[styles.topBar, { marginTop: Platform.OS === "android" ? 0 : 4 }]}>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu" size={30} color="#312E81" />
          </TouchableOpacity>

          <View style={styles.topRight}>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => setNotificationsVisible(true)}
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color="#312E81"
              />
              {hasUnreadNotifications && <View style={styles.redDot} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.profileCircle}
              onPress={() => setProfileVisible(true)}
            >
              <Text style={styles.profileText}>{getInitial(userName)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ================= SCROLLABLE CONTENT ================= */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent, 
          { 
            paddingTop: Platform.OS === "android" ? Math.max(insets.top, 8) + 60 : 60,
            paddingBottom: Math.max(insets.bottom, 10) + 80
          }
        ]}
      >
        {/* HELLO SECTION */}
        <View style={styles.helloSection}>
          <Text style={styles.helloText}>Hello! 👋</Text>
          <Text style={styles.questionText}>
            How can I help you today?
          </Text>
          <Text style={styles.subText}>
            Ask any legal or policy related
          </Text>
          <Text style={styles.subText}>
            question in simple words.
          </Text>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#9CA3AF"
            style={styles.searchIcon}
          />
          <TextInput
    placeholder="Search laws, schemes, rights..."
    placeholderTextColor="#9CA3AF"
    style={styles.searchInput}
    value={searchQuery}
    onChangeText={setSearchQuery}
    returnKeyType="search"
    onSubmitEditing={handleSearch}
  />
        </View>

        {/* CHATBOT CARD */}
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => navigation.navigate("Chat")}
        >
          <LinearGradient
            colors={["#4F46E5", "#6366F1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.chatCard}
          >
            <View style={styles.chatLeft}>
              <Text style={styles.chatTitle}>Chat with JANSETU</Text>
             <Text style={styles.chatSubtitle}>
  Get answers to your legal and
</Text>
<Text style={styles.chatSubtitle}>
  policy questions.
</Text>

              <TouchableOpacity style={styles.arrowButton}>
                <Ionicons name="arrow-forward" size={18} color="#4F46E5" />
              </TouchableOpacity>
            </View>

            <View style={styles.robotContainer}>
              <View style={styles.chatBubble}>
                <Ionicons name="chatbubble" size={15} color="#FFFFFF" />
              </View>

              <Image
                source={require("../assets/robot.png")}
                style={styles.robotImage}
                resizeMode="contain"
              />

              <Ionicons
                name="chevron-forward"
                size={22}
                color="#4F46E5"
                style={styles.sideArrow}
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* EXPLORE */}
        <Text style={styles.exploreTitle}>Explore</Text>

        <View style={styles.exploreGrid}>
          <TouchableOpacity 
            style={styles.exploreCard}
            onPress={() => navigation.navigate("PopularLaws")}
          >
            <Image
              source={require("../assets/balance.png")}
              style={styles.exploreImage}
              resizeMode="contain"
            />
            <Text style={styles.exploreText}>Popular Laws</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exploreCard}
            onPress={() => navigation.navigate("Schemes")}
          >
            <Image
              source={require("../assets/law.png")}
              style={styles.exploreImage}
              resizeMode="contain"
            />
            <Text style={styles.exploreText}>
              Government{"\n"}Schemes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exploreCard}
            onPress={() => navigation.navigate("Rights")}
          >
            <Image
              source={require("../assets/sheild.png")}
              style={styles.exploreImage}
              resizeMode="contain"
            />
            <Text style={styles.exploreText}>
              Know Your{"\n"}Rights
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exploreCard}
            onPress={() => navigation.navigate("EmergencyHelpScreen")}
          >
            <Image
              source={require("../assets/sos.png")}
              style={styles.exploreImage}
              resizeMode="contain"
            />
            <Text style={styles.exploreText}>
              Emergency{"\n"}Help
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

{isLoading && <Loader />}
      <BottomNav active="Home" navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },

  scrollContent: {
    paddingHorizontal: 20,
  },

  /* ================= SIDEBAR ================= */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.20)",
  },

  sidebar: {
    width: "86%",
    height: "100%",
    backgroundColor: "#FCFCFF",
    borderTopRightRadius: 34,
    borderBottomRightRadius: 34,
    overflow: "hidden",
  },

  sidebarBg: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  sidebarScroll: {
    paddingTop: 54,
    paddingHorizontal: 18,
    paddingBottom: 30,
  },

  closeButton: {
    position: "absolute",
    top: 34,
    left: 18,
    zIndex: 10,
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },

  sidebarTop: {
    alignItems: "center",
    marginTop: -12,
    marginBottom: 26,
  },

  sidebarLogo: {
    width: 270,
    height: 270,
    marginBottom: -50,
  },

  sidebarSubtitle: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
    fontWeight: "500",
    textAlign: "center",
  },

  menuContainer: {
    marginBottom: 22,
  },

  menuCard: {
    height: 92,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 14,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconPurple: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#F3F0FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  iconBlue: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  iconRed: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  menuIcon: {
    width: 28,
    height: 28,
  },

  menuTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },

  menuSub: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
  },

  languageBox: {
    backgroundColor: "#F5F3FF",
    borderRadius: 22,
    padding: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.15)",
    shadowColor: "#7C3AED",
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },

  languageLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
    fontWeight: "600",
  },

  languageSelector: {
    height: 50,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD6FE",
  },

  languageText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },

  bottomSafe: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  bottomText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 6,
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  topRight: {
    flexDirection: "row",
    alignItems: "center",
  },

  notificationButton: {
    marginRight: 14,
    position: "relative",
  },

  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    position: "absolute",
    top: 1,
    right: 0,
  },

  profileCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
  },

  profileText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },

  helloSection: {
    marginBottom: 18,
  },

  helloText: {
    fontSize: 34,
    fontWeight: "700",
    color: "#1E1B4B",
    marginBottom: 6,
    letterSpacing: -0.5,
  },

  questionText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#312E81",
    marginBottom: 10,
  },

  subText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },

  searchContainer: {
    height: 54,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#EEF2FF",
  },

  searchIcon: {
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },

  chatCard: {
    borderRadius: 28,
    paddingTop: 18,
    paddingBottom: 14,
    paddingLeft: 18,
    paddingRight: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 28,
    overflow: "hidden",
    shadowColor: "#4F46E5",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },

  chatLeft: {
    flex: 1,
    paddingTop: 6,
  },

  chatTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 10,
  },

  chatSubtitle: {
    color: "#E0E7FF",
    fontSize: 13.5,
    lineHeight: 19,
  },

  arrowButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },

  robotContainer: {
    width: 135,
    height: 125,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    position: "relative",
    marginBottom: -14,
    marginRight: 4,
  },

  robotImage: {
    width: 124,
    height: 124,
    position: "absolute",
    bottom: 0,
    right: 18,
  },

  chatBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 2,
    right: 18,
    zIndex: 10,
  },

  sideArrow: {
    position: "absolute",
    right: 0,
    bottom: 34,
  },

  exploreTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E1B4B",
    marginBottom: 16,
  },

  exploreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  exploreCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 18,
    paddingLeft: 14,
    paddingRight: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },

  exploreImage: {
    width: 42,
    height: 42,
    marginRight: 4,
  },

  exploreText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#312E81",
    lineHeight: 16,
    flexShrink: 1,
  },

  /* ================= PROFILE MODAL ================= */
  profileOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  profileModal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    paddingHorizontal: 20,
    maxHeight: "90%",
  },

  profileSection: {
    maxHeight: "100%",
  },

  profileMainContent: {
    maxHeight: "100%",
  },

  profileHeader: {
    alignItems: "center",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  profileAvatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  profileAvatarText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
  },

  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },

  profileEmail: {
    fontSize: 14,
    color: "#6B7280",
  },

  profileMenu: {
    gap: 4,
  },

  profileMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
  },

  profileMenuText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },

  logoutButton: {
    marginTop: 10,
    backgroundColor: "#FEF2F2",
  },

  /* ================= EDIT PROFILE STYLES ================= */
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  backText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 8,
  },

  formGroup: {
    marginBottom: 16,
  },

  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },

  formInput: {
    height: 48,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  saveButton: {
    height: 48,
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
  },

  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  /* ================= CHANGE PASSWORD STYLES ================= */
  passwordInfo: {
    flexDirection: "row",
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    alignItems: "flex-start",
  },

  passwordInfoText: {
    fontSize: 13,
    color: "#4F46E5",
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  passwordInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#111827",
  },

  eyeButton: {
    padding: 12,
  },

  /* ================= SETTINGS STYLES ================= */
  settingsGroup: {
    marginBottom: 24,
  },

  settingsGroupTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  settingsItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
  },

  settingsLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  settingsTextContainer: {
    marginLeft: 12,
    flex: 1,
  },

  settingsItemTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 2,
  },

  settingsItemDesc: {
    fontSize: 12,
    color: "#6B7280",
  },

  /* ================= HELP & SUPPORT STYLES ================= */
  faqContainer: {
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
  },

  faqItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
  },

  faqLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  faqQuestion: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginLeft: 10,
    flex: 1,
  },

  faqAnswerContainer: {
    paddingHorizontal: 12,
    paddingBottom: 14,
    paddingLeft: 42,
  },

  faqAnswer: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
  },

  /* ================= ABOUT STYLES ================= */
  aboutHeader: {
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  aboutLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  aboutAppName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },

  aboutVersion: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },

  aboutTagline: {
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: "500",
    textAlign: "center",
  },

  aboutSection: {
    marginBottom: 24,
  },

  aboutSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },

  aboutDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
  },

  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  featureText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 12,
  },

  legalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },

  legalText: {
    fontSize: 15,
    color: "#4F46E5",
    fontWeight: "500",
  },

  creditsSection: {
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },

  creditsText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
  },

  copyrightText: {
    fontSize: 12,
    color: "#9CA3AF",
  },

  /* ================= NOTIFICATIONS MODAL ================= */
  notificationOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  notificationModal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    paddingHorizontal: 20,
    maxHeight: "80%",
  },

  notificationModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  notificationModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  notificationActions: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12,
  },

  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  actionButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4F46E5",
  },

  notificationList: {
    paddingBottom: 20,
  },

  notificationItem: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  unreadNotification: {
    backgroundColor: "#FAFBFF",
  },

  notificationDot: {
    width: 20,
    paddingTop: 4,
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4F46E5",
  },

  notificationContent: {
    flex: 1,
  },

  notificationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },

  notificationMessage: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 6,
  },

  notificationTime: {
    fontSize: 11,
    color: "#9CA3AF",
  },

  emptyNotifications: {
    alignItems: "center",
    paddingVertical: 40,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginTop: 12,
    marginBottom: 4,
  },

  emptySubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
  },
});