import React, { useState, useRef, useEffect } from "react";
import { Modal } from "react-native";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StatusBar,
  SafeAreaView,
  Dimensions,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function SchemeChatbotScreen({ route, navigation }) {
  const { scheme } = route.params;
  const [showHelp, setShowHelp] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "bot",
      text: `👋 Hi! I am JANSETU Scheme Assistant.\n\nI can answer questions about:\n\n${scheme.title}\n\n🌐 Select your preferred language above.\n\nAsk me about:\n• Benefits\n• Eligibility\n• Documents\n• Application Process`
    }
  ]);


  const sendMessage = async () => {
    if (!message.trim()) return;

    const userText = message;
    setMessage("");
    setIsTyping(true);

    // Add user message immediately
    const userMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: userText
    };
    setMessages(prev => [...prev, userMessage]);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Generate bot reply
    setTimeout(async () => {
      const query = message.toLowerCase();
      let botReply = "";

      if (query.includes("benefit") || query.includes("advantage")) {
        botReply = scheme.benefits || "Benefits information not available.";
      } else if (query.includes("eligible") || query.includes("eligibility")) {
        botReply = scheme.eligibility || "Eligibility information not available.";
      } else if (query.includes("document")) {
        botReply = scheme.documents || "Document information not available.";
      } else if (query.includes("apply") || query.includes("application")) {
        botReply = scheme.application_process || "Application process not available.";
      } else if (query.includes("website")) {
        botReply = scheme.official_website || "Website not available.";
      } else {
        botReply = "I can help with:\n\n• Benefits\n• Eligibility\n• Documents\n• Application Process";
      }

      const translatedReply = await translateText(botReply, selectedLanguage);
      
      setIsTyping(false);
      const botMessage = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: translatedReply
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 800);
  };

  const renderMessage = ({ item, index }) => {
    const isBot = item.sender === "bot";

    return (
      <View
        style={[
          styles.messageWrapper,
          isBot ? styles.botWrapper : styles.userWrapper,
        ]}
      >
        <View style={[
          styles.messageBubble,
          isBot ? styles.botBubble : styles.userBubble
        ]}>
          {isBot && (
            <View style={styles.botAvatar}>
              <LinearGradient
                colors={['#4F46E5', '#7C3AED']}
                style={styles.avatarGradient}
              >
                <Ionicons name="chatbubble-ellipses" size={16} color="#fff" />
              </LinearGradient>
            </View>
          )}
          <Text style={[
            styles.messageText,
            isBot ? styles.botText : styles.userText
          ]}>
            {item.text}
          </Text>
        </View>
        <Text style={styles.messageTime}>
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  const renderTypingIndicator = () => (
    <View style={[styles.messageWrapper, styles.botWrapper]}>
      <View style={[styles.messageBubble, styles.botBubble, styles.typingBubble]}>
        <View style={styles.botAvatar}>
          <LinearGradient
            colors={['#4F46E5', '#7C3AED']}
            style={styles.avatarGradient}
          >
            <Ionicons name="chatbubble-ellipses" size={16} color="#fff" />
          </LinearGradient>
        </View>
      </View>
    </View>
  );

  const QuickButton = ({ title, icon, onPress }) => (
    <TouchableOpacity style={styles.quickButton} onPress={onPress} activeOpacity={0.7}>
      <LinearGradient
        colors={['#EEF2FF', '#E0E7FF']}
        style={styles.quickButtonGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Ionicons name={icon} size={18} color="#4F46E5" />
        <Text style={styles.quickButtonText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* HEADER */}
        <LinearGradient
          colors={['#FFFFFF', '#F8FAFC']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Scheme Assistant</Text>
              <View style={styles.statusDot} />
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.headerIcon}
                onPress={() => setShowHelp(true)}
              >
                <Ionicons
                  name="information-circle"
                  size={28}
                  color="#4F46E5"
                />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* SCHEME CARD */}
        <View>
          <LinearGradient
            colors={['#EEF2FF', '#E0E7FF']}
            style={styles.schemeCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.schemeIconContainer}>
              <LinearGradient
                colors={['#4F46E5', '#7C3AED']}
                style={styles.schemeIcon}
              >
                <Ionicons name="business-outline" size={24} color="#fff" />
              </LinearGradient>
            </View>
            <View style={styles.schemeContent}>
              <Text style={styles.schemeLabel}>Current Scheme</Text>
              <Text style={styles.schemeName}>{scheme.title}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* LANGUAGE SELECTOR */}
        <View style={styles.languageContainer}>
          {[
            { code: 'en', label: 'English'},
            { code: 'kn', label: 'ಕನ್ನಡ'},
            { code: 'hi', label: 'हिन्दी'}
          ].map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageChip,
                selectedLanguage === lang.code && styles.activeLanguageChip
              ]}
              onPress={() => setSelectedLanguage(lang.code)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.languageText,
                selectedLanguage === lang.code && styles.activeLanguageText
              ]}>
                {lang.label}
              </Text>
              {selectedLanguage === lang.code && (
                <View style={styles.activeLanguageIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* CHAT MESSAGES */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContainer}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={isTyping ? renderTypingIndicator : null}
        />

        {/* QUICK BUTTONS */}
        <View style={styles.quickRow}>
          <QuickButton 
            title="Benefits" 
            icon="star-outline"
            onPress={() => {
              setMessage("Benefits");
              setTimeout(() => sendMessage(), 100);
            }}
          />
          <QuickButton 
            title="Eligibility" 
            icon="checkmark-circle-outline"
            onPress={() => setMessage("Eligibility")}
          />
          <QuickButton 
            title="Documents" 
            icon="document-text-outline"
            onPress={() => {
              setMessage("Documents");
              setTimeout(() => sendMessage(), 100);
            }}
          />
        </View>

        {/* INPUT */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons name="chatbubble-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Ask about this scheme..."
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              multiline
              maxLength={200}
            />
            {message.length > 0 && (
              <Text style={styles.charCount}>{message.length}/200</Text>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.sendButton,
              !message.trim() && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!message.trim()}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={!message.trim() ? ['#D1D5DB', '#D1D5DB'] : ['#4F46E5', '#7C3AED']}
              style={styles.sendButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={showHelp}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
                📌 How to Use JANSETU
              </Text>

              <Text style={styles.sectionTitle}>
                Getting Started
              </Text>

              <Text style={styles.modalText}>
                1️⃣ Select your preferred language{"\n"}
                2️⃣ Type a question about the scheme{"\n"}
                3️⃣ Or use the quick buttons below{"\n"}
                4️⃣ Read the response generated by JANSETU
              </Text>

              <Text style={styles.sectionTitle}>
                Quick Actions
              </Text>

              <Text style={styles.modalText}>
                ⭐ Benefits{"\n"}
                ✅ Eligibility{"\n"}
                📄 Documents
              </Text>

              <Text style={styles.sectionTitle}>
                Example Questions
              </Text>

              <Text style={styles.modalText}>
                • What are the benefits of this scheme?{"\n"}
                • Who is eligible for this scheme?{"\n"}
                • What documents are required?{"\n"}
                • How can I apply for this scheme?
              </Text>

              <Text style={styles.tipText}>
                💡 Tip: Use simple questions for faster and more accurate responses.
              </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowHelp(false)}
            >
              <Text style={{ color: "#fff" }}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const translateText = async (text, targetLanguage) => {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const data = await response.json();
    return data[0].map(item => item[0]).join("");
  } catch (error) {
    console.log("Translation Error:", error);
    return text;
  }
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC"
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: '#111827',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  headerRight: {
    width: 40,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  schemeCardWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  schemeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  schemeIconContainer: {
    marginRight: 12,
  },
  schemeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  schemeContent: {
    flex: 1,
  },
  schemeLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  schemeName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4F46E5",
    marginTop: 2,
  },
  schemeMore: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  languageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
    position: 'relative',
  },
  activeLanguageChip: {
    backgroundColor: "#E0E7FF",
    borderColor: "#4F46E5",
  },
  languageEmoji: {
    fontSize: 14,
  },
  languageText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeLanguageText: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  activeLanguageIndicator: {
    position: 'absolute',
    bottom: -1,
    left: '30%',
    right: '30%',
    height: 2,
    backgroundColor: '#4F46E5',
    borderRadius: 1,
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  messageWrapper: {
    marginBottom: 12,
  },
  botWrapper: {
    alignSelf: 'flex-start',
    maxWidth: '85%',
  },
  userWrapper: {
    alignSelf: 'flex-end',
    maxWidth: '85%',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: "#4F46E5",
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    maxWidth: "100%",
  },
  botAvatar: {
    marginRight: 8,
  },
  avatarGradient: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    flexShrink: 1,
  },
  userText: {
    color: "#fff",
  },
  botText: {
    color: "#111827",
  },
  messageTime: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
    marginHorizontal: 4,
  },
  typingBubble: {
    minHeight: 48,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4F46E5',
  },

  quickRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  quickButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  quickButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5',
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    paddingBottom: Platform.OS === "android" ? 40 : 10,
    backgroundColor: "#fff",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#F3F4F6",
    borderRadius: 25,
    paddingHorizontal: 16,
    minHeight: 50,
    maxHeight: 100,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    paddingVertical: 12,
    maxHeight: 80,
  },
  charCount: {
    fontSize: 11,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  sendButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalOverlay: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0,0,0,0.4)",
},

modalContainer: {
  width: "85%",
  backgroundColor: "#fff",
  borderRadius: 20,
  padding: 20,
},

modalTitle: {
  fontSize: 20,
  fontWeight: "700",
  marginBottom: 15,
  color: "#4F46E5",
},

modalText: {
  fontSize: 15,
  lineHeight: 24,
  color: "#374151",
},

closeButton: {
  backgroundColor: "#4F46E5",
  padding: 12,
  borderRadius: 12,
  marginTop: 20,
  alignItems: "center",
},
sectionTitle: {
  fontSize: 16,
  fontWeight: "700",
  color: "#4F46E5",
  marginTop: 12,
  marginBottom: 6,
},

tipText: {
  marginTop: 12,
  fontSize: 14,
  fontStyle: "italic",
  color: "#6B7280",
  lineHeight: 22,
},
});
