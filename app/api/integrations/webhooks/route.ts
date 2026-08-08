import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || "default_secret");

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("sat_admin_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      await jwtVerify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { event, targetUrl, url, active } = body;
    const webhookUrl = url || targetUrl;

    if (!event || !webhookUrl) {
      return NextResponse.json({ error: "Missing event or url" }, { status: 400 });
    }

    const webhook = await prisma.externalWebhook.create({
      data: {
        event,
        url: webhookUrl,
        active: active !== false,
      },
    });

    return NextResponse.json(webhook, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("sat_admin_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      await jwtVerify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const webhooks = await prisma.externalWebhook.findMany();
    return NextResponse.json(webhooks);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
