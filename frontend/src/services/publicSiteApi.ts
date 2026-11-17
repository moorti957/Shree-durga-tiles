import { apiClient } from '@/services/apiClient';
import { getVisitorId } from '@/services/visitorAnalytics';

export type EnquiryNeed =
  | 'Marble'
  | 'Granite'
  | 'Floor/Wall Tiles'
  | 'Kitchen Top'
  | 'Mandir/Pooja Room Stone'
  | 'Bulk supply for a project'
  | 'Other';

export type EnquirySource =
  | 'quote_form'
  | 'mandir_cta'
  | 'product_enquire'
  | 'whatsapp_click'
  | 'call_click';

export interface EnquirySubmission {
  name: string;
  phone: string;
  need: EnquiryNeed;
  message?: string;
  productId?: string;
  source: EnquirySource;
  website?: string;
}

export interface PublicSettings {
  shopName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  timings: string;
  mapLink: string;
  social: Record<string, string>;
}

export const getPublicSettings = async (): Promise<PublicSettings> => {
  const response = await apiClient.get('/public/settings');
  return response.data.data;
};

export const submitEnquiry = async (submission: EnquirySubmission): Promise<void> => {
  const visitorId = getVisitorId();
  await apiClient.post('/public/enquiries', {
    ...submission,
    ...(visitorId ? { visitorId } : {}),
  });
};
