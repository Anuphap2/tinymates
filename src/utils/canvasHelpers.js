export const drawRoundRect = (ctx, x, y, w, h, r, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
};

export const drawTree = (ctx, x, y, scale) => {
    // Trunk
    ctx.fillStyle = "#8B4513";
    ctx.beginPath();
    ctx.moveTo(x - 10 * scale, y);
    ctx.lineTo(x + 10 * scale, y);
    ctx.lineTo(x + 8 * scale, y - 60 * scale);
    ctx.lineTo(x - 8 * scale, y - 60 * scale);
    ctx.fill();

    // Leaves (Cloud-like fluffy shape)
    ctx.fillStyle = "#4ade80"; // Lighter Green
    const drawCloud = (cx, cy, r) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
    };

    drawCloud(x, y - 80 * scale, 35 * scale);
    drawCloud(x - 25 * scale, y - 65 * scale, 28 * scale);
    drawCloud(x + 25 * scale, y - 65 * scale, 28 * scale);
    drawCloud(x - 15 * scale, y - 95 * scale, 25 * scale);
    drawCloud(x + 15 * scale, y - 95 * scale, 25 * scale);

    // Highlights
    ctx.fillStyle = "#86efac";
    ctx.beginPath();
    ctx.arc(x - 10 * scale, y - 100 * scale, 10 * scale, 0, Math.PI * 2);
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

export const drawBookshelf = (ctx, x, y, scale, bookData = null) => {
    // Frame
    ctx.fillStyle = "#a16207"; // Wood
    ctx.beginPath();
    ctx.roundRect(x, y, 100 * scale, 150 * scale, 10 * scale);
    ctx.fill();

    // Shelves
    ctx.fillStyle = "#78350f"; // Darker wood
    ctx.fillRect(x + 5 * scale, y + 40 * scale, 90 * scale, 5 * scale);
    ctx.fillRect(x + 5 * scale, y + 90 * scale, 90 * scale, 5 * scale);

    // Books (Randomized colors)
    const colors = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7"];
    const rowOffsets = [40, 90, 145];

    if (bookData) {
        // Use pre-generated data
        bookData.forEach((row, i) => {
            let bx = x + 10 * scale;
            const rowY = y + rowOffsets[i] * scale;
            row.forEach(book => {
                ctx.fillStyle = book.color;
                ctx.fillRect(bx, rowY - book.h * scale, book.w * scale, book.h * scale);
                bx += (book.w + 2) * scale;
            });
        });
    } else {
        // Fallback to random (will flicker)
        const drawRow = (rowY) => {
            let bx = x + 10 * scale;
            for (let i = 0; i < 5; i++) {
                const h = (20 + Math.random() * 10) * scale;
                const w = (8 + Math.random() * 5) * scale;
                ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                ctx.fillRect(bx, rowY - h, w, h);
                bx += w + 2 * scale;
            }
        };
        drawRow(y + 40 * scale);
        drawRow(y + 90 * scale);
        drawRow(y + 145 * scale);
    }
};

export const drawGrass = (ctx, x, y, scale) => {
    const sway = Math.sin(Date.now() / 800 + x) * 5 * scale;
    ctx.strokeStyle = "#4ade80";
    ctx.lineWidth = 2 * scale;
    ctx.lineCap = "round";
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

// --- NEW HELPERS ---

export const drawCuteChair = (ctx, x, y, scale, color = "#fbbf24") => {
    // Legs
    ctx.strokeStyle = "#b45309";
    ctx.lineWidth = 3 * scale;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x + 10 * scale, y + 20 * scale);
    ctx.lineTo(x + 5 * scale, y + 50 * scale);
    ctx.moveTo(x + 30 * scale, y + 20 * scale);
    ctx.lineTo(x + 35 * scale, y + 50 * scale);
    ctx.stroke();

    // Seat
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y + 20 * scale, 40 * scale, 10 * scale, 5 * scale);
    ctx.fill();

    // Backrest
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x + 5 * scale, y - 10 * scale, 30 * scale, 35 * scale, 8 * scale);
    ctx.fill();
};

