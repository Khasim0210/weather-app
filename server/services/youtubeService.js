// server/services/youtubeService.js
// Helper that searches YouTube for videos about a location.

const axios = require('axios');

const API_KEY = process.env.YOUTUBE_API_KEY;
const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

/**
 * Search YouTube for videos about a location.
 * Returns an array of video objects: { id, title, description, thumbnail, channel, publishedAt, url }
 */
async function searchVideosForLocation(locationName, maxResults = 5) {
  if (!API_KEY) {
    throw new Error('YOUTUBE_API_KEY is not configured in .env');
  }
  if (!locationName) return [];

  const query = `${locationName} travel guide`;

  const res = await axios.get(SEARCH_URL, {
    params: {
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults,
      key: API_KEY,
      safeSearch: 'moderate',
      relevanceLanguage: 'en',
    },
  });

  const items = res.data.items || [];

  return items.map((item) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
    channel: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
  }));
}

module.exports = { searchVideosForLocation };