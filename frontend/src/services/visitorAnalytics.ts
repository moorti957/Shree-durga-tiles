import { apiClient } from '@/services/apiClient';

const VISITOR_ID_KEY = 'shree-durga-visitor-id';
const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const getVisitorId = (): string | undefined => {
  if (typeof window === 'undefined' || navigator.doNotTrack === '1') return undefined;

  try {
    const storedId = window.localStorage.getItem(VISITOR_ID_KEY);
    if (storedId && UUID_V4_PATTERN.test(storedId)) return storedId;
    const visitorId = window.crypto.randomUUID();
    window.localStorage.setItem(VISITOR_ID_KEY, visitorId);
    return visitorId;
  } catch {
    return undefined;
  }
};

const getDeviceType = (): 'mobile' | 'desktop' | 'tablet' => {
  if (window.matchMedia('(max-width: 767px)').matches) return 'mobile';
  if (window.matchMedia('(max-width: 1023px)').matches) return 'tablet';
  return 'desktop';
};

export const trackPageView = async (path: string): Promise<void> => {
  const visitorId = getVisitorId();
  if (!visitorId) return;

  try {
    await apiClient.post('/public/track/pageview', {
      visitorId,
      path: path.split('?')[0],
      device: getDeviceType(),
    });
  } catch (error) {
    console.warn('Visitor page-view tracking failed.', error);
  }
};

export const trackVisitorEvent = async (
  event: 'call_click' | 'whatsapp_click'
): Promise<void> => {
  const visitorId = getVisitorId();
  if (!visitorId) return;

  try {
    await apiClient.post('/public/track/event', { visitorId, event, device: getDeviceType() });
  } catch (error) {
    console.warn('Visitor event tracking failed.', error);
  }
};
