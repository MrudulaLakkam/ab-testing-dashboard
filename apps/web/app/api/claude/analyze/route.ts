import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-1',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error?.message || 'Claude API Error' },
        { status: response.status }
      );
    }

    const message = await response.json();
    const textContent = message.content.find((block: any) => block.type === 'text');

    if (textContent) {
      return NextResponse.json({
        success: true,
        analysis: textContent.text,
      });
    }

    return NextResponse.json(
      { error: 'No text response from Claude' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('Claude API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze' },
      { status: 500 }
    );
  }
}
