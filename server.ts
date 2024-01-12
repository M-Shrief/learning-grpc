import path from 'path'
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
// Interfaces
import {ProtoGrpcType} from './pb/ping'
import { PingRequest__Output } from './pb/ping/PingRequest'
import { PongResponse } from './pb/ping/PongResponse'

const PORT = 8080
const PROTO_FILE = './proto/ping.proto'

const packageDefinition = protoLoader.loadSync(path.resolve(__dirname, PROTO_FILE))
const gRPCObj = (grpc.loadPackageDefinition(packageDefinition) as unknown) as ProtoGrpcType
const ping  = gRPCObj.ping


function main() {
    const server = initServer()

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

function initServer() {
    const server = new grpc.Server();

    server.addService(ping.Ping.service, {
        PingPong: (
            req: grpc.ServerUnaryCall<PingRequest__Output, PongResponse>,
            res: grpc.sendUnaryData<PongResponse>
        ) => {
            console.log(req.request);
            res(null, {message: "Pong"})
        }
    })

    return server;
}


main()