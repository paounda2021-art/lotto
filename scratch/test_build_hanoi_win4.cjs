const fs = require('fs');

const WIN4_HANOI_MAP = {
  Mon: [0, 1, 7, 8],
  Tue: [1, 3, 7, 8],
  Wed: [0, 2, 4, 5],
  Thu: [3, 5, 6, 9],
  Fri: [1, 2, 3, 5],
  Sat: [2, 3, 6, 7],
  Sun: [2, 4, 6, 9]
};

console.log('Testing Hanoi Win4 Map:');
Object.entries(WIN4_HANOI_MAP).forEach(([day, digits]) => {
  const pairs2D = [];
  for (let i = 0; i < digits.length; i++) {
    for (let j = 0; j < digits.length; j++) {
      if (i !== j) pairs2D.push(String(digits[i]) + String(digits[j]));
    }
  }
  const triples3D = [];
  for (let i = 0; i < digits.length; i++) {
    for (let j = i + 1; j < digits.length; j++) {
      for (let k = j + 1; k < digits.length; k++) {
        triples3D.push(String(digits[i]) + String(digits[j]) + String(digits[k]));
      }
    }
  }
  console.log(`Day ${day}: Digits [${digits.join(', ')}] => ${pairs2D.length} 2D pairs, ${triples3D.length} 3D triples`);
});
