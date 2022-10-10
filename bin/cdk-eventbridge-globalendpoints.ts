#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EventBusStack } from '../lib/event-bus-stack';
import { GlobalEndpointStack } from '../lib/global-endpoint-stack';
import { TestingStack } from '../lib/testing-stack';

import * as config from '../config.json';
import { BoilerPlateStack } from '../lib/boilerplate-stack';

const mainRegion = config.mainRegion;
const secondaryRegion = config.secondaryRegion;
const eventBusName = config.eventBusName;

const app = new cdk.App();

// NOTE: Need to run first before anything else
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

// NOTE: Only run this after the buses are created
const boilerPlateStack = new BoilerPlateStack(app, 'BoilerPlateStack', {
	env: {
		region: mainRegion,
	},
	eventBusName: eventBusName,
});

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
		replicatedRoleArn: boilerPlateStack.replicationRoleArn, // NOTE: the role for the global EB is created in console due to the IaC way didnt work
	}
);

// NOTE deploy after the global endpoint is ready
const endpointId = 'TODO'; // YOU NEED TO INPUT THIS ONE MANUALLY FROM THE DEPLOYMENT OF THE GLOBAL ENDPOINT

new TestingStack(app, 'TestingStackMain', {
	env: {
		region: mainRegion,
	},
	eventBusName: eventBusName,
	endpointId: endpointId,
});

new TestingStack(app, 'TestingStackSecondary', {
	env: {
		region: secondaryRegion,
	},
	eventBusName: eventBusName,
	endpointId: endpointId,
});
