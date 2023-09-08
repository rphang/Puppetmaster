interface Slot {
    uid: string;
    title: string;
    groups: string[];
    locations: string[];
    teachers: string[];
    startDate: Date;
    endDate: Date;
    override?: boolean;
}

export {
    Slot
}