import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import  aiService  from '../services/ai/aiService'; // Corrected import path based on the new structure

// Define the message structure
interface Message {
    role: 'user' | 'assistant';
    content: string;
    id: number;
}

export default function ChatScreen() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = useCallback(async () => {
        if (input.trim() === '') return;

        const newMessage: Message = { role: 'user', content: input.trim(), id: Date.now() };

        // 1. Add user message to history
        setMessages(prev => [...prev, newMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Prepare history for the API call (excluding the unique ID)
            // We send the full history including the new user message
            const historyForApi = [...messages, newMessage].map(msg => ({
                role: msg.role,
                content: msg.content,
            }));

            // 2. Call the AI service
            // The aiService.chat function expects the full history including the latest user message
            const aiResponseText = await aiService.chat(historyForApi);

            // 3. Add AI response to history
            const aiMessage: Message = { role: 'assistant', content: aiResponseText, id: Date.now() + 1 };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: Message = { role: 'assistant', content: 'Entschuldigung, es gab ein Problem mit der KI-Verbindung.', id: Date.now() + 1 };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [input, messages]);

    const renderItem = ({ item }: { item: Message }) => (
        <View style={[styles.messageContainer, item.role === 'user' ? styles.userMessage : styles.assistantMessage]}>
    <Text style={styles.messageText}>{item.content}</Text>
        </View>
);

    return (
        <KeyboardAvoidingView
            style={styles.container}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
    <FlatList
        data={messages}
    renderItem={renderItem}
    keyExtractor={(item) => item.id.toString()}
    style={styles.chatList}
    contentContainerStyle={styles.chatListContent}
    />

    {isLoading && (
        <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
    <Text style={styles.loadingText}>Mensa-Bot antwortet...</Text>
    </View>
    )}

    <View style={styles.inputContainer}>
    <TextInput
        style={styles.input}
    value={input}
    onChangeText={setInput}
    placeholder="Frage den Mensa-Bot..."
    placeholderTextColor="#999"
    onSubmitEditing={handleSend}
    returnKeyType="send"
    editable={!isLoading}
    />
    <Button title="Senden" onPress={handleSend} disabled={isLoading || input.trim() === ''} />
    </View>
    </KeyboardAvoidingView>
);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    chatList: {
        flex: 1,
        paddingHorizontal: 10,
    },
    chatListContent: {
        paddingVertical: 10,
    },
    messageContainer: {
        maxWidth: '80%',
        padding: 10,
        borderRadius: 15,
        marginVertical: 5,
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#007AFF',
        borderBottomRightRadius: 5,
    },
    assistantMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        borderBottomLeftRadius: 5,
    },
    messageText: {
        color: '#000',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginRight: 10,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        backgroundColor: '#e0e0e0',
    },
    loadingText: {
        marginLeft: 10,
        color: '#555',
    },
});
