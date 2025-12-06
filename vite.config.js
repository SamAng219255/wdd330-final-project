import { resolve } from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({mode}) => {
	const env = loadEnv(mode, process.cwd(), '');

	return {
		root: "src/",

		server: {
			proxy: {
				"/mal": {
					target: "https://api.myanimelist.net/v2",
					changeOrigin: true,
					rewrite: path => path.replace(/^\/mal/, ""),
					configure: (proxy) => {
						proxy.on("proxyReq", (proxyReq) => {
							proxyReq.setHeader("X-MAL-CLIENT-ID", env.MAL_CLIENT_ID);
						});
					}
				}
			}
		},

		build: {
			outDir: "../dist",
			rollupOptions: {
				input: {
					proposal: resolve(__dirname, "src/proposal.html"),
					home: resolve(__dirname, "src/index.html"),
				},
			},
		},
}});
