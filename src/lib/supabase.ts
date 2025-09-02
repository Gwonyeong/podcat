import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// 환경변수에서 버킷 이름 가져오기
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'podcat-files';

export async function uploadToSupabase(
  buffer: Buffer,
  folder: string,
  key: string,
  contentType: string
): Promise<string> {
  try {
    // 폴더 경로를 포함한 전체 경로 생성
    const fullPath = `${folder}/${key}`;
    
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fullPath, buffer, {
        contentType,
        upsert: true
      });

    if (error) {
      console.error('Supabase 업로드 오류:', error);
      throw new Error(`Supabase 업로드 실패: ${error.message}`);
    }

    // 공개 URL 생성
    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fullPath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Supabase 업로드 오류:', error);
    throw new Error('Supabase 업로드 실패');
  }
}

export function generateStorageKey(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const baseName = originalName.split('.').slice(0, -1).join('.');
  
  const sanitizedName = baseName.replace(/[^a-zA-Z0-9가-힣]/g, '_');
  
  return `${timestamp}_${randomString}_${sanitizedName}.${extension}`;
}