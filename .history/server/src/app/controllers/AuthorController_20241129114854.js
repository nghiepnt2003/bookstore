// const { checkDocumentById } = require("../middlewares/checkDocumentMiddleware");
// const Author = require("../models/Author");
// const Cloud = require("../../config/cloud/cloudinary.config");
// const cloudinary = require("cloudinary").v2;
// class AuthorController {
//   //[GET] /author/:id
//   async getById(req, res) {
//     try {
//       let author = await Author.findOne({ _id: req.params.id });
//       res.status(200).json({ success: author ? true : false, author });
//     } catch (error) {
//       res.status(500).json({ success: false, message: error });
//     }
//   }
//   //[GET] /author/
//   async getAll(req, res) {
//     try {
//       const queries = { ...req.query };
//       // Tách các trường đặc biệt ra khỏi query
//       const excludeFields = ["limit", "sort", "page", "fields"];
//       excludeFields.forEach((el) => delete queries[el]);

//       // Format lại các operators cho đúng cú pháp mongoose
//       let queryString = JSON.stringify(queries);
//       queryString = queryString.replace(
//         /\b(gte|gt|lt|lte)\b/g,
//         (matchedEl) => `$${matchedEl}`
//       );
//       const formatedQueries = JSON.parse(queryString);

//       // Filtering
//       if (queries?.name) {
//         formatedQueries.name = { $regex: queries.name, $options: "i" };
//       }

//       // Execute query
//       let queryCommand = Author.find(formatedQueries);

//       // Sorting
//       if (req.query.sort) {
//         // abc,exg => [abc,exg] => "abc exg"
//         const sortBy = req.query.sort.split(",").join(" ");
//         // sort lần lượt bởi publisher author category nếu truyền  sort("publisher author categories")
//         queryCommand = queryCommand.sort(sortBy);
//       }

//       // fields limiting
//       if (req.query.fields) {
//         const fields = req.query.fields.split(",").join(" ");
//         queryCommand = queryCommand.select(fields);
//       }

//       //Pagination
//       // limit: số docs lấy về 1 lần gọi API
//       // skip:
//       // Dấu + nằm trước số để chuyển sang số
//       // +'2' => 2
//       // +'asdasd' => NaN
//       const page = +req.query.page || 1;
//       const limit = +req.query.limit || process.env.LIMIT_AUTHORS;
//       const skip = (page - 1) * limit;
//       queryCommand.skip(skip).limit(limit);

//       // Lấy danh sách sản phẩm
//       const response = await queryCommand.exec();

//       // Lấy số lượng sản phẩm
//       const counts = await Author.find(formatedQueries).countDocuments();

//       res.status(200).json({
//         success: response.length > 0,
//         counts,
//         authors: response.length > 0 ? response : "Cannot get authors",
//       });
//     } catch (error) {
//       res.status(500).json({ success: false, message: error.message });
//     }
//     // try {
//     //   let authorList = await Author.find({});
//     //   res.status(200).json({ success: authorList ? true : false, authorList });
//     // } catch (error) {
//     //   res.status(500).json({ success: false, message: error });
//     // }
//   }

//   // [POST] /author/store
//   async store(req, res) {
//     try {
//       Cloud.single("image")(req, res, async (err) => {
//         if (err) {
//           console.log(err);
//           return res.status(500).json({
//             success: false,
//             message: "Error uploading image",
//             error: err.message,
//           });
//         }
//         const { name } = req.body;

//         if (!name) {
//           return res
//             .status(400)
//             .json({ success: false, message: "Missing inputs" });
//         }
//         if (req.file && req.file.path) {
//           req.body.image = req.file.path; // URL ảnh trên Cloudinary
//         }

//         const author = new Author(req.body);
//         const savedAuthor = await author.save();

//         // Trả về tài liệu đã lưu thành công
//         res.status(200).json({
//           success: true,
//           message: "Create successful",
//           data: savedAuthor,
//         });
//       });
//     } catch (err) {
//       res
//         .status(500)
//         .json({ success: false, message: "An error occurred " + err });
//     }
//   }

