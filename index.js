const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const uuid = require("uuid");
// const usersRouter = require("./routes/user");

//DB connection
const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  port: 3306,
  database: "netflixdb",
});

conn.connect(function (err) {
  if (err) throw err;
  console.log("Databse connected");
});

const app = express();
app.use(bodyParser.json());

app.use((req, res, next) => {
  req.headers["request_id"] = uuid.v4(); //request_id
  next();
});

// app.use("/users", usersRouter.router);

//USERS
//GET ALL USERS
const getAllUser = async (req, res) => {
  const { limit, offset, sort } = req.query;
  // console.log(req.headers);
  const queryData = req.query;
  let is_active = queryData.is_active;
  if (!is_active) {
    res.status(400).send({
      message: "IsActive is Required",
    });
  }

  try {
    let queryString = `SELECT id,name,email,is_active,created_at from users WHERE is_active = ? order by id ${sort} LIMIT ? OFFSET ? `;
    const [result] = await conn
      .promise()
      .execute(queryString, [is_active, limit, offset]);

    let countQueryString = `SELECT count(id) as count from users where is_active = ?`;
    const [countResult] = await conn
      .promise()
      .execute(countQueryString, [is_active]);

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

//GET SINGLE USER
const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    // console.log(req);
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
    const { name, is_active, email, password, created_at } = req.body;

    let queryString = `insert into users
    (name,is_active,email,password,created_at)
     values (?, ?, ?, ?, ?)`;
    const [result] = await conn
      .promise()
      .execute(queryString, [name, is_active, email, password, created_at]);

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
    const { name, email, is_active, password, created_at } = req.body;
    let queryString = `UPDATE users SET name = ?,email = ?, is_active = ?,password = ?,created_at = ? WHERE id = ?`;
    const [result] = await conn
      .promise()
      .execute(queryString, [name, email, is_active, password, created_at, id]);
    if (result.affectedRows === 0) {
      res.status(404).send({
        message: "User not found",
      });
    } else {
      res.status(200).send({
        message: "User updated Succesfully",
        result,
      });
    }
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
app.get("/users", getAllUser);
app.get("/users/:id", getUser);
app.post("/users", createUser);
app.put("/users/:id", updateUser);
app.delete("/users/:id", deleteUser);
// ==============================================================================================

//PROFILES
//get all profiles
const getAllProfiles = async (req, res) => {
  const { limit, offset, sort } = req.query;
  // console.log(req.headers);
  const queryData = req.query;
  let user_id = queryData.user_id;
  if (!user_id) {
    res.status(400).send({
      message: "userID not found",
    });
  }

  try {
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
app.get("/profiles", getAllProfiles);
app.get("/profiles/:id", getProfiles);
app.post("/profiles", createProfiles);
app.put("/profiles/:id", updateProfiles);
app.delete("/profiles/:id", deleteProfiles);
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
app.get("/videos", getAllContents);
app.get("/videos/:id", getContent);
app.post("/videos", createContent);
app.put("/videos/:id", updateContent);
app.delete("/videos/:id", deleteContent);
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
app.get("/genres", getAllGenre);
app.get("/genres/:id", getGenre);
app.post("/genres", createGenre);
app.put("/genres/:id", updateGenre);
app.delete("/genres/:id", deleteGenre);
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
app.get("/actors", getAllActors);
app.get("/actors/:id", getActors);
app.post("/actors", createActors);
app.put("/actors/:id", updateActors);
app.delete("/actors/:id", deleteActors);
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
app.get("/casts", getAllCasts);
app.get("/casts/:id", getCasts);
app.post("/casts", createCasts);
app.put("/casts/:id", updateCasts);
app.delete("/casts/:id", deleteCasts);

app.listen(3000, () => {
  console.log("Server Started");
});

// module.exports = conn;
