// Youtube API integration for For-You page with History Pagination

document.addEventListener("DOMContentLoaded", async () => {
  const API_KEY = "AIzaSyCIvwaorTrYEPAJiDNP-Or8FvmKSzNDFuQ";
  const CHANNEL_ID = "UClNlKMh0OBSfSGbjXcIp_Nw";

  const videoContainers = document.querySelectorAll(".testimonial-strip > div");
  const shortsContainers = document.querySelectorAll(".shorts-strip > div");

  // Helper function to convert ISO 8601 duration (e.g., PT1M15S) to total seconds
  function getDurationInSeconds(durationStr) {
    if (!durationStr) return 0;
    const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || 0, 10);
    const minutes = parseInt(match[2] || 0, 10);
    const seconds = parseInt(match[3] || 0, 10);
    return (hours * 3600) + (minutes * 60) + seconds;
  }

  try {
    // 1. Get the channel's main uploads playlist ID
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`
    );

    const channelData = await channelRes.json();
    if (!channelData.items || channelData.items.length === 0) {
      console.error("Channel not found.");
      return;
    }
    const uploadsPlaylist = channelData.items[0].contentDetails.relatedPlaylists.uploads;

    let videoIndex = 0;
    let shortIndex = 0;
    let nextPageToken = "";
    let pagesFetched = 0;
    const maxPages = 4; // Looks back through up to 200 total videos to find your shorts

    // 2. Loop & Paginate until both grids are full OR we run out of channel history
    while ((videoIndex < videoContainers.length || shortIndex < shortsContainers.length) && pagesFetched < maxPages) {
      
      let playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylist}&maxResults=50&key=${API_KEY}`;
      if (nextPageToken) {
        playlistUrl += `&pageToken=${nextPageToken}`;
      }

      const playlistRes = await fetch(playlistUrl);
      const playlistData = await playlistRes.json();
      const items = playlistData.items || [];
      
      if (items.length === 0) break;

      nextPageToken = playlistData.nextPageToken;
      pagesFetched++;

      // Extract batch video IDs to check their true durations/metadata
      const videoIds = items.map(item => item.snippet.resourceId.videoId).join(",");

      // Fetch detailed data (snippet + contentDetails) for all 50 items simultaneously
      const detailsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds}&key=${API_KEY}`
      );
      const detailsData = await detailsRes.json();
      const detailedItems = detailsData.items || [];

      for (let item of detailedItems) {
        // Stop analyzing items if both layout selections are entirely satisfied
        if (videoIndex >= videoContainers.length && shortIndex >= shortsContainers.length) {
          break;
        }

        const title = item.snippet.title.toLowerCase();
        const description = item.snippet.description ? item.snippet.description.toLowerCase() : "";
        const videoId = item.id;
        const durationStr = item.contentDetails ? item.contentDetails.duration : "";
        const durationSeconds = getDurationInSeconds(durationStr);

        // A video qualifies as a Short if it hits hashtags OR runs 60 seconds or less
        const isShort = title.includes("#shorts") || 
                        title.includes("shorts/") || 
                        description.includes("#shorts") || 
                        description.includes("#short") ||
                        (durationSeconds > 0 && durationSeconds <= 60);

        const iframe = document.createElement("iframe");
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
        iframe.frameBorder = "0";
        iframe.allowFullscreen = true;
        iframe.width = "100%";

        if (isShort) {
          if (shortIndex < shortsContainers.length) {
            iframe.height = "380"; // Vertical view
            shortsContainers[shortIndex].innerHTML = "";
            shortsContainers[shortIndex].appendChild(iframe);
            shortIndex++;
          }
        } else {
          if (videoIndex < videoContainers.length) {
            iframe.height = "220"; // Horizontal view
            videoContainers[videoIndex].innerHTML = "";
            videoContainers[videoIndex].appendChild(iframe);
            videoIndex++;
          }
        }
      }

      // If YouTube reports no more pages left to load, exit loop early
      if (!nextPageToken) break;
    }

    // 3. Clean up remaining empty placeholder blocks if channel ran completely dry
    for (let i = videoIndex; i < videoContainers.length; i++) {
      videoContainers[i].style.display = "none";
    }
    for (let i = shortIndex; i < shortsContainers.length; i++) {
      shortsContainers[i].style.display = "none";
    }

  } catch (err) {
    console.error("YouTube API error:", err);
  }
});