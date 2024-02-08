const express = require("express");
const router = express.Router();
const conn = require("./database");

//USERS
//GET ALL USERS
const getAllUser = async (req, res) => {
  try {
    const { limit, offset, sort } = req.query;
    // console.log(req.query);
    if (!req.query) {
      res.status(400).send({
        message: "bad request",
      });
    }
    let queryString = `SELECT id,name,email,is_active,created_at from users  order by id ${sort} LIMIT ? OFFSET ? `;
    const [result] = await conn.promise().execute(queryString, [limit, offset]);

    let countQueryString = `SELECT count(id) as count from users `;
    const [countResult] = await conn.promise().execute(countQueryString);

    const responseBody = {
      message: "Successfully got all users",
      list: result,
      count: countResult[0].count,
    };
    res.status(200).send(responseBody);
    // console.log(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while getting user",
      error,
    });
  }
};

//LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email && !password) {
      res.status(400).send({
        message: "Misssing parameters",
      });
    } else {
      let queryString = `SELECT email,password from users where email =? and password =?`;
      const [result] = await conn
        .promise()
        .execute(queryString, [email, password]);

      if (result.length === 0) {
        res.status(404).send({
          message: "User not found",
        });
      } else {
        res.status(200).send({
          message: "Login Successfully ",
          result,
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while getting user",
      error,
    });
  }
};

//FORGOT PASSWORD
const generateRandomOTP = () => {
  // Generate a random 4-digit OTP
  return Math.floor(1000 + Math.random() * 9000);
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).send({
        message: "Missing email parameter",
      });
      return;
    }

    // Check if the email exists in the database
    let queryString = `SELECT email FROM users WHERE email = ?`;
    const [result] = await conn.promise().execute(queryString, [email]);

    if (result.length === 0) {
      res.status(404).send({
        message: "Email not found",
      });
      return;
    }

    // Assuming you have a field named 'otp' in your users table
    const otp = generateRandomOTP();

    queryString = `UPDATE users SET otp = ? WHERE email = ?`;
    await conn.promise().execute(queryString, [otp, email]);

    res.status(200).send({
      message: "OTP sent for password reset",
      otp,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Error during password reset",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      res.status(400).send({
        message: "Missing parameters",
      });
      return;
    }

    let queryString = `SELECT otp FROM users WHERE email = ?`;
    const [result] = await conn.promise().execute(queryString, [email]);

    if (result.length === 0 || result[0].otp !== otp) {
      res.status(404).send({
        message: "Invalid OTP",
      });
    } else {
      // Update the password and clear the OTP after successful verification
      queryString = `UPDATE users SET password = ?, otp = null WHERE email = ?`;
      await conn.promise().execute(queryString, [newPassword, email]);

      res.status(200).send({
        message: "Password reset successfully",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Error during password reset",
    });
  }
};

const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.params);
    if (!req.params) {
      res.status(400).send({
        message: "bad request",
      });
    }
    let queryString = `SELECT * from users where id = ?`;
    const [result] = await conn.promise().execute(queryString, [id]);

    if (result.length === 0) {
      res.status(404).send({
        message: "User not found",
      });
    }
    res.status(200).send({
      message: "Successfully retrieved user",
      result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while getting user",
      error,
    });
  }
};

//CREATE USER
const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!req.body || !req.body.name || !req.body.email || !req.body.password) {
      return res.status(400).send({
        message: "bad request",
      });
    }
    let queryString = `insert into users
      (name,email,password)
       values (?, ?, ?)`;
    const [result] = await conn
      .promise()
      .execute(queryString, [name, email, password]);

    res.status(201).send({
      message: "User created successfully",
      result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while creating user",
      error,
    });
  }
};

//UPDATE USER
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;
    if (!id) {
      res.status(400).send({
        message: "bad request",
      });
    }
    if (!name && !email && !password) {
      res.status(400).send({
        message: "bad request",
      });
    }

    let Arrdata = [];
    let values = [];
    if (name) {
      Arrdata.push("name= ?");
      values.push(name);
    }
    if (email) {
      Arrdata.push("email= ?");
      values.push(email);
    }
    if (password) {
      Arrdata.push("password= ?");
      values.push(password);
    }

    let str = Arrdata.join(",");

    let queryString = `UPDATE users SET ${str} WHERE id = ?`;
    const [result] = await conn.promise().execute(queryString, [...values, id]);
    if (result.affectedRows === 0) {
      res.status(404).send({
        message: "User not found",
      });
    }
    res.status(200).send({
      message: "User updated Succesfully",
      result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while updating user",
      error,
    });
  }
};

