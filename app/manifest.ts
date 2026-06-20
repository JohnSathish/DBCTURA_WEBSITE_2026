import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Don Bosco College, Tura",
    short_name: "Don Bosco",
    description: "Don Bosco College, Tura - Official Website",
    start_url: "/",
    display: "standalone",
    background_color: "#0b1220",
    theme_color: "#1E3A8A",
    icons: [
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}

