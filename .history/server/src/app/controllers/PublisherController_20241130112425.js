const { checkDocumentById } = require("../middlewares/checkDocumentMiddleware");
const Publisher = require("../models/Publisher");
const publisherService = require("../services/publisherService");

class PublisherController {
  //[GET] /publisher/:id
  async getById(req, res) {
    try {
      const publisher = await publisherService.getById(req.params.id);
      res.status(200).json({ success: publisher ? true : false, publisher });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  //[GET] /publisher/
  async getAll(req, res) {
    try {
      const queries = { ...req.query };
      const { response, counts } = await publisherService.getAll(queries);

      res.status(200).json({
        success: response.length > 0,
        counts,
        publishers: response.length > 0 ? response : "Cannot get publisher",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  // [POST] /publisher/store
  async store(req, res) {
    try {
      const { name } = req.body;

      if (!name) {
        return res
          .status(400)
          .json({ success: false, message: "Missing inputs" });
      }

      const savedPublisher = await publisherService.store(req.body);
      res.status(201).json({
        success: true,
        message: "Create successful",
        data: savedPublisher,
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "An error occurred" + err });
    }
  }

  //[PUT] /publisher/:id
  async update(req, res) {
    try {
      const { id } = req.params;

      const check = await checkDocumentById(Publisher, id);
      if (!check.exists) {
        return res.status(400).json({
          success: false,
          message: check.message,
        });
      }

      const updatedPublisher = await publisherService.update(id, req.body);
      res.status(200).json({
        success: true,
        message: "Publisher update successful",
        data: updatedPublisher,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
      });
    }
  }

  //[DELETE] /publisher/:id
  async delete(req, res) {
    try {
      const { id } = req.params;
      const check = await checkDocumentById(Publisher, id);
      if (!check.exists) {
        return res.status(400).json({
          success: false,
          message: check.message,
        });
      }

      await publisherService.delete(id);
      res.status(200).json({
        success: true,
        message: "Delete successful",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
      });
    }
  }
  //[DELETE] /publisher/:id/force
  async forceDelete(req, res) {
    try {
      await publisherService.forceDelete(req.params.id);
      res.status(200).json({
        success: true,
        message: "Delete Force successful",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
      });
    }
  }
  // [PATCH] /publisher/:id/restore
  async restore(req, res) {
    try {
      await publisherService.restore(req.params.id);
      const restoredPublisher = await publisherService.getById(req.params.id);
      if (!restoredPublisher) {
        return res.status(400).json({
          success: false,
          message: "Publisher not found",
        });
      }
      res.status(200).json({
        success: true,
        message: "Restored publisher",
        restoredPublisher,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
      });
    }
  }
}

module.exports = new PublisherController();
