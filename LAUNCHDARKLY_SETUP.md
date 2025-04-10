# LaunchDarkly Setup Guide

This guide explains how to set up LaunchDarkly for the Wellness Hub demo application. LaunchDarkly is used for feature flags and experimentation in this demo.

## Prerequisites

- A LaunchDarkly account (you can sign up for a free trial at [launchdarkly.com](https://launchdarkly.com))
- The Wellness Hub demo application set up locally

## Setup Steps

### 1. Create a LaunchDarkly Project

1. Log in to your LaunchDarkly dashboard
2. Create a new project called "Wellness Hub Demo"
3. Select "Web" as the primary SDK

### 2. Get Your SDK Keys

1. Go to Account Settings > Projects
2. Find your "Wellness Hub Demo" project
3. Copy the Client-side ID and Server-side SDK key

### 3. Configure the Backend

1. Open the `.env` file in the `server` directory
2. Add your LaunchDarkly server-side SDK key:

```
LAUNCHDARKLY_SDK_KEY=your-server-side-sdk-key
```

### 4. Configure the Frontend

1. Open the `.env` file in the `client` directory
2. Add your LaunchDarkly client-side ID:

```
REACT_APP_LAUNCHDARKLY_CLIENT_ID=your-client-side-id
```

## Creating Feature Flags

### Service Sort Experiment

This experiment tests different orderings of service categories to see which drives the most engagement.

1. In LaunchDarkly, create a new feature flag:
   - Name: "Service Sort Experiment"
   - Key: `service-sort-experiment`
   - Flag type: String
   - Variations:
     - `variation_1`: ["yoga", "fitness", "wellness", "meditation"]
     - `variation_2`: ["fitness", "yoga", "meditation", "wellness"]
     - `variation_3`: ["wellness", "meditation", "yoga", "fitness"]
     - `variation_4`: ["meditation", "wellness", "fitness", "yoga"]

2. Set up targeting rules:
   - For users with segment "fitness_enthusiast", serve `variation_2`
   - For users with segment "wellness_seeker", serve `variation_1`
   - For users with segment "stress_relief", serve `variation_3`
   - For users with segment "new_to_wellness", serve `variation_4`
   - For all other users, use percentage rollout:
     - 25% `variation_1`
     - 25% `variation_2`
     - 25% `variation_3`
     - 25% `variation_4`

### Provider Image Flag

This flag controls which image is shown for wellness providers.

1. Create a new feature flag:
   - Name: "Provider Image Flag"
   - Key: `provider-image-flag`
   - Flag type: String
   - Variations:
     - `standard`: Standard images
     - `enhanced`: Enhanced high-quality images

2. Set up targeting rules:
   - Default: `standard`

## Setting Up Metrics

### Custom Conversion Events

1. In LaunchDarkly, go to Metrics > Custom Conversion Events
2. Create the following events:
   - `service-click`: Triggered when a user clicks on a service
   - `page_view`: Triggered when a user views a page

### Experiment Metrics

1. Create a new metric for the Service Sort Experiment:
   - Name: "Service Click Rate"
   - Key: `service-click-rate`
   - Type: Conversion
   - Event: `service-click`

## Running Experiments

1. Go to Experiments in LaunchDarkly
2. Create a new experiment:
   - Name: "Service Category Order Test"
   - Hypothesis: "Ordering service categories based on user segments will increase engagement"
   - Flag: `service-sort-experiment`
   - Metric: `service-click-rate`
   - Variations: All four variations
   - Duration: 14 days

## Viewing Results

1. In the demo application, navigate to:
   - [http://localhost:5003/api/analytics/results](http://localhost:5003/api/analytics/results)
2. This will show mock analytics data for the experiment

## Troubleshooting

- If feature flags aren't working, check that your SDK keys are correctly set in the `.env` files
- Ensure the LaunchDarkly client is properly initialized in both the frontend and backend
- Check the browser console for any LaunchDarkly-related errors

## Additional Resources

- [LaunchDarkly Documentation](https://docs.launchdarkly.com/)
- [React SDK Documentation](https://docs.launchdarkly.com/sdk/client-side/react)
- [Python SDK Documentation](https://docs.launchdarkly.com/sdk/server-side/python)
