var app = angular.module('app', ['ui.router', 'ngAnimate', 'ngSanitize', 'appComponents', 'appControllers', 'appServices']);

app.config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/home');


        // An array of state definitions
        var states = [
            {
                name: 'home',
                url: '/home',
                component: 'home'
            },
            {
                name: 'home.aboutus',
                url: '^/aboutus',
                component: 'aboutus'
            },
            {
                name: 'home.whatwedo',
                url: '^/whatwedo',
                templateUrl: 'partials/whatwedo.html'
            }
        ];

        states.forEach((state) => {
            $stateProvider.state(state);
        });
    }
]);