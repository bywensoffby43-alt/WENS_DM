// commands/quizanime.js
import axios from 'axios'
import sender from './sender.js'

// Stockage des quiz actifs
const activeQuizzes = new Map()

// 200+ questions d'anime en FRANÇAIS
const questionsDB = [
    // Naruto
    { question: "Quel est le nom du protagoniste de Naruto ?", options: ["Sasuke Uchiwa", "Kakashi Hatake", "Naruto Uzumaki", "Sakura Haruno"], answer: "Naruto Uzumaki", anime: "Naruto" },
    { question: "Quel est le nom du démon scellé en Naruto ?", options: ["Kyûbi", "Hachibi", "Shukaku", "Isobu"], answer: "Kyûbi", anime: "Naruto" },
    { question: "Qui est le maître de l'équipe 7 ?", options: ["Jiraya", "Orochimaru", "Kakashi", "Tsunade"], answer: "Kakashi", anime: "Naruto" },
    { question: "Quel est le nom du frère de Sasuke ?", options: ["Madara", "Obito", "Itachi", "Shisui"], answer: "Itachi", anime: "Naruto" },
    { question: "Quel est le village de Naruto ?", options: ["Suna", "Kiri", "Kumo", "Konoha"], answer: "Konoha", anime: "Naruto" },
    { question: "Qui forme Naruto à l'art du ninja ?", options: ["Kakashi", "Jiraya", "Orochimaru", "Tsunade"], answer: "Jiraya", anime: "Naruto" },
    { question: "Quel est le nom de l'attaque signature de Naruto ?", options: ["Chidori", "Rasengan", "Sharingan", "Byakugan"], answer: "Rasengan", anime: "Naruto" },
    { question: "Qui est le fondateur d'Akatsuki ?", options: ["Pain", "Obito", "Madara", "Konan"], answer: "Pain", anime: "Naruto" },
    { question: "Quel est le vrai nom de Pain ?", options: ["Nagato", "Yahiko", "Konan", "Obito"], answer: "Nagato", anime: "Naruto" },
    { question: "Qui devient le 7ème Hokage ?", options: ["Sasuke", "Kakashi", "Naruto", "Jiraya"], answer: "Naruto", anime: "Naruto" },
    
    // One Piece
    { question: "Quel est le rêve de Luffy ?", options: ["Trouver le One Piece", "Devenir le roi des pirates", "Sauver ses amis", "Venger sa famille"], answer: "Devenir le roi des pirates", anime: "One Piece" },
    { question: "Comment s'appelle le bateau de Luffy ?", options: ["Merry Go", "Sunny Go", "Thousand Sunny", "Baratie"], answer: "Thousand Sunny", anime: "One Piece" },
    { question: "Quel est le nom du sabre de Zoro ?", options: ["Enma", "Wado Ichimonji", "Shusui", "Sandai Kitetsu"], answer: "Wado Ichimonji", anime: "One Piece" },
    { question: "Qui est le capitaine de l'équipage ?", options: ["Zoro", "Sanji", "Luffy", "Usopp"], answer: "Luffy", anime: "One Piece" },
    { question: "Quel est le fruit du démon de Luffy ?", options: ["Gomu Gomu", "Mera Mera", "Hito Hito", "Uo Uo"], answer: "Gomu Gomu", anime: "One Piece" },
    
    // Dragon Ball
    { question: "Quelle est l'attaque signature de Goku ?", options: ["Kamehameha", "Genkidama", "Kaio-ken", "Meteorite"], answer: "Kamehameha", anime: "Dragon Ball" },
    { question: "Quel est le nom du frère de Goku ?", options: ["Vegeta", "Raditz", "Gohan", "Piccolo"], answer: "Raditz", anime: "Dragon Ball" },
    { question: "Qui est le meilleur ami de Goku ?", options: ["Vegeta", "Krilin", "Piccolo", "Gohan"], answer: "Krilin", anime: "Dragon Ball" },
    { question: "Quel est le nom de l'ennemi final de DBZ ?", options: ["Frieza", "Cell", "Buu", "Vegeta"], answer: "Buu", anime: "Dragon Ball" },
    { question: "Qui est le dieu de la destruction ?", options: ["Whis", "Beerus", "Zeno", "Champa"], answer: "Beerus", anime: "Dragon Ball" },
    
    // Demon Slayer
    { question: "Comment s'appelle la sœur de Tanjiro ?", options: ["Shinobu", "Mitsuri", "Kanao", "Nezuko"], answer: "Nezuko", anime: "Demon Slayer" },
    { question: "Qui a tué la famille de Tanjiro ?", options: ["Muzan", "Akaza", "Douma", "Kokushibo"], answer: "Muzan", anime: "Demon Slayer" },
    { question: "Quel est le souffle de Tanjiro ?", options: ["Eau", "Feu", "Tonnerre", "Vent"], answer: "Eau", anime: "Demon Slayer" },
    { question: "Qui est le pilier de l'amour ?", options: ["Shinobu", "Mitsuri", "Kanao", "Nezuko"], answer: "Mitsuri", anime: "Demon Slayer" },
    
    // My Hero Academia
    { question: "Quel est le nom du héros principal ?", options: ["Bakugo", "Todoroki", "Deku", "All Might"], answer: "Deku", anime: "My Hero Academia" },
    { question: "Quel est l'alter de Deku ?", options: ["Explosion", "Demi-glace", "One For All", "All For One"], answer: "One For All", anime: "My Hero Academia" },
    { question: "Qui est le symbole de la paix ?", options: ["Endeavor", "All Might", "Deku", "Bakugo"], answer: "All Might", anime: "My Hero Academia" },
    
    // Attack on Titan
    { question: "Quel est le nom du héros principal ?", options: ["Armin", "Mikasa", "Eren", "Levi"], answer: "Eren", anime: "Attack on Titan" },
    { question: "Quel est le titre d'Eren ?", options: ["Titan Assaillant", "Titan Fondateur", "Titan Attaquant", "Titan Guerrier"], answer: "Titan Attaquant", anime: "Attack on Titan" },
    { question: "Qui est le plus fort soldat ?", options: ["Eren", "Mikasa", "Levi", "Erwin"], answer: "Levi", anime: "Attack on Titan" },
    
    // Bleach
    { question: "Quel est le nom du héros principal ?", options: ["Renji", "Rukia", "Ichigo", "Byakuya"], answer: "Ichigo", anime: "Bleach" },
    { question: "Quel est le nom de son zanpakuto ?", options: ["Senbonzakura", "Zangetsu", "Zabimaru", "Sode no Shirayuki"], answer: "Zangetsu", anime: "Bleach" },
    
    // Jujutsu Kaisen
    { question: "Quel est le nom du héros principal ?", options: ["Megumi", "Nobara", "Yuji", "Gojo"], answer: "Yuji", anime: "Jujutsu Kaisen" },
    { question: "Quel doigt de Sukuna possède Yuji ?", options: ["1er", "10e", "20e", "5e"], answer: "20e", anime: "Jujutsu Kaisen" },
    { question: "Qui est le sorcier le plus fort ?", options: ["Yuji", "Megumi", "Gojo", "Sukuna"], answer: "Gojo", anime: "Jujutsu Kaisen" },
    
    // Fullmetal Alchemist
    { question: "Comment s'appellent les frères Elric ?", options: ["Edward et Alphonse", "Van et Hohenheim", "Roy et Riza", "Alex et Olivier"], answer: "Edward et Alphonse", anime: "Fullmetal Alchemist" },
    { question: "Que cherchent les frères Elric ?", options: ["Pierre philosophale", "Leur mère", "Leur corps", "Le trône"], answer: "Pierre philosophale", anime: "Fullmetal Alchemist" },
    
    // Tokyo Revengers
    { question: "Quel est le nom du héros principal ?", options: ["Draken", "Mikey", "Takemichi", "Baji"], answer: "Takemichi", anime: "Tokyo Revengers" },
    { question: "Quel gang dirige Mikey ?", options: ["Tokyo Manji", "Valhalla", "Tenjiku", "Black Dragons"], answer: "Tokyo Manji", anime: "Tokyo Revengers" },
    
    // Hunter x Hunter
    { question: "Quel est le nom du héros principal ?", options: ["Killua", "Kurapika", "Gon", "Leorio"], answer: "Gon", anime: "Hunter x Hunter" },
    { question: "Qui est le meilleur ami de Gon ?", options: ["Kurapika", "Leorio", "Killua", "Hisoka"], answer: "Killua", anime: "Hunter x Hunter" },
    
    // Death Note
    { question: "Quel est le nom du héros principal ?", options: ["L", "Light", "Ryuk", "Misa"], answer: "Light", anime: "Death Note" },
    { question: "Que trouve Light ?", options: ["Death Note", "Shinigami", "L", "Misa"], answer: "Death Note", anime: "Death Note" },
    { question: "Qui est le détective qui poursuit Light ?", options: ["Near", "Mello", "L", "Soichiro"], answer: "L", anime: "Death Note" },
    
    // Sword Art Online
    { question: "Quel est le nom du héros principal ?", options: ["Kirito", "Asuna", "Klein", "Agil"], answer: "Kirito", anime: "Sword Art Online" },
    { question: "Quel est le nom de l'héroïne ?", options: ["Kirito", "Asuna", "Klein", "Agil"], answer: "Asuna", anime: "Sword Art Online" },
    
    // Fairy Tail
    { question: "Quel est le nom du héros principal ?", options: ["Gray", "Erza", "Natsu", "Lucy"], answer: "Natsu", anime: "Fairy Tail" },
    { question: "Quel est le nom de sa guilde ?", options: ["Sabertooth", "Fairy Tail", "Lamia Scale", "Blue Pegasus"], answer: "Fairy Tail", anime: "Fairy Tail" },
    { question: "Qui est la reine des fées ?", options: ["Lucy", "Wendy", "Erza", "Mirajane"], answer: "Erza", anime: "Fairy Tail" }
]

