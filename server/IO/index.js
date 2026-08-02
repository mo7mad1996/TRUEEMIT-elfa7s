// initial value
let NormalCars = [];

// exclusive users never share their cars — one draft list per user id
const ExclusiveCars = new Map();

class CarSocketHandler {
	constructor(socket) {
		this.socket = socket;
		const { role, user } = socket.handshake.auth;

		if (!role || !Object.keys(this.handlers).includes(role)) return socket.disconnect();
		else this.role = role;

		this.user = user;

		// exclusive users are isolated from each other, so we must know who they are
		if (this.role == "exclusive" && !this.user) return socket.disconnect();

		// Join user to a room based on role — an exclusive user gets his own room
		this.room = this.role == "exclusive" ? `exclusive:${this.user}` : this.role;
		this.socket.join(this.room);

		// role events
		this.handlers[this.role].call(this);
	}

	handlers = {
		manager() {
			this.managerEvents();
		},
		engineer() {
			this.engineerEvents();
		},
		exclusive() {
			this.exclusiveEvents();
		},
	};

	managerEvents() {}

	engineerEvents() {
		// send cars
		this.socket.emit("cars", NormalCars);

		// update cars
		this.socket.on("update-cars", (data, cb = () => {}) => {
			NormalCars = data;
			this.socket.broadcast.to(this.room).emit("cars", NormalCars);
			cb();
		});

		// delete car
		this.socket.on("delete-car", (id) => {
			this.socket.broadcast.to(id).emit("delete-car");
		});

		// save
		this.socket.on("save-car", () => {
			this.socket.join("manager");
			this.socket.broadcast.to("manager").emit("update-database");
			this.socket.broadcast.to(this.room).emit("update-database");
			this.socket.leave("manager");
		});

		// join and leave
		this.socket.on("join-room", (id) => this.socket.join(id));
		this.socket.on("leave-rooms", () => {
			NormalCars.map((i) => i._id).forEach((id) => {
				this.socket.leave(id);
			});
		});
	}

	exclusiveEvents() {
		// send cars — only the ones this user is working on
		this.socket.emit("cars", this.cars);

		// update cars
		this.socket.on("update-cars", (data, cb = () => {}) => {
			this.cars = data;
			this.socket.broadcast.to(this.room).emit("cars", this.cars);
			cb();
		});

		// delete car
		this.socket.on("delete-car", (id) => {
			this.socket.broadcast.to(id).emit("delete-car");
		});

		// save
		this.socket.on("save-car", () => {
			this.socket.broadcast.to(this.room).emit("update-database");
		});

		// join and leave
		this.socket.on("join-room", (id) => this.socket.join(id));
		this.socket.on("leave-rooms", () => {
			this.cars.map((i) => i._id).forEach((id) => {
				this.socket.leave(id);
			});
		});
	}

	// the draft cars of the connected exclusive user
	get cars() {
		return ExclusiveCars.get(this.user) || [];
	}

	set cars(data) {
		ExclusiveCars.set(this.user, data);
	}
}

module.exports = (IO) => {
	IO.on("connect", (socket) => {
		new CarSocketHandler(socket);
	});
};
