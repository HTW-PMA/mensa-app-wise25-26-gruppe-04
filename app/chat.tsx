import React, { useState, useCallback } from 'react';
import { View, TextInput, Button, FlatList, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { answerMensaQuestion } from '../services/ai/aiService';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

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
    const backgroundColor = useThemeColor({}, 'background');
    const surfaceColor = useThemeColor({}, 'surface');
    const borderColor = useThemeColor({}, 'border');
    const textColor = useThemeColor({}, 'text');
    const textSecondaryColor = useThemeColor({}, 'textSecondary');
    const primaryColor = useThemeColor({}, 'primary');

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
            // answerMensaQuestion expects the question and history
            const aiResponseText = await answerMensaQuestion(input.trim(), historyForApi);

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
        <View style={[styles.messageContainer, item.role === 'user' ? { ...styles.userMessage, backgroundColor: primaryColor } : { ...styles.assistantMessage, backgroundColor: surfaceColor }]}>
    <ThemedText style={[styles.messageText, item.role === 'user' ? { color: '#fff' } : { color: textColor }]}>{item.content}</ThemedText>
        </View>
);

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor }]}
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
        <View style={[styles.loadingContainer, { backgroundColor: surfaceColor }]}>
        <ActivityIndicator size="small" color={primaryColor} />
    <ThemedText style={[styles.loadingText, { color: textSecondaryColor }]}>Mensa-Bot antwortet...</ThemedText>
    </View>
    )}

    <View style={[styles.inputContainer, { backgroundColor: surfaceColor, borderTopColor: borderColor }]}>
    <TextInput
        style={[styles.input, { borderColor, color: textColor }]}
    value={input}
    onChangeText={setInput}
    placeholder="Frage den Mensa-Bot..."
    placeholderTextColor={textSecondaryColor}
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
        borderBottomRightRadius: 5,
    },
    assistantMessage: {
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 5,
    },
    messageText: {
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        borderTopWidth: 1,
        alignItems: 'center',
    },
    input: {
        flex: 1,
        borderWidth: 1,
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
    },
    loadingText: {
        marginLeft: 10,
    },
});
