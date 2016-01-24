
var myaudio = new Audio('musics/틈.mp3');


    function AudioCtrl(audioname,isplay)
    {
      var craudio = new Audio('musics/'+audname+'.mp3');
      if(isplay === 1)
      {
        crauido.play();
      }else {
        crauido.pause();
      }

    }


    function SoundService($http) {
        var service = {};
        angular.module('SmartMirror')
            .factory('SoundService', SoundService);
    }
