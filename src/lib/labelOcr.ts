// Small adapter for the pinned Tesseract.js 6.0.1 worker protocol.
// Keep the native Worker handle BEFORE any network/model initialization, so
// cancellation and failures always terminate it, including loadLanguage errors.
// Protocol reference: naptha/tesseract.js v6.0.1 src/createWorker.js.
type Pending = { resolve: (value: unknown) => void; reject: (error: Error) => void };
type Packet = { jobId: string; status: "resolve" | "reject" | "progress"; data: unknown };

export function readLabel(photo: string, onProgress: (message: string) => void) {
  let stopped = false;
  let worker: Worker | undefined;
  let scriptUrl: string | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let rejectTask: (error: Error) => void = () => {};
  const pending = new Map<string, Pending>();
  let sequence = 0;
  const cleanup = (error: Error) => {
    clearTimeout(timer);
    worker?.terminate();
    worker = undefined;
    if (scriptUrl) URL.revokeObjectURL(scriptUrl);
    scriptUrl = undefined;
    pending.forEach(job => job.reject(error));
    pending.clear();
  };
  const stop = (message: string) => {
    if (stopped) return;
    stopped = true;
    const error = new Error(message);
    cleanup(error);
    rejectTask(error);
  };
  const promise = new Promise<string>((resolve, reject) => {
    rejectTask = reject;
    timer = setTimeout(() => stop("인식 시간이 길어 중단했어요. 밝고 선명한 라벨 사진으로 다시 시도해 주세요."), 90000);
    void (async () => {
      try {
        onProgress("영문 인식 엔진을 준비하고 있어요…");
        scriptUrl = URL.createObjectURL(new Blob([
          'importScripts("https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/worker.min.js");'
        ], { type: "text/javascript" }));
        worker = new Worker(scriptUrl);
        worker.onerror = event => {
          event.preventDefault();
          stop("인식 엔진을 내려받거나 실행하지 못했어요. 연결을 확인하거나 글자를 직접 입력해 주세요.");
        };
        worker.onmessageerror = () => stop("인식 결과를 읽지 못했어요. 다시 시도해 주세요.");
        worker.onmessage = (event: MessageEvent<Packet>) => {
          if (stopped) return;
          const { jobId, status, data } = event.data;
          if (status === "progress") {
            const progress = data as { status?: string; progress?: number };
            if (progress.status === "recognizing text") onProgress("라벨을 읽고 있어요… " + Math.round((progress.progress ?? 0) * 100) + "%");
            return;
          }
          const job = pending.get(jobId);
          if (!job) return;
          pending.delete(jobId);
          if (status === "resolve") job.resolve(data);
          else job.reject(new Error("라벨 인식에 실패했어요. 다시 시도하거나 글자를 직접 입력해 주세요."));
        };
        const run = (action: string, payload: unknown) => new Promise<unknown>((res, rej) => {
          if (stopped || !worker) { rej(new Error("인식을 취소했어요.")); return; }
          const jobId = String(++sequence);
          pending.set(jobId, { resolve: res, reject: rej });
          worker.postMessage({ workerId: "label", jobId, action, payload });
        });
        await run("load", { options: { lstmOnly: true, corePath: "https://cdn.jsdelivr.net/npm/tesseract.js-core@6.0.0", logging: false } });
        await run("loadLanguage", { langs: "eng", options: { langPath: "https://tessdata.projectnaptha.com/4.0.0", gzip: true, lstmOnly: true } });
        await run("initialize", { langs: "eng", oem: 1, config: {} });
        if (stopped) return;
        const bytes = Uint8Array.from(atob(photo.slice(photo.indexOf(",") + 1)), char => char.charCodeAt(0));
        const result = await run("recognize", { image: bytes, options: {}, output: { text: true } }) as { text: string };
        if (!stopped) {
          stopped = true;
          cleanup(new Error("완료"));
          resolve(result.text.slice(0, 2000).trim());
        }
      } catch {
        stop("라벨 인식에 실패했어요. 연결을 확인하거나 글자를 직접 입력해 주세요.");
      }
    })();
  });
  return { promise, cancel: () => stop("인식을 취소했어요.") };
}
