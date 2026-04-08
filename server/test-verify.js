/**
 * Quick test script for the image verification pipeline.
 * Creates a small synthetic test image and runs it through the verifier.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const sharp = require('sharp');
const { verifyImage } = require('./ml/imageVerifier');

async function runTest() {
  console.log('=== Image Verification Pipeline Test ===\n');

  // Create a simple 200x200 green/brown gradient test image (simulating a food-like photo)
  const width = 200;
  const height = 200;
  const pixels = Buffer.alloc(width * height * 3);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 3;
      // Green/brown gradient to simulate food-like colors
      pixels[idx] = Math.floor(100 + Math.random() * 80);     // R
      pixels[idx + 1] = Math.floor(80 + Math.random() * 100);  // G
      pixels[idx + 2] = Math.floor(30 + Math.random() * 50);   // B
    }
  }

  const jpegBuffer = await sharp(pixels, { raw: { width, height, channels: 3 } })
    .jpeg({ quality: 90 })
    .toBuffer();

  const base64Image = 'data:image/jpeg;base64,' + jpegBuffer.toString('base64');

  console.log('Test image created: 200x200 synthetic JPEG');
  console.log(`Base64 size: ${Math.round(base64Image.length / 1024)} KB\n`);

  // Test 1: Verify the synthetic image
  console.log('--- Test 1: Synthetic gradient image (should be flagged) ---');
  try {
    const result = await verifyImage(base64Image, 'Test Report', 'Testing food image verification');
    console.log('\nResult:');
    console.log('  Verdict:', result.verification.overallVerdict);
    console.log('  Confidence:', result.verification.overallConfidence + '%');
    console.log('  Is Food:', result.verification.isFood);
    console.log('  Matched Label:', result.verification.matchedFoodLabel);
    console.log('  Context Match:', result.verification.contextMatch);
    console.log('  ELA Score:', result.verification.elaScore);
    console.log('  Quality Score:', result.verification.qualityScore);
    console.log('  EXIF Present:', result.verification.exifPresent);
    console.log('  Stats Score:', result.verification.statsScore);
    console.log('  Report Status:', result.reportStatus);
    console.log('  Details:', result.verification.details);
  } catch (err) {
    console.error('Test 1 FAILED:', err.message);
  }

  console.log('\n=== Test Complete ===');
  process.exit(0);
}

runTest();
