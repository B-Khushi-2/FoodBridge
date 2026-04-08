const express = require('express');
const router = express.Router();
const tf = require('@tensorflow/tfjs');
const mobilenet = require('@tensorflow-models/mobilenet');
const sharp = require('sharp');

// ── Local MobileNet — No API, No Token, No Billing ──
let model = null;

async function getModel() {
  if (!model) {
    console.log('[ML] Loading MobileNet model (first time, may take 10-20s)...');
    model = await mobilenet.load({ version: 2, alpha: 1.0 });
    console.log('[ML] ✅ MobileNet loaded and ready!');
  }
  return model;
}

// Pre-load model on server start
(async () => {
  try {
    await getModel();
  } catch (e) {
    console.log('[ML] Model will load on first request:', e.message);
  }
})();

// Food-related ImageNet labels
const FOOD_KEYWORDS = [
  'pizza', 'burger', 'cheeseburger', 'hotdog', 'hot dog', 'french fries',
  'bagel', 'pretzel', 'bread', 'toast', 'sandwich', 'submarine',
  'ice cream', 'ice lolly', 'chocolate', 'candy', 'confectionery',
  'carbonara', 'meat loaf', 'burrito', 'guacamole', 'trifle', 'potpie',
  'banana', 'pineapple', 'pomegranate', 'fig', 'strawberry', 'custard apple',
  'orange', 'lemon', 'granny smith', 'jackfruit', 'apple',
  'broccoli', 'cauliflower', 'mushroom', 'cucumber', 'bell pepper', 'artichoke',
  'acorn squash', 'butternut squash', 'zucchini', 'cabbage', 'corn',
  'espresso', 'coffee', 'cup', 'teapot', 'wine', 'beer', 'goblet', 'eggnog',
  'soup', 'bowl', 'plate', 'dinner', 'tray', 'menu', 'restaurant',
  'grocery', 'bakery', 'confectioner', 'dough',
  'wok', 'frying pan', 'spatula', 'ladle', 'crock pot', 'dutch oven',
  'pot pie', 'mixing bowl', 'mortar',
  'food', 'meal', 'snack', 'fruit', 'vegetable', 'cheese', 'meat', 'fish',
  'cake', 'cookie', 'waffle', 'pancake', 'donut', 'doughnut', 'muffin', 'croissant',
  'rice', 'noodle', 'pasta', 'spaghetti',
  'hen-of-the-woods', 'bolete', 'agaric', 'gyromitra', 'stinkhorn', 'earthstar',
  'mango', 'peach', 'pear', 'grape', 'cherry', 'plum', 'coconut', 'kiwi',
  'watermelon', 'melon', 'papaya', 'guava',
];

function isFoodLabel(label) {
  const lower = label.toLowerCase();
  return FOOD_KEYWORDS.some(food => lower.includes(food));
}

// POST /api/analyze/image
router.post('/image', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const base64Content = image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Content, 'base64');

    // Resize to 224x224 for MobileNet using Sharp
    const resized = await sharp(imageBuffer)
      .resize(224, 224, { fit: 'cover' })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Convert to 3D tensor [224, 224, 3]
    const { data, info } = resized;
    const tensor = tf.tensor3d(new Uint8Array(data), [info.height, info.width, 3]);

    const net = await getModel();
    const predictions = await net.classify(tensor);
    tensor.dispose();

    console.log('[ML] Predictions:', JSON.stringify(predictions));

    // predictions = [{ className: "pizza, pizza pie", probability: 0.85 }, ...]
    const top = predictions[0] || { className: 'unknown', probability: 0 };
    const topLabel = top.className.split(',')[0].trim();
    const topScore = top.probability || 0;
    const labels = predictions.map(p => p.className.split(',')[0].trim());

    // Check if any prediction is food-related
    const foodPredictions = predictions.filter(p => isFoodLabel(p.className));
    const foodScore = foodPredictions.reduce((sum, p) => sum + p.probability, 0);
    const topIsFood = isFoodLabel(top.className);

    let isFood = false;
    let verdict = 'rejected';
    let score = 0;
    let freshness = 0;
    let reason = '';

    if (topIsFood && topScore >= 0.10) {
      isFood = true;
      verdict = 'approved';
      // Scale: 60 base + up to 35 bonus based on confidence → range 60-95
      score = Math.round(60 + (topScore * 35));
      freshness = Math.max(0.5, 0.5 + topScore * 0.4);
      reason = `Detected food: ${topLabel} (${Math.round(topScore * 100)}% confidence)`;
    } else if (foodScore >= 0.15) {
      isFood = true;
      verdict = 'approved';
      score = Math.round(58 + (foodScore * 35));
      freshness = 0.6;
      reason = `Food detected: ${foodPredictions.map(f => f.className.split(',')[0]).join(', ')}`;
    } else if (foodPredictions.length > 0) {
      isFood = true;
      verdict = 'suspected';
      score = Math.round(35 + (foodScore * 100));
      freshness = 0.4;
      reason = `Possibly food: ${foodPredictions[0].className.split(',')[0]}. Needs review.`;
    } else {
      isFood = false;
      verdict = 'rejected';
      score = Math.max(3, Math.round(topScore * 10));
      freshness = 0;
      reason = `Not recognized as food. Detected: ${topLabel}. Please upload a clear food image.`;
    }

    const analysis = {
      isFood, freshness,
      confidence: score / 100,
      labels, verdict, reason, score,
      isSpoiled: false, isFake: false,
      foodType: topIsFood ? topLabel : (foodPredictions[0]?.className?.split(',')[0] || topLabel)
    };

    console.log(`[ML] ✅ isFood=${isFood}, verdict=${verdict}, score=${score}, food="${analysis.foodType}"`);
    return res.json({ analysis });

  } catch (err) {
    console.error('[ML] Error:', err.message);
    return res.json({
      analysis: {
        isFood: false, freshness: 0, confidence: 0.1,
        labels: ['error'], verdict: 'rejected',
        reason: 'Image analysis failed: ' + err.message,
        score: 10, isSpoiled: false, isFake: false, foodType: 'unknown'
      }
    });
  }
});

module.exports = router;
