import { createApi } from "unsplash-js";
import prisma from "./prisma";
import { uploadToSupabase, generateStorageKey } from "./supabase";
import Anthropic from "@anthropic-ai/sdk";

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY!,
});

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY!,
});

export interface AudioSchedulerWithCategory {
  id: number;
  name: string;
  categoryId: number;
  prompt: string;
  promptMode: string;
  topicList: unknown;
  currentTopicIndex: number;
  usePerplexity: boolean;
  perplexitySystemPrompt: string | null;
  publishDateOffset: number;
  cronExpression: string;
  isActive: boolean;
  lastRunAt: Date | null;
  nextRunAt: Date | null;
  totalGenerated: number;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: number;
    name: string;
    isFree: boolean;
    presenterImage: string | null;
    presenterName: string | null;
    presenterPersona: string | null;
    presenterVoiceId: string | null;
  };
}

interface Topic {
  title: string;
  description?: string;
}

// Perplexity API를 사용하여 웹 검색 수행
async function searchWithPerplexity(
  query: string,
  systemPrompt: string
): Promise<string> {
  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: query,
          },
        ],
        max_tokens: 1000,
        temperature: 0.2,
        top_p: 0.9,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: "month",
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    console.log("Perplexity 검색 결과:", response);
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Perplexity 검색 실패:", error);
    throw new Error("Perplexity 검색에 실패했습니다");
  }
}

// 주제 리스트에서 다음 주제 가져오기
async function getNextTopicFromList(
  scheduler: AudioSchedulerWithCategory
): Promise<{ topic: Topic; newIndex: number } | null> {
  if (!scheduler.topicList || scheduler.promptMode !== "list") {
    return null;
  }

  let topics: Topic[] = [];
  try {
    if (typeof scheduler.topicList === "string") {
      topics = JSON.parse(scheduler.topicList);
    } else if (Array.isArray(scheduler.topicList)) {
      topics = scheduler.topicList;
    } else {
      console.error(
        "주제 리스트 형식이 올바르지 않습니다:",
        scheduler.topicList
      );
      return null;
    }
  } catch (error) {
    console.error("주제 리스트 파싱 실패:", error);
    return null;
  }

  if (!Array.isArray(topics) || topics.length === 0) {
    return null;
  }

  const currentIndex = scheduler.currentTopicIndex;

  // 모든 주제를 처리한 경우
  if (currentIndex >= topics.length) {
    console.log(`스케줄러 ${scheduler.id}: 모든 주제를 처리했습니다.`);
    return null;
  }

  return {
    topic: topics[currentIndex],
    newIndex: currentIndex + 1,
  };
}

