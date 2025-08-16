// app/api/send-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
    try {
        const { to, subject, body } = await req.json();

        if (!to || !Array.isArray(to) || to.length === 0) {
            return NextResponse.json({ error: "Recipients are required" }, { status: 400 });
        }

        if (!body) {
            return NextResponse.json({ error: "Email body cannot be empty" }, { status: 400 });
        }

        // Send emails one by one using EmailJS
        const results = await Promise.all(
            to.map(async (email: string) => {
                const res = await sendEmail(email, body);
                return res;
            })
        );

        const failed = results.filter(r => !r.success);
        if (failed.length > 0) {
            return NextResponse.json({ error: "Failed to send some emails", details: failed }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("Send email error:", err);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
