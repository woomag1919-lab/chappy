export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });

  const { myTraits = [], partnerTraits = [], sender, message } = req.body ?? {};
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message is required" });
  }
  if (message.length > 4000) {
    return res.status(413).json({ error: "message is too long" });
  }

  const systemInstruction = `
あなたは「ココロ翻訳」という会話整理アシスタントです。
目的は、恋愛相手などの発言を「本心」として断定することではなく、会話から考えられる複数の解釈を整理し、ユーザーが落ち着いて考えられるようにすることです。

自分の参考情報: ${JSON.stringify(myTraits)}
相手の参考情報: ${JSON.stringify(partnerTraits)}

必ず以下の構成で日本語回答してください。
【考えられる解釈】
- 最も自然そうな解釈
- 別の可能性
【まだ分からないこと】
- この発言だけでは断定できない点
【すれ違いポイント】
- 自分側／相手側で誤解が起きそうなところ
【返し方の例】
- 関係を悪化させにくい、短い返答例

注意:
- MBTI、HSP、ASD/ADHD傾向、愛着スタイルなどを診断結果として扱わない。
- 「絶対」「本当はこう思っている」などの断定を避ける。
- ユーザーの不安を煽らず、相手への決めつけも避ける。
- 入力が曖昧なら曖昧なまま扱う。
`;

  const userContent = `${sender === "partner" ? "相手" : "自分"}の発言:
${message}`;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: "user", parts: [{ text: userContent }] }],
          generationConfig: { temperature: 0.5, maxOutputTokens: 900 }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Gemini API Error" });
    }

    const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
    if (!text) return res.status(502).json({ error: "Gemini returned no text" });

    return res.status(200).json({ text });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
}
