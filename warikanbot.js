// @ts-nocheck
function doPost(e) {
  var replyToken= JSON.parse(e.postData.contents).events[0].replyToken;
  var postedMsg = JSON.parse(e.postData.contents).events[0].message.text;
  if (typeof replyToken === 'undefined') {
    return;
  }

  var url = 'https://api.line.me/v2/bot/message/reply';

  var channelToken = 'チャンネルトークンを持ってくる';
  
//var msg = postMsg.split(' ')

postMsg = postedMsg.split(/[ 　]/);

//ここに足していく
if (postMsg[0] != '¥' && postMsg[0] != '$'){
  return;
}

//スプレッドシート、シート名を定義
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  //console.log(ss.getName());
  const sheet = SpreadsheetApp.getActiveSheet();
  //console.log(sheet.getName());

  const lastRow = sheet.getLastRow();

  const name_lender = postMsg[1];
  const name_borrower = postMsg[2];
  if (name_lender == name_borrower){
    return;
  }

  //モードによらず実行される-----
  nameList = ['']
  for (let i = 2; i <= lastRow; i++){
    var range = sheet.getRange(i, 1);
    nameList.push(range.getValue())
  }

  var columnIndex = nameList.indexOf(name_lender) + 1;
  var rawIndex = nameList.indexOf(name_borrower) + 1;
  var outRange = sheet.getRange(columnIndex, rawIndex);
  //console.log(rawIndex, columnIndex);

  //出力セルの値
  var out = outRange.getValue();
  //ここまで-----------------

  function memorize(name1, name2, price){
    var columnIndex = nameList.indexOf(name1) + 1;
    var rawIndex = nameList.indexOf(name2) + 1;
    var range1 = sheet.getRange(columnIndex, rawIndex);
    var range2 = sheet.getRange(rawIndex, columnIndex);
    range1.setValue(range1.getValue() + price);
    range2.setValue(range2.getValue() - price);
    return;
  }

  //モードによって異なる処理
  //0:確認 1:割り勘 2:個人貸付記録
  if (postMsg.length == 3 && nameList.indexOf(postedMsg[3]) == -1){
  var mode = 0;
  } else if (postMsg.length == 3){
    mode = 1
  }else if (postMsg.length == 4){
  var mode = 2;
  } else{
  return;
  }

  if (mode == 2){
    var price = +postMsg[3];
    var replyText = price;
  }

  //0:貸し借りを出力する
  if (mode == 0){
    var replyText = out;
  }

  //1:割り勘の記録
  if (mode == 1){
    
  }


  //2:金額を更新する
  if (mode == 2){
    var range1 = outRange;
    var range2 = sheet.getRange(rawIndex, columnIndex);
    var out2 = range2.getValue();
    range1.setValue(out + price);
    range2.setValue(out2 - price);
    return;
  }

//ここまで


var messages = [{
    'type': 'text',
    'text': replyText,
  }];

  UrlFetchApp.fetch(url, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + channelToken,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': replyToken,
      'messages': messages,
    }),
  });
  return ContentService.createTextOutput(JSON.stringify({'content': 'post ok'})).setMimeType(ContentService.MimeType.JSON);
}
