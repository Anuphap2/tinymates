export const drawParticles = (ctx, particles) => {
    particles.forEach((p, i) => {
        p.y -= 0.5;
        p.life -= 0.01;
        if (p.life <= 0) particles.splice(i, 1);
        ctx.globalAlpha = p.life;
        if (p.type === "heart") {
            ctx.fillStyle = "#fda4af";
            ctx.font = "20px sans-serif";
            ctx.fillText("❤️", p.x, p.y);
        } else if (p.type === "crumb") {
            ctx.fillStyle = "#d97706";
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = "#94a3b8";
            ctx.font = "bold 16px sans-serif";
            ctx.fillText("Zzz", p.x, p.y);
        }
        ctx.globalAlpha = 1;
    });
};
