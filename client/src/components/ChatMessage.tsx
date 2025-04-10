import React from 'react';
import styled from 'styled-components';
import { ChatMessage as ChatMessageType } from '../services/chatbotService';

interface ChatMessageProps {
  message: ChatMessageType;
}

const MessageContainer = styled.div<{ isUser: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  margin-bottom: 10px;
`;

const MessageBubble = styled.div<{ isUser: boolean }>`
  background-color: ${props => props.isUser ? '#0080ff' : '#f0f0f0'};
  color: ${props => props.isUser ? 'white' : 'black'};
  padding: 10px 15px;
  border-radius: 18px;
  max-width: 80%;
  word-wrap: break-word;
`;

const Timestamp = styled.div`
  font-size: 0.7rem;
  color: #888;
  margin-top: 2px;
`;

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const formattedTime = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return (
    <MessageContainer isUser={isUser}>
      <MessageBubble isUser={isUser}>
        {message.content}
      </MessageBubble>
      <Timestamp>{formattedTime}</Timestamp>
    </MessageContainer>
  );
};

export default ChatMessage;
