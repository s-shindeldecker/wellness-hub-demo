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
        Sends messages to a model and streams the response.
        
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
                # Extract text from system prompts
                system_text = system_prompts[0].get('text', '')
                if system_text:
                    params['system'] = system_text
            
            # Add additional fields if provided
            if additional_model_fields:
                params['additionalModelRequestFields'] = additional_model_fields
            
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
            
            # Add top_p if provided
            if "topP" in inference_config:
                request_body["top_p"] = inference_config["topP"]
            
            # Add additional fields if provided
            if additional_model_fields:
                request_body.update(additional_model_fields)
            
            # Call the invoke_model_with_response_stream API
            response = self.client.invoke_model_with_response_stream(
                modelId=model_id,
                body=json.dumps(request_body)
            )
            return response.get('body')

    def parse_stream(self, stream, tracker=None) -> Generator[str, None, str]:
        """
        Process streaming response from Bedrock.
        
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
        logger.info(f"Full response: {full_response[:100]}...")
        
        # Send metrics to tracker if provided
        if tracker:
            # Track AWS converse metrics
            tracker.track_bedrock_converse_metrics(metric_response)
            
            # Track success response
            tracker.track_success()
            
            # Track AI metrics individually to LaunchDarkly
            if "metrics" in metric_response and "timeToFirstToken" in metric_response["metrics"]:
                tracker.track_time_to_first_token(metric_response["metrics"]["timeToFirstToken"])
        
        return full_response

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
