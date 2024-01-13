import path from 'path'
import readline from 'readline'
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
// Interfaces
import {ProtoGrpcType} from './pb/learning'

const PORT = 8080
const PROTO_FILE = '../proto/learning.proto'

const packageDefinition = protoLoader.loadSync(path.resolve(__dirname, PROTO_FILE))
const gRPCObj = (grpc.loadPackageDefinition(packageDefinition) as unknown) as ProtoGrpcType

const client = new gRPCObj.learning.Learning(`0.0.0.0:${PORT}`, grpc.credentials.createInsecure());


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
            }+
            console.log(result)
        }       
    )

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    const username = process.argv[2];
    if(!username) {
        console.error("No username, user can't join chat");
        process.exit(1);
    }

    const metadata = new grpc.Metadata();
    metadata.set('username', username);
    const call = client.Chat(metadata)

    call.write({
        message: "Register"
    });

    call.on("data", (chunk) => {
        console.log(`${chunk.username} ==> ${chunk.message}`)
    })

    rl.on('line', (line) => {
        if(line === 'quit') {
            call.end()
            process.exit(1)
            return
        } else {
            call.write({
                message: line
            })
        }
    })
}