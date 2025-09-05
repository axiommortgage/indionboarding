import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const mode = searchParams.get('mode') || 'stream';

  console.log('S3 Proxy fetching:', url);

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  // Decode the URL if it's encoded
  let decodedUrl = decodeURIComponent(url);

  // Add region to S3 URL if missing
  if (decodedUrl.includes('s3.amazonaws.com') && !decodedUrl.includes('s3.us-east-1.amazonaws.com')) {
    decodedUrl = decodedUrl.replace('s3.amazonaws.com', 's3.us-east-1.amazonaws.com');
  }

  console.log('S3 Proxy fetching (modified URL):', decodedUrl);

  try {
    // If mode is 'check', just do a HEAD request to verify the file exists
    if (mode === 'check') {
      const response = await fetch(decodedUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return NextResponse.json({ success: true });
    }

    // Otherwise, stream the file - NO AUTH HEADER FOR S3
    const response = await fetch(decodedUrl, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'User-Agent': 'Mozilla/5.0 NextJS Proxy'
      },
      // Add timeout for safety
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Get the response body as array buffer
    const arrayBuffer = await response.arrayBuffer();

    // Set appropriate content type and other headers
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Create response with proper headers
    const proxyResponse = new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Set CORS headers to allow access
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Range',
        // Set cache control headers to prevent all caching
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    return proxyResponse;
  } catch (error) {
    console.error('S3 Proxy Error:', error);

    let errorMessage = 'Failed to fetch file';
    let errorDetails: any = { info: 'No response details available' };

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    // Return a more detailed error response
    return NextResponse.json({
      error: errorMessage,
      message: error instanceof Error ? error.message : 'Unknown error',
      url: decodedUrl,
      details: errorDetails
    }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Range'
    }
  });
}