//DELETE USER
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.params) {
      return res.status(400).send({
        message: "Bad request",
      });
    }
    let queryString = `DELETE from users WHERE id = ?`;
    const [result] = await conn.promise().execute(queryString, [id]);
    if (result.affectedRows === 0) {
      res.status(404).send({
        message: "User not found",
      });
    } else {
      res.status(200).send({
        message: "User deleted successfully",
        result,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while deleting user",
      error,
    });
  }
};

//routes
// user routes
router.post("/users", createUser); //   <== Registor
router.post("/login", loginUser);
//auth
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/users", getAllUser);
router.get("/users/:id", getUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
// ==============================================================================================

//PROFILES
//get all profiles
const getAllProfiles = async (req, res) => {
  try {
    const { user_id, limit, offset, sort } = req.query;

    // console.log(req.headers);
    if (!req.query) {
      res.status(400).send({
        message: "Bad Request",
      });
    }
    let queryString = `SELECT users.name AS user_name, users.email,profiles.name AS profile_name, profiles.type
      FROM profiles
      INNER JOIN users ON users.id = profiles.user_id WHERE user_id = ? order by user_id ${sort} LIMIT ? OFFSET ? `;
    const [result] = await conn
      .promise()
      .execute(queryString, [user_id, limit, offset]);

    let countQueryString = `SELECT count(id) as count from profiles WHERE user_id = ?`;
    const [countResult] = await conn
      .promise()
      .execute(countQueryString, [user_id]);

    const responseBody = {
      message: "Successfully got all profiles",
      list: result,
      count: countResult[0].count,
    };
    res.status(200).send(responseBody);
    // console.log(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while getting profiles",
      error,
    });
  }
};

//GET SINGLE PROFILES
const getProfiles = async (req, res) => {
  try {
    const { id } = req.params;

    // console.log(req);
    let queryString = `SELECT * from profiles where id = ?`;
    const [result] = await conn.promise().execute(queryString, [id]);
    if (result.length === 0) {
      res.status(404).send({
        message: "profile not found",
      });
    } else {
      res.status(200).send({
        message: "Successfully retrieved user",
        result,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while getting user",
      error,
    });
  }
};

//CREATE PROFILES
const createProfiles = async (req, res) => {
  try {
    const { name, limits, type, user_id } = req.body;

    let queryString = `INSERT INTO profiles (name, limits, type, user_id)
      VALUES (?, ?, ?, ?)`;
    const [result] = await conn
      .promise()
      .execute(queryString, [name, limits, type, user_id]);

    res.status(201).send({
      message: "Profile created successfully",
      result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while creating Profile",
      error,
    });
  }
};

//UPDATE PROFILES
const updateProfiles = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, limits, type, user_id } = req.body;
    let queryString = `UPDATE profiles SET name = ?,limits =?, type=?, user_id=? WHERE id = ?`;
    const [result] = await conn
      .promise()
      .execute(queryString, [name, limits, type, user_id, id]);
    if (result.affectedRows === 0) {
      res.status(404).send({
        message: "profile not found",
      });
    } else {
      res.status(200).send({
        message: "profile updated Succesfully",
        result,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while updating profile",
      error,
    });
  }
};

//DELETE PROFILES
const deleteProfiles = async (req, res) => {
  try {
    const { id } = req.params;
    let queryString = `DELETE from profiles WHERE id = ?`;
    const [result] = await conn.promise().execute(queryString, [id]);
    if (result.affectedRows === 0) {
      res.status(404).send({
        message: "Profiles not found",
      });
    } else {
      res.status(200).send({
        message: "Profiles deleted successfully",
        result,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while deleting Profiles",
      error,
    });
  }
};

// ROUTES
// profiles routes
router.get("/profiles", getAllProfiles);
router.get("/profiles/:id", getProfiles);
router.post("/profiles", createProfiles);
router.put("/profiles/:id", updateProfiles);
router.delete("/profiles/:id", deleteProfiles);
// =====================================================================================================

//Get all videos=>content
const getAllContents = async (req, res) => {
  const { limit, offset, sort } = req.query;
  // console.log(req.headers);
  const queryData = req.query;
  let is_active = queryData.is_active;
  if (!is_active) {
    res.status(400).send({
      message: "This content is not available",
    });
  }

  try {
    let queryString = `SELECT id,title,description,type,release_date from contents WHERE is_active = ? order by id ${sort} LIMIT ? OFFSET ? `;
    const [result] = await conn
      .promise()
      .execute(queryString, [is_active, limit, offset]);

    let countQueryString = `SELECT count(id) as count from contents WHERE is_active = ?`;
    const [countResult] = await conn
      .promise()
      .execute(countQueryString, [is_active]);

    const responseBody = {
      message: "Successfully got all videos",
      list: result,
      count: countResult[0].count,
    };
    res.status(200).send(responseBody);
    // console.log(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while getting videos",
      error,
    });
  }
};

