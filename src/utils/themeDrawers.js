import {
    drawRug,
    drawWindow,
    drawRoundTable,
    drawCuteChair,
    drawBookshelf,
    drawPainting,
    drawGrass,
    drawTree,
    drawShelf,
    drawCurtains
} from "./canvasHelpers";

export const drawKitchen = (ctx, W, floorY, scale) => {
    // Window above counter
    drawWindow(ctx, W * 0.25 + 20 * scale, floorY - 250 * scale, 80 * scale, 80 * scale);

    // Fridge (Rounded & Cute) - Left
    const fridgeX = W * 0.05;
    const fridgeY = floorY - 160 * scale;
    ctx.fillStyle = "#fecdd3"; // Pink Fridge
    ctx.beginPath();
    ctx.roundRect(fridgeX, fridgeY, 90 * scale, 160 * scale, 15 * scale);
    ctx.fill();
    // Fridge Details
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.beginPath();
    ctx.roundRect(fridgeX + 5 * scale, fridgeY + 5 * scale, 80 * scale, 150 * scale, 10 * scale);
    ctx.fill();
    ctx.fillStyle = "#fda4af";
    ctx.fillRect(fridgeX, fridgeY + 50 * scale, 90 * scale, 2 * scale);
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.roundRect(fridgeX + 10 * scale, fridgeY + 60 * scale, 5 * scale, 30 * scale, 2 * scale);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(fridgeX + 10 * scale, fridgeY + 20 * scale, 5 * scale, 20 * scale, 2 * scale);
    ctx.fill();
    // Magnets
    ctx.fillStyle = "#fcd34d";
    ctx.beginPath();
    ctx.arc(fridgeX + 70 * scale, fridgeY + 30 * scale, 5 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Kitchen Counter - Middle Left
    const counterX = W * 0.25;
    const counterY = floorY - 80 * scale;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.roundRect(counterX, counterY, 120 * scale, 80 * scale, 5 * scale);
    ctx.fill();
    // Cabinet Doors
    ctx.fillStyle = "#fecdd3";
    ctx.fillRect(counterX + 10 * scale, counterY + 10 * scale, 45 * scale, 60 * scale);
    ctx.fillRect(counterX + 65 * scale, counterY + 10 * scale, 45 * scale, 60 * scale);
    // Knobs
    ctx.fillStyle = "#9f1239";
    ctx.beginPath();
    ctx.arc(counterX + 45 * scale, counterY + 40 * scale, 3 * scale, 0, Math.PI * 2);
    ctx.arc(counterX + 75 * scale, counterY + 40 * scale, 3 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Wall Clock
    const clockX = W * 0.5;
    const clockY = floorY - 200 * scale;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(clockX, clockY, 20 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#f43f5e";
    ctx.lineWidth = 2 * scale;
    ctx.stroke();
    ctx.strokeStyle = "#333";
    ctx.beginPath();
    ctx.moveTo(clockX, clockY);
    ctx.lineTo(clockX, clockY - 10 * scale);
    ctx.moveTo(clockX, clockY);
    ctx.lineTo(clockX + 8 * scale, clockY);
    ctx.stroke();

    // Dining Area - Right
    // Rug
    drawRug(ctx, W * 0.75, floorY + 20 * scale, 140 * scale, 60 * scale, "checker");

    drawRoundTable(ctx, W * 0.75, floorY - 20 * scale, scale);
    drawCuteChair(ctx, W * 0.65, floorY - 30 * scale, scale, "#fbbf24");
    drawCuteChair(ctx, W * 0.85, floorY - 30 * scale, scale, "#fbbf24");
};

export const drawBoho = (ctx, W, floorY, scale) => {
    // Macrame Wall Hanging
    const macX = W * 0.5;
    const macY = floorY - 250 * scale;
    ctx.fillStyle = "#f5ebe0";
    ctx.beginPath();
    ctx.moveTo(macX, macY);
    ctx.lineTo(macX + 60 * scale, macY);
    ctx.lineTo(macX + 30 * scale, macY + 80 * scale);
    ctx.fill();
    // Stick
    ctx.strokeStyle = "#d4a373";
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.moveTo(macX - 10 * scale, macY);
    ctx.lineTo(macX + 70 * scale, macY);
    ctx.stroke();

    // Woven Lamps (Hanging)
    const drawWovenLamp = (lx, ly) => {
        ctx.save();
        ctx.translate(lx, ly);
        // Cord
        ctx.strokeStyle = "#444";
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(0, -100 * scale);
        ctx.lineTo(0, 0);
        ctx.stroke();
        // Shade
        ctx.fillStyle = "#d4a373"; // Rattan color
        ctx.beginPath();
        ctx.ellipse(0, 20 * scale, 35 * scale, 25 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        // Texture (Cross-hatch)
        ctx.strokeStyle = "rgba(0,0,0,0.1)";
        ctx.lineWidth = 1 * scale;
        for (let i = -20; i < 20; i += 5) {
            ctx.beginPath();
            ctx.moveTo(i * scale, 0);
            ctx.lineTo(i * scale, 40 * scale);
            ctx.stroke();
        }
        ctx.restore();
    };
    drawWovenLamp(W * 0.8, 50 * scale);
    drawWovenLamp(W * 0.9, 80 * scale);

    // Boho Bed (Low profile, cozy) - Left
    const bedX = W * 0.15;
    const bedY = floorY - 50 * scale;
    // Rug under bed
    drawRug(ctx, bedX + 80 * scale, floorY + 20 * scale, 200 * scale, 100 * scale, "boho");

    // Frame (Wood)
    ctx.fillStyle = "#e6ccb2";
    ctx.fillRect(bedX, bedY + 30 * scale, 160 * scale, 20 * scale);
    // Mattress (White)
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.roundRect(bedX, bedY, 160 * scale, 40 * scale, 5 * scale);
    ctx.fill();
    // Grey Throw Blanket
    ctx.fillStyle = "#a8a29e";
    ctx.beginPath();
    ctx.roundRect(bedX + 80 * scale, bedY, 80 * scale, 50 * scale, 5 * scale);
    ctx.fill();
    // Pillows (Pink/Clay)
    ctx.fillStyle = "#e7c6ff"; // Soft pinkish
    ctx.beginPath();
    ctx.ellipse(bedX + 30 * scale, bedY + 10 * scale, 25 * scale, 15 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d4a373"; // Clay
    ctx.beginPath();
    ctx.ellipse(bedX + 60 * scale, bedY + 15 * scale, 20 * scale, 12 * scale, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Nightstand (Mid-century)
    const nsX = bedX - 50 * scale;
    if (nsX > 0) {
        const nsY = floorY - 60 * scale;
        // Legs
        ctx.strokeStyle = "#b08968";
        ctx.lineWidth = 4 * scale;
        ctx.beginPath();
        ctx.moveTo(nsX + 5 * scale, nsY + 40 * scale);
        ctx.lineTo(nsX, nsY + 60 * scale);
        ctx.moveTo(nsX + 35 * scale, nsY + 40 * scale);
        ctx.lineTo(nsX + 40 * scale, nsY + 60 * scale);
        ctx.stroke();
        // Box
        ctx.fillStyle = "#ddb892";
        ctx.fillRect(nsX, nsY, 40 * scale, 40 * scale);
        // Drawer
        ctx.fillStyle = "rgba(0,0,0,0.1)";
        ctx.fillRect(nsX + 5 * scale, nsY + 5 * scale, 30 * scale, 15 * scale);
        // Vase on top
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.ellipse(nsX + 20 * scale, nsY - 10 * scale, 8 * scale, 10 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        // Dried Wheat/Grass
        ctx.strokeStyle = "#d4a373";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(nsX + 20 * scale, nsY - 10 * scale);
        ctx.lineTo(nsX + 10 * scale, nsY - 40 * scale);
        ctx.moveTo(nsX + 20 * scale, nsY - 10 * scale);
        ctx.lineTo(nsX + 30 * scale, nsY - 45 * scale);
        ctx.stroke();
    }

    // Large Plant (Monstera in Basket) - Right
    const plantX = W * 0.85;
    const plantY = floorY - 40 * scale;
    // Basket
    ctx.fillStyle = "#d4a373";
    ctx.beginPath();
    ctx.roundRect(plantX, plantY, 50 * scale, 40 * scale, 5 * scale);
    ctx.fill();
    // Weave lines
    ctx.strokeStyle = "#a98467";
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(plantX, plantY + 10 * scale);
    ctx.lineTo(plantX + 50 * scale, plantY + 10 * scale);
    ctx.moveTo(plantX, plantY + 30 * scale);
    ctx.lineTo(plantX + 50 * scale, plantY + 30 * scale);
    ctx.stroke();
    // Leaves
    ctx.fillStyle = "#4ade80"; // Lighter green
    const drawLeaf = (lx, ly, rot) => {
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, 15 * scale, 25 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };
    drawLeaf(plantX + 10 * scale, plantY - 20 * scale, -0.5);
    drawLeaf(plantX + 40 * scale, plantY - 30 * scale, 0.5);
    drawLeaf(plantX + 25 * scale, plantY - 50 * scale, 0);
};

export const drawOutdoor = (ctx, W, floorY, scale, activeTheme) => {
    // Picnic Blanket
    const blanketX = W * 0.5;
    const blanketY = floorY + 20 * scale;
    ctx.fillStyle = activeTheme === "theme_garden" ? "#fecaca" : "#bbf7d0"; // Red or Green check
    ctx.beginPath();
    ctx.moveTo(blanketX - 100 * scale, blanketY);
    ctx.lineTo(blanketX + 100 * scale, blanketY);
    ctx.lineTo(blanketX + 120 * scale, blanketY + 80 * scale);
    ctx.lineTo(blanketX - 120 * scale, blanketY + 80 * scale);
    ctx.fill();

    // Checker pattern
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    for (let i = 0; i < 6; i++) {
        ctx.fillRect(blanketX - 100 * scale + i * 35 * scale, blanketY, 20 * scale, 80 * scale);
    }

    // Picnic Basket
    const basketX = blanketX - 60 * scale;
    const basketY = blanketY + 20 * scale;
    ctx.fillStyle = "#d97706";
    ctx.beginPath();
    ctx.roundRect(basketX, basketY, 40 * scale, 30 * scale, 5 * scale);
    ctx.fill();
    // Handle
    ctx.strokeStyle = "#b45309";
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.arc(basketX + 20 * scale, basketY, 15 * scale, Math.PI, 0);
    ctx.stroke();

    // Food (Sandwich/Apple)
    ctx.fillStyle = "#ef4444"; // Apple
    ctx.beginPath();
    ctx.arc(blanketX + 20 * scale, blanketY + 30 * scale, 5 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Bench (Park only)
    if (activeTheme === "theme_park") {
        const benchX = W * 0.2;
        const benchY = floorY - 40 * scale;
        // Legs
        ctx.strokeStyle = "#374151";
        ctx.lineWidth = 4 * scale;
        ctx.beginPath();
        ctx.moveTo(benchX + 10 * scale, benchY + 20 * scale);
        ctx.lineTo(benchX + 10 * scale, benchY + 50 * scale);
        ctx.moveTo(benchX + 90 * scale, benchY + 20 * scale);
        ctx.lineTo(benchX + 90 * scale, benchY + 50 * scale);
        ctx.stroke();
        // Seat
        ctx.fillStyle = "#9ca3af";
        ctx.fillRect(benchX, benchY + 20 * scale, 100 * scale, 10 * scale);
        // Back
        ctx.fillStyle = "#9ca3af";
        ctx.fillRect(benchX, benchY - 10 * scale, 100 * scale, 20 * scale);

        // Fountain (Park)
        const fountX = W * 0.8;
        const fountY = floorY - 20 * scale;
        ctx.fillStyle = "#cbd5e1";
        ctx.beginPath();
        ctx.ellipse(fountX, fountY + 20 * scale, 60 * scale, 20 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#94a3b8";
        ctx.fillRect(fountX - 10 * scale, fountY - 40 * scale, 20 * scale, 60 * scale);
        ctx.beginPath();
        ctx.arc(fountX, fountY - 40 * scale, 30 * scale, 0, Math.PI, false);
        ctx.fill();
        // Water
        ctx.fillStyle = "#60a5fa";
        ctx.beginPath();
        ctx.ellipse(fountX, fountY + 20 * scale, 50 * scale, 15 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
    } else if (activeTheme === "theme_garden") {
        // Pond (Garden)
        const pondX = W * 0.8;
        const pondY = floorY + 30 * scale;
        ctx.fillStyle = "#60a5fa";
        ctx.beginPath();
        ctx.ellipse(pondX, pondY, 70 * scale, 30 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#93c5fd";
        ctx.lineWidth = 3 * scale;
        ctx.stroke();
        // Lily pad
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.arc(pondX - 20 * scale, pondY - 10 * scale, 10 * scale, 0, Math.PI * 2);
        ctx.fill();
    }
};

export const drawGenericRoom = (ctx, W, floorY, scale, activeTheme, bookData) => {
    // Bookshelf (Only for generic themes: Day, Cozy, Night)
    const genericThemes = ["theme_day", "theme_cozy", "theme_night"];
    if (genericThemes.includes(activeTheme)) {
        drawBookshelf(ctx, W * 0.1, floorY - 150 * scale, scale, bookData);
        // Painting
        drawPainting(ctx, W * 0.5, floorY - 250 * scale, 80 * scale, 60 * scale, "abstract");

        // Add a plant for generic themes too
        const plantX = W * 0.85;
        const plantY = floorY - 40 * scale;
        // Pot
        ctx.fillStyle = "#d97706";
        ctx.beginPath();
        ctx.roundRect(plantX, plantY, 40 * scale, 40 * scale, 5 * scale);
        ctx.fill();
        // Leaves
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.arc(plantX + 20 * scale, plantY - 20 * scale, 30 * scale, 0, Math.PI * 2);
        ctx.fill();
    }

    // Curtains on Window (Generic only)
    if (genericThemes.includes(activeTheme)) {
        const winW = 220 * scale;
        const winX = W / 2 - winW / 2;
        const winY = floorY - 340 * scale;
        drawCurtains(ctx, winX - 10 * scale, winY - 10 * scale, winW + 20 * scale, 180 * scale, scale);
    }
};

export const drawBedroom = (ctx, W, floorY, scale) => {
    // Wardrobe - Left
    const wardrobeX = W * 0.05;
    const wardrobeY = floorY - 180 * scale;
    ctx.fillStyle = "#a16207"; // Wood
    ctx.fillRect(wardrobeX, wardrobeY, 100 * scale, 180 * scale);
    // Doors
    ctx.fillStyle = "#b45309";
    ctx.fillRect(wardrobeX + 5 * scale, wardrobeY + 5 * scale, 42 * scale, 170 * scale);
    ctx.fillRect(wardrobeX + 53 * scale, wardrobeY + 5 * scale, 42 * scale, 170 * scale);
    // Handles
    ctx.fillStyle = "#fcd34d";
    ctx.beginPath();
    ctx.arc(wardrobeX + 40 * scale, wardrobeY + 90 * scale, 3 * scale, 0, Math.PI * 2);
    ctx.arc(wardrobeX + 60 * scale, wardrobeY + 90 * scale, 3 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Bed - Center Left
    const bedX = W * 0.3;
    const bedY = floorY - 60 * scale;
    // Rug
    drawRug(ctx, bedX + 80 * scale, floorY + 20 * scale, 180 * scale, 100 * scale, "cloud");

    // Bed Frame
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.roundRect(bedX, bedY, 160 * scale, 60 * scale, 10 * scale);
    ctx.fill();
    // Blanket
    ctx.fillStyle = "#93c5fd"; // Blue
    ctx.beginPath();
    ctx.roundRect(bedX, bedY + 20 * scale, 160 * scale, 40 * scale, 10 * scale);
    ctx.fill();
    // Pillow
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(bedX + 30 * scale, bedY + 10 * scale, 25 * scale, 15 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Poster
    const posterX = bedX + 50 * scale;
    const posterY = floorY - 250 * scale;
    drawPainting(ctx, posterX, posterY, 60 * scale, 80 * scale, "flower");

    // Desk - Right
    const deskX = W * 0.75;
    const deskY = floorY - 80 * scale;
    ctx.fillStyle = "#a16207";
    ctx.fillRect(deskX, deskY, 120 * scale, 80 * scale);
    // Chair
    drawCuteChair(ctx, deskX - 40 * scale, deskY + 40 * scale, scale, "#fbbf24");
};

export const drawCafe = (ctx, W, floorY, scale) => {
    // Menu Board
    const menuX = W * 0.2;
    const menuY = floorY - 250 * scale;
    ctx.fillStyle = "#333";
    ctx.fillRect(menuX, menuY, 100 * scale, 80 * scale);
    ctx.fillStyle = "#fff";
    ctx.font = `${10 * scale}px sans-serif`;
    ctx.fillText("MENU", menuX + 35 * scale, menuY + 20 * scale);
    ctx.fillRect(menuX + 10 * scale, menuY + 30 * scale, 80 * scale, 2 * scale);
    ctx.fillRect(menuX + 10 * scale, menuY + 45 * scale, 60 * scale, 2 * scale);
    ctx.fillRect(menuX + 10 * scale, menuY + 60 * scale, 70 * scale, 2 * scale);

    // Shelf with Mugs
    drawShelf(ctx, W * 0.5, floorY - 200 * scale, 100 * scale, scale);
    // Mugs (Open Sign)
    ctx.fillStyle = "#ef4444"; // Red
    ctx.fillRect(W * 0.5 + 10 * scale, floorY - 215 * scale, 10 * scale, 15 * scale);
    ctx.fillStyle = "#3b82f6"; // Blue
    ctx.fillRect(W * 0.5 + 30 * scale, floorY - 215 * scale, 10 * scale, 15 * scale);
    ctx.fillStyle = "#22c55e"; // Green
    ctx.fillRect(W * 0.5 + 50 * scale, floorY - 215 * scale, 10 * scale, 15 * scale);

    // Counter - Left
    const counterX = W * 0.1;
    const counterY = floorY - 90 * scale;
    ctx.fillStyle = "#78350f"; // Dark Wood
    ctx.beginPath();
    ctx.roundRect(counterX, counterY, 150 * scale, 90 * scale, 5 * scale);
    ctx.fill();
    // Counter Top
    ctx.fillStyle = "#fff";
    ctx.fillRect(counterX - 10 * scale, counterY, 170 * scale, 10 * scale);

    // Tables - Right
    drawRoundTable(ctx, W * 0.7, floorY - 20 * scale, scale);
    drawCuteChair(ctx, W * 0.6, floorY - 30 * scale, scale, "#fbbf24");
    drawCuteChair(ctx, W * 0.8, floorY - 30 * scale, scale, "#fbbf24");
};
