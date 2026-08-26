import {
  GoogleGenAI,
  Type,
  createUserContent,
  createPartFromBase64,
} from "@google/genai";

export interface ExtractedReceipt {
  occurredOn: Date;
  occurredTime: string | null;
  merchantName: string;
  amount: number;
}

const MODEL = "gemini-2.5-flash";

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    date: {
      type: Type.STRING,
      description: "결제 날짜, YYYY-MM-DD 형식",
    },
    time: {
      type: Type.STRING,
      nullable: true,
      description: "결제 시각, HH:mm 24시간 형식. 이미지에 없으면 null",
    },
    merchantName: {
      type: Type.STRING,
      description: "가맹점/사용처 이름",
    },
    amount: {
      type: Type.INTEGER,
      description: "총 결제 금액, 원 단위 정수 (통화 기호·소수점 제외)",
    },
  },
  required: ["date", "merchantName", "amount"],
};

interface GeminiExtraction {
  date: string;
  time?: string | null;
  merchantName: string;
  amount: number;
}

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY 환경변수가 설정되어 있지 않습니다.");
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Gemini Vision을 사용해 영수증/캡처 이미지에서 날짜·시간·사용처·금액
 * 4가지만 추출한다. 다른 분석이나 카테고리는 추가하지 않는다.
 */
export async function extractReceiptData(
  file: File,
): Promise<ExtractedReceipt> {
  const ai = getClient();
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64Data = buffer.toString("base64");
  const mimeType = file.type || "image/jpeg";

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: createUserContent([
      createPartFromBase64(base64Data, mimeType),
      "이 영수증 또는 캡처 이미지에서 날짜, 시간, 사용처, 금액 4가지만 정확히 추출해줘. 이미지에서 직접 확인되지 않는 정보는 추측하지 말고, 시간이 안 보이면 time을 null로 남겨줘.",
    ]),
    config: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini 응답에서 텍스트를 받지 못했습니다.");
  }

  const parsed = JSON.parse(text) as GeminiExtraction;

  return {
    occurredOn: new Date(`${parsed.date}T00:00:00`),
    occurredTime: parsed.time ?? null,
    merchantName: parsed.merchantName,
    amount: Math.round(parsed.amount),
  };
}
