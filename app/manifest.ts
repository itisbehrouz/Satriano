import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Satriano Atelier - B2B Manufacturing Portal",
    short_name: "Satriano",
    description:
      "Industrial B2B white-label garment manufacturing portal with transparent live pricing and precision CAD sizing.",
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#0B1E3D",
    theme_color: "#0B1E3D",
    categories: ["business", "manufacturing", "shopping"],
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
