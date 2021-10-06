const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");

//youtube paramts
const myApiKey = "HERE IS YOUR YOUTUBE API KEY"; // change this to yours
const baseApiUrl = "https://www.googleapis.com/youtube/v3";
const channelName = "HERE IS YOUR SERACHINGCHANNELS NAME"; // change this to yours
let channelId;
const responseResults = 50;


//telegram paramts
const TOKEN = "HERE IS YOUR TELEGRAM TOKEN"; // change this to yours
let msgChatId = 00000000; //change it to yours(msg.chatId could be taken from bot.onmessage listener response)

const bot = new TelegramBot(TOKEN, {
    polling: true
})


//using channelName,getting channelId
function getChannelId() {
    let url = encodeURI(`${baseApiUrl}/search?key=${myApiKey}&type=channel&part=snippet&q=${channelName}`)

    axios.get(url).then(function(response) {
        response.data.items.forEach(element => {
            if (element.snippet.title == channelName) {
                channelId = element.id.channelId;
                getAllVidsId(channelId);
            }
        })
    })
}
getChannelId()

//using channelId,getting allVidsId
let allVidsId;

function getAllVidsId() {
    let searchingFor = "contentDetails"
    const url = `${baseApiUrl}/channels?key=${myApiKey}&id=${channelId}&part=${searchingFor}`;

    axios.get(url).then(function(response) {
        allVidsId = response.data.items[0].contentDetails.relatedPlaylists.uploads;
        getAllVideosDetails(allVidsId);
    })
}

let exArrObj = [];
let nowArrObj = [];

//using allVidsId, getting allVideosDetails(title,src)
function getAllVideosDetails(allVidsId, repeatReqst) {
    let searchingFor = "snippet";
    let url = `${baseApiUrl}/playlistItems?key=${myApiKey}&playlistId=${allVidsId}&${responseResults}=30&part=${searchingFor}`;
    let urlsAndTitles = axios.get(url);

    if (!repeatReqst) {
        urlsAndTitles.then(function(response) {
            pushDataToArrObj(response.data, exArrObj);
            getAllVideosDetails(allVidsId, true);
        })
    } else if (repeatReqst) {
        urlsAndTitles.then(function(response) {
            nowArrObj = [];
            pushDataToArrObj(response.data, nowArrObj);
            let changes = compareArrObjs(exArrObj, nowArrObj);

            if (changes) {
                tgBotSendALert(msgChatId, changes);
                //exArrObj = arrObj;
                // getAllVideosDetails(allVidsId, true);
            } else {
                console.log("repeatReq")
                getAllVideosDetails(allVidsId, true);
            }

        })
    }


}

function pushDataToArrObj(data, arrObj) {
    data.items.forEach(function(item) {
        let vidTitle = item.snippet.title;
        let vidId = item.snippet.resourceId.videoId;

        arrObj.push({ title: vidTitle, src: `https://www.youtube.com/watch?v=${vidId}` })
    })

}

function compareArrObjs(exArrObj, arrObj) {
    function areEqual(obj1, obj2) {
        return obj1.title == obj2.title && obj1.src == obj2.src;
    }

    let deleted = exArrObj.filter(obj1 => arrObj.every(obj2 => !areEqual(obj1, obj2)));
    let added = arrObj.filter(obj1 => exArrObj.every(obj2 => !areEqual(obj1, obj2)));

    return deleted.length || added.length ? { deleted, added } : false;
}


function tgBotSendALert(msgChatId, changes) {
    if (changes.deleted.length) {
        changes.deleted.map(function(item) {
            const html = `
                                видео "<i>${item.title}</i>" было удалено с youtube канала "<i>${channelName}</i>"
                            `
            bot.sendMessage(msgChatId, html, {
                parse_mode: "HTML"
            }).then(function() {
                exArrObj = [];
                for (let item of nowArrObj) {
                    exArrObj.push(item)
                }
                getAllVideosDetails(allVidsId, true);
            })
        })
    } else if (changes.added.length) {
        changes.added.map(function(item) {
            const html = `
                        видео "<i>${item.title}</i>" было загружено в youtube канал "<i>${channelName}</i>" ${item.src}
                    `
            bot.sendMessage(msgChatId, html, {
                parse_mode: "HTML"
            }).then(function() {
                exArrObj = [];
                for (let item of nowArrObj) {
                    exArrObj.push(item)
                }
                getAllVideosDetails(allVidsId, true);
            })
        })
    }

}