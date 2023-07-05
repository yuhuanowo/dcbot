const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, Client } = require('discord.js');
const fs = require('node:fs');

//[建立/回覆 button] -> [建立 collector] -> [輸贏啦] -> [讀檔] -> [解析] -> [做事]  -> [回應] -> [存檔]

module.exports = {
    data: new SlashCommandBuilder().setName('janken').setDescription('Earn money with janken!'),
    async execute(client, interaction) {

        //建立 embed 和剪刀石頭布的三個 button
        const buttonEmbed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle(`來猜拳！`);

        const scissorButton = new ButtonBuilder()
            .setCustomId('scissors')
            .setLabel('✌️')
            .setStyle(ButtonStyle.Primary);

        const rockButton = new ButtonBuilder()
            .setCustomId('rock')
            .setLabel('✊')
            .setStyle(ButtonStyle.Primary);

        const paperButton = new ButtonBuilder()
            .setCustomId('paper')
            .setLabel('🖐️')
            .setStyle(ButtonStyle.Primary);

        //將三個 button 都放入 row 中並回覆 embed 和 row
        const buttonRow = new ActionRowBuilder()
            .addComponents(
                scissorButton, rockButton, paperButton
            );

        //回覆
        interaction.reply({ embeds: [buttonEmbed], components: [buttonRow] });

        //建立 collector
        const collector = interaction.channel.createMessageComponentCollector({ time: 15000 });

        //等待 collector 蒐集到玩家案的按鈕
        collector.on('collect', async collected => {

            //電腦隨機出拳 (0:剪刀 1:石頭 2:布)
            const botChoice = Math.floor(Math.random()*3)

            //利用玩家所按按鈕的 customId 來判斷玩家的選擇
            let playerChoice;
            if (collected.customId === 'scissors') {
                playerChoice = 0;
            } else if (collected.customId === 'rock') {
                playerChoice = 1;
            } else if (collected.customId === 'paper') {
                playerChoice = 2;
            }

            //判斷玩家勝利，電腦勝利或平手 (0:平手 1:電腦 2:玩家)
            let winner = 0;
            if (playerChoice == botChoice){
                winner = 0;          
            } 
            else if (playerChoice == 0 && botChoice == 1){//剪刀vs石頭
                winner = 1;
            }
            else if (playerChoice == 0 && botChoice == 2){
                //剪刀 布
                winner = 2;
            }
            else if (playerChoice == 1 && botChoice == 0){
                winner = 2;
            }
            else if (playerChoice == 1 && botChoice == 2){
                winner =1;
            }
            else if (playerChoice == 2 && botChoice == 0){
                winner = 1;
            }
            else if (playerChoice == 2 && botChoice == 1){
                winner = 2;
            }

            //從結果計算獲得/失去的 money
            let earnings;
            if (winner == 1){
                earnings = -1;
            }
            else if (winner == 2){
                earnings = 1;
            }

            //讀取 players.json 並 parse 成 players
            const data = fs.readFileSync("players.json");
            let players = JSON.parse(data);

            //在所有資料中尋找呼叫此指令玩家的資料
            let found = false;
            for (let j = 0; j < players.length; j++) {

                //如果有就修改該玩家的 money 並回覆結果
                if (players[j].id == interaction.user.id) {
                    found = true;
                    players[j].money += earnings;
                    const resultEmbed = new EmbedBuilder()
                        .setColor('#5865F2')
                        .setTitle('剪刀石頭布！')
                        .setDescription(`結果：${earnings}元\n你現在有 ${players[j].money} 元!`);
                    collected.update({ embeds: [resultEmbed], components: [] });
                    break;
                }
            }

            //如果沒有資料就創建一個新的並回覆結果
            if (found == false) {
                players.push({ id: interaction.user.id, money: 500 });
                const resultEmbed = new EmbedBuilder()
                    .setColor('#5865F2')
                    .setTitle('剪刀石頭布！')
                    .setDescription(`結果：${earnings}元\n你現在有 ${500 + earnings} 元!`);
                collected.update({ embeds: [resultEmbed], components: [] });
            }

            //stringify players 並存回 players.json
            const json = JSON.stringify(players);
            fs.writeFileSync("players.json",json);

            //關閉 collector
            collector.stop();
        });
    }
};