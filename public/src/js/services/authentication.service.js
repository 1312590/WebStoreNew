/**
 * Created by Stupig on 1/6/2017.
 */
appServices.factory('authenticationService', ['validateService', '$http', '$window',
    function (validateService, $http, $window) {
        var service = {
            saveToken: function (token){
                $window.localStorage['currentUserToken'] = token;
            },

            getToken: function(token){
                return $window.localStorage['currentUserToken'];
            },

            isLoggedIn: function(){
                var token = this.getToken();
                var payload;

                if (token) {
                    payload = token.split('.')[1];
                    payload = $window.atob(payload);
                    payload = JSON.parse(payload);

                    return payload.exp > Date.now() / 1000;
                }
                return false;

            },

            logout: function(){
                $window.localStorage.removeItem('currentUserToken');
            },

            currentUser: function(){
                if (this.isLoggedIn()) {
                    var token = this.getToken();
                    var payload = token.split('.')[1];
                    payload = $window.atob(payload);
                    payload = JSON.parse(payload);
                    return {
                        email: payload.email,
                        username: payload.username
                    };
                }
            },

            register: function(user, callback) {
                var promise = new Promise((fulfill, reject) => {
                    $.ajax({
                        url: '/api/authentication/register',
                        method: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify(user),
                        success: fulfill,
                        error: reject
                    });
                });

                promise
                    .then((response) => {
                        this.saveToken(response.token);
                        callback(null, response.data);
                    })
                    .catch((xhr, textStatus, errorThrown) => callback(xhr));
            },

            login: function (user, callback) {
                var promise = new Promise((fulfill, reject) => {
                    $.ajax({
                        url: '/api/authentication/login',
                        method: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify(user),
                        success: fulfill,
                        error: reject
                    });
                });

                promise
                    .then((response) => {
                        this.saveToken(response.token);
                        callback(null, response.data);
                    })
                    .catch((xhr, textStatus, errorThrown) => callback(xhr));
            }
        };

        return service;
    }
]);