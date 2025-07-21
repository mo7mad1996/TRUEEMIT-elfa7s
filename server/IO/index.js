// initial value
let NormalCars = [];
let ExclusiveCars = [];

class CarSocketHandler {
  constructor(socket) {
    this.socket = socket;
    const { role } = socket.handshake.auth;

    if (!role || !Object.keys(this.handlers).includes(role))
      return socket.disconnect();
    else this.role = role;

    // Join user to a room based on role
    this.socket.join(this.role);

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
      this.socket.broadcast.to(this.role).emit("cars", NormalCars);
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
      this.socket.broadcast.to(this.role).emit("update-database");
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
    // send cars
    this.socket.emit("cars", ExclusiveCars);

    // update cars
    this.socket.on("update-cars", (data, cb = () => {}) => {
      ExclusiveCars = data;
      this.socket.broadcast.to(this.role).emit("cars", ExclusiveCars);
      cb();
    });

    // delete car
    this.socket.on("delete-car", (id) => {
      this.socket.broadcast.to(id).emit("delete-car");
    });

    // save
    this.socket.on("save-car", () => {
      this.socket.join("manager");
      // this.socket.broadcast.to("manager").emit("update-database");
      this.socket.broadcast.to(this.role).emit("update-database");
      this.socket.leave("manager");
    });

    // join and leave
    this.socket.on("join-room", (id) => this.socket.join(id));
    this.socket.on("leave-rooms", () => {
      ExclusiveCars.map((i) => i._id).forEach((id) => {
        this.socket.leave(id);
      });
    });
  }
}

module.exports = (IO) => {
  IO.on("connect", (socket) => {
    new CarSocketHandler(socket);
  });
};
