import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
	IDataObject,
} from 'n8n-workflow';

// Standalone helper (cannot use `this` in execute because `this` is IExecuteFunctions)
function getErrorMessage(error: any): string {
	if (error?.message) return error.message;
	const body = error?.response?.body;
	if (body?.error?.description) return body.error.description;
	if (typeof body?.error === 'string') return body.error;
	if (body?.message) return body.message;
	return 'An unknown error occurred';
}

export class AiSearchApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'AI Search API',
		name: 'aiSearchApi',
		icon: 'file:aisearchapi.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with AI Search API for intelligent search and balance checking',
		defaults: {
			name: 'AI Search API',
		},
		// NEW: use enum, not string literals
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'aiSearchApi',
				required: true,
			},
		],
		properties: [
			// Resource
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Search',
						value: 'search',
						description: 'Perform an AI-powered search with context awareness',
					},
					{
						name: 'Account',
						value: 'account',
						description: 'Check account balance and credits',
					},
				],
				default: 'search',
			},

			// Operations - Search
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['search'],
					},
				},
				options: [
					{
						name: 'Search',
						value: 'search',
						description: 'Execute an intelligent search query',
						action: 'Search',
					},
				],
				default: 'search',
				noDataExpression: true,
			},
			// Operations - Account
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['account'],
					},
				},
				options: [
					{
						name: 'Get Balance',
						value: 'getBalance',
						description: 'Check your current account balance and available API credits',
						action: 'Get balance',
					},
				],
				default: 'getBalance',
				noDataExpression: true,
			},

			// Search Parameters
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['search'],
						operation: ['search'],
					},
				},
				default: '',
				placeholder: 'e.g., What is machine learning?',
				description: 'The main search query for embedding and retrieval',
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['search'],
						operation: ['search'],
					},
				},
				options: [
					{
						displayName: 'Response Type',
						name: 'responseType',
						type: 'options',
						options: [
							{ name: 'Markdown', value: 'markdown', description: 'Rich formatted text with styling' },
							{ name: 'Text', value: 'text', description: 'Plain text without formatting' },
						],
						default: 'markdown',
						description: 'Choose the format for the response',
					},
					{
						displayName: 'Context',
						name: 'context',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						placeholder: 'Add Context Message',
						description: 'Previous conversation messages for enhanced context',
						options: [
							{
								displayName: 'Messages',
								name: 'messages',
								values: [
									{
										displayName: 'Content',
										name: 'content',
										type: 'string',
										default: '',
										description: 'The content of the context message',
									},
								],
							},
						],
					},
					{
						displayName: 'Timeout',
						name: 'timeout',
						type: 'number',
						typeOptions: {
							minValue: 1000,
							maxValue: 120000,
						},
						default: 30000,
						description: 'Request timeout in milliseconds',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('aiSearchApi');
		const apiKey = (credentials as IDataObject).apiKey as string;
		const baseUrl = 'https://api.aisearchapi.io';

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: any;

				if (resource === 'search' && operation === 'search') {
					const query = this.getNodeParameter('query', i) as string;
					const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;

					const body: IDataObject = { prompt: query };

					// Response type
					if (additionalOptions.responseType) {
						body.response_type = additionalOptions.responseType;
					}

					// Context
					const ctx = (additionalOptions.context as IDataObject | undefined)?.messages as IDataObject[] | undefined;
					if (Array.isArray(ctx)) {
						body.context = ctx.map((m) => ({
							role: 'user',
							content: (m.content as string) || '',
						}));
					}

					// Timeout
					const timeout = (additionalOptions.timeout as number) ?? 30000;

					responseData = await this.helpers.requestWithAuthentication.call(this, 'aiSearchApi', {
						method: 'POST',
						url: `${baseUrl}/v1/search`,
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${apiKey}`,
						},
						body,
						json: true,
						timeout,
					});
				} else if (resource === 'account' && operation === 'getBalance') {
					responseData = await this.helpers.requestWithAuthentication.call(this, 'aiSearchApi', {
						method: 'GET',
						url: `${baseUrl}/v1/balance`,
						headers: {
							Authorization: `Bearer ${apiKey}`,
						},
						json: true,
					});
				}

				// Normalize to items
				if (Array.isArray(responseData)) {
					returnData.push(...responseData.map((item) => ({ json: item } as INodeExecutionData)));
				} else {
					returnData.push({ json: responseData } as INodeExecutionData);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: getErrorMessage(error) },
						pairedItem: { item: i },
					});
					continue;
				}

				// Build friendly message
				let message = getErrorMessage(error);
				const status = error?.response?.statusCode as number | undefined;

				if (status) {
					switch (status) {
						case 401:
							message = 'Unauthorized: Please check your API key';
							break;
						case 429:
							message = 'Too many requests: Please slow down your request rate';
							break;
						case 433:
							message = 'Account is at or over message quota: Please check your usage limits';
							break;
						case 500:
							message = 'Server error: Please try again later';
							break;
						case 503:
							message = 'Service unavailable: The API is temporarily down';
							break;
					}
				}

				// NOTE: `details` is not a valid option; use only supported fields
				throw new NodeOperationError(this.getNode(), message, {
					itemIndex: i,
					description: `HTTP ${status ?? 'Error'}`,
				});
			}
		}

		return [returnData];
	}
}
