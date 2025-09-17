interface KakaoPayConfig {
  cid: string;
  cidSubscription: string;
  adminKey: string;
  apiUrl: string;
  secretKey?: string;
}

interface PaymentReadyParams {
  partnerOrderId: string;
  partnerUserId: string;
  itemName: string;
  quantity: number;
  totalAmount: number;
  taxFreeAmount?: number;
  vatAmount?: number;
  approvalUrl: string;
  cancelUrl: string;
  failUrl: string;
}

interface PaymentApproveParams {
  tid: string;
  partnerOrderId: string;
  partnerUserId: string;
  pgToken: string;
}

interface PaymentCancelParams {
  tid: string;
  cancelAmount: number;
  cancelTaxFreeAmount?: number;
  cancelVatAmount?: number;
  cancelAvailableAmount?: number;
}

interface PaymentStatusParams {
  tid: string;
}

interface SubscriptionReadyParams {
  partnerOrderId: string;
  partnerUserId: string;
  itemName: string;
  quantity: number;
  totalAmount: number;
  taxFreeAmount?: number;
  vatAmount?: number;
  approvalUrl: string;
  cancelUrl: string;
  failUrl: string;
}

interface SubscriptionApproveParams {
  sid: string;
  partnerOrderId: string;
  partnerUserId: string;
  pgToken: string;
}

interface SubscriptionInactiveParams {
  sid: string;
  inactiveReason?: string;
}

interface SubscriptionStatusParams {
  sid: string;
}

export class KakaoPayAPI {
  private config: KakaoPayConfig;

  constructor() {
    this.config = {
      cid: process.env.KAKAO_PAY_CID || 'TC0ONETIME',
      cidSubscription: process.env.KAKAO_PAY_CID_SUBSCRIPTION || 'TCSUBSCRIP',
      adminKey: process.env.KAKAO_PAY_ADMIN_KEY || 'DEV000000000000000000000000000000',
      apiUrl: process.env.KAKAO_PAY_API_URL || 'https://open-api.kakaopay.com',
      secretKey: process.env.KAKAO_PAY_SECRET_KEY,
    };
  }

  private isMockMode(): boolean {
    // 개발 환경이거나 테스트 키를 사용하는 경우 Mock 모드
    return process.env.NODE_ENV !== 'production' || 
           this.config.adminKey === 'DEV000000000000000000000000000000';
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Authorization': `SECRET_KEY ${this.config.adminKey}`,
      'Content-Type': 'application/json',
    };

