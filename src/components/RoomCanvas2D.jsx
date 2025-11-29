import React, { useEffect, useRef } from "react";
import { SHOP_ITEMS } from "../constants";

export default React.memo(function RoomCanvas2D({
    equippedPets,
    activeTheme,
    activeSound,
    onAddCoins,
    isFocusing,
    isSupporter,
}) {
    const canvasRef = useRef(null);
    const requestRef = useRef();

    // Refs for props to access latest values in render loop without re-triggering effect
    const propsRef = useRef({
        equippedPets,
        activeTheme,
        activeSound,
        isFocusing,
        isSupporter
    });

    // Update refs when props change
    useEffect(() => {
        propsRef.current = {
            equippedPets,
            activeTheme,
            activeSound,
            isFocusing,
            isSupporter
        };
    }, [equippedPets, activeTheme, activeSound, isFocusing, isSupporter]);

    const petsRef = useRef([]);
    const cloudsRef = useRef([]);
    const rainRef = useRef([]);
    const particlesRef = useRef([]);

    const drawRoundRect = (ctx, x, y, w, h, r, color) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
        ctx.fill();
    };

    // Initialize objects only when equippedPets changes significantly
    useEffect(() => {
        petsRef.current = [];
        const activePets = SHOP_ITEMS.filter(
            (i) => i.category === "pet" && equippedPets.includes(i.id)
        );
        activePets.forEach((pet) => {
            petsRef.current.push({
                id: pet.id,
                data: pet,
                x: 150 + Math.random() * 200,
                y: 0,
                dir: 1,
                state: isFocusing ? "sleep" : "idle",
                timer: Math.random() * 3,
                frame: 0,
                blinkTimer: Math.random() * 200,
            });
        });

        // Initialize clouds and rain only once or if window resizes (handled in render)
        if (cloudsRef.current.length === 0) {
            cloudsRef.current = [
                { x: 50, y: 80, speed: 0.05, scale: 1.2, alpha: 0.8 },
                { x: 400, y: 120, speed: 0.08, scale: 0.8, alpha: 0.6 },
                { x: 700, y: 60, speed: 0.03, scale: 1.5, alpha: 0.9 },
            ];
        }

        if (rainRef.current.length === 0) {
            rainRef.current = Array.from({ length: 60 }, () => ({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                speed: 8 + Math.random() * 5,
            }));
        }
        particlesRef.current = []; // Clear particles on pet change
    }, [equippedPets, isFocusing]); // Only re-init pets when list changes or initial focus state changes

    // Main Render Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { alpha: false }); // Optimize for no transparency on canvas itself if possible

        const render = () => {
            // Access latest props from ref
            const { activeTheme, activeSound, isFocusing, isSupporter } = propsRef.current;

            const themeData = SHOP_ITEMS.find((i) => i.id === activeTheme) || SHOP_ITEMS[5];

            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const W = canvas.width;
            const H = canvas.height;
            const floorY = H * 0.65;

            // Scale factor for mobile
            const scale = Math.min(1, W / 800);

            // BG
            const wallGrad = ctx.createLinearGradient(0, 0, 0, floorY);
            wallGrad.addColorStop(0, themeData.bgTop);
            wallGrad.addColorStop(1, themeData.wall);
            ctx.fillStyle = wallGrad;
            ctx.fillRect(0, 0, W, floorY);

            const floorGrad = ctx.createLinearGradient(0, floorY, 0, H);
            floorGrad.addColorStop(0, themeData.shadow);
            floorGrad.addColorStop(1, themeData.floor);
            ctx.fillStyle = floorGrad;
            ctx.fillRect(0, floorY, W, H - floorY);

            ctx.fillStyle = "#fff";
            ctx.fillRect(0, floorY - 25 * scale, W, 25 * scale);
            ctx.fillStyle = "rgba(0,0,0,0.05)";
            ctx.fillRect(0, floorY - 25 * scale, W, 2 * scale);

            // Window
            const winW = 220 * scale;
            const winH = 160 * scale;
            const winX = W / 2 - winW / 2;
            const winY = floorY - 340 * scale;

            ctx.save();
            ctx.beginPath();
            ctx.roundRect(winX, winY, winW, winH, 20 * scale);
            ctx.clip();

            const skyGrad = ctx.createLinearGradient(winX, winY, winX, winY + winH);
            skyGrad.addColorStop(0, themeData.windowSky);
            skyGrad.addColorStop(1, themeData.wall);
            ctx.fillStyle = skyGrad;
            ctx.fillRect(winX, winY, winW, winH);

            if (!activeSound?.includes("rain")) {
                ctx.fillStyle = "#fff";
                cloudsRef.current.forEach((c) => {
                    c.x += c.speed;
                    if (c.x > W) c.x = -100;
                    ctx.globalAlpha = c.alpha;
                    ctx.beginPath();
                    ctx.arc(c.x, winY + 80 * scale, 40 * c.scale * scale, 0, Math.PI * 2);
                    ctx.arc(c.x + 30 * c.scale * scale, winY + 60 * scale, 50 * c.scale * scale, 0, Math.PI * 2);
                    ctx.fill();
                });
            }
            ctx.globalAlpha = 1;
            ctx.restore();

            ctx.lineWidth = 12 * scale;
            ctx.strokeStyle = "#fff";
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.strokeRect(winX, winY, winW, winH);

            ctx.lineWidth = 6 * scale;
            ctx.beginPath();
            ctx.moveTo(winX + winW / 2, winY);
            ctx.lineTo(winX + winW / 2, winY + winH);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(winX, winY + winH / 2);
            ctx.lineTo(winX + winW, winY + winH / 2);
            ctx.stroke();

            ctx.shadowColor = "rgba(0,0,0,0.1)";
            ctx.shadowBlur = 15 * scale;
            ctx.shadowOffsetY = 5 * scale;
            drawRoundRect(ctx, winX - 15 * scale, winY + winH, winW + 30 * scale, 15 * scale, 5 * scale, "#fff");
            ctx.shadowColor = "transparent";

            const gradRay = ctx.createLinearGradient(winX, winY, winX - 100 * scale, floorY);
            gradRay.addColorStop(0, themeData.lightColor);
            gradRay.addColorStop(1, "rgba(255,255,255,0)");
            ctx.fillStyle = gradRay;
            ctx.beginPath();
            ctx.moveTo(winX, winY);
            ctx.lineTo(winX + winW, winY);
            ctx.lineTo(winX + winW + 100 * scale, floorY);
            ctx.lineTo(winX - 100 * scale, floorY);
            ctx.fill();

            // Furniture
            const deskX = W * 0.75;
            const deskY = floorY - 100 * scale;
            ctx.fillStyle = "#a16207";
            ctx.fillRect(deskX + 30 * scale, deskY, 10 * scale, 100 * scale);
            ctx.fillRect(deskX + 160 * scale, deskY, 10 * scale, 100 * scale);

            ctx.shadowColor = "rgba(0,0,0,0.1)";
            ctx.shadowBlur = 15 * scale;
            ctx.shadowOffsetY = 5 * scale;
            ctx.fillStyle = "#fbbf24";
            ctx.beginPath();
            ctx.roundRect(deskX, deskY, 200 * scale, 20 * scale, 10 * scale);
            ctx.fill();
            ctx.shadowColor = "transparent";

            const plantX = W * 0.15;
            const plantY = floorY - 50 * scale;
            const sway = Math.sin(Date.now() / 800) * 3;
            ctx.fillStyle = "#d97706";
            ctx.beginPath();
            ctx.roundRect(plantX, plantY, 60 * scale, 50 * scale, 10 * scale);
            ctx.fill();
            ctx.fillStyle = "#86efac";
            ctx.beginPath();
            ctx.ellipse(
                plantX + 30 * scale,
                plantY - 30 * scale,
                25 * scale,
                40 * scale,
                0.1 + sway * 0.01,
                0,
                Math.PI * 2
            );
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(
                plantX + 30 * scale,
                plantY - 20 * scale,
                20 * scale,
                35 * scale,
                -0.2 + sway * 0.01,
                0,
                Math.PI * 2
            );
            ctx.fill();

            // Pets Logic & Render
            petsRef.current.forEach((pet) => {
                pet.blinkTimer--;
                if (pet.blinkTimer < -10) pet.blinkTimer = 200 + Math.random() * 300;

                // Logic
                if (pet.state === "idle") {
                    pet.timer -= 0.02;
                    if (pet.timer <= 0 && !isFocusing) {
                        if (Math.random() > 0.6) pet.state = "sleep";
                        else {
                            pet.state = "walk";
                            pet.targetX = 100 + Math.random() * (W - 200);
                            pet.dir = pet.targetX > pet.x ? 1 : -1;
                        }
                        pet.timer = 2 + Math.random() * 3;
                    }
                } else if (pet.state === "sleep") {
                    if (!isFocusing) {
                        pet.timer -= 0.01;
                        if (pet.timer <= 0) pet.state = "idle";
                    }
                    if (Math.random() < 0.01)
                        particlesRef.current.push({
                            x: pet.x + 10 * scale,
                            y: floorY - 60 * scale,
                            type: "z",
                            life: 1,
                        });
                } else {
                    const dx = pet.targetX - pet.x;
                    if (Math.abs(dx) < 5) {
                        pet.state = "idle";
                        pet.timer = 2 + Math.random() * 2;
                    } else {
                        pet.x += pet.dir * 1.5;
                        pet.frame += 0.2;
                    }
                }

                // Force sleep if focusing
                if (isFocusing && pet.state !== "sleep") {
                    pet.state = "sleep";
                }

                const bounce =
                    pet.state === "walk" ? Math.abs(Math.sin(pet.frame)) * 8 * scale : 0;
                const breathe =
                    pet.state === "idle" || pet.state === "sleep"
                        ? Math.sin(Date.now() / 300) * 2 * scale
                        : 0;
                const sleepSquish = pet.state === "sleep" ? 15 * scale : 0;
                const py = floorY - 30 * scale - bounce + sleepSquish;

                ctx.save();
                ctx.translate(pet.x, py);
                ctx.scale(scale, scale);

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
            });

            particlesRef.current.forEach((p, i) => {
                p.y -= 0.5;
                p.life -= 0.01;
                if (p.life <= 0) particlesRef.current.splice(i, 1);
                ctx.globalAlpha = p.life;
                if (p.type === "heart") {
                    ctx.fillStyle = "#fda4af";
                    ctx.font = "20px sans-serif";
                    ctx.fillText("❤️", p.x, p.y);
                } else {
                    ctx.fillStyle = "#94a3b8";
                    ctx.font = "bold 16px sans-serif";
                    ctx.fillText("Zzz", p.x, p.y);
                }
                ctx.globalAlpha = 1;
            });

            if (activeSound === "sound_rain") {
                ctx.strokeStyle = "rgba(186, 230, 253, 0.5)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                rainRef.current.forEach((r) => {
                    r.y += r.speed;
                    if (r.y > floorY) r.y = 0;
                    ctx.moveTo(r.x, r.y);
                    ctx.lineTo(r.x - 3, r.y + 15);
                });
                ctx.stroke();
            }
            ctx.fillStyle = themeData.lightColor;
            ctx.fillRect(0, 0, W, H);
            requestRef.current = requestAnimationFrame(render);
        };

        requestRef.current = requestAnimationFrame(render);
        return () => cancelAnimationFrame(requestRef.current);
    }, []); // Empty dependency array = run once!

    const handleClick = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        let clicked = false;
        petsRef.current.forEach((pet) => {
            if (Math.abs(pet.x - x) < 40 && y > canvasRef.current.height * 0.6) {
                clicked = true;
                pet.state = "walk";
                pet.timer = 2;
                particlesRef.current.push({
                    x: pet.x,
                    y: canvasRef.current.height * 0.65 - 80,
                    type: "heart",
                    life: 1,
                });
            }
        });
        if (clicked) onAddCoins(1);
    };

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full cursor-pointer"
            onClick={handleClick}
        />
    );
})
