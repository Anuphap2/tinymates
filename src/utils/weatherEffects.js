export const drawWeatherEffects = (ctx, W, H, activeSounds, rainRef, scale) => {
    let overlayColor = "transparent";

    if (activeSounds.includes("sound_rain")) {
        // Rain: Dark Blue Tint
        overlayColor = "rgba(0, 15, 40, 0.3)";

        // Raindrops
        ctx.strokeStyle = "rgba(186, 230, 253, 0.4)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        rainRef.current.forEach((r) => {
            r.y += r.speed;
            if (r.y > H) r.y = -20;
            ctx.moveTo(r.x, r.y);
            ctx.lineTo(r.x - 2, r.y + 15);
        });
        ctx.stroke();
    }
    else if (activeSounds.includes("sound_fire")) {
        // Fire: Warm Orange Tint + Flicker
        const flicker = Math.sin(Date.now() / 100) * 0.05 + 0.05;
        overlayColor = `rgba(60, 20, 0, ${0.1 + flicker})`;

        // Fire Glow (Radial)
        const fireGrad = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H);
        fireGrad.addColorStop(0, `rgba(255, 100, 0, ${0.1 + flicker})`);
        fireGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = fireGrad;
        ctx.fillRect(0, 0, W, H);

        // Embers (Simple procedural particles)
        ctx.fillStyle = "#fdba74";
        const time = Date.now() / 1000;
        for (let i = 0; i < 20; i++) {
            const ex = (Math.sin(i * 123 + time) * 0.5 + 0.5) * W;
            const ey = H - ((time * 50 + i * 100) % H);
            const size = Math.random() * 3 * scale;
            ctx.globalAlpha = 1 - (ey / H); // Fade out as they go up
            ctx.beginPath();
            ctx.arc(ex, ey, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
    else if (activeSounds.includes("sound_night")) {
        // Night: Deep Blue/Purple Tint
        overlayColor = "rgba(10, 10, 35, 0.5)";
    }
    else if (activeSounds.includes("sound_waves")) {
        // Ocean: Cyan/Teal Tint
        overlayColor = "rgba(0, 40, 50, 0.2)";
    }

    // Global Overlay
    ctx.fillStyle = overlayColor;
    ctx.fillRect(0, 0, W, H);

    // Vignette
    const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.6, W / 2, H / 2, H * 1.5);
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(0,0,0,0.4)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);
};
