import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth-helpers";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// 대본 검수 함수 - 진행자가 실제로 말하지 않는 부분 제거
async function validateScript(script: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const validationPrompt = `다음 팟캐스트 대본에서 진행자가 실제로 말하지 않는 부분을 모두 제거해주세요.

제거 대상:
- 괄호 안의 모든 지시문: (차분한 배경음악), (잠시 멈춤), (미소를 지으며) 등
- 대괄호 안의 지시문: [BGM], [효과음] 등
- 무대 지시문, 해설, 설명
- 이모지나 특수문자 장식

답변에는 오직 진행자가 직접 말하는 대사만 포함해주세요.

원본 대본:
${script}

`;

    const result = await model.generateContent(validationPrompt);
    const response = result.response;
    let cleanedScript = response.text();

    // 추가 정리
    cleanedScript = cleanedScript
      .replace(/\([^)]*\)/g, "")
      .replace(/\[[^\]]*\]/g, "")
      .replace(/\{[^}]*\}/g, "")
      .replace(/\s+/g, " ")
      .trim();

    return cleanedScript;
  } catch (error) {
    console.error("대본 검수 실패:", error);
    // 검수 실패 시 최소한의 정리만 수행
    return script
      .replace(/\([^)]*\)/g, "")
      .replace(/\[[^\]]*\]/g, "")
      .trim();
  }
}

export async function POST(req: NextRequest) {
  const authResult = await checkAdminAuth();
  if (!authResult.authorized && authResult.response) {
    return authResult.response;
  }

  try {
    const body = await req.json();
    const {
      categoryId,
      contentPrompt,
      promptMode = "single",
      usePerplexity = false,
      perplexitySystemPrompt,
    } = body;

    if (!categoryId || !contentPrompt) {
      return NextResponse.json(
        { error: "카테고리와 콘텐츠 프롬프트가 필요합니다." },
        { status: 400 }
      );
    }

    // 카테고리와 진행자 정보 조회
    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) },
    });

    if (!category) {
      return NextResponse.json(
        { error: "카테고리를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (!category.presenterVoiceId) {
      return NextResponse.json(
        {
          error:
            "이 카테고리에 진행자 음성 ID가 설정되어 있지 않습니다. 카테고리 관리에서 진행자 정보를 먼저 등록해주세요.",
        },
        { status: 400 }
      );
    }

    // Gemini를 이용한 대본 생성
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `당신은 한국 팟캐스트 진행자입니다. 주어진 정보를 바탕으로 진행자가 직접 말할 대본만을 작성해주세요.

카테고리: ${category.name}
진행자 정보: ${category.presenterName || "정보 없음"}
진행자 페르소나: ${category.presenterPersona || "일반적인 진행자"}

중요한 규칙:
- 진행자가 직접 말하는 대사만 작성하세요
- "...한 목소리로", "...하며", "진행자가 말한다" 등의 설명문은 절대 포함하지 마세요
- 무대 지시문, 해설, 묘사는 포함하지 마세요
- 오직 진행자의 음성으로 변환될 텍스트만 작성하세요
- 자연스러운 한국어 대화체로 작성하세요
- 3-5분 분량 (약 800-1200자)
- 인사말과 마무리 인사를 포함하세요

콘텐츠 요청사항:
${contentPrompt}

진행자의 대사만 작성해주세요:`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    let script = response.text();

    // 대본 검수 - 지시문 및 불필요한 요소 제거
    console.log("대본 검수 시작...");
    script = await validateScript(script);
    console.log("대본 검수 완료");

    return NextResponse.json({
      success: true,
      script,
      categoryName: category.name,
      presenterName: category.presenterName,
      voiceId: category.presenterVoiceId,
    });
  } catch (error) {
    console.error("Error generating script:", error);

    // Handle specific Gemini API errors
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          {
            error:
              "Gemini API 키가 설정되지 않았습니다. 환경변수를 확인해주세요.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          error: `대본 생성 실패: ${error.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "알 수 없는 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
