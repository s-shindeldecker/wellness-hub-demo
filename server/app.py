from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import random
import os
import json
import time
from dotenv import load_dotenv
from metrics_tracker import BedrockMetricsTracker
from mock_data import (
    MOCK_PROVIDERS, 
    MOCK_SERVICES, 
    MOCK_SCHEDULE, 
    SORT_VARIATIONS, 
    MOCK_USER_SEGMENTS,
    MOCK_USERS
)
from ldclient import LDClient, Config, Context
from ldai.client import LDAIClient, AIConfig, ModelConfig, LDMessage

# Import our new client classes
from ld_client import LaunchDarklyClient
from bedrock_client import BedrockClient, create_bedrock_message, create_claude_message

# Try to import boto3, but don't fail if it's not available
try:
    import boto3
    BOTO3_AVAILABLE = True
except ImportError:
    BOTO3_AVAILABLE = False
    print("Warning: boto3 is not available. AWS Bedrock integration will be disabled.")

# Load environment variables
load_dotenv()

# Keep the original LaunchDarklyManager for backward compatibility
# This will be gradually phased out as we migrate to the new LaunchDarklyClient
class LaunchDarklyManager:
    def __init__(self, sdk_key):
        config = Config(sdk_key)
        self.client = LDClient(config=config)
        
        # Set up flag change listeners
        self.setup_flag_listeners()

    def setup_flag_listeners(self):
        """Set up listeners for flag changes"""
        print("Setting up LaunchDarkly flag change listeners")
        
        # For the Python SDK, we need to use a different approach
        # The Python SDK uses a different method for flag change listeners
        # We'll implement a polling mechanism instead
        
        # Note: In a production app, you would use the SDK's built-in
        # data source status listeners or implement a webhook endpoint
        # This is a simplified approach for the demo
        print("Flag change listeners set up (using polling approach)")

    def get_sort_variation(self, user_context):
        return self.client.variation(
            "service-sort-experiment",
            user_context,
            "variation_1"  # default variation
        )
        
    def get_image_variation(self, user_context):
        return self.client.variation(
            "provider-image-flag",
            user_context,
            "standard"  # default variation
        )
        
    def get_chatbot_enabled(self, user_context):
        # Check if the guru-guide-ai flag is enabled
        # This is a simplified approach since we don't have the AI SDK
        return self.client.variation(
            "guru-guide-ai-enabled",
            user_context,
            True  # default to enabled for testing
        )
        
    def get_ai_config(self, user_context):
        # Get the AI Config from LaunchDarkly
        return self.client.variation(
            "guru-guide-ai",
            user_context,
            None  # default to None if not configured
        )

    def track_page_view(self, user_context, page_data):
        self.client.track(
            "page_view",
            user_context,
            metric_value=1,
            data=page_data
        )

    def track_service_click(self, user_context, service_data):
        self.client.track(
            "service-click",
            user_context,
            metric_value=1,
            data=service_data
        )

    def close(self):
        # Close the client
        self.client.close()

def create_user_context(user_id, provider_id=None, user_data=None):
    # Detect if this is an anonymous ID (UUID format)
    is_anonymous = "-" in user_id  # Simple check for UUID format which contains hyphens
    
    # Create a Context object with named parameters
    context = Context(
        kind="user",
        key=user_id,
        anonymous=is_anonymous
    )
    
    # Create a dictionary of custom attributes
    custom_attributes = {
        "location": "Los Angeles",
        "timeOfDay": get_current_time_period(),
        "platform": "web"
    }
    
    # Add user segment if we have user data and it's not an anonymous user
    if not is_anonymous and user_id in MOCK_USERS:
        custom_attributes["segment"] = MOCK_USERS[user_id]["segment"]
        custom_attributes["preferences"] = MOCK_USERS[user_id]["preferences"]["favorite_activities"]
    
    # Return the context
    return context

def get_current_time_period():
    hour = datetime.now().hour
    if 0 <= hour < 12:
        return 'morning'
    elif 12 <= hour < 17:
        return 'afternoon'
    else:
        return 'evening'

# Initialize Flask app and CORS
app = Flask(__name__)
CORS(app)

