import { Router } from "express";
import fs from "fs";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { __dirname } from "./index.js";
import { abonentTarrifDatas, tarrifDatas } from "./emptyTables.js";
import { getCounterValue, setCounterValue } from "./counterLogic.js";
import { sendDocumentToFirst, sendTextToGroup } from "./botSendingFunc.js";

const router = new Router();

let isLocked = false;
const waitForUnlock = async () => {
  while (isLocked) {
    await new Promise((resolve) => setTimeout(resolve, 10)); // ждём, пока файл освободится
  }
};

router.post("/new-agreement", async (req, res) => {
  console.log("🟡 1 — маршрут /new-agreement вызван");
  try {
    await waitForUnlock(); // ждём, пока другой запрос закончит запись
    isLocked = true;
    console.log("🟢 2 — после waitForUnlock");

    const count = getCounterValue();
    console.log("🟢 3 — count =", count);
    let tarrifsTotal = 0;
    let abonentTarrifsTotal = 0;
    const datas = req.body;
    console.log("🟢 4 — получены данные:", datas.companyName);
    const day = new Date(datas.date).getDate();
    const month = new Date(datas.date).getMonth() + 1;

    const template = fs.readFileSync("ДоговорДляСервера.docx", "binary");
    console.log("🟢 5 — шаблон прочитан");
    const zip = new PizZip(template);

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: "[[", end: "]]" },
    });

    if (datas.tarrifs.length > 0) {
      for (let i = 0; i < datas.tarrifs.length; i++) {
        const element = datas.tarrifs[i];
        tarrifsTotal += element.totalPrice;
      }
    } else {
      tarrifsTotal = "";
    }
    if (datas.abonentTarrifs.length > 0) {
      for (let i = 0; i < datas.abonentTarrifs.length; i++) {
        const element = datas.abonentTarrifs[i];
        abonentTarrifsTotal += element.totalPrice;
      }
    } else {
      abonentTarrifsTotal = "";
    }

    const data = {
      ...datas,
      count,
      directorName: datas.directorName
        ? datas.directorName
        : "__________________________________________________",
      directorNameBottom: datas.directorName ? datas.directorName : "",
      address: datas.address ? `Адрес: ${datas.address}` : "",
      phone: datas.phone ? `Телефон: ${datas.phone}` : "",
      account: datas.account ? `Р/с: ${datas.account}` : "",
      bank: datas.bank ? `Банк: ${datas.bank}` : "",
      nfo: datas.nfo ? `МФО: ${datas.nfo},` : "",
      okef: datas.okef ? `ОКЭД: ${datas.okef}` : "",
      day: day < 10 ? "0" + day : day,
      month: month < 10 ? "0" + month : month,
      tarrifs: datas.tarrifs.length > 0 ? datas.tarrifs : tarrifDatas,
      abonentTarrifs:
        datas.abonentTarrifs.length > 0
          ? datas.abonentTarrifs
          : abonentTarrifDatas,
      tarrifsTotal,
      abonentTarrifsTotal,
    };

    doc.render(data);

    const buffer = doc.getZip().generate({ type: "nodebuffer" });

    const filePath = "./output.docx";
    fs.writeFileSync(filePath, buffer);
    console.log("🟢 6 — файл записан:", filePath);

    await sendDocumentToFirst(filePath, datas, count);
    console.log("🟢 7 — отправка документа выполнена");
    await sendTextToGroup(datas, count);
    console.log("🟢 8 — отправка текста выполнена");

    // Заголовки для скачивания файла
    res.setHeader("Content-Disposition", "attachment; filename=output.docx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    res.send(buffer);
    console.log("🟢 9 — ответ отправлен");

    setCounterValue(count + 1);
  } catch (e) {
    console.error("Error at creating new agreement route", e);
    // Отправляем ошибку клиенту, если ответ еще не был отправлен
    if (!res.headersSent) {
      res.status(500).json({
        error: "Ошибка при создании договора",
        message: e.message,
      });
    }
  } finally {
    isLocked = false; // снимаем блокировку
    console.log("🟣 10 — разблокировано");
  }
});

export default router;