//GET SINGLE VIDEO
const getContent = async (req, res) => {
  try {
    const { id } = req.params;

    // console.log(req);
    let queryString = `SELECT * from contents where id = ?`;
    const [result] = await conn.promise().execute(queryString, [id]);
    if (result.length === 0) {
      res.status(404).send({
        message: "video not found",
      });
    } else {
      res.status(200).send({
        message: "Successfully got video",
        result,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while getting video",
      error,
    });
  }
};

//CREATE VIDEO
const createContent = async (req, res) => {
  try {
    const { title, description, type, release_date, is_active } = req.body;

    let queryString = `INSERT INTO contents (title, description, type, release_date)
      VALUES (?, ?, ?, ?)`;
    const [result] = await conn
      .promise()
      .execute(queryString, [
        title,
        description,
        type,
        release_date,
        is_active,
      ]);

    res.status(201).send({
      message: "Video created successfully",
      result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while creating Video",
      error,
    });
  }
};

//UPDATE VIDEO
const updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, release_date, is_active } = req.body;
    let queryString = `UPDATE contents SET title = ?,description =?, type=?, release_date=?, is_active =? WHERE id = ?`;
    const [result] = await conn
      .promise()
      .execute(queryString, [
        title,
        description,
        type,
        release_date,
        is_active,
        id,
      ]);
    if (result.affectedRows === 0) {
      res.status(404).send({
        message: "Video not found",
      });
    } else {
      res.status(200).send({
        message: "Video updated Succesfully",
        result,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while updating video",
      error,
    });
  }
};

// //DELETE VIDEO
const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;
    let queryString = `DELETE from contents WHERE id = ?`;
    const [result] = await conn.promise().execute(queryString, [id]);
    if (result.affectedRows === 0) {
      res.status(404).send({
        message: "Video not found",
      });
    } else {
      res.status(200).send({
        message: "Video deleted successfully",
        result,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while deleting Video",
      error,
    });
  }
};

//Routes
router.get("/videos", getAllContents);
router.get("/videos/:id", getContent);
router.post("/videos", createContent);
router.put("/videos/:id", updateContent);
router.delete("/videos/:id", deleteContent);
// =======================================================================================

//GET ALL GENRE
const getAllGenre = async (req, res) => {
  const { limit, offset, sort } = req.query;
  // console.log(req.headers);
  const queryData = req.query;
  let is_active = queryData.is_active;
  if (!is_active) {
    res.status(400).send({
      message: "This content is not available",
    });
  }

  try {
    let queryString = `SELECT name,description from genres WHERE is_active =?  order by id ${sort} LIMIT ? OFFSET ? `;
    const [result] = await conn
      .promise()
      .execute(queryString, [is_active, limit, offset]);

    let countQueryString = `SELECT count(id) as count from genres WHERE is_active = ?`;
    const [countResult] = await conn
      .promise()
      .execute(countQueryString, [is_active]);

    const responseBody = {
      message: "Successfully got all Genres",
      list: result,
      count: countResult[0].count,
    };
    res.status(200).send(responseBody);
    // console.log(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while getting genres",
      error,
    });
  }
};

