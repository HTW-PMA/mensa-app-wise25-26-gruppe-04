/**
 * ChatInterface Component
 * AI chat interface for user interactions
 */

import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Pressable, FlatList } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatInterfaceProps {
  onSendMessage: (message: string) => Promise<string>;
}

export function ChatInterface({ onSendMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const primaryColor = useThemeColor({}, 'primary');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const aiResponse = await onSendMessage(inputText);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === 'user'
          ? [styles.userMessage, { backgroundColor: primaryColor }]
          : [styles.aiMessage, { backgroundColor: surfaceColor }],
      ]}
    >
      <ThemedText style={[styles.messageText, item.sender === 'user' ? { color: '#fff' } : { color: textColor }]}>{item.text}</ThemedText>
      <ThemedText style={[styles.timestamp, item.sender === 'user' ? { color: 'rgba(255,255,255,0.7)' } : { color: textSecondaryColor }]}>
        {item.timestamp.toLocaleTimeString('de-DE', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
      />

      <View style={[styles.inputContainer, { borderTopColor: borderColor }]}>
        <TextInput
          style={[styles.input, { backgroundColor: surfaceColor, color: textColor }]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Nachricht eingeben..."
          placeholderTextColor={textSecondaryColor}
          multiline
          maxLength={500}
        />
        <Pressable
          style={[styles.sendButton, { backgroundColor: primaryColor }, isLoading && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={isLoading}
        >
          <ThemedText style={styles.sendButtonText}>
            {isLoading ? '...' : 'Senden'}
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 10,
    opacity: 0.6,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
