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
var appComponents = angular.module("appComponents",['appControllers']);
var appControllers = angular.module("appControllers",[]);
var appServices = angular.module("appServices", []);
appComponents.component('aboutus', {
	templateUrl: '../partials/aboutus.html',
	controller: 'aboutusCtrl'
});
appComponents.component('home', {
	templateUrl: '../partials/home.html',
	controller: 'homeCtrl'
});
appControllers.controller('aboutusCtrl', ['$scope', '$state',
	function($scope, $state) {

		$scope.AlienZone = "WE ARE A VIDEO PRODUCTION COMPANY FOUNDED TO PROVIDE CLIENTS WITH WORLD-CLASS PRODUCTION SERVICES AT HIGH STANDARDS. OUR PRODUCTS HAVE BEEN HIGHLY EVALUATED BY CLIENTS, AUDIENCES AND EXPERTS. THE EXPERIENCED ALIEN MEDIA TEAM APPROACHES EACH PROJECT WITH A CUSTOM-BUILT AND OPTIMIZED PRODUCTION. WE’D LOVE THE OPPORTUNITY TO TAKE ON YOUR PROJECT’S UNIQUE CHALLENGES!";
	}
        
]); 
appControllers.controller('homeCtrl', ['$scope', '$state',
	function($scope, $state) {

	}
        
]);
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
appServices.factory('bookingService', ['validateService',
	function(validateService) {

		var reviewingBookingId = null;
		var config = {
			roundTrip: true,
			promotion: null,
			passengers: {
				adultsCount: 1,
				childrenCount: 0,
				infantsCount: 0,
				adults: [{
								title: null,
								firstName: null,
								lastName: null,
								dateOfBirth: null
							}],
				children: [],
				infants: []
			},
			contact: {
				title: null,
				firstName: null,
				lastName: null,
				email: null,
				telephone: null,
				address: null,
				region: null,
				note: null
			},
			forwardRoute: {
				flight: null,
				class: null
			},
			returnRoute: {
				flight: null,
				class: null
			},
			totalPrice: 0
		};

		//--------------------------------------------------------------------
		var reallocatePassengers = function(passengers, realLength) {

			if (passengers.length < realLength) {

				var itemCount = realLength - passengers.length;
				for(let i = 0; i < itemCount; ++i) {
					passengers.push({
						title: null,
						firstName: null,
						lastName: null,
						dateOfBirth: null
					});
				}
	
			} else if (passengers.length > realLength)
				passengers.slice(0, realLength);
		};

		var evaluatePrice = function(route) {
			if (!route || !route.flight || !route.class) return 0;

			var seatConfig = route.flight.seats.find((s) => s._class === route.class._id),
				price = seatConfig.price;

			var passengers = config.passengers,
				passengersFactor = passengers.adultsCount + passengers.childrenCount*0.75;
		
			return price * passengersFactor;
		};

		//--------------------------------------------------------------------
		var service = {
			getConfig: function() {
				return config;
			},
			//======================================================
			revaluatePrice: function() {
				var forwardPrice = evaluatePrice(config.forwardRoute),
					returnPrice = evaluatePrice(config.returnRoute);

				config.totalPrice = forwardPrice + returnPrice;
			},
			//======================================================
			setBasicConfig: function(cfg) {
				config.roundTrip = cfg.roundTrip;
				config.promotion = cfg.promotion;

				if (cfg.passengers) {
					config.passengers.adultsCount = cfg.passengers.adultsCount || 1;
					config.passengers.childrenCount = cfg.passengers.childrenCount || 0;
					config.passengers.infantsCount = cfg.passengers.infantsCount || 0;

					reallocatePassengers(config.passengers.adults, config.passengers.adultsCount);
					reallocatePassengers(config.passengers.children, config.passengers.childrenCount);
					reallocatePassengers(config.passengers.infants, config.passengers.infantsCount);
				}
			},
			//======================================================
			setForwardRoute: function(route) {
				if (route) {

					config.forwardRoute.flight = route.flight || null;
					config.forwardRoute.class = route.class || null;

					this.revaluatePrice();
				}
			},
			setReturnRoute: function(route) {
				if (route) {

					config.returnRoute.flight = route.flight || null;
					config.returnRoute.class = route.class || null;

					this.revaluatePrice();
				}
			},
			//======================================================
			updatePassengers: function(newPassengers) {
				for (let i = 0; i < newPassengers.adults.length; ++i) {
					config.passengers.adults[i] = {
						title: newPassengers.adults[i].title,
						firstName: newPassengers.adults[i].firstName,
						lastName: newPassengers.adults[i].lastName,
						dateOfBirth: new Date(newPassengers.adults[i].dateOfBirth.getTime())
					};
				}
				for (let i = 0; i < newPassengers.children.length; ++i) {
					config.passengers.children[i] = {
						title: newPassengers.children[i].title,
						firstName: newPassengers.children[i].firstName,
						lastName: newPassengers.children[i].lastName,
						dateOfBirth: new Date(newPassengers.children[i].dateOfBirth.getTime())
					};
				}
				for (let i = 0; i < newPassengers.infants.length; ++i) {
					config.passengers.infants[i] = {
						title: newPassengers.infants[i].title,
						firstName: newPassengers.infants[i].firstName,
						lastName: newPassengers.infants[i].lastName,
						dateOfBirth: new Date(newPassengers.infants [i].dateOfBirth.getTime())
					};
				}
			},
			updateContact: function(newContact) {
				config.contact.title = newContact.title || null;
				config.contact.firstName = newContact.firstName || null;
				config.contact.lastName = newContact.lastName || null;
				config.contact.email = newContact.email || null;
				config.contact.telephone = newContact.telephone || null;
				config.contact.address = newContact.address || null;
				config.contact.region = newContact.region || null;
				config.contact.note = newContact.note || null;
			},
			//======================================================
			getReviewId: function() { return reviewingBookingId; },
			setReviewId: function(rv) { reviewingBookingId = rv; },
			getBooking: function(id, callback) {

				reviewingBookingId = id;

				var promise = new Promise((fulfill, reject) => {
					$.ajax({
						url: '/api/bookings/' + reviewingBookingId,
						method: 'GET',
						success: fulfill,
						error: reject
					});
				});

				promise
					.then((response) => callback(null, response.result))
					.catch((xhr, textStatus, errorThrown) => callback(xhr));
			},
			//======================================================
			makeBooking: function(callback) {

				var requestBody = {};

				if (!validateService.validateContact(config.contact)) return callback('Invalid contact info');
				else requestBody.contact = config.contact;

				if (!validateService.validatePassengers(config.passengers)) return callback('Invalid passengers info');
				else requestBody.passengers = {
					adults: config.passengers.adults,
					children: config.passengers.children,
					infants: config.passengers.infants
				};

				if (!validateService.validateBookingRoute(config.forwardRoute)) return callback('Invalid forward route');
				else requestBody.forwardRoute = {
					_flight: config.forwardRoute.flight._id,
					_class: config.forwardRoute.class._id
				};

				if (config.roundTrip) {
					if (validateService.validateBookingRoute(config.returnRoute))
						requestBody.returnRoute = {
							_flight: config.returnRoute.flight._id,
							_class: config.returnRoute.class._id
						};
				}
				console.log(requestBody);
				var promise = new Promise((fulfill, reject) => {
					$.ajax({
						url: '/api/bookings',
						method: 'POST',
						contentType: 'application/json',
						data: JSON.stringify(requestBody),
						success: fulfill,
						error: reject
					});
				});

				promise
					.then((response) => callback(null, response.result))
					.catch((xhr, textStatus, errorThrown) => callback(xhr));
			}
		};

		return service;
	}
]);
appServices.factory('flightsService', [
	function() {

		var query = {
			roundTrip: true,
			origin: null,
			destination: null,
			departing: null,
			returning: null
		};

		var forwardFlights = null,
			returnFlights = null;

		//--------------------------------------------------------------------
		var getForwardRouteQuery = function() {

			var forwardQuery = {};
			if (query.origin) forwardQuery.origin = query.origin;
			if (query.destination) forwardQuery.destination = query.destination;
			if (query.departing) forwardQuery.departure = query.departing.getTime();

			return forwardQuery;
		};

		var forwardRoutePromiseParams = function(fullfill, reject) {
			$.ajax({
				url: '/api/flights',
				method: 'GET',
				data: getForwardRouteQuery(),
				success: fullfill,
				error: reject
			});
		};

		var forwardRoutePromise = null;

		//--------------------------------------------------------------------
		var getReturnRouteQuery = function() {

			var returnQuery = {};
			if (query.origin) returnQuery.destination = query.origin;
			if (query.destination) returnQuery.origin = query.destination;
			if (query.returning) returnQuery.departure = query.returning.getTime();

			return returnQuery;
		};

		var returnRoutePromiseParams = function(fullfill, reject) {
			$.ajax({
				url: '/api/flights',
				method: 'GET',
				data: getReturnRouteQuery(),
				success: fullfill,
				error: reject
			});
		};

		var returnRoutePromise = null;

		//--------------------------------------------------------------------
		
		var service = {

			getQuery: function() { return query; },
			setQuery: function(q) {

				query.roundTrip 	= q.roundTrip;
				query.origin 		= q.origin 		|| null;
				query.destination 	= q.destination	|| null;
				query.departing 	= q.departing 	|| null;
				query.returning 	= q.returning 	|| null;
				//--------------
				forwardFlights = forwardRoutePromise = null;
				returnFlights = returnRoutePromise = null;
			},

			getForwardRoutePromise: function() {

				if (!forwardRoutePromise || !forwardFlights) {

					forwardRoutePromise = new Promise(forwardRoutePromiseParams);

					forwardRoutePromise
						.then((response) => forwardFlights = response.result)
						.catch((xhr, textStatus, errorThrown) => forwardFlights = null);
				}

				return forwardRoutePromise;
			},
			getReturnRoutePromise: function() {

				if (!query.roundTrip)
					return Promise.resolve({result: null});

				if (!returnRoutePromise || !returnFlights) {

					returnRoutePromise = new Promise(returnRoutePromiseParams);

					returnRoutePromise
						.then((response) => returnFlights = response.result)
						.catch((xhr, textStatus, errorThrown) => returnFlights = null);
				}

				return returnRoutePromise;
			},
			getForwardFlights: function(callback) {

				if (forwardFlights) return callback(null, forwardFlights);

				this.getForwardRoutePromise()
					.then((response) => callback(null, response.result))
					.catch((xhr, textStatus, errorThrown) => callback(xhr));
			},
			getReturnFlights: function(callback) {
				this.getReturnRoutePromise()
					.then((response) => callback(null, response.result))
					.catch((xhr, textStatus, errorThrown) => callback(xhr));
			}
		};

		return service;
	}
]);
appServices.factory('locationsService', [
	function() {

		var query = {
			from: null,
			to: null
		};

		var origins = null,
			destinations = null;

		//--------------------------------------------------------------------
		var getOriginsQuery = function() {

			var originsQuery = {};
			if (query.to) originsQuery.to = query.to;

			return originsQuery;
		};

		var originsPromiseParams = function(fullfill, reject) {	
			$.ajax({
				url: '/api/locations/origins',
				method: 'GET',
				data: getOriginsQuery(),
				success: fullfill,
				error: reject
			});
		};

		var originsPromise = null;

		//--------------------------------------------------------------------
		var getDestinationsQuery = function() {

			var destinationsQuery = {};
			if (query.from) destinationsQuery.from = query.from;

			return destinationsQuery;
		};

		var destinationsPromiseParams = function(fullfill, reject) {
			$.ajax({
				url: '/api/locations/destinations',
				method: 'GET',
				data: getDestinationsQuery(),
				success: fullfill,
				error: reject
			});
		};

		var destinationsPromise = null;

		//--------------------------------------------------------------------	
		var service = {

			getQuery: function() { return query; },
			setQuery: function(q) {
				
				if (q.to && q.to !== query.to) {
					query.to = q.to;
					origins = originsPromise = null;
				}

				if (q.from && q.from !== query.from) {
					query.from = q.from;
					destinations = destinationsPromise = null;
				}
			},

			getOriginsPromise: function() {

				if (!originsPromise || !origins) {

					originsPromise = new Promise(originsPromiseParams);

					originsPromise
						.then((response) => origins = response.result)
						.catch((xhr, textStatus, errorThrown) => origins = null);
				}

				return originsPromise;
			},
			getDestinationsPromise: function() {
				if (!destinationsPromise || !destinations) {

					destinationsPromise = new Promise(destinationsPromiseParams);

					destinationsPromise
						.then((response) => destinations = response.result)
						.catch((xhr, textStatus, errorThrown) => destinations = null);
				}

				return destinationsPromise;
			},

			getOrigins: function(params, callback) {

				this.setQuery(params);

				if (origins) return callback(null, origins);

				this.getOriginsPromise()
					.then((response) => callback(null, response.result))
					.catch((xhr, textStatus, errorThrown) => callback(xhr));
			},
			getDestinations: function(params, callback) {

				this.setQuery(params);

				if (destinations) return callback(null, destinations);

				this.getDestinationsPromise()
					.then((response) => callback(null, response.result))
					.catch((xhr, textStatus, errorThrown) => callback(xhr));
			}
		};

		return service;
	}
]);
appServices.factory('testService', [
	function() {
		
		var promiseParam = function(timeout) {

			return (fulfill, reject) => { setTimeout(() => fulfill(), timeout); };
		}; 

		var serviceObj = {
			foo: {message: 'Hello'},
			loadingPromise: function(timeout) { 
				var promise = new Promise(promiseParam(timeout))
								.then(() => { console.log('loading finished after', timeout, 'ms'); });
				return promise;
			}
		};

		return serviceObj;
	}
]);
appServices.factory('travelClassesService', [
	function() {

		var query = {};
		var travelClasses = null;

		//--------------------------------------------------------------------
		var getTravelClassesQuery = function() {

			var query = {};

			return query;
		};

		var travelClassesPromiseParams = function(fullfill, reject) {	
			$.ajax({
				url: '/api/travelclasses',
				method: 'GET',
				data: getTravelClassesQuery(),
				success: fullfill,
				error: reject
			});
		};

		var travelClassesPromise = null;

		//--------------------------------------------------------------------	
		var service = {

			getQuery: function() { return query; },
			setQuery: function(q) {

				travelClasses = travelClassesPromise = null;
			},

			getTravelClassesPromise: function() {

				if (!travelClassesPromise || !travelClasses) {

					travelClassesPromise = new Promise(travelClassesPromiseParams);

					travelClassesPromise
						.then((response) => travelClasses = response.result)
						.catch((xhr, textStatus, errorThrown) => travelClasses = null);
				}

				return travelClassesPromise; 
			},

			getTravelClasses: function(callback) {

				if (travelClasses) return callback(null, travelClasses);

				this.getTravelClassesPromise()
					.then((response) => callback(null, response.result))
					.catch((xhr, textStatus, errorThrown) => callback(xhr.responseJSON));
			}
		};

		return service;
	}
]);
appServices.factory('validateService', [
	function() {

		//--------------------------------------------------------------------
		
		var service = {

			validateContact: function(contact) {

				if (!contact.title) return false;
				if (!contact.firstName) return false;
				if (!contact.lastName) return false;
				if (!contact.email) return false;
				if (!contact.telephone) return false;

				return true;
			},
			validatePassenger: function(passenger) {
				if (!passenger.title) return false;
				if (!passenger.firstName) return false;
				if (!passenger.lastName) return false;
				if (!passenger.dateOfBirth) return false;
			},
			validatePassengers: function(passengers) {

				if (!passengers.adults || !passengers.children || !passengers.infants) return false;

				var adultsCount = passengers.adults.length, childrenCount = passengers.children.length, infantsCount = passengers.infants.length;
				if (adultsCount <= 0 || adultsCount > 6) return false;
				if (childrenCount < 0 || childrenCount > (2 * adultsCount) || childrenCount > (6 - adultsCount)) return false;
				if (infantsCount < 0 || infantsCount > adultsCount) return false;

				var failFlag = false;
				for(let i = 0; i < adultsCount; ++i) {
					if (this.validatePassenger(passengers.adults[i])) {
						failFlag = true;
						break;
					}
				}
				if (failFlag) return false;

				for(let i = 0; i < childrenCount; ++i) {
					if (this.validatePassenger(passengers.children[i])) {
						failFlag = true;
						break;
					}
				}
				if (failFlag) return false;

				for(let i = 0; i < infantsCount; ++i) {
					if (this.validatePassenger(passengers.infants[i])) {
						failFlag = true;
						break;
					}
				}
				if (failFlag) return false;


				return true;
			},
			validateFlight: function(flight) {
				if (!flight.seats) return false;
				return true;
			},
			validateTravelClass: function(travelClass) {
				return true;
			},
			validateBookingRoute: function(bookingRoute) {
				if (!bookingRoute.flight) return false;
				if (!bookingRoute.class) return false;

				if (!this.validateFlight(bookingRoute.flight)) return false;
				if (!this.validateTravelClass(bookingRoute.class)) return false;

				if (!bookingRoute.flight.seats.find((s) => s._class === bookingRoute.class._id)) return false;

				return true;
			}
		};

		return service;
	}
]);