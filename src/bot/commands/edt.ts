import { SlashCommandBuilder } from '@discordjs/builders';
import { AttachmentBuilder } from 'discord.js';
import { fetch } from '../../worker/worker'
import { filterBetween, timeStats } from '../../utils/slots'
import * as canvas from '../../utils/canvas'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('edt')
		.setDescription('Replies with an EDT'),
	async execute(interaction) {
		const events = await fetch({
            days: 365,
            startDate: new Date(2023, 8, 1)
        });

        const thisMondayDate = new Date().setDate(new Date().getDate() - new Date().getDay() + 1);
        const endWeekDate = new Date(thisMondayDate).setDate(new Date(thisMondayDate).getDate() + 7);
        const thisWeekSlots = filterBetween(events, new Date(thisMondayDate), new Date(endWeekDate));

        const x = canvas.generateTabletime(new Date(thisMondayDate), 5, thisWeekSlots);
        timeStats(thisWeekSlots);

        // Embed the buffer in a new attachment
        const attachment = new AttachmentBuilder(x, { name: "edt.png" });
        // Send the attachment in the message channel with a content
        await interaction.reply({ files: [attachment] });
	},
};