import { drawRoundRect } from "./canvasHelpers";

export const drawPet = (ctx, pet, floorY, scale, isSupporter) => {
    // Dynamic Animation Offsets
    let bounce = 0;
    let rotate = 0;
    let squashX = 1;
    let squashY = 1;

    const animFrame = pet.frame || 0;

    if (pet.state === 'walk') {
        bounce = Math.abs(Math.sin(animFrame)) * 6 * scale;
        rotate = Math.sin(animFrame) * 0.06; // Cute waddle
    } else if (pet.state === 'jump') {
        const jumpProgress = Math.sin(animFrame);
        bounce = jumpProgress * 28 * scale;
        // Squash & stretch physics
        squashY = 1 + jumpProgress * 0.2;
        squashX = 1 - jumpProgress * 0.15;
    } else if (pet.state === 'dance') {
        bounce = Math.abs(Math.sin(animFrame * 1.5)) * 8 * scale;
        rotate = Math.sin(animFrame * 2) * 0.15; // Joyful wiggle
        squashX = 1 + Math.sin(animFrame * 3) * 0.05;
        squashY = 1 - Math.sin(animFrame * 3) * 0.05;
    } else if (pet.state === 'eat') {
        bounce = Math.sin(animFrame * 3) * 2 * scale;
        const munch = Math.sin(animFrame * 3) * 0.06;
        squashX = 1 + munch;
        squashY = 1 - munch;
    }

    // Breathing rhythm
    const isResting = pet.state === 'idle' || pet.state === 'sleep' || pet.state === 'sit';
    const breathe = isResting ? Math.sin(Date.now() / 350) * 1.8 * scale : 0;
    const sleepSquish = pet.state === 'sleep' ? 14 * scale : 0;
    const sitSquish = pet.state === 'sit' ? 6 * scale : 0;

    // Base position with depth
    const py = floorY - 26 * scale - bounce + sleepSquish + sitSquish + (pet.y || 0) * scale;

    ctx.save();
    ctx.translate(pet.x, py);
    ctx.rotate(rotate);

    // Global scale with squash & stretch
    ctx.scale(scale * squashX, scale * squashY);

    // --- EMOTE BUBBLE ---
    if (pet.emote) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, pet.emote.life));
        ctx.translate(0, -90 - (pet.emote.yOffset || 0));

        // Glassmorphic pill bubble
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.shadowColor = "rgba(0, 0, 0, 0.08)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bubble tail
        ctx.beginPath();
        ctx.moveTo(0, 13);
        ctx.lineTo(-4, 20);
        ctx.lineTo(4, 15);
        ctx.fill();

        // Bubble border
        ctx.strokeStyle = "#e7e5e4";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 14, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.shadowColor = "transparent";
        ctx.font = "14px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(pet.emote.type === 'heart' ? "❤️" : "✨", 0, 1);
        ctx.restore();
    }

    // --- SUPPORTER CROWN ---
    if (isSupporter && pet.state !== "sleep") {
        ctx.save();
        const crownY = -76 - breathe;
        ctx.translate(0, crownY);
        // Golden crown base
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.moveTo(-12, 0);
        ctx.lineTo(-14, -12);
        ctx.lineTo(-6, -6);
        ctx.lineTo(0, -16);
        ctx.lineTo(6, -6);
        ctx.lineTo(14, -12);
        ctx.lineTo(12, 0);
        ctx.closePath();
        ctx.fill();

        // Crown jewel
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(0, -5, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // --- NAME TAG (ElevenLabs Minimal Badge) ---
    if (pet.state !== "sleep") {
        const nameY = -66 - breathe;
        ctx.save();
        ctx.font = "600 11px 'Inter', sans-serif";
        const petName = pet.data?.name || "Buddy";
        const textWidth = ctx.measureText(petName).width;
        const padX = 10;
        const badgeW = textWidth + padX * 2;
        const badgeH = 20;

        // Shadow & pill plate
        ctx.shadowColor = "rgba(0, 0, 0, 0.06)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        drawRoundRect(ctx, -badgeW / 2, nameY - 14, badgeW, badgeH, 10, "#ffffff");

        // Subtle 1px hairline
        ctx.strokeStyle = "#e7e5e4";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(-badgeW / 2, nameY - 14, badgeW, badgeH, 10);
        ctx.stroke();

        ctx.shadowColor = "transparent";
        ctx.fillStyle = "#292524";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(petName, 0, nameY - 4);
        ctx.restore();
    }

    // Face direction flip
    if (pet.dir === -1) {
        ctx.scale(-1, 1);
    }

    // --- SOFT CONTACT SHADOW ---
    ctx.save();
    ctx.fillStyle = "rgba(12, 10, 9, 0.1)";
    ctx.beginPath();
    const shadowW = (24 + (sleepSquish ? 6 : 0) - bounce * 0.2);
    const shadowH = Math.max(3, 8 - bounce * 0.15);
    ctx.ellipse(0, 26 + (sleepSquish ? 2 : 0), shadowW, shadowH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Pet Color Tokens
    const baseColor = pet.data?.color || "#fcd34d";
    const secondaryColor = pet.data?.secondary || "#ffffff";
    const blushColor = pet.data?.blush || "#fda4af";
    const petId = pet.id || "";

    const bodyW = 54 + breathe;
    const bodyH = 52 - sleepSquish;
    const bodyX = -bodyW / 2;
    const bodyY = -34 + sleepSquish + breathe;

    // --- TAIL RENDERING (Behind body) ---
    ctx.save();
    const tailAnim = pet.state === 'dance' ? Math.sin(animFrame * 3) : Math.sin(animFrame * 1.5);
    if (petId.includes("cat")) {
        // Long sleek cat tail
        ctx.strokeStyle = baseColor;
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-22, bodyY + bodyH - 12);
        ctx.quadraticCurveTo(-38 + tailAnim * 8, bodyY + bodyH - 26, -34 + tailAnim * 12, bodyY + bodyH - 42);
        ctx.stroke();
        // Tip
        ctx.fillStyle = secondaryColor;
        ctx.beginPath();
        ctx.arc(-34 + tailAnim * 12, bodyY + bodyH - 42, 3.5, 0, Math.PI * 2);
        ctx.fill();
    } else if (petId.includes("dog")) {
        // Curled Shiba Tail
        ctx.strokeStyle = baseColor;
        ctx.lineWidth = 8;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-22, bodyY + bodyH - 14);
        ctx.quadraticCurveTo(-38 + tailAnim * 6, bodyY + bodyH - 30, -28 + tailAnim * 10, bodyY + bodyH - 40);
        ctx.stroke();
        // Fluffy white tip
        ctx.fillStyle = secondaryColor;
        ctx.beginPath();
        ctx.arc(-28 + tailAnim * 10, bodyY + bodyH - 40, 4.5, 0, Math.PI * 2);
        ctx.fill();
    } else if (petId.includes("bunny")) {
        // Fluffy round bunny puff tail
        ctx.fillStyle = secondaryColor;
        ctx.beginPath();
        ctx.arc(-26, bodyY + bodyH - 14, 8, 0, Math.PI * 2);
        ctx.fill();
    } else if (petId.includes("pig")) {
        // Curly pig tail
        ctx.strokeStyle = secondaryColor || "#f472b6";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-24, bodyY + bodyH - 14);
        ctx.quadraticCurveTo(-32 + tailAnim * 4, bodyY + bodyH - 22, -28, bodyY + bodyH - 26);
        ctx.quadraticCurveTo(-22, bodyY + bodyH - 30, -30 + tailAnim * 4, bodyY + bodyH - 34);
        ctx.stroke();
    } else if (petId.includes("duck")) {
        // Duck tail feathers
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.moveTo(-24, bodyY + bodyH - 16);
        ctx.lineTo(-32, bodyY + bodyH - 24);
        ctx.lineTo(-24, bodyY + bodyH - 26);
        ctx.fill();
    }
    ctx.restore();

    // --- EARS RENDERING ---
    ctx.save();
    if (petId.includes("cat")) {
        // Left Ear
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.moveTo(-20, bodyY + 12);
        ctx.lineTo(-26, bodyY - 14);
        ctx.lineTo(-6, bodyY + 4);
        ctx.closePath();
        ctx.fill();
        // Left Inner Ear (Pink)
        ctx.fillStyle = blushColor;
        ctx.beginPath();
        ctx.moveTo(-18, bodyY + 10);
        ctx.lineTo(-23, bodyY - 8);
        ctx.lineTo(-8, bodyY + 4);
        ctx.closePath();
        ctx.fill();

        // Right Ear
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.moveTo(6, bodyY + 4);
        ctx.lineTo(26, bodyY - 14);
        ctx.lineTo(20, bodyY + 12);
        ctx.closePath();
        ctx.fill();
        // Right Inner Ear
        ctx.fillStyle = blushColor;
        ctx.beginPath();
        ctx.moveTo(8, bodyY + 4);
        ctx.lineTo(23, bodyY - 8);
        ctx.lineTo(18, bodyY + 10);
        ctx.closePath();
        ctx.fill();
    } else if (petId.includes("dog")) {
        // Shiba Pointed Perky Ears!
        // Left Ear
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.moveTo(-20, bodyY + 14);
        ctx.lineTo(-25, bodyY - 16);
        ctx.lineTo(-5, bodyY + 4);
        ctx.closePath();
        ctx.fill();
        // Left Inner Ear (Cream/Tan)
        ctx.fillStyle = secondaryColor || "#ffffff";
        ctx.beginPath();
        ctx.moveTo(-18, bodyY + 12);
        ctx.lineTo(-22, bodyY - 10);
        ctx.lineTo(-7, bodyY + 4);
        ctx.closePath();
        ctx.fill();

        // Right Ear
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.moveTo(5, bodyY + 4);
        ctx.lineTo(25, bodyY - 16);
        ctx.lineTo(20, bodyY + 14);
        ctx.closePath();
        ctx.fill();
        // Right Inner Ear
        ctx.fillStyle = secondaryColor || "#ffffff";
        ctx.beginPath();
        ctx.moveTo(7, bodyY + 4);
        ctx.lineTo(22, bodyY - 10);
        ctx.lineTo(18, bodyY + 12);
        ctx.closePath();
        ctx.fill();
    } else if (petId.includes("bunny")) {
        // Tall Bouncy Bunny Ears with Physics
        const earSway = Math.sin(animFrame * 2) * 2;
        // Left Ear
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.ellipse(-14 + earSway, bodyY - 22, 7, 24, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = blushColor;
        ctx.beginPath();
        ctx.ellipse(-14 + earSway, bodyY - 22, 4, 18, -0.15, 0, Math.PI * 2);
        ctx.fill();

        // Right Ear
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.ellipse(14 - earSway, bodyY - 22, 7, 24, 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = blushColor;
        ctx.beginPath();
        ctx.ellipse(14 - earSway, bodyY - 22, 4, 18, 0.15, 0, Math.PI * 2);
        ctx.fill();
    } else if (petId.includes("pig")) {
        // Floppy Cute Piglet Ears
        // Left Ear
        ctx.fillStyle = secondaryColor || "#f472b6";
        ctx.beginPath();
        ctx.moveTo(-18, bodyY + 8);
        ctx.lineTo(-28, bodyY - 6);
        ctx.lineTo(-24, bodyY + 16);
        ctx.closePath();
        ctx.fill();
        // Right Ear
        ctx.beginPath();
        ctx.moveTo(18, bodyY + 8);
        ctx.lineTo(28, bodyY - 6);
        ctx.lineTo(24, bodyY + 16);
        ctx.closePath();
        ctx.fill();
    } else if (petId.includes("duck")) {
        // Cute Little Tuft Hair on Top
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.moveTo(-4, bodyY + 2);
        ctx.quadraticCurveTo(0, bodyY - 12, 6, bodyY - 8);
        ctx.quadraticCurveTo(2, bodyY - 4, 2, bodyY + 2);
        ctx.fill();
    }
    ctx.restore();

    // --- MAIN BODY (Plushie Shape with Soft Gradient) ---
    ctx.save();
    const bodyGrad = ctx.createLinearGradient(0, bodyY, 0, bodyY + bodyH);
    bodyGrad.addColorStop(0, baseColor);
    bodyGrad.addColorStop(1, baseColor); // Solid clean color per ElevenLabs tone
    ctx.fillStyle = bodyGrad;

    ctx.beginPath();
    ctx.roundRect(bodyX, bodyY, bodyW, bodyH, [24, 24, 22, 22]);
    ctx.fill();

    // Subtle 3D top shine highlight
    const shineGrad = ctx.createLinearGradient(0, bodyY, 0, bodyY + 20);
    shineGrad.addColorStop(0, "rgba(255, 255, 255, 0.28)");
    shineGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = shineGrad;
    ctx.beginPath();
    ctx.roundRect(bodyX + 4, bodyY + 2, bodyW - 8, 18, 16);
    ctx.fill();

    // --- BELLY / CHEST PATCH ---
    if (petId.includes("cat") || petId.includes("dog") || petId.includes("bunny")) {
        ctx.fillStyle = secondaryColor || "#ffffff";
        ctx.beginPath();
        ctx.ellipse(0, bodyY + bodyH - 15, 16, 14, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    // --- WINGS / PAWS ---
    ctx.save();
    const pawStep = pet.state === 'walk' ? Math.sin(animFrame * 2) * 4 : 0;
    if (petId.includes("duck")) {
        // Duck Wings
        ctx.fillStyle = "#fef08a";
        const wingFlap = (pet.state === 'walk' || pet.state === 'dance') ? Math.sin(animFrame * 3) * 6 : 0;
        // Left Wing
        ctx.beginPath();
        ctx.ellipse(-22, bodyY + 24 + wingFlap, 6, 12, -0.2, 0, Math.PI * 2);
        ctx.fill();
        // Right Wing
        ctx.beginPath();
        ctx.ellipse(22, bodyY + 24 - wingFlap, 6, 12, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Orange Webbed Feet
        if (pet.state !== 'sleep') {
            ctx.fillStyle = "#f97316";
            ctx.beginPath();
            ctx.ellipse(-10, bodyY + bodyH - 2 + pawStep, 7, 4, 0, 0, Math.PI * 2);
            ctx.ellipse(10, bodyY + bodyH - 2 - pawStep, 7, 4, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    } else {
        // Front Paws (Cat, Dog, Bunny, Pig)
        if (pet.state !== 'sleep') {
            ctx.fillStyle = (petId.includes("pig") ? "#f472b6" : (secondaryColor || baseColor));
            ctx.beginPath();
            // Left Paw
            ctx.ellipse(-12, bodyY + bodyH - 3 + pawStep, 6, 4, 0, 0, Math.PI * 2);
            // Right Paw
            ctx.ellipse(12, bodyY + bodyH - 3 - pawStep, 6, 4, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.restore();

    // --- FACE & EXPRESSIONS ---
    const eyeY = bodyY + 22;
    const isBlinking = pet.blinkTimer !== undefined && pet.blinkTimer <= 0;
    const isHappy = pet.state === 'dance' || pet.state === 'jump';

    ctx.save();

    // 1. CHEEKS (Soft Pink Blush)
    ctx.fillStyle = blushColor;
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.arc(-18, eyeY + 7, 5, 0, Math.PI * 2);
    ctx.arc(18, eyeY + 7, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // 2. EYES
    if (pet.state === "sleep") {
        // Cozy sleeping eyes (∪ ∪)
        ctx.strokeStyle = "#3f3f46";
        ctx.lineWidth = 2.2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(-11, eyeY, 5, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(11, eyeY, 5, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();
    } else if (isHappy) {
        // Cheerful happy eyes (^ ^)
        ctx.strokeStyle = "#18181b";
        ctx.lineWidth = 2.4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(-11, eyeY + 2, 5.5, 1.15 * Math.PI, 1.85 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(11, eyeY + 2, 5.5, 1.15 * Math.PI, 1.85 * Math.PI);
        ctx.stroke();
    } else if (isBlinking) {
        // Blink transition
        ctx.strokeStyle = "#18181b";
        ctx.lineWidth = 2.2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-15, eyeY);
        ctx.lineTo(-7, eyeY);
        ctx.moveTo(7, eyeY);
        ctx.lineTo(15, eyeY);
        ctx.stroke();
    } else {
        // Glossy anime sparkle eyes
        ctx.fillStyle = "#18181b";
        ctx.beginPath();
        ctx.ellipse(-11, eyeY, 4.5, 5.5, 0, 0, Math.PI * 2);
        ctx.ellipse(11, eyeY, 4.5, 5.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Main Catchlight Shine (Top-Right)
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(-10, eyeY - 2, 2, 0, Math.PI * 2);
        ctx.arc(12, eyeY - 2, 2, 0, Math.PI * 2);
        ctx.fill();

        // Secondary Micro Catchlight (Bottom-Left)
        ctx.beginPath();
        ctx.arc(-12.5, eyeY + 2, 1, 0, Math.PI * 2);
        ctx.arc(9.5, eyeY + 2, 1, 0, Math.PI * 2);
        ctx.fill();
    }

    // 3. SNOUT / MOUTH / BEAK
    if (petId.includes("cat")) {
        // Pink tiny nose
        ctx.fillStyle = blushColor;
        ctx.beginPath();
        ctx.ellipse(0, eyeY + 4, 2.5, 1.8, 0, 0, Math.PI * 2);
        ctx.fill();
        // Cat Smile :3
        ctx.strokeStyle = "#52525b";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(-2.5, eyeY + 6.5, 2.5, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.arc(2.5, eyeY + 6.5, 2.5, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        // Whiskers
        ctx.strokeStyle = "rgba(60, 60, 60, 0.35)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Left Whiskers
        ctx.moveTo(-16, eyeY + 4); ctx.lineTo(-27, eyeY + 2);
        ctx.moveTo(-16, eyeY + 7); ctx.lineTo(-26, eyeY + 8);
        // Right Whiskers
        ctx.moveTo(16, eyeY + 4); ctx.lineTo(27, eyeY + 2);
        ctx.moveTo(16, eyeY + 7); ctx.lineTo(26, eyeY + 8);
        ctx.stroke();
    } else if (petId.includes("dog")) {
        // Shiba Dark Nose & Smile
        ctx.fillStyle = "#27272a";
        ctx.beginPath();
        ctx.ellipse(0, eyeY + 4, 3.2, 2.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#3f3f46";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(0, eyeY + 6);
        ctx.lineTo(0, eyeY + 8);
        ctx.arc(-2.5, eyeY + 8, 2.5, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.moveTo(0, eyeY + 8);
        ctx.arc(2.5, eyeY + 8, 2.5, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
    } else if (petId.includes("duck")) {
        // 3D Duck Beak
        ctx.fillStyle = "#f97316";
        ctx.beginPath();
        ctx.ellipse(0, eyeY + 5, 8, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Beak Top Highlight
        ctx.fillStyle = "#fdba74";
        ctx.beginPath();
        ctx.ellipse(0, eyeY + 3.8, 6, 2, 0, 0, Math.PI * 2);
        ctx.fill();
    } else if (petId.includes("pig")) {
        // Pig Snout with Nostrils
        ctx.fillStyle = "#f472b6";
        ctx.beginPath();
        ctx.roundRect(-9, eyeY + 2, 18, 12, 6);
        ctx.fill();
        // Nostrils
        ctx.fillStyle = "#be185d";
        ctx.beginPath();
        ctx.ellipse(-3.5, eyeY + 8, 1.8, 2.5, 0, 0, Math.PI * 2);
        ctx.ellipse(3.5, eyeY + 8, 1.8, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
    } else if (petId.includes("bunny")) {
        // Bunny tiny nose dot & smile
        ctx.fillStyle = blushColor;
        ctx.beginPath();
        ctx.ellipse(0, eyeY + 4, 2.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#52525b";
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(-2, eyeY + 6.5, 2, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.arc(2, eyeY + 6.5, 2, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
    }

    ctx.restore();
    ctx.restore(); // Restore global translate/scale
};
