import path from 'path'
import readline from 'readline'
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
// Interfaces
import {ProtoGrpcType} from './pb/learning'
import { PrimeNumberDecompositionResponse, PrimeNumberDecompositionResponse__Output } from './pb/calculator/PrimeNumberDecompositionResponse'

const PORT = 8080
const PROTO_FILE = '../proto/learning.proto'

const packageDefinition = protoLoader.loadSync(
    path.resolve(__dirname, PROTO_FILE), 
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    }
)
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
    // client.PingPong(
    //     {message: "Ping"},
    //     (err, result) => {
    //         if(err) {
    //             console.error(err);
    //             return
    //         }+
    //         console.log(result)
    //     }       
    // )


    const call = client.computeAverage((err, res) => {
        if(err) {
            console.error(err);
            return
        }+
        console.log(res)
    })
    
    for(let number of [1,2,3,4,5]) {
        call.write({number})
    }

    call.end()

    // const call2 = client.primeNumberDecomposition({number: 12390392840})

    // call2
    // .on('data', (chunk: PrimeNumberDecompositionResponse__Output) => {
    //     console.log(chunk)
    // })
    // .on('end', () => {
    //     console.log("Communication ended successfully");
    // })
    // .on("error", (err) => {
    //     console.error(err)
    // })

    // const rl = readline.createInterface({
    //     input: process.stdin,
    //     output: process.stdout,
    // })

    // const username = process.argv[2];
    // if(!username) {
    //     console.error("No username, user can't join chat");
    //     process.exit(1);
    // }

    // const metadata = new grpc.Metadata();
    // metadata.set('username', username);
    // const call3 = client.Chat(metadata)

    // call3.write({
    //     message: "Register"
    // });

    // call3.on("data", (chunk) => {
    //     console.log(`${chunk.username} ==> ${chunk.message}`)
    // })

    // rl.on('line', (line) => {
    //     if(line === 'quit') {
    //         call3.end()
    //         process.exit(1)
    //         return
    //     } else {
    //         call3.write({
    //             message: line
    //         })
    //     }
    // })
}
