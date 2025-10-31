import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tid, orderId, amount, plan, itemName } = await request.json();

    if (!tid || !orderId || !amount) {
      return NextResponse.json(
        { error: "필수 결제 정보가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 테스트 모드: 실제 나이스페이 API 호출 대신 테스트 승인 시뮬레이션
    const isTestMode = tid.startsWith("TEST_TID_");

    let approvalResult;

    if (isTestMode) {
      // 테스트 환경에서는 항상 성공으로 처리
      console.log("=== 테스트 모드: 나이스페이 승인 시뮬레이션 ===");
      approvalResult = {
        resultCode: "0000",
        resultMsg: "테스트 승인 성공",
        tid: tid,
        orderId: orderId,
        amount: amount,
        approvedAt: new Date().toISOString(),
        paymentMethod: "card",
        cardName: "테스트카드"
      };
    } else {
      // 실제 환경에서만 나이스페이 API 호출
      const approvalResponse = await fetch(
        `${process.env.NICEPAY_API_URL}/v1/payments/${tid}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${Buffer.from(
              `${process.env.NICEPAY_CLIENT_ID}:${process.env.NICEPAY_SECRET_KEY}`
            ).toString("base64")}`,
          },
          body: JSON.stringify({
            orderId: orderId,
            amount: amount,
          }),
        }
      );

      approvalResult = await approvalResponse.json();

      if (!approvalResponse.ok || approvalResult.resultCode !== "0000") {
        console.error("나이스페이 승인 실패:", approvalResult);
        return NextResponse.json(
          {
            error: "결제 승인에 실패했습니다.",
            details: approvalResult.resultMsg
          },
          { status: 400 }
        );
      }
    }

    // 여기서는 데이터베이스 업데이트 없이 로그만 출력 (테스트 목적)
    console.log("=== 나이스페이 결제 승인 성공 ===");
    console.log("사용자:", session.user.email);
    console.log("거래번호:", tid);
    console.log("주문번호:", orderId);
    console.log("결제금액:", amount);
    console.log("상품명:", itemName);
    console.log("요금제:", plan);
    console.log("승인결과:", approvalResult);
    console.log("================================");

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: "결제가 성공적으로 완료되었습니다.",
      paymentInfo: {
        tid: tid,
        orderId: orderId,
        amount: amount,
        itemName: itemName,
        plan: plan,
        approvedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error("결제 승인 처리 오류:", error);
    return NextResponse.json(
      { error: "결제 승인 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}