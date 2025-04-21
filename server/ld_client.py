"""
LaunchDarkly Client for AI Configuration

This module provides a dedicated client for interacting with LaunchDarkly's
AI configuration capabilities. It handles retrieving AI configurations,
sending feedback, and managing fallback configurations.
"""

import os
import json
import logging
import traceback
from typing import Dict, Any, Tuple, Optional

# LaunchDarkly imports
import ldclient
from ldclient import Context
from ldclient.config import Config
from ldai.client import LDAIClient, AIConfig, ModelConfig, LDMessage, ProviderConfig
from ldai.tracker import FeedbackKind

# Set up logging
logger = logging.getLogger(__name__)

class LaunchDarklyClient:
    """Main LaunchDarkly client wrapper that handles LD and LDAI operations."""
    
    def __init__(self, server_key: str, ai_config_id: str = "guru-guide-ai"):
        """
        Initialize the LaunchDarkly client.
        
        Args:
            server_key: LaunchDarkly SDK key
            ai_config_id: The AI configuration ID to use
        """
        # Initialize LD client
        ldclient.set_config(Config(server_key))
        self.ld_client = ldclient.get()
        self.ai_client = LDAIClient(self.ld_client)
        self.ai_config_id = ai_config_id    
    
    def get_ai_config(self, user_context: Context, variables: Dict[str, Any]) -> Tuple[AIConfig, Any]:
        """
        Get the AI configuration for a specific user context with enhanced logging.
        
        Args:
            user_context: LaunchDarkly user context
            variables: Variables to pass to the AI configuration including conversation history
            
        Returns:
            Tuple containing the AI config and a tracker object
        """
        try:
            # Log the request for AI config
            logger.info(f"Requesting AI config for user: {user_context.key}")
            logger.info(f"Variables passed to AI config: {json.dumps(variables, default=str)}")
            
            # Create a fallback configuration for when the LaunchDarkly service is unavailable
            fallback_value = self.get_fallback_config()
            
            # Get the configuration and tracker
            config, tracker = self.ai_client.config(
                self.ai_config_id, 
                user_context, 
                fallback_value, 
                variables
            )
            logger.info("AI Config received from LaunchDarkly")
            logger.info(f"AI Config enabled: {config.enabled}")
            
            # Log model details
            self.print_box("MODEL DETAILS", {
                "name": config.model.name,
                "parameters": config.model._parameters
            })
            
            # Log all messages in the config
            message_logs = []
            if config.messages:
                for i, msg in enumerate(config.messages):
                    message_logs.append({
                        "index": i,
                        "role": msg.role,
                        "content": msg.content[:100] + "..." if len(msg.content) > 100 else msg.content
                    })
            self.print_box("CONFIG MESSAGES", message_logs)
            
            # Log the full system prompt for verification
            system_messages = [msg.content for msg in config.messages if msg.role == "system"]
            if system_messages:
                self.print_box("SYSTEM PROMPT (FULL)", system_messages[0])
            
            return config, tracker
        except Exception as e:
            logger.error(f"Error getting AI config: {e}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            logger.warning("Using fallback configuration")
            return self.get_fallback_config(), None
    
    def get_fallback_config(self) -> AIConfig:
        """Return a fallback configuration for when LaunchDarkly is unavailable."""
        return AIConfig(
            enabled=True,
            model=ModelConfig(
                name="anthropic.claude-3-sonnet-20240229-v1:0",  # Updated to newer Claude model
                parameters={
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "max_tokens": 1000
                },
            ),
            messages=[
                LDMessage(role="system", content="You are a helpful wellness assistant for a health and wellness platform. Provide helpful, friendly advice about wellness services, fitness, meditation, and healthy living. Keep responses concise and positive.")
            ],
            provider=ProviderConfig(name="bedrock"),
        )
    
    def send_feedback(self, tracker, is_positive: bool) -> None:
        """
        Send user feedback to LaunchDarkly.
        
        Args:
            tracker: The LaunchDarkly tracker object
            is_positive: Whether the feedback is positive or negative
        """
        if tracker:
            if is_positive:
                tracker.track_feedback({"kind": FeedbackKind.Positive})
            else:
                tracker.track_feedback({"kind": FeedbackKind.Negative})
            logger.info(f"Feedback sent: {'positive' if is_positive else 'negative'}")
        else:
            logger.warning("Cannot send feedback: tracker is None")
    
    def print_box(self, title, content):
        """Print content in a styled box for terminal output."""
        import shutil
        
        # Get terminal width
        terminal_width = shutil.get_terminal_size().columns
        max_content_width = terminal_width - 4  # Account for box borders and padding
        
        # Convert content to list of strings if it's not already a list
        content_lines = content if isinstance(content, list) else [content]
        content_str_lines = [str(item) for item in content_lines]
        
        # Calculate initial width based on content and title
        width = min(max(len(title), max(len(line) for line in content_str_lines)) + 4, terminal_width)
        
        # Wrap long content lines to fit terminal
        wrapped_lines = []
        for line in content_str_lines:
            if len(line) > max_content_width:
                # Simple wrapping - split at max width
                for i in range(0, len(line), max_content_width):
                    wrapped_lines.append(line[i:i+max_content_width])
            else:
                wrapped_lines.append(line)
    
        # Print the box
        print('┌' + '─' * (width - 2) + '┐')
        print(f'│ {title[:max_content_width].ljust(width - 4)} │')
        print('├' + '─' * (width - 2) + '┤')
        
        for line in wrapped_lines:
            print(f'│ {line[:max_content_width].ljust(width - 4)} │')
        
        print('└' + '─' * (width - 2) + '┘')
    
    def close(self):
        """Close the LaunchDarkly client."""
        if self.ld_client:
            self.ld_client.close()
