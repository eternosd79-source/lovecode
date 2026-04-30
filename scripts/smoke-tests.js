/* eslint-disable no-console */
function parsePlanPrice(planLabel) {
  if (typeof planLabel !== 'string') return 0;
  const match = planLabel.match(/\$([0-9]+(?:[.,][0-9]+)?)/);
  if (!match) return 0;
  return Number.parseFloat(match[1].replace(',', '.')) || 0;
}

function getPlanTier(planLabel) {
  const plan = (planLabel || '').toLowerCase();
  const price = parsePlanPrice(planLabel);
  if (price === 0 || /gratis|demo/.test(plan)) return 'free';
  if (price === 1.5 || /básico|basico/.test(plan)) return 'basic';
  if (price === 2.5 || /hub|membres/.test(plan)) return 'hub';
  if (price === 3 || /personalizado|fotograf/.test(plan)) return 'personalized';
  if (price === 4.5 || /ultra/.test(plan)) return 'ultra';
  return 'unknown';
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label} -> esperado: ${expected}, actual: ${actual}`);
  }
}

function run() {
  assertEqual(parsePlanPrice('Básico ($1.50)'), 1.5, 'price basic');
  assertEqual(parsePlanPrice('Ultra ($4,50)'), 4.5, 'price comma decimal');
  assertEqual(parsePlanPrice('Demo Gratis ($0)'), 0, 'price free');
  assertEqual(getPlanTier('Básico ($1.50)'), 'basic', 'tier basic');
  assertEqual(getPlanTier('Membresía Hub ($2.50)'), 'hub', 'tier hub');
  assertEqual(getPlanTier('Personalizado ($3)'), 'personalized', 'tier personalized');
  assertEqual(getPlanTier('Ultra Premium ($4.50)'), 'ultra', 'tier ultra');
  assertEqual(getPlanTier('Demo Gratis ($0)'), 'free', 'tier free');
  console.log('OK: smoke tests passed');
}

run();
