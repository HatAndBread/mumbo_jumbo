let someNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const arrayShifter = (originalArr) => {
  let first;
  const newArr = originalArr.map((el, index, arr) => {
    if (index === 0) {
      first = el;
    }
    if (arr[index + 1]) {
      return arr[index + 1];
    }
    return first;
  });
  return newArr;
};

console.log(arrayShifter(someNumbers));

console.log(someNumbers);

module.exports = arrayShifter;
