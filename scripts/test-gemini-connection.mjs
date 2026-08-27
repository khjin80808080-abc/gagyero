// Gemini API 연결 테스트용 독립 스크립트.
// 기존 앱 코드/DB에는 영향을 주지 않는다. 실행: node scripts/test-gemini-connection.mjs
import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-3.6-flash";

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("[FAIL] GEMINI_API_KEY 환경변수가 설정되어 있지 않습니다.");
    process.exit(1);
  }
  console.log("[OK] GEMINI_API_KEY 환경변수가 설정되어 있습니다.");

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: "ping",
    });

    if (response.text) {
      console.log(`[OK] Gemini API(${MODEL}) 연결 성공. 응답을 정상적으로 받았습니다.`);
    } else {
      console.error("[FAIL] Gemini API에 연결했지만 응답 텍스트가 없습니다.");
      process.exit(1);
    }
  } catch (err) {
    console.error("[FAIL] Gemini API 연결 실패:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
