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