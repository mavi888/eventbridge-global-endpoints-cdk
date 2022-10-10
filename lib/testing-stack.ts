import {
	CfnOutput,
	Duration,
	RemovalPolicy,
	Stack,
	StackProps,
} from 'aws-cdk-lib';
import { EventBus, Rule } from 'aws-cdk-lib/aws-events';
import { Construct } from 'constructs';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Function, Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

interface TestingStackProps extends StackProps {
	readonly eventBusName: string;
	readonly endpointId: string;
	readonly env: any;
}

export class TestingStack extends Stack {
	constructor(scope: Construct, id: string, props: TestingStackProps) {
		super(scope, id, props);

		const AppEventBus = EventBus.fromEventBusName(
			this,
			'AppEventBus',
			props.eventBusName
		);

		const testingRule = new Rule(this, 'testingRule', {
			eventBus: AppEventBus,
			eventPattern: {
				source: [{ prefix: '' }] as any[], // Matches all the events in the bus
			},
		});

		const cloudwatchLog = new LogGroup(this, 'cloudwatchlog', {
			retention: RetentionDays.ONE_DAY,
			removalPolicy: RemovalPolicy.DESTROY,
		});

		testingRule.addTarget(new targets.CloudWatchLogGroup(cloudwatchLog));

		new CfnOutput(this, 'log group', {
			value: cloudwatchLog.logGroupName,
			description: 'cloud watch log group name',
		});

		const eventbridgePutPolicy = new PolicyStatement({
			effect: Effect.ALLOW,
			resources: ['*'],
			actions: ['events:PutEvents'],
		});

		/* Lambda function that put messages */
		const putFunction = new Function(this, 'PutFunction', {
			code: Code.fromAsset(path.join(__dirname, '../function')),
			runtime: Runtime.NODEJS_16_X,
			handler: 'put-events.handler',
			timeout: Duration.minutes(15),
			environment: {
				ENDPOINT: props.endpointId,
				EVENTBUS_NAME: props.eventBusName,
			},
		});

		putFunction.addToRolePolicy(eventbridgePutPolicy);

		new CfnOutput(this, 'function name', {
			value: putFunction.functionName,
			description: 'function name',
		});
	}
}
