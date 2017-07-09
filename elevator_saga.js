{
    init: function(elevators, floors) {
        console.log('----- OBJ DUMP (elevators, floors) -----');
        console.log(elevators);
        console.log(floors);
        console.log("Start Program...");


        class FloorIndex {
            constructor() {
                // outside press is a static member of this class, as all elevators share the same information
                FloorIndex.outside_press = new Uint32Array(floors.length); // contains timestamp if pressed, 0 if not.
                this.inside_press = new Uint32Array(floors.length);
                this.floor_index = new Uint8Array(floors.length);
            }

            add_inside_press(floor)
            {
                if (this.inside_press[floor] == 0) // if not pressed yet.
                {
                    this.inside_press[floor] = Date.now() / 1000;
                }
            }

            static add_outside_press(floor)
            {
                if (FloorIndex.outside_press[floor] == 0) // if not pressed yet.
                {
                    FloorIndex.outside_press[floor] = Date.now() / 1000;
                }
            }

            rm_button_press(floor)
            {
                FloorIndex.outside_press[floor] = 0;
                this.inside_press[floor] = 0;
                this.floor_index[floor] = 0; // reset floor index
            }

            update_index(elevator)
            {
                var self = this;
                _.each(this.floor_index, function(fl_index, floor_number) {

                    var time_diff = 0;
                    if (FloorIndex.outside_press[floor_number] != 0)
                        time_diff = (Date.now() / 1000) - FloorIndex.outside_press[floor_number];

                    var outside_val = 0;
                    if (FloorIndex.outside_press[floor_number] != 0)
                        outside_val = 1;

                    var inside_val = 0;
                    if (self.inside_press[floor_number] != 0)
                        inside_val = 14;

                    var distance = Math.abs(floor_number - elevator.currentFloor()); // how many floors am I away?
                    // favor closer floors
                    var distance_score = (floors.length) - distance; // only if someones waiting though

                    if (floor_number == elevator.currentFloor()) // give the current floor a value of 0
                    {
                        self.floor_index[floor_number] = 0;
                    } else
                    {
                        self.floor_index[floor_number] = (time_diff + inside_val); // index will be seconds since outside button was pressed plus 0 / 1 if inside button is pressed.
                    }
                });
            }

            // TODO: favor closest floors.
            get_highest_index_floor(elevator)
            {
                this.update_index(elevator);
                return _.indexOf(this.floor_index, _.max(this.floor_index));
            }
        };
        
        _.each(elevators, function(elevator) {
            // every elevator will have its own index.
            var fl_index = new FloorIndex();
            
            elevator.on("idle", function() {
                var floor = fl_index.get_highest_index_floor(this);
                this.goToFloor(floor);
                fl_index.rm_button_press(floor); // needs to be removed right away so only one elevator reacts.
            });

            var last_pressed_floors = [];
            elevator.on("floor_button_pressed", function() {
                var floor = _.difference(this.getPressedFloors(), last_pressed_floors)[0];
                last_pressed_floors = this.getPressedFloors();
                fl_index.add_inside_press(floor);
            });

            elevator.on("stopped_at_floor", function() {
                // update last pressed floors, so once new button is pressed, it will still work.
                last_pressed_floors = this.getPressedFloors();
            });
        });
        
        _.each(floors, function(floor) {
            floor.on("up_button_pressed", function() {
                FloorIndex.add_outside_press(this.level);
            });
            floor.on("down_button_pressed", function() {
                FloorIndex.add_outside_press(this.level);
            });

        });
        
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}