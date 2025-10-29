import Id from "./Id.js";

class IdService {
  async getCount() {
    try {
      const ids = await Id.find({});
      return ids[0];
    } catch (e) {
      res.json({ error: { message: "failed to get count", e } });
    }
  }
  async updateCount(count, countBody) {
    try {
      const updatedCount = await Id.updateOne(countBody, { count });
      return updatedCount;
    } catch (e) {
      res.json({ error: { message: "failed to update count", e } });
    }
  }
}

export default new IdService();
