import {
  GoogleGenAI,
  Type,
  createUserContent,
  createPartFromBase64,
} from "@google/genai";

export interface ExtractedTransaction {
  occurredOn: Date;
  merchantName: string;
  amount: number;
}

const MODEL = "gemini-3.6-flash";

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    transactions: {
      type: Type.ARRAY,
      description: "이미지 안에서 확인되는 개별 거래 목록",
      items: {
        type: Type.OBJECT,
        properties: {
          date: {
            type: Type.STRING,
            description: "결제 날짜, YYYY-MM-DD 형식",
          },
          merchantName: {
            type: Type.STRING,
            description: "가맹점/사용처 이름",
          },
          amount: {
            type: Type.INTEGER,
            description: "결제 금액, 원 단위 정수 (통화 기호·소수점 제외)",
          },
        },
        required: ["date", "merchantName", "amount"],
      },
    },
  },
  required: ["transactions"],
};

interface GeminiTransaction {
  date: string;
  merchantName: string;
  amount: number;
}

interface GeminiExtraction {
  transactions: GeminiTransaction[];
}

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY 환경변수가 설정되어 있지 않습니다.");
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Gemini Vision을 사용해 영수증/카드 이용내역 캡처 이미지에서 거래를 모두
 * 찾아 날짜·사용처·금액 3가지만 추출한다. 카드 이용내역처럼 한 이미지에
 * 여러 거래가 나열된 경우 각각을 별도 항목으로 반환한다. 다른 분석이나
 * 카테고리는 추가하지 않는다.
 */
export async function extractTransactions(
  file: File,
): Promise<ExtractedTransaction[]> {
  const ai = getClient();
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64Data = buffer.toString("base64");
  const mimeType = file.type || "image/jpeg";

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: createUserContent([
      createPartFromBase64(base64Data, mimeType),
      "이 영수증 또는 카드 이용내역/결제내역 캡처 이미지에서 개별 거래를 모두 찾아줘. 종이 영수증처럼 거래가 1건뿐이면 1건만, 카드 이용내역처럼 여러 거래가 나열되어 있으면 각각을 별도 항목으로 담아줘. 각 거래마다 날짜, 사용처, 금액 3가지만 정확히 추출하고, 이미지에서 직접 확인되지 않는 정보는 추측하지 마.",
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

  return parsed.transactions.map((transaction) => ({
    occurredOn: new Date(`${transaction.date}T00:00:00`),
    merchantName: transaction.merchantName,
    amount: Math.round(transaction.amount),
  }));
}
