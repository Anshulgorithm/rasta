// Converts a YouTube or Vimeo link (the normal "watch"/share link a guide
// would paste) into the special embeddable URL needed to show it inside
// an <iframe> on the trek page. Returns null if the link isn't recognized.
export function getEmbedUrl(url) {
  if (!url) return null;

  // YouTube: https://www.youtube.com/watch?v=VIDEO_ID  or  https://youtu.be/VIDEO_ID
  const  youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // Vimeo: https://vimeo.com/VIDEO_ID
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return null;
}
