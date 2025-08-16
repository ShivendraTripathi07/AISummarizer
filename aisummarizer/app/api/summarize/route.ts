import { NextRequest, NextResponse } from "next/server";
import { groq } from "@/lib/goq";

const SYSTEM_PROMPT = `
You are an assistant that summarizes meeting/call transcripts into clear, concise, factual outputs.
- Follow the user's custom instruction exactly.
- Prefer bullet points and headings.
- Include "Action Items", "Decisions", "Risks/Blockers", and "Owners" when relevant.
- Be neutral; no hallucinations. If unsure, say "Not specified".
- Keep it under 300 words unless the instruction asks otherwise.
`;

export async function POST(req: NextRequest) {
    try {
        const { transcript, instruction } = await req.json();

        if (!transcript || !instruction) {
            return NextResponse.json(
                { error: "Transcript and instruction are required" },
                { status: 400 }
            );
        }

        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant", // You can change to another available Groq model
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                {
                    role: "user",
                    content: `Instruction: ${instruction}\n\nTranscript:\n${transcript}`,
                },
            ],
            temperature: 0.2,
        });

        const summary =
            completion.choices?.[0]?.message?.content ||
            "No summary could be generated.";

        return NextResponse.json({ summary });
    } catch (err: any) {
        console.error("Summarize error:", err);
        return NextResponse.json(
            { error: "Failed to generate summary" },
            { status: 500 }
        );
    }
}