//GET SINGLE GENRE
const getGenre = async (req, res) => {
  try {
    const { id } = req.params;

    // console.log(req);
    let queryString = `SELECT * from genres where id = ?`;
    const [result] = await conn.promise().execute(queryString, [id]);
    if (result.length === 0) {
      res.status(404).send({
        message: "Genre not found",
      });
    } else {
      res.status(200).send({
        message: "Successfully got Genre",
        result,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while getting genre",
      error,
    });
  }
};

//CREATE GENRE
const createGenre = async (req, res) => {
  try {
    const { name, description, is_active } = req.body;

    let queryString = `INSERT INTO genres (name, description,is_active)
      VALUES (?, ?, ?)`;
    const [result] = await conn
      .promise()
      .execute(queryString, [name, description, is_active]);

    res.status(201).send({
      message: "Genre created successfully",
      result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while creating Genre",
      error,
    });
  }
};

//UPDATE GENRE
const updateGenre = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;
    let queryString = `UPDATE genres SET name = ?,description =?, is_active =? WHERE id = ?`;
    const [result] = await conn
      .promise()
      .execute(queryString, [name, description, is_active, id]);
    if (result.affectedRows === 0) {
      res.status(404).send({
        message: "Genre not found",
      });
    } else {
      res.status(200).send({
        message: "Genre updated Succesfully",
        result,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while updating genre",
      error,
    });
  }
};

// //DELETE GENRE
const deleteGenre = async (req, res) => {
  try {
    const { id } = req.params;
    let queryString = `DELETE from genres WHERE id = ?`;
    const [result] = await conn.promise().execute(queryString, [id]);
    if (result.affectedRows === 0) {
      res.status(404).send({
        message: "Genre not found",
      });
    } else {
      res.status(200).send({
        message: "Genre deleted successfully",
        result,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while deleting Video",
      error,
    });
  }
};

//routes
router.get("/genres", getAllGenre);
router.get("/genres/:id", getGenre);
router.post("/genres", createGenre);
router.put("/genres/:id", updateGenre);
router.delete("/genres/:id", deleteGenre);
// ====================================================================================

// content_genre
// SELECT
//     content_genres.id AS content_genre_id,
//     contents.id AS content_id,
//     contents.title AS content_title,
//     genres.id AS genre_id,
//     genres.name AS genre_name
// FROM
//     content_genres
// INNER JOIN
//     contents ON content_genres.content_id = contents.id
// INNER JOIN
//     genres ON content_genres.genre_id = genres.id;

//GET ALL ACTORS
const getAllActors = async (req, res) => {
  const { limit, offset, sort } = req.query;
  // console.log(req.headers);
  const queryData = req.query;
  let is_active = queryData.is_active;
  if (!is_active) {
    res.status(400).send({
      message: "This Actor is not available",
    });
  }

  try {
    let queryString = `SELECT name,created_at from actors WHERE is_active =?  order by id ${sort} LIMIT ? OFFSET ? `;
    const [result] = await conn
      .promise()
      .execute(queryString, [is_active, limit, offset]);

    let countQueryString = `SELECT count(id) as count from actors WHERE is_active = ?`;
    const [countResult] = await conn
      .promise()
      .execute(countQueryString, [is_active]);

    const responseBody = {
      message: "Successfully got all Actors",
      list: result,
      count: countResult[0].count,
    };
    res.status(200).send(responseBody);
    // console.log(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while getting Actors",
      error,
    });
  }
};

//GET SINGLE ACTORS
const getActors = async (req, res) => {
  try {
    const { id } = req.params;

    // console.log(req);
    let queryString = `SELECT * from actors where id = ?`;
    const [result] = await conn.promise().execute(queryString, [id]);
    if (result.length === 0) {
      res.status(404).send({
        message: "Actors not found",
      });
    } else {
      res.status(200).send({
        message: "Successfully got Actors",
        result,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while getting actors",
      error,
    });
  }
};

//CREATE ACTORS
const createActors = async (req, res) => {
  try {
    const { name, is_active } = req.body;

    let queryString = `INSERT INTO actors (name,is_active)
      VALUES (?, ?)`;
    const [result] = await conn
      .promise()
      .execute(queryString, [name, is_active]);

    res.status(201).send({
      message: "Actor created successfully",
      result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while creating Actor",
      error,
    });
  }
};

//UPDATE ACTORS
const updateActors = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, is_active } = req.body;
    let queryString = `UPDATE actors SET name = ?,is_active =? WHERE id = ?`;
    const [result] = await conn
      .promise()
      .execute(queryString, [name, is_active, id]);
    if (result.affectedRows === 0) {
      res.status(404).send({
        message: "Actor not found",
      });
    } else {
      res.status(200).send({
        message: "Actor updated Succesfully",
        result,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while updating actor",
      error,
    });
  }
};

