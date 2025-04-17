import { LDClient } from 'launchdarkly-react-client-sdk';
import axios from 'axios';
import { getAnonymousUserId } from './userIdentity';

// Message type definition
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  feedbackSubmitted?: boolean;
  feedbackPositive?: boolean;
}

export class ChatbotService {
  private ldClient: LDClient;
  private apiUrl: string = 'http://localhost:5003'; // Backend API URL
  
  constructor(ldClient: LDClient) {
    this.ldClient = ldClient;
  }
  
  // Send a message to the AI and get a response
  async sendMessage(messages: ChatMessage[]): Promise<string> {
    try {
      // Use the current session ID
      const userId = getAnonymousUserId();
      console.log('Using session ID for chatbot request:', userId);
      
      // Format messages for the server
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Call the server endpoint
      console.log('Sending message to server:', formattedMessages);
      const response = await axios.post(`${this.apiUrl}/api/chatbot/message`, {
        userId,
        messages: formattedMessages
      });
      
      console.log('Response from server:', response.data);
      
      // Check if the response is successful
      if (response.data.status === 'success') {
        console.log('Successful response, returning message:', response.data.message);
        return response.data.message;
      } else {
        console.error('Error from server:', response.data.message);
        return `Error: ${response.data.message}`;
      }
    } catch (error) {
      console.error('Error sending message to server:', error);
      return 'Sorry, there was an error processing your request. Please try again later.';
    }
  }
  
  // Send feedback for a message
  async sendFeedback(messageId: string, isPositive: boolean): Promise<boolean> {
    try {
      // Use the current session ID
      const userId = getAnonymousUserId();
      console.log('Sending feedback for message:', messageId, 'isPositive:', isPositive);
      
      // Call the server endpoint
      const response = await axios.post(`${this.apiUrl}/api/chatbot/feedback`, {
        userId,
        messageId,
        isPositive
      });
      
      console.log('Feedback response from server:', response.data);
      
      // Check if the response is successful
      if (response.data.status === 'success') {
        console.log('Feedback submitted successfully');
        return true;
      } else {
        console.error('Error submitting feedback:', response.data.message);
        return false;
      }
    } catch (error) {
      console.error('Error sending feedback to server:', error);
      return false;
    }
  }
}
