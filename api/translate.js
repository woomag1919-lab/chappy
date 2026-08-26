export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY がVercelに設定されていません。" });

  try {
    const {
      mode = "partner", inputMode = "text", message = "",
      images = [], myMbti = "", partnerMbti = "",
      myTraits = [], partnerTraits = []
    } = req.body ?? {};

    if (inputMode === "text" && (!message || typeof message !== "string")) {
      return res.status(400).json({ error: "メッセージが空です。" });
    }
    if (inputMode === "text" && message.length > 6000) {
      return res.status(413).json({ error: "メッセージが長すぎます。まず6000文字以内で試してください。" });
    }
    if (inputMode === "image" && (!Array.isArray(images) || images.length === 0)) {
      return res.status(400).json({ error: "画像が選択されていません。" });
    }
    if (Array.isArray(images) && images.length > 5) {
      return res.status(400).json({ error: "画像は最大5枚です。" });
    }

    const system = `
あなたは「あこりんガル」という、2人の会話を整理するサポートAIです。
目的は相手の本心を断定することではなく、会話から確認できる事実と、そこから考えられる複数の解釈を分けて整理することです。

【2人の参考情報】
こうちゃんのMBTI: ${myMbti || "未設定"}
あきのMBTI: ${partnerMbti || "未設定"}
こうちゃんの補助特性: ${JSON.stringify(myTraits)}
あきの補助特性: ${JSON.stringify(partnerTraits)}

【重要なルール】
- MBTI、HSP、HSS型HSP、ASD/ADHD傾向、愛着スタイルは診断結果として扱わず、あくまで本人が入力した参考情報として扱う。
- 「本当はこう思っている」「絶対こういう意味」など、本人しか確認できない心の中を断定しない。
- 画像では吹き出しの色・名前・時系列など、確認できる情報を優先する。
- 文脈が不足している場合は「判断できない」と明記する。
- ユーザーの不安を煽る表現や、相手を悪者にする決めつけを避ける。
- 2人の関係を続ける／終わらせるなどの重大な判断をAIが代行しない。
- 「事実」と「推測」を明確に分ける。
- 日本語で、親しみやすいが冷静なトーンにする。

次のJSONだけを返してください。Markdownのコードフェンスは不要です。
{
  "observed": "会話から実際に確認できること",
  "likely": "もっとも自然そうな解釈。ただし推測であることが分かる書き方",
  "alternatives": "別に考えられる解釈を1〜3個",
  "mismatch": "2人の特性や言葉の受け取り方から起こりそうなすれ違い",
  "reply": "今返すなら／伝えるならの具体例。短く自然に",
  "caution": "この材料だけでは分からないこと、判断を保留した方がいい点"
}
`;

    const parts = [];
    if (inputMode === "text") {
      parts.push({ text: `今回は${mode === "partner" ? "あきから届いたメッセージ" : "こうちゃんが伝えたいメッセージ"}です。\n\n${message}` });
    } else {
      parts.push({ text: `LINE等のスクリーンショットが${images.length}枚あります。画像内の会話を時系列・吹き出しの話者・文脈をできる限り読み取り、画像にない内容は推測で補わないでください。今回は${mode === "partner" ? "あきから届いた会話" : "こうちゃんが伝えたい会話"}として分析してください。` });
      for (const base64 of images) {
        if (typeof base64 !== "string" || base64.length < 20) continue;
        parts.push({ inline_data: { mime_type: "image/jpeg", data: base64 } });
      }
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts }]
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || `Gemini API Error (${response.status})`
      });
    }

    const raw = data.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
    if (!raw) return res.status(502).json({ error: "Geminiから分析結果が返りませんでした。" });

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const cleaned = raw.replace(/^```json\s*/i,"").replace(/```$/,"").trim();
      try { parsed = JSON.parse(cleaned); }
      catch { parsed = { observed:"", likely:raw, alternatives:"", mismatch:"", reply:"", caution:"AIの返答を構造化できなかったため、そのまま表示しています。" }; }
    }
    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({ error: error?.message || "サーバー側でエラーが発生しました。" });
  }
}
