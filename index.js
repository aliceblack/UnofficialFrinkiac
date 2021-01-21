const express = require('express')
const app = express()
const port = 3000
const axios = require('axios');
const { resolve } = require('path');

var bodyParser = require('body-parser')

app.use(bodyParser.json());


app.get('/', (req, res) => {
  res.send('Unofficial Frinkiac')
});


app.get('/bot', (req, res) => {
    let botToken=process.env.BOT_TOKEN;
    let website="https://api.telegram.org/bot".concat(botToken);

    let chatId=req.body["message"]["chat"]["id"];
    let name=req.body["message"]["chat"]["first_name"];
    let text=req.body["message"]["text"];

    getRandomMemeAsBase64()
    .then(response=>{
            let base64 = response;
            let url = website+"/sendphoto?chat_id="+chatId+"&photo="+base64;
            sendMemeToTelegram(url)
            .then(response=>{
                res.send();
            })
            .catch(error=>{
                console.log(error)
                res.status(500).send(error);
            });
           
    })
    .catch(error=>{
        console.log(error)
        res.status(500).send(error);
    });
});

function sendMemeToTelegram(url){
    return new Promise( (resolve, reject) =>{
        axios.get(url)
        .then(response => {
            resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
}

function getRandomMemeAsBase64(){
    return new Promise( (resolve, reject) =>{
        getRandomFromFrinkiac()
        .then(response=>{
            const buff = Buffer.from(response.caption, 'utf-8');
            let captionBase64 = buff.toString('base64');
            getBase64MemeFromFrinkiac(response.episode, response.timeStamp, captionBase64)
            .then(meme=>{
                resolve(meme);
            })
            .catch(error=>{
                reject(error);
            });
        })
        .catch(error=>{
            reject(error)
        });
    });
}

function getRandomFromFrinkiac(){
    return new Promise( (resolve, reject) =>{
        let url = 'https://frinkiac.com/api/random';
        axios.get(url)
        .then(response => {
            let longCaption = "";
            response.data.Subtitles.forEach(element => {
                longCaption+=" ".concat(element.Content)
            });
            let episode = response.data.Frame.Episode;
            let timeStamp = response.data.Frame.Timestamp;
            resolve({episode: episode, timeStamp: timeStamp, caption: longCaption});
        })
        .catch(error => {
          reject(error);
        });
    });
}

function getBase64MemeFromFrinkiac(episode,timestamp,captionInBase64){
    return new Promise( (resolve, reject) =>{
        let url = 'https://frinkiac.com/meme/'+episode+'/'+timestamp+'.jpg?b64lines='+captionInBase64;
        axios.get(url, {
            responseType: 'arraybuffer'
        })
        .then(response => {
            let mimetype="image/jpeg";
            let base64 = Buffer.from(response.data, 'binary').toString('base64');
            let imageBase64 = "data:"+mimetype+";base64,"+base64;
            resolve(base64);
        })
        .catch(error => {
            resolve(error)
        });
    });
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})