// 대본 검수 - 진행자가 실제로 말하지 않는 부분 제거
async function validateAndCleanScript(
  script: string,
  categoryName: string
): Promise<string> {
  try {
    const validationPrompt = `다음 팟캐스트 대본을 검수해주세요.

아래 대본에서 진행자가 실제로 말하지 않는 부분을 모두 제거하고, 오직 진행자가 직접 발화하는 텍스트만 남겨주세요.

제거해야 할 요소들:
1. 배경음악 지시문 (예: "(차분한 배경음악이 깔리며)", "[BGM 시작]")
2. 효과음 지시문 (예: "(종소리)", "[효과음: 박수]")
3. 무대 지시문 (예: "(잠시 멈춤)", "(미소를 지으며)")
4. 해설이나 설명 (예: "진행자가 말한다", "~한 목소리로")
5. 감정 표현 지시 (예: "(감동적으로)", "(열정적으로)")
6. 시각적 지시문 (예: "(자료 화면 제시)", "(그래프를 보여주며)")
7. 괄호, 대괄호, 꺾쇠괄호로 둘러싸인 모든 지시문
8. 이모지나 특수문자 장식

오직 진행자가 마이크 앞에서 실제로 말하는 대사만 남겨주세요.
문장 부호(마침표, 쉼표, 물음표, 느낌표)는 유지하되, 불필요한 줄바꿈은 정리해주세요.

카테고리: ${categoryName}

원본 대본:
${script}

검수된 대본 (진행자의 실제 발화만):`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: validationPrompt,
        },
      ],
    });

    let cleanedScript = response.content[0].type === 'text' ? response.content[0].text : '';

    // 추가 정리: 혹시 남아있을 수 있는 괄호 내용 제거
    cleanedScript = cleanedScript
      .replace(/\([^)]*\)/g, "") // 소괄호 내용 제거
      .replace(/\[[^\]]*\]/g, "") // 대괄호 내용 제거
      .replace(/<[^>]*>/g, "") // 꺾쇠괄호 내용 제거
      .replace(/\{[^}]*\}/g, "") // 중괄호 내용 제거
      .replace(/\s+/g, " ") // 연속된 공백을 하나로
      .replace(/^\s+|\s+$/gm, "") // 각 줄의 앞뒤 공백 제거
      .split("\n")
      .filter((line) => line.trim().length > 0) // 빈 줄 제거
      .join("\n\n"); // 문단 간격 재설정

    console.log("대본 검수 완료: 지시문 및 불필요한 요소 제거");
    return cleanedScript;
  } catch (error) {
    console.error("대본 검수 실패:", error);
    // 검수 실패 시 원본 반환 (최소한의 정리만 수행)
    return script
      .replace(/\([^)]*\)/g, "")
      .replace(/\[[^\]]*\]/g, "")
      .replace(/<[^>]*>/g, "")
      .replace(/\{[^}]*\}/g, "")
      .trim();
  }
}

// Claude를 사용하여 대본 생성 (모드별 처리)
async function generateScript(
  scheduler: AudioSchedulerWithCategory,
  contentPrompt?: string
): Promise<{ script: string; title: string; usedTopic?: Topic }> {
  try {
    let finalPrompt = contentPrompt || scheduler.prompt;
    let usedTopic: Topic | undefined;

    // 모드별 처리
    switch (scheduler.promptMode) {
      case "perplexity":
        if (scheduler.usePerplexity && scheduler.perplexitySystemPrompt) {
          console.log("Perplexity 검색 실행 중...");
          const searchResult = await searchWithPerplexity(
            scheduler.prompt,
            scheduler.perplexitySystemPrompt
          );
          finalPrompt = `${scheduler.perplexitySystemPrompt}\n\n검색 결과:\n${searchResult}`;
        }
        break;

      case "list":
        const topicData = await getNextTopicFromList(scheduler);
        if (!topicData) {
          throw new Error(
            "사용 가능한 주제가 없습니다. 주제 리스트를 확인해주세요."
          );
        }

        usedTopic = topicData.topic;
        finalPrompt = topicData.topic.title;
        if (topicData.topic.description) {
          finalPrompt += `: ${topicData.topic.description}`;
        }

        // 현재 주제 인덱스 업데이트
        await prisma.audioScheduler.update({
          where: { id: scheduler.id },
          data: { currentTopicIndex: topicData.newIndex },
        });
        break;

      default: // 'single'
        finalPrompt = scheduler.prompt;
        break;
    }

    const fullPrompt = `당신은 "${
      scheduler.category.name
    }" 카테고리의 전문 팟캐스트 진행자입니다.

진행자 정보:
- 이름: ${scheduler.category.presenterName || "정보 없음"}
- 특성: ${scheduler.category.presenterPersona || "일반적인 전문가"}

다음 주제로 3-5분 분량의 한국어 팟캐스트 대본을 작성해주세요:
1500자 이내
${finalPrompt}

중요한 규칙:
- 진행자가 직접 말하는 대사만 작성하세요
- "진행자가 말한다", "한 목소리로" 등의 설명문은 절대 포함하지 말아주세요
- 무대 지시문, 해설, 묘사는 포함하지 말아주세요
- 오직 진행자의 음성으로 변환될 텍스트만 작성해주세요
- 자연스러운 한국어 대화체로 작성하세요
- 인사말과 마무리 인사를 포함해주세요
- 도입부, 본론, 결론 구조
- 구체적인 예시와 설명 포함`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: fullPrompt,
        },
      ],
    });

    let script = response.content[0].type === 'text' ? response.content[0].text : '';

    // 대본 검수 - 지시문 및 불필요한 요소 제거
    console.log("대본 검수 시작...");
    script = await validateAndCleanScript(script, scheduler.category.name);
    console.log("대본 검수 완료");

    // 제목 생성
    const title = await generateTitle(script, scheduler.category.name);

    return { script, title, usedTopic };
  } catch (error) {
    console.error("대본 생성 실패:", error);
    throw new Error(
      `대본 생성에 실패했습니다: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`
    );
  }
}

