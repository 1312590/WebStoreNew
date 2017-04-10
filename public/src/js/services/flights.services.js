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