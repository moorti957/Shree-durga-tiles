import { resolveApiConfig } from '../src/config/apiConfig';

describe('mobile API configuration', () => {
  it('accepts the Android emulator host mapping for explicit development HTTP', () => {
    expect(
      resolveApiConfig({
        apiBaseUrl: 'http://10.0.2.2:5000/api',
        networkProfile: 'development',
        allowHttp: true,
        useMockApi: false,
      }).apiBaseUrl
    ).toBe('http://10.0.2.2:5000/api');
  });

  it.each(['preview', 'production'])('rejects HTTP for the %s profile', (networkProfile) => {
    expect(() =>
      resolveApiConfig({
        apiBaseUrl: 'http://api.example.com/api',
        networkProfile,
        allowHttp: false,
        useMockApi: false,
      })
    ).toThrow(/HTTPS is required/);
  });

  it('rejects missing production API URLs and private production hosts', () => {
    expect(() =>
      resolveApiConfig({
        networkProfile: 'production',
        allowHttp: false,
        useMockApi: false,
      })
    ).toThrow(/EXPO_PUBLIC_API_BASE_URL is required/);

    expect(() =>
      resolveApiConfig({
        apiBaseUrl: 'https://192.168.1.15/api',
        networkProfile: 'production',
        allowHttp: false,
        useMockApi: false,
      })
    ).toThrow(/public hostname/);
  });

  it('never allows mock mode outside development', () => {
    expect(() =>
      resolveApiConfig({
        networkProfile: 'production',
        allowHttp: false,
        useMockApi: true,
      })
    ).toThrow(/only for the development profile/);
  });
});
