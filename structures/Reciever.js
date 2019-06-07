const EventEmitter = require('events'),
    Cryptography = require('../Utils/Cryptography');
module.exports = class Reciever extends EventEmitter {
    constructor(websocket, decryptionKey) {
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
            '11': 'dataDebug',
            '12': 'requestData'
        }
        this.decryption = decryptionKey;
        
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
                data[1] = Cryptography.decrypt(this.decryption, data[1])
            } catch(e) { throw new Error("Bad Password")}
        }
        let contents;
        try {
            contents = JSON.parse(data[1]);
        } catch (e) { return }
        
        if(contents.toString().length + code.toString().length > 200) return;
        contents.ip = ws.remoteAddress
        this.emit('debug', this.codes[code], contents);
        
        this.emit(this.codes[code], contents);
    }
}