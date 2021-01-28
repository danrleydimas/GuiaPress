const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const connection = require("./database/database");

const categoriesController = require("./categories/CategoriesController");
const articlesController = require("./articles/ArticlesController");
const usersController = require("./users/UsersController");

const Article = require("./articles/Article");
const Category = require("./categories/Category");
const User = require("./users/User");


//view engine
app.set('view engine','ejs');
//Sessions

//Radis para projeto maior
app.use(session({
    secret:"qualquercoisa", cookie:{maxAge:3000000}
}))

//STATIC
app.use(express.static('public'));

//body parser
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Database connection

connection
.authenticate()
.then(()=>{
    console.log("conexao bem sucedida");
}).catch((error)=>{
    console.log(error);
})

app.use("/",categoriesController);
app.use("/",articlesController);
app.use("/",usersController);

app.get("/session", (req,res)=>{
    req.session.treinamento ="formaçao node.js"
    req.session.ano = 2019
    req.session.user ={
        username:"victi",
        email:"email@email.com",
        id:10
    }
    res.send("sessao gerada");

});
app.get("/leitura", (req,res)=>{
  res.json({
     treinamento: req.session.treinamento,
      user:req.session.user
  })

});

app.get("/",(req,res)=>{
    Article.findAll({
        order:[
            ['id','DESC']
        ],
        limit:4
    }).then(articles =>{
        Category.findAll().then(categories =>{
            res.render("index",{articles:articles,categories:categories})
        })

    })

})
app.get("/:slug",(req,res)=>{
    var slug = req.params.slug;
    Article.findOne({
        where:{
            slug:slug
        }
    }).then(article =>{
        if(article){
            Category.findAll().then(categories =>{
                res.render("article",{article:article,categories:categories})
            })
        }else{
            res.redirect("/");
        }
    }).catch(err =>{
        res.redirect("/");
    })
})

app.get("/category/:slug",(req,res) =>{
    var slug = req.params.slug;
    Category.findOne({
        where:{
            slug:slug
        },
        include:[{model:Article}]
    }).then(category =>{
        if(category){
            Category.findAll().then(categories=>{
                res.render("index",{articles:category.articles,categories:categories});
            })

        }else{
            res.redirect("/");
        }

    }).catch(err=>{
        res.redirect("/");

    })

})

app.listen(8080),()=>{
    console.log("servidor funcionando")
}