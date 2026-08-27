"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { processUploadedFile } from "@/app/lib/uploadActions";

type UploadKind = "receipt" | "screenshot" | "file";

const UPLOAD_BUTTONS: {
  label: string;
  icon: string;
  kind: UploadKind;
  accept: string;
  multiple: boolean;
  capture?: "environment";
}[] = [
  {
    label: "촬영 등록",
    icon: "🧾",
    kind: "receipt",
    accept: "image/*",
    multiple: false,
    capture: "environment",
  },
  {
    label: "캡처 등록",
    icon: "🖼️",
    kind: "screenshot",
    accept: "image/*",
    multiple: true,
  },
  {
    label: "파일 등록",
    icon: "📁",
    kind: "file",
    accept: "image/*,application/pdf",
    multiple: true,
  },
];

const cardClassName =
  "flex flex-col items-center gap-2 rounded-2xl bg-white/95 py-6 shadow-sm active:bg-white has-[:disabled]:opacity-60";

export default function InputGrid() {
  const router = useRouter();
  const [progress, setProgress] = useState<{
    total: number;
    done: number;
  } | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleFiles(kind: UploadKind, files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    setProgress({ total: list.length, done: 0 });
    setMessage(null);

    for (const file of list) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", kind);
      try {
        const result = await processUploadedFile(formData);
        if (result.status === "duplicate") {
          setMessage("이미 등록된 내역입니다.");
        }
      } catch (error) {
        console.error("자료 처리 실패:", error);
      }
      setProgress((prev) => (prev ? { ...prev, done: prev.done + 1 } : prev));
    }

    router.refresh();
    setTimeout(() => setProgress(null), 1200);
  }

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {UPLOAD_BUTTONS.map((button) => (
          <label key={button.kind} className={cardClassName}>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-orange-100 text-2xl">
              {button.icon}
            </span>
            <span className="text-sm font-medium text-neutral-800">
              {button.label}
            </span>
            <input
              type="file"
              accept={button.accept}
              multiple={button.multiple}
              capture={button.capture}
              disabled={progress !== null}
              className="hidden"
              onChange={(event) => {
                handleFiles(button.kind, event.target.files);
                event.target.value = "";
              }}
            />
          </label>
        ))}

        <Link href="/write" className={cardClassName}>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-orange-100 text-2xl">
            ✍️
          </span>
          <span className="text-sm font-medium text-neutral-800">
            글로 등록
          </span>
        </Link>
      </div>

      {progress && (
        <p className="mt-3 text-center text-xs text-white/85">
          {progress.total}개 자료 중 {progress.done}개 처리 중
        </p>
      )}

      {!progress && message && (
        <p className="mt-3 text-center text-xs text-white/85">{message}</p>
      )}
    </>
  );
}
