import React, { useEffect, useRef } from "react";
import { SHOP_ITEMS } from "../constants";
import {
    drawRoundRect,
    drawTree,
    drawCurtains,
    drawBookshelf,
    drawGrass,
    drawLamp
} from "../utils/canvasHelpers";

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
    }, [equippedPets]);

    // Main Render Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { alpha: false });

        const render = () => {
            // Access latest props from ref
            const { activeTheme, activeSound, isFocusing, isSupporter } = propsRef.current;

            const themeData = SHOP_ITEMS.find((i) => i.id === activeTheme) || SHOP_ITEMS[5];

            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const W = canvas.width;
            const H = canvas.height;
            const floorY = H * 0.65;

            // Reset Context State
            ctx.globalAlpha = 1;
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.clearRect(0, 0, W, H);

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

            // Floor Patterns
            if (activeTheme === "theme_kitchen") {
                // Tiled Floor
                ctx.fillStyle = "rgba(0,0,0,0.05)";
                for (let i = 0; i < W; i += 40 * scale) {
                    ctx.fillRect(i, floorY, 2 * scale, H - floorY);
                }
                for (let i = floorY; i < H; i += 40 * scale) {
                    ctx.fillRect(0, i, W, 2 * scale);
                }
            } else if (activeTheme === "theme_bedroom") {
                // Rug
                ctx.fillStyle = "rgba(255,255,255,0.3)";
                ctx.beginPath();
                ctx.ellipse(W / 2, floorY + 100 * scale, 150 * scale, 60 * scale, 0, 0, Math.PI * 2);
                ctx.fill();
            }

            // Corner Shadows (Ambient Occlusion)
            const cornerGrad = ctx.createRadialGradient(W / 2, H / 2, H * 0.5, W / 2, H / 2, H * 1.2);
            cornerGrad.addColorStop(0, "rgba(0,0,0,0)");
            cornerGrad.addColorStop(1, "rgba(0,0,0,0.3)");
            ctx.fillStyle = cornerGrad;
            ctx.fillRect(0, 0, W, H);

            ctx.fillStyle = "#fff";
            ctx.fillRect(0, floorY - 25 * scale, W, 25 * scale);
            ctx.fillStyle = "rgba(0,0,0,0.05)";
            ctx.fillRect(0, floorY - 25 * scale, W, 2 * scale);

            // Window (Only for Indoor)
            if (themeData.type !== "outdoor") {
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

                // Stars for Night Sound (Window View)
                if (activeSound === "sound_night") {
                    ctx.fillStyle = "#fff";
                    const time = Date.now() / 1000;
                    for (let i = 0; i < 20; i++) {
                        const sx = (Math.sin(i * 132 + time * 0.1) * 0.5 + 0.5) * winW + winX;
                        const sy = (Math.cos(i * 53 + time * 0.05) * 0.5 + 0.5) * winH + winY;
                        const size = Math.sin(time * 2 + i) * 1.5 * scale;
                        if (size > 0) {
                            ctx.globalAlpha = Math.abs(Math.sin(time + i));
                            ctx.beginPath();
                            ctx.arc(sx, sy, size, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                    ctx.globalAlpha = 1;
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
            } else {
                // Outdoor Sky Elements (Clouds/Sun directly on sky)
                if (!activeSound?.includes("rain")) {
                    ctx.fillStyle = "#fff";
                    cloudsRef.current.forEach((c) => {
                        c.x += c.speed;
                        if (c.x > W) c.x = -100;
                        ctx.globalAlpha = c.alpha;
                        ctx.beginPath();
                        ctx.arc(c.x, 100 * scale, 40 * c.scale * scale, 0, Math.PI * 2);
                        ctx.arc(c.x + 30 * c.scale * scale, 80 * scale, 50 * c.scale * scale, 0, Math.PI * 2);
                        ctx.fill();
                    });
                }
                // Stars for Night Sound (Outdoor View)
                if (activeSound === "sound_night") {
                    ctx.fillStyle = "#fff";
                    const time = Date.now() / 1000;
                    for (let i = 0; i < 50; i++) {
                        const sx = (Math.sin(i * 132 + time * 0.1) * 0.5 + 0.5) * W;
                        const sy = (Math.cos(i * 53 + time * 0.05) * 0.5 + 0.5) * (floorY - 50);
                        const size = Math.sin(time * 2 + i) * 1.5 * scale;
                        if (size > 0) {
                            ctx.globalAlpha = Math.abs(Math.sin(time + i));
                            ctx.beginPath();
                            ctx.arc(sx, sy, size, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                    ctx.globalAlpha = 1;
                }

                // Draw Trees in Background
                ctx.globalAlpha = 1; // Reset alpha after clouds/stars
                drawTree(ctx, W * 0.1, floorY, scale * 1.2);
                drawTree(ctx, W * 0.25, floorY - 20 * scale, scale * 0.9);
                drawTree(ctx, W * 0.8, floorY - 10 * scale, scale * 1.1);
                drawTree(ctx, W * 0.95, floorY, scale * 1.3);
            }

            // Background Items (Fridge, Bed, Menu)
            if (activeTheme === "theme_kitchen") {
                // Fridge
                const fridgeX = W * 0.1;
                const fridgeY = floorY - 180 * scale;
                ctx.fillStyle = "#e2e8f0"; // Silver
                ctx.fillRect(fridgeX, fridgeY, 80 * scale, 180 * scale);
                ctx.fillStyle = "#cbd5e1"; // Shadow/Detail
                ctx.fillRect(fridgeX + 75 * scale, fridgeY, 5 * scale, 180 * scale); // Side
                ctx.fillRect(fridgeX, fridgeY + 50 * scale, 80 * scale, 2 * scale); // Freezer line
                ctx.fillStyle = "#94a3b8"; // Handle
                ctx.fillRect(fridgeX + 10 * scale, fridgeY + 60 * scale, 5 * scale, 40 * scale);

                // Hanging Light
                drawLamp(ctx, W * 0.75 + 100 * scale, 0, scale); // Reusing lamp logic slightly modified? No, drawLamp is standing.
                // Custom Hanging Light
                const lightX = W * 0.75 + 100 * scale;
                ctx.fillStyle = "#475569";
                ctx.fillRect(lightX, 0, 2 * scale, 100 * scale);
                ctx.fillStyle = "#fef3c7";
                ctx.beginPath();
                ctx.arc(lightX, 100 * scale, 15 * scale, 0, Math.PI, true);
                ctx.fill();

            } else if (activeTheme === "theme_bedroom") {
                // Bed
                const bedX = W * 0.1;
                const bedY = floorY - 60 * scale;
                ctx.fillStyle = "#f472b6"; // Pink sheets
                ctx.beginPath();
                ctx.roundRect(bedX, bedY, 160 * scale, 80 * scale, 10 * scale);
                ctx.fill();
                // Pillow
                ctx.fillStyle = "#fff";
                ctx.beginPath();
                ctx.ellipse(bedX + 30 * scale, bedY + 20 * scale, 20 * scale, 15 * scale, 0, 0, Math.PI * 2);
                ctx.fill();
                // Blanket
                ctx.fillStyle = "#db2777";
                ctx.beginPath();
                ctx.roundRect(bedX + 60 * scale, bedY, 100 * scale, 80 * scale, 10 * scale);
                ctx.fill();

                // Nightstand & Lamp
                ctx.fillStyle = "#a16207";
                ctx.fillRect(bedX - 40 * scale, floorY - 40 * scale, 30 * scale, 40 * scale);
                drawLamp(ctx, bedX - 25 * scale, floorY - 80 * scale, scale * 0.8);

            } else if (activeTheme === "theme_cafe") {
                // Menu Board
                const menuX = W * 0.15;
                const menuY = floorY - 250 * scale;
                ctx.fillStyle = "#44403c"; // Blackboard
                ctx.fillRect(menuX, menuY, 100 * scale, 120 * scale);
                ctx.fillStyle = "#a8a29e"; // Frame
                ctx.lineWidth = 5 * scale;
                ctx.strokeRect(menuX, menuY, 100 * scale, 120 * scale);
                // Text lines
                ctx.fillStyle = "rgba(255,255,255,0.5)";
                for (let i = 0; i < 5; i++) {
                    ctx.fillRect(menuX + 10 * scale, menuY + 20 * scale + i * 20 * scale, 60 * scale, 2 * scale);
                }
                // Hanging Plants
                const plantX = W * 0.8;
                ctx.fillStyle = "#166534";
                ctx.beginPath();
                ctx.moveTo(plantX, 0);
                ctx.lineTo(plantX, 60 * scale);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(plantX, 60 * scale, 15 * scale, 0, Math.PI * 2);
                ctx.fill();
                // Leaves hanging
                ctx.beginPath();
                ctx.ellipse(plantX - 10 * scale, 70 * scale, 5 * scale, 15 * scale, 0.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(plantX + 10 * scale, 70 * scale, 5 * scale, 15 * scale, -0.5, 0, Math.PI * 2);
                ctx.fill();
            }

            // Indoor Decor (Bookshelf, Curtains)
            if (themeData.type !== "outdoor") {
                // Bookshelf (if not Kitchen/Cafe/Bedroom specific spot occupied)
                if (activeTheme !== "theme_kitchen" && activeTheme !== "theme_cafe") {
                    drawBookshelf(ctx, W * 0.05, floorY - 150 * scale, scale);
                }

                // Curtains on Window
                const winW = 220 * scale;
                const winX = W / 2 - winW / 2;
                const winY = floorY - 340 * scale;
                drawCurtains(ctx, winX - 10 * scale, winY - 10 * scale, winW + 20 * scale, 180 * scale, scale);
            } else {
                // Outdoor Grass
                for (let i = 0; i < W; i += 30 * scale) {
                    if (Math.random() > 0.5) drawGrass(ctx, i, floorY, scale);
                }
            }

            // God Rays (Atmosphere)
            const rayGrad = ctx.createLinearGradient(W / 2, 0, W / 2, H);
            rayGrad.addColorStop(0, "rgba(255, 255, 255, 0.1)");
            rayGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
            ctx.fillStyle = rayGrad;
            ctx.beginPath();
            ctx.moveTo(W * 0.2, 0);
            ctx.lineTo(W * 0.8, 0);
            ctx.lineTo(W * 0.6, H);
            ctx.lineTo(W * 0.4, H);
            ctx.fill();

            // Furniture
            const deskX = W * 0.75;
            const deskY = floorY - 100 * scale;

            if (themeData.type === "outdoor") {
                // Picnic Table / Bench
                ctx.fillStyle = "#a16207"; // Wood
                // Legs
                ctx.beginPath();
                ctx.moveTo(deskX + 40 * scale, deskY + 100 * scale);
                ctx.lineTo(deskX + 60 * scale, deskY + 20 * scale);
                ctx.lineTo(deskX + 70 * scale, deskY + 20 * scale);
                ctx.lineTo(deskX + 50 * scale, deskY + 100 * scale);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(deskX + 190 * scale, deskY + 100 * scale);
                ctx.lineTo(deskX + 170 * scale, deskY + 20 * scale);
                ctx.lineTo(deskX + 160 * scale, deskY + 20 * scale);
                ctx.lineTo(deskX + 180 * scale, deskY + 100 * scale);
                ctx.fill();

                // Top
                ctx.fillStyle = "#fbbf24";
                ctx.beginPath();
                // Desk Shadow
                ctx.shadowColor = "rgba(0,0,0,0.1)";
                ctx.shadowBlur = 15 * scale;
                ctx.shadowOffsetY = 5 * scale;

                // Desk Top
                ctx.fillStyle = "#fbbf24";
                ctx.beginPath();
                ctx.roundRect(deskX, deskY, 200 * scale, 20 * scale, 10 * scale);
                ctx.fill();
                ctx.shadowColor = "transparent";

                // Drawers
                ctx.fillStyle = "#d97706";
                ctx.fillRect(deskX + 160 * scale, deskY + 20 * scale, 30 * scale, 40 * scale);
                ctx.fillStyle = "#fcd34d"; // Handle
                ctx.beginPath();
                ctx.arc(deskX + 175 * scale, deskY + 40 * scale, 3 * scale, 0, Math.PI * 2);
                ctx.fill();

                // Laptop
                ctx.fillStyle = "#cbd5e1"; // Base
                ctx.beginPath();
                ctx.roundRect(deskX + 80 * scale, deskY - 5 * scale, 60 * scale, 5 * scale, 2 * scale);
                ctx.fill();
                ctx.fillStyle = "#94a3b8"; // Screen back
                ctx.beginPath();
                ctx.roundRect(deskX + 80 * scale, deskY - 45 * scale, 60 * scale, 40 * scale, 4 * scale);
                ctx.fill();
                ctx.fillStyle = "#334155"; // Screen
                ctx.beginPath();
                ctx.roundRect(deskX + 85 * scale, deskY - 40 * scale, 50 * scale, 30 * scale, 2 * scale);
                ctx.fill();
                // Apple logo (cute dot)
                ctx.fillStyle = "#fff";
                ctx.beginPath();
                ctx.arc(deskX + 110 * scale, deskY - 25 * scale, 3 * scale, 0, Math.PI * 2);
                ctx.fill();
            }

            const plantX = W * 0.15;
            const plantY = floorY - 50 * scale;
            const sway = Math.sin(Date.now() / 800) * 3;

            // Pot Shadow
            ctx.fillStyle = "rgba(0,0,0,0.1)";
            ctx.beginPath();
            ctx.ellipse(plantX + 30 * scale, plantY + 50 * scale, 25 * scale, 8 * scale, 0, 0, Math.PI * 2);
            ctx.fill();

            // Pot
            ctx.fillStyle = "#d97706";
            ctx.beginPath();
            ctx.moveTo(plantX + 10 * scale, plantY + 50 * scale); // Bottom Left
            ctx.lineTo(plantX + 50 * scale, plantY + 50 * scale); // Bottom Right
            ctx.lineTo(plantX + 60 * scale, plantY); // Top Right
            ctx.lineTo(plantX, plantY); // Top Left
            ctx.closePath();
            ctx.fill();

            // Pot Rim
            ctx.fillStyle = "#b45309";
            ctx.beginPath();
            ctx.roundRect(plantX - 5 * scale, plantY, 70 * scale, 10 * scale, 5 * scale);
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
                if (pet.timer > 0) {
                    pet.timer -= 0.02;
                } else {
                    // Pick new state
                    pet.timer = 2 + Math.random() * 4;

                    if (isFocusing) {
                        // Focus Mode: Quiet states only (Sit or Sleep)
                        const rand = Math.random();
                        if (pet.state === 'sleep') {
                            pet.state = rand > 0.7 ? 'sit' : 'sleep'; // 30% chance to wake up and sit
                        } else {
                            pet.state = rand > 0.5 ? 'sleep' : 'sit'; // 50% chance to sleep
                        }
                    } else {
                        // Normal Mode: All states
                        const rand = Math.random();
                        if (rand < 0.35) pet.state = 'idle';
                        else if (rand < 0.55) {
                            pet.state = 'walk';
                            pet.targetX = 100 + Math.random() * (W - 200);
                            pet.dir = pet.targetX > pet.x ? 1 : -1;
                        }
                        else if (rand < 0.8) pet.state = 'sit';
                        else if (rand < 0.9) {
                            pet.state = 'jump';
                            pet.frame = 0;
                        }
                        else pet.state = 'sleep';
                    }
                }

                // State Execution
                if (pet.state === 'walk') {
                    const dx = pet.targetX - pet.x;
                    if (Math.abs(dx) < 5) {
                        pet.state = 'idle';
                    } else {
                        pet.x += pet.dir * 1.5;
                        pet.frame += 0.2;
                    }
                } else if (pet.state === 'jump') {
                    pet.frame += 0.15;
                    if (pet.frame > Math.PI) {
                        pet.state = 'idle';
                        pet.frame = 0;
                    }
                } else if (pet.state === 'sleep') {
                    if (Math.random() < 0.01)
                        particlesRef.current.push({
                            x: pet.x + 10 * scale,
                            y: floorY - 60 * scale,
                            type: "z",
                            life: 1,
                        });
                }

                // Drawing Offsets
                let bounce = 0;
                if (pet.state === 'walk') bounce = Math.abs(Math.sin(pet.frame)) * 8 * scale;
                if (pet.state === 'jump') bounce = Math.sin(pet.frame) * 30 * scale;

                const breathe =
                    pet.state === 'idle' || pet.state === 'sleep' || pet.state === 'sit'
                        ? Math.sin(Date.now() / 300) * 2 * scale
                        : 0;
                const sleepSquish = pet.state === 'sleep' ? 15 * scale : 0;
                const sitSquish = pet.state === 'sit' ? 5 * scale : 0;
                const py = floorY - 30 * scale - bounce + sleepSquish + sitSquish;

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

            // Fire Glow
            if (activeSound === "sound_fire") {
                const flicker = Math.sin(Date.now() / 100) * 0.1 + 0.1;
                const fireGrad = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H);
                fireGrad.addColorStop(0, `rgba(251, 146, 60, ${flicker})`);
                fireGrad.addColorStop(1, "rgba(0,0,0,0)");
                ctx.fillStyle = fireGrad;
                ctx.fillRect(0, 0, W, H);
            }
            // Vignette
            const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.6, W / 2, H / 2, H * 1.5);
            vignette.addColorStop(0, "rgba(0,0,0,0)");
            vignette.addColorStop(1, "rgba(0,0,0,0.4)");
            ctx.fillStyle = vignette;
            ctx.fillRect(0, 0, W, H);

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

        // Pet Interaction
        petsRef.current.forEach((pet) => {
            // Simple hit detection (approximate)
            const py = canvasRef.current.height * 0.65 - 30; // Approx floor Y
            if (Math.abs(pet.x - x) < 50 && Math.abs(y - py) < 80) {
                // Petting!
                pet.state = "jump";
                pet.frame = 0;
                // Spawn Heart
                particlesRef.current.push({
                    x: pet.x,
                    y: py - 60,
                    type: "heart",
                    life: 1.5,
                });
            }
        });
    };


    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full cursor-pointer"
            onClick={handleClick}
        />
    );
})
