//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set("view engine", "ejs");
mongoose.set("useFindAndModify", false);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Piyush_1301:test123@cluster0.oxygy.mongodb.net/todolistDB?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "hit + to add new items",
});
const item2 = new Item({
  name: "<-- hit this to delete new item",
});
const item3 = new Item({
  name: "try yourself",
});
const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  link: [itemsSchema],
};
const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({},function (err, result) {
    if (result.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) console.log(err);
        else console.log("successfuly inserted");
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: result });
    }
  });
});
app.get("/:title", function (req, res) {
  const customListName = _.capitalize(req.params.title);

  List.findOne({ name: customListName }, function (err, foundlist) {
    if (!err) {
      if (!foundlist) {
        //create new list
        const list = new List({
          name: customListName,
          link: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundlist.name,
          newListItems: foundlist.link,
        });
      }
    }
  });
});
app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listname = req.body.list;
  const item = new Item({
    name: itemName,
  });
  if (listname === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listname }, function (err, foundlist) {
      foundlist.link.push(item);
      foundlist.save();
      res.redirect("/" + listname);
    });
  }
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});
app.post("/delete", function (req, res) {
  const checkItemId = req.body.checkbox;
  const list = req.body.listName;
  if (list === "Today") {
    Item.findByIdAndRemove(checkItemId, function (err) {
      if (!err) {
        console.log("success");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: list },
      { $pull: { link: { _id: checkItemId } } },
      function (err, result) {
        if (!err) {
          res.redirect("/" + list);
        }
      }
    );
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started  ");
});
