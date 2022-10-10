import { Stack, StackProps } from 'aws-cdk-lib';
import { EventBus } from 'aws-cdk-lib/aws-events';
import { Construct } from 'constructs';

interface EventBusStackProps extends StackProps {
	readonly env: any;
	readonly eventBusName: string;
}

export class EventBusStack extends Stack {
	public readonly eventBusArn: string;

	constructor(scope: Construct, id: string, props: EventBusStackProps) {
		super(scope, id, props);

		//Create a new bus with a given bus name
		const AppEventBus = new EventBus(this, 'AppEventBus', {
			eventBusName: props.eventBusName,
		});

		this.eventBusArn = AppEventBus.eventBusArn;
	}
}
