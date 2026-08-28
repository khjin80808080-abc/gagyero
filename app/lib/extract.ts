import {
  GoogleGenAI,
  Type,
  createUserContent,
  createPartFromBase64,
} from "@google/genai";

export interface ExtractedLineItem {
  name: string;
  amount: number;
}

export interface ExtractedTransaction {
  occurredOn: Date;
  merchantName: string;
  amount: number;
  lineItems: ExtractedLineItem[];
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
            description: "결제 금액(총액), 원 단위 정수 (통화 기호·소수점 제외)",
          },
          lineItems: {
            type: Type.ARRAY,
            description:
              "영수증에 구매 품목이 나열된 경우 각 품목. 품목이 없거나 구분되지 않으면 빈 배열.",
            items: {
              type: Type.OBJECT,
              properties: {
                name: {
                  type: Type.STRING,
                  description: "구매 품목명",
                },
                amount: {
                  type: Type.INTEGER,
                  description: "해당 품목의 금액, 원 단위 정수",
                },
              },
              required: ["name", "amount"],
            },
          },
        },
        required: ["date", "merchantName", "amount"],
      },
    },
  },
  required: ["transactions"],
};

interface GeminiLineItem {
  name: string;
  amount: number;
}

interface GeminiTransaction {
  date: string;
  merchantName: string;
  amount: number;
  lineItems?: GeminiLineItem[];
}

interface GeminiExtraction {
  transactions: GeminiTransaction[];
}

// Gemini가 스키마 지시(YYYY-MM-DD)를 벗어나 화면에 보이는 날짜 표기를
// 그대로 베끼는 경우(예: "25.08.08")까지 흔한 형식만 최소한으로 허용한다.
function parseOccurredOn(dateStr: string): Date | null {
  const trimmed = dateStr.trim();

  const isoMatch = trimmed.match(/^(\d{4})[-.](\d{1,2})[-.](\d{1,2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const date = new Date(
      `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00`,
    );
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const shortYearMatch = trimmed.match(/^(\d{2})[.-](\d{1,2})[.-](\d{1,2})$/);
  if (shortYearMatch) {
    const [, shortYear, month, day] = shortYearMatch;
    const year = 2000 + Number(shortYear);
    const date = new Date(
      `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00`,
    );
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const fallback = new Date(`${trimmed}T00:00:00`);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
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
 * 찾아 날짜·사용처·금액 3가지를 추출한다. 카드 이용내역처럼 한 이미지에
 * 여러 거래가 나열된 경우 각각을 별도 항목으로 반환한다. 종이 영수증처럼
 * 구매 품목이 나열된 경우 각 품목명·금액을 거래에 딸린 lineItems로 함께
 * 추출하되, 품목은 거래의 세부내역일 뿐 별도 거래가 아니다. 그 외 분석이나
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
      "이 영수증 또는 카드 이용내역/결제내역 캡처 이미지에서 개별 거래를 모두 찾아줘. 종이 영수증처럼 거래가 1건뿐이면 1건만, 카드 이용내역처럼 여러 거래가 나열되어 있으면 화면에 보이는 항목을 하나도 빠뜨리지 말고 각각을 별도 항목으로 담아줘. 각 거래마다 날짜, 사용처, 결제 총액 3가지를 정확히 추출하고, 이미지에서 직접 확인되지 않는 정보는 추측하지 마. 날짜는 화면 표기와 무관하게 항상 YYYY-MM-DD 형식으로 변환해서 반환해줘. 영수증처럼 구매 품목(상품명과 개별 금액)이 나열되어 있으면 그 거래의 lineItems 배열에 품목을 모두 담아줘. 품목은 거래의 총액을 구성하는 세부 내역일 뿐이니 amount(총액)와 별개의 거래로 만들지 말고, 품목 금액 합계를 다시 별도로 취급하지 마. 품목이 없거나 구분되지 않으면 lineItems는 빈 배열로 둬.",
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

  // 한 항목의 값이 이상해도 나머지 항목은 그대로 저장돼야 하므로,
  // 형식이 올바르지 않은 항목만 건너뛰고 전체를 중단하지 않는다.
  const transactions: ExtractedTransaction[] = [];
  for (const transaction of parsed.transactions) {
    const occurredOn = parseOccurredOn(transaction.date);
    const merchantName = transaction.merchantName?.trim();
    const amount = Math.round(transaction.amount);

    if (!occurredOn || !merchantName || !Number.isFinite(amount)) {
      console.error(
        "Gemini 응답에서 형식이 올바르지 않은 거래 항목을 건너뜁니다:",
        transaction,
      );
      continue;
    }

    // 품목 하나의 형식이 이상해도 거래 저장 자체는 막지 않고 그 품목만 제외한다.
    const lineItems: ExtractedLineItem[] = [];
    for (const lineItem of transaction.lineItems ?? []) {
      const name = lineItem.name?.trim();
      const lineAmount = Math.round(lineItem.amount);
      if (!name || !Number.isFinite(lineAmount)) {
        console.error(
          "Gemini 응답에서 형식이 올바르지 않은 품목을 건너뜁니다:",
          lineItem,
        );
        continue;
      }
      lineItems.push({ name, amount: lineAmount });
    }

    transactions.push({ occurredOn, merchantName, amount, lineItems });
  }

  return transactions;
}
