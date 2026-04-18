
export async function analyzeIncidentAI(text: string) {
  const apiKey = import.meta.env.VITE_OPENAI_KEY

  if (!apiKey) {
    return {
      summary: "AI key missing. Showing fallback analysis.",
      severity: "unknown"
    }
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You analyze disaster reports and summarize risks." },
        { role: "user", content: text }
      ]
    })
  })

  const data = await response.json()
  return {
    summary: data.choices?.[0]?.message?.content ?? "No AI response",
    severity: "analyzed"
  }
}
