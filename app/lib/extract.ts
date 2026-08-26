export interface ExtractedReceipt {
  occurredOn: Date;
  occurredTime: string;
  merchantName: string;
  amount: number;
}

/**
 * Placeholder extraction engine. No vision-capable LLM API key is configured
 * in this environment, so this returns mock data instead of reading the
 * actual image/PDF content. Swap the body of this function for a real
 * vision API call (date/time/merchant/amount from the file) once a key is
 * available — every caller (촬영/캡처/파일) already funnels through here.
 */
export async function extractReceiptData(
  file: File,
): Promise<ExtractedReceipt> {
  const now = new Date();
  const nameWithoutExt = file.name.replace(/\.[^./]+$/, "").trim();
  const merchantName = nameWithoutExt || "미확인 자료";
  const amount = Math.max(1000, file.size % 50000);

  return {
    occurredOn: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    occurredTime: now.toTimeString().slice(0, 5),
    merchantName,
    amount,
  };
}
