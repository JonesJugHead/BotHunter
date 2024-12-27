require("dotenv").config();
const fs = require("fs");
const fetch = require("node-fetch");
const vision = require("@google-cloud/vision");
const { v4: uuidv4 } = require("uuid");

const client = new vision.ImageAnnotatorClient();

const VIDEO_ID = "hZJcTy-9Rjk"; // Video d'exemple
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY; // Utiliser la clé API depuis les variables d'environnement
process.env.GOOGLE_APPLICATION_CREDENTIALS =
  process.env.GOOGLE_APPLICATION_CREDENTIALS; // Assigner le chemin du fichier JSON

const fetchComments = async (videoId, apiKey, pageToken = "") => {
  const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=${apiKey}&maxResults=100&pageToken=${pageToken}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des commentaires");
  }

  return await response.json();
};

const getAllComments = async (videoId, apiKey) => {
  let allComments = [];
  let pageToken = "";

  try {
    do {
      const commentData = await fetchComments(videoId, apiKey, pageToken);

      for (const item of commentData.items) {
        const topComment = item.snippet.topLevelComment.snippet;
        allComments.push({
          author: topComment.authorDisplayName,
          profileImage: topComment.authorProfileImageUrl,
        });
      }

      pageToken = commentData.nextPageToken;
    } while (pageToken);
  } catch (error) {
    console.error("Erreur:", error);
  }

  return allComments;
};

const downloadImage = async (url, filepath) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image from ${url}`);
  }
  const buffer = await response.buffer();
  fs.writeFileSync(filepath, buffer);
};

const scanImage = async (filepath) => {
  const [result] = await client.safeSearchDetection(filepath);
  const detections = result.safeSearchAnnotation;

  return detections.adult;
};

const processComments = async (comments) => {
  const flagImages = [];
  for (const comment of comments) {
    const filepath = `temp/${uuidv4()}.jpg`;

    try {
      await downloadImage(comment.profileImage, filepath);
      console.log(`Scanning image of ${comment.author}...`);
      const isAdult = await scanImage(filepath);
      if (["LIKELY", "VERY_LIKELY"].includes(isAdult)) {
        console.log(`Image of ${comment.author} is flagged`);
        flagImages.push({
          level: isAdult,
          author: comment.author,
          profileImage: comment.profileImage,
        });
      }
    } catch (error) {
      console.error(`Erreur lors du traitement de l'image: ${error.message}`);
    } finally {
      fs.unlinkSync(filepath);
    }
  }

  return flagImages;
};

// Crée le dossier temp s'il n'existe pas
if (!fs.existsSync("temp")) {
  fs.mkdirSync("temp");
}

// Appel de la fonction pour récupérer et scanner les commentaires
getAllComments(VIDEO_ID, YOUTUBE_API_KEY).then(async (comments) => {
  console.log("Comments fetched successfully");
  console.log("Start removing double accounts...");

  // Supprimer les doublons
  console.comments = comments.filter(
    (comment, index, self) =>
      index === self.findIndex((t) => t.profileImage === comment.profileImage)
  );

  console.log(`Start scanning ${comments.length} picture...`);

  console.log(await processComments(comments));
});
