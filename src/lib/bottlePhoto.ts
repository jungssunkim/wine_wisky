// Decode and resize on-device. The original file and its metadata are never stored.
export const MAX_PHOTO_LENGTH = 360000;
export const isLocalPhoto = (value: unknown): value is string =>
  typeof value === "string" && value.length <= MAX_PHOTO_LENGTH &&
  /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value);

export async function prepareBottlePhoto(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("JPG, PNG, WebP 사진을 선택해 주세요. HEIC 사진은 JPG로 변환해 주세요.");
  }
  if (!file.size || file.size > 10 * 1024 * 1024) throw new Error("10MB 이하의 사진을 선택해 주세요.");
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      const timer = window.setTimeout(() => { img.src = ""; reject(new Error("사진을 읽는 데 시간이 오래 걸려요. 다른 사진으로 시도해 주세요.")); }, 15000);
      img.onload = () => { clearTimeout(timer); resolve(img); };
      img.onerror = () => { clearTimeout(timer); reject(new Error("사진을 읽을 수 없어요. 다른 사진을 선택해 주세요.")); };
      img.src = url;
    });
    if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 50000000) {
      throw new Error("사진 크기가 너무 커요. 해상도를 줄여 다시 선택해 주세요.");
    }
    const canvas = document.createElement("canvas");
    const ratio = Math.min(1, 800 / Math.max(image.naturalWidth, image.naturalHeight));
    canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("이 브라우저에서 사진을 처리할 수 없어요.");
    context.fillStyle = "#211811";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const photo = canvas.toDataURL("image/jpeg", 0.78);
    if (!isLocalPhoto(photo)) throw new Error("사진 용량을 충분히 줄이지 못했어요. 더 작은 사진을 선택해 주세요.");
    return photo;
  } finally {
    URL.revokeObjectURL(url);
  }
}
