const AuthorService = require("../services/authorService");
const Cloud = require("../../config/cloud/cloudinary.config");

class AuthorController {
  //[GET] /author/:id
  async getById(req, res) {
    try {
      const author = await AuthorService.getAuthorById(req.params.id);
      res.status(200).json({ success: !!author, author });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  //[GET] /author/
  async getAll(req, res) {
    try {
      const options = {
        page: +req.query.page || 1,
        limit: +req.query.limit || process.env.LIMIT_AUTHORS,
        sort: req.query.sort,
        fields: req.query.fields,
      };
      const { authors, totalCount } = await AuthorService.getAllAuthors(
        req.query,
        options
      );
      res.status(200).json({
        success: authors.length > 0,
        counts: totalCount,
        authors: authors.length > 0 ? authors : "Cannot get authors",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  //[POST] /author/store
  async store(req, res) {
    Cloud.single("image")(req, res, async (err) => {
      try {
        if (err) throw new Error(err.message);
        const savedAuthor = await AuthorService.createAuthor(
          req.body,
          req.file?.path
        );
        res.status(200).json({
          success: true,
          message: "Create successful",
          data: savedAuthor,
        });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    });
  }

  //[PUT] /author/:id
  async update(req, res) {
    Cloud.single("image")(req, res, async (err) => {
      try {
        if (err) throw new Error(err.message);
        const updatedAuthor = await AuthorService.updateAuthor(
          req.params.id,
          req.body,
          req.file?.path
        );
        res.status(200).json({
          success: true,
          message: "Author update successful",
          data: updatedAuthor,
        });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    });
  }

  //[DELETE] /author/:id
  async delete(req, res) {
    try {
      await AuthorService.deleteAuthor(req.params.id);
      res.status(200).json({ success: true, message: "Delete successful" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  //[DELETE] /author/:id/force
  async forceDelete(req, res) {
    try {
      await AuthorService.forceDeleteAuthor(req.params.id);
      res
        .status(200)
        .json({ success: true, message: "Force delete successful" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  //[PATCH] /author/:id/restore
  async restore(req, res) {
    try {
      const restoredAuthor = await AuthorService.restoreAuthor(req.params.id);
      if (!restoredAuthor)
        return res
          .status(404)
          .json({ success: false, message: "Author not found" });
      res.status(200).json({
        success: true,
        message: "Restored author",
        data: restoredAuthor,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AuthorController();
