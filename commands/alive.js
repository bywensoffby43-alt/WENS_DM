const settings = require("../settings");

async function aliveCommand(client, chatId, message) {
    try {
        const message1 = `*🤖 WENS DM est Actif !*\n\n` +
                       `*Version:* ${settings.version}\n` +
                       `*Statut:* En ligne ✅\n` +
                       `*Mode:* Public\n\n` +
                       `*🌟 Fonctionnalités:*\n` +
                       `• Gestion de groupe\n` +
                       `• Protection anti-lien\n` +
                       `• Commandes amusantes\n` +
                       `• Et bien plus encore !\n\n` +
                       `Tapez *.menu* pour la liste complète des commandes`;

        await client.sendMessage(chatId, {
            text: message1,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: 'https://whatsapp.com/channel/0029VbCwqFvIN9ioFnTrNA1r',
                    newsletterName: 'WENS DM',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    } catch (error) {
        console.error('Erreur commande alive:', error);
        await client.sendMessage(chatId, { text: '🤖 WENS DM est en ligne !' }, { quoted: message });
    }
}

module.exports = aliveCommand;
