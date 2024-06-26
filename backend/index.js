const express = require('express');
const DBConnect = require('./DB/connect');
const userRouter = require('./Routes/userRoutes')
const roomRouter = require('./Routes/roomRoutes')
const codeRouter = require('./Routes/codeRoutes');
const { createServer } = require("http");
const { Server } = require("socket.io")
const cors = require('cors');
const initSocketIO = require('./initSocket');
const port = process.env.PORT || 1234;
const bodyParser = require('body-parser');
const axios = require('axios')

const app = express();
const httpServer = createServer(app);

require('dotenv').config(); 

app.use(bodyParser.json({ limit: '1mb' }));

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        transports: ['websocket', 'polling'], credentials: true
    }, allowEIO3: true
});
const connection = {
    count: 0,
    users: []
}
initSocketIO(io, connection)


app.use(cors());
app.use(express.json());
app.use(userRouter);
app.use(roomRouter);
app.use(codeRouter)

setInterval(() => {
    axios.get(process.env.BASE_URL)
        .then((res) => {
            console.log(res.data);
        })
        .catch((err) => {
            console.log(err);
        })
}, 300000);

httpServer.listen(port, () => {
    console.log('Server started on port: ' + port);
})

DBConnect().then(() => {
    console.log("DB connected");
});


app.use('/', (req, res) => {
    res.status(200).send(connection)
})
