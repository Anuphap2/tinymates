export const drawWeatherEffects = (ctx, W, H, activeSounds, rainRef, scale) => {
    let overlayColor = "transparent";

    if (activeSounds.includes("sound_rain")) {
        // Rain: Gentle Moody Blue Tint
        overlayColor = "rgba(15, 23, 42, 0.22)";

        // Slanted Raindrops
        ctx.strokeStyle = "rgba(186, 230, 253, 0.45)";
        ctx.lineWidth = 1.8 * scale;
        ctx.lineCap = "round";
        ctx.beginPath();
        if (rainRef && rainRef.current) {
            rainRef.current.forEach((r) => {
                r.y += r.speed;
                r.x -= 1.5;
                if (r.y > H) {
                    r.y = -20;
                    r.x = Math.random() * (W + 200);
                }
                ctx.moveTo(r.x, r.y);
                ctx.lineTo(r.x - 4, r.y + 18 * scale);
            });
        }
        ctx.stroke();

        // Floor splash ripples
        ctx.strokeStyle = "rgba(186, 230, 253, 0.2)";
        ctx.lineWidth = 1;
        const time = Date.now() / 300;
        for (let i = 0; i < 8; i++) {
            const sx = (Math.sin(i * 99 + time) * 0.5 + 0.5) * W;
            const sy = H * 0.65 + (i * 25) % (H * 0.35);
            const radius = (time * 10 + i * 5) % 15;
            ctx.beginPath();
            ctx.ellipse(sx, sy, radius * scale, radius * 0.4 * scale, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
    } else if (activeSounds.includes("sound_fire")) {
        // Fire: Warm Amber Atmosphere + Soft Ambient Glow
        const flicker = Math.sin(Date.now() / 150) * 0.03 + 0.04;
        overlayColor = `rgba(45, 20, 5, ${0.12 + flicker})`;

        // Fire Glow (Radial)
        const fireGrad = ctx.createRadialGradient(W / 2, H * 0.7, H * 0.1, W / 2, H * 0.7, H * 0.8);
        fireGrad.addColorStop(0, `rgba(249, 115, 22, ${0.15 + flicker})`);
        fireGrad.addColorStop(0.6, `rgba(234, 88, 12, ${0.05 + flicker})`);
        fireGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = fireGrad;
        ctx.fillRect(0, 0, W, H);

        // Rising Embers with organic sway
        ctx.fillStyle = "#fdba74";
        const time = Date.now() / 1000;
        for (let i = 0; i < 24; i++) {
            const ex = (Math.sin(i * 73 + time * 0.5) * 0.5 + 0.5) * W + Math.sin(time * 2 + i) * 15;
            const ey = H - ((time * 40 + i * 45) % H);
            const size = (1.5 + Math.sin(i + time) * 0.8) * scale;
            ctx.globalAlpha = Math.max(0, 1 - (ey / H) * 0.85);
            ctx.beginPath();
            ctx.arc(ex, ey, Math.max(1, size), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    } else if (activeSounds.includes("sound_night")) {
        // Night Crickets: Serene Indigo Tint + Twinkling Fireflies
        overlayColor = "rgba(10, 15, 35, 0.28)";

        // Floating Fireflies
        const time = Date.now() / 1000;
        ctx.fillStyle = "#fef08a";
        for (let i = 0; i < 16; i++) {
            const fx = (Math.sin(i * 47 + time * 0.3) * 0.5 + 0.5) * W + Math.sin(time + i) * 20;
            const fy = H * 0.3 + (Math.cos(i * 31 + time * 0.2) * 0.5 + 0.5) * (H * 0.5);
            const pulse = Math.sin(time * 3 + i * 2) * 0.5 + 0.5;
            ctx.globalAlpha = pulse * 0.8;
            ctx.beginPath();
            ctx.arc(fx, fy, 2.5 * scale, 0, Math.PI * 2);
            ctx.fill();
            // Firefly glow
            ctx.globalAlpha = pulse * 0.25;
            ctx.beginPath();
            ctx.arc(fx, fy, 8 * scale, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    } else if (activeSounds.includes("sound_waves")) {
        // Ocean: Crisp Aqua / Cyan Mist
        overlayColor = "rgba(8, 47, 73, 0.15)";
    }

    if (overlayColor !== "transparent") {
        ctx.fillStyle = overlayColor;
        ctx.fillRect(0, 0, W, H);
    }

    // Subtle ElevenLabs Editorial Vignette
    const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.55, W / 2, H / 2, H * 1.3);
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(12, 10, 9, 0.18)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);
};
