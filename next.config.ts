import type { NextConfig } from "next";

// Preserve SVG coordinates when CSS renders an icon smaller than its source size.
const svgLoader = {
  loader: "@svgr/webpack",
  options: {
    svgoConfig: {
      plugins: [
        {
          name: "preset-default",
          params: { overrides: { removeViewBox: false } },
        },
      ],
    },
  },
};

const nextConfig: NextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [svgLoader],
    });
    return config;
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: [svgLoader],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
