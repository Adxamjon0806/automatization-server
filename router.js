import { Router } from "express";
import IdService from "./IdService.js";
import { legalEntityAgreements } from "./agreements requests/legalEntityAgreements.js";
import { individualAgreements } from "./agreements requests/individualAgreements.js";

const router = new Router();

router.post("/new-legal-entity-agreement", legalEntityAgreements);
router.post("/new-individual-agreement", individualAgreements);

router.get("/get-count", async (req, res) => {
  try {
    const count = await IdService.getCount();
    res.status(200).json({ count });
  } catch (e) {
    res.status(500).json({
      error: "Ошибка при получении счёта",
    });
  }
});

router.post("/change-count", async (req, res) => {
  try {
    const datas = req.body;
    console.log(datas);
    await IdService.updateCount(datas.count, datas.countBody);
    const newCount = await IdService.getCount();
    res.status(200).json({ newCount });
  } catch (e) {
    res
      .status(500)
      .json({ error: "Ошибка при изменении счёта", message: e.message });
  }
});

export default router;
