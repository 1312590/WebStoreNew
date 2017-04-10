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