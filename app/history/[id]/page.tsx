import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import ReceiptImageViewer from "@/app/components/ReceiptImageViewer";
import ConfirmSubmitButton from "@/app/components/ConfirmSubmitButton";
import { deleteTransaction } from "@/app/history/[id]/actions";

export const dynamic = "force-dynamic";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function formatWon(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

// occurredOn은 로컬 날짜로 생성되므로 로컬 getter로 포맷해 하루 밀림을 피한다.
function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}년 ${month}월 ${day}일`;
}

function isImagePath(filePath: string) {
  const ext = filePath.slice(filePath.lastIndexOf(".")).toLowerCase();
  return IMAGE_EXTENSIONS.has(ext);
}

function receiptSrc(filePath: string) {
  const filename = filePath.split("/").pop() ?? filePath;
  return `/api/receipts/${filename}`;
}

export default async function TransactionDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const transactionId = Number(id);

  if (!Number.isInteger(transactionId)) {
    notFound();
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { sources: true, lineItems: true },
  });

  if (!transaction) {
    notFound();
  }

  const images = transaction.sources.filter(
    (source) => source.filePath && isImagePath(source.filePath),
  );

  return (
    <main className="flex flex-1 flex-col bg-white text-neutral-900">
      <section
        className="rounded-b-[32px] px-5 pt-8 pb-6 text-white"
        style={{
          background:
            "linear-gradient(160deg, #33127a 0%, #7c3aed 32%, #c026d3 62%, #fb923c 100%)",
        }}
      >
        <Link href="/history" className="text-sm text-white/70">
          &lt; 뒤로
        </Link>
        <h1 className="mt-4 text-xl font-bold">{transaction.merchantName}</h1>
        <p className="mt-1 text-sm text-white/85">
          {formatDate(transaction.occurredOn)}
          {transaction.occurredTime ? ` ${transaction.occurredTime}` : ""}
        </p>
        <p className="mt-4 text-3xl font-extrabold tracking-tight">
          {formatWon(transaction.amount)}
        </p>
      </section>

      <div className="flex flex-col gap-6 px-5 pt-6 pb-8">
        <div className="flex gap-3">
          <Link
            href={`/history/${transaction.id}/edit`}
            className="flex-1 rounded-2xl border border-neutral-200 py-3 text-center text-sm font-semibold text-neutral-700 active:bg-neutral-100"
          >
            수정
          </Link>
          <form
            action={deleteTransaction.bind(null, id)}
            className="flex-1"
          >
            <ConfirmSubmitButton
              confirmMessage="이 거래를 삭제할까요?"
              className="w-full rounded-2xl bg-red-50 py-3 text-sm font-semibold text-red-600 active:bg-red-100"
            >
              삭제
            </ConfirmSubmitButton>
          </form>
        </div>

        <section>
          <h2 className="text-sm font-semibold text-neutral-500">
            원본 자료
          </h2>
          {images.length === 0 ? (
            <p className="mt-3 py-6 text-center text-sm text-neutral-400">
              원본 이미지가 없습니다.
            </p>
          ) : (
            <ReceiptImageViewer
              images={images.map((source) => ({
                id: source.id,
                src: receiptSrc(source.filePath as string),
              }))}
              alt={`${transaction.merchantName} 원본 자료`}
            />
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold text-neutral-500">품목</h2>
          {transaction.lineItems.length === 0 ? (
            <p className="mt-3 py-6 text-center text-sm text-neutral-400">
              품목 정보가 없습니다.
            </p>
          ) : (
            <div className="mt-3 overflow-hidden rounded-2xl bg-neutral-50 shadow-sm">
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-4 py-2 text-xs font-medium text-neutral-400">
                <span>상품명</span>
                <span className="text-right">수량</span>
                <span className="text-right">단가</span>
                <span className="text-right">금액</span>
              </div>
              <div className="divide-y divide-neutral-100">
                {transaction.lineItems.map((lineItem) => (
                  <div
                    key={lineItem.id}
                    className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 px-4 py-3"
                  >
                    <span className="text-sm font-medium">
                      {lineItem.name}
                    </span>
                    <span className="text-right text-sm text-neutral-400">
                      -
                    </span>
                    <span className="text-right text-sm text-neutral-400">
                      -
                    </span>
                    <span className="text-right text-sm font-semibold">
                      {formatWon(lineItem.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
