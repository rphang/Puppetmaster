import 'dotenv/config'
import discordClient from './bot/client'

import { fetch } from './job/worker'
import { parse } from './utils/slots'

async function main() {
    discordClient.login(process.env.DISCORD_TOKEN);

    const events = await fetch({
        days: 365,
        startDate: new Date(2023, 8, 1)
    });
    console.log(events)
    const { teachers, groups, locations } = parse(events);
    console.log(teachers, groups, locations);

}
main()