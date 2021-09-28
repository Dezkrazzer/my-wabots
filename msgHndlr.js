/*
* "Wahai orang-orang yang beriman, mengapakah kamu mengatakan sesuatu yang tidak kamu kerjakan?
* Amat besar kebencian di sisi Allah bahwa kamu mengatakan apa-apa yang tidak kamu kerjakan."
* (QS ash-Shaff: 2-3).
*/
const { decryptMedia } = require('@open-wa/wa-decrypt')
const fs = require('fs-extra')
const axios = require('axios')
const moment = require('moment-timezone')
const get = require('got')
const fetch = require('node-fetch')
const color = require('./lib/color')
const { spawn, exec } = require('child_process')
const nhentai = require('nhentai-js')
const { API } = require('nhentai-api')
const { liriklagu, quotemaker, randomNimek, fb, sleep, jadwalTv, ss } = require('./lib/functions')
const { help, snk, info, donate, readme, listChannel } = require('./lib/help')
const { stdout } = require('process')
const nsfw_ = JSON.parse(fs.readFileSync('./lib/NSFW.json'))
const welkom = JSON.parse(fs.readFileSync('./lib/welcome.json'))
const snek = require("snekfetch")
const weather = require('weather-js')
const { RemoveBgResult, removeBackgroundFromImageBase64, removeBackgroundFromImageFile } = require('remove.bg')

moment.tz.setDefault('Asia/Jakarta').locale('id')

