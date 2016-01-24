(function(angular) {
    'use strict';

    function BoxCtrl(VoiceRecog, GeolocationService, WeatherService, MapService, HueService, $scope, $timeout, $interval) {
        var _this = this;
        var DEFAULT_COMMAND_TEXT = 'Say "What can I say?" to see a list of commands...';
        $scope.listening = false;
        $scope.debug = false;
        $scope.complement = "안녕, WSU!";
        $scope.focus = "Default";
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
        };

        _this.init = function() {
            var tick = $interval(updateTime, 1000);
            updateTime();
            $scope.map = MapService.generateMap("Seoul");
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
            });

            //Initiate Hue communication

            var defaultView = function() {
                console.debug("Ok, going to default view...");
                $scope.focus = "default";
            };

            // List commands
            VoiceRecog.addCommand('안녕', function() {
                console.debug("내가 아는 말들");
                console.log(VoiceRecog.commands);
                $scope.focus = "commands";
            });

            // Go back to default view
            VoiceRecog.addCommand('취소', defaultView);

            // Hide everything and "sleep"
            VoiceRecog.addCommand('자러가', function() {
                console.debug("응 자러갈게...");
                $scope.focus = "sleep";
            });

            // Go back to default view
            VoiceRecog.addCommand('일어나', defaultView);

            // Hide everything and "sleep"
            VoiceRecog.addCommand('Show debug information', function() {
                console.debug("Boop Boop. Showing debug info...");
                $scope.debug = true;
            });

            // Hide everything and "sleep"
            VoiceRecog.addCommand('지도', function() {
                console.debug("어디로 갈레?");
                $scope.focus = "map";
            });

            // Hide everything and "sleep"
            VoiceRecog.addCommand('지도 *location', function(location) {
                console.debug("지도 가져오는중..", location);
                $scope.map = MapService.generateMap(location);
                $scope.focus = "map";
            });

            // Zoom in map
            VoiceRecog.addCommand('확대', function() {
                console.debug("확대!!!");
                $scope.map = MapService.zoomIn();
            });

            VoiceRecog.addCommand('축소', function() {
                console.debug("축소!!!");
                $scope.map = MapService.zoomOut();
            });

            VoiceRecog.addCommand('확대 *value', function(value) {
                console.debug("확대!!!", value);
                $scope.map = MapService.zoomTo(value);
            });

            VoiceRecog.addCommand('확대 취소', function() {
                console.debug("확대취소!!!");
                $scope.map = MapService.reset();
                $scope.focus = "map";
            });

            // Search images
            VoiceRecog.addCommand('보여줘 *term', function(term) {
                console.debug("보여줄게", term);
            });

            // Change name
            VoiceRecog.addCommand('내이름은 *name', function(name) {
                console.debug("안녕", name, "! 반가워");
                $scope.user.name = name;
            });

            // Set a reminder
            VoiceRecog.addCommand('알려줘 *task', function(task) {
                console.debug("알림 저장중..", task);
            });

            // Clear reminders
            VoiceRecog.addCommand('알림 정리', function() {
                console.debug("알림 정리중..");
            });

            // Clear log of commands
            VoiceRecog.addCommand('결과 정리', function(task) {
                 console.debug("결과 정리중..");
                 _this.clearResults();
            });

            // Check the time
            VoiceRecog.addCommand('몇시야', function(task) {
                 console.debug("지금은", moment().format('h:mm:ss a'));
                 _this.clearResults();
            });



            // Fallback for all commands
            VoiceRecog.addCommand('*allSpeech', function(allSpeech) {
                console.debug(allSpeech);
                _this.addResult(allSpeech);
            });

            var resetCommandTimeout;
            //Track when the Annyang is listening to us
            VoiceRecog.start(function(listening){
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

    angular.module('SoundBox')
        .controller('BoxCtrl', BoxCtrl);

}(window.angular));
