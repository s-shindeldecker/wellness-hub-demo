# Analytics Guide for Wellness Hub

This guide explains how to use and interpret the analytics features in the Wellness Hub demo application.

## Overview

The Wellness Hub demo includes a simple analytics system that tracks user interactions and experiment results. This data can be used to understand user behavior and measure the effectiveness of different variations in the application.

## Available Analytics

### User Interaction Tracking

The application tracks the following user interactions:

- **Page Views**: When users view different pages in the application
- **Service Clicks**: When users click on specific services
- **Login Events**: When users log in to the application
- **Registration Events**: When users create a new account

### Experiment Results

The application also tracks the results of experiments, such as:

- **Service Sort Experiment**: Measures which ordering of service categories drives the most engagement
- **Provider Image Experiment**: Measures which provider image style leads to more service clicks

## Accessing Analytics Data

### Analytics Dashboard

The application provides a simple analytics dashboard that can be accessed at:

```
http://localhost:5003/api/analytics/results
```

This dashboard shows:

- Click-through rates for each variation
- Total views and clicks for each variation
- Conversion rates by user segment

### Raw Analytics Data

For more detailed analysis, you can access the raw analytics data through the API:

```
GET /api/analytics/results
```

Response format:
```json
{
  "variation_1": {
    "clicks": 10,
    "views": 100,
    "ctr": 10.0
  },
  "variation_2": {
    "clicks": 15,
    "views": 100,
    "ctr": 15.0
  },
  "variation_3": {
    "clicks": 12,
    "views": 100,
    "ctr": 12.0
  },
  "variation_4": {
    "clicks": 8,
    "views": 100,
    "ctr": 8.0
  }
}
```

## Interpreting Results

### Click-Through Rate (CTR)

The click-through rate is calculated as:

```
CTR = (Number of Clicks / Number of Views) * 100
```

A higher CTR indicates that a particular variation is more effective at encouraging users to click on services.

### Statistical Significance

In a real application, you would want to ensure that your results are statistically significant before making decisions. For this demo, we're using simplified analytics, but in a production environment, you would:

1. Run experiments for a sufficient duration (typically 2-4 weeks)
2. Collect a large enough sample size (typically thousands of users)
3. Use statistical methods to determine if differences between variations are significant

## Segmentation Analysis

The demo application also supports analyzing results by user segment:

- **Fitness Enthusiasts**: Users interested in fitness activities
- **Wellness Seekers**: Users interested in yoga and meditation
- **Stress Relief**: Users looking for relaxation services
- **New to Wellness**: First-time users exploring wellness options

Different segments may respond differently to variations, so it's important to analyze results at both the aggregate and segment level.

## Integration with LaunchDarkly

The analytics system is designed to work with LaunchDarkly's experimentation features. Events tracked in the application can be sent to LaunchDarkly for more sophisticated analysis.

See the [LaunchDarkly Setup Guide](./LAUNCHDARKLY_SETUP.md) for details on how to configure this integration.

## Custom Event Tracking

For development purposes, you can manually track custom events using the analytics API:

```
POST /api/analytics/track
Content-Type: application/json

{
  "type": "custom_event",
  "userId": "user123",
  "variation": "variation_1",
  "metadata": {
    "customProperty": "value"
  }
}
```

This can be useful for tracking specific interactions that aren't covered by the default tracking.

## Limitations

Since this is a demo application, the analytics system has some limitations:

- Data is stored in memory and will be reset when the server restarts
- There is no user persistence across sessions
- The statistical analysis is simplified
- There is no data visualization beyond the basic JSON output

In a production application, you would use a more robust analytics system with persistent storage, user identification, and advanced visualization tools.
