import Canvas from 'canvas';
import { Slot } from '../types/slot';

const TABLETIME_SIZE = {
    width: 2400,
    height: 1200,
    TOP: 80,
    LEFT_RIGHT_MARGIN: 5,
    START_HOUR: 8,
    END_HOUR: 20
}

function drawOutlineRect(ctx, x, y, width, height, color, lineWidth) {
    ctx.fillStyle = color;
    // Top
    ctx.fillRect(x, y, width, lineWidth);
    // Left
    ctx.fillRect(x, y, lineWidth, height);
    // Right
    ctx.fillRect(x + width - lineWidth, y, lineWidth, height);
    // Bottom
    ctx.fillRect(x, y + height - lineWidth, width, lineWidth);
}

function drawFullRect(ctx, x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawSlot(ctx, x, y, width, height, slot: Slot) {
    const textOffset = y + 1/3 * height;
    // Transparent background
    ctx.fillStyle = 'rgba(0, 50, 50, 0.2)';
    ctx.fillRect(x, y, width, height);
    // Title
    ctx.fillStyle = '#000000';
    ctx.fillText(slot.title, x + 5, textOffset);
    // Room
    ctx.fillText(slot.locations.join(', '), x + 5, textOffset + 25);
    // Hours
    ctx.fillText(slot.startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + ' - ' + slot.endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), x + 5, textOffset + 50);
}

function generateTabletimeCanvas(
        startDate: Date,
        daysCount: number) {
    const output = {
        canvas: null,
        startDate,
        days: []
    }
    const canvas = Canvas.createCanvas(TABLETIME_SIZE.width, TABLETIME_SIZE.height);
    const ctx = canvas.getContext('2d');
    output.canvas = canvas;
    
    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, TABLETIME_SIZE.width, TABLETIME_SIZE.height);

    // inline border
    drawOutlineRect(ctx, 5, 5, TABLETIME_SIZE.width - 10, TABLETIME_SIZE.height - 10, '#000000', 1);

    // Title
    ctx.fillStyle = '#000000';
    ctx.font = '30px Arial';
    const title = startDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    ctx.fillText(
        'Semaine du ' + title,
        TABLETIME_SIZE.width / 2 - 300,
        35
    );

    // Draw days
    const dayWidth = (TABLETIME_SIZE.width - 10) / daysCount;
    
    for (let i = 0; i < daysCount; i++) {
        const x = TABLETIME_SIZE.LEFT_RIGHT_MARGIN + dayWidth * i;
        const y = TABLETIME_SIZE.TOP;
        const width = dayWidth;
        const height = TABLETIME_SIZE.height - TABLETIME_SIZE.TOP - 35;
        // inline border
        drawOutlineRect(ctx, x, y + 30, width, height, '#000000', 1);
        ctx.fillStyle = '#000000';
        ctx.font = '30px Arial';
        const day = startDate.toLocaleDateString('fr-FR', { weekday: 'long' });
        // title
        ctx.fillText(
            day,
            x + width / 2 - 35,
            y
        );

        // hours
        ctx.font = '20px Arial';

        const hoursCount = TABLETIME_SIZE.END_HOUR - TABLETIME_SIZE.START_HOUR;
        const hourHeight = height / hoursCount;

        for (let i = 0; i < hoursCount; i++) {
            const hour = i + TABLETIME_SIZE.START_HOUR;
            const hourY = y + 30 + hourHeight * i;
            // Box
            drawFullRect(ctx, x, hourY, width, hourHeight, '#CCCCCC');
            // outline
            drawOutlineRect(ctx, x, hourY, width, hourHeight, '#999999', 1);
            // text
            ctx.fillText(
                hour.toString() + 'h',
                x + width / 2 - 10,
                hourY+10
            );
        }
        output.days.push({
            startX: x,
            startY: y,
            hourWidth: width,
            hourHeight,
        });
        startDate.setDate(startDate.getDate() + 1);
    }

    return output;
}

function generateTabletime(startDate: Date, daysCount: number, Slots: Slot[]) {
    const tabletime = generateTabletimeCanvas(startDate, daysCount);
    const ctx = tabletime.canvas.getContext('2d');
    let day = Slots[0].startDate.getDay() - 1;
    for (let i = 0; i < Slots.length; i++) {
        const slot = Slots[i];
        const timestampsStart = slot.startDate.getHours() + slot.startDate.getMinutes() / 60;
        const timestampsEnd = slot.endDate.getHours() + slot.endDate.getMinutes() / 60;
        day = slot.startDate.getDay() - 1; // TODO: Ehhh Funky patch, it only works when startDate is a monday

        const dayData = tabletime.days[day];
        const x = dayData.startX;
        const y = dayData.startY + 30 + dayData.hourHeight * (timestampsStart - TABLETIME_SIZE.START_HOUR);

        const width = dayData.hourWidth;
        const height = dayData.hourHeight * (timestampsEnd - timestampsStart);

        drawSlot(ctx, x, y, width, height, slot);
    }

    return tabletime.canvas.toBuffer();
}

export {
    generateTabletime
}