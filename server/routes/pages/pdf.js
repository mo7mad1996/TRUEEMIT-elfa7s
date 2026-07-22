// Puppeteer 25 streams the PDF via the global ReadableStream (Web Streams API),
// which isn't a global in older Node runtimes — polyfill it from stream/web.
if (typeof globalThis.ReadableStream === "undefined") {
	globalThis.ReadableStream = require("stream/web").ReadableStream;
}

module.exports = (router) => {
	router.post("/:id", async (req, res) => {
		const puppeteer = await import("puppeteer");
		const { id } = req.params;
		const { html, header, footer } = req.body;

		if (!html) return res.status(400).json({ error: "html is required" });

		const hasHeader = Boolean(header && header.trim());
		const hasFooter = Boolean(footer && footer.trim());

		const browser = await puppeteer.default.launch({
			headless: true,
		});

		try {
			const page = await browser.newPage();

			await page.setContent(html, {
				waitUntil: "networkidle0",
			});

			const pdf = await page.pdf({
				format: "A4",
				printBackground: false,
				margin: {
					top: "0.5in",
					bottom: "0in",
					left: ".5in",
					right: ".5in",
				},
				displayHeaderFooter: false,
				landscape: false,
				scale: 1,
			});

			res.setHeader("Content-Type", "application/pdf");
			res.setHeader("Content-Disposition", `attachment; filename="report-${id}.pdf"`);

			res.send(Buffer.from(pdf));
		} finally {
			await browser.close();
		}
	});

	return router;
};
