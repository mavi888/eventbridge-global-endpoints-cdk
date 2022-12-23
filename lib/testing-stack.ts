import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { EventBus, Rule } from 'aws-cdk-lib/aws-events';
import { Construct } from 'constructs';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';

interface TestingStackProps extends StackProps {
	readonly eventBusName: string;
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
	}
}
