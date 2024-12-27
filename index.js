require("dotenv").config(); // Charger les variables d'environnement
const fs = require("fs");
const fetch = require("node-fetch");
const vision = require("@google-cloud/vision");
const { v4: uuidv4 } = require("uuid");

// Crée le client Vision
const client = new vision.ImageAnnotatorClient();

// Fuzay²
// https://www.youtube.com/watch?v=oTvth0vK56E
// https://www.youtube.com/watch?v=jMOIREL-3vk
// https://www.youtube.com/watch?v=c5SnulCMviE
// https://www.youtube.com/watch?v=MQLa4_Ql6Ik
// https://www.youtube.com/watch?v=zH4OxwN3GTY

// Fiouze
// https://www.youtube.com/watch?v=KWktOmvvHys
// https://www.youtube.com/watch?v=R5ZvxPUDR4A
// https://www.youtube.com/watch?v=rBcfUhndcg8
// https://www.youtube.com/watch?v=i3g070BqR40
// https://www.youtube.com/watch?v=ycMgKRhmMUg
// https://www.youtube.com/watch?v=dW23Wfg5SrI
// https://www.youtube.com/watch?v=xrnH6tvxliQ
// https://www.youtube.com/watch?v=zIrfNQL-Twk

// FuzeIII
// https://www.youtube.com/watch?v=hZJcTy-9Rjk
// https://www.youtube.com/watch?v=PuKD-W16GQE
// https://www.youtube.com/watch?v=hHD0zvGtKlI
// https://www.youtube.com/watch?v=1abR4ME69hQ
// https://www.youtube.com/watch?v=vBZZLkPnk7M
// https://www.youtube.com/watch?v=lIHhCq3LWgU
// https://www.youtube.com/watch?v=-xAtQ2_czEM
// https://www.youtube.com/watch?v=aDAszNFW6IE

// Ninjaxx
// https://www.youtube.com/watch?v=d-xmJKkNcpU
// https://www.youtube.com/watch?v=QT_GQZKbF3M
// https://www.youtube.com/watch?v=MkmI3eg48JM
// https://www.youtube.com/watch?v=bfh2bXrUcvY
// https://www.youtube.com/watch?v=G5E8ZO6FCFI
// https://www.youtube.com/watch?v=pxI5rPlY1yI
// https://www.youtube.com/watch?v=K0ZZ8DoAKrQ
// https://www.youtube.com/watch?v=cbp3ew57iPk

const VIDEO_IDS = [
  "oTvth0vK56E",
  "jMOIREL-3vk",
  "c5SnulCMviE",
  "MQLa4_Ql6Ik",
  "zH4OxwN3GTY",
  "KWktOmvvHys",
  "R5ZvxPUDR4A",
  "rBcfUhndcg8",
  "i3g070BqR40",
  "ycMgKRhmMUg",
  "dW23Wfg5SrI",
  "xrnH6tvxliQ",
  "zIrfNQL-Twk",
  "hZJcTy-9Rjk",
  "PuKD-W16GQE",
  "hHD0zvGtKlI",
  "1abR4ME69hQ",
  "vBZZLkPnk7M",
  "lIHhCq3LWgU",
  "-xAtQ2_czEM",
  "aDAszNFW6IE",
  "d-xmJKkNcpU",
  "QT_GQZKbF3M",
  "MkmI3eg48JM",
  "bfh2bXrUcvY",
  "G5E8ZO6FCFI",
  "pxI5rPlY1yI",
  "K0ZZ8DoAKrQ",
  "cbp3ew57iPk",
];
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY; // Utiliser la clé API depuis les variables d'environnement

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
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }
  }

  return flagImages;
};

const saveResult = (videoId, result) => {
  const resultDirectory = "result";
  if (!fs.existsSync(resultDirectory)) {
    fs.mkdirSync(resultDirectory);
  }

  const filePath = `${resultDirectory}/${videoId}.json`;
  fs.writeFileSync(filePath, JSON.stringify(result, null, 2), "utf-8");
  console.log(`Results saved to ${filePath}`);
};

// Crée le dossier temp s'il n'existe pas
if (!fs.existsSync("temp")) {
  fs.mkdirSync("temp");
}

// Boucle sur chaque vidéo ID
(async () => {
  for (const videoId of VIDEO_IDS) {
    console.log(`Processing video: ${videoId}`);

    const comments = await getAllComments(videoId, YOUTUBE_API_KEY);
    console.log("Comments fetched successfully");
    console.log("Start removing double accounts...");

    // Supprimer les doublons
    const uniqueComments = comments.filter(
      (comment, index, self) =>
        index === self.findIndex((t) => t.profileImage === comment.profileImage)
    );

    console.log(`Start scanning ${uniqueComments.length} picture...`);
    const flaggedResults = await processComments(uniqueComments);

    saveResult(videoId, flaggedResults);
  }

  // Nettoyer le dossier temp après avoir terminé
  fs.rm("temp", { recursive: true });
})();
