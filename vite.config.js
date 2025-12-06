import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
	root: "src/",

	build: {
		outDir: "../dist",
		rollupOptions: {
			input: {
				proposal: resolve(__dirname, "src/proposal.html"),
				home: resolve(__dirname, "src/index.html"),
			},
		},
	},
});
