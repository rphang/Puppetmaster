import 'dotenv/config'
// import discordClient from './bot/client'

import { fetch } from './job/worker'
import { parse, filterBetween, timeStats } from './utils/slots'

function weekStats(events, weekCount) {
    const startDate = new Date(2023, 8, 25-7*3);
    const endDate = new Date(2023, 8, 30-7*3);


    let thisWeekSlots;
    let stats;
    let i = 0;
    for (;i<weekCount;i++) {
        console.log(`Semaine ` + i.toString() + `:` + startDate.toDateString() + ` - ` + endDate.toDateString());
        // Get Slots
        thisWeekSlots = filterBetween(events, startDate, endDate);
        // Stats
        stats = timeStats(thisWeekSlots);
        console.log(stats);
        // Forward 7 days
        startDate.setDate(startDate.getDate() + 7);
        endDate.setDate(endDate.getDate() + 7);
    }
}

async function main() {
    // discordClient.login(process.env.DISCORD_TOKEN);

    const events = await fetch({
        days: 365,
        startDate: new Date(2023, 8, 1)
    });
    const { teachers } = parse(events);
    console.log(teachers)

    weekStats(events, 40)

    console.log(timeStats(events));

}
main()