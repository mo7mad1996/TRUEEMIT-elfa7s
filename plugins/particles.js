export default (ctx, inject) => {
  // Inject $hello(msg) in Vue, context and store.
  inject("partical", (el) => {
    const canvas = el;
    const ctx = canvas.getContext("2d");

    canvas.width = innerWidth;
    canvas.height = innerHeight;

    window.addEventListener("resize", () => {
      canvas.width = innerWidth;
      canvas.height = innerHeight;
    });

    class Partical {
      constructor(x = null, y = null) {
        this.size = Math.random() * 3 + 1; // [min: 1, max: 4]
        this.x =
          x || Math.random() * (canvas.height - this.size * 2) - this.size * 3;
        this.y =
          y || Math.random() * (canvas.width - this.size * 2) - this.size * 3;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
      }

      draw() {
        ctx.beginPath();
        ctx.fillStyle = "#018b9a";
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
      }

      update() {
        this.draw();

        if (this.x > canvas.width - this.size || this.x < 0)
          this.speedX = this.speedX * -1;
        if (this.y > canvas.height - this.size || this.y < 0)
          this.speedY = this.speedY * -1;

        this.x += this.speedX;
        this.y += this.speedY;
      }
    }

    let particals = [];
    for (let i = 0; i < 20; i++) {
      particals.push(new Partical());
    }

    canvas.addEventListener("click", (e) => {
      particals.push(new Partical(e.x, e.y));
    });

    function anmate() {
      ctx.fillStyle = "#020e19";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particals.forEach((partical) => {
        partical.update();

        particals.forEach((p) => {
          const destance = Math.sqrt(
            Math.pow(partical.x - p.x, 2) + Math.pow(partical.y - p.y, 2)
          );

          if (destance < 100 && destance > 5) {
            drawLine(p, partical, destance);
          }
        });
      });

      requestAnimationFrame(anmate);
    }
    anmate();

    function drawLine(start, end, destance) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(1, 139, 154,${1 - destance / 100} )`;
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      ctx.closePath();
    }
  });
};
