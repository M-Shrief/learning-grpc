import path from 'path'
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
// Interfaces
import {ProtoGrpcType} from './pb/ping'

const PORT = 8080
const PROTO_FILE = './proto/ping.proto'

const packageDefinition = protoLoader.loadSync(path.resolve(__dirname, PROTO_FILE))
const gRPCObj = (grpc.loadPackageDefinition(packageDefinition) as unknown) as ProtoGrpcType

const client = new gRPCObj.ping.Ping(`0.0.0.0:${PORT}`, grpc.credentials.createInsecure());


const deadLine = new Date()
deadLine.setSeconds(deadLine.getSeconds() + 3)

client.waitForReady(
    deadLine,
    err => {
        if (err) {
            console.error(err);
            return
        }
        onReady()
    }
)

function onReady() {
    client.PingPong(
        {message: "Ping"},
        (err, result) => {
            if(err) {
                console.error(err);
                return
            }
            console.log(result)
        }       
    )
}