export const drawRoundRect = (ctx, x, y, w, h, r, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
};

export const drawTree = (ctx, x, y, scale) => {
    // Trunk
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(x - 10 * scale, y - 60 * scale, 20 * scale, 60 * scale);

    // Leaves (3 circles)
    ctx.fillStyle = "#22c55e"; // Green
    ctx.beginPath();
    ctx.arc(x, y - 80 * scale, 30 * scale, 0, Math.PI * 2);
    ctx.arc(x - 20 * scale, y - 60 * scale, 25 * scale, 0, Math.PI * 2);
    ctx.arc(x + 20 * scale, y - 60 * scale, 25 * scale, 0, Math.PI * 2);
    ctx.fill();
};

export const drawCurtains = (ctx, x, y, w, h, scale) => {
    const sway = Math.sin(Date.now() / 1000) * 5 * scale;
    ctx.fillStyle = "#fca5a5"; // Pinkish curtains
    // Left Curtain
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 20 * scale, y + h / 2, x - 10 * scale + sway, y + h);
    ctx.lineTo(x - 40 * scale + sway, y + h);
    ctx.quadraticCurveTo(x - 20 * scale, y + h / 2, x - 40 * scale, y);
    ctx.fill();
    // Right Curtain
    ctx.beginPath();
    ctx.moveTo(x + w, y);
    ctx.quadraticCurveTo(x + w - 20 * scale, y + h / 2, x + w + 10 * scale - sway, y + h);
    ctx.lineTo(x + w + 40 * scale - sway, y + h);
    ctx.quadraticCurveTo(x + w + 20 * scale, y + h / 2, x + w + 40 * scale, y);
    ctx.fill();
    // Rod
    ctx.fillStyle = "#78716c";
    ctx.fillRect(x - 50 * scale, y - 10 * scale, w + 100 * scale, 10 * scale);
};

export const drawBookshelf = (ctx, x, y, scale) => {
    ctx.fillStyle = "#a16207"; // Wood
    ctx.fillRect(x, y, 100 * scale, 150 * scale);
    // Shelves
    ctx.fillStyle = "#78350f";
    ctx.fillRect(x + 5 * scale, y + 40 * scale, 90 * scale, 5 * scale);
    ctx.fillRect(x + 5 * scale, y + 90 * scale, 90 * scale, 5 * scale);
    // Books
    const colors = ["#ef4444", "#3b82f6", "#22c55e", "#eab308"];
    for (let i = 0; i < 5; i++) {
        ctx.fillStyle = colors[i % 4];
        ctx.fillRect(x + 10 * scale + i * 15 * scale, y + 15 * scale, 10 * scale, 25 * scale);
    }
    for (let i = 0; i < 4; i++) {
        ctx.fillStyle = colors[(i + 2) % 4];
        ctx.fillRect(x + 10 * scale + i * 15 * scale, y + 65 * scale, 10 * scale, 25 * scale);
    }
};

export const drawGrass = (ctx, x, y, scale) => {
    const sway = Math.sin(Date.now() / 800 + x) * 5 * scale;
    ctx.strokeStyle = "#4ade80";
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 5 * scale, y - 10 * scale, x + sway, y - 20 * scale);
    ctx.moveTo(x + 5 * scale, y);
    ctx.quadraticCurveTo(x + 10 * scale, y - 10 * scale, x + 5 * scale + sway, y - 15 * scale);
    ctx.stroke();
};

export const drawLamp = (ctx, x, y, scale) => {
    // Stand
    ctx.fillStyle = "#475569";
    ctx.fillRect(x - 2 * scale, y, 4 * scale, 40 * scale);
    ctx.beginPath();
    ctx.arc(x, y + 40 * scale, 10 * scale, 0, Math.PI * 2);
    ctx.fill();
    // Shade
    ctx.fillStyle = "#fef3c7";
    ctx.beginPath();
    ctx.moveTo(x - 15 * scale, y + 10 * scale);
    ctx.lineTo(x + 15 * scale, y + 10 * scale);
    ctx.lineTo(x + 25 * scale, y - 20 * scale);
    ctx.lineTo(x - 25 * scale, y - 20 * scale);
    ctx.fill();
    // Glow
    const glow = ctx.createRadialGradient(x, y - 5 * scale, 5 * scale, x, y - 5 * scale, 60 * scale);
    glow.addColorStop(0, "rgba(255, 253, 186, 0.4)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y - 5 * scale, 60 * scale, 0, Math.PI * 2);
    ctx.fill();
};
