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

app.get('/random', (req, res) => {
    random()
    .then(response=>{
        const buff = Buffer.from(response.caption, 'utf-8');
        const captionBase64 = buff.toString('base64');
        makeMeme(response.episode, response.timeStamp, captionBase64)
        .then(meme=>{
            console.log("y")
            res.send(meme);
        })
        .catch(error=>{
            console.log("n")
            res.status(500).send(error);
        })
    })
    .catch(error=>{
        console.log(error)
        res.status(500).send(error);
    })
});

function query(query){
    return new Promise( (resolver, reject) =>{
        let url = 'https://frinkiac.com/api/search?q='+query;
        axios.get(url)
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
}

function random(){
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

function getCaption(episode,timestamp){
    let url = 'https://frinkiac.com/api/caption?e='+episode+'&t='+timestamp;
    axios.get(url)
    .then(response => {
      console.log(response.data.Subtitles[0].Content);
    })
    .catch(error => {
      console.log(error);
    });
}

function makeMeme(episode,timestamp,captionInBase64){
    return new Promise( (resolve, reject) =>{
        let url = 'https://frinkiac.com/meme/'+episode+'/'+timestamp+'/m/'+captionInBase64;
        axios.get(url, {
            responseType: 'arraybuffer'
        })
        .then(response => {
            const buffer = Buffer.from(response.data, 'base64');
            resolve(buffer)
        })
        .catch(error => {
            resolve(error)
          console.log(error);
        });
    });
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})