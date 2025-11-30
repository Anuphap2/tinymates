import React, { useEffect, useRef } from "react";
import { SHOP_ITEMS } from "../constants";
import {
    drawRoundRect,
    drawTree,
    drawCurtains,
    drawBookshelf,
    drawGrass,
    drawLamp,
    drawCuteChair,
    drawRoundTable,
    drawRug,
    drawPainting,
    drawWindow,
    drawShelf
} from "../utils/canvasHelpers";
import {
    drawKitchen,
    drawBoho,
    drawOutdoor,
    drawGenericRoom,
    drawBedroom,
    drawCafe
} from "../utils/themeDrawers";
import { drawPet } from "../utils/petRenderer";
import { drawParticles } from "../utils/particleSystem";
import { drawWeatherEffects } from "../utils/weatherEffects";

export default React.memo(function RoomCanvas2D({
    equippedPets,
    activeTheme,
    activeSounds = [],
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
        activeSounds,
        isFocusing,
        isSupporter,
        onAddCoins
    });

    // Update refs when props change
    useEffect(() => {
        propsRef.current = {
            equippedPets,
            activeTheme,
            activeSounds,
            isFocusing,
            isSupporter,
            onAddCoins
        };
    }, [equippedPets, activeTheme, activeSounds, isFocusing, isSupporter, onAddCoins]);

    const petsRef = useRef([]);
    const cloudsRef = useRef([]);
    const rainRef = useRef([]);
    const particlesRef = useRef([]);
    const grassRef = useRef([]);
    const mouseRef = useRef({ x: 0, y: 0, active: false });
    const bookDataRef = useRef(null);

    // Initialize book data once to prevent flickering
    if (!bookDataRef.current) {
        const colors = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7"];
        bookDataRef.current = Array(3).fill(0).map(() =>
            Array(5).fill(0).map(() => ({
                h: 20 + Math.random() * 10,
                w: 8 + Math.random() * 5,
                color: colors[Math.floor(Math.random() * colors.length)]
            }))
        );
    }

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
                y: Math.random() * 40 - 20, // Depth offset (-20 to 20)
                dir: 1,
                state: isFocusing ? "sleep" : "idle",
                timer: Math.random() * 3,
                frame: 0,
                blinkTimer: Math.random() * 200,
                lastX: 0, // For stuck detection
                stuckTimer: 0,
                emote: null, // { type: 'heart' | 'music', life: 1.0 }
                emoteTimer: Math.random() * 500,
                lastPetTime: 0,
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

        // Initialize Grass (Static)
        if (grassRef.current.length === 0) {
            const W = window.innerWidth;
            for (let i = 0; i < W; i += 20) {
                if (Math.random() > 0.3) {
                    grassRef.current.push({
                        x: i + Math.random() * 10,
                        scale: 0.8 + Math.random() * 0.4
                    });
                }
            }
        }
        particlesRef.current = []; // Clear particles on pet change
    }, [equippedPets]);

    // Main Render Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { alpha: false });

        const render = () => {
            // Access latest props from ref
            const { activeTheme, activeSounds, isFocusing, isSupporter } = propsRef.current;

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

                if (!activeSounds.includes("sound_rain") && !activeSounds.includes("sound_wind")) {
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
                if (activeSounds.includes("sound_night")) {
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
                // Outdoor Sky Elements (Clouds/Sun directly on sky)
                if (!activeSounds.includes("sound_rain") && !activeSounds.includes("sound_wind")) {
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
                if (activeSounds.includes("sound_night")) {
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

            // Background Items (Fridge, Bed, Menu)
            // Background Items & Furniture
            if (activeTheme === "theme_kitchen") {
                drawKitchen(ctx, W, floorY, scale);
            } else if (activeTheme === "theme_bedroom") {
                drawBedroom(ctx, W, floorY, scale);
            } else if (activeTheme === "theme_cafe") {
                drawCafe(ctx, W, floorY, scale);
            } else if (activeTheme === "theme_boho") {
                drawBoho(ctx, W, floorY, scale);
            } else if (themeData.type === "outdoor") {
                // Outdoor Grass
                grassRef.current.forEach(g => {
                    drawGrass(ctx, g.x, floorY, scale * g.scale);
                });
                drawOutdoor(ctx, W, floorY, scale, activeTheme);
            } else {
                drawGenericRoom(ctx, W, floorY, scale, activeTheme, bookDataRef.current);
            }


            // Pets Logic & Render
            petsRef.current.forEach((pet) => {
                pet.blinkTimer--;
                if (pet.blinkTimer < -10) pet.blinkTimer = 200 + Math.random() * 300;

                // Logic
                // Mouse Follow Logic
                if (mouseRef.current.active && !isFocusing) {
                    pet.targetX = mouseRef.current.x;
                    // Target Y is 0 (center of floor depth) for now, or maybe slightly random
                    pet.targetY = 0;

                    const dx = pet.targetX - pet.x;
                    const dy = pet.targetY - pet.y;
                    const dist = Math.hypot(dx, dy);

                    if (dist > 10) {
                        pet.state = 'walk';
                        pet.dir = dx > 0 ? 1 : -1;
                        pet.timer = 1; // Keep walking

                        // Move towards target
                        const angle = Math.atan2(dy, dx);
                        pet.x += Math.cos(angle) * 1.5;
                        pet.y += Math.sin(angle) * 1.5;
                        pet.frame += 0.2;
                    } else {
                        // Reached target (cookie)
                        if (pet.state !== 'eat' && pet.state !== 'sit' && pet.state !== 'sleep') {
                            pet.state = 'eat';
                            pet.timer = 2; // Eat for 2 seconds
                            pet.frame = 0;
                        }
                    }
                } else if (pet.timer > 0) {
                    pet.timer -= 0.02;
                    if (pet.state === 'eat' && pet.timer <= 0) {
                        pet.state = 'sit'; // Sit after eating
                        pet.timer = 3;
                    }
                } else {
                    // Pick new state
                    pet.timer = 2 + Math.random() * 4;

                    if (isFocusing) {
                        // Focus Mode: Relaxed (Walk, Sit, Sleep) - No high energy jumping/dancing
                        const rand = Math.random();
                        if (rand < 0.4) {
                            pet.state = 'walk';
                            pet.targetX = 50 + Math.random() * (W - 100);
                            pet.targetY = Math.random() * 40 - 20;
                            pet.dir = pet.targetX > pet.x ? 1 : -1;
                        } else if (pet.state === 'sleep') {
                            pet.state = rand > 0.7 ? 'sit' : 'sleep';
                        } else {
                            pet.state = rand > 0.5 ? 'sleep' : 'sit';
                        }
                    } else {
                        // Normal Mode: All states
                        const rand = Math.random();
                        if (rand < 0.3) pet.state = 'idle';
                        else if (rand < 0.5) {
                            pet.state = 'walk';
                            // Ensure target is within bounds (padding 50px)
                            pet.targetX = 50 + Math.random() * (W - 100);
                            pet.targetY = Math.random() * 40 - 20; // Random depth
                            pet.dir = pet.targetX > pet.x ? 1 : -1;
                        }
                        else if (rand < 0.7) pet.state = 'sit';
                        else if (rand < 0.85) {
                            pet.state = 'jump';
                            pet.frame = 0;
                        }
                        else if (rand < 0.95) {
                            pet.state = 'dance'; // New State!
                            pet.frame = 0;
                        }
                        else pet.state = 'sleep';
                    }
                }

                // Emote Logic
                pet.emoteTimer--;
                if (pet.emoteTimer <= 0) {
                    pet.emote = {
                        type: Math.random() > 0.5 ? 'heart' : 'music',
                        life: 1.0,
                        yOffset: 0
                    };
                    pet.emoteTimer = 300 + Math.random() * 500;
                }
                if (pet.emote) {
                    pet.emote.life -= 0.01;
                    pet.emote.yOffset += 0.2;
                    if (pet.emote.life <= 0) pet.emote = null;
                }

                // Stuck Detection (Watchdog)
                if (pet.state === 'walk') {
                    if (Math.abs(pet.x - pet.lastX) < 0.1) {
                        pet.stuckTimer++;
                        if (pet.stuckTimer > 60) { // Stuck for ~1 sec
                            pet.state = 'idle'; // Force stop
                            pet.timer = 1; // Reset timer
                            pet.stuckTimer = 0;
                        }
                    } else {
                        pet.stuckTimer = 0;
                    }
                    pet.lastX = pet.x;
                }

                // Collision Avoidance
                petsRef.current.forEach(other => {
                    if (pet.id !== other.id) {
                        const dx = pet.x - other.x;
                        const dy = pet.y - other.y;
                        const dist = Math.hypot(dx, dy);

                        if (dist < 40) {
                            // Too close!
                            const angle = Math.atan2(dy, dx);
                            const force = (40 - dist) * 0.05;

                            if (pet.state === 'idle' || pet.state === 'sit' || pet.state === 'sleep') {
                                // Push idle pets away
                                pet.x += Math.cos(angle) * force;
                                pet.y += Math.sin(angle) * force;
                            } else if (pet.state === 'walk' && other.state === 'walk') {
                                // Walking pets nudge each other
                                pet.x += Math.cos(angle) * force * 0.5;
                                pet.y += Math.sin(angle) * force * 0.5;
                            }

                            // Clamp Y to floor bounds
                            pet.y = Math.max(-30, Math.min(30, pet.y));
                        }
                    }
                });

                // State Execution (Random Walk)
                if (pet.state === 'walk' && !mouseRef.current.active) {
                    const dx = pet.targetX - pet.x;
                    const dy = pet.targetY - pet.y;
                    const dist = Math.hypot(dx, dy);

                    if (dist < 5) {
                        pet.state = 'idle';
                    } else {
                        const angle = Math.atan2(dy, dx);
                        pet.x += Math.cos(angle) * 1.5;
                        pet.y += Math.sin(angle) * 1.5;
                        pet.frame += 0.2;
                    }
                } else if (pet.state === 'jump') {
                    pet.frame += 0.15;
                    if (pet.frame > Math.PI) {
                        pet.state = 'idle';
                        pet.frame = 0;
                    }
                } else if (pet.state === 'dance') {
                    pet.frame += 0.2;
                    if (pet.frame > Math.PI * 4) { // Dance for 2 cycles
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
                } else if (pet.state === 'eat') {
                    pet.frame += 0.5;
                    // Spawn Crumbs
                    if (Math.random() < 0.1) {
                        particlesRef.current.push({
                            x: pet.x + (Math.random() * 20 - 10) * scale,
                            y: floorY - 20 * scale,
                            type: "crumb",
                            life: 0.8,
                        });
                    }
                }

            });

            // Sort pets by Y (depth)
            const sortedPets = [...petsRef.current].sort((a, b) => a.y - b.y);

            // Draw Pets
            sortedPets.forEach(pet => {
                drawPet(ctx, pet, floorY, scale, isSupporter);
            });


            requestRef.current = requestAnimationFrame(render);
        };

        requestRef.current = requestAnimationFrame(render);
        return () => cancelAnimationFrame(requestRef.current);
    }, []); // Empty dependency array = run once!

    const handleMouseMove = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = canvasRef.current.width / rect.width;
        mouseRef.current = {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top), // Y not used for walking but good to have
            active: true
        };
    };

    const handleMouseLeave = () => {
        mouseRef.current.active = false;
    };

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
                const now = Date.now();
                if (now - pet.lastPetTime < 1500) return; // 1.5s Cooldown
                pet.lastPetTime = now;

                pet.state = "jump";
                pet.frame = 0;
                // Spawn Heart
                particlesRef.current.push({
                    x: pet.x,
                    y: py - 60,
                    type: "heart",
                    life: 1.5,
                });
                // Award Coins
                propsRef.current.onAddCoins(10);
            }
        });
    };
    return (
        <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full z-10"
            onClick={handleClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        />
    );
});
