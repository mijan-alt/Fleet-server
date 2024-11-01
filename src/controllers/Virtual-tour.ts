
import { Request, Response } from 'express';
import { google } from 'googleapis';
import { Readable } from 'stream';
import multer from 'multer';
import path from 'path';

// Configure multer for video upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
  fileFilter: (_req:any, file:any, cb:any) => {
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
}).single('video');

// YouTube API setup
const youtube = google.youtube('v3');

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

// Set credentials (make sure to handle token refresh)
oauth2Client.setCredentials({
  access_token: process.env.YOUTUBE_ACCESS_TOKEN,
  refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
});


oauth2Client.on("tokens", (tokens) => {
  if (tokens.refresh_token) {
    console.log("Refresh Token:", tokens.refresh_token);
  }
  console.log("Access Token:", tokens.access_token);
});
// Function to ensure token refresh before upload
async function refreshTokenIfNeeded() {
  const { credentials } = await oauth2Client.refreshAccessToken();
  oauth2Client.setCredentials(credentials);
}
interface UploadVideoResponse {
  youtubeUrl: string;
  thumbnailUrl: string;
}

export const uploadVirtualTour = async (req: Request, res: Response) => {
  try {
    console.log("hit virtaul tour")
      await refreshTokenIfNeeded(); // Refresh token if necessary
      console.log("req", req)
      
    await new Promise<void>((resolve, reject) => {
      upload(req, res, (err:any) => {
        if (err) reject(err);
        resolve();
      });
    });

    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    // Create readable stream from buffer
    const fileStream = new Readable();
    fileStream.push(req.file.buffer);
    fileStream.push(null);

    // Upload to YouTube
    const response = await youtube.videos.insert({
      auth: oauth2Client,
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: `Property Virtual Tour - ${Date.now()}`,
          description: 'Property virtual tour video',
          tags: ['property', 'virtual tour'],
        },
        status: {
          privacyStatus: 'unlisted', // or 'private' based on your needs
        },
      },
      media: {
        body: fileStream,
      },
    });

    const videoId = response.data.id;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const thumbnailUrl = response.data.snippet?.thumbnails?.default?.url || '';

    console.log("thumbnail", thumbnailUrl)
    console.log("vidoeurl", videoUrl)
    console.log("videoId", videoId)

    const result: UploadVideoResponse = {
      youtubeUrl: videoUrl,
      thumbnailUrl,
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error uploading video:', error);
    return res.status(500).json({ error: 'Failed to upload video' });
  }
};