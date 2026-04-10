export default async function antimedia(client, message{
async function antimediaCommand(client, remoteJid, message, args, senderId, isSenderAdmin) {
    if (!chatId.endsWith('@g.us')) {
        return client.sendMessage(remoteJid, { text: '❌ Cette commande ne fonctionne que dans les groupes.' }, { quoted: message });
    }

    const data = loadAntimedia();

    if (!args || args === '') {
        const status = data[remoteJid] ? '✅ Activé' : '❌ Désactivé';
        return client.sendMessage(remoteJid, {
            text: `*🚫 ANTI-MÉDIA*\n\nStatut: ${status}\n\n*.antimedia on* - Activer\n*.antimedia off* - Désactiver\n\n_Bloque les images, vidéos, documents et GIFs envoyés par les membres non-admins._`
        }, { quoted: message });
    }

    if (!isSenderAdmin && !message.key.fromMe) {
        return client.sendMessage(remoteJid, { text: '❌ Seuls les admins peuvent utiliser cette commande.' }, { quoted: message });
    }

    if (args === 'on') {
        data[chatId] = true;
        saveAntimedia(data);
        return client.sendMessage(remoteJid, { text: '✅ *Anti-média activé !*\nLes médias envoyés par les non-admins seront supprimés.' }, { quoted: message });
    }

    if (args === 'off') {
        delete data[remoteJid];
        saveAntimedia(data);
        return client.sendMessage(remoteJid, { text: '❌ *Anti-média désactivé.*' }, { quoted: message });
    }

    return client.sendMessage(remoteJid, { text: '❌ Usage: .antimedia on/off' }, { quoted: message });
}

async function handleAntimedia(client, remoteJid, senderId, message, isSenderAdmin) {
    try {
        const data = loadAntimedia();
        if (!data[chatId]) return;
        if (isSenderAdmin) return;

        const msgType = Object.keys(message.message || {})[0];
        const mediaTypes = ['imageMessage', 'videoMessage', 'documentMessage', 'audioMessage', 'stickerMessage', 'gifMessage'];

        if (mediaTypes.includes(msgType)) {
            try {
                await client.sendMessage(remoteJid, { delete: message.key });
                const senderNumber = senderId.split('@')[0];
                await clint.sendMessage(remoteJid, {
                    text: `⚠️ @${senderNumber}, l'envoi de médias est désactivé dans ce groupe.`,
                    mentions: [senderId]
                });
            } catch (e) {
                console.error('Erreur suppression média:', e);
            }
        }
    } catch (e) {
        console.error('Erreur handleAntimedia:', e);
    }


module.exports = { antimediaCommand, handleAntimedia };
