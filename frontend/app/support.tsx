import React, { useState } from 'react';
import {

View,
Text,
TextInput,
TouchableOpacity,
ScrollView,
StyleSheet,
} from 'react-native';

interface Message {
id: string;
text: string;
sender: 'user' | 'support';
timestamp: Date;
}

export default function SupportChat() {
const [messages, setMessages] = useState<Message[]>([
    {
        id: '1',
        text: 'Hello! How can we help you today?',
        sender: 'support',
        timestamp: new Date(),
    },
]);
const [input, setInput] = useState('');

const handleSendMessage = () => {
    if (input.trim()) {
        const userMessage: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date(),
        };
        setMessages([...messages, userMessage]);
        setInput('');

        // Simulate support response
        setTimeout(() => {
            const supportMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Thanks for your message. We are here to help!',
                sender: 'support',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, supportMessage]);
        }, 1000);
    }
};

return (
    <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.title}>Binance Support</Text>
        </View>

        <ScrollView style={styles.messagesContainer}>
            {messages.map((msg) => (
                <View
                    key={msg.id}
                    style={[
                        styles.messageBubble,
                        msg.sender === 'user' ? styles.userMessage : styles.supportMessage,
                    ]}
                >
                    <Text style={styles.messageText}>{msg.text}</Text>
                </View>
            ))}
        </ScrollView>

        <View style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                placeholder="Type your message..."
                value={input}
                onChangeText={setInput}
                placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
        </View>
    </View>
);
}

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#fff',
},
header: {
    backgroundColor: '#f3ba2f',
    paddingVertical: 16,
    paddingHorizontal: 16,
},
title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
},
messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
},
messageBubble: {
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    maxWidth: '80%',
},
userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#f3ba2f',
},
supportMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
},
messageText: {
    fontSize: 14,
    color: '#000',
},
inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
},
input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
},
sendButton: {
    backgroundColor: '#f3ba2f',
    borderRadius: 24,
    paddingHorizontal: 20,
    justifyContent: 'center',
},
sendButtonText: {
    color: '#000',
    fontWeight: '600',
},
});