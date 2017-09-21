{
    // Abstraction layer for elevator behavior
    class Elevator {
        constructor(elevator) {
            this.elevator = elevator; 
        }


    }

    init: function(elevators, floors) {
        _.each(elevators, function(elevator) {
            var el = new Elevator(elevator);
            var 
        });
        
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}