const express=require("express");
const bodyParser=require("body-parser");
const {Pool}=require("pg");
/*const pool=new Pool(
    {
        host:'localhost',
        user:'postgres',
        password:'iecs',
        database:'Bonkers Corner',
        port:5432
    }
)*/
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
const app =express();
//app.use(express.static("Bonkers Corner"));
app.use(express.static(__dirname + "/Bonkers Corner"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());
app.get("/",(req,res)=>
{
    res.sendFile(__dirname + "/Bonkers Corner/index.html");
});
/*app.post("/product",(req,res)=>
{
    let {test,IMAGE,NAME,PRICE,QTY}=req.body;
    console.log(test,IMAGE,NAME,PRICE,QTY);
    res.redirect("index.html");
})*/

/*app.post("/product",(req,res)=>
{
    let {test,IMAGE,NAME,PRICE,QTY,ACTION} = req.body;

    if(ACTION === "REMOVE")
    {
        console.log("❌ REMOVED:", NAME);
    }
    else
    {
        console.log("✅ ADDED/UPDATED:", test, IMAGE, NAME, PRICE, QTY);
    }

    res.redirect("index.html"); // ⚠️ better than redirect for fetch

    async function connectdb()
    {
        try {
                await pool.connect();
                console.log("Connected");
                const qry="insert into atc values('"+test+"','"+IMAGE+"','"+NAME+"','"+PRICE+"','"+QTY+"')";
                const result=await pool.query(qry);
                console.log("data stored");
        } catch (error) {
                console.error("Disconnected",error);
        }
    }
    connectdb();
});*/

app.post("/product", async (req, res) => {
    let { test, IMAGE, NAME, PRICE, QTY, ACTION } = req.body;

    try {
        if (ACTION === "REMOVE") {

            await pool.query(
                "DELETE FROM atc WHERE mobile_no=$1 AND product_name=$2",
                [test, NAME]
            );

            console.log("❌ REMOVED:", NAME);

        } else {

            const qry = `
            INSERT INTO atc (mobile_no, product_image, product_name, product_price, product_qty)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (mobile_no, product_name)
            DO UPDATE SET
                product_price = EXCLUDED.product_price,
                product_qty = EXCLUDED.product_qty
            `;

            await pool.query(qry, [test, IMAGE, NAME, PRICE, QTY]);

            console.log("✅ UPSERT DONE:", NAME, QTY);
        }

        //res.send("OK");
        res.redirect("index.html");

    } catch (err) {
        console.error(err);
        res.status(500).send("Error");
    }
});

/*app.listen(1234,()=>
{
    console.log("server toh chl rha h");
});*/

app.listen(process.env.PORT || 1234, () => {
    console.log("Server running");
});