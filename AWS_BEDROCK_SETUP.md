# Setting Up AWS Bedrock for Claude-Sonnet

This guide explains how to set up AWS Bedrock to use Claude-Sonnet with the Wellness Hub Demo application.

## Prerequisites

- An AWS account with appropriate permissions
- AWS CLI installed and configured (optional, but helpful)

## Step 1: Enable AWS Bedrock in Your AWS Account

AWS Bedrock is not automatically enabled for all AWS accounts. You need to request access:

1. Sign in to the [AWS Management Console](https://console.aws.amazon.com/)
2. Navigate to the AWS Bedrock service
3. If you see a welcome page, click "Get started"
4. Follow the prompts to enable AWS Bedrock for your account

## Step 2: Request Access to Claude-Sonnet

Once AWS Bedrock is enabled, you need to request access to the Claude-Sonnet model:

1. In the AWS Bedrock console, navigate to "Model access" in the left sidebar
2. Find "Anthropic Claude" in the list of foundation models
3. Click "Request model access" for Claude-Sonnet (anthropic.claude-3-sonnet-20240229-v1:0)
4. Follow the prompts to complete the request
5. Wait for approval (this can take from minutes to hours)

## Step 3: Create IAM User with Bedrock Access

To use AWS Bedrock programmatically, you need an IAM user with appropriate permissions:

1. Navigate to the IAM service in the AWS Management Console
2. Click "Users" in the left sidebar, then "Create user"
3. Enter a name for the user (e.g., "bedrock-api-user")
4. On the "Set permissions" page, select "Attach policies directly"
5. Search for and select "AmazonBedrockFullAccess"
6. Complete the user creation process

## Step 4: Generate Access Keys

To authenticate with AWS Bedrock from the application:

1. In the IAM console, navigate to the user you created
2. Go to the "Security credentials" tab
3. Under "Access keys", click "Create access key"
4. Select "Application running outside AWS" as the use case
5. Complete the process and save the Access Key ID and Secret Access Key securely

## Step 5: Configure the Application

Update the `.env` file in the server directory with your AWS credentials:

```
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=us-east-1  # or your preferred region where Bedrock is available
```

## Step 6: Test the Integration

1. Start the application using `./start_demo.sh`
2. Open the application in your browser
3. Try using the chatbot feature to verify that Claude-Sonnet is working correctly

## Troubleshooting

If you encounter issues:

- Verify that AWS Bedrock is enabled in your account
- Confirm that you have access to Claude-Sonnet
- Check that your IAM user has the correct permissions
- Ensure your access keys are correctly configured in the `.env` file
- Check the server logs for any error messages

## Security Considerations

- Never commit your AWS credentials to version control
- Consider using AWS IAM roles for production deployments
- Regularly rotate your access keys
- Use the principle of least privilege when assigning permissions
