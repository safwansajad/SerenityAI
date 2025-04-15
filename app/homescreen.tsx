// HomeScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { getTinyLlamaReply } from '../utils/llamaChat';

type Message = {
  text: string;
  isUser: boolean;
};

export default function HomeScreen() {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! I'm SerenityAI. I'm here to help you reflect on your thoughts and emotions 💙",
      isUser: false
    }
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const navigation = useNavigation();

  const handleSend = async () => {
    if (!userInput.trim()) return;
  
    const userMessage: Message = { text: userInput, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsAnalyzing(true);
  
    try {
      const reply = await getTinyLlamaReply(userInput);
  
      // Ensure reply is a string, fallback to a default response if undefined
      const safeReply = reply ?? "Sorry, I couldn't generate a response.";
  
      const aiMessage: Message = { text: safeReply, isUser: false };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const fallback: Message = {
        text: "I'm having trouble responding right now. Please try again later.",
        isUser: false,
      };
      setMessages(prev => [...prev, fallback]);
    } finally {
      setIsAnalyzing(false);
      scrollToBottom();
    }
  };
  


  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const navigateToJournal = () => {
    navigation.navigate('Journal');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#4F9DE8', '#357ABD']} style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
          <Text style={styles.appName}>SerenityAI</Text>
        </View>
        <TouchableOpacity style={styles.journalButton} onPress={navigateToJournal}>
          <Feather name="book" size={24} color="white" />
          <Text style={styles.journalButtonText}>Journal</Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>🌞 Good Day!</Text>
        <Text style={styles.motivation}>
          "Your feelings are valid. Let's talk about them."
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.contentArea}
        onContentSizeChange={scrollToBottom}
      >
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              message.isUser ? styles.userMessageBubble : styles.aiMessageBubble
            ]}
          >
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        ))}

        {isAnalyzing && (
          <View style={styles.analyzingContainer}>
            <ActivityIndicator size="small" color="#4F9DE8" />
            <Text style={styles.analyzingText}>Understanding your feelings...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          Note: This is not a substitute for professional mental health services.
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.textInput}
          placeholder="How are you feeling today?"
          value={userInput}
          onChangeText={setUserInput}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={isAnalyzing}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // [Same styles as your original code, kept intact]
  container: { flex: 1, backgroundColor: '#F5F9FF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  journalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 20,
  },
  journalButtonText: {
    color: 'white',
    marginLeft: 5,
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  welcomeCard: {
    margin: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 6,
    color: '#001F54',
    fontFamily: 'Poppins-SemiBold',
  },
  motivation: {
    fontSize: 14,
    color: '#3A3A3A',
    fontFamily: 'Poppins-Regular',
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    maxWidth: '80%',
  },
  userMessageBubble: {
    backgroundColor: '#E1F5FE',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiMessageBubble: {
    backgroundColor: '#DCF0FF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: '#001F54',
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 20,
    padding: 12,
    maxHeight: 100,
    backgroundColor: 'white',
    fontFamily: 'Poppins-Regular',
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#001F54',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  analyzingContainer: {
    alignSelf: 'center',
    marginVertical: 10,
  },
  analyzingText: {
    color: '#666',
    fontStyle: 'italic',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  disclaimer: {
    padding: 8,
    backgroundColor: 'rgba(255, 248, 225, 0.7)',
    borderTopWidth: 1,
    borderColor: '#FFE0B2',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#5D4037',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
});
