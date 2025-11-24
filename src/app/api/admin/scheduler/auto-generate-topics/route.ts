import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAdminAuth } from '@/lib/auth-helpers';

export async function POST(req: NextRequest) {
  const authResult = await checkAdminAuth();
  if (!authResult.authorized && authResult.response) {
    return authResult.response;
  }

  try {
    const body = await req.json();
    const { schedulerId } = body;

    if (!schedulerId) {
      return NextResponse.json({ error: 'Scheduler ID is required' }, { status: 400 });
    }

    // Get scheduler with category info
    const scheduler = await prisma.audioScheduler.findUnique({
      where: { id: parseInt(schedulerId) },
      include: {
        category: true,
        generatedAudios: {
          include: {
            audio: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10 // Get last 10 generated topics for reference
        }
      }
    });

    if (!scheduler) {
      return NextResponse.json({ error: 'Scheduler not found' }, { status: 404 });
    }

    if (scheduler.promptMode !== 'list') {
      return NextResponse.json({ error: 'Auto-generation is only available for list mode schedulers' }, { status: 400 });
    }

    if (!scheduler.autoGenerateTopics) {
      return NextResponse.json({ error: 'Auto-generation is not enabled for this scheduler' }, { status: 400 });
    }

    // Get current topic list
    const currentTopics = scheduler.topicList ?
      (Array.isArray(scheduler.topicList) ? scheduler.topicList : JSON.parse(scheduler.topicList as string)) : [];

    // Check if auto-generation is needed
    const remainingTopics = currentTopics.length - scheduler.currentTopicIndex;
    if (remainingTopics > scheduler.topicThreshold) {
      return NextResponse.json({
        message: 'Auto-generation not needed',
        remainingTopics,
        threshold: scheduler.topicThreshold
      });
    }

    // Prepare context for topic generation
    const recentTopics = scheduler.generatedAudios
      .slice(0, 10)
      .map(ga => ga.audio.title)
      .join('\n- ');

    const categoryContext = scheduler.category.presenterPersona || scheduler.category.name;

    // Generate new topics using Claude API
    const newTopics = await generateTopicsWithClaude(
      categoryContext,
      recentTopics,
      scheduler.autoGenerateCount,
      currentTopics
    );

    // Update scheduler with new topics
    const updatedTopicList = [...currentTopics, ...newTopics];

    await prisma.audioScheduler.update({
      where: { id: scheduler.id },
      data: {
        topicList: updatedTopicList
      }
    });

    console.log(`Auto-generated ${newTopics.length} topics for scheduler ${scheduler.name} (ID: ${scheduler.id})`);

    return NextResponse.json({
      success: true,
      generatedTopics: newTopics,
      totalTopics: updatedTopicList.length,
      remainingAfterGeneration: updatedTopicList.length - scheduler.currentTopicIndex
    });

  } catch (error) {
    console.error('Error auto-generating topics:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Error auto-generating topics'
    }, { status: 500 });
  }
}

async function generateTopicsWithClaude(
  categoryContext: string,
  recentTopics: string,
  count: number,
  existingTopics: Array<{ title: string; description?: string }>
): Promise<Array<{ title: string; description?: string }>> {
  const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

  if (!CLAUDE_API_KEY) {
    throw new Error('CLAUDE_API_KEY is not configured');
  }

  const existingTitles = existingTopics.map(t => t.title).join('\n- ');

  const prompt = `당신은 팟캐스트 주제 생성 전문가입니다.

카테고리 컨텍스트: ${categoryContext}

최근 생성된 주제들 (참고용, 중복 방지):
${recentTopics ? `- ${recentTopics}` : '없음'}

기존 주제 리스트 (중복 방지):
${existingTitles ? `- ${existingTitles}` : '없음'}

위 정보를 참고하여 ${count}개의 새로운 팟캐스트 주제를 생성해주세요.
- 기존 주제와 중복되지 않아야 합니다
- 카테고리의 성격에 맞는 주제여야 합니다
- 각 주제는 흥미롭고 구체적이어야 합니다
- 시의성 있는 내용을 포함해주세요

응답은 반드시 다음 JSON 형식으로 해주세요:
[
  {
    "title": "주제 제목",
    "description": "주제에 대한 간단한 설명 (선택사항)"
  }
]`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', errorText);
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      throw new Error('No content received from Claude API');
    }

    // Extract JSON from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON response from Claude');
    }

    const topics = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(topics) || topics.length === 0) {
      throw new Error('Invalid topics format received from Claude');
    }

    return topics.slice(0, count); // Ensure we don't exceed requested count

  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw new Error(`Failed to generate topics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}