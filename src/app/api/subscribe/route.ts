import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SUBSCRIBERS_FILE = path.join(process.cwd(), "subscribers.json");

function readJSONFile(filePath: string, defaultData: any = []) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return defaultData;
  }
}

function writeJSONFile(filePath: string, data: any) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Invalid email address." },
        { status: 400 }
      );
    }

    const subscribers = readJSONFile(SUBSCRIBERS_FILE, []);
    if (subscribers.includes(email)) {
      return NextResponse.json({
        success: true,
        message: "You are already registered on the Solviera Atelier list.",
      });
    }

    subscribers.push(email);
    writeJSONFile(SUBSCRIBERS_FILE, subscribers);

    console.log(`[Solviera Backend] New subscriber registered: ${email}`);

    return NextResponse.json({
      success: true,
      message: "Welcome to Solviera. You have been added to our private collection release mailing list.",
    });
  } catch (error) {
    console.error("Newsletter Subscribe API error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to register subscription at this time." },
      { status: 500 }
    );
  }
}
