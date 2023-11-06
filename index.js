import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Apply the CORS middleware

const httpServer = http.createServer(app); // Pass the Express app to the HTTP server
const io = new Server(httpServer, {
    cors: {
        origin: "*", // 허용할 origin을 여기에 설정
        methods: ["GET", "POST"],
    },
});

const openRooms = io.sockets.adapter.rooms;

// openRooms 객체에는 모든 방 정보가 포함됨
// for (const room in openRooms) {
//     if (!openRooms[room].sockets || Object.keys(openRooms[room].sockets).length === 0) {
//         // 빈 방은 이렇게 확인할 수 있습니다.
//         console.log(`방 이름: ${room} (빈 방)`);
//     } else {
//         // 방에 속한 클라이언트 수와 함께 방 정보를 확인할 수 있습니다.
//         console.log(`방 이름: ${room}, 클라이언트 수: ${Object.keys(openRooms[room].sockets).length}`);
//     }
// }

// connection event handler
// connection이 수립되면 event handler function의 인자로 socket인 들어온다
io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // 클라이언트가 특정 방에 조인 요청을 보냈을 때
    socket.on("joinRoom", (data) => {
        console.log("join_room : ", data); // 서버 로그에 조인 요청 데이터를 출력
        socket.join(data); // 클라이언트를 요청한 방에 조인
    });

    // 클라이언트가 메시지를 보낼 때
    socket.on("sendMessage", (data) => {
        console.log(data); // 서버 로그에 메시지 데이터를 출력
        io.to(data.room).emit("receiveMessage", data); // 해당 방에 있는 모든 클라이언트에게 메시지를 보냄
    });

    // 클라이언트가 연결을 종료할 때
    socket.on("disconnect", () => {
        console.log("user disconnected"); // 클라이언트 연결 종료 로그를 출력
    });
});

httpServer.listen(3001, () => {
    console.log("Socket IO server listening on port 3001");
});
