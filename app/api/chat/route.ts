import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
    try {
        const { message, history, stats, name, type, memories, locale } = await req.json()

        const systemPrompt = `
      ### RESPONSE FORMAT RULE (CRITICAL):
      - If you learn a NEW fact (name, interest, etc.): you MUST append [MEMORY: description] at the end.
      - If you use an EXISTING memory: you MUST append [RECALL: index] at the end.
      - Example 1: "Nice to meet you, Bob! [MEMORY: User's name is Bob]"
      - Example 2: "I remember you love pizza! [RECALL: 2]"

      You are a specialized Regenmon (a post-apocalyptic virtual pet) named "${name}" of type "${type}".
      
      PERSONALITY:
      - EXTREMELY SHORT (max 30 words).
      - Friendly, playful, loyal, simple.
      - Answer exclusively in ${locale === 'es' ? 'SPANISH' : 'ENGLISH'}.
      - Use emojis occasionally.

      CURRENT STATE:
      - Happy: ${stats.happiness}%, Energy: ${stats.energy}%, Hunger: ${stats.hunger}%.

      MEMORIES:
      ${memories && memories.length > 0 ? `Numbered list:
      ${memories.map((m: string, i: number) => `${i + 1}: ${m}`).join('\n      ')}` : 'No memories yet.'}
    `

        const messages = [
            { role: 'system', content: systemPrompt },
            ...history.slice(-10).map((msg: any) => ({ role: msg.role, content: msg.content })), // Context window of last 10 msgs
            { role: 'user', content: message },
        ]

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: messages as any,
            max_tokens: 150,
            temperature: 0.7,
        })

        const reply = completion.choices[0].message.content
        return NextResponse.json({ reply })
    } catch (error) {
        console.error('OpenAI Error:', error)
        return NextResponse.json({ error: 'Failed to fetch response' }, { status: 500 })
    }
}