// 대본을 요약하여 설명 생성
async function generateSummary(script: string): Promise<string> {
  try {
    const prompt = `다음 팟캐스트 대본을 2-3문장으로 요약해주세요. 핵심 주제와 주요 내용을 포함해주세요:

${script}`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  } catch (error) {
    console.error("요약 생성 실패:", error);
    return "이 에피소드에서는 흥미로운 주제를 다룹니다.";
  }
}

// 대본에서 핵심 제목 생성
async function generateTitle(
  script: string,
  categoryName: string
): Promise<string> {
  try {
    const prompt = `다음 팟캐스트 대본의 핵심 내용을 담은 매력적인 제목을 하나만 생성해주세요.
제목은 15자 이내로, 구체적이고 호기심을 자극하는 형태여야 합니다.
따옴표나 부가 설명 없이 제목만 답변해주세요:

${script.substring(0, 1000)}`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const generatedTitle = response.content[0].type === 'text' ? response.content[0].text.trim() : '';

    // 날짜 추가
    const today = new Date();
    const dateStr = today.toLocaleDateString("ko-KR", {
      month: "numeric",
      day: "numeric",
    });

    return `${generatedTitle} (${dateStr})`;
  } catch (error) {
    console.error("제목 생성 실패:", error);
    const today = new Date();
    const dateStr = today.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return `${categoryName} - ${dateStr}`;
  }
}

// 대본 내용을 기반으로 이미지 검색 키워드 생성
async function generateImageSearchQuery(
  script: string,
  categoryName: string
): Promise<string> {
  try {
    const prompt = `다음 팟캐스트 대본의 핵심 주제와 내용을 분석하여, 해당 주제를 시각적으로 잘 표현할 수 있는 영문 이미지 검색 키워드를 생성해주세요.

요구사항:
1. 팟캐스트나 마이크 관련 키워드는 사용하지 마세요
2. 대본의 실제 주제와 내용에 집중하세요
3. 구체적이고 시각적으로 표현 가능한 키워드 3-5개를 선택하세요
4. 키워드만 공백으로 구분하여 답변해주세요

예시:
- 경제 관련 내용 → "business finance growth economy charts"
- 건강 관련 내용 → "health wellness exercise nutrition lifestyle"
- 기술 관련 내용 → "technology innovation digital modern workspace"
- 자연 관련 내용 → "nature landscape forest mountains peaceful"

분석할 대본 내용:
${script.substring(0, 1000)}

키워드 (영문만):`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    let keywords = response.content[0].type === 'text' ? response.content[0].text.trim() : '';

    // 혹시 한국어나 불필요한 내용이 포함되어 있다면 정리
    keywords = keywords
      .replace(/[가-힣]/g, "") // 한글 제거
      .replace(/[^\w\s]/g, " ") // 특수문자를 공백으로 변경
      .replace(/\s+/g, " ") // 연속된 공백 정리
      .trim();

    // 키워드가 너무 짧거나 없는 경우 기본값 사용
    if (keywords.length < 5) {
      return `${categoryName.toLowerCase()} content modern professional`;
    }

    return keywords;
  } catch (error) {
    console.error("이미지 검색어 생성 실패:", error);
    return `${categoryName.toLowerCase()} content professional modern`;
  }
}

