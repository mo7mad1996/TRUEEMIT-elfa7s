const assert = require("assert");
const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());
app.use("/api/pdf", require("../server/routes/pages/pdf")(express.Router()));

const server = app.listen(0, "127.0.0.1", async () => {
	try {
		const url = `http://127.0.0.1:${server.address().port}/api/pdf/test`;
		const post = (body) =>
			fetch(url, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(body),
				timeout: 60000,
			});

		const invalid = await post({ html: {} });
		assert.strictEqual(invalid.status, 400);

		const result = await post({ html: "<!doctype html><html><body>PDF test</body></html>" });
		assert.strictEqual(result.status, 200);
		assert.strictEqual(result.headers.get("content-type"), "application/pdf");
		assert.strictEqual((await result.buffer()).slice(0, 5).toString(), "%PDF-");

		console.log("PDF endpoint: invalid input rejected, real PDF generated.");
	} catch (error) {
		console.error(error);
		process.exitCode = 1;
	} finally {
		server.close();
	}
});
