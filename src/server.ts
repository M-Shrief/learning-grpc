import path from 'path'
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
// Interfaces
import {ProtoGrpcType} from './pb/learning'
import { ChatRequest, ChatRequest__Output } from './pb/chat/ChatRequest'
import { ChatResponse } from './pb/chat/ChatResponse'
import { PingRequest__Output } from './pb/ping/PingRequest'
import { PongResponse } from './pb/ping/PongResponse'

const PROTO_FILE = '../proto/learning.proto'
const packageDefinition = protoLoader.loadSync(path.resolve(__dirname, PROTO_FILE))
const gRpcObj = (grpc.loadPackageDefinition(packageDefinition) as unknown) as ProtoGrpcType
const learning  = gRpcObj.learning

const PORT = 8080
function main() {
    const server = newServer()

    server.bindAsync(
        `0.0.0.0:${PORT}`,
        grpc.ServerCredentials.createInsecure(),
        (err, port) => {
            if(err) {
                console.error(err)
                return
            }
            console.log(`Started on: ${PORT}`)
            server.start()
        }
        )
}

const callObjByUserName = new Map<string, grpc.ServerDuplexStream<ChatRequest, ChatResponse>>()

function newServer() {
    const server = new grpc.Server();

    server.addService(learning.Learning.service, {
        PingPong: (
            req: grpc.ServerUnaryCall<PingRequest__Output, PongResponse>,
            res: grpc.sendUnaryData<PongResponse>
        ) => {
            console.log(req.request);
            res(null, {message: "Pong"})
        },
        Chat: (call: grpc.ServerDuplexStream<ChatRequest__Output, ChatResponse>) => {
            call.on(
                "data",
                (req) => {
                    const username = call.metadata.get('username')[0] as string
                    const message = req.message
                    console.log(`${username}: ${message}`);
                    for (let [user, userCall] of callObjByUserName) {
                        if(username !== user) {
                            userCall.write({
                                username,
                                message
                            })
                        }
                    }
                    if(callObjByUserName.get(username) === undefined){
                        callObjByUserName.set(username,call)
                    }
                }
            );

            call.on('end', () => {
                const username = call.metadata.get('username')[0] as string;
                callObjByUserName.delete(username);
                for (let [user, userCall] of callObjByUserName) {
                    if(username !== user) {
                        userCall.write({
                            username,
                            message: "Left the chat"
                        })
                    }
                }
                call.write({
                    username: "Server",
                    message: "See you later"
                })
                call.end()
            })
        }
    })


    return server;
}


main()