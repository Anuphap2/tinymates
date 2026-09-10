import React, { useEffect, useRef } from "react";
import { SHOP_ITEMS } from "../constants";
import {
    drawRoundRect,
    drawTree,
    drawGrass,
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

    // Latest props ref for render loop
    const propsRef = useRef({
        equippedPets,
        activeTheme,
        activeSounds,
        isFocusing,
        isSupporter,
        onAddCoins
    });

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
    const treatRef = useRef(null); // Optional dropped treat/cookie on floor
    const mouseRef = useRef({ x: 0, y: 0, active: false });
    const bookDataRef = useRef(null);
    const sizeRef = useRef({ width: window.innerWidth, height: window.innerHeight, dpr: Math.min(window.devicePixelRatio || 1, 2) });

    // Initialize book data once
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

    // Initialize pets when equippedPets changes
    useEffect(() => {
        petsRef.current = [];
        const activePets = SHOP_ITEMS.filter(
            (i) => i.category === "pet" && equippedPets.includes(i.id)
        );
        const screenW = window.innerWidth;
        const petSpacing = Math.min(140, (screenW - 160) / Math.max(1, activePets.length));

        activePets.forEach((pet, index) => {
            petsRef.current.push({
                id: pet.id,
                data: pet,
                x: (screenW / 2) - ((activePets.length - 1) * petSpacing / 2) + (index * petSpacing) + (Math.random() * 30 - 15),
                y: Math.random() * 30 - 15,
                dir: Math.random() > 0.5 ? 1 : -1,
                state: isFocusing ? "sleep" : "idle",
                timer: 2 + Math.random() * 3,
                frame: Math.random() * 10,
                blinkTimer: 100 + Math.random() * 200,
                lastX: 0,
                stuckTimer: 0,
                emote: null,
                emoteTimer: 200 + Math.random() * 300,
                lastPetTime: 0,
            });
        });

        if (cloudsRef.current.length === 0) {
            cloudsRef.current = [
                { x: 50, y: 70, speed: 0.12, scale: 1.1, alpha: 0.8 },
                { x: 380, y: 110, speed: 0.08, scale: 0.85, alpha: 0.65 },
                { x: 720, y: 55, speed: 0.05, scale: 1.3, alpha: 0.85 },
            ];
        }

        if (rainRef.current.length === 0) {
            rainRef.current = Array.from({ length: 70 }, () => ({
                x: Math.random() * (window.innerWidth + 200),
                y: Math.random() * window.innerHeight,
                speed: 10 + Math.random() * 6,
            }));
        }

        if (grassRef.current.length === 0) {
            const W = window.innerWidth;
            for (let i = 0; i < W; i += 22) {
                if (Math.random() > 0.25) {
                    grassRef.current.push({
                        x: i + Math.random() * 8,
                        scale: 0.75 + Math.random() * 0.45
                    });
                }
            }
        }
    }, [equippedPets, isFocusing]);

    // Handle canvas resize smoothly without recreating per frame
    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const w = window.innerWidth;
            const h = window.innerHeight;
            sizeRef.current = { width: w, height: h, dpr };

            canvas.width = Math.floor(w * dpr);
            canvas.height = Math.floor(h * dpr);
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Main 60fps Animation & Render Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        const render = () => {
            const { activeTheme, activeSounds, isFocusing, isSupporter } = propsRef.current;
            const { width: W, height: H, dpr } = sizeRef.current;
            const floorY = H * 0.65;
            const scale = Math.min(1.1, Math.max(0.7, W / 900));

            // Reset transform & clear
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Scale for high DPR
            ctx.scale(dpr, dpr);

            const themeData = SHOP_ITEMS.find((i) => i.id === activeTheme) || SHOP_ITEMS[5];

            // --- 1. WALL & FLOOR BASE ---
            const wallGrad = ctx.createLinearGradient(0, 0, 0, floorY);
            wallGrad.addColorStop(0, themeData.bgTop);
            wallGrad.addColorStop(1, themeData.wall || "#ffffff");
            ctx.fillStyle = wallGrad;
            ctx.fillRect(0, 0, W, floorY);

            const floorGrad = ctx.createLinearGradient(0, floorY, 0, H);
            floorGrad.addColorStop(0, themeData.shadow || "rgba(0,0,0,0.05)");
            floorGrad.addColorStop(1, themeData.floor || "#f5f5f4");
            ctx.fillStyle = floorGrad;
            ctx.fillRect(0, floorY, W, H - floorY);

            // --- 2. ELEVENLABS SIGNATURE ATMOSPHERIC GRADIENT ORBS ---
            // Soft mint, peach, lavender, sky pastel orbs that drift quietly
            const now = Date.now() / 3000;
            const orb1X = W * 0.22 + Math.sin(now * 0.6) * 45 * scale;
            const orb1Y = floorY * 0.42 + Math.cos(now * 0.5) * 30 * scale;
            const orb1R = 190 * scale;
            const grad1 = ctx.createRadialGradient(orb1X, orb1Y, 0, orb1X, orb1Y, orb1R);
            grad1.addColorStop(0, "rgba(167, 229, 211, 0.22)"); // Mint
            grad1.addColorStop(0.7, "rgba(167, 229, 211, 0.05)");
            grad1.addColorStop(1, "rgba(167, 229, 211, 0)");
            ctx.fillStyle = grad1;
            ctx.fillRect(orb1X - orb1R, orb1Y - orb1R, orb1R * 2, orb1R * 2);

            const orb2X = W * 0.76 + Math.cos(now * 0.5) * 55 * scale;
            const orb2Y = floorY * 0.48 + Math.sin(now * 0.6) * 35 * scale;
            const orb2R = 210 * scale;
            const grad2 = ctx.createRadialGradient(orb2X, orb2Y, 0, orb2X, orb2Y, orb2R);
            grad2.addColorStop(0, "rgba(244, 197, 168, 0.20)"); // Peach
            grad2.addColorStop(0.5, "rgba(200, 184, 224, 0.10)"); // Lavender
            grad2.addColorStop(1, "rgba(200, 184, 224, 0)");
            ctx.fillStyle = grad2;
            ctx.fillRect(orb2X - orb2R, orb2Y - orb2R, orb2R * 2, orb2R * 2);

            // Baseboard / Moulding (Indoor)
            if (themeData.type !== "outdoor") {
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, floorY - 20 * scale, W, 20 * scale);
                ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
                ctx.fillRect(0, floorY - 20 * scale, W, 2 * scale);
            }

            // --- 3. ARCHITECTURAL WINDOW (Indoor) ---
            if (themeData.type !== "outdoor") {
                const winW = 230 * scale;
                const winH = 175 * scale;
                const winX = W / 2 - winW / 2;
                const winY = floorY - 350 * scale;

                ctx.save();
                ctx.beginPath();
                ctx.roundRect(winX, winY, winW, winH, 20 * scale);
                ctx.clip();

                // Sky background inside window
                const skyGrad = ctx.createLinearGradient(winX, winY, winX, winY + winH);
                skyGrad.addColorStop(0, themeData.windowSky || "#7dd3fc");
                skyGrad.addColorStop(1, themeData.wall || "#e0f2fe");
                ctx.fillStyle = skyGrad;
                ctx.fillRect(winX, winY, winW, winH);

                // Clouds in window
                if (!activeSounds.includes("sound_rain") && !activeSounds.includes("sound_wind")) {
                    ctx.fillStyle = "#ffffff";
                    cloudsRef.current.forEach((c) => {
                        c.x += c.speed;
                        if (c.x > W + 100) c.x = -100;
                        ctx.globalAlpha = c.alpha;
                        ctx.beginPath();
                        ctx.arc(c.x, winY + 80 * scale, 38 * c.scale * scale, 0, Math.PI * 2);
                        ctx.arc(c.x + 28 * c.scale * scale, winY + 62 * scale, 46 * c.scale * scale, 0, Math.PI * 2);
                        ctx.fill();
                    });
                    ctx.globalAlpha = 1;
                }

                // Stars in window for night sound or night theme
                if (activeSounds.includes("sound_night") || activeTheme === "theme_night") {
                    ctx.fillStyle = "#ffffff";
                    const t = Date.now() / 1000;
                    for (let i = 0; i < 20; i++) {
                        const sx = (Math.sin(i * 127 + t * 0.08) * 0.5 + 0.5) * winW + winX;
                        const sy = (Math.cos(i * 49 + t * 0.04) * 0.5 + 0.5) * winH + winY;
                        const starSize = Math.max(0.5, (Math.sin(t * 2 + i) * 0.5 + 0.8) * 1.5 * scale);
                        ctx.globalAlpha = Math.abs(Math.sin(t * 1.5 + i));
                        ctx.beginPath();
                        ctx.arc(sx, sy, starSize, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    ctx.globalAlpha = 1;
                }
                ctx.restore();

                // Window Frame (Clean White Minimalist)
                ctx.lineWidth = 10 * scale;
                ctx.strokeStyle = "#ffffff";
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.strokeRect(winX, winY, winW, winH);

                // Panes
                ctx.lineWidth = 4 * scale;
                ctx.beginPath();
                ctx.moveTo(winX + winW / 2, winY);
                ctx.lineTo(winX + winW / 2, winY + winH);
                ctx.moveTo(winX, winY + winH / 2);
                ctx.lineTo(winX + winW, winY + winH / 2);
                ctx.stroke();

                // Window Sill
                ctx.shadowColor = "rgba(0, 0, 0, 0.08)";
                ctx.shadowBlur = 12 * scale;
                ctx.shadowOffsetY = 4 * scale;
                drawRoundRect(ctx, winX - 16 * scale, winY + winH, winW + 32 * scale, 14 * scale, 6 * scale, "#ffffff");
                ctx.shadowColor = "transparent";

                // God Rays (Natural Sunbeams)
                const sunbeamGrad = ctx.createLinearGradient(winX, winY, winX - 90 * scale, floorY);
                sunbeamGrad.addColorStop(0, themeData.lightColor || "rgba(255, 255, 255, 0.25)");
                sunbeamGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
                ctx.fillStyle = sunbeamGrad;
                ctx.beginPath();
                ctx.moveTo(winX, winY);
                ctx.lineTo(winX + winW, winY);
                ctx.lineTo(winX + winW + 110 * scale, floorY);
                ctx.lineTo(winX - 110 * scale, floorY);
                ctx.fill();
            } else {
                // Outdoor Sky Elements
                if (!activeSounds.includes("sound_rain") && !activeSounds.includes("sound_wind")) {
                    ctx.fillStyle = "#ffffff";
                    cloudsRef.current.forEach((c) => {
                        c.x += c.speed;
                        if (c.x > W + 100) c.x = -100;
                        ctx.globalAlpha = c.alpha * 0.85;
                        ctx.beginPath();
                        ctx.arc(c.x, 90 * scale, 45 * c.scale * scale, 0, Math.PI * 2);
                        ctx.arc(c.x + 35 * c.scale * scale, 75 * scale, 55 * c.scale * scale, 0, Math.PI * 2);
                        ctx.fill();
                    });
                    ctx.globalAlpha = 1;
                }

                // Trees in Background
                drawTree(ctx, W * 0.12, floorY, scale * 1.15);
                drawTree(ctx, W * 0.26, floorY - 15 * scale, scale * 0.9);
                drawTree(ctx, W * 0.78, floorY - 10 * scale, scale * 1.05);
                drawTree(ctx, W * 0.92, floorY, scale * 1.25);
            }

            // --- 4. THEME FURNITURE & DECOR ---
            if (activeTheme === "theme_kitchen") {
                drawKitchen(ctx, W, floorY, scale);
            } else if (activeTheme === "theme_bedroom") {
                drawBedroom(ctx, W, floorY, scale);
            } else if (activeTheme === "theme_cafe") {
                drawCafe(ctx, W, floorY, scale);
            } else if (activeTheme === "theme_boho") {
                drawBoho(ctx, W, floorY, scale);
            } else if (themeData.type === "outdoor") {
                grassRef.current.forEach((g) => {
                    drawGrass(ctx, g.x, floorY, scale * g.scale);
                });
                drawOutdoor(ctx, W, floorY, scale, activeTheme);
            } else {
                drawGenericRoom(ctx, W, floorY, scale, activeTheme, bookDataRef.current);
            }

            // --- 5. DROPPED TREAT / COOKIE (If clicked on floor) ---
            if (treatRef.current) {
                const treat = treatRef.current;
                treat.life -= 0.005;
                if (treat.life <= 0) {
                    treatRef.current = null;
                } else {
                    ctx.save();
                    ctx.globalAlpha = Math.min(1, treat.life * 2);
                    // Cookie plate / cookie
                    ctx.fillStyle = "#d97706";
                    ctx.beginPath();
                    ctx.arc(treat.x, treat.y, 8 * scale, 0, Math.PI * 2);
                    ctx.fill();
                    // Choco chips
                    ctx.fillStyle = "#78350f";
                    ctx.beginPath();
                    ctx.arc(treat.x - 3 * scale, treat.y - 2 * scale, 1.8 * scale, 0, Math.PI * 2);
                    ctx.arc(treat.x + 3 * scale, treat.y - 1 * scale, 1.8 * scale, 0, Math.PI * 2);
                    ctx.arc(treat.x, treat.y + 3 * scale, 1.8 * scale, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }

            // --- 6. PETS LOGIC & BEHAVIOR ---
            petsRef.current.forEach((pet) => {
                pet.blinkTimer--;
                if (pet.blinkTimer < -12) {
                    pet.blinkTimer = 180 + Math.random() * 250;
                }

                // If a treat is on the floor, pets walk to eat it!
                if (treatRef.current && !isFocusing) {
                    const t = treatRef.current;
                    const dx = t.x - pet.x;
                    const dist = Math.abs(dx);
                    if (dist > 18) {
                        pet.state = 'walk';
                        pet.dir = dx > 0 ? 1 : -1;
                        pet.x += (dx > 0 ? 1 : -1) * 1.6;
                        pet.frame += 0.22;
                    } else if (pet.state !== 'eat') {
                        pet.state = 'eat';
                        pet.timer = 2.5;
                        pet.frame = 0;
                    }
                } else if (pet.timer > 0) {
                    pet.timer -= 0.016;
                    if (pet.state === 'eat' && pet.timer <= 0) {
                        pet.state = 'sit';
                        pet.timer = 2.5;
                        // Spawning happy heart after eating
                        pet.emote = { type: 'heart', life: 1.0, yOffset: 0 };
                    }
                } else {
                    // Choose next natural state
                    pet.timer = 2.5 + Math.random() * 4;

                    if (isFocusing) {
                        // Focus Mode: Calming behaviors (Sleep, Sit, Gentle short stroll)
                        const rand = Math.random();
                        if (rand < 0.45) {
                            pet.state = 'sleep';
                        } else if (rand < 0.8) {
                            pet.state = 'sit';
                        } else {
                            pet.state = 'walk';
                            pet.targetX = 60 + Math.random() * (W - 120);
                            pet.targetY = Math.random() * 24 - 12;
                            pet.dir = pet.targetX > pet.x ? 1 : -1;
                        }
                    } else {
                        // Normal Mode: Playful and energetic
                        const rand = Math.random();
                        if (rand < 0.28) {
                            pet.state = 'idle';
                        } else if (rand < 0.55) {
                            pet.state = 'walk';
                            pet.targetX = 60 + Math.random() * (W - 120);
                            pet.targetY = Math.random() * 28 - 14;
                            pet.dir = pet.targetX > pet.x ? 1 : -1;
                        } else if (rand < 0.72) {
                            pet.state = 'sit';
                        } else if (rand < 0.86) {
                            pet.state = 'jump';
                            pet.frame = 0;
                        } else if (rand < 0.94) {
                            pet.state = 'dance';
                            pet.frame = 0;
                        } else {
                            pet.state = 'sleep';
                        }
                    }
                }

                // Periodic Emote Bubbles
                pet.emoteTimer--;
                if (pet.emoteTimer <= 0) {
                    pet.emote = {
                        type: Math.random() > 0.4 ? 'heart' : 'sparkle',
                        life: 1.0,
                        yOffset: 0
                    };
                    pet.emoteTimer = 350 + Math.random() * 500;
                }
                if (pet.emote) {
                    pet.emote.life -= 0.012;
                    pet.emote.yOffset = (pet.emote.yOffset || 0) + 0.25;
                    if (pet.emote.life <= 0) pet.emote = null;
                }

                // Stuck Watchdog
                if (pet.state === 'walk') {
                    if (Math.abs(pet.x - pet.lastX) < 0.1) {
                        pet.stuckTimer = (pet.stuckTimer || 0) + 1;
                        if (pet.stuckTimer > 50) {
                            pet.state = 'idle';
                            pet.timer = 1.5;
                            pet.stuckTimer = 0;
                        }
                    } else {
                        pet.stuckTimer = 0;
                    }
                    pet.lastX = pet.x;
                }

                // Soft Spacing between pets
                petsRef.current.forEach((other) => {
                    if (pet.id !== other.id) {
                        const dx = pet.x - other.x;
                        const dy = (pet.y || 0) - (other.y || 0);
                        const dist = Math.hypot(dx, dy);
                        if (dist < 46) {
                            const angle = Math.atan2(dy, dx);
                            const force = (46 - dist) * 0.04;
                            pet.x += Math.cos(angle) * force;
                            pet.y = Math.max(-25, Math.min(25, (pet.y || 0) + Math.sin(angle) * force));
                        }
                    }
                });

                // State Progression
                if (pet.state === 'walk') {
                    if (pet.targetX !== undefined) {
                        const dx = pet.targetX - pet.x;
                        if (Math.abs(dx) < 6) {
                            pet.state = 'idle';
                        } else {
                            pet.x += (dx > 0 ? 1 : -1) * 1.3;
                            pet.frame += 0.2;
                        }
                    } else {
                        pet.state = 'idle';
                    }
                } else if (pet.state === 'jump') {
                    pet.frame += 0.14;
                    if (pet.frame > Math.PI) {
                        pet.state = 'idle';
                        pet.frame = 0;
                    }
                } else if (pet.state === 'dance') {
                    pet.frame += 0.18;
                    if (pet.frame > Math.PI * 4) {
                        pet.state = 'idle';
                        pet.frame = 0;
                    }
                } else if (pet.state === 'sleep') {
                    // Spawn gentle Zzz particles
                    if (Math.random() < 0.018) {
                        particlesRef.current.push({
                            x: pet.x + 12 * scale,
                            y: floorY - 50 * scale + (pet.y || 0) * scale,
                            type: "z",
                            life: 1.0,
                            decay: 0.012,
                        });
                    }
                } else if (pet.state === 'eat') {
                    pet.frame += 0.4;
                    if (Math.random() < 0.12) {
                        particlesRef.current.push({
                            x: pet.x + (Math.random() * 20 - 10) * scale,
                            y: floorY - 14 * scale + (pet.y || 0) * scale,
                            type: "crumb",
                            life: 0.9,
                            decay: 0.02,
                        });
                    }
                }
            });

            // --- 7. WEATHER EFFECTS (Connected!) ---
            drawWeatherEffects(ctx, W, H, activeSounds, rainRef, scale);

            // --- 8. DRAW PETS (Sorted by floor depth) ---
            const sortedPets = [...petsRef.current].sort((a, b) => (a.y || 0) - (b.y || 0));
            sortedPets.forEach((pet) => {
                drawPet(ctx, pet, floorY, scale, isSupporter);
            });

            // --- 9. DRAW PARTICLES (Connected!) ---
            drawParticles(ctx, particlesRef.current);

            requestRef.current = requestAnimationFrame(render);
        };

        requestRef.current = requestAnimationFrame(render);
        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    // Interactive mouse / touch handling
    const handlePointerMove = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        mouseRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            active: true
        };
    };

    const handlePointerLeave = () => {
        mouseRef.current.active = false;
    };

    const handleClick = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        const floorY = canvas.offsetHeight * 0.65;

        // 1. Check if user clicked on any pet (Petting interaction!)
        let pettedPet = false;
        petsRef.current.forEach((pet) => {
            const petPy = floorY - 30 + (pet.y || 0);
            if (Math.abs(pet.x - clickX) < 45 && Math.abs(petPy - clickY) < 65) {
                pettedPet = true;
                const now = Date.now();
                if (now - (pet.lastPetTime || 0) < 1000) return; // 1s Cooldown
                pet.lastPetTime = now;

                // Happy reaction!
                pet.state = Math.random() > 0.5 ? "dance" : "jump";
                pet.frame = 0;

                // Burst of Heart + Golden Coin Floating text
                particlesRef.current.push({
                    x: pet.x,
                    y: petPy - 50,
                    type: "heart",
                    life: 1.2,
                    scale: 1.3,
                    decay: 0.015,
                });
                particlesRef.current.push({
                    x: pet.x,
                    y: petPy - 65,
                    type: "coin",
                    text: "+10 🪙",
                    life: 1.2,
                    vy: 1.1,
                    decay: 0.014,
                });

                // Trigger coin reward
                propsRef.current.onAddCoins(10);
            }
        });

        // 2. If clicked on the empty floor, drop a yummy cookie treat!
        if (!pettedPet && clickY >= floorY - 40 && clickY <= canvas.offsetHeight - 20) {
            treatRef.current = {
                x: clickX,
                y: clickY,
                life: 1.0,
            };
            // Sparkle feedback at click
            particlesRef.current.push({
                x: clickX,
                y: clickY,
                type: "crumb",
                size: 3,
                life: 0.8,
            });
        }
    };

    return (
        <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full z-10 block"
            onClick={handleClick}
            onMouseMove={handlePointerMove}
            onMouseLeave={handlePointerLeave}
        />
    );
});
