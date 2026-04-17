import axios from 'axios'
import stylizedChar from '../utils/fancy.js'

export default async function lyrics(client, message) {
    const remoteJid = message.key.remoteJid
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || ''
    const query = messageBody.split(' ').slice(1).join(' ')

    if (!query) {
        const help = `╭─⌈ 🎵 LYRICS ULTRA ⌋
│
│ *Utilisation:* .lyrics <titre ou artiste>
│
│ *Exemples:*
│ ▸ .lyrics daylight
│ ▸ .lyrics imagine dragons believer
│ ▸ .lyrics shape of you
│ ▸ .lyrics flowers miley cyrus
│
│ *Fonctionne avec TOUTES les chansons !*
│
╰─⌊ 🌹 WENS DM 🌹⌉`
        return client.sendMessage(remoteJid, { text: stylizedChar(help) }, { quoted: message })
    }

    await client.sendMessage(remoteJid, {
        react: { text: "🔍", key: message.key }
    })

    try {
        let lyricsText = null
        let songTitle = query
        let artistName = ''
        let source = ''

        // ========== SOURCE 1: AZLyrics (via recherche) ==========
        try {
            const searchRes = await axios.get(`https://search.azlyrics.com/search.php?q=${encodeURIComponent(query)}`, {
                timeout: 10000,
                headers: { 'User-Agent': 'Mozilla/5.0' }
            })
            
            const match = searchRes.data.match(/href="(https:\/\/www\.azlyrics\.com\/lyrics\/[^"]+)"/)
            if (match) {
                const lyricsPage = await axios.get(match[1], { headers: { 'User-Agent': 'Mozilla/5.0' } })
                const lyricsMatch = lyricsPage.data.match(/<!-- Usage of azlyrics\.com.*?-->([\s\S]*?)<!--/i)
                if (lyricsMatch) {
                    lyricsText = lyricsMatch[1]
                        .replace(/<br>/g, '\n')
                        .replace(/<[^>]*>/g, '')
                        .replace(/&quot;/g, '"')
                        .replace(/&#39;/g, "'")
                        .trim()
                    source = 'AZLyrics'
                    
                    // Extraire titre et artiste
                    const titleMatch = lyricsPage.data.match(/<title>"([^"]+)" lyrics<\/title>/i)
                    if (titleMatch) {
                        const parts = titleMatch[1].split(' lyrics')
                        songTitle = parts[0]
                    }
                }
            }
        } catch (e) {
            console.log('AZLyrics failed')
        }

        // ========== SOURCE 2: Genius (recherche approfondie) ==========
        if (!lyricsText) {
            try {
                const searchRes = await axios.get(`https://genius.com/api/search/multi?q=${encodeURIComponent(query)}`, {
                    timeout: 10000,
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                })
                
                const hits = searchRes.data?.response?.sections?.find(s => s.type === 'song')?.hits
                if (hits && hits.length > 0) {
                    const songPath = hits[0].result.path
                    const lyricsPage = await axios.get(`https://genius.com${songPath}`, {
                        headers: { 'User-Agent': 'Mozilla/5.0' }
                    })
                    
                    const lyricsMatch = lyricsPage.data.match(/<div[^>]*data-lyrics-container="true"[^>]*>([\s\S]*?)<\/div>/gi)
                    if (lyricsMatch) {
                        lyricsText = lyricsMatch.map(block => 
                            block.replace(/<[^>]*>/g, '').trim()
                        ).join('\n\n')
                        songTitle = hits[0].result.title
                        artistName = hits[0].result.primary_artist.name
                        source = 'Genius'
                    }
                }
            } catch (e) {
                console.log('Genius failed')
            }
        }

        // ========== SOURCE 3: Musixmatch (via API cachée) ==========
        if (!lyricsText) {
            try {
                const searchRes = await axios.get(`https://www.musixmatch.com/search/${encodeURIComponent(query)}`, {
                    timeout: 10000,
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                })
                
                const trackMatch = searchRes.data.match(/href="\/lyrics\/([^"]+)"/)
                if (trackMatch) {
                    const lyricsPage = await axios.get(`https://www.musixmatch.com/lyrics/${trackMatch[1]}`, {
                        headers: { 'User-Agent': 'Mozilla/5.0' }
                    })
                    
                    const lyricsMatch = lyricsPage.data.match(/<p class="mxm-lyrics__content">([\s\S]*?)<\/p>/i)
                    if (lyricsMatch) {
                        lyricsText = lyricsMatch[1]
                            .replace(/<br>/g, '\n')
                            .replace(/<[^>]*>/g, '')
                            .replace(/&quot;/g, '"')
                            .trim()
                        source = 'Musixmatch'
                    }
                }
            } catch (e) {
                console.log('Musixmatch failed')
            }
        }

        // ========== SOURCE 4: Lyrics.ovh ==========
        if (!lyricsText) {
            try {
                const words = query.split(' ')
                for (let i = 1; i <= Math.min(3, words.length); i++) {
                    const artist = words.slice(0, i).join(' ')
                    const title = words.slice(i).join(' ')
                    if (artist && title) {
                        try {
                            const response = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`, {
                                timeout: 8000
                            })
                            if (response.data?.lyrics) {
                                lyricsText = response.data.lyrics
                                songTitle = title
                                artistName = artist
                                source = 'Lyrics.ovh'
                                break
                            }
                        } catch (e) {}
                    }
                }
            } catch (e) {}
        }

        // ========== SOURCE 5: ChartLyrics ==========
        if (!lyricsText) {
            try {
                const response = await axios.get(`http://api.chartlyrics.com/apiv1.asmx/SearchLyricDirect?artist=&song=${encodeURIComponent(query)}`, {
                    timeout: 8000
                })
                if (response.data?.Lyric) {
                    lyricsText = response.data.Lyric
                    songTitle = response.data.LyricSong || query
                    artistName = response.data.LyricArtist || ''
                    source = 'ChartLyrics'
                }
            } catch (e) {}
        }

        // ========== SOURCE 6: API Popcat ==========
        if (!lyricsText) {
            try {
                const response = await axios.get(`https://api.popcat.xyz/lyrics?song=${encodeURIComponent(query)}`, {
                    timeout: 8000
                })
                if (response.data?.lyrics) {
                    lyricsText = response.data.lyrics
                    songTitle = response.data.title || query
                    artistName = response.data.artist || ''
                    source = 'Popcat'
                }
            } catch (e) {}
        }

        // ========== SOURCE 7: Some Random API ==========
        if (!lyricsText) {
            try {
                const response = await axios.get(`https://some-random-api.com/lyrics?title=${encodeURIComponent(query)}`, {
                    timeout: 8000
                })
                if (response.data?.lyrics) {
                    lyricsText = response.data.lyrics
                    songTitle = response.data.title || query
                    artistName = response.data.author || ''
                    source = 'SomeRandomAPI'
                }
            } catch (e) {}
        }

        // ========== SOURCE 8: Vagalume (site brésilien mais fonctionne) ==========
        if (!lyricsText) {
            try {
                const response = await axios.get(`https://api.vagalume.com.br/search.php?art=${encodeURIComponent(query)}&mus=${encodeURIComponent(query)}&apikey=`, {
                    timeout: 8000
                })
                if (response.data?.mus) {
                    lyricsText = response.data.mus[0]?.text || ''
                    songTitle = response.data.mus[0]?.name || query
                    artistName = response.data.art?.name || ''
                    source = 'Vagalume'
                }
            } catch (e) {}
        }

        // ========== SI AUCUN RÉSULTAT ==========
        if (!lyricsText) {
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}+lyrics`
            const result = `╭─⌈ ❌ PAROLES NON TROUVÉES ⌋
│
│ 🎵 *Recherche:* ${query}
│
│ 💡 *Essayez avec plus de détails:*
│ ▸ Ajoutez le nom de l'artiste
│ ▸ Ex: .lyrics ${query} artiste
│
│ 🔗 *Recherche manuelle:*
│ ${searchUrl}
│
╰─⌊ 🌹 WENS DM 🌹⌉`
            return client.sendMessage(remoteJid, { text: stylizedChar(result) }, { quoted: message })
        }

        // ========== NETTOYAGE ET FORMATAGE ==========
        lyricsText = lyricsText
            .replace(/\[.*?\]/g, '')
            .replace(/\r/g, '')
            .replace(/\n{4,}/g, '\n\n')
            .replace(/^ +| +$/gm, '')
            .trim()

        // Limiter la longueur
        if (lyricsText.length > 3900) {
            lyricsText = lyricsText.substring(0, 3900) + '\n\n... (suite trop longue)'
        }

        // ========== ENVOI ==========
        const result = `🎤 *${songTitle}*\n${artistName ? `👤 *${artistName}*\n` : ''}${source ? `📡 *Source:* ${source}\n` : ''}\n${lyricsText}`

        await client.sendMessage(remoteJid, {
            text: stylizedChar(result)
        }, { quoted: message })

        await client.sendMessage(remoteJid, {
            react: { text: "✅", key: message.key }
        })

    } catch (error) {
        console.error('Lyrics error:', error)
        
        await client.sendMessage(remoteJid, {
            text: stylizedChar(`❌ Erreur technique.\n\n🔗 Recherche manuelle : https://www.google.com/search?q=${encodeURIComponent(query)}+lyrics`)
        }, { quoted: message })
    }
}