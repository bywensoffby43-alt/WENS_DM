const axios = require('axios');

async function imagineCommand(client, chatId, message) {
    try {
        const prompt = message.message?.conversation?.trim() ||
                      message.message?.extendedTextMessage?.text?.trim() || '';

        const imagePrompt = prompt.replace(/^\.(imagine|flux|dalle)\s*/i, '').trim();

        if (!imagePrompt) {
            await client.sendMessage(chatId, {
                text: '❌ Veuillez fournir une description pour générer l\'image.\nExemple: .imagine un beau coucher de soleil sur la mer'
            }, { quoted: message });
            return;
        }

        await client.sendMessage(chatId, {
            text: '🎨 Génération de votre image en cours... Veuillez patienter.'
        }, { quoted: message });

        let imageBuffer = null;

        const apis = [
            `https://api.limewire.com/api/image/generation`,
            `https://pollinations.ai/p/${encodeURIComponent(imagePrompt)}?width=1024&height=1024&nologo=true`,
        ];

        try {
            const response = await axios.get(
                `https://pollinations.ai/p/${encodeURIComponent(imagePrompt)}?width=1024&height=1024&nologo=true`,
                { responseType: 'arraybuffer', timeout: 30000 }
            );
            imageBuffer = Buffer.from(response.data);
        } catch (e1) {
            try {
                const response2 = await axios.get(
                    `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}`,
                    { responseType: 'arraybuffer', timeout: 30000 }
                );
                imageBuffer = Buffer.from(response2.data);
            } catch (e2) {
                throw new Error('Toutes les API de génération ont échoué');
            }
        }

        await client.sendMessage(chatId, {
            image: imageBuffer,
            caption: `🎨 *Image générée pour:* "${imagePrompt}"\n\n_Par WENS DM_`
        }, { quoted: message });

    } catch (error) {
        console.error('Erreur commande imagine:', error);
        await client.sendMessage(chatId, {
            text: '❌ Échec de la génération de l\'image. Veuillez réessayer avec une autre description.'
        }, { quoted: message });
    }
}

module.exports = imagineCommand;