    return headers;
  }

  async ready(params: PaymentReadyParams) {
    // Mock 모드인 경우 가짜 응답 반환
    if (this.isMockMode()) {
      const { mockKakaoPayAPI } = await import('./mock-kakaopay');
      return await mockKakaoPayAPI.ready(params);
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/online/v1/payment/ready`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          cid: this.config.cid,
          partner_order_id: params.partnerOrderId,
          partner_user_id: params.partnerUserId,
          item_name: params.itemName,
          quantity: params.quantity,
          total_amount: params.totalAmount,
          tax_free_amount: params.taxFreeAmount || 0,
          vat_amount: params.vatAmount || 0,
          approval_url: params.approvalUrl,
          cancel_url: params.cancelUrl,
          fail_url: params.failUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || `Payment ready failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        tid: data.tid,
        nextRedirectPcUrl: data.next_redirect_pc_url,
        nextRedirectMobileUrl: data.next_redirect_mobile_url,
        nextRedirectAppUrl: data.next_redirect_app_url,
        androidAppScheme: data.android_app_scheme,
        iosAppScheme: data.ios_app_scheme,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('KakaoPay ready error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async approve(params: PaymentApproveParams) {
    // Mock 모드인 경우 가짜 응답 반환
    if (this.isMockMode()) {
      const { mockKakaoPayAPI } = await import('./mock-kakaopay');
      return await mockKakaoPayAPI.approve(params);
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/online/v1/payment/approve`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          cid: this.config.cid,
          tid: params.tid,
          partner_order_id: params.partnerOrderId,
          partner_user_id: params.partnerUserId,
          pg_token: params.pgToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || `Payment approve failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        aid: data.aid,
        tid: data.tid,
        cid: data.cid,
        partnerOrderId: data.partner_order_id,
        partnerUserId: data.partner_user_id,
        paymentMethodType: data.payment_method_type,
        itemName: data.item_name,
        quantity: data.quantity,
        amount: {
          total: data.amount.total,
          taxFree: data.amount.tax_free,
          vat: data.amount.vat,
          point: data.amount.point,
          discount: data.amount.discount,
          greenDeposit: data.amount.green_deposit,
        },
        cardInfo: data.card_info,
        createdAt: data.created_at,
        approvedAt: data.approved_at,
      };
    } catch (error) {
      console.error('KakaoPay approve error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async cancel(params: PaymentCancelParams) {
    try {
      const response = await fetch(`${this.config.apiUrl}/online/v1/payment/cancel`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          cid: this.config.cid,
          tid: params.tid,
          cancel_amount: params.cancelAmount,
          cancel_tax_free_amount: params.cancelTaxFreeAmount || 0,
          cancel_vat_amount: params.cancelVatAmount,
          cancel_available_amount: params.cancelAvailableAmount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || `Payment cancel failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        aid: data.aid,
        tid: data.tid,
        cid: data.cid,
        status: data.status,
        partnerOrderId: data.partner_order_id,
        partnerUserId: data.partner_user_id,
        paymentMethodType: data.payment_method_type,
        amount: data.amount,
        canceledAmount: data.canceled_amount,
        cancelAvailableAmount: data.cancel_available_amount,
        itemName: data.item_name,
        quantity: data.quantity,
        createdAt: data.created_at,
        approvedAt: data.approved_at,
        canceledAt: data.canceled_at,
      };
    } catch (error) {
      console.error('KakaoPay cancel error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async status(params: PaymentStatusParams) {
    try {
      const response = await fetch(`${this.config.apiUrl}/online/v1/payment/order`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          cid: this.config.cid,
          tid: params.tid,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || `Payment status failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        tid: data.tid,
        cid: data.cid,
        status: data.status,
        partnerOrderId: data.partner_order_id,
        partnerUserId: data.partner_user_id,
        paymentMethodType: data.payment_method_type,
        amount: data.amount,
        canceledAmount: data.canceled_amount,
        cancelAvailableAmount: data.cancel_available_amount,
        itemName: data.item_name,
        quantity: data.quantity,
        createdAt: data.created_at,
        approvedAt: data.approved_at,
        canceledAt: data.canceled_at,
        selectedCardInfo: data.selected_card_info,
      };
    } catch (error) {
      console.error('KakaoPay status error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // 정기결제 등록
  async subscriptionReady(params: SubscriptionReadyParams) {
    // Mock 모드인 경우 가짜 응답 반환
    if (this.isMockMode()) {
      const { mockKakaoPayAPI } = await import('./mock-kakaopay');
      return await mockKakaoPayAPI.subscriptionReady(params);
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/online/v1/subscription/ready`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          cid: this.config.cidSubscription,
          partner_order_id: params.partnerOrderId,
          partner_user_id: params.partnerUserId,
          item_name: params.itemName,
          quantity: params.quantity,
          total_amount: params.totalAmount,
          tax_free_amount: params.taxFreeAmount || 0,
          vat_amount: params.vatAmount || 0,
          approval_url: params.approvalUrl,
          cancel_url: params.cancelUrl,
          fail_url: params.failUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || `Subscription ready failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        sid: data.sid,
        tid: data.tid,
        nextRedirectPcUrl: data.next_redirect_pc_url,
        nextRedirectMobileUrl: data.next_redirect_mobile_url,
        nextRedirectAppUrl: data.next_redirect_app_url,
        androidAppScheme: data.android_app_scheme,
        iosAppScheme: data.ios_app_scheme,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('KakaoPay subscription ready error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // 정기결제 첫 승인
  async subscriptionApprove(params: SubscriptionApproveParams) {
    // Mock 모드인 경우 가짜 응답 반환
    if (this.isMockMode()) {
      const { mockKakaoPayAPI } = await import('./mock-kakaopay');
      return await mockKakaoPayAPI.subscriptionApprove(params);
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/online/v1/subscription/approve`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          cid: this.config.cidSubscription,
          sid: params.sid,
          partner_order_id: params.partnerOrderId,
          partner_user_id: params.partnerUserId,
          pg_token: params.pgToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || `Subscription approve failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        aid: data.aid,
        sid: data.sid,
        cid: data.cid,
        partnerOrderId: data.partner_order_id,
        partnerUserId: data.partner_user_id,
        paymentMethodType: data.payment_method_type,
        itemName: data.item_name,
        quantity: data.quantity,
        amount: {
          total: data.amount.total,
          taxFree: data.amount.tax_free,
          vat: data.amount.vat,
          point: data.amount.point,
          discount: data.amount.discount,
          greenDeposit: data.amount.green_deposit,
        },
        cardInfo: data.card_info,
        createdAt: data.created_at,
        approvedAt: data.approved_at,
      };
    } catch (error) {
      console.error('KakaoPay subscription approve error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // 정기결제 조회
  async subscriptionStatus(params: SubscriptionStatusParams) {
    // Mock 모드인 경우 가짜 응답 반환
    if (this.isMockMode()) {
      const { mockKakaoPayAPI } = await import('./mock-kakaopay');
      return await mockKakaoPayAPI.subscriptionStatus(params);
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/online/v1/subscription/status`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          cid: this.config.cidSubscription,
          sid: params.sid,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || `Subscription status failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        sid: data.sid,
        cid: data.cid,
        status: data.status,
        partnerOrderId: data.partner_order_id,
        partnerUserId: data.partner_user_id,
        paymentMethodType: data.payment_method_type,
        itemName: data.item_name,
        quantity: data.quantity,
        amount: data.amount,
        createdAt: data.created_at,
        approvedAt: data.approved_at,
        lastApprovedAt: data.last_approved_at,
        inactiveAt: data.inactive_at,
      };
    } catch (error) {
      console.error('KakaoPay subscription status error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // 정기결제 비활성화
  async subscriptionInactive(params: SubscriptionInactiveParams) {
    // Mock 모드인 경우 가짜 응답 반환
    if (this.isMockMode()) {
      const { mockKakaoPayAPI } = await import('./mock-kakaopay');
      return await mockKakaoPayAPI.subscriptionInactive(params);
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/online/v1/subscription/inactive`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          cid: this.config.cidSubscription,
          sid: params.sid,
          inactive_reason: params.inactiveReason || 'USER_CANCEL',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || `Subscription inactive failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        sid: data.sid,
        cid: data.cid,
        status: data.status,
        inactiveAt: data.inactive_at,
        lastPaymentAt: data.last_payment_at,
      };
    } catch (error) {
      console.error('KakaoPay subscription inactive error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}

export const kakaoPayAPI = new KakaoPayAPI();