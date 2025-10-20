import fs from "fs";

const COUNTER_PATH = "./counter.json";

// функция для безопасного чтения значения
function getCounterValue() {
  try {
    const data = fs.readFileSync(COUNTER_PATH, "utf-8");
    const json = JSON.parse(data);
    return json.value ?? 0;
  } catch (error) {
    console.error("Ошибка чтения счётчика:", error);
    return 0;
  }
}

// функция для записи нового значения
function setCounterValue(value) {
  try {
    const tempPath = `${COUNTER_PATH}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify({ value }, null, 2));
    fs.renameSync(tempPath, COUNTER_PATH);
    // fs.writeFileSync(COUNTER_PATH, JSON.stringify({ value }, null, 2));
  } catch (error) {
    console.error("Ошибка записи счётчика:", error);
  }
}

export { getCounterValue, setCounterValue };
