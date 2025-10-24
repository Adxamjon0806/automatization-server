let count = 1;

// функция для безопасного чтения значения
function getCounterValue() {
  return count;
}

// функция для записи нового значения
function setCounterValue(value) {
  count = value;
}

export { getCounterValue, setCounterValue };
