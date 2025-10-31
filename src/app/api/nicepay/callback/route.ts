import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 나이스페이에서 보내는 콜백 데이터 파싱
    const formData = await request.formData();
    const callbackData = Object.fromEntries(formData.entries());

    console.log("=== 나이스페이 콜백 데이터 ===");
    console.log(callbackData);
    console.log("=============================");

    // 결제 결과에 따른 처리
    if (callbackData.AuthResultCode === "0000") {
      // 결제 성공
      console.log("결제 성공 콜백 수신:", {
        tid: callbackData.TID,
        orderId: callbackData.Moid,
        amount: callbackData.Amt,
        authDate: callbackData.AuthDate,
      });

      return NextResponse.json({
        success: true,
        message: "결제 성공",
      });
    } else {
      // 결제 실패
      console.log("결제 실패 콜백 수신:", {
        resultCode: callbackData.AuthResultCode,
        resultMsg: callbackData.AuthResultMsg,
        orderId: callbackData.Moid,
      });

      return NextResponse.json({
        success: false,
        message: callbackData.AuthResultMsg || "결제 실패",
      });
    }

  } catch (error) {
    console.error("콜백 처리 오류:", error);
    return NextResponse.json(
      { error: "콜백 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// GET 요청도 처리 (나이스페이에서 GET으로 콜백을 보낼 수도 있음)
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const callbackData = Object.fromEntries(url.searchParams.entries());

    console.log("=== 나이스페이 GET 콜백 데이터 ===");
    console.log(callbackData);
    console.log("=================================");

    return NextResponse.json({
      success: true,
      message: "콜백 수신 완료",
    });

  } catch (error) {
    console.error("GET 콜백 처리 오류:", error);
    return NextResponse.json(
      { error: "콜백 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}