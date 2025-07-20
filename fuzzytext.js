const canvas = document.getElementById("fuzzyCanvas");

const text = "© 2025 ENERGY LASTS FOREVER";
const fontSize = 10;
const fontWeight = 900;
const fontFamily = "sans-serif";
const color = "#ffffff";
const baseIntensity = 0.08;
const hoverIntensity = 0.5;
const enableHover = true;

let animationFrameId;
let isHovering = false;

const ctx = canvas.getContext("2d");

const init = () => {
  const offscreen = document.createElement("canvas");
  const offCtx = offscreen.getContext("2d");

  offCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  offCtx.textBaseline = "alphabetic";
  const metrics = offCtx.measureText(text);

  const actualLeft = metrics.actualBoundingBoxLeft ?? 0;
  const actualRight = metrics.actualBoundingBoxRight ?? metrics.width;
  const actualAscent = metrics.actualBoundingBoxAscent ?? fontSize;
  const actualDescent = metrics.actualBoundingBoxDescent ?? fontSize * 0.2;

  const textWidth = Math.ceil(actualLeft + actualRight);
  const textHeight = Math.ceil(actualAscent + actualDescent);

  offscreen.width = textWidth + 20;
  offscreen.height = textHeight;

  offCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  offCtx.fillStyle = color;
  offCtx.fillText(text, 10 - actualLeft, actualAscent);

  const horizontalMargin = 50;
  canvas.width = offscreen.width + horizontalMargin * 2;
  canvas.height = offscreen.height + 50;
  ctx.translate(horizontalMargin, 25);

  const fuzzRange = 10;

  const draw = () => {
    const intensity = isHovering ? hoverIntensity : baseIntensity;
    ctx.clearRect(-fuzzRange, -fuzzRange, canvas.width, canvas.height);
    for (let j = 0; j < offscreen.height; j++) {
      const dx = Math.floor(intensity * (Math.random() - 0.5) * fuzzRange);
      ctx.drawImage(
        offscreen,
        0,
        j,
        offscreen.width,
        1,
        dx,
        j,
        offscreen.width,
        1
      );
    }
    animationFrameId = requestAnimationFrame(draw);
  };

  draw();

  if (enableHover) {
    canvas.addEventListener("mousemove", () => (isHovering = true));
    canvas.addEventListener("mouseleave", () => (isHovering = false));
  }
};

init();