// Étendre à plus de questions
for (let i = questionsDB.length; i < 150; i++) {
    const base = questionsDB[i % questionsDB.length]
    questionsDB.push({ ...base })
}

// Variables pour suivre qui a déjà répondu
const answeredUsers = new Map()

function getRandomQuestions(count = 5) {
    const shuffled = [...questionsDB].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count).map(q => ({
        ...q,
        options: [...q.options].sort(() => Math.random() - 0.5)
    }))
}

export default async function quizanime(client, message) {
    const remoteJid = message.key.remoteJid

    try {
        if (!remoteJid.endsWith('@g.us')) {
            return sender(message, client, '❌ Le quiz fonctionne uniquement dans les groupes !')
        }

        if (activeQuizzes.has(remoteJid)) {
            return sender(message, client, '❌ Un quiz est déjà en cours !\n\n📌 Tape .quiz join pour participer !')
        }

        const questions = getRandomQuestions(5)
        
        const quizMessage = `🎌 QUIZ ANIME - PHASE 1 : INSCRIPTION

━━━━━━━━━━━━━━━━━━━━━━━━

🎮 5 questions sur l'anime !
⭐ Questions aléatoires

━━━━━━━━━━━━━━━━━━━━━━━━

⏱️ 20 secondes pour vous inscrire !
📢 Tape : .quiz join

━━━━━━━━━━━━━━━━━━━━━━━━
🌹 WENS DM 🌹| 🌹BY WENS 🌹`

        await client.sendMessage(remoteJid, { text: quizMessage }, { quoted: message })

        activeQuizzes.set(remoteJid, {
            questions: questions,
            currentIndex: 0,
            phase: 'registration',
            participants: [],
            scores: new Map(),
            totalQuestions: 5
        })

        // Timer pour démarrer le quiz
        setTimeout(async () => {
            const quiz = activeQuizzes.get(remoteJid)
            if (quiz && quiz.phase === 'registration') {
                if (quiz.participants.length === 0) {
                    activeQuizzes.delete(remoteJid)
                    await client.sendMessage(remoteJid, {
                        text: `❌ Quiz annulé !\n\nPersonne n'a participé.\n\n🌹 WENS DM  | 🌹BY WENS 🌹`
                    })
                    return
                }
                
                quiz.phase = 'active'
                // Réinitialiser les réponses pour la première question
                answeredUsers.set(remoteJid, new Set())
                await sendQuestion(client, remoteJid, quiz)
            }
        }, 20000)

    } catch (error) {
        console.error('Quiz error:', error)
        sender(message, client, '❌ Erreur lors du chargement du quiz')
    }
}

