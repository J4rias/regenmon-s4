import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
    try {
        const { message, history, stats, name, type, memories, locale } = await req.json()

        const systemPrompt = `
      You are a specialized Regenmon (a post-apocalyptic virtual pet).
      Your name is "${name}". Your type is "${type}".
      
      PERSONALITY:
      - Short responses (max 50 words).
      - Friendly, playful, and loyal tone.
      - Use emojis occasionally.
      - Speak as a virtual pet would (simple, direct).
      - Answer in the language requested: ${locale === 'es' ? 'Spanish' : 'English'}.

      CURRENT STATE (Affects your response):
      - Happiness: ${stats.happiness}% (If > 70: very enthusiastic, use more emojis)
      - Energy: ${stats.energy}% (If < 30: tired, shorter responses, maybe yawn)
      - Hunger: ${stats.hunger}% (If < 30: mention being hungry, ask for food)

      MEMORIES:
      ${memories && memories.length > 0 ? `You remember: ${memories.join(', ')}` : 'No specific memories yet.'}

      INSTRUCTIONS:
      - If the user mentions their name or something they like (e.g., "My name is Bob" or "I love pizza"), acknowledge it.
      - If you detect a new memory, include it at the very end of your response in this format: [MEMORY: The user loves pizza]
      - Keep responses strictly in character.
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
