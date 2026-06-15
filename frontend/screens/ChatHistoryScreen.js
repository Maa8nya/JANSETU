// screens/ChatHistoryScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomNav from "../components/BottomNav";

const ALL_CHATS_KEY = "jansetu_all_chats";
const CHAT_HISTORY_KEY = "jansetu_chat_history";
const CURRENT_CHAT_KEY = "jansetu_current_chat";

export default function ChatHistoryScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChats, setSelectedChats] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  useEffect(() => {
    loadChats();
    
    const unsubscribe = navigation.addListener('focus', () => {
      loadChats();
    });
    
    return unsubscribe;
  }, [navigation]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const savedChats = await AsyncStorage.getItem(ALL_CHATS_KEY);
      console.log("Loading all chats from storage:", savedChats);
      
      if (savedChats) {
        const parsedChats = JSON.parse(savedChats);
        // Sort by timestamp (newest first)
        parsedChats.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setChats(parsedChats);
        console.log("Chats loaded successfully:", parsedChats.length);
      } else {
        setChats([]);
        console.log("No chats found in storage");
      }
    } catch (error) {
      console.error("Error loading chats:", error);
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const now = new Date();
      const date = new Date(timestamp);
      
      if (isNaN(date.getTime())) return '';
      
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return date.toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString('en-IN', { 
          day: 'numeric', 
          month: 'short' 
        });
      }
    } catch (error) {
      return '';
    }
  };

  // FIXED: This function now properly loads ALL messages for a chat
  const openChat = async (chatId) => {
    try {
      console.log("Opening chat with ID:", chatId);
      
      // Load all messages from storage
      const allMessagesStr = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
      console.log("All messages from storage:", allMessagesStr);
      
      let chatMessages = [];
      
      if (allMessagesStr) {
        const allMessages = JSON.parse(allMessagesStr);
        console.log("Parsed all messages:", allMessages);
        
        // Check if messages are stored with chatId as key (new format)
        if (allMessages[chatId]) {
          chatMessages = allMessages[chatId];
          console.log("Found messages for chat in new format:", chatMessages.length);
        } 
        // Check if it's an array (old format - single chat)
        else if (Array.isArray(allMessages) && allMessages.length > 0) {
          chatMessages = allMessages;
          console.log("Found messages in old format:", chatMessages.length);
        }
        // Try to find messages by checking if any message has matching chatId
        else {
          console.log("No messages found for chat ID:", chatId);
          // Look through all keys to find matching chat
          Object.keys(allMessages).forEach(key => {
            console.log("Checking key:", key, "Messages:", allMessages[key]?.length);
          });
        }
      } else {
        console.log("No messages in storage at all");
      }
      
      console.log("Final messages to load:", chatMessages.length);
      
      // Set current chat ID
      await AsyncStorage.setItem(CURRENT_CHAT_KEY, chatId);
      
      // Navigate to Chat screen with all messages
      navigation.navigate('Chat', { 
        chatId: chatId,
        existingMessages: chatMessages,
        loadExisting: true
      });
      
    } catch (error) {
      console.error("Error opening chat:", error);
      Alert.alert("Error", "Failed to open chat. Please try again.");
    }
  };

  const toggleChatSelection = (chatId) => {
    const newSelection = new Set(selectedChats);
    if (newSelection.has(chatId)) {
      newSelection.delete(chatId);
    } else {
      newSelection.add(chatId);
    }
    setSelectedChats(newSelection);
    
    if (newSelection.size === 0) {
      setIsSelectionMode(false);
    }
  };

  const deleteSelectedChats = () => {
    Alert.alert(
      "Delete Chats",
      `Delete ${selectedChats.size} selected chat(s)? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedChats = chats.filter(
                chat => !selectedChats.has(chat.id)
              );
              await AsyncStorage.setItem(ALL_CHATS_KEY, JSON.stringify(updatedChats));
              
              // Also remove messages for deleted chats
              const allMessagesStr = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
              if (allMessagesStr) {
                const allMessages = JSON.parse(allMessagesStr);
                selectedChats.forEach(chatId => {
                  delete allMessages[chatId];
                });
                await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(allMessages));
              }
              
              setChats(updatedChats);
              setSelectedChats(new Set());
              setIsSelectionMode(false);
              
              console.log("Deleted chats:", Array.from(selectedChats));
            } catch (error) {
              console.error("Error deleting chats:", error);
              Alert.alert("Error", "Failed to delete chats");
            }
          },
        },
      ]
    );
  };

  const deleteAllChats = () => {
    Alert.alert(
      "Delete All Chats",
      "This will permanently delete all chat history. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                ALL_CHATS_KEY,
                CHAT_HISTORY_KEY,
                CURRENT_CHAT_KEY
              ]);
              
              setChats([]);
              setSelectedChats(new Set());
              setIsSelectionMode(false);
              
              console.log("All chats deleted");
            } catch (error) {
              console.error("Error deleting all chats:", error);
              Alert.alert("Error", "Failed to delete all chats");
            }
          },
        },
      ]
    );
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedChats(new Set());
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.chatItem,
        selectedChats.has(item.id) && styles.selectedChatItem
      ]}
      onPress={() => {
        if (isSelectionMode) {
          toggleChatSelection(item.id);
        } else {
          openChat(item.id);
        }
      }}
      onLongPress={() => {
        if (!isSelectionMode) {
          setIsSelectionMode(true);
          toggleChatSelection(item.id);
        }
      }}
      activeOpacity={0.7}
    >
      <View style={styles.chatAvatar}>
        <Ionicons 
          name="chatbubble-ellipses" 
          size={24} 
          color={selectedChats.has(item.id) ? "#FFFFFF" : "#4F46E5"} 
        />
      </View>
      
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatTitle} numberOfLines={1}>
            {item.title || "New Chat"}
          </Text>
          <Text style={styles.chatTime}>
            {formatDate(item.timestamp)}
          </Text>
        </View>
        
        <View style={styles.chatFooter}>
          <Text style={styles.chatPreview} numberOfLines={1}>
            {item.lastMessage || "No messages yet"}
          </Text>
          {item.messageCount ? (
            <View style={styles.messageCount}>
              <Text style={styles.messageCountText}>
                {item.messageCount}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {isSelectionMode && (
        <View style={[
          styles.checkbox,
          selectedChats.has(item.id) && styles.checkboxSelected
        ]}>
          {selectedChats.has(item.id) && (
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No Chat History</Text>
      <Text style={styles.emptySubtitle}>
        Your conversations will appear here
      </Text>
      <TouchableOpacity
        style={styles.newChatButton}
        onPress={() => navigation.navigate('Chat')}
      >
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.newChatButtonText}>Start New Chat</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        {isSelectionMode ? (
          <View style={styles.selectionHeader}>
            <TouchableOpacity onPress={exitSelectionMode}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.selectionTitle}>
              {selectedChats.size} selected
            </Text>
            <View style={styles.selectionActions}>
              <TouchableOpacity 
                onPress={deleteSelectedChats}
                style={styles.selectionAction}
              >
                <Ionicons name="trash-outline" size={22} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.headerRow}>
            <TouchableOpacity 
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={22} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chat History</Text>
            {chats.length > 0 && (
              <TouchableOpacity 
                style={styles.deleteAllBtn}
                onPress={deleteAllChats}
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Chat List */}
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContainer,
          chats.length === 0 && styles.emptyListContainer
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <BottomNav active="History" navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  
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
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
  },
  deleteAllBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },
  
  selectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  selectionActions: {
    flexDirection: "row",
    gap: 12,
  },
  selectionAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },
  
  listContainer: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  emptyListContainer: {
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginLeft: 72,
  },
  
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  selectedChatItem: {
    backgroundColor: "#EEF2FF",
  },
  chatAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chatTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
    marginRight: 8,
  },
  chatTime: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  chatFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatPreview: {
    fontSize: 13,
    color: "#6B7280",
    flex: 1,
    marginRight: 8,
  },
  messageCount: {
    backgroundColor: "#4F46E5",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  messageCountText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    marginLeft: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  
  emptyState: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
    textAlign: "center",
  },
  newChatButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4F46E5",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 24,
    gap: 8,
  },
  newChatButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});