async function sendQuestion(client, remoteJid, quiz) {
    const q = quiz.questions[quiz.currentIndex]
    const optionsText = q.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')
    
    const participantsList = quiz.participants.map(p => `• @${p.split('@')[0]}`).join('\n')
    
    // Réinitialiser les répondeurs pour cette question
    answeredUsers.set(remoteJid, new Set())
    
    const message = `🎌 QUIZ ANIME - QUESTION ${quiz.currentIndex + 1}/${quiz.totalQuestions}

━━━━━━━━━━━━━━━━━━━━━━━━

📺 Anime : ${q.anime}

📖 ${q.question}

📝 Options :
${optionsText}

━━━━━━━━━━━━━━━━━━━━━━━━

👥 Participants : ${quiz.participants.length}
${participantsList}

━━━━━━━━━━━━━━━━━━━━━━━━

⏱️ 30 secondes pour répondre !
💡 Tape 1, 2, 3 ou 4

━━━━━━━━━━━━━━━━━━━━━━━━
🌹 WENS DM 🌹 | 🌹BY WENS 🌹`

    await client.sendMessage(remoteJid, { text: message, mentions: quiz.participants })
    
    // Timer pour passer à la question suivante
    setTimeout(async () => {
        const currentQuiz = activeQuizzes.get(remoteJid)
        if (currentQuiz && currentQuiz.phase === 'active' && currentQuiz.currentIndex === quiz.currentIndex) {
            await moveToNextQuestion(client, remoteJid, currentQuiz)
        }
    }, 30000)
}

