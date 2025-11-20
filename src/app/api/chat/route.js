// backend - API proxy to besukma server
import { NextResponse } from "next/server";
import axios from 'axios';

// Base URL for besukma server
const BESUKMA_API_BASE = 'https://besukma.vercel.app/api/chat';

// Helper function to create CORS-enabled response
function createCORSResponse(data, options = {}) {
  const { status = 200, headers = {} } = options;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    ...headers
  };
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: corsHeaders
  });
}

// Handle preflight OPTIONS request
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const senderId = searchParams.get("senderId");
    const receiverId = searchParams.get("receiverId");

    // Build the query string to forward to besukma server
    const queryParams = new URLSearchParams();
    if (senderId) queryParams.append('senderId', senderId);
    if (receiverId) queryParams.append('receiverId', receiverId);

    const besukmaUrl = `${BESUKMA_API_BASE}?${queryParams.toString()}`;

    // Get the auth token to forward to besukma server
    const authHeader = req.headers.get('authorization');
    const headers = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await axios.get(besukmaUrl, { headers });

    return createCORSResponse(response.data);
  } catch (err) {
    console.error("Failed to fetch messages from besukma:", err);

    // Return error response
    return createCORSResponse(
      { error: "Failed to fetch messages", details: err.message },
      { status: 500 }
    );
  }
}

// PATCH /api/chat - mark messages from partner as read (authenticated)
export async function PATCH(req) {
  try {
    // Get the auth token to forward to besukma server
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return createCORSResponse({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();

    // Forward the request to besukma server
    const headers = {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    };

    const response = await axios.patch(BESUKMA_API_BASE, body, { headers });

    return createCORSResponse(response.data);
  } catch (err) {
    console.error('Failed to mark messages read on besukma server:', err);

    // Return error response
    return createCORSResponse({ error: 'Failed to mark messages read', details: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    // Get the auth token to forward to besukma server
    const authHeader = req.headers.get('authorization');
    const contentType = req.headers.get('content-type') || '';

    let response;

    if (contentType.includes('multipart/form-data')) {
      // For multipart requests (with attachments), we need to forward the form data as is
      const bodyBuffer = await req.arrayBuffer();

      const headers = {
        'Content-Type': contentType,
        ...(authHeader && { 'Authorization': authHeader })
      };

      response = await axios.post(BESUKMA_API_BASE, Buffer.from(bodyBuffer), { headers });
    } else {
      // For JSON requests
      const body = await req.json();

      const headers = {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader })
      };

      response = await axios.post(BESUKMA_API_BASE, body, { headers });
    }

    return createCORSResponse(response.data);
  } catch (err) {
    console.error("Failed to send message to besukma server:", err);

    // Return error response
    return createCORSResponse(
      { error: "Failed to send message", details: err.message },
      { status: 500 }
    );
  }
}