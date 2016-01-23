/*Electron*/
var app = require('app');  // 어플기반 조작 모듈
var BrowserWindow = require('browser-window');  // 네이티브 브라우저 창을 만드는 모듈


//컴퓨터 슬립 방지
var powerSaveBlocker = require('electron').powerSaveBlocker;
var id = powerSaveBlocker.start('prevent-display-sleep');
console.log(powerSaveBlocker.isStarted(id));
var util = require('util');

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

  // 가능하다면 두번째 디스플레이를 앱에 put시킨다.
  var atomScreen = require('screen');
  var displays = atomScreen.getAllDisplays();
  var externalDisplay = null;
  for (var i in displays) {
    if (displays[i].bounds.x > 0 || displays[i].bounds.y > 0) {
      externalDisplay = displays[i];
      break;
    }
  }

  //브라우저 옵션설정
  var browserWindowOptions = {width: 800, height: 600,  kiosk:true, autoHideMenuBar:true, darkTheme:true};
  if (externalDisplay) {
    browserWindowOptions.x = externalDisplay.bounds.x + 50;
    browserWindowOptions.y = externalDisplay.bounds.y + 50;
  }

  // 옵션을 이용해 새로운 브라우저 창을 생성
  mainWindow = new BrowserWindow(browserWindowOptions);

  // 그리고 현지 디렉터리의 index.html 을 로드.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // 개발자 콘솔을 염.
  //mainWindow.webContents.openDevTools();

  // 창이 닫히면 호출됨
  mainWindow.on('closed', function() {
    // 윈도우 객채의 참조를 삭제 보통 멀티 윈도우 지원을 위해
    // 윈도우 객체를 배열에 저장하는 경우가 있는데 이 경우
    // 해당하는 모든 윈도우 객체의 참조를 삭제해 주어야 함.
    mainWindow = null;
  });
});
