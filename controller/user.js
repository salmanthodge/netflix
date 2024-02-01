// const { conn } = require("../index");

// //GET ALL USERS
// exports.getAllUser = async (req, res) => {
//   const { limit, offset, sort } = req.query;
//   console.log(req.headers);
//   const queryData = req.query;
//   let is_active = queryData.is_active;
//   if (!is_active) {
//     res.status(400).send({
//       message: "IsActive is Required",
//     });
//   }

//   try {
//     let queryString = `SELECT id,name,email,is_active,created_at from users WHERE is_active = ? order by id ${sort} LIMIT ? OFFSET ? `;
//     const [result] = await conn
//       .promise()
//       .execute(queryString, [is_active, limit, offset]);

//     let countQueryString = `SELECT count(id) as count from users where is_active = ?`;
//     const [countResult] = await conn
//       .promise()
//       .execute(countQueryString, [is_active]);

//     const responseBody = {
//       message: "Successfully got all users",
//       list: result,
//       count: countResult[0].count,
//     };
//     res.status(200).send(responseBody);
//     // console.log(result);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       message: "Error while getting user",
//       error,
//     });
//   }
// };

// //GET SINGLE USER
// const getUser = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // console.log(req);
//     let queryString = `SELECT * from users where id = ?`;
//     const [result] = await conn.promise().execute(queryString, [id]);
//     if (result.length === 0) {
//       res.status(404).send({
//         message: "User not found",
//       });
//     } else {
//       res.status(200).send({
//         message: "Successfully retrieved user",
//         result,
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       message: "Error while getting user",
//       error,
//     });
//   }
// };

// //CREATE USER
// const createUser = async (req, res) => {
//   try {
//     const { name, is_active, email, password, created_at } = req.body;

//     let queryString = `insert into users
//       (name,is_active,email,password,created_at)
//        values (?, ?, ?, ?, ?)`;
//     const [result] = await conn
//       .promise()
//       .execute(queryString, [name, is_active, email, password, created_at]);

//     res.status(201).send({
//       message: "User created successfully",
//       result,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       message: "Error while creating user",
//       error,
//     });
//   }
// };

// //UPDATE USER
// const updateUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, email, is_active, password, created_at } = req.body;
//     let queryString = `UPDATE users SET name = ?,email = ?, is_active = ?,password = ?,created_at = ? WHERE id = ?`;
//     const [result] = await conn
//       .promise()
//       .execute(queryString, [name, email, is_active, password, created_at, id]);
//     if (result.affectedRows === 0) {
//       res.status(404).send({
//         message: "User not found",
//       });
//     } else {
//       res.status(200).send({
//         message: "User updated Succesfully",
//         result,
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       message: "Error while updating user",
//       error,
//     });
//   }
// };

// //DELETE USER
// const deleteUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     let queryString = `DELETE from users WHERE id = ?`;
//     const [result] = await conn.promise().execute(queryString, [id]);
//     if (result.affectedRows === 0) {
//       res.status(404).send({
//         message: "User not found",
//       });
//     } else {
//       res.status(200).send({
//         message: "User deleted successfully",
//         result,
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       message: "Error while deleting user",
//       error,
//     });
//   }
// };

// // module.exports = {
// //   getAllUser,
// //   getUser,
// //   createUser,
// //   updateUser,
// //   deleteUser,
// // };
