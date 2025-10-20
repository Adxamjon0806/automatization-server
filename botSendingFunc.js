// import dotenv from "dotenv";
// import bot from "./botInstance.js";

// dotenv.config();

// const firstChatId = process.env.FIRST_CHAT_ID;
// const secondChatId = process.env.SECOND_CHAT_ID;

// export async function sendDocumentToFirst(filePath, data, count) {
//   try {
//     await bot.sendDocument(firstChatId, filePath, {
//       caption: `U-25/${count} ${data.companyName}\n`,
//     });
//   } catch (e) {
//     console.error("Error at sending document to telegram group", e);
//   }
// }

// export async function sendTextToGroup(data, count) {
//   try {
//     let tarrifCaptions = "";
//     let caption;

//     if (data.tarrifs.length) {
//       for (let i = 0; i < data.tarrifs.length; i++) {
//         const { name, price, count } = data.tarrifs[i];
//         tarrifCaptions += `${name} по ${price} сум - ${count} шт\n`;
//       }
//     }

//     if (data.abonentTarrifs.length) {
//       for (let i = 0; i < data.abonentTarrifs.length; i++) {
//         const { name, price, count, term } = data.abonentTarrifs[i];
//         tarrifCaptions += `Тариф ${name} по ${price} сум - ${term} месяц - ${count} шт\n`;
//       }
//     }

//     caption = `U-25/${count} ${data.companyName}\n` + tarrifCaptions;

//     await bot.sendMessage(secondChatId, caption);
//   } catch (e) {
//     console.error("Error at sending text to telegram group", e);
//   }
// }

// botSendingFunc.js
import dotenv from "dotenv";
import fs from "fs";
import bot from "./botInstance.js";

dotenv.config();

const firstChatId = process.env.FIRST_CHAT_ID;
const secondChatId = process.env.SECOND_CHAT_ID;

export async function sendDocumentToFirst(filePath, data, count) {
  console.log("📤 [sendDocumentToFirst] запуск функции, путь:", filePath);
  try {
    // Проверим наличие файла
    if (!fs.existsSync(filePath)) {
      console.error("❌ File does not exist:", filePath);
      return;
    }

    const fileStream = fs.createReadStream(filePath);

    const sentMessage = await bot.sendDocument(firstChatId, fileStream, {
      caption: `U-25/${count} ${data.companyName}`,
    });

    console.log("✅ Document successfully sent:", sentMessage.message_id);
  } catch (e) {
    console.error("❌ Error at sending document to telegram group:", e.message);
  }
}

export async function sendTextToGroup(data, count) {
  try {
    let tarrifCaptions = "";

    if (data.tarrifs?.length) {
      for (let i = 0; i < data.tarrifs.length; i++) {
        const { name, price, count: c } = data.tarrifs[i];
        tarrifCaptions += `${name} по ${price} сум - ${c} шт\n`;
      }
    }

    if (data.abonentTarrifs?.length) {
      for (let i = 0; i < data.abonentTarrifs.length; i++) {
        const { name, price, count: c, term } = data.abonentTarrifs[i];
        tarrifCaptions += `Тариф ${name} по ${price} сум - ${term} месяц - ${c} шт\n`;
      }
    }

    const caption = `U-25/${count} ${data.companyName}\n` + tarrifCaptions;

    await bot.sendMessage(secondChatId, caption);
    console.log("✅ Text message sent to group.");
  } catch (e) {
    console.error("❌ Error at sending text to telegram group:", e.message);
  }
}
