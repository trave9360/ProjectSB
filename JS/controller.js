(function(angular) {
    'use strict';

    function MirrorCtrl(VoiceRecog, GeolocationService, WeatherService, MapService, HueService, $scope, $timeout, $interval) {
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
            VoiceRecog.addCommand('What can I say', function() {
                console.debug("Here is a list of commands...");
                console.log(VoiceRecog.commands);
                $scope.focus = "commands";
            });

            // Go back to default view
            VoiceRecog.addCommand('Go home', defaultView);

            // Hide everything and "sleep"
            VoiceRecog.addCommand('Go to sleep', function() {
                console.debug("Ok, going to sleep...");
                $scope.focus = "sleep";
            });

            // Go back to default view
            VoiceRecog.addCommand('Wake up', defaultView);

            // Hide everything and "sleep"
            VoiceRecog.addCommand('Show debug information', function() {
                console.debug("Boop Boop. Showing debug info...");
                $scope.debug = true;
            });

            // Hide everything and "sleep"
            VoiceRecog.addCommand('Show map', function() {
                console.debug("Going on an adventure?");
                $scope.focus = "map";
            });

            // Hide everything and "sleep"
            VoiceRecog.addCommand('Show (me a) map of *location', function(location) {
                console.debug("Getting map of", location);
                $scope.map = MapService.generateMap(location);
                $scope.focus = "map";
            });

            // Zoom in map
            VoiceRecog.addCommand('(map) zoom in', function() {
                console.debug("Zoooooooom!!!");
                $scope.map = MapService.zoomIn();
            });

            VoiceRecog.addCommand('(map) zoom out', function() {
                console.debug("Moooooooooz!!!");
                $scope.map = MapService.zoomOut();
            });

            VoiceRecog.addCommand('(map) zoom (to) *value', function(value) {
                console.debug("Moooop!!!", value);
                $scope.map = MapService.zoomTo(value);
            });

            VoiceRecog.addCommand('(map) reset zoom', function() {
                console.debug("Zoooommmmmzzz00000!!!");
                $scope.map = MapService.reset();
                $scope.focus = "map";
            });

            // Search images
            VoiceRecog.addCommand('Show me *term', function(term) {
                console.debug("Showing", term);
            });

            // Change name
            VoiceRecog.addCommand('My (name is)(name\'s) *name', function(name) {
                console.debug("Hi", name, "nice to meet you");
                $scope.user.name = name;
            });

            // Set a reminder
            VoiceRecog.addCommand('Remind me to *task', function(task) {
                console.debug("I'll remind you to", task);
            });

            // Clear reminders
            VoiceRecog.addCommand('Clear reminders', function() {
                console.debug("Clearing reminders");
            });

            // Clear log of commands
            VoiceRecog.addCommand('Clear results', function(task) {
                 console.debug("Clearing results");
                 _this.clearResults();
            });

            // Check the time
            VoiceRecog.addCommand('what time is it', function(task) {
                 console.debug("It is", moment().format('h:mm:ss a'));
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
        .controller('MirrorCtrl', MirrorCtrl);

}(window.angular));