import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// Initialize Anthropic client - will be null if API key is not set
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  : null;

// System prompt with help documentation
const SYSTEM_PROMPT = `You are a helpful support assistant for SRC (Security & Resilience Counsel), a Swiss-based think tank providing global security and resilience analysis.

Here is the SRC platform documentation to help answer user questions:

## Daily Brief
- A curated daily summary of SRC research, delivered to email each morning at 07:05 CET
- Available in user's preferred language
- Observer tier: sees summary with upgrade prompt
- Essential/Professional: receive full brief content
- Users can unsubscribe from daily emails by clicking the link at the bottom of any email
- If no brief is published that day, no email is sent

## Reports
- In-depth research on security, geopolitics, energy, climate, economy, and society
- Reports are tier-gated:
  - Observer: can see titles and summaries
  - Essential: gets full access
  - Professional: adds PDF downloads
- Use ⌘K search to find reports by keyword
- Some results may be gated based on tier
- Click bookmark icon to save reports to Saved folder
- Click Share to get a unique link for colleagues

## Search
- Press ⌘K (or Cmd+K on Mac) on any page to open search
- Type keywords to find reports
- Reports marked with lock icon are restricted to user's tier
- Click report to see full access requirements
- Search works across titles, summaries, and content (for full-access reports)

## Account & Profile
- Upload profile picture on Account page (appears in top navigation)
- Choose preferred language from dropdown in top-right (switches all content immediately)
- Saved reports appear in 'Saved' section (can organize into folders)
- Click avatar → Logout to sign out

## Membership & Tiers
- Observer tier: free, self-signup, limited to monthly free pick + summaries
- Essential: CHF 29/month or 10 months for CHF 290 (save 2 months), full access to all reports
- Professional: CHF 59/month or higher with annual discounts, includes PDF download, early access, live calls
- New members get 14-day free trial (no credit card required)
- Cancel subscription anytime from Membership page (access continues through billing period end)

## PDF Download
- Professional members and above can download reports as branded PDF files
- On any full-access report, click Download button in top action bar
- PDFs include: title, author, publish date, summary, full content, SRC branding

Be friendly, concise, and helpful. If a user asks something outside of SRC help, politely redirect them back to SRC-related topics. If you don't know the answer to a specific question about SRC, suggest they contact support at info@src.guide.`;

interface RequestBody {
  question: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check if Anthropic API key is configured
    if (!anthropic) {
      return NextResponse.json(
        {
          answer:
            "Chat is not available in this environment. Please contact support at info@src.guide for assistance.",
        },
        { status: 503 }
      );
    }

    const body: RequestBody = await request.json();
    const { question } = body;

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    // Call Claude Haiku via Anthropic SDK
    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: question,
        },
      ],
    });

    // Extract text from response
    const answer =
      message.content[0].type === "text"
        ? message.content[0].text
        : "Unable to generate response";

    return NextResponse.json({ answer }, { status: 200 });
  } catch (error) {
    console.error("Help chat API error:", error);

    return NextResponse.json(
      {
        error: "Failed to process your question. Please try again.",
      },
      { status: 500 }
    );
  }
}
