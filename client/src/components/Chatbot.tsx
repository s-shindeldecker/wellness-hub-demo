import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useLDClient, useFlags } from 'launchdarkly-react-client-sdk';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { ChatbotService, ChatMessage as ChatMessageType } from '../services/chatbotService';

const ChatbotContainer = styled.div<{ isOpen: boolean }>`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: ${props => props.isOpen ? '350px' : '60px'};
  height: ${props => props.isOpen ? '500px' : '60px'};
  background-color: white;
  border-radius: ${props => props.isOpen ? '10px' : '50%'};
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
  z-index: 1000;
`;

const ChatHeader = styled.div`
  background-color: #0080ff;
  color: white;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChatTitle = styled.div`
  font-weight: bold;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
`;

const ChatToggleButton = styled.button`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #0080ff;
  color: white;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  color: #888;
`;

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const ldClient = useLDClient();
  const flags = useFlags();
  const [chatbotService, setChatbotService] = useState<ChatbotService | null>(null);
  
  // Initialize chatbot service
  useEffect(() => {
    if (ldClient) {
      // Get AI Config from LaunchDarkly
      const aiConfig = ldClient.variation('guru-guide-ai', null);
      console.log('Initializing chatbot with AI Config:', aiConfig);
      
      // Initialize chatbot service with the LaunchDarkly client
      // The API key is handled by LaunchDarkly AI Configs
      setChatbotService(new ChatbotService(ldClient));
      
      // Add system message if available from the AI Config
      if (aiConfig && aiConfig.messages && aiConfig.messages.length > 0) {
        const systemMessage = aiConfig.messages.find((msg: any) => msg.role === 'system');
        if (systemMessage) {
          setMessages([{
            id: 'system-1',
            role: 'system',
            content: systemMessage.content,
            timestamp: new Date()
          }]);
        }
      }
    }
  }, [ldClient, flags]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };
  
  const handleSendMessage = async (content: string) => {
    if (!chatbotService) {
      console.error('Chatbot service not initialized');
      return;
    }
    
    console.log('Sending message:', content);
    
    // Add user message
    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    console.log('Adding user message to state:', userMessage);
    setMessages(prev => {
      console.log('Previous messages before adding user message:', prev);
      return [...prev, userMessage];
    });
    setIsLoading(true);
    
    try {
      // Important: Use a copy of the current messages plus the new user message
      // because the 'messages' state might not be updated yet
      const currentMessages = [...messages, userMessage];
      console.log('Sending messages to service:', currentMessages);
      
      // Send to chatbot service with all messages including system
      const response = await chatbotService.sendMessage(currentMessages);
      console.log('Response received from server:', response);
      
      if (!response) {
        console.error('Empty response received from server');
        // Add an error message
        const errorMessage: ChatMessageType = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: "Sorry, I couldn't generate a response. Please try again.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        return;
      }
      
      // Add assistant message
      const assistantMessage: ChatMessageType = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      console.log('Adding assistant message to state:', assistantMessage);
      setMessages(prev => {
        console.log('Previous messages before adding assistant message:', prev);
        const newMessages = [...prev, assistantMessage];
        console.log('New messages after adding assistant message:', newMessages);
        return newMessages;
      });
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // We'll always show the chatbot UI and let the server handle the flag check
  // The server will return an error message if the chatbot is disabled
  
  // Handle feedback submission
  const handleFeedbackSubmit = async (messageId: string, isPositive: boolean) => {
    if (!chatbotService) {
      console.error('Chatbot service not initialized');
      return;
    }
    
    console.log('Submitting feedback:', messageId, isPositive);
    
    try {
      const success = await chatbotService.sendFeedback(messageId, isPositive);
      
      if (success) {
        // Update the message in state to reflect feedback submission
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, feedbackSubmitted: true, feedbackPositive: isPositive } 
              : msg
          )
        );
        console.log('Feedback submitted successfully');
      } else {
        console.error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };
  
  return (
    <ChatbotContainer isOpen={isOpen}>
      {isOpen ? (
        <>
          <ChatHeader>
            <ChatTitle>Wellness Assistant</ChatTitle>
            <CloseButton onClick={toggleChat}>×</CloseButton>
          </ChatHeader>
          <MessagesContainer>
            {messages.filter(msg => msg.role !== 'system').map(message => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                onFeedbackSubmit={handleFeedbackSubmit}
              />
            ))}
            {isLoading && (
              <LoadingIndicator>Thinking...</LoadingIndicator>
            )}
            <div ref={messagesEndRef} />
          </MessagesContainer>
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </>
      ) : (
        <ChatToggleButton onClick={toggleChat}>💬</ChatToggleButton>
      )}
    </ChatbotContainer>
  );
};

export default Chatbot;