// ElevenLabs 음성 목록 확인 함수 (디버깅용)
export async function getElevenLabsVoices() {
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY가 설정되지 않았습니다.");
    }

    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API 에러: ${response.status}`);
    }

    const data = await response.json();
    return data.voices || [];
  } catch (error) {
    console.error("ElevenLabs 음성 목록 조회 실패:", error);
    throw error;
  }
}

export async function generateAudioFromScheduler(
  scheduler: AudioSchedulerWithCategory
) {
  try {
    console.log(`\n=== 오디오 생성 시작 ===`);
    console.log(`스케줄러 ID: ${scheduler.id}, 카테고리: ${scheduler.category.name}`);
    console.log(`사용할 Voice ID: ${scheduler.category.presenterVoiceId}`);

    // Voice ID 유효성 사전 검사 (카테고리의 Voice ID 확인)
    if (!scheduler.category.presenterVoiceId || scheduler.category.presenterVoiceId.trim() === '') {
      throw new Error(
        `카테고리 '${scheduler.category.name}'에 Voice ID가 설정되지 않았습니다. 카테고리 설정을 확인해주세요.`
      );
    }

    // 1. Generate script based on mode
    console.log(`대본 생성 중... (모드: ${scheduler.promptMode})`);
    const { script, title, usedTopic } = await generateScript(scheduler);
    console.log(`대본 생성 및 검수 완료. 길이: ${script.length}자`);

    // 2. Generate summary for description
    console.log("요약 생성 중...");
    const description = await generateSummary(script);

    // 3. Generate image search query and get thumbnail
    console.log("이미지 검색 중...");
    const imageSearchQuery = await generateImageSearchQuery(
      script,
      scheduler.category.name
    );
    const imageUrl = await getUnsplashThumbnail(imageSearchQuery);

    // 4. Generate audio from script
    console.log("음성 생성 중...");
    const audioBuffer = await generateTTSAudio(
      script,
      scheduler.category.presenterVoiceId
    );

    // 5. Upload audio to Supabase
    console.log("오디오 업로드 중...");
    const audioKey = generateStorageKey(
      `category_${scheduler.categoryId}_audio.mp3`
    );
    const audioUrl = await uploadToSupabase(
      audioBuffer,
      "audio",
      audioKey,
      "audio/mpeg"
    );

    // 6. Create audio record in database with generated content
    let finalTitle = title;
    if (scheduler.promptMode === "list" && usedTopic) {
      // 리스트 모드에서는 주제 제목을 사용
      const today = new Date();
      const dateStr = today.toLocaleDateString("ko-KR", {
        month: "numeric",
        day: "numeric",
      });
      finalTitle = `${usedTopic.title} (${dateStr})`;
    }

    // 게시 일자 계산 (실행 시점 + 오프셋)
    const publishDate = new Date();
    publishDate.setDate(publishDate.getDate() + scheduler.publishDateOffset);

    const audio = await prisma.audio.create({
      data: {
        title: finalTitle,
        publishDate,
        filePath: audioUrl,
        imageUrl,
        categoryId: scheduler.categoryId,
        description, // 생성된 요약 사용
        script, // 생성된 대본 사용 (프롬프트가 아닌)
        duration: Math.floor(audioBuffer.length / 16000), // Approximate duration
      },
    });

    // Create generated audio record
    await prisma.generatedAudio.create({
      data: {
        schedulerId: scheduler.id,
        audioId: audio.id,
      },
    });

    // Update scheduler stats
    await prisma.audioScheduler.update({
      where: { id: scheduler.id },
      data: {
        lastRunAt: new Date(),
        totalGenerated: scheduler.totalGenerated + 1,
      },
    });

    return {
      success: true,
      audioId: audio.id,
      usedTopic,
    };
  } catch (error) {
    console.error("Error generating audio from scheduler:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function generateTTSAudio(
  text: string,
  voiceId: string
): Promise<Buffer> {
  try {
    console.log(`TTS 생성 시도: Voice ID=${voiceId}, 텍스트 길이=${text.length}`);

    // API 키 존재 확인
    if (!process.env.ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY가 환경변수에 설정되지 않았습니다.");
    }

    // Voice ID 유효성 검사
    if (!voiceId || voiceId.trim() === '') {
      throw new Error("Voice ID가 비어있거나 유효하지 않습니다.");
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text.slice(0, 5000), // 텍스트 길이 제한 (ElevenLabs 제한)
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`ElevenLabs API 응답 실패: ${response.status}`, errorData);

      if (response.status === 404) {
        throw new Error(
          `음성 ID를 찾을 수 없습니다 (${voiceId}). ` +
          `ElevenLabs 대시보드에서 Voice Lab에 음성이 추가되어 있는지 확인해주세요. ` +
          `Voice Library의 음성을 사용하려면 먼저 Voice Lab에 추가해야 합니다.`
        );
      } else if (response.status === 401) {
        throw new Error(
          `ElevenLabs API 인증 실패. API 키를 확인해주세요.`
        );
      } else if (response.status === 400) {
        throw new Error(
          `ElevenLabs API 요청 오류: ${errorData}. Voice ID(${voiceId}) 또는 요청 형식을 확인해주세요.`
        );
      }

      throw new Error(
        `ElevenLabs API error: ${response.status} - ${errorData}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log(`TTS 생성 성공: Voice ID=${voiceId}, 오디오 크기=${arrayBuffer.byteLength} bytes`);
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("TTS 오디오 생성 실패:", error);
    throw error;
  }
}

