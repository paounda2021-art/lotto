const crypto = require('crypto');

function l_(payload, ivStr) {
  const key = Buffer.from("7x!A$9vP#2mK8L@q5wZ&1nE*4jU(6tY)", 'utf8');
  // iv is ascii/utf8 string of 16 chars or hex? Let's test both Buffer.from(ivStr, 'utf8') and Buffer.from(ivStr, 'hex')
  try {
    const iv = Buffer.from(ivStr, 'utf8');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(payload, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch (e) {
    try {
      const iv = Buffer.from(ivStr, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      let decrypted = decipher.update(payload, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      return JSON.parse(decrypted);
    } catch (e2) {
      return null;
    }
  }
}

const payload = 'Pcg4GJqLT4Hgtb3i2bVeD1MlhhOrt9ZOLXzf0uFxAxex3IhUFy9WlOCPjxtnBZPtcX/PFvOkAcBgFC6h401YuNSv/DnK/SOWG4r2owSwmFAIZIowI9y6OiFqTdC/mHq2ld8rCvlackEEY8GBeo6iY77RXByhLY6U1atY6HtUftRydynxHwKcVUWkVT4nTKH3G8h7uWxlj+qjlDEtobi/C+iMb/R7SMIY1DaTNZq0wvhnfVX4WELSpD/PMrsNri7A6S5D5oXO0n6fMeqA42DVg7lbJLTYnwf85XED';
const iv = 'axpQG9RNmPRG4EaF';

console.log('Result:', l_(payload, iv));
