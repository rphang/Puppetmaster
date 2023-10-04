import { PrismaClient } from '@prisma/client'
import { Slot } from '../types/slot'
import worker from '../worker'

const prisma = new PrismaClient()

export async function fetchSlots() : Promise<Slot[]> {
    const slots = await prisma.slots.findMany({
        include: {
            teacher: true,
            locations: true,
            group: true
        }
    });
    const output = slots.map((slot) => {
        const { uid, title, start, end } = slot;
        return {
            uid,
            title,
            groups: slot.group.map((group) => group.uid),
            locations: slot.locations.map((location) => location.uid),
            teachers: slot.teacher.map((teacher) => teacher.name),
            startDate: start,
            endDate: end
        }
    });
    return output;
}

export async function fetchOveriddenSlots() {
    const slots = await prisma.slots.findMany({
        where: {
            override: true
        }
    });
    return slots;
}

export async function forceUpdate() {
    // Clean Slots
    console.log("Cleaning slots...");
    await prisma.slots.deleteMany({});
    console.log("Refreshing slots...");
    const slots = await worker.fetch();
    console.log("Fetched " + slots.length + " slots");
    await updateSlots(slots);
    console.log("Done");
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
        await prisma.slots.update({
            where: {
                uid,
                override: false
            },
            data: {
                teacher: {
                    connectOrCreate: rest.teachers.map((teacher) => {
                        return {
                            where: {
                                name: teacher
                            },
                            create: {
                                name: teacher
                            }
                        }
                    })
                },
                locations: {
                    connectOrCreate: rest.locations.map((location) => {
                        return {
                            where: {
                                uid: location
                            },
                            create: {
                                uid: location
                            }
                        }
                    })
                },
                group: {
                    connectOrCreate: rest.groups.map((group) => {
                        return {
                            where: {
                                uid: group
                            },
                            create: {
                                uid: group
                            }
                        }
                    })
                }
            }
        });

    }
    return slots;
}

export default {
    fetchSlots,
    fetchOveriddenSlots,
    updateSlots
}