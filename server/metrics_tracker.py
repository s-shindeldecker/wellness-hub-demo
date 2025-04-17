import time
import json
from datetime import datetime
from typing import Dict, Any, Callable, Optional, List

# Import LaunchDarkly AI SDK
import ldclient
from ldclient import Context
from ldclient.config import Config
from ldai.client import LDAIClient, AIConfig, ModelConfig, LDMessage, ProviderConfig


class BedrockMetricsTracker:
    """
    A class to track metrics for AWS Bedrock model invocations.
    This helps monitor performance, latency, and other metrics for AI model usage.
    
    Metrics are sent to LaunchDarkly using the LaunchDarkly AI SDK.
    """
    
    def __init__(self, ld_client=None):
        self.metrics = []
        self.ld_client = ld_client
    
    def track_bedrock_invoke_metrics(self, model_id, request_body, response, user_context=None):
        """
        Track metrics for a Bedrock invoke_model call.
        
        Args:
            model_id (str): The ID of the model being invoked
            request_body (dict): The request body sent to the model
            response: The response from the model API call
            user_context (dict, optional): The LaunchDarkly user context for tracking
        Returns:
            The response from the model
        """
        start_time = time.time()
        start_datetime = datetime.utcnow().isoformat()
        end_time = time.time()
        
        # Record request metrics
        request_metrics = {
            "model_id": model_id,
            "request_timestamp": start_datetime,
            "request_size_bytes": len(json.dumps(request_body)),
            "input_token_estimate": self._estimate_tokens(request_body),
        }
        
        try:
            # Parse the response - handle different response formats
            if 'body' in response and hasattr(response['body'], 'read'):
                response_body = json.loads(response['body'].read())
            elif 'body' in response and isinstance(response['body'], str):
                response_body = json.loads(response['body'])
            else:
                # If the response is already parsed
                response_body = response
            
            # Record response metrics
            metrics = {
                **request_metrics,
                "status": "success",
                "latency_ms": int((end_time - start_time) * 1000),
                "response_timestamp": datetime.utcnow().isoformat(),
                "response_size_bytes": len(json.dumps(response_body)),
                "output_token_estimate": self._estimate_output_tokens(response_body, model_id),
            }
            
            self.metrics.append(metrics)
            print(f"Tracked metrics for {model_id}: Latency {metrics['latency_ms']}ms")
            
            # Note: LaunchDarkly AI SDK integration is now handled directly in app.py
            # This local metrics tracker is kept for backward compatibility
            
            return response_body
            
        except Exception as e:
            # Record error metrics
            metrics = {
                **request_metrics,
                "status": "error",
                "error": str(e),
                "latency_ms": int((end_time - start_time) * 1000),
                "response_timestamp": datetime.utcnow().isoformat(),
            }
            
            self.metrics.append(metrics)
            print(f"Error tracking metrics for {model_id}: {str(e)}")
            raise e
    
    def track_bedrock_converse_metrics(self, model_id, request_body, response, user_context=None):
        """
        Track metrics for a Bedrock converse call.
        
        Args:
            model_id (str): The ID of the model being used
            request_body (dict): The full request body sent to the model
            response: The response from the model API call
            user_context (dict, optional): The LaunchDarkly user context for tracking
        Returns:
            The response from the model
        """
        start_time = time.time()
        start_datetime = datetime.utcnow().isoformat()
        end_time = time.time()
        
        # Record request metrics
        request_metrics = {
            "model_id": model_id,
            "request_timestamp": start_datetime,
            "request_size_bytes": len(json.dumps(request_body)),
            "input_token_estimate": self._estimate_tokens(request_body),
            "api_type": "converse"
        }
        
        try:
            # Parse the response - handle different response formats
            if 'body' in response and hasattr(response['body'], 'read'):
                response_body = json.loads(response['body'].read())
            elif 'body' in response and isinstance(response['body'], str):
                response_body = json.loads(response['body'])
            else:
                # If the response is already parsed
                response_body = response
            
            # Record response metrics
            metrics = {
                **request_metrics,
                "status": "success",
                "latency_ms": int((end_time - start_time) * 1000),
                "response_timestamp": datetime.utcnow().isoformat(),
                "response_size_bytes": len(json.dumps(response_body)),
                "output_token_estimate": self._estimate_output_tokens_converse(response_body),
            }
            
            self.metrics.append(metrics)
            print(f"Tracked metrics for {model_id} (converse): Latency {metrics['latency_ms']}ms")
            
            # Note: LaunchDarkly AI SDK integration is now handled directly in app.py
            # This local metrics tracker is kept for backward compatibility
            
            return response_body
            
        except Exception as e:
            # Record error metrics
            metrics = {
                **request_metrics,
                "status": "error",
                "error": str(e),
                "latency_ms": int((end_time - start_time) * 1000),
                "response_timestamp": datetime.utcnow().isoformat(),
            }
            
            self.metrics.append(metrics)
            print(f"Error tracking metrics for {model_id} (converse): {str(e)}")
            raise e
    def _extract_text_from_request(self, request_body: Dict[str, Any]) -> str:
        """
        Extract text from a request body for Claude or other models.
        
        Args:
            request_body (dict): The request body
            
        Returns:
            str: The extracted text
        """
        text = ""
        
        # Handle different request formats
        if "messages" in request_body:
            # Handle messages format (for chat models)
            for msg in request_body.get("messages", []):
                if isinstance(msg, dict):
                    if "content" in msg:
                        if isinstance(msg["content"], str):
                            text += f"{msg.get('role', 'user')}: {msg['content']}\n"
                        elif isinstance(msg["content"], list):
                            for content_item in msg["content"]:
                                if isinstance(content_item, dict) and "text" in content_item:
                                    text += f"{msg.get('role', 'user')}: {content_item['text']}\n"
        
        # Handle system message if present
        if "system" in request_body and request_body["system"]:
            text = f"system: {request_body['system']}\n" + text
            
        return text
    
    def _extract_text_from_converse_request(self, request_body: Dict[str, Any]) -> str:
        """
        Extract text from a converse request body.
        
        Args:
            request_body (dict): The request body
            
        Returns:
            str: The extracted text
        """
        text = ""
        
        # Extract messages from the request body
        messages = request_body.get("messages", [])
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", [])
            
            if isinstance(content, list):
                for content_item in content:
                    if isinstance(content_item, dict) and "text" in content_item:
                        text += f"{role}: {content_item['text']}\n"
            elif isinstance(content, str):
                text += f"{role}: {content}\n"
        
        return text
    
    def _extract_text_from_response(self, response_body: Dict[str, Any], model_id: str) -> str:
        """
        Extract text from a response body.
        
        Args:
            response_body (dict): The response body
            model_id (str): The model ID
            
        Returns:
            str: The extracted text
        """
        text = ""
        
        # Handle different response formats based on model
        if "amazon" in model_id.lower():
            # Amazon Nova Pro format
            if 'output' in response_body and 'message' in response_body['output'] and 'content' in response_body['output']['message']:
                content = response_body['output']['message']['content']
                if isinstance(content, list) and len(content) > 0 and 'text' in content[0]:
                    text = content[0]['text']
        else:
            # Claude format
            if 'content' in response_body and len(response_body['content']) > 0 and 'text' in response_body['content'][0]:
                text = response_body['content'][0]['text']
        
        return text
    
    def _extract_text_from_converse_response(self, response_body: Dict[str, Any]) -> str:
        """
        Extract text from a converse response body.
        
        Args:
            response_body (dict): The response body from converse API
            
        Returns:
            str: The extracted text
        """
        text = ""
        
        # Handle the converse API response format
        if 'output' in response_body:
            output = response_body['output']
            
            # Check for message in output
            if 'message' in output:
                message = output['message']
                
                # Extract text from content
                if 'content' in message and isinstance(message['content'], list):
                    for content_item in message['content']:
                        if isinstance(content_item, dict) and 'text' in content_item:
                            text += content_item['text'] + " "
        
        return text
        
    def _estimate_tokens(self, request_body):
        """
        Estimate the number of tokens in the request.
        This is a very rough estimate based on word count.
        
        Args:
            request_body (dict): The request body
            
        Returns:
            int: Estimated token count
        """
        # Extract text from request body
        text = ""
        
        # Handle different request formats
        if "messages" in request_body:
            # Handle messages format (for chat models)
            for msg in request_body["messages"]:
                if isinstance(msg, dict):
                    if "content" in msg:
                        if isinstance(msg["content"], str):
                            text += msg["content"] + " "
                        elif isinstance(msg["content"], list):
                            for content_item in msg["content"]:
                                if isinstance(content_item, dict) and "text" in content_item:
                                    text += content_item["text"] + " "
        
        # Very rough token estimate (4 chars per token is a common approximation)
        return max(1, len(text) // 4)
    
    def _estimate_output_tokens(self, response_body, model_id):
        """
        Estimate the number of tokens in the response from invoke_model.
        
        Args:
            response_body (dict): The response body
            model_id (str): The model ID
            
        Returns:
            int: Estimated token count
        """
        text = ""
        
        # Handle different response formats based on model
        if "amazon" in model_id.lower():
            # Amazon Nova Lite format
            if 'output' in response_body and 'message' in response_body['output'] and 'content' in response_body['output']['message']:
                content = response_body['output']['message']['content']
                if isinstance(content, list) and len(content) > 0 and 'text' in content[0]:
                    text = content[0]['text']
        else:
            # Claude format
            if 'content' in response_body and len(response_body['content']) > 0 and 'text' in response_body['content'][0]:
                text = response_body['content'][0]['text']
        
        # Very rough token estimate (4 chars per token is a common approximation)
        return max(1, len(text) // 4)
    
    def _estimate_output_tokens_converse(self, response_body):
        """
        Estimate the number of tokens in the response from converse API.
        
        Args:
            response_body (dict): The response body from converse API
            
        Returns:
            int: Estimated token count
        """
        text = ""
        
        # Handle the converse API response format
        if 'output' in response_body:
            output = response_body['output']
            
            # Check for message in output
            if 'message' in output:
                message = output['message']
                
                # Extract text from content
                if 'content' in message and isinstance(message['content'], list):
                    for content_item in message['content']:
                        if isinstance(content_item, dict) and 'text' in content_item:
                            text += content_item['text'] + " "
        
        # Very rough token estimate (4 chars per token is a common approximation)
        return max(1, len(text) // 4)
        
    def get_metrics(self):
        """
        Get all metrics tracked so far.
        
        Returns:
            list: All metrics tracked
        """
        return self.metrics
    
    def get_summary_metrics(self):
        """
        Get summary metrics (average latency, total tokens, etc.)
        
        Returns:
            dict: Summary metrics
        """
        if not self.metrics:
            return {
                "total_requests": 0,
                "avg_latency_ms": 0,
                "total_input_tokens": 0,
                "total_output_tokens": 0,
                "success_rate": 0
            }
        
        total_requests = len(self.metrics)
        successful_requests = sum(1 for m in self.metrics if m.get("status") == "success")
        
        # Calculate averages and totals
        avg_latency = sum(m.get("latency_ms", 0) for m in self.metrics) / total_requests
        total_input_tokens = sum(m.get("input_token_estimate", 0) for m in self.metrics)
        total_output_tokens = sum(m.get("output_token_estimate", 0) for m in self.metrics if m.get("status") == "success")
        
        return {
            "total_requests": total_requests,
            "avg_latency_ms": round(avg_latency, 2),
            "total_input_tokens": total_input_tokens,
            "total_output_tokens": total_output_tokens,
            "success_rate": round(successful_requests / total_requests * 100, 2) if total_requests > 0 else 0
        }
