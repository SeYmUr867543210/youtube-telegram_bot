const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");

// //youtube paramts
const myApiKEY = "AIzaSyAPx1ETtAaBo1qze17ryHo9TGb_DYCVaVs";
const baseApiUrl = "https://www.googleapis.com/youtube/v3";
const searchingChannelsName = "Samchik"; //
const channelId = "UCHTWv0QpQ7HTDp_0gU4eJhQ";
let allVideosId;
const videosCount = 3;

//telegram paramts
const TOKEN = "2026123924:AAGyg05JpAsdggz6vGnF2LwBCz5flSElsA0";
const bot = new TelegramBot(TOKEN, {
    polling: true
})
let msgChatId = 638348035;
bot.on("message", (msg) => {
    msgChatId = msg.chat.id;
})

//using channelsId,gettings channel allVideosId
let imSearchingFor = "contentDetails"; //to get all playLists from a channel

axios.get(`${baseApiUrl}/channels?key=${myApiKEY}&id=${channelId}&part=${imSearchingFor}`)
    .then(function(response) {
        allVideosId = response.data.items[0].contentDetails.relatedPlaylists.uploads;
        getVids(allVideosId); //
    })

let prevVids = []; //all videos from a channel considering "resultsCount"
let currentVids = [];

function getVids(allVideosId, repeatRequest) { //false
    let imSearchingFor = "snippet";

    let videos = axios.get(`${baseApiUrl}/playlistItems?key=${myApiKEY}&playlistId=${allVideosId}&maxResults=${videosCount}&part=${imSearchingFor}`);
    if (!repeatRequest) {
        videos.then(response => {
            pushDataToArrObj(response.data, prevVids);
            getVids(allVideosId, "repeatRequest"); // true
        })
    } else {
        videos.then(response => {
            currentVids = [];
            pushDataToArrObj(response.data, currentVids)
            compareArrObjects();
            getVids(allVideosId, "repeatRequest");
        })
    }
}

function pushDataToArrObj(data, arrObj) {
    data.items.forEach(function(item, i) {
        let vidTitle = item.snippet.title;
        let vidId = item.snippet.resourceId.videoId;

        arrObj.push({ title: vidTitle, src: `https://www.youtube.com/watch?v=${vidId}` })
    })

}

function compareArrObjects() {
    function areEqual(obj1, obj2) {
        return obj1.title == obj2.title && obj1.src == obj2.src;
    }

    let deleted = prevVids.filter(obj1 => currentVids.every(obj2 => !areEqual(obj1, obj2)))
    let added = currentVids.filter(obj1 => prevVids.every(obj2 => !areEqual(obj1, obj2)))

    if (deleted.length > 0) {
        tgBotSendALert(deleted, "deleted")
        prevVids = currentVids;
        deleted = [];
    }
    if (added.length > 0) {
        tgBotSendALert(added, "added")
        prevVids = currentVids;
        added = [];
    }

}

function tgBotSendALert(videos, youtubeVids) {
    if (youtubeVids == "deleted") {
        //send title to Telegram without src
        for (let i = 0; i < videos.length; i++) {
            const html = `
                    видео "<i>${videos[i].title}</i>" было удалено с youtube канала "<i>${searchingChannelsName}</i>"
                `
            bot.sendMessage(msgChatId, html, {
                parse_mode: "HTML"
            })
        }
    } else if (youtubeVids == "added") {
        //send title and src to Telegram
        videos.forEach(element => {
            const html = `
                        видео "<i>${element.title}</i>" было загружено в youtube канал "<i>${searchingChannelsName}</i>" ${element.src}
                    `
            bot.sendMessage(msgChatId, html, {
                parse_mode: "HTML"
            })
        });
    }
}


//ne mogu ponyat pochemu pri udalenii video s youtube,code zahodit v block "if (added.length > 0) na 76 strochke"




















//2)sdelat tak chtob bez otpravki soobsheniya clientom mog uvedomlyat ob izmeneniyah na youtube kanale(posle pervoy otpravki klientom soobshenie,sohranyat msg.chat.id,a esli budut izmeneniya,to podstavlyat etot id i uvedomlyat)
//3)kak sdelat tak chtob bot rabotal,daje esli moy komp vyklyuchen?

// function repeatReqst() {
//     let requestLimit = 10000; //that data could be taken from request
//     let timeLimitInSecs = 24 * 60;//24 hours * 60 = seconds
//     let quotaCostForRequest = 1;//that data could be taken from request
//     let requestsAmount = 2;//kollichestvo zaprosov

//     let id = setInterval(() => {
//         getVids(allVideosId, "repeatRequest")
//         // clearInterval(id);//

//     }, (requestLimit / timeLimitInSecs / quotaCostForRequest / requestsAmount) * 1000);
// }