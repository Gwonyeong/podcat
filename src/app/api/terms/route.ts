import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'documents', 'terms-of-service.md');
    const content = fs.readFileSync(filePath, 'utf-8');

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error reading terms of service:', error);
    return NextResponse.json(
      { error: 'Failed to load terms of service' },
      { status: 500 }
    );
  }
}