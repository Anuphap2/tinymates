export const drawParticles = (ctx, particles) => {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= p.decay || 0.015;
        p.y -= (p.vy !== undefined ? p.vy : 0.6);
        if (p.vx) p.x += p.vx;

        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life));

        if (p.type === "heart") {
            const sway = Math.sin((1 - p.life) * 8) * 4;
            ctx.font = `${Math.floor(18 * (p.scale || 1))}px sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText("❤️", p.x + sway, p.y);
        } else if (p.type === "crumb") {
            p.vy = (p.vy || -1) + 0.15; // Gravity
            ctx.fillStyle = "#d97706";
            ctx.beginPath();
            ctx.arc(p.x, p.y, (p.size || 2.5), 0, Math.PI * 2);
            ctx.fill();
        } else if (p.type === "coin") {
            const scale = 1 + (1 - p.life) * 0.3;
            ctx.font = `bold ${Math.floor(14 * scale)}px "Inter", sans-serif`;
            ctx.fillStyle = "#eab308";
            ctx.shadowColor = "rgba(234, 179, 8, 0.4)";
            ctx.shadowBlur = 6;
            ctx.textAlign = "center";
            ctx.fillText(p.text || "+10 🪙", p.x, p.y);
        } else if (p.type === "sparkle") {
            const size = (p.size || 4) * p.life;
            ctx.fillStyle = p.color || "#fef08a";
            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // "z" sleep particle
            const sway = Math.sin((1 - p.life) * 6) * 5;
            const size = Math.floor(12 + (1 - p.life) * 6);
            ctx.fillStyle = "#a8a29e";
            ctx.font = `bold ${size}px "Inter", sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText("Zzz", p.x + sway, p.y);
        }

        ctx.restore();
    }
};
