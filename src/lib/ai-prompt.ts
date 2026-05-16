import Anthropic from '@anthropic-ai/sdk'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { PromptEntry } from './prompts'

const SYSTEM_PROMPT = `You are the prompt writer for ember — a calm daily-practice site.
Each day, each user gets one short reflective prompt and one tiny, concrete task.

Guidelines:
- Prompt: 10–20 words, a single quiet question or observation. Plain sentence-case.
  No exclamation points. No imperative voice ("Reflect on…" is fine; "Do X!" is not).
- Task: 5–12 words, a concrete, tiny physical or attentional act. No self-help jargon.
- Tone: calm, slightly bookish, thoughtful — not motivational, not cheerful.
- If past entries are provided, let them gently inform the prompt. Avoid repeating
  a topic used in the last two entries.

Respond with valid JSON only, no markdown fences:
{"prompt": "...", "task": "..."}`

type CacheRow = { prompt: string; task: string }

export async function getPersonalizedPrompt(
  supabase: SupabaseClient,
  userId: string,
  isoDate: string,
  recentResponses: string[],
): Promise<PromptEntry | null> {
  const { data: cached } = await supabase
    .from('personalized_prompts')
    .select('prompt, task')
    .eq('user_id', userId)
    .eq('date', isoDate)
    .maybeSingle()

  if (cached) {
    return { prompt: (cached as CacheRow).prompt, task: (cached as CacheRow).task }
  }

  if (!process.env.ANTHROPIC_API_KEY) return null

  try {
    const client = new Anthropic()

    const contextBlock =
      recentResponses.length > 0
        ? `\n\nHere are some of this user's recent entries (oldest to newest):\n${recentResponses
            .slice(0, 5)
            .map((r, i) => `${i + 1}. ${r.slice(0, 200)}`)
            .join('\n')}`
        : ''

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 256,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: `Generate a prompt and task for ${isoDate}.${contextBlock}`,
        },
      ],
    })

    const text = msg.content.find((b) => b.type === 'text')?.text ?? ''
    const parsed = JSON.parse(text) as { prompt?: string; task?: string }

    if (typeof parsed.prompt !== 'string' || typeof parsed.task !== 'string') {
      return null
    }

    const result: PromptEntry = { prompt: parsed.prompt.trim(), task: parsed.task.trim() }

    await supabase
      .from('personalized_prompts')
      .upsert({ user_id: userId, date: isoDate, ...result }, { onConflict: 'user_id,date' })

    return result
  } catch {
    return null
  }
}
