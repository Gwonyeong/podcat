import { createApi } from "unsplash-js";
import prisma from "./prisma";
import { uploadToSupabase, generateStorageKey } from "./supabase";
import { GoogleGenerativeAI } from "@google/generative-ai";

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY!,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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
  elevenLabsVoiceId: string;
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
      console.error("주제 리스트 형식이 올바르지 않습니다:", scheduler.topicList);
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
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

    const result = await model.generateContent(validationPrompt);
    const response = result.response;
    let cleanedScript = response.text();
    
    // 추가 정리: 혹시 남아있을 수 있는 괄호 내용 제거
    cleanedScript = cleanedScript
      .replace(/\([^)]*\)/g, '') // 소괄호 내용 제거
      .replace(/\[[^\]]*\]/g, '') // 대괄호 내용 제거
      .replace(/<[^>]*>/g, '') // 꺾쇠괄호 내용 제거
      .replace(/\{[^}]*\}/g, '') // 중괄호 내용 제거
      .replace(/\s+/g, ' ') // 연속된 공백을 하나로
      .replace(/^\s+|\s+$/gm, '') // 각 줄의 앞뒤 공백 제거
      .split('\n')
      .filter(line => line.trim().length > 0) // 빈 줄 제거
      .join('\n\n'); // 문단 간격 재설정
    
    console.log('대본 검수 완료: 지시문 및 불필요한 요소 제거');
    return cleanedScript;
  } catch (error) {
    console.error('대본 검수 실패:', error);
    // 검수 실패 시 원본 반환 (최소한의 정리만 수행)
    return script
      .replace(/\([^)]*\)/g, '')
      .replace(/\[[^\]]*\]/g, '')
      .replace(/<[^>]*>/g, '')
      .replace(/\{[^}]*\}/g, '')
      .trim();
  }
}

// Gemini를 사용하여 대본 생성 (모드별 처리)
async function generateScript(
  scheduler: AudioSchedulerWithCategory,
  contentPrompt?: string
): Promise<{ script: string; title: string; usedTopic?: Topic }> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
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

다음 주제로 5-7분 분량의 한국어 팟캐스트 대본을 작성해주세요:

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

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    let script = response.text();
    
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `다음 팟캐스트 대본을 2-3문장으로 요약해주세요. 핵심 주제와 주요 내용을 포함해주세요:

${script}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `다음 팟캐스트 대본의 핵심 내용을 담은 매력적인 제목을 하나만 생성해주세요.
제목은 15자 이내로, 구체적이고 호기심을 자극하는 형태여야 합니다.
따옴표나 부가 설명 없이 제목만 답변해주세요:

${script.substring(0, 1000)}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedTitle = response.text().trim();

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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `다음 팟캐스트 대본의 주제와 분위기를 나타낼 수 있는 영문 이미지 검색 키워드 3-4개를 생성해주세요.
키워드만 공백으로 구분하여 답변해주세요 (예: technology innovation future digital):

${script.substring(0, 800)}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const keywords = response.text().trim();

    return `${keywords} podcast studio microphone`;
  } catch (error) {
    console.error("이미지 검색어 생성 실패:", error);
    return `${categoryName} podcast microphone`;
  }
}

export async function generateAudioFromScheduler(
  scheduler: AudioSchedulerWithCategory
) {
  try {
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
      scheduler.elevenLabsVoiceId
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

    const audio = await prisma.audio.create({
      data: {
        title: finalTitle,
        publishDate: new Date(),
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
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY!,
        },
        body: JSON.stringify({
          text,
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
      throw new Error(
        `ElevenLabs API error: ${response.status} - ${errorData}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("Error generating TTS audio:", error);
    throw error;
  }
}

async function getUnsplashThumbnail(query: string): Promise<string | null> {
  try {
    const result = await unsplash.search.getPhotos({
      query: query, // 이미 처리된 검색어 사용
      page: 1,
      perPage: 1,
      orientation: "landscape",
    });

    if (result.errors) {
      console.error("Unsplash API errors:", result.errors);
      return null;
    }

    const photo = result.response?.results[0];
    if (photo) {
      // Use medium size image
      return photo.urls.regular;
    }

    return null;
  } catch (error) {
    console.error("Error fetching Unsplash image:", error);
    return null;
  }
}
