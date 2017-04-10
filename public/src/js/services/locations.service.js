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