# Get LaunchDarkly SDK key from environment
sdk_key = os.getenv('LAUNCHDARKLY_SDK_KEY')
if not sdk_key:
    print("Warning: LAUNCHDARKLY_SDK_KEY environment variable not found. Using dummy key.")
    sdk_key = "sdk-key-123456789"  # Dummy key for development

# Initialize LaunchDarkly clients - both old and new
ld_manager = LaunchDarklyManager(sdk_key)
ld_client = LaunchDarklyClient(sdk_key, ai_config_id="guru-guide-ai")

# Initialize AWS Bedrock client using our new BedrockClient class
bedrock_client = None
if BOTO3_AVAILABLE:
    aws_region = os.getenv('AWS_REGION', 'us-east-1')  # Default to us-east-1 if not specified
    aws_access_key = os.getenv('AWS_ACCESS_KEY_ID')
    aws_secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')

    if aws_access_key and aws_secret_key:
        bedrock_client = BedrockClient(
            region_name=aws_region,
            access_key_id=aws_access_key,
            secret_access_key=aws_secret_key
        )
        print("AWS Bedrock client initialized successfully")
    else:
        print("Warning: AWS credentials not found. Chatbot will use mock responses.")
else:
    print("Warning: boto3 is not available. Chatbot will use mock responses.")

# Keep the original bedrock_runtime for backward compatibility
bedrock_runtime = None
if BOTO3_AVAILABLE:
    aws_access_key = os.getenv('AWS_ACCESS_KEY_ID')
    aws_secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')
    aws_region = os.getenv('AWS_REGION', 'us-east-1')  # Default to us-east-1 if not specified

    if aws_access_key and aws_secret_key:
        bedrock_runtime = boto3.client(
            service_name='bedrock-runtime',
            region_name=aws_region,
            aws_access_key_id=aws_access_key,
            aws_secret_access_key=aws_secret_key
        )
        print("Original AWS Bedrock client initialized for backward compatibility")

# Initialize LaunchDarkly AI client
ldai_client = LDAIClient(ld_manager.client)

# Initialize metrics tracker for Bedrock with LaunchDarkly client (for backward compatibility)
metrics_tracker = BedrockMetricsTracker(ld_client=ld_manager.client)

# In-memory analytics storage (replace with proper database in production)
analytics_data = []

# In-memory user storage (replace with proper database in production)
registered_users = {}

@app.route('/api/providers', methods=['GET'])
def get_providers():
    # Get user context from query params
    user_id = request.args.get('userId', 'default-user')
    
    # Create user context for LaunchDarkly
    user_context = create_user_context(user_id)
    
    # Get image variation from LaunchDarkly
    image_variation = ld_manager.get_image_variation(user_context)
    print(f"Using image variation from LaunchDarkly: {image_variation}")
    
    # Return all providers with the image variation
    return jsonify({
        "providers": MOCK_PROVIDERS,
        "imageVariation": image_variation
    })

@app.route('/api/provider/<provider_id>', methods=['GET'])
def get_provider(provider_id):
    # Find the provider by ID
    for provider in MOCK_PROVIDERS:
        if provider["id"] == provider_id:
            return jsonify(provider)
    
    return jsonify({"error": "Provider not found"}), 404

@app.route('/api/services/<provider_id>', methods=['GET'])
def get_services(provider_id):
    # Get user context from query params
    user_id = request.args.get('userId', 'default-user')
    
    # Create user context for LaunchDarkly
    user_context = create_user_context(user_id, provider_id)
    
    # Always get variation from LaunchDarkly
    variation = ld_manager.get_sort_variation(user_context)
    print(f"Using variation from LaunchDarkly: {variation}")
    
    # Get the sort order for this variation
    sort_order = SORT_VARIATIONS.get(variation, SORT_VARIATIONS["variation_1"])
    
    # Sort services according to the variation
    sorted_services = {}
    for category in sort_order:
        sorted_services[category] = MOCK_SERVICES.get(category, [])
    
    response = {
        "services": sorted_services,
        "variation": variation
    }
    
    # Track the page view event
    ld_manager.track_page_view(
        user_context,
        {
            "variation": variation,
            "providerId": provider_id,
            "event": "services_page_view"
        }
    )
    
    return jsonify(response)

