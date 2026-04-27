/**
 * Image Verification — Local MobileNet (No API needed)
 */
const tf = require("@tensorflow/tfjs");
const mobilenet = require("@tensorflow-models/mobilenet");
const sharp = require("sharp");

let model = null;

async function getModel() {
  if (!model) {
    model = await mobilenet.load({ version: 2, alpha: 1.0 });
  }
  return model;
}

const FOOD_KEYWORDS = [
  "pizza",
  "burger",
  "cheeseburger",
  "hotdog",
  "hot dog",
  "french fries",
  "bagel",
  "pretzel",
  "bread",
  "toast",
  "sandwich",
  "submarine",
  "ice cream",
  "ice lolly",
  "chocolate",
  "candy",
  "confectionery",
  "carbonara",
  "meat loaf",
  "burrito",
  "guacamole",
  "trifle",
  "potpie",
  "banana",
  "pineapple",
  "pomegranate",
  "fig",
  "strawberry",
  "custard apple",
  "orange",
  "lemon",
  "granny smith",
  "jackfruit",
  "apple",
  "broccoli",
  "cauliflower",
  "mushroom",
  "cucumber",
  "bell pepper",
  "artichoke",
  "acorn squash",
  "butternut squash",
  "zucchini",
  "cabbage",
  "corn",
  "espresso",
  "coffee",
  "cup",
  "teapot",
  "wine",
  "beer",
  "goblet",
  "eggnog",
  "soup",
  "bowl",
  "plate",
  "dinner",
  "tray",
  "menu",
  "restaurant",
  "grocery",
  "bakery",
  "confectioner",
  "dough",
  "food",
  "meal",
  "snack",
  "fruit",
  "vegetable",
  "cheese",
  "meat",
  "fish",
  "cake",
  "cookie",
  "waffle",
  "pancake",
  "donut",
  "doughnut",
  "muffin",
  "croissant",
  "rice",
  "noodle",
  "pasta",
  "spaghetti",
  "hen-of-the-woods",
  "bolete",
  "agaric",
  "mango",
  "peach",
  "pear",
  "grape",
  "cherry",
  "plum",
  "coconut",
  "kiwi",
  "watermelon",
  "melon",
  "papaya",
  "guava",
];

function isFoodLabel(label) {
  const lower = label.toLowerCase();
  return FOOD_KEYWORDS.some((food) => lower.includes(food));
}

async function verifyImage(base64Image) {
  console.log("[ML] Starting local MobileNet verification...");
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
  const imageBuffer = Buffer.from(base64Data, "base64");

  try {
    const resized = await sharp(imageBuffer)
      .resize(224, 224, { fit: "cover" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { data, info } = resized;
    const tensor = tf.tensor3d(new Uint8Array(data), [
      info.height,
      info.width,
      3,
    ]);
    const net = await getModel();
    const predictions = await net.classify(tensor);
    tensor.dispose();

    const top = predictions[0] || { className: "unknown", probability: 0 };
    const topLabel = top.className.split(",")[0].trim();
    const topScore = top.probability || 0;
    const foodPredictions = predictions.filter((p) => isFoodLabel(p.className));
    const foodScore = foodPredictions.reduce(
      (sum, p) => sum + p.probability,
      0,
    );
    const isFood = isFoodLabel(top.className)
      ? topScore >= 0.1
      : foodScore >= 0.15;

    let overallVerdict, overallConfidence;
    if (isFood) {
      overallVerdict = "Verified";
      overallConfidence = Math.max(
        55,
        Math.round(Math.max(topScore, foodScore) * 100),
      );
    } else if (foodPredictions.length > 0) {
      overallVerdict = "Fake / Suspicious";
      overallConfidence = Math.round(foodScore * 100 + 20);
    } else {
      overallVerdict = "Mismatch";
      overallConfidence = Math.min(25, Math.round(topScore * 10));
    }

    const reportStatus =
      overallVerdict === "Verified" ? "Approved" : "Not Valid";

    const verification = {
      overallVerdict,
      overallConfidence,
      elaScore: 0,
      elaDetails: "",
      classificationLabels: predictions.map((p) => p.className.split(",")[0]),
      classificationConfidence: Math.round(topScore * 100),
      isFood,
      matchedFoodLabel: topLabel,
      contextMatch: isFood,
      qualityScore: topScore > 0.5 ? 85 : topScore > 0.2 ? 60 : 35,
      qualityIssues: !isFood ? ["not_food"] : [],
      imageResolution: "",
      exifScore: 0,
      exifPresent: false,
      exifDetails: "",
      statsScore: 0,
      statsDetails: "",
      details: `${topLabel} (${Math.round(topScore * 100)}%)`,
      analyzedAt: new Date(),
    };

    console.log(
      `[ML] ✅ verdict=${overallVerdict}, confidence=${overallConfidence}%`,
    );
    return { verification, reportStatus };
  } catch (err) {
    console.error("[ML] Error:", err.message);
    return {
      verification: {
        overallVerdict: "Fake / Suspicious",
        overallConfidence: 20,
        elaScore: 0,
        elaDetails: "",
        classificationLabels: ["error"],
        classificationConfidence: 0,
        isFood: false,
        matchedFoodLabel: "",
        contextMatch: false,
        qualityScore: 0,
        qualityIssues: ["analysis_error"],
        imageResolution: "",
        exifScore: 0,
        exifPresent: false,
        exifDetails: "",
        statsScore: 0,
        statsDetails: "",
        details: "Verification failed: " + err.message,
        analyzedAt: new Date(),
      },
      reportStatus: "Not Valid",
    };
  }
}

module.exports = { verifyImage };
