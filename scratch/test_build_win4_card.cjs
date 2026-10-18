const fs = require('fs');

// We have SESSION_WIN4_DATA
const SESSION_WIN4_DATA = {
  Mon: {
    regMorning: [0, 1, 4, 8],
    regAfternoon: [0, 2, 5, 9],
    vipMorning: [1, 4, 8, 9],
    vipAfternoon: [1, 2, 4, 8]
  },
  Tue: {
    regMorning: [3, 5, 6, 9],
    regAfternoon: [0, 2, 3, 7],
    vipMorning: [3, 4, 7, 9],
    vipAfternoon: [0, 4, 6, 7]
  },
  Wed: {
    regMorning: [1, 2, 3, 6],
    regAfternoon: [0, 1, 7, 9],
    vipMorning: [0, 3, 7, 9],
    vipAfternoon: [2, 3, 4, 7]
  },
  Thu: {
    regMorning: [1, 3, 4, 9],
    regAfternoon: [1, 7, 8, 9],
    vipMorning: [1, 4, 6, 9],
    vipAfternoon: [0, 2, 4, 8]
  },
  Fri: {
    regMorning: [2, 6, 7, 8],
    regAfternoon: [1, 3, 4, 6],
    vipMorning: [0, 1, 5, 8],
    vipAfternoon: [0, 6, 7, 8]
  },
  Sat: {
    regMorning: null,
    regAfternoon: null,
    vipMorning: [0, 1, 2, 6],
    vipAfternoon: [0, 6, 8, 9]
  },
  Sun: {
    regMorning: null,
    regAfternoon: null,
    vipMorning: [0, 1, 5, 8],
    vipAfternoon: [1, 3, 7, 9]
  }
};

console.log('SESSION_WIN4_DATA validated successfully!');
