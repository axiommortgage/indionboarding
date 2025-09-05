import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1339';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get('populate') || '';
    
    // Build the API URL with populate parameter if provided
    let apiUrl = `${API_URL}/api/branches`;
    if (populate) {
      apiUrl += `?populate=${populate}`;
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching branches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch branches' },
      { status: 500 }
    );
  }
}