module.exports = msgHandler = async (client, message) => {
    try {
        const { type, id, from, t, sender, isGroupMsg, chat, caption, isMedia, mimetype, quotedMsg, quotedMsgObj, mentionedJidList } = message
        let { body } = message
        const { name, formattedTitle } = chat
        let { pushname, verifiedName } = sender
        pushname = pushname || verifiedName
        const commands = caption || body || ''
        const command = commands.toLowerCase().split(' ')[0] || ''
        const args =  commands.split(' ')

        const msgs = (message) => {
            if (command.startsWith('!')) {
                if (message.length >= 10){
                    return `${message.substr(0, 15)}`
                }else{
                    return `${message}`
                }
            }
        }

        const mess = {
            wait: '[ WAIT ] Sedang di proses⏳ silahkan tunggu sebentar',
            error: {
                St: '[❗] Kirim gambar dengan caption *!sticker* atau tag gambar yang sudah dikirim',
                Qm: '[❗] Terjadi kesalahan, mungkin themenya tidak tersedia!',
                Yt3: '[❗] Terjadi kesalahan, tidak dapat meng konversi ke mp3!',
                Yt4: '[❗] Terjadi kesalahan, mungkin error di sebabkan oleh sistem.',
                Ig: '[❗] Terjadi kesalahan, mungkin karena akunnya private',
                Ki: '[❗] Bot tidak bisa mengeluarkan admin group!',
                Ad: '[❗] Tidak dapat menambahkan target, mungkin karena di private',
                Iv: '[❗] Link yang anda kirim tidak valid!'
            }
        }
        const apiKey = 'rIQUCEfkYzi1Q7El95iQ' // apikey you can get it at https://mhankbarbar.moe
        const time = moment(t * 1000).format('DD/MM HH:mm:ss')
        const botNumber = await client.getHostNumber()
        const blockNumber = await client.getBlockedIds()
        const groupId = isGroupMsg ? chat.groupMetadata.id : ''
        const groupAdmins = isGroupMsg ? await client.getGroupAdmins(groupId) : ''
        const isGroupAdmins = isGroupMsg ? groupAdmins.includes(sender.id) : false
        const isBotGroupAdmins = isGroupMsg ? groupAdmins.includes(botNumber + '@c.us') : false
        const ownerNumber = ["6282337130026@c.us"] // replace with your whatsapp number
        const isOwner = ownerNumber.includes(sender.id)
        const isBlocked = blockNumber.includes(sender.id)
        const isNsfw = isGroupMsg ? nsfw_.includes(chat.id) : false
        const uaOverride = 'WhatsApp/2.2029.4 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'
        const isUrl = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi)
        if (!isGroupMsg && command.startsWith('!')) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, color(msgs(command)), 'from', color(pushname))
        if (isGroupMsg && command.startsWith('!')) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, color(msgs(command)), 'from', color(pushname), 'in', color(formattedTitle))
        //if (!isGroupMsg && !command.startsWith('!')) console.log('\x1b[1;33m~\x1b[1;37m>', '[\x1b[1;31mMSG\x1b[1;37m]', time, color(body), 'from', color(pushname))
        //if (isGroupMsg && !command.startsWith('!')) console.log('\x1b[1;33m~\x1b[1;37m>', '[\x1b[1;31mMSG\x1b[1;37m]', time, color(body), 'from', color(pushname), 'in', color(formattedTitle))
        if (isBlocked) return
        //if (!isOwner) return
        switch(command) {
        case '!sticker':
        case '!stiker':
            if (isMedia && type === 'image') {
                const mediaData = await decryptMedia(message, uaOverride)
                const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                await client.sendImageAsSticker(from, imageBase64)
            } else if (quotedMsg && quotedMsg.type == 'image') {
                const mediaData = await decryptMedia(quotedMsg, uaOverride)
                const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
                await client.sendImageAsSticker(from, imageBase64)
            } else if (args.length === 2) {
                const url = args[1]
                if (url.match(isUrl)) {
                    await client.sendStickerfromUrl(from, url, { method: 'get' })
                        .catch(err => console.log('Caught exception: ', err))
                } else {
                    client.reply(from, mess.error.Iv, id)
                }
            } else {
                    client.reply(from, mess.error.St, id)
            }
            break
        case '!stickergif':
        case '!stikergif':
        case '!sgif':
            if (isMedia) {
                if (mimetype === 'video/mp4' && message.duration < 10 || mimetype === 'image/gif' && message.duration < 10) {
                    const mediaData = await decryptMedia(message, uaOverride)
                    client.reply(from, '[WAIT] Sedang di proses⏳ silahkan tunggu ± 1 min!', id)
                    const filename = `./media/aswu.${mimetype.split('/')[1]}`
                    await fs.writeFileSync(filename, mediaData)
                    await exec(`gify ${filename} ./media/output.gif --fps=30 --scale=240:240`, async function (error, stdout, stderr) {
                        const gif = await fs.readFileSync('./media/output.gif', { encoding: "base64" })
                        await client.sendImageAsSticker(from, `data:image/gif;base64,${gif.toString('base64')}`)
                    })
                } else (
                    client.reply(from, '[❗] Kirim video dengan caption *!stickerGif* max 10 sec!', id)
                )
            }
            break
	    case '!stickernobg':
        case '!stikernobg':
	    if (isMedia) {
                try {
                    var mediaData = await decryptMedia(message, uaOverride)
                    var imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                    var base64img = imageBase64
                    var outFile = './media/img/noBg.png'
                    // untuk api key kalian bisa dapatkan pada website remove.bg
                    var result = await removeBackgroundFromImageBase64({ base64img, apiKey: 'FcgX9UN8HUfyXodp1LqUieFe', size: 'auto', type: 'auto', outFile })
                    await fs.writeFile(outFile, result.base64img)
                    await client.sendImageAsSticker(from, `data:${mimetype};base64,${result.base64img}`)
                } catch(err) {
                    console.log(err)
                }
            }
            break
        case '!tts':
            if (args.length === 1) return client.reply(from, 'Kirim perintah *!tts [id, en, jp, ar] [teks]*, contoh *!tts id halo semua*')
            const ttsId = require('node-gtts')('id')
            const ttsEn = require('node-gtts')('en')
	    const ttsJp = require('node-gtts')('ja')
            const ttsAr = require('node-gtts')('ar')
            const dataText = body.slice(8)
            if (dataText === '') return client.reply(from, 'Baka?', id)
            if (dataText.length > 500) return client.reply(from, 'Teks terlalu panjang!', id)
            var dataBhs = body.slice(5, 7)
	        if (dataBhs == 'id') {
                ttsId.save('./media/tts/resId.mp3', dataText, function () {
                    client.sendPtt(from, './media/tts/resId.mp3', id)
                })
            } else if (dataBhs == 'en') {
                ttsEn.save('./media/tts/resEn.mp3', dataText, function () {
                    client.sendPtt(from, './media/tts/resEn.mp3', id)
                })
            } else if (dataBhs == 'jp') {
                ttsJp.save('./media/tts/resJp.mp3', dataText, function () {
                    client.sendPtt(from, './media/tts/resJp.mp3', id)
                })
	    } else if (dataBhs == 'ar') {
                ttsAr.save('./media/tts/resAr.mp3', dataText, function () {
                    client.sendPtt(from, './media/tts/resAr.mp3', id)
                })
            } else {
                client.reply(from, 'Masukkan data bahasa : [id] untuk indonesia, [en] untuk inggris, [jp] untuk jepang, dan [ar] untuk arab', id)
            }
            break
        /*case '!nulis':
            if (args.length === 1) return client.reply(from, 'Kirim perintah *!nulis [teks]*', id)
            const nulis = encodeURIComponent(body.slice(7))
            client.reply(from, mess.wait, id)
            let urlnulis = `https://api.zeks.xyz/api/nulis?apikey=W59BFCtwydp2TPJJv0D0UIICzwS&text=${nulis}`
            await fetch(urlnulis, {method: "GET"})
            .then(res => res.json())
            .then(async (json) => {
                await client.sendFileFromUrl(from, json.result, 'Nulis.jpg', 'Nih anjim', id)
            }).catch(e => client.reply(from, "Error: "+ e));
            break*/
        case '!nulis':
            const nulisnya = encodeURIComponent(body.slice(8))
            client.reply(from, mess.wait, id)
            let urlnyaa = `https://api.zeks.xyz/api/nulis?apikey=W59BFCtwydp2TPJJv0D0UIICzwS&text=${nulisnya}`
            client.sendFileFromUrl(from, urlnyaa, 'nulis.jpeg', 'Ini yaaa', id)
            break        
        case '!ytmp3':
            if (args.length === 1) return client.reply(from, 'Kirim perintah *!ytmp3 [linkYt]*, untuk contoh silahkan kirim perintah *!readme*')
            let isLinks = args[1].match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)
            if (!isLinks) return client.reply(from, mess.error.Iv, id)
            try {
                client.reply(from, mess.wait, id)
                const ytmp3download = await get.get(`https://api.zeks.me/api/ytmp3/2?apikey=W59BFCtwydp2TPJJv0D0UIICzwS&url=${args[1]}`).json()
                console.log(ytmp3download.result)
                if (Number(ytmp3download.result.size.split(' MB')[0]) >= 40.00) return client.reply(from, 'Maaf durasi video sudah melebihi batas maksimal!', id);
                client.sendFileFromUrl(from, ytmp3download.result.thumb, 'thumb.jpg', `➸ *Title* : ${ytmp3download.result.title}\n➸ *Filesize* : ${ytmp3download.result.size}\n\nSilahkan tunggu sebentar proses pengiriman file membutuhkan waktu beberapa menit.`, id);
                await client.sendFileFromUrl(from, ytmp3download.result.link, `${ytmp3download.result.title}.mp3`, '', id).catch(() => client.reply(from, mess.error.Yt3, id));
            } catch (err) {
                console.log(err);
                client.reply(from, mess.error.Yt3, id);
            }
            break;
        case '!ytmp4':
            if (args.length === 1) return client.reply(from, 'Kirim perintah *!ytmp4 [linkYt]*, untuk contoh silahkan kirim perintah *!readme*')
            let isLin = args[1].match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)
            if (!isLin) return client.reply(from, mess.error.Iv, id)
            try {
                client.reply(from, mess.wait, id)
                const ytv = await get.get(`https://api.zeks.me/api/ytmp4/2?apikey=W59BFCtwydp2TPJJv0D0UIICzwS&url=${args[1]}`).json()
                console.log(ytv.result)              
                if (Number(ytv.result.size.split(' MB')[0]) > 40.00) return client.reply(from, 'Maaf durasi video sudah melebihi batas maksimal!', id)
                client.sendFileFromUrl(from, ytv.result.thumb, 'thumb.jpg', `➸ *Title* : ${ytv.result.title}\n➸ *Filesize* : ${ytv.result.size}\n\nSilahkan tunggu sebentar proses pengiriman file membutuhkan waktu beberapa menit.`, id)
                await client.sendFileFromUrl(from, ytv.result.link, `${ytv.result.title}.mp4`, '', id).catch(() => client.reply(from, mess.error.Yt4, id))
            } catch (er) {
                client.sendText(ownerNumber[0], 'Error ytmp4 : '+ er)
                client.reply(from, mess.error.Yt4, id)
            }
            break   
        case '!wiki':
            if (args.length === 1) return client.reply(from, 'Kirim perintah *!wiki [query]*\nContoh : *!wiki asu*', id)
            const query_ = body.slice(6)
            const wiki = await get.get(`https://api.zeks.xyz/api/wiki?apikey=W59BFCtwydp2TPJJv0D0UIICzwS&q=${query_}`).json()
            const hasilwiki = await wiki.result
            if (wiki.error) {
                client.reply(from, wiki.error, id)
            } else {
                client.reply(from, `Hasil pencarian dari *${query_}*\n\n${hasilwiki.result}`, id)
            }
            break
        case '!cuaca':
            if (args.length === 1) return client.reply(from, 'Kirim perintah *!cuaca [tempat]*\nContoh : *!cuaca tangerang', id)
            
            weather.find({search: body.slice(7), degreeType: 'C'}, function(err, result) {
                if (err) message.channel.send(err);
                if (result === undefined || result.length === 0) {
                    client.reply(from, 'Please enter a location!\n\nUsage: *!cuaca Ngawi*', id)
                    return;
                }
                var current = result[0].current;
                var location = result[0].location;
                //const descnya = `Cuaca dari *${current.observationpoint}*\n\n➸ *Zona Waktu* : UTC${location.timezone}\n➸ *Tanggal* : ${current.date}\n\n➸ *Angin* : ${current.winddisplay}\n➸ *Deskripsi* : ${current.skytext}\n➸ *Kelembapan* : ${current.humidity}%\n➸ *Suhu* : ${current.temperature}°`
                client.reply(from, `Cuaca dari *${current.observationpoint}*\n\n➸ *Zona Waktu* : UTC${location.timezone}\n➸ *Tanggal* : ${current.date}\n\n➸ *Angin* : ${current.winddisplay}\n➸ *Deskripsi* : ${current.skytext}\n➸ *Kelembapan* : ${current.humidity}%\n➸ *Suhu* : ${current.temperature}°`, id)
            })
            break
        case '!fb':
            if (args.length === 1) return client.reply(from, 'Kirim perintah *!fb [linkFb]* untuk contoh silahkan kirim perintah *!readme*', id)
            if (!args[1].includes('facebook.com')) return client.reply(from, mess.error.Iv, id)
            client.reply(from, mess.wait, id)
            const epbe = await get.get(`https://mhankbarbars.moe/api/epbe?url=${args[1]}&apiKey=${apiKey}`).json()
            if (epbe.error) return client.reply(from, epbe.error, id)
            client.sendFileFromUrl(from, epbe.result, 'epbe.mp4', epbe.title, id)
            break
        case '!creator':
            client.sendContact(from, '6282337130026@c.us')
            break
        case '!welcome':
            if (!isGroupMsg) return client.reply(from, '[❗] Perintah ini hanya bisa di gunakan dalam group!', id)
            if (!isGroupAdmins) return client.reply(from, '[❗] Perintah ini hanya bisa di gunakan oleh Admin group!', id)
            if (args.length === 1) return client.reply(from, '[❗] Pilih enable atau disable!\n\n*Contoh:*\n!welcome enable', id)
            if (args[1].toLowerCase() === 'enable') {
                welkom.push(chat.id)
                fs.writeFileSync('./lib/welcome.json', JSON.stringify(welkom))
                client.reply(from, 'Fitur welcome berhasil di aktifkan di group ini!', id)
            } else if (args[1].toLowerCase() === 'disable') {
                welkom.splice(chat.id, 1)
                fs.writeFileSync('./lib/welcome.json', JSON.stringify(welkom))
                client.reply(from, 'Fitur welcome berhasil di nonaktifkan di group ini!', id)
            } else {
                client.reply(from, 'Pilih enable atau disable udin!', id)
            }
            break
        case '!ig':    
        case '!igstalk':
            if (args.length === 1)  return client.reply(from, 'Kirim perintah *!igStalk @username*\nConntoh *!igStalk @duar_amjay*', id)
            const stalk = await get.get(`https://api.vhtear.com/igprofile?query=${args[1]}&apikey=c22e9e11d9a248fc8844a42b6c9c8ba2`).json()
            if (stalk.error) return client.reply(from, stalk.error, id)
            const account = stalk.result
            const caps = `➸ *Nama* : ${account.full_name}\n➸ *Username* : ${account.username}\n➸ *Jumlah Followers* : ${account.follower}\n➸ *Jumlah Following* : ${account.follow}\n➸ *Biodata* : ${account.biography}`
            await client.sendFileFromUrl(from, account.picture, 'Profile.jpg', caps, id)
            break
        case '!brainly':
            if (args.length >= 2){
                const BrainlySearch = require('./lib/brainly')
                let tanya = body.slice(9)
                let jum = Number(tanya.split('.')[1]) || 2
                if (jum > 10) return client.reply(from, 'Max 10!', id)
                if (Number(tanya[tanya.length-1])){
                    tanya
                }
                client.reply(from, `➸ *Pertanyaan* : ${tanya.split('.')[0]}\n\n➸ *Jumlah jawaban* : ${Number(jum)}`, id)
                await BrainlySearch(tanya.split('.')[0],Number(jum), function(res){
                    res.forEach(x=>{
                        if (x.jawaban.fotoJawaban.length == 0) {
                            client.reply(from, `➸ *Pertanyaan* : ${x.pertanyaan}\n\n➸ *Jawaban* : ${x.jawaban.judulJawaban}\n`, id)
                        } else {
                            client.reply(from, `➸ *Pertanyaan* : ${x.pertanyaan}\n\n➸ *Jawaban* : ${x.jawaban.judulJawaban}\n\n➸ *Link foto jawaban* : ${x.jawaban.fotoJawaban.join('\n')}`, id)
                        }
                    })
                })
            } else {
                client.reply(from, 'Usage :\n!brainly [pertanyaan] [.jumlah]\n\nEx : \n!brainly NKRI .2', id)
            }
            break
        case '!linkgroup':
            if (!isBotGroupAdmins) return client.reply(from, 'Perintah ini hanya bisa di gunakan ketika bot menjadi admin', id)
            if (isGroupMsg) {
                const inviteLink = await client.getGroupInviteLink(groupId);
                client.sendLinkWithAutoPreview(from, inviteLink, `\nLink group *${name}*`)
            } else {
            	client.reply(from, 'Perintah ini hanya bisa di gunakan dalam group!', id)
            }
            break
        case '!bc':
            if (!isOwner) return client.reply(from, 'Perintah ini hanya untuk Owner bot!', id)
            let msg = body.slice(4)
            const chatz = await client.getAllChatIds()
            for (let ids of chatz) {
                var cvk = await client.getChatById(ids)
                if (!cvk.isReadOnly) await client.sendText(ids, `[ Shinomiya Kaguya BOT Broadcast ]\n\n${msg}`)
            }
            client.reply(from, 'Broadcast Success!', id)
            break
        case '!adminlist':
            if (!isGroupMsg) return client.reply(from, 'Perintah ini hanya bisa di gunakan dalam group!', id)
            let mimin = ''
            for (let admon of groupAdmins) {
                mimin += `➸ @${admon.replace(/@c.us/g, '')}\n` 
            }
            await client.sendTextWithMentions(from, mimin)
            break
        case '!ownergroup':
            if (!isGroupMsg) return client.reply(from, 'Perintah ini hanya bisa di gunakan dalam group!', id)
            const Owner_ = chat.groupMetadata.owner
            await client.sendTextWithMentions(from, `Owner Group : @${Owner_}`)
            break
        case '!mentionall':
            if (!isGroupMsg) return client.reply(from, 'Perintah ini hanya bisa di gunakan dalam group!', id)
            if (!isGroupAdmins) return client.reply(from, 'Perintah ini hanya bisa di gunakan oleh admin group', id)
            const groupMem = await client.getGroupMembers(groupId)
            let hehe = '╔══✪〘 Mention All 〙✪══\n'
            for (let i = 0; i < groupMem.length; i++) {
                hehe += '╠➥'
                hehe += ` @${groupMem[i].id.replace(/@c.us/g, '')}\n`
            }
            hehe += '╚═〘 Lazuardi Akbar BOT 〙'
            await client.sendTextWithMentions(from, hehe)
            break
        case '!kickall':
            if (!isGroupMsg) return client.reply(from, 'Perintah ini hanya bisa di gunakan dalam group!', id)
            const isGroupOwner = sender.id === chat.groupMetadata.owner
            if (!isGroupOwner) return client.reply(from, 'Perintah ini hanya bisa di gunakan oleh Owner group', id)
            if (!isBotGroupAdmins) return client.reply(from, 'Perintah ini hanya bisa di gunakan ketika bot menjadi admin', id)
            const allMem = await client.getGroupMembers(groupId)
            for (let i = 0; i < allMem.length; i++) {
                if (groupAdmins.includes(allMem[i].id)) {
                    console.log('Upss this is Admin group')
                } else {
                    await client.removeParticipant(groupId, allMem[i].id)
                }
            }
            client.reply(from, 'Succes kick all member', id)
            break
        case '!leaveall':
            if (!isOwner) return client.reply(from, 'Perintah ini hanya untuk Owner bot', id)
            const allChats = await client.getAllChatIds()
            const allGroups = await client.getAllGroups()
            for (let gclist of allGroups) {
                await client.sendText(gclist.contact.id, `Maaf bot sedang pembersihan, total chat aktif : ${allChats.length}`)
                await client.leaveGroup(gclist.contact.id)
            }
            client.reply(from, 'Succes leave all group!', id)
            break
        case '!clearall':
            if (!isOwner) return client.reply(from, 'Perintah ini hanya untuk Owner bot', id)
            const allChatz = await client.getAllChats()
            for (let dchat of allChatz) {
                await client.deleteChat(dchat.id)
            }
            client.reply(from, 'Succes clear all chat!', id)
            break
        case '!add':
            const orang = args[1]
            if (!isGroupMsg) return client.reply(from, 'Fitur ini hanya bisa di gunakan dalam group', id)
            if (args.length === 1) return client.reply(from, 'Untuk menggunakan fitur ini, kirim perintah *!add* 628xxxxx', id)
            if (!isGroupAdmins) return client.reply(from, 'Perintah ini hanya bisa di gunakan oleh admin group', id)
            if (!isBotGroupAdmins) return client.reply(from, 'Perintah ini hanya bisa di gunakan ketika bot menjadi admin', id)
            try {
                await client.addParticipant(from,`${orang}@c.us`)
            } catch {
                client.reply(from, mess.error.Ad, id)
            }
            break
        case '!kick':
            if (!isGroupMsg) return client.reply(from, 'Fitur ini hanya bisa di gunakan dalam group', id)
            if (!isGroupAdmins) return client.reply(from, 'Perintah ini hanya bisa di gunakan oleh admin group', id)
            if (!isBotGroupAdmins) return client.reply(from, 'Perintah ini hanya bisa di gunakan ketika bot menjadi admin', id)
            if (mentionedJidList.length === 0) return client.reply(from, 'Untuk menggunakan Perintah ini, kirim perintah *!kick* @tagmember', id)
            await client.sendText(from, `Perintah diterima, mengeluarkan:\n${mentionedJidList.join('\n')}`)
            for (let i = 0; i < mentionedJidList.length; i++) {
                if (groupAdmins.includes(mentionedJidList[i])) return client.reply(from, mess.error.Ki, id)
                await client.removeParticipant(groupId, mentionedJidList[i])
            }
            break
        case '!leave':
            if (!isGroupMsg) return client.reply(from, 'Perintah ini hanya bisa di gunakan dalam group', id)
            if (!isGroupAdmins) return client.reply(from, 'Perintah ini hanya bisa di gunakan oleh admin group', id)
            await client.sendText(from,'Sayonara').then(() => client.leaveGroup(groupId))
            break
        case '!promote':
            if (!isGroupMsg) return client.reply(from, 'Fitur ini hanya bisa di gunakan dalam group', id)
            if (!isGroupAdmins) return client.reply(from, 'Fitur ini hanya bisa di gunakan oleh admin group', id)
            if (!isBotGroupAdmins) return client.reply(from, 'Fitur ini hanya bisa di gunakan ketika bot menjadi admin', id)
            if (mentionedJidList.length === 0) return client.reply(from, 'Untuk menggunakan fitur ini, kirim perintah *!promote* @tagmember', id)
            if (mentionedJidList.length >= 2) return client.reply(from, 'Maaf, perintah ini hanya dapat digunakan kepada 1 user.', id)
            if (groupAdmins.includes(mentionedJidList[0])) return client.reply(from, 'Maaf, user tersebut sudah menjadi admin.', id)
            await client.promoteParticipant(groupId, mentionedJidList[0])
            await client.sendTextWithMentions(from, `Perintah diterima, menambahkan @${mentionedJidList[0]} sebagai admin.`)
            break
        case '!demote':
            if (!isGroupMsg) return client.reply(from, 'Fitur ini hanya bisa di gunakan dalam group', id)
            if (!isGroupAdmins) return client.reply(from, 'Fitur ini hanya bisa di gunakan oleh admin group', id)
            if (!isBotGroupAdmins) return client.reply(from, 'Fitur ini hanya bisa di gunakan ketika bot menjadi admin', id)
            if (mentionedJidList.length === 0) return client.reply(from, 'Untuk menggunakan fitur ini, kirim perintah *!demote* @tagadmin', id)
            if (mentionedJidList.length >= 2) return client.reply(from, 'Maaf, perintah ini hanya dapat digunakan kepada 1 orang.', id)
            if (!groupAdmins.includes(mentionedJidList[0])) return client.reply(from, 'Maaf, user tersebut tidak menjadi admin.', id)
            await client.demoteParticipant(groupId, mentionedJidList[0])
            await client.sendTextWithMentions(from, `Perintah diterima, menghapus jabatan @${mentionedJidList[0]}.`)
            break
        case '!join':
            //return client.reply(from, 'Jika ingin meng-invite bot ke group anda, silahkan izin ke wa.me/6285892766102', id)
            if (args.length < 2) return client.reply(from, 'Kirim perintah *!join linkgroup key*\n\nEx:\n!join https://chat.whatsapp.com/blablablablablabla abcde\nuntuk key kamu bisa mendapatkannya hanya dengan donasi 5k', id)
            const link = args[1]
            const tGr = await client.getAllGroups()
            const isLink = link.match(/(https:\/\/chat.whatsapp.com)/gi)
            const check = await client.inviteInfo(link)
            if (!isLink) return client.reply(from, 'Ini link? 👊🤬', id)
            if (check.status === 200) {
                await client.joinGroupViaLink(link).then(() => client.reply(from, 'Bot akan segera masuk!'))
            } else {
                client.reply(from, 'Link group tidak valid!', id)
            }
            break
        case '!delete':
            if (!isGroupMsg) return client.reply(from, 'Fitur ini hanya bisa di gunakan dalam group', id)
            if (!isGroupAdmins) return client.reply(from, 'Fitur ini hanya bisa di gunakan oleh admin group', id)
            if (!quotedMsg) return client.reply(from, 'Salah!!, kirim perintah *!delete [tagpesanbot]*', id)
            if (!quotedMsgObj.fromMe) return client.reply(from, 'Salah!!, Bot tidak bisa mengahpus chat user lain!', id)
            client.deleteMessage(quotedMsgObj.chatId, quotedMsgObj.id, false)
            break
        case '!getses':
            if (!isOwner) return client.reply(from, 'Perintah ini hanya untuk Owner bot!', id)
            const sesPic = await client.getSnapshot()
            client.sendFile(from, sesPic, 'session.png', 'Neh...', id)
            break
        case '!listblock':
            let hih = `This is list of blocked number\nTotal : ${blockNumber.length}\n`
            for (let i of blockNumber) {
                hih += `➸ @${i.replace(/@c.us/g,'')}\n`
            }
            client.sendTextWithMentions(from, hih, id)
            break
        case '!jadwalsholat':
            if (args.length === 1) return client.reply(from, '[❗] Kirim perintah *!jadwalsholat [daerah]*\ncontoh : *!jadwalsholat Tangerang*')
            const daerah = body.slice(14)
            const jadwalShalat = await get.get(`https://api.zeks.xyz/api/jadwalsholat?apikey=W59BFCtwydp2TPJJv0D0UIICzwS&daerah=${daerah}`).json()
            const typenya = await jadwalShalat.data.object
            if (jadwalShalat.error) return client.reply(from, jadwalShalat.error, id)
            const { Shubuh, Dzuhur, Ashr, Maghrib, Isya } = await typenya
            arrbulan = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
            tgl = new Date().getDate()
            bln = new Date().getMonth()
            thn = new Date().getFullYear()
            const resultJadwal = `Jadwal shalat di ${daerah}, ${tgl}-${arrbulan[bln]}-${thn}\n\nSubuh : ${Shubuh}\nDzuhur : ${Dzuhur}\nAshar : ${Ashr}\nMaghrib : ${Maghrib}\nIsya : ${Isya}`
            client.reply(from, resultJadwal, id)
            break
        case '!listchannel':
            client.reply(from, listChannel, id)
            break
        case '!jadwaltv':
            if (args.length === 1) return client.reply(from, `Kirim perintah !jadwaltv [channelnya]\nSilahkan gunakan *!listchannel* untuk mengetahui channel yg tersedia`, id)
            try {
                const channeltvnya = body.slice(10)
                const urltvnya = await get.get(`https://api.zeks.xyz/api/jadwaltv?apikey=W59BFCtwydp2TPJJv0D0UIICzwS&channel=${channeltvnya}`).json()
                const hasiltvnya = urltvnya.result
                client.reply(from, hasiltvnya, id)
            } catch(e) {
                client.reply(from, "[❗] Terjadi kesalahan saat pengambilan data, mungkin kamu memasukkan channel tv yang salah", id)
            }
            break
        case '!pantun':
            const pantunurlnya = await get.get("https://api.zeks.xyz/api/pantun?apikey=W59BFCtwydp2TPJJv0D0UIICzwS&=").json()
            const hasilnyapantun = await pantunurlnya.result
            client.reply(from, hasilnyapantun.pantun, id)
            break    
        case '!quote':
            const urlquote = await get.get("https://api.zeks.xyz/api/quote?apikey=W59BFCtwydp2TPJJv0D0UIICzwS").json()
            const hasilquote = await urlquote.result
            client.reply(from, `${hasilquote.quotes}\n-${hasilquote.author}`, id)
            break
        case '!estetic':
            const urlestetic = "https://api.zeks.xyz/api/estetikpic?apikey=W59BFCtwydp2TPJJv0D0UIICzwS"
            client.sendFileFromUrl(from, urlestetic, 'estetic.jpg', "✨", id)
            break
        case '!darkjokes':
            const urldarkjokes = await get.get("https://api.zeks.xyz/api/darkjokes?apikey=W59BFCtwydp2TPJJv0D0UIICzwS").json()
            const hasildarkjokes = await urldarkjokes.result
            client.sendFileFromUrl(from, hasildarkjokes, 'darkjokes.jpg', null, id)
            break
        case '!shorturl':
            if (args.length === 1)  return client.reply(from, '[❗] Mohon berikan url yang dibutuhkan', id)
            const longurlnya = body.slice(10)
            const apishorturl = await get.get(`https://api.zeks.xyz/api/sid-shortener?apikey=W59BFCtwydp2TPJJv0D0UIICzwS&url=${longurlnya}`).json()
            const hasilshorturl = await apishorturl.short
            const datatime = await apishorturl.created_at
            client.reply(from, `*Hasil shorturl dari website:*\n${longurlnya}\n\n❒ Result: *${hasilshorturl}*\n❒ Date: ${datatime.date}\n❒ Timezone: ${datatime.timezone}`, id)
            break
        /*case '!sendto':
            client.sendFile(from, './msgHndlr.js', 'msgHndlr.js')
            break*/
        case '!url2img':
            const webygdicari = body.slice(9)
            if (args.length === 1) return client.reply(from, 'Kirim perintah *!url2img [web]*\nContoh *!url2img https://media.discordapp.net/attachments/459002735896035349/864377208607604746/b2a2d3cf-a2d1-46f4-97a9-b2a76b8821bd.png*', id)
            client.sendFileFromUrl(from, webygdicari, 'kyaa.jpg', null, id)
            break  
        case '!artinama':
            if (args.length === 1)  return client.reply(from, '[❗] Mohon berikan suatu nama\n\n*Contoh* : !artinama Rizki', id)   
            const namanya = body.slice(10)
            const urlnama = await get.get(`https://api.zeks.xyz/api/artinama?apikey=W59BFCtwydp2TPJJv0D0UIICzwS&nama=${namanya}`).json()
            const hasilnama = await urlnama.result
            client.reply(from, `Hasil pencarian nama dari : *${namanya}*\n\n${hasilnama}`, id)
            break
        case '!list':    
        case '!help':
            client.sendText(from, help)
            break
        case '!readme':
            client.reply(from, readme, id)
            break
        case '!snk':
            client.reply(from, snk, id)
            break
        case '!ping':
            client.sendText(message.from, `Pong!`)
            break
        case '!mock':
            if (args.length === 1)  return client.reply(from, '[❗] Mohon berikan suatu text\n\n*Contoh* : Kamu seorang yang cerdas', id)   
            const data = body.slice(6)
            let out = ""
            for (let i = 0; i< data.length; i++) {
            out += (i + 1) % 2 === 0 ? data[i].toUpperCase() : data[i];
            }
            client.sendText(message.from, out)
            break
        case '!igdownload':
                if (args.length === 1)  return client.reply(from, '[❗] Mohon berikan url yang akan di download\n\n*Contoh* : !igdownload https://www.instagram.com/p/B5MwL_lh8S3/', id)
                const downloadurl = await get.get(`https://api.zeks.xyz/api/ig?apikey=W59BFCtwydp2TPJJv0D0UIICzwS&url=${args[1]}`).json()
                client.reply(from, mess.wait, id)
                if (downloadurl.error) return client.reply(from, stalk.error, id)
                const downloadnyaa = await downloadurl.result[0].url
                await client.sendFileFromUrl(from, downloadnyaa, 'post.jpg', `Hasil download dari: ${args[1]}`, id)
            break
        case '!storydownload':
                if (args.length === 1)  return client.reply(from, '[❗] Mohon berikan username dan story ke berapa yang akan di download\n\n*Contoh* : !storydownload dezkrazzer_  0\n\n*NOTE*:\nPerlu diingat bahwa story pertama adalah nomor *0*\nStory kedua adalah nomor *1*\nStory ketiga adalah nomor *2*\nDan seterusnya', id)
                try {
                const storyke = args[2]
                const downloadurl2 = await get.get(`https://api.vhtear.com/igstory?query=${args[1]}&apikey=c22e9e11d9a248fc8844a42b6c9c8ba2`).json()
                client.reply(from, mess.wait, id)
                if (downloadurl2.error) return client.reply(from, stalk.error, id)
                const downloadnyaa2 = await downloadurl2.result.story.itemlist[storyke].urlDownload
                console.log(downloadnyaa2)
                await client.sendFileFromUrl(from, downloadnyaa2, 'story.jpg', `Hasil download dari: ${args[1]}`, id)
                } catch(e) {
                    client.reply(from, `[❗] Terjadi kesalahan sistem, ini mungkin karena:\n\n1) Akun yang anda cari private\n2) Akun yang anda cari tidak mengunggah story\n3) Api yang digunakan sedang error`, id)
                }
            break
        case '!memburik':
                if (args.length === 1)  return client.reply(from, '[❗] Mohon berikan suatu text\n\n*Contoh* : !memburik EJAKUN', id)
                const burikurl = `https://api.zeks.xyz/api/epep?apikey=W59BFCtwydp2TPJJv0D0UIICzwS&text=${body.slice(10)}`
                client.reply(from, mess.wait, id)
                await client.sendFileFromUrl(from, burikurl, 'ffburik.jpg', `Burik kek muka lu`, id)
            break
        case '!malesnulis':
                if (args.length === 1) return client.reply(from, 'Kirim perintah *!malesnulis Nama Kamu|kelas|text kamu*', id)			
		        const argg = body.trim().split(" ").slice(1).join(" ").trim().split("|")	
                const namapenulis = encodeURIComponent(argg[0])
                const kelaspenulis = encodeURIComponent(argg[1])
                const textnya = encodeURIComponent(argg[2])
		        client.reply(from, mess.wait, id)
                let urlnulis2 = `https://api.zeks.me/api/magernulis?apikey=W59BFCtwydp2TPJJv0D0UIICzwS&nama=${namapenulis}&kelas=${kelaspenulis}&text=${textnya}&tinta=1`
		        console.log(namapenulis)
		        console.log(kelaspenulis)
		        console.log(textnya)
		        await client.sendFileFromUrl(from, urlnulis2, 'post.jpg', `malesan huu`, id)
            break
            case '!vtdownload':
                if (args.length === 1)  return client.reply(from, '[❗] Mohon berikan link vt tiktok yang valid', id)
                try {
                const vtdownload = await get.get(`https://api.vhtear.com/tiktok_no_wm?link=${args[1]}&apikey=c22e9e11d9a248fc8844a42b6c9c8ba2`).json()
                client.reply(from, mess.wait, id)
                if (vtdownload.error) return client.reply(from, stalk.error, id)
                const downloadvt = await vtdownload.result.video
                await client.sendFileFromUrl(from, downloadvt, 'vttiktok.mp4', `Hasil download dari: ${args[1]}`, id)
                } catch(e) {
                    client.reply(from, `[❗] Perintah ini masih dalam tahap BETA. Beberapa bug mungkin masih terjadi.\n\nError logs:\n${e.stack}`, id)
                }
            break
            case '!ssweb':
                if (args.length === 1)  return client.reply(from, '[❗] Mohon berikan suatu text\n\n*Contoh* : !ssweb google.com', id)
                const sswebb = `https://api.vhtear.com/ssweb?link=${args[1]}&type=phone&apikey=c22e9e11d9a248fc8844a42b6c9c8ba2`
                client.reply(from, mess.wait, id)
                await client.sendFileFromUrl(from, sswebb, 'screenshot.jpg', ``, id)
            break
            case '!puisi':
                const urlpuisi = "https://api.vhtear.com/puisi_image&apikey=c22e9e11d9a248fc8844a42b6c9c8ba2"
                client.sendFileFromUrl(from, urlpuisi, 'puisi.jpg', null, id)
                break 
	}
        
    } catch (err) {
        console.log(color('[ERROR]', 'red'), err)
        //client.kill().then(a => console.log(a))
    }
    
}
