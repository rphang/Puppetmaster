import { Client } from "discord.js";

console.log("Bot is starting...");

const client = new Client({
    intents: []
});

client.on("ready", () => {
    console.log("Bot is ready!");
});

client.on("message", (message) => {
    if (message.content === "ping") {
        message.reply("pong");
    }
});

client.on("error", (error) => {
    console.error(error);
});

console.log(client);

export default client;