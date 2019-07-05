//作成したjsonファイルをPOSTする

const express = require('express');
const bodyParser = require('body-parser');

//url
//var baseUrl = "http://musttime.php.xdomain.jp/";

var data = {
    "0000000001" : "28",
    "0000000002": "30",
    "0000000003":"84"
}

const app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.listen(3000);

app.post('/', function (req, res) {    
    res.header('Content-Type', 'text/plain;charset=utf-8');
    res.send(data[req.body["ID"]]);
});
