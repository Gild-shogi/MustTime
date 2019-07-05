//WxBeaconから気温を取得するプログラム

var noble = require('noble');

var WX_SERVICE_UIID = '0c4c3000770046f4aa96d5e974e32a54';
var WX2_NOWDATA_UUID = '0c4c3001770046f4aa96d5e974e32a54';

noble.on('stateChange',function(state){
    console.log('on -> stateChange:' + state);

    if (state === 'poweredOn'){
        noble.startScanning();
    }else{
        noble.stopScanning();
    }
});

noble.on('scanStart',function(){
    console.log('on -> scanstart!');
});
noble.on('scanStop',function(){
    console.log('on ->scanStop');
});

noble.on('discover',function(peripheral){
    console.log('on -> discover:' + peripheral.advertisement.localName);

    if(peripheral.advertisement.localName == 'Env')
    {
        console.log(peripheral.address);
        noble.stopScanning();

    peripheral.on('connect',function(){
        console.log('on -> connect');
        this.discoverServices();
    });

    peripheral.on('disconnect',function(){
        console.log('on -> disconnect');
        process.exit();    
    });

    peripheral.on('servicesDiscover',function(service){
        for(var i = 0;i < service.length;i++){
            if(services[i]['uuid'] == WX_SERVICE_UIID){
                services[i].on('characteristicsDiscover',function(includeServiceUuids){
                    this.discoverCharacteristics();
                });

                services[i].on('characteristicsDiscover',function(characteristics){
                    for(var j = 0; j < characteristics.length; j++){
                        if(characteristics[j].uuid == WX2_NOWDATA_UUID)
                        {
                            var WX2_NOWDATA = characteristics[j];
                            WX2_NOWDATA.read(function(error, data) {
                                if (data) {
                                    // console.log(data);

                                    // 温度
                                    var temp = ((data[2] & 0xff) << 8) + (data[1] & 0xff);
                                    temp = temp * 0.01;
                                    
                                    // 湿度
                                    var hum = ((data[4] & 0xff) << 8) + (data[3] & 0xff);
                                    hum = hum * 0.01;
                                    
                                    // 照度
                                    var lum = ((data[6] & 0xff) << 8) + (data[5] & 0xff);
                                    
                                    // UVインデックス
                                    var uv = ((data[8] & 0xff) << 8) + (data[7] & 0xff);
                                    uv = uv * 0.01;

                                    // 気圧
                                    var atom = ((data[10] & 0xff) << 8) + (data[9] & 0xff);
                                    atom = atom * 0.1;

                                    // 騒音
                                    var noise = ((data[12] & 0xff) << 8) + (data[11] & 0xff);
                                    noise = noise * 0.01;
                                    
                                    // 不快指数
                                    var disco = ((data[14] & 0xff) << 8) + (data[13] & 0xff);
                                    disco = disco * 0.01;
                                    
                                    // 熱中症危険度
                                    var heat = ((data[16] & 0xff) << 8) + (data[15] & 0xff);
                                    heat = heat * 0.01;
                                    
                                    // バッテリー電圧
                                    var batt = ((data[18] & 0xff) << 8) + (data[17] & 0xff);
                                    batt = batt * 0.001;

                                    console.log('No=' + data[0]);
                                    console.log('Temp=' + temp + ' ℃');
                                    console.log('Humidity=' + hum + ' %') 
                                    console.log('Luminosity=' + lum + ' lx');
                                    console.log('UV Index=' + uv);
                                    console.log('Atom=' + atom + ' hPa');
                                    console.log('Noise=' + noise + ' dB');
                                    console.log('Discomfort index=' + disco);
                                    console.log('Heat=' + heat + ' ℃');
                                    console.log('Battery=' + batt + ' mv');
                                }
                                peripheral.disconnect();
                        });

                    }
                }
            });

            service[i].discoverIncludedServices();
        }
    }

    });
    peripheral.connect();
    }
});


//作成したjsonファイルをPOSTする

const express = require('express');
const bodyParser = require('body-parser');
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




disco = 85
if(disco<55){
    var msg = ("寒くありませんか？暖かい恰好で寝ましょう。ゆたんぽを使うのもおすすめです<br>")+'ただ今室内は'+temp+'℃です';
}else if(disco < 60 && disco >= 55){
    var msg = ("少し肌寒いかもしれません温かいものを飲んで寝ましょう<br>")+'ただ今室内は'+temp+'℃です';
}else if(disco < 65 && disco >= 60){
    var msg = ("人によっては少し肌寒いかもしれません。寒くない格好で寝ましょう<br>")+'ただ今室内は'+temp+'℃です';
}else if(disco < 70 && disco >= 65){
    var msg = ("眠りやすい快適な温度です。ぐっすり寝てくださいね<br>")+'ただ今室内は'+temp+'℃です';
}else if(disco < 75 && disco >= 70){
    var msg = ("いつもより眠りやすいと思います。ゆっくりお休みください<br>")+'ただ今室内は'+temp+'℃です';
}else if(disco < 80 && disco >= 75){
    var msg = ("やや暑いですね。扇風機をつけて寝ましょう。タイマー付けるのもお忘れなく！<br>")+'ただ今室内は'+temp+'℃です';
}else if(disco < 85 && disco >= 80){
    var msg = ("少し暑いです。涼しい格好をして窓を開けて寝ましょう。扇風機つけても暑いならエアコンつけてもいいかも<br>")+'ただ今室内は'+temp+'℃です';
}else if(disco>= 85){
    var msg = ("かなり暑いです。熱中症に気を付けて！エアコンをつけたほうがいいかも<br>")+'ただ今室内は'+temp+'℃です';
}
app.get('/',(req,res)=>{
    res.render(msg)
})

app.listen(8000,() => {
    console.log('Start Server port:8000')
})