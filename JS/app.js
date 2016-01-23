/*NodeMon*/
var express = require('express');
var path = require('path');
//var app = express();


/*Electron*/
var app = require('app');  // 어플기반 조작 모듈
var BrowserWindow = electron.BrowserWindow;  // 네이티브 브라우저 창을 만드는 모듈

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// 모든 창이 닫히면 어플 종료
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// 이 메서드는 일렉트론의 초기화가 모두 끝나고
// 브라우저 창을 열 준비가 되었을 때 호출
app.on('ready', function() {
  // 새로운 브라우저 창을 생성
  mainWindow = new BrowserWindow({width: 800, height: 600});

  // 그리고 현지 디렉터리의 index.html 을 로드.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // 개발자 콘솔을 염.
  mainWindow.webContents.openDevTools();

  // 창이 닫히면 호출됨
  mainWindow.on('closed', function() {
    // 윈도우 객채의 참조를 삭제 보통 멀티 윈도우 지원을 위해
    // 윈도우 객체를 배열에 저장하는 경우가 있는데 이 경우
    // 해당하는 모든 윈도우 객체의 참조를 삭제해 주어야 함.
    mainWindow = null;
  });
});


app.use( express.static( path.join( __dirname,"/public" ) ) );


app.get('/',function (req,res){
  res.send('Server is Started!');
});



app.listen(3000,function(){
  console.log('server on!');
});
