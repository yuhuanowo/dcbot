const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder().setName("embed_ping").setDescription("show ping with embed"),
    async execute(client, interaction) {
        const embed = new EmbedBuilder().setTitle("🏓 Pong!").setTimestamp();
        interaction.reply({ embeds: [embed] });
    },
};
/*
.setURL('放URL')
.setAuthor({ name: '', iconURL: '放URL', url: '放URL' })
.setDescription('')
.setThumbnail('放URL')
.addFields({ name: '', value: '', inline: true or false })
.setImage('放URL')
.setTimestamp()
.setFooter({ text: '', iconURL: '放URL' });
*/
