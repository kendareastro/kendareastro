const menuButton = document.querySelector(".menu-toggle");

if (menuButton) {
  menuButton.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("menu-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });
}

document.querySelectorAll(".faq-item button").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    const isOpen = item.classList.contains("open");

    document.querySelectorAll(".faq-item").forEach((faq) => {
      faq.classList.remove("open");
      faq.querySelector("button").setAttribute("aria-expanded", "false");
    });

    if (!isOpen) {
      item.classList.add("open");
      button.setAttribute("aria-expanded", "true");
    }
  });
});

const animatedItems = [
  ...document.querySelectorAll("main section"),
  ...document.querySelectorAll(".blog-grid article"),
  ...document.querySelectorAll(".elementor-animated-item--fade-in"),
];

animatedItems.forEach((item) => item.classList.add("reveal"));

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
  );

  animatedItems.forEach((item) => revealObserver.observe(item));
} else {
  animatedItems.forEach((item) => item.classList.add("is-visible"));
}

// Youtube API integration for testimonial strip

document.addEventListener("DOMContentLoaded", async () => {
  const API_KEY = "AIzaSyCIvwaorTrYEPAJiDNP-Or8FvmKSzNDFuQ";
  const CHANNEL_ID = "UClNlKMh0OBSfSGbjXcIp_Nw";

  const containers = document.querySelectorAll(".testimonial-strip > div");

  try {
    // 1. Get uploads playlist
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`
    );

    const channelData = await channelRes.json();

    const uploadsPlaylist =
      channelData.items[0].contentDetails.relatedPlaylists.uploads;

    // 2. Get latest videos
    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylist}&maxResults=10&key=${API_KEY}`
    );

    const playlistData = await playlistRes.json();

    // 3. Get valid videos (keep first 3)
    const videos = playlistData.items.slice(0, 10);

    let index = 0;

    for (let item of videos) {
      if (index >= 3) break;

      const title = item.snippet.title.toLowerCase();

      // optional: skip shorts
      if (title.includes("#shorts")) continue;

      const videoId = item.snippet.resourceId.videoId;

      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube.com/embed/${videoId}`;
      iframe.width = "100%";
      iframe.height = "220";
      iframe.frameBorder = "0";
      iframe.allowFullscreen = true;

      if (containers[index]) {
        containers[index].innerHTML = "";
        containers[index].appendChild(iframe);
      }

      index++;
    }

  } catch (err) {
    console.error("YouTube API error:", err);
  }
});