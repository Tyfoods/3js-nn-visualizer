const express = require('express');
const path = require('path');

const app = express();

// app.get('/', (req, res)=>{
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// })


app.use(express.static(path.join(__dirname, '/')));

// const server = createServer(app);

app.listen(process.env.PORT || 3000, err=>{
    console.log("Server sucessfully started, listening on port 3000");
    if (err) throw err;
    console.log(err);
})

