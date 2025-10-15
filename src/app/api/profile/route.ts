import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api-client';
import type { Profile } from '@/types/api';

export async function GET(request: NextRequest) {
  try {
    const profile = await apiClient.get<Profile>('/profiles/me');
    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
      { status: error.status || 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const profile = await apiClient.put<Profile>('/profiles/me', body);
    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: error.status || 500 }
    );
  }
}
