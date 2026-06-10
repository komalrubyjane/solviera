import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ORDERS_FILE = path.join(process.cwd(), "orders.json");

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
    const { shipping, payment, items, total } = body;

    if (!shipping || !shipping.email || !shipping.name || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Incomplete shipping details or empty cart." },
        { status: 400 }
      );
    }

    if (!payment || !payment.number || !payment.expiry) {
      return NextResponse.json(
        { success: false, message: "Secure payment credentials missing." },
        { status: 400 }
      );
    }

    // Generate unique order reference
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const orderId = `SLV-${randomNum}`;

    const orders = readJSONFile(ORDERS_FILE, []);
    const newOrder = {
      orderId,
      timestamp: new Date().toISOString(),
      shipping: {
        name: shipping.name,
        email: shipping.email,
        address: shipping.address,
        city: shipping.city,
        zip: shipping.zip,
      },
      items,
      total,
      status: "Processing in Atelier",
    };

    orders.push(newOrder);
    writeJSONFile(ORDERS_FILE, orders);

    console.log(`[Solviera Backend] Luxury Order Placed: ${orderId} | Total: ₹${total} | Items: ${items.length}`);

    return NextResponse.json({
      success: true,
      orderId,
      message: "Payment mock authorization successful. Order created in Solviera Atelier.",
    });
  } catch (error) {
    console.error("Checkout API error:", error);
    return NextResponse.json(
      { success: false, message: "Secure checkout pipeline encountered an error." },
      { status: 500 }
    );
  }
}