// //DELETE ACTORS
const deleteActors = async (req, res) => {
  try {
    const { id } = req.params;
    let queryString = `DELETE from actors WHERE id = ?`;
    const [result] = await conn.promise().execute(queryString, [id]);
    if (result.affectedRows === 0) {
      res.status(404).send({
        message: "Actor not found",
      });
    } else {
      res.status(200).send({
        message: "Actor deleted successfully",
        result,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while deleting actor",
      error,
    });
  }
};

//routes
router.get("/actors", getAllActors);
router.get("/actors/:id", getActors);
router.post("/actors", createActors);
router.put("/actors/:id", updateActors);
router.delete("/actors/:id", deleteActors);
// ==========================================================================================
// pending => casts insert,contents_genres , casts-actors , watch_history

//GET ALL CASTS
const getAllCasts = async (req, res) => {
  const { limit, offset, sort } = req.query;
  // console.log(req.headers);
  const queryData = req.query;
  let actor_id = queryData.actor_id;
  if (!actor_id) {
    res.status(400).send({
      message: "This Actor is not available",
    });
  }

  try {
    let queryString = `SELECT casts.id, actors.name, contents.title, casts.created_at, casts.updated_at
      FROM casts
      JOIN actors ON casts.actor_id = actors.id
      JOIN contents ON casts.content_id = contents.id WHERE actor_id =? order by id ${sort} LIMIT ? OFFSET ? `;
    const [result] = await conn
      .promise()
      .execute(queryString, [actor_id, limit, offset]);

    let countQueryString = `SELECT count(id) as count from casts WHERE actor_id = ?`;
    const [countResult] = await conn
      .promise()
      .execute(countQueryString, [actor_id]);

    const responseBody = {
      message: "Successfully got all Casts",
      list: result,
      count: countResult[0].count,
    };
    res.status(200).send(responseBody);
    // console.log(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while getting Casts",
      error,
    });
  }
};

//GET SINGLE CASTS
const getCasts = async (req, res) => {
  try {
    const { id } = req.params;

    // console.log(req);
    let queryString = `SELECT casts.id , actors.name, contents.title, casts.created_at, casts.updated_at
      FROM casts
      JOIN actors ON casts.actor_id = actors.id
      JOIN contents ON casts.content_id = contents.id where casts.id = ?`;
    const [result] = await conn.promise().execute(queryString, [casts.id]);
    if (result.length === 0) {
      res.status(404).send({
        message: "Casts not found",
      });
    } else {
      res.status(200).send({
        message: "Successfully got Casts",
        result,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while getting casts",
      error,
    });
  }
};

//CREATE CASTS
const createCasts = async (req, res) => {
  try {
    const { name, is_active } = req.body;

    let queryString = `INSERT INTO actors (name,is_active)
      VALUES (?, ?)`;
    const [result] = await conn
      .promise()
      .execute(queryString, [name, is_active]);

    res.status(201).send({
      message: "Actor created successfully",
      result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while creating Actor",
      error,
    });
  }
};

//UPDATE CASTS
const updateCasts = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, is_active } = req.body;
    let queryString = `UPDATE actors SET name = ?,is_active =? WHERE id = ?`;
    const [result] = await conn
      .promise()
      .execute(queryString, [name, is_active, id]);
    if (result.affectedRows === 0) {
      res.status(404).send({
        message: "Actor not found",
      });
    } else {
      res.status(200).send({
        message: "Actor updated Succesfully",
        result,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while updating actor",
      error,
    });
  }
};

// //DELETE CASTS
const deleteCasts = async (req, res) => {
  try {
    const { id } = req.params;
    let queryString = `DELETE from actors WHERE id = ?`;
    const [result] = await conn.promise().execute(queryString, [id]);
    if (result.affectedRows === 0) {
      res.status(404).send({
        message: "Actor not found",
      });
    } else {
      res.status(200).send({
        message: "Actor deleted successfully",
        result,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while deleting actor",
      error,
    });
  }
};

// //routes
router.get("/casts", getAllCasts);
router.get("/casts/:id", getCasts);
router.post("/casts", createCasts);
router.put("/casts/:id", updateCasts);
router.delete("/casts/:id", deleteCasts);

module.exports = router;
