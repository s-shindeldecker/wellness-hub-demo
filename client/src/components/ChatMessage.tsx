import React, { useState } from 'react';
import styled from 'styled-components';
import { ChatMessage as ChatMessageType } from '../services/chatbotService';

interface ChatMessageProps {
  message: ChatMessageType;
  onFeedbackSubmit?: (messageId: string, isPositive: boolean) => void;
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

const FeedbackContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 5px;
  gap: 10px;
`;

const FeedbackQuestion = styled.span`
  font-size: 0.8rem;
  color: #666;
`;

const FeedbackButton = styled.button<{ isPositive?: boolean, selected?: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 2px 5px;
  border-radius: 4px;
  transition: all 0.2s ease;
  color: ${props => props.selected ? (props.isPositive ? '#4CAF50' : '#F44336') : '#888'};
  
  &:hover {
    background-color: #f0f0f0;
    color: ${props => props.isPositive ? '#4CAF50' : '#F44336'};
  }
`;

const FeedbackMessage = styled.span<{ isPositive: boolean }>`
  font-size: 0.8rem;
  color: ${props => props.isPositive ? '#4CAF50' : '#F44336'};
  margin-left: 5px;
`;

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onFeedbackSubmit }) => {
  const isUser = message.role === 'user';
  const formattedTime = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(message.feedbackSubmitted || false);
  const [feedbackPositive, setFeedbackPositive] = useState(message.feedbackPositive);
  
  const handleFeedback = (isPositive: boolean) => {
    if (onFeedbackSubmit && !feedbackSubmitted) {
      onFeedbackSubmit(message.id, isPositive);
      setFeedbackSubmitted(true);
      setFeedbackPositive(isPositive);
    }
  };
  
  return (
    <MessageContainer isUser={isUser}>
      <MessageBubble isUser={isUser}>
        {message.content}
      </MessageBubble>
      <Timestamp>{formattedTime}</Timestamp>
      
      {/* Only show feedback for assistant messages */}
      {!isUser && (
        <FeedbackContainer>
          {!feedbackSubmitted ? (
            <>
              <FeedbackQuestion>Was this helpful?</FeedbackQuestion>
              <FeedbackButton 
                isPositive={true} 
                onClick={() => handleFeedback(true)}
                aria-label="Thumbs up"
              >
                👍
              </FeedbackButton>
              <FeedbackButton 
                isPositive={false} 
                onClick={() => handleFeedback(false)}
                aria-label="Thumbs down"
              >
                👎
              </FeedbackButton>
            </>
          ) : (
            <FeedbackMessage isPositive={feedbackPositive || false}>
              {feedbackPositive ? 'Thanks for your feedback!' : 'Thanks for your feedback. We\'ll try to improve.'}
            </FeedbackMessage>
          )}
        </FeedbackContainer>
      )}
    </MessageContainer>
  );
};

export default ChatMessage;
