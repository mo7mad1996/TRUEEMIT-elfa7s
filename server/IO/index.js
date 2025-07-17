// inital value
let cars = [];

module.exports = (IO) => {
  IO.on("connect", (socket) => {
    socket.emit("update cars", cars);

    socket.on("update cars", (data) => {
      cars = [...data];
      IO.emit("update cars", data);
    });

    socket.on("leave_rooms", () =>
      cars.map((el) => el._id).forEach((room) => socket.leave(room))
    );
    socket.on("join room", (room) => socket.join(room));

    socket.on("leave room", (room) => {
      IO.to(room).emit("leave room");
    });

    socket.on("update car", (car) => {
      socket.broadcast.to(car._id).emit("update car", car);

      cars = cars.map((c) => (c._id == car._id ? car : c));
    });

    // update manager page
    socket.on("update database", () => IO.emit("update database"));
  });
};
