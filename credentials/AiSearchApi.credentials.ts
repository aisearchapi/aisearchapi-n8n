import { Icon, ICredentialType, INodeProperties } from "n8n-workflow";

export class AiSearchApi implements ICredentialType {
  name = "aiSearchApi";
  displayName = "AI Search API";
  documentationUrl = "https://docs.aisearchapi.io";
  icon: Icon = 'file:aisearchapi.svg';
  properties: INodeProperties[] = [
    {
      displayName: "API Key",
      name: "apiKey",
      type: "string",
      typeOptions: {
        password: true,
      },
      default: "",
      required: true,
      description: "Your AI Search API key (without Bearer prefix)",
    },
  ];
}
