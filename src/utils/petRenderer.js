import { drawRoundRect } from "./canvasHelpers";

export const drawPet = (ctx, pet, floorY, scale, isSupporter) => {
    // Drawing Offsets
    let bounce = 0;
    let rotate = 0;
    if (pet.state === 'walk') bounce = Math.abs(Math.sin(pet.frame)) * 8 * scale;
    if (pet.state === 'jump') bounce = Math.sin(pet.frame) * 30 * scale;
    if (pet.state === 'dance') {
        bounce = Math.abs(Math.sin(pet.frame)) * 5 * scale;
        rotate = Math.sin(pet.frame) * 0.1; // Wiggle
    }
    if (pet.state === 'eat') {
        bounce = Math.sin(pet.frame) * 2 * scale;
    }

    const breathe =
        pet.state === 'idle' || pet.state === 'sleep' || pet.state === 'sit'
            ? Math.sin(Date.now() / 300) * 2 * scale
            : 0;
    const sleepSquish = pet.state === 'sleep' ? 15 * scale : 0;
    const sitSquish = pet.state === 'sit' ? 5 * scale : 0;
    // Use pet.y for depth offset
    const py = floorY - 30 * scale - bounce + sleepSquish + sitSquish + pet.y * scale;

    ctx.save();
    ctx.translate(pet.x, py);
    ctx.rotate(rotate);

    // Eating Scale Effect (Munching)
    let scaleX = scale;
    let scaleY = scale;
    if (pet.state === 'eat') {
        const munch = Math.sin(pet.frame) * 0.05;
        scaleX = scale * (1 + munch);
        scaleY = scale * (1 - munch);
    }
    ctx.scale(scaleX, scaleY);

    // Emote Bubble
    if (pet.emote) {
        ctx.save();
        ctx.globalAlpha = pet.emote.life;
        ctx.translate(0, -90 - pet.emote.yOffset);
        // Bubble
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.ellipse(0, 0, 15, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        // Tail
        ctx.beginPath();
        ctx.moveTo(0, 12);
        ctx.lineTo(-5, 18);
        ctx.lineTo(5, 15);
        ctx.fill();
        // Icon
        ctx.font = "14px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(pet.emote.type === 'heart' ? "❤️" : "🎵", 0, 1);
        ctx.restore();
    }

    // Supporter Crown
    if (isSupporter && !pet.state.includes("sleep")) {
        ctx.font = "20px sans-serif";
        ctx.fillText("👑", -10, -75 - breathe);
    }

    // Name Tag
    if (pet.state !== "sleep") {
        const nameY = -65 - breathe;
        ctx.save();
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.shadowColor = "rgba(0,0,0,0.1)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;
        const textWidth = ctx.measureText(pet.data.name).width;
        drawRoundRect(
            ctx,
            -textWidth / 2 - 10,
            nameY - 14,
            textWidth + 20,
            20,
            10,
            "white"
        );
        ctx.shadowColor = "transparent";
        ctx.fillStyle = "#555";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(pet.data.name, 0, nameY);
        ctx.restore();
    }

    if (pet.dir === -1) ctx.scale(-1, 1);
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.beginPath();
    ctx.ellipse(0, 30 + bounce / scale - sleepSquish / scale, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = pet.data.color;
    ctx.beginPath();
    ctx.roundRect(
        -25 - breathe / 2,
        -35 + sleepSquish / scale + breathe,
        50 + breathe,
        50 - sleepSquish / scale,
        20
    );
    ctx.fill();

    if (pet.id.includes("cat")) {
        ctx.beginPath();
        ctx.moveTo(-20, -25 + sleepSquish / scale);
        ctx.lineTo(-30, -45 + sleepSquish / scale);
        ctx.lineTo(-5, -25 + sleepSquish / scale);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(20, -25 + sleepSquish / scale);
        ctx.lineTo(30, -45 + sleepSquish / scale);
        ctx.lineTo(5, -25 + sleepSquish / scale);
        ctx.fill();
    } else if (pet.id.includes("bunny")) {
        ctx.beginPath();
        ctx.ellipse(-15, -45 + sleepSquish / scale, 6, 15, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(15, -45 + sleepSquish / scale, 6, 15, 0.2, 0, Math.PI * 2);
        ctx.fill();
    }

    const eyeY = -15 + sleepSquish / scale + breathe;
    if (pet.state === "sleep") {
        ctx.strokeStyle = "#555";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-15, eyeY);
        ctx.lineTo(-5, eyeY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(5, eyeY);
        ctx.lineTo(15, eyeY);
        ctx.stroke();
    } else {
        ctx.fillStyle = "#333";
        if (pet.blinkTimer > 0) {
            ctx.beginPath();
            ctx.arc(-10, eyeY, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(10, eyeY, 3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillRect(-13, eyeY, 6, 2);
            ctx.fillRect(7, eyeY, 6, 2);
        }
        ctx.fillStyle = pet.data.blush;
        ctx.beginPath();
        ctx.arc(-18, eyeY + 8, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(18, eyeY + 8, 4, 0, Math.PI * 2);
        ctx.fill();
        if (pet.id.includes("duck")) {
            ctx.fillStyle = "#f97316";
            ctx.beginPath();
            ctx.ellipse(0, eyeY + 5, 6, 3, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (pet.id.includes("pig")) {
            ctx.fillStyle = "#f9a8d4";
            ctx.beginPath();
            ctx.ellipse(0, eyeY + 5, 8, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#db2777";
            ctx.beginPath();
            ctx.arc(-3, eyeY + 5, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(3, eyeY + 5, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.restore();
};
