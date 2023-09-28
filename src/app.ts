import 'dotenv/config'
import discordClient from './bot/client'

async function main() {
    discordClient.init(process.env.DISCORD_TOKEN)
}
main()