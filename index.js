const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const jwt = require("jsonwebtoken");

const databasePath = path.join(__dirname, "database.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3005, () =>
      console.log("Server Running at https://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// create post api

app.post("/api/posts", async (request, response) => {
  const { userId, content } = request.body;
  const getUserIdQuery = `
  SELECT * FROM user WHERE userId=${userId};`;
  const dbResponse = await database.get(getUserIdQuery);
  if (dbResponse !== undefined) {
    const updatePosts = `
    INSERT INTO user (userId,content)
    VALUES (
        '${userId}',
      '${content}'
    );`;
    const updatedResponse = await database.run(updatePosts);
    response.status(200);
    response.send("Successfully created");
  } else if (dbResponse !== undefined && content.length === 0) {
    response.status(400);
    response.send("Content cannot be empty");
  } else {
    response.status(400);
    response.send("User ID not found");
  }
});

// user signup api

app.post("/api/signup", async (request, response) => {
  const { username, email } = request.body;
  const getUsernameQuery = `
  SELECT * FROM user WHERE username=${username};`;
  const dbResponse = await database.get(getUsernameQuery);
  if (dbResponse === undefined) {
    const newUserQuery = `
    INSERT INTO user (username,email)
    VALUES (
      '${username}',
      '${email}
    );`;
    const updatedResponse = await database.run(newUserQuery);
    response.status(200);
    response.send("Successful user sign-up");
  } else {
    if (dbResponse.email === email) {
      response.status(400);
      response.send("Email already registered");
    } else{
      response.status(400);
      response.send("Invalid email format");
    }
  }
});

// delete the post

app.delete("/api/deletepost/:postId/", async (request, response) => {
  const { postId } = request.params;
  const postIdQuery = `
  SELECT * FROM user WHERE postId=${postId};`;
  const dbResponse = await database.get(postIdQuery);
  if (dbResponse !== undefined) {
    const deletePosts = `
    DELETE FROM user
    WHERE postId = ${postId};`;
    const deletedResponse = await database.run(deletePosts);
    response.status(200);
    response.send("Successfully post deletion");
  } else {
    response.status(404);
    response.send("Post ID not found");
  }
});

// fetching all post by userId

app.get("/posts/:postId/", async (request, response) => {
  const { postId } = request.params;
  const getPostsQuery = `
    SELECT * FROM user
    WHERE postId = ${postId};`;
  const requiredPosts = await database.all(getPostsQuery);
  if (requiredPosts !== undefined) {
    response.status(200);
    response.send(requiredPosts);
  } else if (requiredPosts !== undefined && requiredPosts.length === 0) {
    response.status(404);
    response.send("No posts found for this user");
  } else {
    response.status(404);
    response.send("User ID not found");
  }
});
