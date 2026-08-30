/**
 * Image processing utilities for Studio Pro:
 * - Background removal
 * - Vintage distress texture blending
 * - Color tint / duotone
 */

export function removeBackground(
  imageSrc: string,
  tolerance: number = 25
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(imageSrc);

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Sample top-left corner pixel as background color
      const bgR = data[0];
      const bgG = data[1];
      const bgB = data[2];

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Check if pixel is within color distance tolerance of background color or near white
        const distBg = Math.sqrt(
          (r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2
        );
        const distWhite = Math.sqrt(
          (r - 255) ** 2 + (g - 255) ** 2 + (b - 255) ** 2
        );

        if (distBg < tolerance || distWhite < tolerance + 15) {
          data[i + 3] = 0; // Set transparent
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageSrc;
  });
}

export function applyVintageDistress(
  imageSrc: string,
  opacity: number = 0.35
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(imageSrc);

      ctx.drawImage(img, 0, 0);

      // Generate procedural cracked distress scratches
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = `rgba(0,0,0,${opacity})`;
      ctx.lineWidth = 1.5;

      for (let i = 0; i < 45; i++) {
        const startX = Math.random() * canvas.width;
        const startY = Math.random() * canvas.height;
        const len = 15 + Math.random() * 35;
        const angle = Math.random() * Math.PI * 2;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(
          startX + Math.cos(angle) * len,
          startY + Math.sin(angle) * len
        );
        ctx.stroke();
      }

      // Add noise speckles
      for (let i = 0; i < 150; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const r = 0.8 + Math.random() * 1.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(imageSrc);
    img.src = imageSrc;
  });
}

export function colorizeImage(
  imageSrc: string,
  colorHex: string
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(imageSrc);

      ctx.drawImage(img, 0, 0);
      ctx.globalCompositeOperation = "source-in";
      ctx.fillStyle = colorHex;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(imageSrc);
    img.src = imageSrc;
  });
}