@app.route('/api/schedule/<provider_id>', methods=['GET'])
def get_schedule(provider_id):
    # Get time period from query params or use current time
    time_period = request.args.get('timePeriod', get_current_time_period())
    
    # Return schedule for the requested time period
    if time_period in MOCK_SCHEDULE:
        return jsonify(MOCK_SCHEDULE[time_period])
    else:
        return jsonify([])

@app.route('/api/service/select', methods=['POST'])
def select_service():
    data = request.json
    user_id = data.get('userId', 'default-user')
    provider_id = data.get('providerId')
    service_name = data.get('serviceName')
    service_category = data.get('serviceCategory')
    
    # Create user context for LaunchDarkly
    user_context = create_user_context(user_id, provider_id)
    
    # Track the service click event
    ld_manager.track_service_click(
        user_context,
        {
            "providerId": provider_id,
            "serviceName": service_name,
            "serviceCategory": service_category,
            "event": "service_selected"
        }
    )
    
    return jsonify({"status": "success"})

@app.route('/api/user/register', methods=['POST'])
def register_user():
    data = request.json
    user_id = f"user{len(registered_users) + 5}"  # Generate a new user ID
    
    # Store user data
    registered_users[user_id] = {
        "id": user_id,
        "name": data.get('name', ''),
        "email": data.get('email', ''),
        "segment": determine_user_segment(data),
        "preferences": {
            "favorite_activities": data.get('interests', []),
            "preferred_times": data.get('preferredTimes', []),
            "notifications": data.get('notifications', True)
        }
    }
    
    return jsonify({
        "status": "success",
        "userId": user_id
    })

def determine_user_segment(user_data):
    # Simple logic to determine user segment based on interests
    interests = user_data.get('interests', [])
    
    if any(interest in ["HIIT", "Strength Training", "Personal Training"] for interest in interests):
        return "fitness_enthusiast"
    elif any(interest in ["Yoga", "Meditation"] for interest in interests):
        return "wellness_seeker"
    elif any(interest in ["Massage", "Aromatherapy"] for interest in interests):
        return "stress_relief"
    else:
        return "new_to_wellness"

@app.route('/api/user/login', methods=['POST'])
def login_user():
    data = request.json
    username = data.get('username', '')
    
    # Find user by username (in a real app, would check password too)
    for user_id, user in MOCK_USERS.items():
        if user['email'] == username:
            return jsonify({
                "status": "success",
                "userId": user_id,
                "user": user
            })
    
    # If user not found in mock data, check registered users
    for user_id, user in registered_users.items():
        if user['email'] == username:
            return jsonify({
                "status": "success",
                "userId": user_id,
                "user": user
            })
    
    # Return mock user if not found (for demo purposes)
    return jsonify({
        "status": "success",
        "userId": "user2",
        "user": MOCK_USERS["user2"]
    })

@app.route('/api/user/<user_id>', methods=['GET'])
def get_user(user_id):
    # Return user data if exists
    if user_id in MOCK_USERS:
        return jsonify(MOCK_USERS[user_id])
    elif user_id in registered_users:
        return jsonify(registered_users[user_id])
    else:
        return jsonify({"error": "User not found"}), 404

@app.route('/api/user/<user_id>/recommendations', methods=['GET'])
def get_recommendations(user_id):
    # Get user segment
    user_segment = None
    if user_id in MOCK_USERS:
        user_segment = MOCK_USERS[user_id]["segment"]
    elif user_id in registered_users:
        user_segment = registered_users[user_id]["segment"]
    else:
        # Default to new_to_wellness if user not found
        user_segment = "new_to_wellness"
    
    # Get recommendations for the user segment
    if user_segment in MOCK_USER_SEGMENTS:
        return jsonify(MOCK_USER_SEGMENTS[user_segment])
    else:
        return jsonify({"error": "No recommendations available"}), 404

