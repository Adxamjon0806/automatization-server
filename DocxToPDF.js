import ILovePDFApi from "@ilovepdf/ilovepdf-nodejs";
import ILovePDFFile from "@ilovepdf/ilovepdf-nodejs/ILovePDFFile.js";
import fs from "fs";
import dotnev from "dotenv";

dotnev.config();

const instance = new ILovePDFApi(
  process.env.PUBLIC_KEY,
  process.env.SECRET_KEY
);

export async function WordToPDF(path, filesName) {
  const pdfName = filesName.replace(".docx", "");
  const pdfPath = `./${pdfName}.pdf`;
  const task = instance.newTask("officepdf");

  await task.start();

  const file = new ILovePDFFile(path);
  await task.addFile(file);

  await task.process();

  const data = await task.download();

  fs.writeFileSync(pdfPath, data);

  console.log(`✅ PDF успешно создан: ${pdfPath}`);
  return pdfPath;
}