//   //[PUT] /author/:id
//   async update(req, res, next) {
//     try {
//       Cloud.single("image")(req, res, async (err) => {
//         if (err) {
//           console.log(err);
//           return res.status(500).json({
//             success: false,
//             message: "Error uploading image",
//             error: err.message,
//           });
//         }
//         const { id } = req.params;

//         // Kiểm tra sự tồn tại của tài liệu
//         const check = await checkDocumentById(Author, id);
//         if (!check.exists) {
//           return res.status(400).json({
//             success: false,
//             message: check.message,
//           });
//         }
//         // Lấy sản phẩm hiện tại
//         const existingAuthor = await Author.findById(id);
//         if (!existingAuthor) {
//           return res.status(404).json({
//             success: false,
//             message: "Author not found",
//           });
//         }
//         // Xử lý xóa ảnh cũ nếu có ảnh mới được upload
//         if (req.file) {
//           if (existingAuthor.image) {
//             // Lấy public_id từ URL của ảnh hiện tại
//             const publicId = existingAuthor.image
//               .split("/")
//               .pop()
//               .split(".")[0];

//             // Xóa ảnh cũ trên Cloudinary
//             await cloudinary.uploader.destroy(`bookstore/${publicId}`);
//           }

//           // Lấy URL của ảnh mới từ Cloudinary
//           req.body.image = req.file.path; // Lưu URL của ảnh mới
//         }

//         // Cập nhật author
//         const updatedAuthor = await Author.findByIdAndUpdate(id, req.body, {
//           new: true,
//         });

//         res.status(200).json({
//           success: true,
//           message: "Author update successful",
//           data: updatedAuthor,
//         });
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({
//         success: false,
//         message: "An error occurred : " + error,
//       });
//     }
//   }

//   //[DELETE] /author/:id
//   async delete(req, res, next) {
//     try {
//       const { id } = req.params;
//       const check = await checkDocumentById(Author, id);
//       if (!check.exists) {
//         return res.status(400).json({
//           success: false,
//           message: check.message,
//         });
//       }
//       await Author.delete({ _id: req.params.id });
//       res.status(200).json({
//         success: true,
//         message: "Delete successful",
//       });
//       // res.redirect("back");
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: error,
//       });
//     }
//   }
//   //[DELETE] /author/:id/force
//   async forceDelete(req, res, next) {
//     try {
//       await Author.deleteOne({ _id: req.params.id });
//       res.status(200).json({
//         success: true,
//         message: "Delete Force successful",
//       });
//       // res.redirect("back");
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: "An error occurred : " + error,
//       });
//     }
//   }
//   // [PATCH] /author/:id/restore
//   async restore(req, res, next) {
//     try {
//       await Author.restore({ _id: req.params.id });
//       const restoredAuthor = await Author.findById(req.params.id);
//       // Kiểm tra sự tồn tại của tài liệu
//       if (!restoredAuthor) {
//         return res.status(400).json({
//           success: false,
//           message: "Author not found",
//         });
//       }
//       console.log("Restored Author:", restoredAuthor);
//       res.status(200).json({
//         status: true,
//         message: "Restored author",
//         restoredAuthor,
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: "An error occurred : " + error,
//       });
//     }
//   }
// }

// module.exports = new AuthorController();

const uploadImageMiddleware = require("../middlewares/uploadImage");

class AuthorController {
  async store(req, res) {
    try {
      uploadImageMiddleware(req, res, async () => {
        const { name } = req.body;
        if (!name) {
          return res
            .status(400)
            .json({ success: false, message: "Missing inputs" });
        }
        if (req.file && req.file.path) {
          req.body.image = req.file.path;
        }
        const author = new Author(req.body);
        const savedAuthor = await author.save();
        res.status(200).json({
          success: true,
          message: "Create successful",
          data: savedAuthor,
        });
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "An error occurred " + err });
    }
  }
}
