import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  Platform,
  Keyboard,
  Animated,
  Alert,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  ActivityIndicator,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomNav from "../components/BottomNav";
import Loader from "../components/Loader";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const CHAT_HISTORY_KEY = "jansetu_chat_history";
const ALL_CHATS_KEY = "jansetu_all_chats";
const CURRENT_CHAT_KEY = "jansetu_current_chat";

export default function ChatScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);

  // State Management
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [allChats, setAllChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(Date.now().toString());
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  // Refs
  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  const recordingInterval = useRef(null);
  
  // Animation Values
  const typingDots = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Suggested Questions
  const suggestedQuestions = [
    { icon: "scale-outline", text: "What are my legal rights?" },
    { icon: "document-text-outline", text: "How to file an RTI?" },
    { icon: "newspaper-outline", text: "Latest government policies" },
    { icon: "shield-checkmark-outline", text: "Consumer protection laws" },
    { icon: "home-outline", text: "Property registration process" },
    { icon: "briefcase-outline", text: "Employment regulations" },
  ];

  // Default welcome message
  const getWelcomeMessage = () => ({
    id: "welcome_" + Date.now(),
    sender: "bot",
    text: "Welcome to JANSETU. I'm your AI-powered legal and policy assistant. How can I help you today?",
    time: getCurrentTime(),
    type: "text",
    isWelcome: true,
  });

  // Initialize chat
  useEffect(() => {
    initializeChat();
    setupKeyboardListeners();
    startPulseAnimation();
    
    return () => {
      cleanupResources();
    };
  }, []);

  // ADDED: Load chat when navigating from history
  useEffect(() => {
    if (navigation.getState()?.routes) {
      const params = navigation.getState().routes[navigation.getState().routes.length - 1]?.params;
      if (params?.chatId && params?.loadExisting) {
        loadExistingChat(params.chatId);
      }
    }
  }, [navigation]);

  // ADDED: Handle route params for loading existing chats
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const params = navigation.getState()?.routes[navigation.getState().routes.length - 1]?.params;
      if (params?.chatId && params?.existingMessages) {
        loadExistingChat(params.chatId, params.existingMessages);
        // Clear params after loading
        navigation.setParams({ chatId: undefined, existingMessages: undefined, loadExisting: undefined });
      }
    });
    return unsubscribe;
  }, [navigation]);

  // Save chat history on changes
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory();
    }
  }, [messages]);

  // Typing animation
  useEffect(() => {
    if (isTyping) {
      startTypingAnimation();
    } else {
      stopTypingAnimation();
    }
  }, [isTyping]);

  const initializeChat = async () => {
    try {
      const [savedMessages, savedAllChats, savedCurrentChatId] = await Promise.all([
        AsyncStorage.getItem(CHAT_HISTORY_KEY),
        AsyncStorage.getItem(ALL_CHATS_KEY),
        AsyncStorage.getItem(CURRENT_CHAT_KEY),
      ]);

      if (savedAllChats) setAllChats(JSON.parse(savedAllChats));
      if (savedCurrentChatId) setCurrentChatId(savedCurrentChatId);

      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages.length > 0 ? parsedMessages : [getWelcomeMessage()]);
      } else {
        setMessages([getWelcomeMessage()]);
      }
    } catch (error) {
      console.error("Error initializing chat:", error);
      setMessages([getWelcomeMessage()]);
    }
  };

  // ADDED: Load existing chat function
  const loadExistingChat = async (chatId, existingMessages = null) => {
    try {
      if (existingMessages && existingMessages.length > 0) {
        setMessages(existingMessages);
        setCurrentChatId(chatId);
      } else {
        // Load all messages and find the specific chat
        const allMessagesStr = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
        if (allMessagesStr) {
          const allMessages = JSON.parse(allMessagesStr);
          // Check if it's stored as an object with chat IDs
          if (allMessages[chatId]) {
            setMessages(allMessages[chatId]);
          } else if (Array.isArray(allMessages)) {
            // If it's an array, just set it (backward compatibility)
            setMessages(allMessages);
          }
        }
        setCurrentChatId(chatId);
      }
    } catch (error) {
      console.error("Error loading existing chat:", error);
    }
  };

  const cleanupResources = () => {
    if (recording) {
      recording.stopAndUnloadAsync().catch(console.error);
    }
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
    }
  };

  const setupKeyboardListeners = () => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
    );

    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardHeight(0)
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const getDateSeparator = (timestamp) => {
    const today = new Date();
    const messageDate = new Date(timestamp);
    const diffTime = Math.abs(today - messageDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return messageDate.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // MODIFIED: Updated save function to save per chat
  const saveChatHistory = async () => {
    try {
      // Save messages with chat ID as key
      const allMessagesStr = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
      let allMessages = {};
      
      if (allMessagesStr) {
        try {
          allMessages = JSON.parse(allMessagesStr);
          // If old format (array), convert to new format
          if (Array.isArray(allMessages)) {
            const oldMessages = allMessages;
            allMessages = {};
            allMessages[currentChatId] = oldMessages;
          }
        } catch (e) {
          allMessages = {};
        }
      }
      
      allMessages[currentChatId] = messages;
      await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(allMessages));
      await AsyncStorage.setItem(ALL_CHATS_KEY, JSON.stringify(allChats));
      await AsyncStorage.setItem(CURRENT_CHAT_KEY, currentChatId);
    } catch (error) {
      console.error("Error saving chat history:", error);
    }
  };

  const saveAllChats = async (chats) => {
    try {
      await AsyncStorage.setItem(ALL_CHATS_KEY, JSON.stringify(chats));
    } catch (error) {
      console.error("Error saving all chats:", error);
    }
  };

  // MODIFIED: Updated startNewChat to properly save current chat
  const startNewChat = () => {
    if (messages.length > 1) {
      // Save current chat to allChats
      const chatSummary = {
        id: currentChatId,
        title: messages.find(m => m.sender === 'user')?.text?.substring(0, 30) || 
               messages[1]?.text?.substring(0, 30) || "New Chat",
        lastMessage: messages[messages.length - 1]?.text?.substring(0, 50),
        timestamp: new Date().toISOString(),
        messageCount: messages.length,
      };
      
      // Check if chat already exists and update it
      const existingChatIndex = allChats.findIndex(chat => chat.id === currentChatId);
      let updatedChats;
      
      if (existingChatIndex >= 0) {
        updatedChats = [...allChats];
        updatedChats[existingChatIndex] = chatSummary;
      } else {
        updatedChats = [chatSummary, ...allChats];
      }
      
      // Keep only the last 50 chats
      if (updatedChats.length > 50) {
        updatedChats = updatedChats.slice(0, 50);
      }
      
      setAllChats(updatedChats);
      saveAllChats(updatedChats);
    }

    const newChatId = Date.now().toString();
    setCurrentChatId(newChatId);
    setMessages([getWelcomeMessage()]);
    setMessage("");
    setAttachment(null);
    setShowMenu(false);
  };

  const clearChatHistory = () => {
    Alert.alert(
      "Clear Chat",
      "Delete all messages in this conversation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              // Remove current chat from all chats
              const updatedChats = allChats.filter(chat => chat.id !== currentChatId);
              setAllChats(updatedChats);
              
              // Remove current chat messages
              const allMessagesStr = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
              if (allMessagesStr) {
                const allMessages = JSON.parse(allMessagesStr);
                if (allMessages[currentChatId]) {
                  delete allMessages[currentChatId];
                  await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(allMessages));
                }
              }
              
              await AsyncStorage.setItem(ALL_CHATS_KEY, JSON.stringify(updatedChats));
              setMessages([getWelcomeMessage()]);
              setShowMenu(false);
            } catch (error) {
              console.error("Error clearing history:", error);
            }
          },
        },
      ]
    );
  };

  const navigateToChatHistory = () => {
    // ADDED: Save current chat before navigating
    if (messages.length > 1) {
      const chatSummary = {
        id: currentChatId,
        title: messages.find(m => m.sender === 'user')?.text?.substring(0, 30) || 
               messages[1]?.text?.substring(0, 30) || "New Chat",
        lastMessage: messages[messages.length - 1]?.text?.substring(0, 50),
        timestamp: new Date().toISOString(),
        messageCount: messages.length,
      };
      
      const existingChatIndex = allChats.findIndex(chat => chat.id === currentChatId);
      let updatedChats;
      
      if (existingChatIndex >= 0) {
        updatedChats = [...allChats];
        updatedChats[existingChatIndex] = chatSummary;
      } else {
        updatedChats = [chatSummary, ...allChats];
      }
      
      setAllChats(updatedChats);
      saveAllChats(updatedChats);
    }
    
    setShowMenu(false);
    navigation.navigate('ChatHistory');
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startTypingAnimation = () => {
    const animations = typingDots.map((dot, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 200),
          Animated.timing(dot, {
            toValue: -6,
            duration: 400,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      )
    );
    Animated.parallel(animations).start();
  };

  const stopTypingAnimation = () => {
    typingDots.forEach(dot => dot.setValue(0));
  };

  const simulateBotResponse = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    const responses = [
      "Thank you for your query. Based on current regulations, I can help you with this. Could you provide more specific details?",
      "I understand your concern. Here's what you need to know about this matter.",
      "Good question. Let me break this down for you with the relevant provisions.",
      "I've reviewed your request. Here are the steps you should follow.",
    ];

    const suggestions = [
      "Tell me more",
      "Documents needed",
      "Relevant laws",
      "Connect with expert",
    ];

    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      suggestions: suggestions.slice(0, Math.floor(Math.random() * 3) + 1),
    };
  };

  // MODIFIED: Updated sendMessage to properly save chat list
  const sendMessage = async () => {
    if (!message.trim() && !attachment) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: message.trim(),
      time: getCurrentTime(),
      timestamp: new Date().toISOString(),
      type: attachment ? attachment.type : "text",
      attachment: attachment ? { ...attachment } : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setAttachment(null);
    setIsTyping(true);
    setIsLoading(true);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // ADDED: Update chat list immediately when user sends message
    updateChatList(userMessage);

    try {
      const botResponse = await simulateBotResponse(userMessage);

      const botReply = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: botResponse.text,
        time: getCurrentTime(),
        timestamp: new Date().toISOString(),
        type: "text",
        suggestions: botResponse.suggestions,
      };

      setMessages(prev => [...prev, botReply]);
    } catch (error) {
      console.error("Error getting bot response:", error);
      
      const errorReply = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: "I'm having trouble processing your request. Please try again.",
        time: getCurrentTime(),
        timestamp: new Date().toISOString(),
        type: "text",
        isError: true,
      };
      
      setMessages(prev => [...prev, errorReply]);
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  // ADDED: New function to update chat list
  const updateChatList = (userMessage) => {
    const chatSummary = {
      id: currentChatId,
      title: userMessage.text?.substring(0, 50) || "New Chat",
      lastMessage: userMessage.text?.substring(0, 50),
      timestamp: new Date().toISOString(),
      messageCount: messages.length + 1,
    };
    
    setAllChats(prev => {
      const existingChatIndex = prev.findIndex(chat => chat.id === currentChatId);
      let updatedChats;
      
      if (existingChatIndex >= 0) {
        updatedChats = [...prev];
        updatedChats[existingChatIndex] = chatSummary;
      } else {
        updatedChats = [chatSummary, ...prev];
      }
      
      saveAllChats(updatedChats);
      return updatedChats;
    });
  };

  const handleSuggestionPress = (question) => {
    setMessage(question);
    setTimeout(() => {
      sendMessage();
    }, 100);
  };

  // Voice Recording Functions
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Permission Required", "Microphone access is needed for voice messages.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recordingObject = new Audio.Recording();
      await recordingObject.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recordingObject.startAsync();

      setRecordingDuration(0);
      recordingInterval.current = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= 120) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      setRecording(recordingObject);
      setIsRecording(true);
    } catch (error) {
      console.error("Recording error:", error);
      Alert.alert("Error", "Failed to start recording.");
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        if (recordingInterval.current) {
          clearInterval(recordingInterval.current);
        }
        
        const uri = recording.getURI();
        setRecording(null);
        setIsRecording(false);
        setRecordingDuration(0);

        if (uri) {
          setAttachment({
            type: "audio",
            uri: uri,
            duration: recordingDuration,
            name: `Voice_Message_${getCurrentTime().replace(/:/g, '-')}.m4a`,
          });
        }
      }
    } catch (error) {
      console.error("Stop recording error:", error);
    }
  };

  const handleMicPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // File/Image Handling Functions
  const openCamera = async () => {
    setShowAttachMenu(false);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Camera access is needed.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        setAttachment({
          type: "image",
          uri: result.assets[0].uri,
          fileName: "Camera_Photo.jpg",
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open camera.");
    }
  };

  const openGallery = async () => {
    setShowAttachMenu(false);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Gallery access is needed.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        setAttachment({
          type: "image",
          uri: result.assets[0].uri,
          fileName: result.assets[0].fileName || "Gallery_Image.jpg",
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open gallery.");
    }
  };

  const openDocuments = async () => {
    setShowAttachMenu(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "application/msword", "text/plain"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const file = result.assets[0];
        
        if (file.size && file.size > MAX_FILE_SIZE) {
          Alert.alert("File Too Large", `Please select a file smaller than ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
          return;
        }

        setAttachment({
          type: "document",
          fileName: file.name,
          fileSize: file.size,
          uri: file.uri,
          mimeType: file.mimeType,
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select document.");
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render Functions
  const renderDateSeparator = (date) => (
    <View style={styles.dateSeparator}>
      <View style={styles.dateLine} />
      <Text style={styles.dateText}>{date}</Text>
      <View style={styles.dateLine} />
    </View>
  );

  const renderMessage = ({ item, index }) => {
    const showDateSeparator = index === 0 || 
      getDateSeparator(item.timestamp) !== getDateSeparator(messages[index - 1]?.timestamp);

    if (item.sender === "user") {
      return (
        <>
          {showDateSeparator && renderDateSeparator(getDateSeparator(item.timestamp))}
          <View style={styles.userBubble}>
            {item.attachment?.type === "image" && (
              <TouchableOpacity style={styles.imagePreview}>
                <Image source={{ uri: item.attachment.uri }} style={styles.messageImage} resizeMode="cover" />
              </TouchableOpacity>
            )}
            {item.attachment?.type === "document" && (
              <View style={styles.docPreview}>
                <Ionicons name="document-text" size={20} color="#4F46E5" />
                <View style={styles.docInfo}>
                  <Text style={styles.docName} numberOfLines={1}>{item.attachment.fileName}</Text>
                  <Text style={styles.docSize}>{formatFileSize(item.attachment.fileSize)}</Text>
                </View>
              </View>
            )}
            {item.text ? <Text style={styles.userText}>{item.text}</Text> : null}
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
        </>
      );
    }

    return (
      <>
        {showDateSeparator && renderDateSeparator(getDateSeparator(item.timestamp))}
        <View style={styles.botRow}>
          {/* Robot Image Avatar */}
          <Image 
            source={require("../assets/robot.png")} 
            style={styles.botAvatar} 
          />
          <View style={styles.botBubble}>
            <Text style={styles.botText}>{item.text}</Text>
            {item.suggestions && (
              <View style={styles.suggestions}>
                {item.suggestions.map((suggestion, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.chip}
                    onPress={() => handleSuggestionPress(suggestion)}
                  >
                    <Text style={styles.chipText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
        </View>
      </>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    return (
      <View style={styles.botRow}>
        {/* Robot Image Avatar for typing indicator */}
        <Image 
          source={require("../assets/robot.png")} 
          style={styles.botAvatar} 
        />
        <View style={[styles.botBubble, styles.typingBubble]}>
          <View style={styles.typingDots}>
            {typingDots.map((anim, index) => (
              <Animated.View
                key={index}
                style={[styles.typingDot, { transform: [{ translateY: anim }] }]}
              />
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderSuggestedQuestions = () => {
    if (messages.length > 1) return null;
    return (
      <View style={styles.suggestedSection}>
        <Text style={styles.suggestedTitle}>Ask about</Text>
        <View style={styles.suggestedGrid}>
          {suggestedQuestions.map((question, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestedCard}
              onPress={() => handleSuggestionPress(question.text)}
              activeOpacity={0.7}
            >
              <Ionicons name={question.icon} size={18} color="#6B7280" />
              <Text style={styles.suggestedText} numberOfLines={2}>{question.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderAttachmentPreview = () => {
    if (!attachment) return null;
    return (
      <View style={styles.attachmentBar}>
        <Ionicons name={attachment.type === "image" ? "image" : "document-text"} size={18} color="#6B7280" />
        <Text style={styles.attachmentName} numberOfLines={1}>
          {attachment.fileName || "Attachment"}
        </Text>
        <TouchableOpacity onPress={removeAttachment}>
          <Ionicons name="close" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? insets.top : 0 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#374151" />
          </TouchableOpacity>
          
          <View style={styles.headerTitle}>
            <Text style={styles.titleText}>JANSETU</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusLabel}>Online</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.iconBtn} 
              onPress={navigateToChatHistory}
            >
              <Ionicons name="time-outline" size={20} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={startNewChat}>
              <Ionicons name="create-outline" size={20} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setShowMenu(!showMenu)}>
              <Ionicons name="ellipsis-vertical" size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        {showMenu && (
          <View style={styles.dropdown}>
            <TouchableOpacity style={styles.dropItem} onPress={startNewChat}>
              <Ionicons name="add-circle-outline" size={18} color="#374151" />
              <Text style={styles.dropText}>New Chat</Text>
            </TouchableOpacity>
            <View style={styles.dropDivider} />
            <TouchableOpacity style={styles.dropItem} onPress={navigateToChatHistory}>
              <Ionicons name="time-outline" size={18} color="#374151" />
              <Text style={styles.dropText}>Chat History</Text>
            </TouchableOpacity>
            <View style={styles.dropDivider} />
            <TouchableOpacity style={styles.dropItem} onPress={clearChatHistory}>
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text style={[styles.dropText, { color: '#EF4444' }]}>Clear Chat</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Chat Area */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.chatList}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListHeaderComponent={renderSuggestedQuestions}
          ListFooterComponent={renderTypingIndicator}
        />

        {renderAttachmentPreview()}

        {/* Input */}
        <View style={[styles.inputArea, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          {isRecording ? (
            <View style={styles.recordBar}>
              <Animated.View style={[styles.recordDot, { transform: [{ scale: pulseAnim }] }]} />
              <Text style={styles.recordTime}>{formatDuration(recordingDuration)}</Text>
              <TouchableOpacity style={styles.stopBtn} onPress={stopRecording}>
                <Ionicons name="stop" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.inputRow}>
              <TouchableOpacity
                style={styles.attachBtn}
                onPress={() => {
                  Keyboard.dismiss();
                  setTimeout(() => setShowAttachMenu(true), 150);
                }}
              >
                <Ionicons name="add" size={22} color="#6B7280" />
              </TouchableOpacity>

              <TextInput
                ref={inputRef}
                placeholder="Type a message..."
                placeholderTextColor="#9CA3AF"
                style={styles.textInput}
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={1000}
              />

              {!message.trim() && !attachment ? (
                <TouchableOpacity style={styles.micBtn} onPress={handleMicPress}>
                  <Ionicons name="mic-outline" size={20} color="#6B7280" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name="send" size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

     {keyboardHeight === 0 && (
  <BottomNav active="Chat" navigation={navigation} />
)}

{isLoading && <Loader />}

      {/* Attachment Menu */}
      {showAttachMenu && (
        <View style={styles.modal}>
          <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setShowAttachMenu(false)} />
          <View style={[styles.attachSheet, { paddingBottom: Math.max(insets.bottom, 34) }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Attach</Text>
            <View style={styles.attachRow}>
              <TouchableOpacity style={styles.attachItem} onPress={openCamera}>
                <View style={styles.attachIcon}>
                  <Ionicons name="camera-outline" size={22} color="#374151" />
                </View>
                <Text style={styles.attachLabel}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.attachItem} onPress={openGallery}>
                <View style={styles.attachIcon}>
                  <Ionicons name="images-outline" size={22} color="#374151" />
                </View>
                <Text style={styles.attachLabel}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.attachItem} onPress={openDocuments}>
                <View style={styles.attachIcon}>
                  <Ionicons name="document-outline" size={22} color="#374151" />
                </View>
                <Text style={styles.attachLabel}>Files</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAttachMenu(false)}>
              <Text style={styles.cancelLabel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  flex: {
    flex: 1,
    marginBottom: 88,
  },
  
  // Header
  header: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    zIndex: 100,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    alignItems: "center",
  },
  titleText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: 0.5,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 5,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  statusLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  headerRight: {
    flexDirection: "row",
    gap: 4,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  
  // Dropdown
  dropdown: {
    position: "absolute",
    top: 60,
    right: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    minWidth: 180,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    paddingVertical: 6,
  },
  dropItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 16,
    gap: 10,
  },
  dropText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  dropDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginHorizontal: 16,
  },
  
  // Chat List
  chatList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flexGrow: 1,
  },
  
  // Date
  dateSeparator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dateText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginHorizontal: 12,
    fontWeight: "500",
  },
  
  // Suggested
  suggestedSection: {
    marginBottom: 24,
  },
  suggestedTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  suggestedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestedCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    width: (SCREEN_WIDTH - 48) / 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    gap: 8,
  },
  suggestedText: {
    fontSize: 12,
    color: "#374151",
    flex: 1,
    fontWeight: "500",
    lineHeight: 17,
  },
  
  // Bot Message
  botRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginTop: 2,
  },
  botBubble: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 14,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  botText: {
    color: "#374151",
    fontSize: 14,
    lineHeight: 21,
  },
  
  // User Message
  userBubble: {
    backgroundColor: "#EEF2FF",
    padding: 12,
    borderRadius: 14,
    borderTopRightRadius: 4,
    alignSelf: "flex-end",
    maxWidth: "82%",
    marginBottom: 16,
  },
  userText: {
    color: "#312E81",
    fontSize: 14,
    lineHeight: 21,
  },
  
  // Time
  timeText: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 6,
    fontWeight: "500",
  },
  
  // Attachments in message
  imagePreview: {
    marginBottom: 8,
    borderRadius: 10,
    overflow: "hidden",
  },
  messageImage: {
    width: SCREEN_WIDTH * 0.5,
    height: SCREEN_WIDTH * 0.4,
    borderRadius: 10,
  },
  docPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 8,
    gap: 8,
    marginBottom: 8,
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
  },
  docSize: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 2,
  },
  
  // Suggestions
  suggestions: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 8,
    gap: 6,
  },
  chip: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  chipText: {
    fontSize: 12,
    color: "#4F46E5",
    fontWeight: "500",
  },
  
  // Typing
  typingBubble: {
    minWidth: 60,
    justifyContent: "center",
  },
  typingDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 3,
    paddingVertical: 4,
  },
  
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D1D5DB",
  },
  
  // Input
  inputArea: {
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: "#F9FAFB",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingLeft: 10,
    paddingRight: 4,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
    paddingVertical: 6,
    paddingHorizontal: 8,
    maxHeight: 100,
  },
  attachBtn: {
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
  },
  micBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
  },
  
  // Recording
  recordBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  recordDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#EF4444",
  },
  recordTime: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#EF4444",
    marginLeft: 10,
  },
  stopBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
  },
  
  // Attachment Bar
  attachmentBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    marginHorizontal: 12,
    marginBottom: 4,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  attachmentName: {
    flex: 1,
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  
  // Modal
  modal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  attachSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 14,
  },
  sheetHandle: {
    width: 32,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 18,
  },
  attachRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 18,
  },
  attachItem: {
    alignItems: "center",
    width: "28%",
  },
  attachIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  attachLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },
  cancelBtn: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  cancelLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
});