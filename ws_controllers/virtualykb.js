const kintone = require('kintone-nodejs-sdk');
const APIToken = 'rpqZfLqXvoPLq4ecTePoNhD74p64myQGSwK9iXiH'; // your API Token
const myDomainName = 'taptappun.cybozu.com';
const kintoneAuth = new kintone.Auth();
kintoneAuth.setApiToken(APIToken);
const kintoneConnection = new kintone.Connection(myDomainName, kintoneAuth);

module.exports = {
  message: function (wss, ws, connections, message) {
    let kintoneRecord = new kintone.Record(kintoneConnection);
    kintoneRecord.addRecord(6, {
      message: {
        value: message,
      }
    });
    ws.send(message);
  },
  close: function (wss, ws, connections) {}
}