export default function manifest() {
  return {
    name: "S-Property",
    short_name: "S-Pro",
    description: "Website S-Property",
    theme_color: "#63c3c5",
    background_color: "#60bec0",
    display: "standalone",
    orientation: "any",
    scope: "/",
    id: "/",
    start_url: "/",
    icons: [
      {
        src: "icons/icon_192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "icons/icon_384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "icons/maskable_192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/screenshot-1741757850461.png",
        sizes: "1280x720",
        type: "image/png",
        description: "Screenshot 1",
        form_factor: "wide",
      },
    ],
  };
}