export const drawRoundTable = (ctx, x, y, scale) => {
    // Legs
    ctx.strokeStyle = "#78350f";
    ctx.lineWidth = 4 * scale;
    ctx.beginPath();
    ctx.moveTo(x, y + 10 * scale);
    ctx.lineTo(x - 20 * scale, y + 60 * scale);
    ctx.moveTo(x, y + 10 * scale);
    ctx.lineTo(x + 20 * scale, y + 60 * scale);
    ctx.stroke();

    // Top
    ctx.fillStyle = "#fff"; // White top
    ctx.shadowColor = "rgba(0,0,0,0.1)";
    ctx.shadowBlur = 10 * scale;
    ctx.shadowOffsetY = 5 * scale;
    ctx.beginPath();
    ctx.ellipse(x, y + 10 * scale, 40 * scale, 15 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = "transparent";

    // Edge detail
    ctx.fillStyle = "#f3f4f6";
    ctx.beginPath();
    ctx.ellipse(x, y + 12 * scale, 40 * scale, 15 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(x, y + 8 * scale, 40 * scale, 15 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
};

// --- NEW HELPERS FOR DETAILS ---

export const drawRug = (ctx, x, y, w, h, style = "cloud") => {
    ctx.save();
    ctx.translate(x, y);
    if (style === "cloud") {
        ctx.fillStyle = "#fce7f3";
        ctx.beginPath();
        ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        // Fluff
        ctx.fillStyle = "#fbcfe8";
        for (let i = 0; i < 5; i++) {
            const ang = (i / 5) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(Math.cos(ang) * w * 0.4, Math.sin(ang) * h * 0.4, w * 0.15, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (style === "checker") {
        ctx.fillStyle = "#fff";
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.fillStyle = "#e5e7eb";
        const size = w / 8;
        for (let r = 0; r < h / size; r++) {
            for (let c = 0; c < w / size; c++) {
                if ((r + c) % 2 === 0) ctx.fillRect(-w / 2 + c * size, -h / 2 + r * size, size, size);
            }
        }
    } else if (style === "boho") {
        ctx.fillStyle = "#f5ebe0";
        ctx.beginPath();
        ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#d4a373";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, w / 2 - 5, h / 2 - 5, 0, 0, Math.PI * 2);
        ctx.stroke();
        // Tassels
        ctx.strokeStyle = "#e6ccb2";
        for (let i = 0; i < 12; i++) {
            const ang = (i / 12) * Math.PI * 2;
            const sx = Math.cos(ang) * w * 0.5;
            const sy = Math.sin(ang) * h * 0.5;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx * 1.1, sy * 1.1);
            ctx.stroke();
        }
    }
    ctx.restore();
};

export const drawPainting = (ctx, x, y, w, h, artType = "abstract") => {
    // Frame
    ctx.fillStyle = "#a16207";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#fff";
    ctx.fillRect(x + 5, y + 5, w - 10, h - 10);

    // Art
    if (artType === "abstract") {
        ctx.fillStyle = "#fca5a5";
        ctx.beginPath();
        ctx.arc(x + w * 0.3, y + h * 0.4, w * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#93c5fd";
        ctx.fillRect(x + w * 0.5, y + h * 0.5, w * 0.3, h * 0.3);
    } else if (artType === "flower") {
        ctx.fillStyle = "#fcd34d";
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, w * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#f87171";
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
            const ang = (i / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(x + w / 2, y + h / 2);
            ctx.lineTo(x + w / 2 + Math.cos(ang) * w * 0.25, y + h / 2 + Math.sin(ang) * h * 0.25);
            ctx.stroke();
        }
    }
};

export const drawWindow = (ctx, x, y, w, h) => {
    // Frame
    ctx.fillStyle = "#fff";
    ctx.fillRect(x, y, w, h);
    // Glass
    ctx.fillStyle = "#bae6fd";
    ctx.fillRect(x + 5, y + 5, w - 10, h - 10);
    // Crossbar
    ctx.fillStyle = "#fff";
    ctx.fillRect(x + w / 2 - 2, y, 4, h);
    ctx.fillRect(x, y + h / 2 - 2, w, 4);
    // Reflection
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.beginPath();
    ctx.moveTo(x + 10, y + h - 10);
    ctx.lineTo(x + 30, y + 10);
    ctx.lineTo(x + 50, y + 10);
    ctx.lineTo(x + 30, y + h - 10);
    ctx.fill();
};

export const drawShelf = (ctx, x, y, w, scale) => {
    ctx.fillStyle = "#a16207";
    ctx.fillRect(x, y, w, 5 * scale);
    // Brackets
    ctx.beginPath();
    ctx.moveTo(x + 10 * scale, y + 5 * scale);
    ctx.lineTo(x + 10 * scale, y + 15 * scale);
    ctx.lineTo(x + 20 * scale, y + 5 * scale);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + w - 20 * scale, y + 5 * scale);
    ctx.lineTo(x + w - 10 * scale, y + 15 * scale);
    ctx.lineTo(x + w - 10 * scale, y + 5 * scale);
    ctx.fill();
};
