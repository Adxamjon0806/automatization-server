import { Router } from "express";
import fs from "fs";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { __dirname } from "./index.js";
import { abonentTarrifDatas, tarrifDatas } from "./emptyTables.js";
import { getCounterValue, setCounterValue } from "./counterLogic.js";
import { sendDocumentToFirst, sendTextToGroup } from "./botSendingFunc.js";
import { WordToPDF } from "./DocxToPDF.js";

const router = new Router();

const emptyUnderlines = "______________";

let isLocked = false;
const waitForUnlock = async () => {
  while (isLocked) {
    await new Promise((resolve) => setTimeout(resolve, 10)); // ждём, пока файл освободится
  }
};

router.post("/new-legal-entity-agreement", async (req, res) => {
  try {
    await waitForUnlock(); // ждём, пока другой запрос закончит запись
    isLocked = true;

    const count = getCounterValue();
    let tarrifsTotal = 0;
    let abonentTarrifsTotal = 0;
    const datas = req.body;
    const day = new Date(datas.date).getDate();
    const month = new Date(datas.date).getMonth() + 1;
    const filesName =
      datas.companyName.split(" ").join("_") +
      `_Договор_№_U_25_${count}_от_2025_юр` +
      ".docx";

    const template = fs.readFileSync("ДоговорДляСервера.docx", "binary");
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
      address: `Адрес:${datas.address ? datas.address : emptyUnderlines}`,
      phone: `Телефон: ${datas.phone ? datas.phone : emptyUnderlines}`,
      account: `Р/с: ${datas.account ? datas.account : emptyUnderlines}`,
      bank: `Банк: ${datas.bank ? datas.bank : emptyUnderlines}`,
      nfo: `МФО: ${datas.nfo ? datas.nfo : emptyUnderlines},`,
      okef: `ОКЭД: ${datas.okef ? datas.okef : emptyUnderlines}`,
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

    const filePath = `./${filesName}`;
    fs.writeFileSync(filePath, buffer);

    const pdfPath = await WordToPDF(filePath, filesName);

    await sendDocumentToFirst(pdfPath, datas, count);
    await sendTextToGroup(datas, count);

    // Вариант для старых браузеров — безопасное экранирование кавычек
    const safeFileName = filesName.replace(/[\/\\?%*:|"<>']/g, "_").trim();
    console.log(safeFileName);

    const docxBuffer = fs.readFileSync(filePath);
    const pdfBuffer = fs.readFileSync(pdfPath);

    res.status(200).json({
      docx: docxBuffer.toString("base64"),
      pdf: pdfBuffer.toString("base64"),
      filesName,
    });

    setCounterValue(count + 1);

    fs.unlinkSync(filePath);
    fs.unlinkSync(pdfPath);
  } catch (e) {
    console.error("Error at creating new Legal Entity agreement route", e);
    // Отправляем ошибку клиенту, если ответ еще не был отправлен
    if (!res.headersSent) {
      res.status(500).json({
        error: "Ошибка при создании договора для юридических лиц",
        message: e.message,
      });
    }
  } finally {
    isLocked = false; // снимаем блокировку
  }
});

router.post("/new-individual-agreement", async (req, res) => {
  try {
    await waitForUnlock(); // ждём, пока другой запрос закончит запись
    isLocked = true;

    const count = getCounterValue();
    let tarrifsTotal = 0;
    let abonentTarrifsTotal = 0;
    const datas = req.body;
    const day = new Date(datas.date).getDate();
    const month = new Date(datas.date).getMonth() + 1;
    const givenDay = datas.givenAt ? new Date(datas.givenAt).getDate() : "___";
    const givenMonth = datas.givenAt
      ? new Date(datas.givenAt).getMonth() + 1
      : "___";
    const givenYear = datas.givenAt
      ? new Date(datas.givenAt).getFullYear()
      : "______";
    const filesName =
      datas.personName.split(" ").join("_") +
      `_Договор_№_U_25_${count}_от_2025_физ` +
      ".docx";

    const template = fs.readFileSync("Договорфиз.docx", "binary");
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
      day: day < 10 ? "0" + day : day,
      month: month < 10 ? "0" + month : month,
      givenDay: givenDay < 10 ? "0" + givenDay : givenDay,
      givenMonth: givenMonth < 10 ? "0" + givenMonth : givenMonth,
      givenYear,
      givenFrom: datas.givenFrom ? datas.givenFrom : "________________",
      phone: datas.phone ? datas.phone : "_____________________",
      pinfl: datas.pinfl ? datas.pinfl : "_____________________",
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

    const filePath = `./${filesName}`;
    fs.writeFileSync(filePath, buffer);

    const pdfPath = await WordToPDF(filePath, filesName);

    await sendDocumentToFirst(pdfPath, datas, count);
    // await sendTextToGroup(datas, count);

    // Вариант для старых браузеров — безопасное экранирование кавычек
    const safeFileName = filesName.replace(/[\/\\?%*:|"<>']/g, "_").trim();
    console.log(safeFileName);

    const docxBuffer = fs.readFileSync(filePath);
    const pdfBuffer = fs.readFileSync(pdfPath);

    res.status(200).json({
      docx: docxBuffer.toString("base64"),
      pdf: pdfBuffer.toString("base64"),
      filesName,
    });

    setCounterValue(count + 1);

    fs.unlinkSync(filePath);
    fs.unlinkSync(pdfPath);
  } catch (e) {
    console.error("Error at creating new Individual agreement route", e);
    // Отправляем ошибку клиенту, если ответ еще не был отправлен
    if (!res.headersSent) {
      res.status(500).json({
        error: "Ошибка при создании договора для физических лиц",
        message: e.message,
      });
    }
  } finally {
    isLocked = false; // снимаем блокировку
  }
});

export default router;
