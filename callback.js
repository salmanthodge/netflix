const filter = (callback, array) => {
  let returnArr = [];

  for (let i = 0; i < array.length; i++) {
    if (callback(array[i])) {
      returnArr.push(array[i]);
    }
  }
  return returnArr;
};

const arr = [1, 2, 3, 4, 5, 6];

const filteredArr = filter((value) => {
  if (value > 2) {
    return true;
  }
}, arr);

console.log(filteredArr);
