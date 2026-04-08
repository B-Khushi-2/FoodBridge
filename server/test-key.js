// Test new HF router endpoint
async function test() {
  const tinyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
  const url = 'https://router.huggingface.co/hf-inference/models/google/vit-base-patch16-224';
  console.log('Testing:', url);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: tinyPng
  });
  console.log('Status:', res.status);
  const data = await res.text();
  console.log('Response:', data.substring(0, 300));
}
test().catch(e => console.error('Error:', e.message));
