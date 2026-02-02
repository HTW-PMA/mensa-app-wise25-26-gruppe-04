import React, { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, Button, FlatList, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { answerMensaQuestion } from '../../services/ai/aiService';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

// Define the message structure
interface Message {
    role: 'user' | 'assistant';
    content: string;
    id: number;
}

export default function AIAssistantScreen() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Theme colors
    const primaryColor = useThemeColor({}, 'primary');
    const surfaceColor = useThemeColor({}, 'surface');
    const borderColor = useThemeColor({}, 'border');
    const textSecondaryColor = useThemeColor({}, 'textSecondary');
    const backgroundColor = useThemeColor({}, 'background');
    const userMsgBg = useThemeColor({ light: '#007AFF', dark: '#007AFF' }, 'primary');
    const assistantMsgBg = useThemeColor({ light: '#FFFFFF', dark: '#1C1C1E' }, 'surface');
    const inputBg = useThemeColor({ light: '#FFFFFF', dark: '#1C1C1E' }, 'surface');

    const handleSend = useCallback(async () => {
        if (input.trim() === '') return;

        const newMessage: Message = { role: 'user', content: input.trim(), id: Date.now() };

        // 1. Add user message to history
        setMessages(prev => [...prev, newMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Prepare history for the API call (excluding the unique ID)
            const historyForApi = [...messages, newMessage].map(msg => ({
                role: msg.role,
                content: msg.content,
            }));

            // 2. Call the AI service
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
        <View style={[
            styles.messageContainer,
            item.role === 'user' ? [styles.userMessage, { backgroundColor: userMsgBg }] : [styles.assistantMessage, { backgroundColor: assistantMsgBg }]
        ]}>
            <ThemedText style={[styles.messageText, item.role === 'user' && { color: '#fff' }]}>{item.content}</ThemedText>
        </View>
    );

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <KeyboardAvoidingView
                    style={styles.container}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
                >
                    {/* Header */}
                    <ThemedView style={[styles.header, { borderBottomColor: borderColor }]}>
                        <ThemedText type="title">KI-Assistent</ThemedText>
                        <ThemedText style={{ color: textSecondaryColor }}>Ernährungsberatung & Empfehlungen</ThemedText>
                        <ThemedText style={[styles.introText, { color: textSecondaryColor }]}>
                            Wie kann ich helfen? Fragen Sie nach Empfehlungen, Nährwertinformationen oder Allergenen.
                        </ThemedText>
                    </ThemedView>

                    {/* Chat Messages */}
                    <FlatList
                        data={messages}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        style={styles.chatList}
                        contentContainerStyle={styles.chatListContent}
                    />

                    {isLoading && (
                        <View style={[styles.loadingContainer, { backgroundColor: borderColor }]}>
                            <ActivityIndicator size="small" color={primaryColor} />
                            <ThemedText style={styles.loadingText}>Mensa-Bot antwortet...</ThemedText>
                        </View>
                    )}

                    {/* Input */}
                    <View style={[styles.inputContainer, { backgroundColor: inputBg, borderTopColor: borderColor }]}>
                        <TextInput
                            style={[styles.input, { borderColor: borderColor, color: useThemeColor({}, 'text') }]}
                            value={input}
                            onChangeText={setInput}
                            placeholder="Frage den Mensa-Bot..."
                            placeholderTextColor={textSecondaryColor}
                            onSubmitEditing={handleSend}
                            returnKeyType="send"
                            editable={!isLoading}
                        />
                        <Button title="Senden" onPress={handleSend} disabled={isLoading || input.trim() === ''} color={primaryColor} />
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
        paddingTop: 10,
        gap: 8,
        borderBottomWidth: 1,
    },
    introText: {
        marginTop: 10,
        fontSize: 14,
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
        padding: 12,
        borderRadius: 18,
        marginVertical: 5,
    },
    userMessage: {
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    assistantMessage: {
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
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
        fontSize: 14,
    },
});
