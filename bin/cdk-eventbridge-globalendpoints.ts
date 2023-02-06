#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EventBusStack } from '../lib/event-bus-stack';
import { GlobalEndpointStack } from '../lib/global-endpoint-stack';
import { TestingStack } from '../lib/testing-stack';
import { BoilerPlateStack } from '../lib/boilerplate-stack';

import * as config from '../config.json';
import { PutEventsStack } from '../lib/put-events-stack';

const mainRegion = config.mainRegion;
const secondaryRegion = config.secondaryRegion;
const eventBusName = config.eventBusName;

const app = new cdk.App();

// PRIMARY STACK ------
const eventBusStackMainRegion = new EventBusStack(
	app,
	'EventBusStackMainRegion',
	{
		eventBusName: eventBusName,
		env: {
			region: mainRegion,
		},
	}
);

new TestingStack(app, 'TestingStackMain', {
	env: {
		region: mainRegion,
	},
	eventBusName: eventBusName,
});

// SECONDARY STACK ------
const eventBusStackSecondaryRegion = new EventBusStack(
	app,
	'EventBusStackSecondaryRegion',
	{
		eventBusName: eventBusName,
		env: {
			region: secondaryRegion,
		},
	}
);

new TestingStack(app, 'TestingStackSecondary', {
	env: {
		region: secondaryRegion,
	},
	eventBusName: eventBusName,
});

// HEALTHCHECKS AND OTHER GLOBAL CONFIGURATIONS -----
const boilerPlateStack = new BoilerPlateStack(app, 'BoilerPlateStack', {
	env: {
		region: mainRegion,
	},
	eventBusName: eventBusName,
});

// GLOBAL ENDPOINT -----
const globalEndpointStack = new GlobalEndpointStack(
	app,
	'GlobalEndpointStack',
	{
		env: {
			region: mainRegion,
		},
		replicatedRegion: secondaryRegion,
		eventBusArn1: eventBusStackMainRegion.eventBusArn,
		eventBusArn2: eventBusStackSecondaryRegion.eventBusArn,
		healthCheckArn: boilerPlateStack.healthCheckArn,
		replicatedRoleArn: boilerPlateStack.replicationRoleArn,
	}
);

new PutEventsStack(app, 'PutEventsStack', {
	env: {
		region: mainRegion,
	},
	eventBusName: eventBusName,
	endpointId: globalEndpointStack.endpointId,
});
