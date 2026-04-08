const fs = require('fs');
const path = require('path');

const ANTIMEDIA_FILE = path.join(__dirname, '../data/antimedia.json');

function loadAntimedia() {
    try {
        if (!fs.existsSync(ANTIMEDIA_FILE)) {
            fs.writeFileSync(ANTIMEDIA_FILE, JSON.stringify({}));
        }
        return JSON.parse(fs.readFileSync(ANTIMEDIA_FILE, 'utf8'));
    } catch {
        return {};
    }
}

function saveAntimedia(data) {
    fs.writeFileSync(ANTIMEDIA_FILE, JSON.stringify(data, null, 2));
}

async function antimediaCommand(sock, chatId, message, args, senderId, isSenderAdmin) {
    if (!chatId.endsWith('@g.us')) {
        return client.sendMessage(chatId, { text: '❌ Cette commande ne fonctionne que dans les groupes.' }, { quoted: message });
    }

    const data = loadAntimedia();

    if (!args || args === '') {
        const status = data[chatId] ? '✅ Activé' : '❌ Désactivé';
        return client.sendMessage(chatId, {
            text: `*🚫 ANTI-MÉDIA*\n\nStatut: ${status}\n\n*.antimedia on* - Activer\n*.antimedia off* - Désactiver\n\n_Bloque les images, vidéos, documents et GIFs envoyés par les membres non-admins._`
        }, { quoted: message });
    }

    if (!isSenderAdmin && !message.key.fromMe) {
        return client.sendMessage(chatId, { text: '❌ Seuls les admins peuvent utiliser cette commande.' }, { quoted: message });
    }

    if (args === 'on') {
        data[chatId] = true;
        saveAntimedia(data);
        return client.sendMessage(chatId, { text: '✅ *Anti-média activé !*\nLes médias envoyés par les non-admins seront supprimés.' }, { quoted: message });
    }

    if (args === 'off') {
        delete data[chatId];
        saveAntimedia(data);
        return client.sendMessage(chatId, { text: '❌ *Anti-média désactivé.*' }, { quoted: message });
    }

    return client.sendMessage(chatId, { text: '❌ Usage: .antimedia on/off' }, { quoted: message });
}

async function handleAntimedia(client, chatId, senderId, message, isSenderAdmin) {
    try {
        const data = loadAntimedia();
        if (!data[chatId]) return;
        if (isSenderAdmin) return;

        const msgType = Object.keys(message.message || {})[0];
        const mediaTypes = ['imageMessage', 'videoMessage', 'documentMessage', 'audioMessage', 'stickerMessage', 'gifMessage'];

        if (mediaTypes.includes(msgType)) {
            try {
                await client.sendMessage(chatId, { delete: message.key });
                const senderNumber = senderId.split('@')[0];
                await clint.sendMessage(chatId, {
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
}

module.exports = { antimediaCommand, handleAntimedia };
