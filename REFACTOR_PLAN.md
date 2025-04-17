# AI Configuration Refactoring Plan

## Goals
- Improve model type handling with a more unified approach
- Implement streaming support for responses
- Better separation of concerns with dedicated classes
- Enhanced metrics tracking integrated with LaunchDarkly

## Current Implementation Analysis
The current implementation in the wellness-hub-demo has:
- AWS Bedrock integration directly in app.py
- Separate code paths for different model types (Claude vs Amazon)
- Limited streaming support
- Complex conditional logic for message handling

## Target Implementation
Based on the ai-chatbot.py implementation, we aim to create:
- A dedicated `LaunchDarklyClient` class for AI configuration
- A dedicated `BedrockClient` class for AWS Bedrock integration
- Unified streaming interface for all model types
- Cleaner message handling and response parsing

## Phases

### Phase 1: Core Classes (Estimated: 8-10 hours)
- Create `LaunchDarklyClient` class based on ai-chatbot.py
- Create `BedrockClient` class for AWS Bedrock integration
- Implement fallback configuration system
- Update main application to use these new classes

### Phase 2: Streaming Support (Estimated: 4-5 hours)
- Implement streaming response handling
- Add support for incremental display of responses
- Ensure metrics are properly tracked during streaming

### Phase 3: Message Handling (Estimated: 3-4 hours)
- Implement cleaner message creation functions
- Standardize approach to handling system prompts
- Simplify response parsing logic

### Phase 4: Metrics Tracking (Estimated: 2-3 hours)
- Update metrics tracking to work with streaming
- Integrate metrics with LaunchDarkly AI SDK
- Add additional metrics like time to first token

### Phase 5: Testing and Validation (Estimated: 3-4 hours)
- Test with multiple model types
- Validate metrics tracking
- Ensure backward compatibility

## Total Estimated Effort: ~25 hours (3-4 days of development work)
