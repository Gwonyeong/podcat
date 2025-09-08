export interface SlackNotificationData {
  success: boolean;
  schedulerName: string;
  categoryName: string;
  audioTitle?: string;
  audioId?: number;
  error?: string;
  executionTime: Date;
  promptMode?: string;
  usedTopic?: string;
}

export async function sendSlackNotification(data: SlackNotificationData): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('SLACK_WEBHOOK_URL not configured, skipping Slack notification');
    return;
  }

  try {
    const message = createSlackMessage(data);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Slack webhook failed with status: ${response.status}`);
    }

    console.log('Slack notification sent successfully');
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
  }
}

function createSlackMessage(data: SlackNotificationData) {
  const timestamp = data.executionTime.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Seoul'
  });

  if (data.success) {
    // Success notification
    const fields = [
      {
        title: "스케줄러",
        value: data.schedulerName,
        short: true
      },
      {
        title: "카테고리",
        value: data.categoryName,
        short: true
      },
      {
        title: "오디오 제목",
        value: data.audioTitle || "제목 없음",
        short: false
      },
      {
        title: "실행 시간",
        value: timestamp,
        short: true
      },
      {
        title: "콘텐츠 모드",
        value: getModeDisplayName(data.promptMode),
        short: true
      }
    ];

    if (data.usedTopic) {
      fields.push({
        title: "사용된 주제",
        value: data.usedTopic,
        short: false
      });
    }

    if (data.audioId) {
      fields.push({
        title: "오디오 ID",
        value: `#${data.audioId}`,
        short: true
      });
    }

    return {
      attachments: [
        {
          color: "good",
          title: "🎙️ 오디오 자동 생성 성공",
          text: "새로운 팟캐스트 오디오가 성공적으로 생성되었습니다.",
          fields,
          footer: "Podcat Audio Generator",
          ts: Math.floor(data.executionTime.getTime() / 1000)
        }
      ]
    };
  } else {
    // Error notification
    return {
      attachments: [
        {
          color: "danger",
          title: "❌ 오디오 자동 생성 실패",
          text: "팟캐스트 오디오 생성 중 오류가 발생했습니다.",
          fields: [
            {
              title: "스케줄러",
              value: data.schedulerName,
              short: true
            },
            {
              title: "카테고리",
              value: data.categoryName,
              short: true
            },
            {
              title: "오류 메시지",
              value: `\`\`\`${data.error || "알 수 없는 오류"}\`\`\``,
              short: false
            },
            {
              title: "실행 시간",
              value: timestamp,
              short: true
            },
            {
              title: "콘텐츠 모드",
              value: getModeDisplayName(data.promptMode),
              short: true
            }
          ],
          footer: "Podcat Audio Generator",
          ts: Math.floor(data.executionTime.getTime() / 1000)
        }
      ]
    };
  }
}

function getModeDisplayName(mode?: string): string {
  switch (mode) {
    case 'perplexity':
      return '🔍 Perplexity 검색';
    case 'list':
      return '📋 주제 리스트';
    case 'single':
    default:
      return '📝 단일 프롬프트';
  }
}