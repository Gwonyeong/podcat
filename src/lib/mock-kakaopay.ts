// 테스트용 모의 KakaoPay API
// 실제 운영 환경에서는 실제 KakaoPay API 키를 사용해야 합니다.

export class MockKakaoPayAPI {
  async ready(params: any) {
    // 실제 환경인지 확인
    const isProduction = process.env.NODE_ENV === 'production';
    const hasRealApiKey = process.env.KAKAO_PAY_ADMIN_KEY && 
                         process.env.KAKAO_PAY_ADMIN_KEY !== 'DEV000000000000000000000000000000';

    if (isProduction && !hasRealApiKey) {
      return {
        success: false,
        error: 'Production environment requires real KakaoPay API key'
      };
    }

    // 개발 환경에서는 모의 응답 반환
    console.log('🔶 Mock KakaoPay: 결제 준비 요청', {
      itemName: params.itemName,
      totalAmount: params.totalAmount
    });

    // 실제 KakaoPay 응답 형식에 맞춰 모의 데이터 생성
    const mockTid = `T${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    return {
      success: true,
      tid: mockTid,
      nextRedirectPcUrl: `${baseUrl}/payment/mock-success?tid=${mockTid}&pg_token=mock_token_${Date.now()}&partner_order_id=${params.partnerOrderId}&partner_user_id=${params.partnerUserId}`,
      nextRedirectMobileUrl: `${baseUrl}/payment/mock-success?tid=${mockTid}&pg_token=mock_token_${Date.now()}&partner_order_id=${params.partnerOrderId}&partner_user_id=${params.partnerUserId}`,
      nextRedirectAppUrl: `${baseUrl}/payment/mock-success?tid=${mockTid}&pg_token=mock_token_${Date.now()}&partner_order_id=${params.partnerOrderId}&partner_user_id=${params.partnerUserId}`,
      androidAppScheme: null,
      iosAppScheme: null,
      createdAt: new Date().toISOString()
    };
  }

  async approve(params: any) {
    console.log('🔶 Mock KakaoPay: 결제 승인 요청', {
      tid: params.tid,
      pgToken: params.pgToken
    });

    return {
      success: true,
      aid: `A${Date.now()}`,
      tid: params.tid,
      cid: 'TC0ONETIME',
      partnerOrderId: params.partnerOrderId,
      partnerUserId: params.partnerUserId,
      paymentMethodType: 'MONEY',
      itemName: '프리미엄 월간 구독',
      quantity: 1,
      amount: {
        total: 2900,
        taxFree: 0,
        vat: 264,
        point: 0,
        discount: 0,
        greenDeposit: 0
      },
      cardInfo: null,
      createdAt: new Date().toISOString(),
      approvedAt: new Date().toISOString()
    };
  }

  async cancel(params: any) {
    console.log('🔶 Mock KakaoPay: 결제 취소 요청', {
      tid: params.tid,
      cancelAmount: params.cancelAmount
    });

    return {
      success: true,
      aid: `A${Date.now()}`,
      tid: params.tid,
      cid: 'TC0ONETIME',
      status: 'CANCEL_PAYMENT',
      partnerOrderId: `ORDER_${Date.now()}`,
      partnerUserId: 'mock_user',
      paymentMethodType: 'MONEY',
      amount: {
        total: 2900,
        taxFree: 0,
        vat: 264,
        point: 0,
        discount: 0,
        greenDeposit: 0
      },
      canceledAmount: {
        total: params.cancelAmount,
        taxFree: 0,
        vat: Math.floor(params.cancelAmount / 11),
        point: 0,
        discount: 0,
        greenDeposit: 0
      },
      cancelAvailableAmount: {
        total: 0,
        taxFree: 0,
        vat: 0,
        point: 0,
        discount: 0,
        greenDeposit: 0
      },
      itemName: '프리미엄 월간 구독',
      quantity: 1,
      createdAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      canceledAt: new Date().toISOString()
    };
  }

  async status(params: any) {
    console.log('🔶 Mock KakaoPay: 결제 상태 조회', {
      tid: params.tid
    });

    return {
      success: true,
      tid: params.tid,
      cid: 'TC0ONETIME',
      status: 'READY',
      partnerOrderId: `ORDER_${Date.now()}`,
      partnerUserId: 'mock_user',
      paymentMethodType: 'MONEY',
      amount: {
        total: 2900,
        taxFree: 0,
        vat: 264,
        point: 0,
        discount: 0,
        greenDeposit: 0
      },
      canceledAmount: {
        total: 0,
        taxFree: 0,
        vat: 0,
        point: 0,
        discount: 0,
        greenDeposit: 0
      },
      cancelAvailableAmount: {
        total: 2900,
        taxFree: 0,
        vat: 264,
        point: 0,
        discount: 0,
        greenDeposit: 0
      },
      itemName: '프리미엄 월간 구독',
      quantity: 1,
      createdAt: new Date().toISOString(),
      approvedAt: null,
      canceledAt: null,
      selectedCardInfo: null
    };
  }
}

export const mockKakaoPayAPI = new MockKakaoPayAPI();