import React, { useState, useCallback, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  TextInput,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { answerMensaQuestion } from '../../services/ai/aiService';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: number;
}

const SUGGESTIONS = [
  'Was ist heute vegan?',
  'Gerichte ohne Gluten?',
  'Was hat wenig Kalorien?',
  'Empfehlung fuer heute?',
];

export default function AIAssistantScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const borderColor = useThemeColor({}, 'border');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const textColor = useThemeColor({}, 'text');

  const userMsgBg = isDark ? '#0A84FF' : '#0A2540';
  const assistantMsgBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const inputBg = isDark ? '#1C1C1E' : '#F2F3F5';
  const inputBarBg = isDark ? '#000000' : '#FFFFFF';

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (trimmed === '') return;

    const newMessage: Message = { role: 'user', content: trimmed, id: Date.now() };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const historyForApi = [...messages, newMessage].map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const aiResponseText = await answerMensaQuestion(trimmed, historyForApi);
      const aiMessage: Message = { role: 'assistant', content: aiResponseText, id: Date.now() + 1 };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Entschuldigung, es gab ein Problem mit der KI-Verbindung.',
        id: Date.now() + 1,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const handleSend = useCallback(() => {
    sendMessage(input);
  }, [input, sendMessage]);

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageBubbleWrap, isUser ? styles.userWrap : styles.assistantWrap]}>
        {!isUser && (
          <View style={[styles.avatarCircle, { backgroundColor: isDark ? '#2C2C2E' : '#F2F3F5' }]}>
            <MaterialIcons name="auto-awesome" size={16} color={isDark ? '#FFFFFF' : '#0A2540'} />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser
              ? [styles.userBubble, { backgroundColor: userMsgBg }]
              : [styles.assistantBubble, { backgroundColor: assistantMsgBg }],
            !isUser && !isDark && styles.assistantShadow,
          ]}
        >
          <ThemedText style={[styles.messageText, isUser && { color: '#FFFFFF' }]}>
            {item.content}
          </ThemedText>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? '#1C1C1E' : '#F2F3F5' }]}>
        <MaterialIcons name="auto-awesome" size={36} color={isDark ? '#FFFFFF' : '#0A2540'} />
      </View>
      <ThemedText style={styles.emptyTitle}>Mensa KI-Assistent</ThemedText>
      <ThemedText style={[styles.emptySubtitle, { color: textSecondaryColor }]}>
        Fragen zu Menues, Naehrwerten, Allergenen oder Empfehlungen - einfach fragen.
      </ThemedText>
      <View style={styles.suggestionsGrid}>
        {SUGGESTIONS.map((suggestion) => (
          <TouchableOpacity
            key={suggestion}
            style={[styles.suggestionChip, { backgroundColor: isDark ? '#1C1C1E' : '#F2F3F5' }]}
            onPress={() => sendMessage(suggestion)}
            activeOpacity={0.7}
          >
            <ThemedText style={[styles.suggestionText, { color: textColor }]}>
              {suggestion}
            </ThemedText>
            <MaterialIcons name="north-east" size={14} color={textSecondaryColor} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTypingIndicator = () => {
    if (!isLoading) return null;
    return (
      <View style={[styles.messageBubbleWrap, styles.assistantWrap]}>
        <View style={[styles.avatarCircle, { backgroundColor: isDark ? '#2C2C2E' : '#F2F3F5' }]}>
          <MaterialIcons name="auto-awesome" size={16} color={isDark ? '#FFFFFF' : '#0A2540'} />
        </View>
        <View style={[styles.typingBubble, { backgroundColor: assistantMsgBg }, !isDark && styles.assistantShadow]}>
          <TypingDots color={textSecondaryColor} />
        </View>
      </View>
    );
  };

  const canSend = input.trim().length > 0 && !isLoading;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
          {messages.length === 0 ? (
            renderEmpty()
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.chatList}
              contentContainerStyle={styles.chatListContent}
              ListFooterComponent={renderTypingIndicator}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
          )}

          {/* Input Bar */}
          <View style={[styles.inputBar, { backgroundColor: inputBarBg, borderTopColor: borderColor }]}>
            <View style={[styles.inputField, { backgroundColor: inputBg }]}>
              <TextInput
                style={[styles.input, { color: textColor }]}
                value={input}
                onChangeText={setInput}
                placeholder="Nachricht schreiben..."
                placeholderTextColor={textSecondaryColor}
                onSubmitEditing={handleSend}
                returnKeyType="send"
                editable={!isLoading}
                multiline
                maxLength={500}
              />
            </View>
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: canSend ? (isDark ? '#0A84FF' : '#0A2540') : (isDark ? '#2C2C2E' : '#E5E7EB') },
              ]}
              onPress={handleSend}
              disabled={!canSend}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name="arrow-upward"
                size={20}
                color={canSend ? '#FFFFFF' : (isDark ? '#6B7280' : '#9CA3AF')}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

function TypingDots({ color }: { color: string }) {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ])
      );
    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 150);
    const a3 = animate(dot3, 300);
    a1.start();
    a2.start();
    a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.typingDotsRow}>
      {[dot1, dot2, dot3].map((opacity, i) => (
        <Animated.View key={i} style={[styles.typingDot, { backgroundColor: color, opacity }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },

  // Chat list
  chatList: { flex: 1 },
  chatListContent: { padding: 16, paddingBottom: 8 },

  // Message bubbles
  messageBubbleWrap: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
    gap: 8,
  },
  userWrap: { justifyContent: 'flex-end' },
  assistantWrap: { justifyContent: 'flex-start' },

  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },

  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  userBubble: {
    borderBottomRightRadius: 6,
  },
  assistantBubble: {
    borderBottomLeftRadius: 6,
  },
  assistantShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },

  // Typing indicator
  typingBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
  },
  typingDotsRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: 14,
    borderTopWidth: 1,
    gap: 8,
  },
  inputField: {
    flex: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 4,
    maxHeight: 120,
  },
  input: {
    fontSize: 15,
    lineHeight: 20,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
