// commands/fake.js - Version pour CHAÎNE
import sender from './sender.js'

// Liste des emojis
const emojis = [
    '🔥', '❤️', '😂', '😍', '🥰', '😘', '💀', '😭', '🤣', '😱',
    '👍', '👎', '🙏', '🤝', '💪', '🎉', '✨', '⭐', '🌟', '💯',
    '🤔', '😎', '🥺', '😡', '😢', '🥶', '🥵', '👻', '🎃', '🤖',
    '👾', '💎', '👑', '🏆', '⚡', '💜', '💙', '💚', '💛', '🧡',
    '🤍', '🖤', '💘', '💝', '💖', '🐉', '🌙', '☀️', '🌈', '❄️'
]

let lastEmoji = null

function getRandomEmoji() {
    let emoji
    do {
        emoji = emojis[Math.floor(Math.random() * emojis.length)]
    } while (emoji === lastEmoji && emojis.length > 1)
    lastEmoji = emoji
    return emoji
}

async function sendReaction(client, chatId, messageKey, emoji) {
    try {
        await client.sendMessage(chatId, {
            react: {
                text: emoji,
                key: messageKey
            }
        })
        return true
    } catch (e) {
        return false
    }
}

export default async function fakeCommand(client, message) {
    const remoteJid = message.key.remoteJid
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || ''
    const args = messageBody.split(' ').slice(1)
    const count = parseInt(args[0]) || 600

    try {
        const quotedMessageKey = message.message?.extendedTextMessage?.contextInfo?.stanzaId
        const quotedParticipant = message.message?.extendedTextMessage?.contextInfo?.participant
        
        if (!quotedMessageKey) {
            const help = `╔══════════════════════════════════════════════════════════════════╗
║                      💥 𝐅𝐀𝐊𝐄 𝐑𝐄𝐀𝐂𝐓 💥                         ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  📌 *Utilisation :*                                             ║
║  Réponds à un message de CHAÎNE avec .fake                      ║
║                                                                  ║
║  💡 *Exemples :*                                                ║
║  .fake 600   → 600 réactions sur le post                        ║
║  .fake 100   → 100 réactions                                    ║
║  .fake       → 600 réactions par défaut                         ║
║                                                                  ║
║  🎭 *Emojis :* ${emojis.length} emojis différents                     ║
║                                                                  ║
║  ✅ *Fonctionne sur les CHAÎNES WhatsApp !*                     ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║  🌹WENS DM  |  BY WENS 🌹                             ║
╚══════════════════════════════════════════════════════════════════╝`
            return sender(message, client, help)
        }

        let finalCount = count
        if (finalCount > 1000) {
            finalCount = 1000
            await client.sendMessage(remoteJid, {
                text: "⚠️ Nombre limité à 1000 réactions maximum !"
            }, { quoted: message })
        }
        
        if (finalCount < 1) {
            return sender(message, client, "❌ Le nombre doit être supérieur à 0 !")
        }

        const targetMessageKey = {
            remoteJid: remoteJid,
            id: quotedMessageKey,
            fromMe: false,
            participant: quotedParticipant || remoteJid
        }

        // Confirmation
        await client.sendMessage(remoteJid, {
            text: `💥 *FAKE REACT LANCÉ SUR LA CHAÎNE !*\n\n📊 ${finalCount} réactions en cours...\n🎭 ${emojis.length} emojis différents`
        }, { quoted: message })

        let successCount = 0
        let failCount = 0
        
        for (let i = 0; i < finalCount; i++) {
            const emoji = getRandomEmoji()
            const success = await sendReaction(client, remoteJid, targetMessageKey, emoji)
            
            if (success) {
                successCount++
            } else {
                failCount++
            }
            
            // Délai pour éviter le rate limit
            await new Promise(resolve => setTimeout(resolve, 150))
            
            if ((i + 1) % 50 === 0) {
                console.log(`📊 ${i + 1}/${finalCount} réactions envoyées`)
            }
        }

        const report = `╔══════════════════════════════════════════════════════════════════╗
║                   💥 𝐑𝐀𝐏𝐏𝐎𝐑𝐓 𝐂𝐇𝐀𝐈̂𝐍𝐄 💥                      ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  ✅ *Réactions envoyées :* ${successCount}
║  ❌ *Échecs :* ${failCount}
║  🎭 *Emojis différents :* ${emojis.length}
║  🎯 *Taux de réussite :* ${Math.floor((successCount/finalCount)*100)}%
║                                                                  ║
║  💡 Les réactions sont visibles sous le post de la chaîne !     ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║  🌹 WENS DM  |  BY WENS 🌹                            ║
╚══════════════════════════════════════════════════════════════════╝`

        await client.sendMessage(remoteJid, { text: report }, { quoted: message })

    } catch (error) {
        console.error('Fake react error:', error)
        sender(message, client, '❌ Erreur lors de l\'envoi des réactions')
    }
}