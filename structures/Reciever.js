const EventEmitter = require('events'),
    crypto = require('crypto');
module.exports = class Reciever extends EventEmitter {
    constructor(websocket, debug, decryption) {
        super();
        this.codes = {
            '01': 'connectionSuccessful',
            '02': 'connectionRefused',
            '03': 'requestSuccessful',
            '04': 'requestRefused',
            '05': 'responseSuccess',
            '06': 'responseRefused',
            '07': 'loginSuccessful',
            '08': 'loginRequest',
            '09': 'dataMessage',
            '10': 'dataInfo',
            '11': 'dataDebug'
        }
        this.decryption = decryption;
        this.debug = debug;
        
        websocket.on('message', (data) => {
            this.parse(data.utf8Data, websocket);
        });
        
        websocket.on('close', () => {     
            this.parse(`02 {}`, websocket)
        })
    }

    parse(data, ws) {
        data = data.split(' ');
        let code = data[0];
        if(code != '02') {
            try {
                let decipher = crypto.createDecipheriv("aes-192-cbc", this.decryption.hash, this.decryption.iv)
                let decrypted = decipher.update(data[1], 'hex', 'utf8');
                decrypted += decipher.final('utf8')
                data[1] = decrypted;
            } catch(e) { throw new Error("Bad password") }
        }
        
        let contents = JSON.parse(data[1]);
        
        if(contents.toString().length + code.toString().length > 200) return;
        contents.ip = ws.remoteAddress
        if(this.debug) console.log(this.codes[code], contents);
        
        this.emit(this.codes[code], contents);
    }
}