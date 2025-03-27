const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const fs = require('fs');
const regd_users = express.Router();

// 读取用户数据
let users = [];
try {
    const userData = JSON.parse(fs.readFileSync('./router/users.json', 'utf8'));
    users = userData.users;
} catch (error) {
    console.log('No existing users file, starting fresh');
}

const isValid = (username)=>{ //returns boolean
    let userswithsamename = users.filter((user)=>{
        return user.username === username
    });
    if(userswithsamename.length > 0){
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
    });
    if(validusers.length > 0){
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }
  
    if (authenticatedUser(username,password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'fingerprint_customer', { expiresIn: 60 * 60 });
  
        req.session.authorization = {
            accessToken,username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
});

// Register new user
regd_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
        return res.status(404).json({message: "Error registering user"});
    }
  
    if (isValid(username)) {
        return res.status(404).json({message: "User already exists!"});
    }
  
    users.push({"username":username,"password":password});
    // 保存用户数据到文件
    fs.writeFileSync('./router/users.json', JSON.stringify({users: users}, null, 2));
    return res.status(200).json({message: "User successfully registered. Now you can login"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }

  if (!review) {
    return res.status(400).json({message: "Review is required"});
  }

  // 如果该 ISBN 还没有评论，创建一个新的评论对象
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // 添加或更新评论
  books[isbn].reviews[username] = review;

  return res.status(200).json({message: "Review added successfully"});
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    // Check if book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if review exists
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review not found for this user" });
    }

    // Delete the user's review
    delete books[isbn].reviews[username];

    // If no reviews left, delete the reviews object
    if (Object.keys(books[isbn].reviews).length === 0) {
        delete books[isbn].reviews;
    }

    return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
