import React, { useState } from 'react';
import styled from 'styled-components';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const InputContainer = styled.div`
  display: flex;
  padding: 10px;
  border-top: 1px solid #e0e0e0;
  background-color: white;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 20px;
  outline: none;
  
  &:focus {
    border-color: #0080ff;
  }
`;

const SendButton = styled.button`
  background-color: #0080ff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  margin-left: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };
  
  return (
    <InputContainer>
      <form onSubmit={handleSubmit} style={{ display: 'flex', width: '100%' }}>
        <Input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={isLoading}
        />
        <SendButton type="submit" disabled={!message.trim() || isLoading}>
          →
        </SendButton>
      </form>
    </InputContainer>
  );
};

export default ChatInput;
