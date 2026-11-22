module.exports = (router) => {
	router.post("/:id", async (req, res) => {
		const { id } = req.params;
		const { html } = req.body || {};

		if (typeof html !== "string" || !html.trim()) {
			return res.status(400).json({ error: "html is required" });
		}

		try {
			const puppeteer = await import("puppeteer");
			const browser = await puppeteer.default.launch({
				headless: true,
			});

			let pdf;
			try {
				const page = await browser.newPage();

				await page.setContent(html, {
					waitUntil: "networkidle0",
				});

				pdf = await page.pdf({
					format: "A4",
					printBackground: true,
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
			} finally {
				await browser.close();
			}

			res.setHeader("Content-Type", "application/pdf");
			res.setHeader("Content-Disposition", `attachment; filename="report-${id}.pdf"`);
			return res.send(Buffer.from(pdf));
		} catch (error) {
			console.error("تعذر إنشاء ملف PDF:", error);
			return res.status(500).json({ error: "تعذر إنشاء ملف PDF. راجع سجلات الخادم." });
		}
	});

	return router;
};
