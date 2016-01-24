(function(angular) {
    'use strict';


    function MirrorCtrl(AnnyangService, GeolocationService, WeatherService, MapService,$scope, $timeout, $interval) {
        var _this = this;
        var DEFAULT_COMMAND_TEXT = ' "안녕" 이라고 말하면 명령어의 목록이나옵니다.';
        $scope.listening = false;
        $scope.debug = false;
        $scope.complement = "반가워, WSU!"


        $scope.focus = "대기";
        $scope.user = {};
        $scope.interimResult = DEFAULT_COMMAND_TEXT;

        $scope.colors=["#6ed3cf", "#9068be", "#e1e8f0", "#e62739"];

        //Update the time
        function updateTime(){
            $scope.date = new Date();
        }


        // Reset the command text
        var restCommand = function(){
          $scope.interimResult = DEFAULT_COMMAND_TEXT;
        }

        _this.init = function() {
            var tick = $interval(updateTime, 1000);
            updateTime();
            $scope.map = MapService.generateMap("서울");
            _this.clearResults();
            restCommand();

            //Get our location and then get the weather for our location
            GeolocationService.getLocation().then(function(geoposition){
                console.log("Geoposition", geoposition);
                WeatherService.init(geoposition).then(function(){
                    $scope.currentForcast = WeatherService.currentForcast();
                    $scope.weeklyForcast = WeatherService.weeklyForcast();
                    console.log("Current", $scope.currentForcast);
                    console.log("Weekly", $scope.weeklyForcast);
                    //refresh the weather every hour
                    //this doesn't acutually updat the UI yet
                    //$timeout(WeatherService.refreshWeather, 3600000);
                });
            })


            var defaultView = function() {
                console.debug("Ok, going to default view...");
                $scope.focus = "default";
            }

            // List commands
            AnnyangService.addCommand('안녕', function() {
                console.debug("명령어 목록들...");
                console.log(AnnyangService.commands);
                $scope.focus = "commands";

            });

            // 노래 컨트롤

            var craudio = new Audio('musisc/틈.mp3');
            AnnyangService.addCommand('노래 시작', function() {
                console.debug("노래재생");
                console.log(AnnyangService.commands);
                myaudio.play();
            });

            AnnyangService.addCommand('노래 *audioname', function(audioname) {
                console.debug("노래를 찾아 재생합니다..", audioname);
                craudio.pause();
                craudio = new Audio('musics/'+audioname+'.mp3');
                craudio.play();
            });


            AnnyangService.addCommand('정지', function() {
                console.debug("노래정지");
                console.log(AnnyangService.commands);
                craudio.pause();
            });

            AnnyangService.addCommand('소리 크게', function() {
                console.debug("소리를 크게합니다");
                console.log(AnnyangService.commands);
                craudio.volume += 0.4;
            });

            AnnyangService.addCommand('소리 작게', function() {
                console.debug("소리를 작게합니다");
                console.log(AnnyangService.commands);
                craudio.volume -= 0.4;
            });





            // Go back to default view
            AnnyangService.addCommand('돌아가', defaultView);

            // Hide everything and "sleep"
            AnnyangService.addCommand('끄기', function() {
                console.debug("다음에 또 봐요!");
                $scope.focus = "sleep";
            });

            // Go back to default view
            AnnyangService.addCommand('시작', defaultView);

            // Hide everything and "sleep"
            AnnyangService.addCommand('Show debug information', function() {
                console.debug("Boop Boop. Showing debug info...");
                $scope.debug = true;
            });

            // Hide everything and "sleep"
            AnnyangService.addCommand('지도', function() {
                console.debug("Going on an adventure?");
                $scope.focus = "map";


            });

            // Hide everything and "sleep"
            AnnyangService.addCommand('지도 *location', function(location) {
                console.debug("지도를 가져옵니다.", location);
                $scope.map = MapService.generateMap(location);
                $scope.focus = "map";
            });

            // Zoom in map
            AnnyangService.addCommand('확대', function() {
                console.debug("Zoooooooom!!!");
                $scope.map = MapService.zoomIn();
            });

            AnnyangService.addCommand('축소', function() {
                console.debug("Moooooooooz!!!");
                $scope.map = MapService.zoomOut();
            });

            AnnyangService.addCommand('확대 *value', function(value) {
                console.debug("Moooop!!!", value);
                $scope.map = MapService.zoomTo(value);
            });

            AnnyangService.addCommand('확대 리셋', function() {
                console.debug("Zoooommmmmzzz00000!!!");
                $scope.map = MapService.reset();
                $scope.focus = "map";
            });

            // Search images
            AnnyangService.addCommand('찾기 *term', function(term) {
                var url = 'http://api.flickr.com/services/rest/?tags='+term;
                console.debug("Showing", term);
            });

            // Change name
            AnnyangService.addCommand('내 이름은 *name', function(name) {
                console.debug("안녕", name, "반가워");
                $scope.user.name = name;
            });




            // Check the time
            AnnyangService.addCommand('지금 몇 시야', function(task) {
                 console.debug("현재시각 : ", moment().format('h:mm:ss a'));
                 _this.clearResults();
            });



            // Fallback for all commands
            AnnyangService.addCommand('*allSpeech', function(allSpeech) {
                console.debug(allSpeech);
                _this.addResult(allSpeech);
            });

            var resetCommandTimeout;
            //Track when the Annyang is listening to us
            AnnyangService.start(function(listening){
                $scope.listening = listening;
            }, function(interimResult){
                $scope.interimResult = interimResult;
                $timeout.cancel(resetCommandTimeout);
            }, function(result){
                $scope.interimResult = result[0];
                resetCommandTimeout = $timeout(restCommand, 5000);
            });
        };

        _this.addResult = function(result) {
            _this.results.push({
                content: result,
                date: new Date()
            });
        };

        _this.clearResults = function() {
            _this.results = [];
        };

        _this.init();
    }

    angular.module('SmartMirror')
        .controller('MirrorCtrl', MirrorCtrl);

}(window.angular));
