import { apiPost, apiGet } from './client';
import { ApiResponse } from './config';

export interface SubscribeDto {
  email: string;
  name?: string;
  source?: string;
}

export interface SubscriptionResponse {
  success: boolean;
  message: string;
}

export interface SubscriberStats {
  total: number;
  verified: number;
  pending: number;
  unsubscribed: number;
}

/**
 * Subscribe to newsletter
 */
export async function subscribe(
  data: SubscribeDto,
): Promise<ApiResponse<SubscriptionResponse>> {
  return apiPost<SubscriptionResponse>('/newsletter/subscribe', data);
}

/**
 * Verify subscription
 */
export async function verifySubscription(
  token: string,
): Promise<ApiResponse<SubscriptionResponse>> {
  return apiGet<SubscriptionResponse>(
    `/newsletter/verify?token=${encodeURIComponent(token)}`,
  );
}

/**
 * Unsubscribe from newsletter
 */
export async function unsubscribe(
  token: string,
): Promise<ApiResponse<SubscriptionResponse>> {
  return apiGet<SubscriptionResponse>(
    `/newsletter/unsubscribe?token=${encodeURIComponent(token)}`,
  );
}

/**
 * Get subscriber stats (admin)
 */
export async function getSubscriberStats(): Promise<
  ApiResponse<SubscriberStats>
> {
  return apiGet<SubscriberStats>('/newsletter/stats');
}

export const newsletterApi = {
  subscribe,
  verifySubscription,
  unsubscribe,
  getSubscriberStats,
};
