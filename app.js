const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const { render } = require("ejs");
const _ = require("lodash");
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs')
app.use(express.static("public"));

mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URI);
//mongoose.connect('mongodb://127.0.0.1:27017/todolistDB')
const itemsSchema = mongoose.Schema({
    name:  String
});

const Item = mongoose.model("item", itemsSchema);
const item1 = new Item({
    name: "welcome to do list"
});
const item2 = new Item({
    name: "Hit the + button to add item"
});
const item3 = new Item({
    name: "<--- hit this to delete item"
});
const defaultItems = [item1, item2, item3]

const listSchema = mongoose.Schema({
    name: String,
    list: [itemsSchema]
});

const List = mongoose.model("list", listSchema);



//const array allow to push item but doesn't allow to change the entire array to new array
//now using mongoose replace for the array
//const items = []
//const workItems = []

app.get("/", function(req, res){
    //Monday will begin with 1 and Sunday is 0
    //res.write("<h1>" + day.getDay() + "</h1>")
    //res.sendFile(__dirname + "/index.html")
    
    //res.render("index", {listTitle: day, newItems: items});
    console.log("root is working");
    Item.find(function(err, foundItems){
        if(err){
            console.log(err);
        }
        else{
            if (foundItems.length === 0){
                Item.insertMany(defaultItems, function(err){
                    if(!err){
                        console.log("Insert many success");
                    }
                    else{
                        console.log(err);
                    }
                })
                res.redirect("/");
            }
            
            else{
               
                res.render("index", {listTitle: "Today", newItems: foundItems})
            }
           
        }
    })
    
})



app.post("/", function(req, res){
    //    let item = "";
    //    if(req.body.button == "Work"){
    //     item = req.body.newItem;
    //     workItems.push(item);
    //     res.redirect("/work");
    //    }
    //    else{
    //     item = req.body.newItem;
    //     items.push(item);
    //     res.redirect("/");
 
    //    }

       

        const item = new Item({
            name: req.body.newItem
        })
        const listName = req.body.listTitle;
        
        if(listName === "Today"){
            item.save();
            res.redirect("/");
        }
        else{
            console.log(listName);
            List.findOne({name: listName}, function(err, foundList){
                foundList.list.push(item);
                foundList.save();
                res.redirect("/"+listName);
            })
        }

        
       //check what value in body request
       //console.log(req.body);
});
app.post("/delete", function(req, res){
    if(req.body.list === "Today"){
        Item.deleteOne({_id: req.body.checkbox}, function(err){
            if(err){
                console.log(err);
            }
            else{
                console.log("Remove success");
                res.redirect("/")
            }
        })
    }
    else{
        List.findOneAndUpdate({name: req.body.list}, {$pull: {list: {_id: req.body.checkbox}}}, function(err){
            if(!err){
                console.log("Remove success");
                res.redirect("/"+req.body.list);
            }
        })
    }
    
   
    
    //or using Item.findByIdAndRemove
    //req.body.checkbox help us to get the id of item we want to remove
    console.log(req.body.checkbox);
})

app.get("/:routeName", function(req, res){
    listName = _.capitalize(req.params.routeName)

    List.findOne({name: listName}, function(err, foundList){
        if(err){
            console.log(err);
        }
        else{
            if(!foundList){
                
                const newList = new List({
                    name: listName,
                    list: defaultItems
                });
               
                
                newList.save(function(err, result) { // Log the result parameter to the console to review it
                    if(!err){
                        console.log("Add new list success");
                        res.redirect("/" + listName);
                        
                    }
                    
                });
            }
            else{

                console.log("Exist");
                console.log(listName);
                res.render("index", {listTitle: foundList.name, newItems: foundList.list })
            }
            
        }
    })

})
// app.get("/work", function(req, res){
//     //submit button it will redirect to root, so that why we need to set value of button to be dynamic
//     res.render("index", {listTitle: "Work To Do", newItems: workItems});
// })

app.listen(3000, function(){
    console.log("Port 3000 is running")
})