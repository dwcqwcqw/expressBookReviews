const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Function to get all books using Promise
const getAllBooks = () => {
    return new Promise((resolve, reject) => {
        try {
            resolve(books);
        } catch (error) {
            reject(error);
        }
    });
};

// Function to get book by ISBN using Promise
const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        try {
            if (books[isbn]) {
                resolve(books[isbn]);
            } else {
                reject(new Error("Book not found"));
            }
        } catch (error) {
            reject(error);
        }
    });
};

// Function to get books by author using Promise
const getBooksByAuthor = (author) => {
    return new Promise((resolve, reject) => {
        try {
            const booksByAuthor = [];
            const isbns = Object.keys(books);
            
            for (let isbn of isbns) {
                if (books[isbn].author === author) {
                    booksByAuthor.push({
                        isbn: isbn,
                        ...books[isbn]
                    });
                }
            }
            
            if (booksByAuthor.length > 0) {
                resolve(booksByAuthor);
            } else {
                reject(new Error("No books found for this author"));
            }
        } catch (error) {
            reject(error);
        }
    });
};

// Function to get books by title using Promise
const getBooksByTitle = (title) => {
    return new Promise((resolve, reject) => {
        try {
            const booksByTitle = [];
            const isbns = Object.keys(books);
            
            for (let isbn of isbns) {
                if (books[isbn].title === title) {
                    booksByTitle.push({
                        isbn: isbn,
                        ...books[isbn]
                    });
                }
            }
            
            if (booksByTitle.length > 0) {
                resolve(booksByTitle);
            } else {
                reject(new Error("No books found with this title"));
            }
        } catch (error) {
            reject(error);
        }
    });
};

public_users.post("/register", (req,res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

// Get the book list available in the shop using Promise
public_users.get('/', function (req, res) {
    getAllBooks()
        .then((books) => {
            return res.status(200).json(JSON.stringify(books, null, 2));
        })
        .catch((error) => {
            return res.status(500).json({ message: "Error retrieving books", error: error.message });
        });
});

// Get the book list available in the shop using async-await
public_users.get('/async', async function (req, res) {
    try {
        const books = await getAllBooks();
        return res.status(200).json(JSON.stringify(books, null, 2));
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving books", error: error.message });
    }
});

// Get book details based on ISBN using Promise
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    getBookByISBN(isbn)
        .then((book) => {
            return res.status(200).json(book);
        })
        .catch((error) => {
            return res.status(404).json({ message: error.message });
        });
});

// Get book details based on ISBN using async-await
public_users.get('/isbn/:isbn/async', async function (req, res) {
    try {
        const isbn = req.params.isbn;
        const book = await getBookByISBN(isbn);
        return res.status(200).json(book);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});

// Get book details based on author using Promise
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    getBooksByAuthor(author)
        .then((books) => {
            return res.status(200).json(books);
        })
        .catch((error) => {
            return res.status(404).json({ message: error.message });
        });
});

// Get book details based on author using async-await
public_users.get('/author/:author/async', async function (req, res) {
    try {
        const author = req.params.author;
        const books = await getBooksByAuthor(author);
        return res.status(200).json(books);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});

// Get all books based on title using Promise
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    getBooksByTitle(title)
        .then((books) => {
            return res.status(200).json(books);
        })
        .catch((error) => {
            return res.status(404).json({ message: error.message });
        });
});

// Get all books based on title using async-await
public_users.get('/title/:title/async', async function (req, res) {
    try {
        const title = req.params.title;
        const books = await getBooksByTitle(title);
        return res.status(200).json(books);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;
