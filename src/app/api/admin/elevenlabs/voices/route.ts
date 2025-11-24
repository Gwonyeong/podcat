import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth-helpers";
import { getElevenLabsVoices } from "@/lib/audio-generator";

export async function GET() {
  const authResult = await checkAdminAuth();
  if (!authResult.authorized && authResult.response) {
    return authResult.response;
  }

  try {
    const voices = await getElevenLabsVoices();

    console.log(`ElevenLabs 사용 가능한 음성 목록 (총 ${voices.length}개):`);
    voices.forEach((voice: { name: string; voice_id: string; category?: string }, index: number) => {
      console.log(`${index + 1}. ${voice.name} (ID: ${voice.voice_id}) - ${voice.category || 'N/A'}`);
    });

    return NextResponse.json({
      success: true,
      voices: voices.map((voice: { name: string; voice_id: string; category?: string; description?: string; labels?: object; preview_url?: string; available_for_tiers?: string[]; settings?: object; sharing?: object }) => ({
        voice_id: voice.voice_id,
        name: voice.name,
        category: voice.category || 'Unknown',
        description: voice.description || '',
        labels: voice.labels || {},
        preview_url: voice.preview_url || null,
        available_for_tiers: voice.available_for_tiers || [],
        settings: voice.settings || null,
        sharing: voice.sharing || null,
      })),
      total: voices.length,
    });
  } catch (error) {
    console.error("ElevenLabs 음성 목록 조회 실패:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "음성 목록 조회 실패",
      },
      { status: 500 }
    );
  }
}