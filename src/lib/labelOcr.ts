type OcrWorker = {
  recognize: (image: string) => Promise<{ data: { text: string } }>;
  terminate: () => Promise<unknown>;
};
type OcrApi = { createWorker: (lang: string, mode: number, options: Record<string, unknown>) => Promise<OcrWorker> };
declare global { interface Window { Tesseract?: OcrApi; } }
let loading: Promise<OcrApi> | undefined;

function loadEngine(): Promise<OcrApi> {
  if (window.Tesseract) return Promise.resolve(window.Tesseract);
  if (loading) return loading;
  loading = new Promise<OcrApi>((resolve, reject) => {
    const script = document.createElement("script");
    const fail = () => { clearTimeout(timer); script.remove(); reject(new Error("인식 엔진을 내려받지 못했어요. 인터넷 연결을 확인하거나 글자를 직접 입력해 주세요.")); };
    const timer = window.setTimeout(fail, 30000);
    script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.min.js";
    script.async = true;
    script.onload = () => {
      clearTimeout(timer);
      if (window.Tesseract) resolve(window.Tesseract);
      else fail();
    };
    script.onerror = fail;
    document.head.appendChild(script);
  }).catch(error => { loading = undefined; throw error; });
  return loading;
}

export function readLabel(photo: string, onProgress: (message: string) => void) {
  let stopped = false;
  let worker: OcrWorker | undefined;
  let rejectTask: (error: Error) => void = () => {};
  let timer = 0;
  const stop = (message: string) => {
    if (stopped) return;
    stopped = true;
    clearTimeout(timer);
    if (worker) void worker.terminate().catch(() => {});
    rejectTask(new Error(message));
  };
  const promise = new Promise<string>((resolve, reject) => {
    rejectTask = reject;
    timer = window.setTimeout(() => stop("인식 시간이 길어 중단했어요. 밝고 선명한 라벨 사진으로 다시 시도해 주세요."), 90000);
    void (async () => {
      try {
        onProgress("영문 인식 엔진을 준비하고 있어요…");
        const api = await loadEngine();
        if (stopped) return;
        worker = await api.createWorker("eng", 1, {
          workerPath: "https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/worker.min.js",
          corePath: "https://cdn.jsdelivr.net/npm/tesseract.js-core@6.0.0",
          langPath: "https://tessdata.projectnaptha.com/4.0.0",
          logger: (m: {status: string; progress: number}) => {
            if (!stopped && m.status === "recognizing text") onProgress("라벨을 읽고 있어요… " + Math.round(m.progress * 100) + "%");
          },
          errorHandler: () => stop("라벨 인식에 실패했어요. 다시 시도하거나 글자를 직접 입력해 주세요.")
        });
        if (stopped) { await worker.terminate(); return; }
        const result = await worker.recognize(photo);
        if (!stopped) { stopped = true; clearTimeout(timer); resolve(result.data.text.slice(0, 2000).trim()); }
      } catch (e) {
        if (!stopped) { stopped = true; clearTimeout(timer); reject(e instanceof Error ? e : new Error("라벨을 읽지 못했어요.")); }
      } finally {
        if (worker) void worker.terminate().catch(() => {});
      }
    })();
  });
  return { promise, cancel: () => stop("인식을 취소했어요.") };
}