async function getUnsplashThumbnail(query: string): Promise<string | null> {
  try {
    console.log(`이미지 검색어: "${query}"`);

    // 더 많은 결과를 가져와서 랜덤하게 선택
    const perPage = 10;
    const result = await unsplash.search.getPhotos({
      query: query,
      page: 1,
      perPage: perPage,
      orientation: "landscape",
      orderBy: "relevant", // 관련성 순으로 정렬
    });

    if (result.errors) {
      console.error("Unsplash API errors:", result.errors);

      // 검색 실패 시 더 일반적인 키워드로 재시도
      console.log("일반적인 키워드로 재검색 시도...");
      const fallbackQuery = "modern professional workspace";
      const fallbackResult = await unsplash.search.getPhotos({
        query: fallbackQuery,
        page: 1,
        perPage: perPage,
        orientation: "landscape",
      });

      if (
        !fallbackResult.errors &&
        fallbackResult.response?.results.length > 0
      ) {
        const randomIndex = Math.floor(
          Math.random() * fallbackResult.response.results.length
        );
        return fallbackResult.response.results[randomIndex].urls.regular;
      }

      return null;
    }

    const photos = result.response?.results;
    if (photos && photos.length > 0) {
      // 여러 결과 중 랜덤하게 선택 (다양성 확보)
      const randomIndex = Math.floor(Math.random() * photos.length);
      const selectedPhoto = photos[randomIndex];

      console.log(
        `이미지 선택: ${selectedPhoto.alt_description || "No description"}`
      );
      return selectedPhoto.urls.regular;
    }

    // 검색 결과가 없는 경우 키워드를 단순화해서 재시도
    console.log("검색 결과가 없어 단순화된 키워드로 재검색...");
    const simplifiedKeywords = query.split(" ").slice(0, 2).join(" "); // 처음 2개 키워드만 사용

    if (simplifiedKeywords !== query && simplifiedKeywords.length > 0) {
      const retryResult = await unsplash.search.getPhotos({
        query: simplifiedKeywords,
        page: 1,
        perPage: perPage,
        orientation: "landscape",
      });

      if (!retryResult.errors && retryResult.response?.results.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * retryResult.response.results.length
        );
        return retryResult.response.results[randomIndex].urls.regular;
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching Unsplash image:", error);

    // 최종 fallback - 아주 일반적인 이미지
    try {
      const finalFallback = await unsplash.search.getPhotos({
        query: "abstract modern design",
        page: 1,
        perPage: 5,
        orientation: "landscape",
      });

      if (!finalFallback.errors && finalFallback.response?.results.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * finalFallback.response.results.length
        );
        return finalFallback.response.results[randomIndex].urls.regular;
      }
    } catch (finalError) {
      console.error("Final fallback also failed:", finalError);
    }

    return null;
  }
}
