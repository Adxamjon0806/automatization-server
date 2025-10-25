import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve("data");
const COUNTER_PATH = path.join(DATA_DIR, "counter.json");

// Убедимся, что папка существует
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Инициализация файла при первом запуске
if (!fs.existsSync(COUNTER_PATH)) {
  fs.writeFileSync(COUNTER_PATH, JSON.stringify({ value: 1 }, null, 2));
}

// функция для безопасного чтения значения
function getCounterValue() {
  if (!fs.existsSync(COUNTER_PATH)) {
    fs.writeFileSync(COUNTER_PATH, JSON.stringify({ value: 1 }, null, 2));
  }
  const data = fs.readFileSync(COUNTER_PATH, "utf-8");
  const json = JSON.parse(data);
  return json.value;
}

// функция для записи нового значения
function setCounterValue(value) {
  fs.writeFileSync(COUNTER_PATH, JSON.stringify({ value }, null, 2));
}

export { getCounterValue, setCounterValue };
