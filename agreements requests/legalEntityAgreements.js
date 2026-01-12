import fs from "fs";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { abonentTarrifDatas, tarrifDatas } from "../emptyTables.js";
import { sendDocumentToFirst, sendTextToGroup } from "../botSendingFunc.js";
import { WordToPDF } from "../DocxToPDF.js";
import IdService from "../IdService.js";
import { lock, waitForUnlock } from "../lock.js";

const emptyUnderlines = "______________";

export const legalEntityAgreements = async (req, res) => {
  try {
    await waitForUnlock(); // ждём, пока другой запрос закончит запись
    lock.isLocked = true;
    const datas = req.body;

    const countBody = await IdService.getCount();
    const count =
      datas.agreementCount !== "" ? datas.agreementCount : countBody.count;
    console.log(count);
    let tarrifsTotal = 0;
    let abonentTarrifsTotal = 0;
    const companyInitialLetter = datas.dealingCompany === "UZGPS" ? "U" : "GPS";
    const day = new Date(datas.date).getDate();
    const month = new Date(datas.date).getMonth() + 1;
    const filesName =
      datas.companyName
        .split('"')
        .join("")
        .split("'")
        .join("")
        .split(" ")
        .join("_") +
      `_Договор_№_${companyInitialLetter}_25_${count}_от_2025_юр` +
      ".docx";
    console.log(filesName);

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
      phone: `Телефон: ${datas.phone}`,
      account: `Р/с: ${datas.account ? datas.account : emptyUnderlines}`,
      bank: `Банк: ${datas.bank ? datas.bank : emptyUnderlines}`,
      mfo: `МФО: ${datas.mfo},`,
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
      dealingCompanyName:
        datas.dealingCompany === "UZGPS"
          ? "ООО «UZGPS»"
          : "ООО «Центр программистов BePro»",
      companyInitialLetter,
      topCompanyCEO:
        datas.dealingCompany === "UZGPS"
          ? "Директора"
          : "Руководителя Департамента развития услуг UZGPS",
      bottomCompanyCEO:
        datas.dealingCompany === "UZGPS"
          ? "Директор"
          : "Руководитель Департамента развития услуг UZGPS",
      dealingAccount:
        datas.dealingCompany === "UZGPS"
          ? "2020 8000 2051 3352 7001"
          : "2020 8000 3043 2850 9001",
      dealingBank:
        datas.dealingCompany === "UZGPS"
          ? "«Ипотекабанк» АТИБ Яккасарой филиали"
          : "ОПЕРУ АК «Алокабанк», г.Ташкент",
      dealingMFO: datas.dealingCompany === "UZGPS" ? "01017" : "00401",
      dealingOKED: datas.dealingCompany === "UZGPS" ? "61300" : "62010",
      dealingInn:
        datas.dealingCompany === "UZGPS" ? "306 792 862" : "204 973 561",
      NDSCode:
        datas.dealingCompany === "UZGPS" ? "Рег. Код НДС: 3260 6002 2843 " : "",
    };

    doc.render(data);

    const buffer = doc.getZip().generate({ type: "nodebuffer" });

    const filePath = `./${filesName}`;
    console.log(filePath);
    fs.writeFileSync(filePath, buffer);

    const pdfPath = await WordToPDF(filePath, filesName);

    await sendTextToGroup(datas, count, companyInitialLetter);
    await sendDocumentToFirst(pdfPath, datas, count);

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

    if (datas.agreementCount === "") {
      await IdService.updateCount(count + 1, countBody);
    }

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
    lock.isLocked = false; // снимаем блокировку
  }
};
