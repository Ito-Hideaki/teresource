import { defineConfig } from "vite";
import { resolve } from 'path';

export default defineConfig(({ command }) => {
    if (command === "build") {
        return {
            resolve: {
                alias: {
                    phaser: resolve('./src/phaser-shim.js'),
                }
            },
            plugins: [
                {
                    name: 'inject-phaser-cdn',
                    transformIndexHtml(html) {
                        return html.replace(
                            `</head>`,
                            `
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js"></script>
</head>`
                        );
                    }
                }
            ]
        };
    }
    return {};
});