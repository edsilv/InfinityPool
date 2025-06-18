import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import dts from "vite-plugin-dts";

// Check if the build is running on Vercel
const isVercel = process.env.VERCEL === "1";

export default defineConfig({
  plugins: [react(), dts()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: isVercel
    ? {
        outDir: "dist",
        emptyOutDir: true,
        sourcemap: false, // Disable sourcemaps for Vercel to reduce bundle size
        rollupOptions: {
          input: resolve(__dirname, "index.html"),
          output: {
            manualChunks: {
              vendor: ["react", "react-dom"],
              three: ["three", "@react-three/fiber", "@react-three/drei"],
            },
          },
        },
      }
    : {
        lib: {
          entry: resolve(__dirname, "index.ts"),
          name: "InfinityPool",
          fileName: (format) => `index.${format}.js`,
        },
        cssCodeSplit: false,
        rollupOptions: {
          external: ["react", "react-dom"],
          output: {
            globals: {
              react: "React",
              "react-dom": "ReactDOM",
            },
          },
        },
        sourcemap: true,
        emptyOutDir: true,
      },
  define: {
    // Replace eval-based code for Vercel compatibility
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "production"
    ),
  },
  server: {
    port: 3000,
  },
});