@app.route('/api/analytics/track', methods=['POST'])
def track_event():
    data = request.json
    
    # Add timestamp to the event data
    event_data = {
        **data,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # In production, you'd want to store this in a proper database
    analytics_data.append(event_data)
    
    return jsonify({"status": "success"})

@app.route('/api/analytics/results', methods=['GET'])
def get_analytics():
    # Simple analytics aggregation
    results = {
        "variation_1": {"clicks": 0, "views": 0},
        "variation_2": {"clicks": 0, "views": 0},
        "variation_3": {"clicks": 0, "views": 0},
        "variation_4": {"clicks": 0, "views": 0}
    }
    
    for event in analytics_data:
        variation = event.get("variation")
        event_type = event.get("type")
        
        if variation and variation in results:
            if event_type == "view":
                results[variation]["views"] += 1
            elif event_type == "click":
                results[variation]["clicks"] += 1
    
    # Calculate click-through rates
    for variation in results:
        views = results[variation]["views"]
        clicks = results[variation]["clicks"]
        ctr = (clicks / views * 100) if views > 0 else 0
        results[variation]["ctr"] = round(ctr, 2)
    
    return jsonify(results)

@app.route('/api/chatbot/metrics', methods=['GET'])
def get_chatbot_metrics():
    """
    Endpoint to retrieve metrics for the chatbot.
    This includes metrics like latency, token usage, etc.
    """
    # Get all metrics
    all_metrics = metrics_tracker.get_metrics()
    
    # Get summary metrics
    summary = metrics_tracker.get_summary_metrics()
    
    return jsonify({
        "summary": summary,
        "metrics": all_metrics
    })

@app.route('/api/chatbot/feedback', methods=['POST'])
def submit_chatbot_feedback():
    """
    Endpoint for submitting feedback on chatbot responses.
    This allows users to rate responses as helpful or not helpful.
    """
    try:
        data = request.json
        user_id = data.get('userId', 'default-user')
        is_positive = data.get('isPositive', True)  # Default to positive if not specified
        message_id = data.get('messageId')  # Optional message ID for tracking specific messages
        
        # Create user context for LaunchDarkly
        user_context = create_user_context(user_id)
        
        # Get variables for LaunchDarkly AI Config
        variables = {
            "feedback": {
                "is_positive": is_positive,
                "message_id": message_id,
                "timestamp": datetime.utcnow().isoformat()
            }
        }
        
        # Get AI Config and tracker from LaunchDarkly
        config, tracker = ld_client.get_ai_config(user_context, variables)
        
        # Send feedback using our LaunchDarklyClient
        if tracker:
            ld_client.send_feedback(tracker, is_positive)
            
            # Store feedback in analytics data for reporting
            analytics_data.append({
                "type": "chatbot_feedback",
                "userId": user_id,
                "isPositive": is_positive,
                "messageId": message_id,
                "timestamp": datetime.utcnow().isoformat()
            })
            
            return jsonify({
                "status": "success",
                "message": f"Feedback {'positive' if is_positive else 'negative'} recorded successfully"
            })
        else:
            return jsonify({
                "status": "error",
                "message": "Could not send feedback: tracker is None"
            }), 400
            
    except Exception as e:
        print(f"Error submitting feedback: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Error submitting feedback: {str(e)}"
        }), 500

