import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { Storage } from 'megajs';

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Ensure environment variables are defined
    const megaEmail = process.env.MEGA_EMAIL;
    const megaPassword = process.env.MEGA_PASSWORD;

    if (!megaEmail || !megaPassword) {
      throw new Error('MEGA_EMAIL or MEGA_PASSWORD environment variables are not set');
    }

    // Initialize MEGA storage
    const storage = new Storage({
      email: megaEmail,
      password: megaPassword
    });

    // Wait for login
    await new Promise((resolve, reject) => {
      storage.on('ready', resolve);
      // Explicitly type the error event to bypass TypeScript issue
      storage.on('error' as any, reject);
    });

    // Create visitor data
    const visitors = [{ name, email }];
    const data = JSON.stringify(visitors, null, 2);
    const dataBuffer = Buffer.from(data);

    // Upload to MEGA
    await storage.upload(`visitor-data-${uuidv4()}.json`, dataBuffer).complete;

    return NextResponse.json({ message: 'Visitor data saved successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error saving visitor data:', error);
    return NextResponse.json({ error: `Failed to save visitor data: ${error.message}` }, { status: 500 });
  }
}