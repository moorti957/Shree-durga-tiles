export type NetworkProfile = 'development' | 'preview' | 'production';

export type ApiConfigInput = {
  apiBaseUrl?: string;
  networkProfile: string;
  allowHttp: boolean;
  useMockApi: boolean;
};

export function resolveApiConfig(input: ApiConfigInput): {
  apiBaseUrl: string;
  networkProfile: NetworkProfile;
  useMockApi: boolean;
};
