export const DEFAULT_RULES = [
  {
    id: "entrance",
    name: "Main Entrance (Simha Dwara)",
    category: "Structure",
    weight: 20,
    options: [
      { condition: "North, East, or Northeast", points: 100, recommendation: "Excellent! These directions attract positive energy (Prana)." },
      { condition: "Northwest or West", points: 60, recommendation: "Neutral. Can be improved with Vastu crystals or symbols." },
      { condition: "South or Southeast", points: 40, recommendation: "Averge. Requires specific remedies to counter defects." },
      { condition: "Southwest corner", points: 10, recommendation: "Critical Vastu Dosha. Avoid if possible or seek immediate expert remediation." },
    ],
    selectedOption: 0,
  },
  {
    id: "kitchen",
    name: "Kitchen Location",
    category: "Elements",
    weight: 15,
    options: [
      { condition: "Southeast (Agni Corner)", points: 100, recommendation: "Perfect! The fire element is ideally placed here." },
      { condition: "Northwest Corner", points: 70, recommendation: "Good alternative. Maintain cleanliness for prosperity." },
      { condition: "West Facing", points: 50, recommendation: "Neutral. Ensure cooking is done facing East." },
      { condition: "Northeast or Southwest", points: 10, recommendation: "Major imbalance. Can lead to financial or health instability." },
    ],
    selectedOption: 0,
  },
  {
    id: "bedroom",
    name: "Master Bedroom",
    category: "Structure",
    weight: 15,
    options: [
      { condition: "Southwest corner", points: 100, recommendation: "Ideal for stability and long-term prosperity." },
      { condition: "South or West", points: 80, recommendation: "Very stable and grounded energy." },
      { condition: "Northwest", points: 50, recommendation: "Neutral. Good for guests or children." },
      { condition: "Northeast", points: 20, recommendation: "Avoid for adults. May lead to restless sleep." },
    ],
    selectedOption: 0,
  },
  {
    id: "pooja",
    name: "Pooja Room",
    category: "Spiritual",
    weight: 12,
    options: [
      { condition: "Northeast corner", points: 100, recommendation: "Ishanya corner is most auspicious for divine connect." },
      { condition: "East or West", points: 75, recommendation: "Good for spiritual practices." },
      { condition: "South or Southwest", points: 10, recommendation: "Highly inauspicious. Relocate if possible." },
    ],
    selectedOption: 0,
  },
  {
    id: "toilet",
    name: "Toilets & Bathrooms",
    category: "Sanitation",
    weight: 10,
    options: [
      { condition: "Northwest or West", points: 100, recommendation: "Best for elimination of waste and negative energy." },
      { condition: "South or North", points: 50, recommendation: "Neutral. Use light colors to balance energy." },
      { condition: "Center or Northeast", points: 5, recommendation: "Critical Dosha. Impacts health and overall peace." },
    ],
    selectedOption: 0,
  },
  {
    id: "dining",
    name: "Dining Area",
    category: "Structure",
    weight: 8,
    options: [
      { condition: "West or Southeast", points: 100, recommendation: "Auspicious. Promotes harmony during family meals." },
      { condition: "East or North", points: 70, recommendation: "Positive energy flow for health." },
      { condition: "Center of house", points: 10, recommendation: "Inauspicious. Avoid placing heavy tables in Brahmasthan." },
    ],
    selectedOption: 0,
  },
  {
    id: "living_room",
    name: "Living Room Seating",
    category: "Structure",
    weight: 10,
    options: [
      { condition: "South or West Wall", points: 100, recommendation: "Perfect. Guests sit facing North or East." },
      { condition: "East or North Wall", points: 60, recommendation: "Neutral. Guests may face inauspicious directions." },
    ],
    selectedOption: 0,
  },
  {
    id: "brahmasthan",
    name: "Brahmasthan (Center)",
    category: "General",
    weight: 10,
    options: [
      { condition: "Empty and Clean", points: 100, recommendation: "Excellent. Allows free flow of cosmic energy." },
      { condition: "Has walls or pillars", points: 30, recommendation: "Obstructed energy. Can lead to family tension." },
      { condition: "Has toilet or stair", points: 0, recommendation: "Major Dosha. Blocks growth and prosperity." },
    ],
    selectedOption: 0,
  },
];

const hashCode = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

export const generateMockListingData = (address, baseRules) => {
  const seed = hashCode(address || 'default');
  return baseRules.map((rule, idx) => {
    const optionIndex = (seed + idx) % rule.options.length;
    return { ...rule, selectedOption: optionIndex };
  });
};

export const calculateScore = (rules) => {
  let weightedPoints = 0;
  let totalWeight = 0;
  
  const results = rules.map(rule => {
    const selected = rule.options[rule.selectedOption];
    weightedPoints += selected.points * (rule.weight / 100);
    totalWeight += (rule.weight / 100);
    
    return {
      id: rule.id,
      name: rule.name,
      category: rule.category,
      condition: selected.condition,
      points: selected.points,
      recommendation: selected.recommendation,
      isPositive: selected.points >= 70
    };
  });
  
  const finalScore = Math.round((weightedPoints / totalWeight));
  
  // Facing logic
  const entrance = rules.find(r => r.id === 'entrance');
  let facing = 'East';
  if (entrance) {
     const cond = entrance.options[entrance.selectedOption].condition.toLowerCase();
     if (cond.includes('north')) facing = 'North';
     else if (cond.includes('south')) facing = 'South';
     else if (cond.includes('west')) facing = 'West';
  }

  // Categorize for UI
  const categories = {};
  results.forEach(r => {
    if (!categories[r.category]) categories[r.category] = { items: [], scoreTotal: 0, count: 0 };
    categories[r.category].items.push(r);
    categories[r.category].scoreTotal += r.points;
    categories[r.category].count += 1;
  });

  return {
    score: finalScore,
    facing: facing,
    categoryScores: categories,
    breakdown: results,
    verdict: finalScore >= 80 ? "Excellent" : finalScore >= 65 ? "Good" : finalScore >= 45 ? "Average" : "Poor"
  };
};
