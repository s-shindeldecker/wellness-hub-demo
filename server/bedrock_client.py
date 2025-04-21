"""
AWS Bedrock Client for AI Integration

This module provides a dedicated client for interacting with AWS Bedrock
generative AI models. It handles streaming responses, message formatting,
and metrics tracking for different model types.
"""

import os
import json
import logging
import time
import traceback
import boto3
from botocore.exceptions import ClientError
from typing import Dict, List, Any, Generator, Tuple, Optional, Union

# Set up logging
logger = logging.getLogger(__name__)

class BedrockClient:
    """Client for AWS Bedrock service with generative AI capabilities."""
    
    def __init__(self, region_name: str = None, access_key_id: str = None, secret_access_key: str = None):
        """
        Initialize the Bedrock client.
        
        Args:
            region_name: AWS region name, defaults to environment variable
            access_key_id: AWS access key ID, defaults to environment variable
            secret_access_key: AWS secret access key, defaults to environment variable
        """
        self.region_name = region_name or os.getenv("AWS_REGION")
        self.access_key_id = access_key_id or os.getenv("AWS_ACCESS_KEY_ID")
        self.secret_access_key = secret_access_key or os.getenv("AWS_SECRET_ACCESS_KEY")
        
        # Add timeouts to prevent hanging requests
        self.client = boto3.client(
            service_name='bedrock-runtime', 
            region_name=self.region_name,
            aws_access_key_id=self.access_key_id,
            aws_secret_access_key=self.secret_access_key
        )
        
        logger.info(f"Initialized Bedrock client for region {self.region_name}")
    
    def stream_conversation(self,
                    model_id: str,
                    messages: List[Dict[str, Any]],
                    system_prompts: List[Dict[str, str]],
                    inference_config: Dict[str, Any],
                    additional_model_fields: Dict[str, Any] = None) -> Generator:
        """
        Sends messages to a model and streams the response with enhanced logging.
        
        Args:
            model_id: The model ID to use
            messages: The messages to send
            system_prompts: The system prompts to send
            inference_config: The inference configuration to use
            additional_model_fields: Additional model fields to use
            
        Returns:
            Stream object for processing response chunks
        """
        logger.info(f"Streaming messages with model {model_id}")
        
        # Log the full request details
        logger.info(f"Inference config: {json.dumps(inference_config, default=str)}")
        
        # Log the system prompts in full
        if system_prompts and len(system_prompts) > 0:
            for i, prompt in enumerate(system_prompts):
                logger.info(f"System prompt {i+1}: {json.dumps(prompt, default=str)}")
        else:
            logger.warning("No system prompts provided")
        
        # Log the messages being sent (truncate long messages for readability)
        formatted_messages = []
        for i, msg in enumerate(messages):
            content = msg.get('content', '')
            if isinstance(content, str) and len(content) > 200:
                content_preview = content[:200] + "..."
            elif isinstance(content, list):
                content_preview = [
                    {k: (v[:200] + "..." if isinstance(v, str) and len(v) > 200 else v) 
                     for k, v in item.items()}
                    for item in content
                ]
            else:
                content_preview = content
                
            formatted_messages.append({
                "index": i,
                "role": msg.get('role', 'unknown'),
                "content": content_preview
            })
        
        logger.info(f"Messages being sent: {json.dumps(formatted_messages, default=str)}")
        
        # Ensure numeric parameters are properly converted to their respective types
        inference_config = self._convert_numeric_params(inference_config)
        
        # Prepare parameters based on model type
        if "amazon" in model_id.lower():
            # Amazon models use the converse_stream API
            params = {
                'modelId': model_id,
                'messages': messages,
                'inferenceConfig': inference_config
            }
            
            # Add system if provided and supported by the model
            if system_prompts and len(system_prompts) > 0:
                # For Amazon models, system must be a list of dictionaries
                formatted_system_prompts = self._format_system_prompts(system_prompts)
                if formatted_system_prompts:
                    params['system'] = formatted_system_prompts
                    logger.info(f"Formatted system prompts for Amazon: {json.dumps(formatted_system_prompts, default=str)}")
            
            # Add additional fields if provided
            if additional_model_fields:
                params['additionalModelRequestFields'] = additional_model_fields
            
            # Log the final parameters for debugging
            logger.info(f"Amazon model final parameters: {json.dumps(params, default=str)}")
            
            # Call the converse_stream API
            response = self.client.converse_stream(**params)
            return response.get('stream')
        else:
            # Claude and other models use the invoke_model_with_response_stream API
            # Format the request body
            request_body = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": inference_config.get("maxTokens", 1000),
                "temperature": inference_config.get("temperature", 0.7),
                "messages": messages
            }
            
            # Add system prompt if provided
            if system_prompts and len(system_prompts) > 0:
                system_text = system_prompts[0].get('text', '')
                if system_text:
                    request_body["system"] = system_text
                    logger.info(f"Using system prompt for Claude: {system_text}")
            
            # Add top_p if provided
            if "topP" in inference_config:
                request_body["top_p"] = inference_config["topP"]
            
            # Add additional fields if provided
            if additional_model_fields:
                request_body.update(additional_model_fields)
            
            # Log the final request body for debugging
            logger.info(f"Claude model final request body: {json.dumps(request_body, default=str)}")
            
            # Call the invoke_model_with_response_stream API
            response = self.client.invoke_model_with_response_stream(
                modelId=model_id,
                body=json.dumps(request_body)
            )
            return response.get('body')
    
    def _convert_numeric_params(self, inference_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert numeric parameters to their proper types.
        
        Args:
            inference_config: The inference configuration
            
        Returns:
            Updated inference configuration with proper types
        """
        # Create a copy to avoid modifying the original
        config = inference_config.copy()
        
        # Convert temperature to float
        if "temperature" in config:
            if isinstance(config["temperature"], str):
                try:
                    config["temperature"] = float(config["temperature"])
                except (ValueError, TypeError):
                    logger.warning(f"Invalid temperature value: {config['temperature']}. Using default: 0.7")
                    config["temperature"] = 0.7
        
        # Convert maxTokens to int
        if "maxTokens" in config:
            if isinstance(config["maxTokens"], str):
                try:
                    config["maxTokens"] = int(config["maxTokens"])
                except (ValueError, TypeError):
                    logger.warning(f"Invalid maxTokens value: {config['maxTokens']}. Using default: 1000")
                    config["maxTokens"] = 1000
        
        # Convert topP to float
        if "topP" in config:
            if isinstance(config["topP"], str):
                try:
                    config["topP"] = float(config["topP"])
                except (ValueError, TypeError):
                    logger.warning(f"Invalid topP value: {config['topP']}. Using default: 0.9")
                    config["topP"] = 0.9
        
        return config
    
    def _format_system_prompts(self, system_prompts: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """
        Format system prompts for the Bedrock API.
        
        Args:
            system_prompts: The system prompts to format
            
        Returns:
            Formatted system prompts
        """
        formatted_prompts = []
        
        for prompt in system_prompts:
            # If it's already a dict with a 'text' key, use it as is
            if isinstance(prompt, dict) and "text" in prompt:
                formatted_prompts.append(prompt)
            # If it's a string, wrap it in a dict with a 'text' key
            elif isinstance(prompt, str):
                formatted_prompts.append({"text": prompt})
            # If it's a dict without a 'text' key but with a 'content' key, convert it
            elif isinstance(prompt, dict) and "content" in prompt:
                formatted_prompts.append({"text": prompt["content"]})
        
        # If we have no formatted prompts but had input prompts, create a default one
        if not formatted_prompts and system_prompts:
            # Try to extract text from the first prompt in any format
            if isinstance(system_prompts[0], dict):
                for key in ["text", "content", "message"]:
                    if key in system_prompts[0]:
                        formatted_prompts.append({"text": system_prompts[0][key]})
                        break
            elif isinstance(system_prompts[0], str):
                formatted_prompts.append({"text": system_prompts[0]})
        
        return formatted_prompts

    def parse_stream(self, stream, tracker=None) -> Generator[str, None, str]:
        """
        Process streaming response from Bedrock with enhanced logging.
        
        Args:
            stream: Bedrock stream response
            tracker: LaunchDarkly tracker for metrics
            
        Yields:
            Message chunks for streaming display
            
        Returns:
            Complete response text
        """
        full_response = ""
        metric_response = {}
        metric_response["$metadata"] = {
            "httpStatusCode": 200
        }
        
        # Add timing metrics
        start_time = time.time()
        first_token_time = None
        
        logger.info("Starting to parse response stream")
        
        try:
            for event in stream:
                # Handle different event types
                if 'messageStart' in event:
                    logger.info(f"Role: {event['messageStart']['role']}")

                if 'contentBlockDelta' in event:            
                    message = event['contentBlockDelta']['delta']['text']
                    # Record time of first token if not already set
                    if first_token_time is None:
                        first_token_time = time.time()
                        time_to_first_token = (first_token_time - start_time) * 1000
                        logger.info(f"Time to first token: {time_to_first_token} ms")
                        
                        # Add to metrics
                        if "metrics" not in metric_response:
                            metric_response["metrics"] = {}
                        metric_response["metrics"]["timeToFirstToken"] = time_to_first_token
                    
                    # Log the message chunk (first 50 chars)
                    logger.info(f"Received message chunk: {message[:50]}..." if len(message) > 50 else message)
                    
                    full_response += message
                    yield message  # return output so it can be rendered immediately

                # Handle Claude-style chunks
                elif 'chunk' in event:
                    chunk_obj = json.loads(event['chunk']['bytes'].decode())
                    if 'completion' in chunk_obj:
                        message = chunk_obj['completion']
                        # Record time of first token if not already set
                        if first_token_time is None:
                            first_token_time = time.time()
                            time_to_first_token = (first_token_time - start_time) * 1000
                            logger.info(f"Time to first token: {time_to_first_token} ms")
                            
                            # Add to metrics
                            if "metrics" not in metric_response:
                                metric_response["metrics"] = {}
                            metric_response["metrics"]["timeToFirstToken"] = time_to_first_token
                        
                        # Log the message chunk (first 50 chars)
                        logger.info(f"Received Claude chunk: {message[:50]}..." if len(message) > 50 else message)
                        
                        full_response += message
                        yield message  # return output so it can be rendered immediately

                if 'messageStop' in event:
                    logger.info(f"Stop reason: {event['messageStop']['stopReason']}")

                if 'metadata' in event:
                    metadata = event['metadata']
                    if 'usage' in metadata:
                        logger.info("Token usage")
                        logger.info(f"Input tokens: {metadata['usage']['inputTokens']}")
                        logger.info(f"Output tokens: {metadata['usage']['outputTokens']}")
                        logger.info(f"Total tokens: {metadata['usage']['totalTokens']}")
                        metric_response["usage"] = metadata['usage']
                    if 'metrics' in event['metadata']:
                        logger.info(f"Latency (Total Time for Response): {metadata['metrics']['latencyMs']} milliseconds")
                        if "metrics" not in metric_response:
                            metric_response["metrics"] = {}
                        metric_response["metrics"]["latencyMs"] = metadata['metrics']['latencyMs']
            
            # Log the full response
            logger.info(f"Full response length: {len(full_response)}")
            logger.info(f"Full response preview: {full_response[:200]}...")
            
            # Send metrics to tracker if provided
            if tracker:
                # Track AWS converse metrics
                logger.info("Tracking metrics with LaunchDarkly tracker")
                tracker.track_bedrock_converse_metrics(metric_response)
                
                # Track success response
                tracker.track_success()
                
                # Track AI metrics individually to LaunchDarkly
                if "metrics" in metric_response and "timeToFirstToken" in metric_response["metrics"]:
                    tracker.track_time_to_first_token(metric_response["metrics"]["timeToFirstToken"])
            
            return full_response
            
        except Exception as e:
            error_str = str(e)
            logger.error(f"Error parsing stream: {error_str}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            
            # Return what we have so far
            if full_response:
                return full_response
            else:
                return f"Error generating response: {error_str}"

def create_bedrock_message(message_history: List[Dict[str, str]], current_prompt: str) -> List[Dict[str, Any]]:
    """
    Create a message array for Bedrock API that includes conversation history.
    
    Args:
        message_history: Previous messages in the conversation
        current_prompt: The current user input text
        
    Returns:
        Message array formatted for Bedrock
    """
    # Convert the conversation history to Bedrock format
    bedrock_messages = []
    
    # Add historical messages first (limited to last 10 to avoid context length issues)
    for msg in message_history[-10:]:
        role = "user" if msg["role"] == "user" else "assistant"
        bedrock_messages.append({
            "role": role,
            "content": [{"text": msg["content"]}]
        })
    
    # Add the current user message
    bedrock_messages.append({
        "role": "user",
        "content": [{"text": current_prompt}]
    })
    
    return bedrock_messages

def create_claude_message(message_history: List[Dict[str, str]], current_prompt: str) -> List[Dict[str, Any]]:
    """
    Create a message array for Claude models that includes conversation history.
    
    Args:
        message_history: Previous messages in the conversation
        current_prompt: The current user input text
        
    Returns:
        Message array formatted for Claude
    """
    # Convert the conversation history to Claude format
    claude_messages = []
    
    # Add historical messages first (limited to last 10 to avoid context length issues)
    for msg in message_history[-10:]:
        role = "user" if msg["role"] == "user" else "assistant"
        claude_messages.append({
            "role": role,
            "content": msg["content"]
        })
    
    # Add the current user message
    claude_messages.append({
        "role": "user",
        "content": current_prompt
    })
    
    return claude_messages
