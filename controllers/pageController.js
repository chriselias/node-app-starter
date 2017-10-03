const mongoose = require("mongoose");

exports.page = (req, res) => {
  res.render("page", { title: "Default Page Title" });
};