@app.route('/api/chatbot/message', methods=['POST'])
def chatbot_message():
    """
    Endpoint for the chatbot that uses LaunchDarkly flag
    """
    try:
        data = request.json
        user_id = data.get('userId', 'default-user')
        messages = data.get('messages', [])
        
        # Create user context for LaunchDarkly
        user_context = create_user_context(user_id)
        
        # Check if the chatbot is enabled via LaunchDarkly
        chatbot_enabled = ld_manager.get_chatbot_enabled(user_context)
        print(f"Chatbot enabled: {chatbot_enabled}")
        
        # If the chatbot is disabled, return an error
        if not chatbot_enabled:
            return jsonify({
                "status": "error",
                "message": "Chatbot is currently disabled."
            }), 400
        
        # Extract the user message
        user_message = "No user message found"
        for msg in messages:
            if msg.get("role") == "user":
                user_message = msg.get("content")
                break
        
        # If AWS Bedrock is configured, use it with our new client classes
        if BOTO3_AVAILABLE and bedrock_client:
            try:
                # Create variables for LaunchDarkly AI Config
                variables = {
                    "user_input": user_message,
                    "conversation_history": messages
                }
                
                # Get AI Config from LaunchDarkly using our new client
                config, tracker = ld_client.get_ai_config(user_context, variables)
                
                # Extract model configuration
                model_id = config.model.name
                
                # Extract parameters from model config
                params = config.model._parameters
                inference_config = {
                    "temperature": params.get("temperature", 0.7),
                    "maxTokens": params.get("max_tokens", 1000),
                    "topP": params.get("top_p", 0.9)
                }
                
                # Extract system prompt from messages
                system_prompts = []
                if config.messages and len(config.messages) > 0:
                    for msg in config.messages:
                        if msg.role == "system":
                            system_prompts.append({"text": msg.content})
                
                # If no system prompt found, use a default
                if not system_prompts:
                    system_prompts = [{
                        "text": "You are a wellness assistant for a health and wellness platform. Provide helpful, friendly advice about wellness services, fitness, meditation, and healthy living. Keep responses concise and positive."
                    }]
                
                # Format messages based on model type
                if "amazon" in model_id.lower():
                    # Use Bedrock format for Amazon models
                    bedrock_messages = create_bedrock_message(messages, user_message)
                else:
                    # Use Claude format for Claude models
                    bedrock_messages = create_claude_message(messages, user_message)
                
                # Stream the conversation using our new client
                stream = bedrock_client.stream_conversation(
                    model_id=model_id,
                    messages=bedrock_messages,
                    system_prompts=system_prompts,
                    inference_config=inference_config
                )
                
                # Parse the stream and get the full response
                full_response = bedrock_client.parse_stream(stream, tracker)
                
                return jsonify({
                    "status": "success",
                    "message": full_response
                })
                
            except Exception as e:
                error_str = str(e)
                print(f"Error using new Bedrock client: {error_str}")
                print(f"Falling back to original implementation...")
                
                # Fall back to the original implementation
                # Get AI Config from LaunchDarkly
                ai_config = ld_manager.get_ai_config(user_context)
                print(f"Using AI Config from LaunchDarkly: {ai_config}")
                
                # Format messages for Claude
                claude_messages = []
                
                # Get persona message from AI Config or use default
                persona_message = "You are a wellness assistant for a health and wellness platform. Provide helpful, friendly advice about wellness services, fitness, meditation, and healthy living. Keep responses concise and positive."
                
                if ai_config and ai_config.get('messages'):
                    # Find persona message in AI Config - could be in 'system' or 'user' role
                    print(f"Looking for persona message in AI Config messages: {ai_config.get('messages')}")
                    for msg in ai_config.get('messages', []):
                        # Check for both 'system' and 'user' roles since the config might use either
                        if msg.get('role') in ['system', 'user']:
                            persona_message = msg.get('content', persona_message)
                            print(f"Found persona message with role '{msg.get('role')}': {persona_message[:100]}...")
                            break
                
                # Add user messages
                for msg in messages:
                    if msg.get("role") != "system":
                        claude_messages.append({
                            "role": msg.get("role", "user"),
                            "content": msg.get("content", "")
                        })
                
                # Get model settings from AI Config or use defaults
                model_id = "anthropic.claude-3-sonnet-20240229-v1:0"  # Default model ID
                print(f"Persona message to use: {persona_message[:100]}...")
                max_tokens = 1000
                temperature = 0.7
                
                if ai_config:
                    # Override with values from AI Config if available
                    if ai_config.get('model') and ai_config['model'].get('name'):
                        model_id = ai_config['model']['name']
                    elif ai_config.get('modelId'):
                        model_id = ai_config.get('modelId')
                        
                    # Get parameters from AI Config
                    if ai_config.get('model') and ai_config['model'].get('parameters'):
                        params = ai_config['model']['parameters']
                        if 'max_tokens' in params:
                            try:
                                max_tokens = int(params['max_tokens'])
                            except (ValueError, TypeError):
                                print(f"Warning: Invalid max_tokens value: {params['max_tokens']}. Using default: {max_tokens}")
                        if 'temperature' in params:
                            try:
                                temperature = float(params['temperature'])
                            except (ValueError, TypeError):
                                print(f"Warning: Invalid temperature value: {params['temperature']}. Using default: {temperature}")

                    else:
                        # Legacy format
                        max_tokens = ai_config.get('maxTokens', max_tokens)
                        temperature = ai_config.get('temperature', temperature)
                
                print(f"Using model ID from LaunchDarkly: {model_id}")
                
                # Create the request body based on the model type
                if "amazon" in model_id.lower():
                    # Amazon Nova Pro format for Converse API
                    # Convert messages to the format expected by Amazon Nova Pro Converse API
                    nova_messages = []
                    
                    # For Amazon Nova Pro, we need to handle the system message differently
                    # since it doesn't support the "system" role
                    
                    # Debug: Log the messages we're working with
                    print(f"Original messages for Amazon model: {claude_messages}")
                    print(f"Persona message: {persona_message}")
                    
                    # Create a new array for Amazon model messages
                    nova_messages = []
                    
                    # First, check if we have a persona message
                    if persona_message:
                        # Create a first user message that includes the persona instructions
                        # Format it in a way that clearly instructs the model to adopt the persona
                        persona_instruction = f"You must act as the following persona in all your responses: {persona_message}"
                        
                        # Add this as the first message
                        nova_messages.append({
                            "role": "user",
                            "content": [
                                {
                                    "text": persona_instruction
                                }
                            ]
                        })
                        
                        # Add a confirmation message from the assistant to establish the persona
                        nova_messages.append({
                            "role": "assistant",
                            "content": [
                                {
                                    "text": "I understand. I'll respond as the persona you described."
                                }
                            ]
                        })
                    
                    # Now add all the actual conversation messages
                    for msg in claude_messages:
                        # Only include user and assistant roles, as these are the only ones supported
                        if msg["role"] in ["user", "assistant"]:
                            nova_messages.append({
                                "role": msg["role"],
                                "content": [
                                    {
                                        "text": msg["content"]
                                    }
                                ]
                            })
                    
                    # Debug: Log the final messages we're sending
                    print(f"Final Amazon model messages: {nova_messages}")
                    
                    print(f"Sending messages to Amazon Nova Pro: {json.dumps(nova_messages, indent=2)}")
                    
                    # For Converse API
                    request_body = {
                        "modelId": model_id,
                        "inferenceConfig": {
                            "maxTokens": int(max_tokens),
                            "temperature": float(temperature),
                            "topP": 0.9
                        },
                        "messages": nova_messages
                    }
                else:
                    # Claude format
                    request_body = {
                        "anthropic_version": "bedrock-2023-05-31",
                        "max_tokens": max_tokens,
                        "temperature": temperature,
                        "messages": claude_messages,
                        "system": persona_message
                    }
                
                try:
                    # Create a default AIConfig
                    default_value = AIConfig(
                        enabled=True,
                        model=ModelConfig(name=model_id),
                        messages=[],
                    )
                    
                    # Get the config and tracker from LaunchDarkly
                    config_value, tracker = ldai_client.config(
                        "guru-guide-ai",  # This should match the flag key used in get_ai_config
                        user_context,
                        default_value
                    )
                    
                    # Use the appropriate API call based on the model type
                    if "amazon" in model_id.lower():
                        # Use converse API for Amazon Nova Pro
                        # Make the API call
                        response = bedrock_runtime.converse(
                            modelId=model_id,
                            messages=request_body["messages"],
                            inferenceConfig=request_body["inferenceConfig"]
                        )
                        
                        # Track metrics using the tracker from LaunchDarkly
                        response_body = tracker.track_bedrock_converse_metrics(response)
                        
                        # Also track metrics using our local metrics tracker for backward compatibility
                        metrics_tracker.track_bedrock_converse_metrics(
                            model_id=model_id,
                            request_body=request_body,
                            response=response,
                            user_context=user_context
                        )
                    else:
                        # Use invoke_model for Claude and other models
                        # Make the API call
                        response = bedrock_runtime.invoke_model(
                            modelId=model_id,
                            body=json.dumps(request_body)
                        )
                        
                        # Track metrics using the tracker from LaunchDarkly
                        response_body = tracker.track_bedrock_invoke_metrics(response)
                        
                        # Also track metrics using our local metrics tracker for backward compatibility
                        metrics_tracker.track_bedrock_invoke_metrics(
                            model_id=model_id,
                            request_body=request_body,
                            response=response,
                            user_context=user_context
                        )
                    
                    print(f"Raw response from model: {response_body}")
                    
                    if "amazon" in model_id.lower():
                        # Amazon Nova Pro response format
                        if 'output' in response_body and 'message' in response_body['output'] and 'content' in response_body['output']['message']:
                            # New format with nested content
                            response_content = response_body['output']['message']['content'][0]['text']
                            print(f"Successfully parsed response from Amazon Nova Pro: {response_content[:100]}...")
                        elif 'output' in response_body:
                            # Alternative format
                            response_content = response_body.get('output', {}).get('text', '')
                        elif 'results' in response_body:
                            # Previous format attempt
                            response_content = response_body.get('results', [{}])[0].get('outputText', '')
                        else:
                            # Fallback to mock response if we can't parse the response
                            print(f"Unable to parse response from Amazon Nova Pro: {response_body}")
                            response_content = f"""
As a wellness assistant, I'd be happy to suggest some yoga poses for beginners!

Here are some great poses to start with:

1. Mountain Pose (Tadasana) - Helps with posture and balance
2. Child's Pose (Balasana) - A restful pose that gently stretches the back
3. Downward-Facing Dog (Adho Mukha Svanasana) - Stretches the entire body
4. Cat-Cow Stretch (Marjaryasana-Bitilasana) - Great for spine flexibility
5. Warrior I (Virabhadrasana I) - Builds strength and focus

Remember to breathe deeply and move slowly. It's not about how far you can stretch, but about being mindful of your body's limits.

(Note: This is a mock response because we couldn't parse the model response.)
"""
                    else:
                        # Claude format
                        response_content = response_body['content'][0]['text']
                    
                    return jsonify({
                        "status": "success",
                        "message": response_content
                    })
                except Exception as e:
                    error_str = str(e)
                    # Handle various AWS Bedrock errors gracefully
                    if "AccessDeniedException" in error_str or "ValidationException" in error_str:
                        print(f"AWS Bedrock error: {error_str}")
                        print(f"Model ID: {model_id}")
                        print(f"AWS Region: {aws_region}")
                        print(f"AWS Access Key ID: {aws_access_key[:5]}...{aws_access_key[-4:] if aws_access_key else ''}")
                        print("Request body:", json.dumps(request_body, indent=2))
                        print("Falling back to mock response.")
                        
                        error_message = ""
                        if "AccessDeniedException" in error_str:
                            error_message = f"You don't have access to this model (ID: {model_id}). Please complete Step 2 in AWS_BEDROCK_SETUP.md to request access."
                        elif "inference profile" in error_str:
                            error_message = "This model requires an inference profile. Please create an inference profile in the AWS Bedrock console."
                        else:
                            error_message = "There was an issue with the AWS Bedrock configuration."
                        
                        # Create a friendly mock response based on the user's question
                        mock_response = f"""
As a wellness assistant, I'd be happy to suggest some yoga poses for beginners!

Here are some great poses to start with:

1. Mountain Pose (Tadasana) - Helps with posture and balance
2. Child's Pose (Balasana) - A restful pose that gently stretches the back
3. Downward-Facing Dog (Adho Mukha Svanasana) - Stretches the entire body
4. Cat-Cow Stretch (Marjaryasana-Bitilasana) - Great for spine flexibility
5. Warrior I (Virabhadrasana I) - Builds strength and focus

Remember to breathe deeply and move slowly. It's not about how far you can stretch, but about being mindful of your body's limits.

(Note: This is a mock response. {error_message})
"""
                        
                        return jsonify({
                            "status": "success",
                            "message": mock_response
                        })
                    else:
                        # For other errors, return an error
                        print(f"Error: {error_str}")
                        return jsonify({
                            "status": "error",
                            "message": f"Error generating response: {error_str}"
                        }), 500
            except Exception as e:
                # For non-AWS errors, return an error
                print(f"General error: {str(e)}")
                return jsonify({
                    "status": "error",
                    "message": f"Error generating response: {str(e)}"
                }), 500
        
        # If AWS Bedrock is not configured, use a mock response
        return jsonify({
            "status": "success",
            "message": f"This is a mock response to: '{user_message}'. AWS Bedrock integration will be implemented when credentials are available."
        })
            
    except Exception as e:
        print(f"Error in chatbot endpoint: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Server error: {str(e)}"
        }), 500

if __name__ == '__main__':
    try:
        app.run(debug=True, port=5003)
    finally:
        # Ensure LaunchDarkly clients are closed properly
        ld_manager.close()
        ld_client.close()