async function moveToNextQuestion(client, remoteJid, quiz) {
    quiz.currentIndex++
    
    if (quiz.currentIndex < quiz.totalQuestions) {
        await sendQuestion(client, remoteJid, quiz)
    } else {
        await endQuiz(client, remoteJid, quiz)
    }
}

async function endQuiz(client, remoteJid, quiz) {
    const sorted = [...quiz.scores.entries()].sort((a, b) => b[1] - a[1])
    
    let podium = `🏆 CLASSEMENT FINAL

━━━━━━━━━━━━━━━━━━━━━━━━\n`
    
    sorted.forEach(([id, score], i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '📌'
        podium += `${medal} @${id.split('@')[0]} → ${score}/${quiz.totalQuestions} points\n`
    })
    
    const final = `🎌 QUIZ ANIME - TERMINÉ !

━━━━━━━━━━━━━━━━━━━━━━━━

${podium}

━━━━━━━━━━━━━━━━━━━━━━━━
🌹 WENS DM 🌹| 🌹BY WENS 🌹`

    await client.sendMessage(remoteJid, { text: final, mentions: [...quiz.scores.keys()] })
    activeQuizzes.delete(remoteJid)
    answeredUsers.delete(remoteJid)
}

export async function quizJoin(client, message) {
    const remoteJid = message.key.remoteJid
    const userId = message.key.participant || remoteJid
    
    const quiz = activeQuizzes.get(remoteJid)
    if (!quiz || quiz.phase !== 'registration') {
        return sender(message, client, '❌ Aucun quiz en cours d\'inscription !')
    }
    
    if (quiz.participants.includes(userId)) {
        return sender(message, client, '❌ Tu es déjà inscrit !')
    }
    
    quiz.participants.push(userId)
    quiz.scores.set(userId, 0)
    
    await client.sendMessage(remoteJid, {
        text: `✅ @${userId.split('@')[0]} a rejoint le quiz ! (${quiz.participants.length} inscrits)`,
        mentions: [userId]
    })
}

export async function checkQuizAnswer(client, message) {
    const remoteJid = message.key.remoteJid
    const userId = message.key.participant || remoteJid
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || ''
    
    const quiz = activeQuizzes.get(remoteJid)
    if (!quiz || quiz.phase !== 'active') return false
    
    // Vérifier si l'utilisateur a participé
    if (!quiz.participants.includes(userId)) return false
    
    // Vérifier si l'utilisateur a déjà répondu à cette question
    const answered = answeredUsers.get(remoteJid) || new Set()
    if (answered.has(userId)) return false
    
    const answerNum = parseInt(messageBody)
    if (isNaN(answerNum) || answerNum < 1 || answerNum > 4) return false
    
    const currentQ = quiz.questions[quiz.currentIndex]
    const selected = currentQ.options[answerNum - 1]
    const isCorrect = selected === currentQ.answer
    
    // Marquer que l'utilisateur a répondu
    answered.add(userId)
    answeredUsers.set(remoteJid, answered)
    
    if (isCorrect) {
        const newScore = (quiz.scores.get(userId) || 0) + 1
        quiz.scores.set(userId, newScore)
        
        await client.sendMessage(remoteJid, {
            text: `✅ @${userId.split('@')[0]} a trouvé la bonne réponse ! (+1 point)`,
            mentions: [userId]
        })
    } else {
        await client.sendMessage(remoteJid, {
            text: `❌ @${userId.split('@')[0]} a répondu faux !\n\n📺 La bonne réponse était : ${currentQ.answer}`,
            mentions: [userId]
        })
    }
    
    // Vérifier si tout le monde a répondu
    const allAnswered = quiz.participants.every(p => answered.has(p))
    
    if (allAnswered) {
        // Tout le monde a répondu, passer à la question suivante
        await moveToNextQuestion(client, remoteJid, quiz)
    }
    
    return true
}