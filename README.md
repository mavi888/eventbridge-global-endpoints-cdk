# Amazon EventBridge Global Endpoints DEMO

_Infrastructure as code framework used_: AWS CDK
_AWS Services used_: Amazon EventBridge, AWS Lambda, Amazon CloudWatch

## Summary of the demo

In this demo you will see:

- How to create an Amazon EventBridge custom bus
- How to create an Amazon EventBridge Global Endpoint
- How to create a Health Check for your application
- How to create a Metric and Alarm in Amazon CloudWatch
- How to create a AWS Lambda function that sends events to the Amazon EventBridge

This demo is part of a video posted in FooBar Serverless channel. You can check the video to see the whole demo.

Important: this application uses various AWS services and there are costs associated with these services after the Free Tier usage - please see the AWS Pricing page for details. You are responsible for any AWS costs incurred. No warranty is implied in this example.

## Requirements

- AWS CLI already configured with Administrator permission
- AWS CDK - v2
- NodeJS 16.x installed
- CDK bootstrapped in your account

## Deploy this demo

1. Configure this project by changing the `config.json`file to match your project.

2. You need to deploy this project in parts. First you need to deploy the event buses.

```
cdk deploy EventBusStackMainRegion EventBusStackSecondaryRegion
```

When asked about functions that may not have authorization defined, answer (y)es. The access to those functions will be open to anyone, so keep the app deployed only for the time you need this demo running. Do this for all the following stacks.

3. When this is ready, deploy the Boiler Plate for the global endpoint - Metrics, Alarms and Healthcheck and also the role.

```
cdk deploy BoilerPlateStack
```

And then the global endpoint stack.

```
cdk deploy GlobalEndpointStack
```

4. And finally you are ready to deploy the testing stacks.

```
cdk deploy TestingStackMain TestingStackSecondary
```

## Testing

You can check your health check, it will be UNHEALTHY until some data is not available in the Metric

To test this demo you need to open in 2 different browsers tabs CloudWatch Logs Insights.
In each of the regions you need to select the right log group. You can get the name from the CloudFormation output after deploying each of the testing stacks.

Eg: TestingStackMain-cloudwatchlog7BFFDA07-aamMKlFpe1C1 and TestingStackSecondary-cloudwatchlog7BFFDA07-mtdJjLJdGe51

Type the following query in each of the browsers:

```
fields region, detail.eventId, time
| sort detail.eventId desc
```

Now you can invoke the Lambda function. This function will send many messages during 15 minutes, it will send messages to the Global Endpoint.

```
aws lambda invoke --function-name NAME response.json
```

First, the Global Endpoint will use the the secondary region custom bus, as the main region is unhealthy due the lack of data in the metric.
Then it will start using the primary region.
Finally, you can invert the HealthCheck and the events will start appearing from the secondary region again.

You can validate all this checking those log groups from the Log Insights dashboards.

## Delete app

To delete the app:

```
cdk destroy --all
```

## Links related to this code

- Video with more details:

### AWS CDK useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
