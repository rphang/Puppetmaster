import 'dotenv/config'
import discordClient from './bot/client'
import { forceUpdate } from './models/Slots'

async function main() {
    discordClient.init(process.env.DISCORD_TOKEN);
    await forceUpdate();
}
main()