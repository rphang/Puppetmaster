import { PrismaClient } from '@prisma/client'
import { Slot } from '../types/slot'

const prisma = new PrismaClient()

export async function fetchSlots() {
    const slots = await prisma.slots.findMany();
    return slots;
}

export async function fetchOveriddenSlots() {
    const slots = await prisma.slots.findMany({
        where: {
            override: true
        }
    });
    return slots;
}

export async function updateSlots(events: Slot[]) {
    const slots = [];
    for (const event of events) {
        const { uid, ...rest } = event;
        await prisma.slots.upsert({
            where: {
                uid,
                override: false
            },
            update: {
                title: rest.title,
                start: rest.startDate,
                end: rest.endDate,
            },
            create: {
                uid,
                title: rest.title,
                start: rest.startDate,
                end: rest.endDate,
                override: false
            }
        });
        // Teachers & Locations
    }
    return slots;
}