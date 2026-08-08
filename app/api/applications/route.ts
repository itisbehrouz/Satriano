import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { verifyAdminRequest } from "@/lib/adminAuth";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      companyName,
      website,
      industry,
      annualVolume,
      fullName,
      jobTitle,
      corpEmail,
      phone,
      needs,
    } = body;

    if (!companyName || !corpEmail || !fullName) {
      return NextResponse.json(
        { error: "Company name, corporate email, and full name are required." },
        { status: 400 }
      );
    }


    const application = await prisma.b2bApplication.create({
      data: {
        companyName,
        website: website || null,
        industry: industry || null,
        annualVolume: annualVolume || null,
        fullName,
        jobTitle: jobTitle || null,
        corpEmail: corpEmail.toLowerCase().trim(),
        phone: phone || null,
        needs: needs || {},
        status: "SUBMITTED",
        emailVerifiedAt: null,
      },
    });

    // Create EmailVerificationToken (24h expiry)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.emailVerificationToken.create({
      data: {
        applicationId: application.id,
        token,
        expiresAt,
      },
    });

    // Send verification email
    const host = req.headers.get("host") || "satriano.vercel.app";
    const protocol = host.includes("localhost") ? "http" : "https";
    const verificationUrl = `${protocol}://${host}/portal/verify-email?token=${token}`;

    await sendVerificationEmail({
      to: application.corpEmail,
      verificationUrl,
    });

    return NextResponse.json({ success: true, application }, { status: 201 });
  } catch (error) {
    console.error("Error creating B2B application:", error);
    return NextResponse.json(
      { error: "Failed to submit B2B partnership application." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const isAuth = await verifyAdminRequest(req);
    if (!isAuth) {
      return NextResponse.json(
        { error: "Unauthorized access to Portal Console applications API." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const applications = await prisma.b2bApplication.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Error fetching B2B applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch B2B applications." },
      { status: 500 }
    );
  }
}
