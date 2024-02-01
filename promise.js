//self promise
// app.get("/users", (req, res) => {
//   let promise = new Promise((resolve, reject) => {
//     connect.query("SELECT * from users", (err, result) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(result);
//       }
//     });
//   })
//     .then((result) => {
//       res.send(result);
//     })
//     .catch((error) => {
//       res.send(error);
//     });
// });
