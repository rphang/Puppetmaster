import { SlashCommandBuilder } from '@discordjs/builders';
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import { Slot } from '../../types/slot'

import { fetchSlots } from '../../models/Slots';

import { filterBetween, timeStats } from '../../utils/slots'
import * as canvas from '../../utils/canvas'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('edt')
        .setDescription('Replies with an EDT'),
    async execute(interaction) {
        let defaultWeek = 0;
        let mainMessage = null;

        let thisWeekSlots = await getWeekSlots(defaultWeek);
        const startWeekDate = new Date().setDate(new Date().getDate() - new Date().getDay() + 1);
        let attachementEdt = await canvas.generateTabletime(new Date(startWeekDate), 5, thisWeekSlots);

        // Embed the buffer in a new attachment
        const attachment = new AttachmentBuilder(attachementEdt, { name: "edt.png" });

        // Button
        const buttonRow = generateButtonRow(defaultWeek);

        // Send the attachment in the message channel with a content with buttons for stats
        mainMessage = await interaction.reply({ files: [attachment], components: [buttonRow] });

        // Wait for button click
        const filter = i => i.user.id === interaction.user.id;
        const collector = mainMessage.createMessageComponentCollector({ filter, time: 120000 });

        collector.on('collect', async i => {
            let startWeekDate = new Date().setDate(new Date().getDate() - new Date().getDay() + 1);
            switch (i.customId) {
                case 'backward':
                    defaultWeek--;
                    // Change main message
                    startWeekDate = new Date(startWeekDate).setDate(new Date(startWeekDate).getDate() + defaultWeek * 7);
                    thisWeekSlots = await getWeekSlots(defaultWeek);
                    attachementEdt = await canvas.generateTabletime(new Date(startWeekDate), 5, thisWeekSlots);
                    await i.update({ files: [new AttachmentBuilder(attachementEdt, { name: "edt.png" })], components: [generateButtonRow(defaultWeek)] });
                    break;
                case 'current':
                    defaultWeek = 0;
                    // Change main message
                    startWeekDate = new Date(startWeekDate).setDate(new Date(startWeekDate).getDate() + defaultWeek * 7);
                    thisWeekSlots = await getWeekSlots(defaultWeek);
                    attachementEdt = await canvas.generateTabletime(new Date(startWeekDate), 5, thisWeekSlots);
                    await i.update({ files: [new AttachmentBuilder(attachementEdt, { name: "edt.png" })], components: [generateButtonRow(defaultWeek)] });
                    break;
                case 'forward':
                    defaultWeek++;
                    // Change main message
                    startWeekDate = new Date(startWeekDate).setDate(new Date(startWeekDate).getDate() + defaultWeek * 7);
                    thisWeekSlots = await getWeekSlots(defaultWeek);
                    attachementEdt = await canvas.generateTabletime(new Date(startWeekDate), 5, thisWeekSlots);
                    await i.update({ files: [new AttachmentBuilder(attachementEdt, { name: "edt.png" })], components: [generateButtonRow(defaultWeek)] });
                    break;
                case 'stats':
                    await i.reply({ embeds: [getStatsEmbed(thisWeekSlots)] });
                    // If admin, show class Ids
                    if (i.member.permissions.has('8')) {
                        const classIds = thisWeekSlots.map((slot) => { slot.uid, slot.title });
                        await i.followUp({ content: "Voici les ids des cours de la semaine", files: [new AttachmentBuilder(Buffer.from(classIds.join("\n")), { name: "ids.txt" })] });
                    }
                    break;
            }
        });
    },
};

function getStatsEmbed(slots) {
    const stats = timeStats(slots);
    const statsEmbed = {
        color: 0x0099ff,
        title: 'Statistiques de la semaine',
        description: 'Statistiques sur les cours de la semaine',
        fields: [
            {
                name: 'Nombre de cours',
                value: stats.class,
                inline: true,
            },
            {
                name: 'Nombre de TTPP',
                value: stats.self,
                inline: true,
            },
            {
                name: 'Temps total',
                value: minutesToHours(stats.totalMinutes),
                inline: true,
            },
            {
                name: 'Temps classe',
                value: minutesToHours(stats.classMinutes),
                inline: true,
            },
            {
                name: 'Temps TTPP',
                value: minutesToHours(stats.selfMinutes),
                inline: true,
            },
        ],
        timestamp: new Date(),
        footer: {
            text: '© Université Claude Bernard Lyon 1',
        },
    };
    return statsEmbed;
}

function generateButtonRow(week: number = 0) {
    const stats = new ButtonBuilder()
        .setCustomId('stats')
        .setLabel('Stats')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('📊');
    const Backward = new ButtonBuilder()
        .setCustomId('backward')
        .setLabel('Back')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('⏪');

    const Current = new ButtonBuilder()
        .setCustomId('current')
        .setLabel('Current')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('📅')
     
    if (week == 0) {
        Current.setDisabled(true);
    }

    const Forward = new ButtonBuilder()
        .setCustomId('forward')
        .setLabel('Next')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('⏩');

    // Row
    const row = new ActionRowBuilder()
        .addComponents(stats, Backward, Current, Forward);

    return row;
}



async function getWeekSlots(week: number = 0): Promise<Slot[]> {
    const events = await fetchSlots();
    let mondayDate = new Date().setDate(new Date().getDate() - new Date().getDay() + 1);
    let endWeekDate = new Date(mondayDate).setDate(new Date(mondayDate).getDate() + 7);
    // Forward & Backward week
    mondayDate = new Date(mondayDate).setDate(new Date(mondayDate).getDate() + week * 7);
    endWeekDate = new Date(endWeekDate).setDate(new Date(endWeekDate).getDate() + week * 7);

    mondayDate = new Date(mondayDate).setHours(0, 0, 0, 0);
    endWeekDate = new Date(endWeekDate).setHours(23, 59, 59, 999);
    const thisWeekSlots = filterBetween(events, new Date(mondayDate), new Date(endWeekDate));
    return thisWeekSlots;
}

function minutesToHours(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const minutesLeft = minutes % 60;
    let minutesString = minutesLeft.toString();
    if (minutesLeft < 10) {
        minutesString = "0" + minutesString;
    }
    return hours + "h" + minutesString;
}