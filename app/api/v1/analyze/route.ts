import { NextResponse } from 'next/server';
import { SpamEngine } from '../../../../../lib/SpamEngine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message content is required.' }, { status: 400 });
    }

    // Process through the Spam Engine
    const result = SpamEngine.analyze(message);

    // In the future, log result to DB here using Prisma
    // e.g., await prisma.spamLog.create({ ... })

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in spam analysis:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
