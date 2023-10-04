import * as fs from 'fs';
import * as path from 'path';
import { Client, GatewayIntentBits, Collection, REST, Routes, Events } from "discord.js";
import { Command, SlashCommand } from "../types/discord"

console.log("Bot is starting...");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });


const commands = [];

client.slashCommands = new Collection<string, SlashCommand>()
client.commands = new Collection<string, Command>()

const foldersPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(foldersPath);
for (const file of commandFiles) {
    const filePath = path.join(foldersPath, file);
    if (filePath.endsWith('.map')) continue;
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// and deploy your commands!
async function init(token) {
	// Construct and prepare an instance of the REST module
	const rest = new REST().setToken(token);

	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands("1150083394894561442", "996455856243752970"),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}

	client.login(token);
}

client.on("ready", () => {
    console.log("Bot is ready!");
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.on("error", (error) => {
    console.error(error);
});

export default {
	init,
	client
}