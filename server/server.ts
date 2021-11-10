import { GraphQLServer, PubSub, withFilter  } from 'graphql-yoga';

const CHECK_IN_CHANNEL = 'CHECK_IN_CHANNEL';
const GET_STATUS = 'GET_STATUS';
const CHAT_MESSAGE = 'CHAT_MESSAGE';

const pubSub = new PubSub();

const messages = [{
    message: 'Welcome User',
    from: 'Server'
}];

type UserId = String;

let connectedUsers: UserId[] = [];
let playingUsers: UserId[] = [];
let defaultWaitingTime = 5;
const perCheckInTime = 5;

const typeDefs = `
  type Message {
    message: String!
    from: String!
  }
  type Query {
      getMessages: [Message]!
  }
  type Mutation {
      addMessage(message: String!, from: String!): Message
      unSubscribe(id: String!): Boolean
  }
  type Subscription {
    messages: [Message]!
    getQueueStatus(id: String!): String!
    watingTime: String!
  } 
`;

  
const resolvers = {
    Query: {
        getMessages: () => {
            return messages;
        },
        // getQueueStatus: () => {
        //     const newUserId =  Math.floor(Math.random() * 10000).toString();
        //     if(playingUsers.length == 0) {
        //         playingUsers.push(newUserId);
        //         return 'Player One';
        //     }
        //     if(playingUsers.length == 1) {
        //         playingUsers.push(newUserId);
        //         return 'Player Two';
        //     }
        //     connectedUsers.push(newUserId);
        //     return connectedUsers.length.toString();
        // }
    },
    Mutation: {
       addMessage: (
           _: unknown, // parental context
           {message, from}: {message: string, from: string}, // usr arguments
           { pubSub }: {pubSub: PubSub} // context from server
        ) => {
           const newMessage = {message, from};
           messages.push(newMessage);
           pubSub.publish(
            CHAT_MESSAGE,
               {messages}
           )
           return newMessage;
       },
       unSubscribe: (
            _: unknown, // parental context
            {id}: {id: string}, // usr arguments
            { pubSub }: {pubSub: PubSub} // context from server
       ) => {
            const index = playingUsers.findIndex(el => el === id);
            if (index >= 0) {
                // if present delete
                const newPlayer = connectedUsers.shift();
                if (newPlayer) {
                    playingUsers[index] = newPlayer; 
                } else {
                    playingUsers = playingUsers.filter(el => el !== id);
                }
            } else {
                connectedUsers = connectedUsers.filter(el => el !== id);
            }
            pubSub.publish(GET_STATUS, {all: true});

            return true;
       }
    },
    Subscription: {
        messages: {
            subscribe: () => {
                const iterator =  pubSub.asyncIterator(CHAT_MESSAGE);
                pubSub.publish(CHAT_MESSAGE, {messages});
                return iterator;
            }
        },
        watingTime: {
            subscribe: () => {
                const iterator =  pubSub.asyncIterator(CHECK_IN_CHANNEL);
                const waitingTimeMessage = `Current waiting time is ${defaultWaitingTime} minutes`;
                pubSub.publish(CHECK_IN_CHANNEL, {watingTime: waitingTimeMessage});
                return iterator;
            }
        },
        getQueueStatus: {
            resolve: (payload: String[], args: {id: String}) => {
                // Manipulate and return the new value
                const index = playingUsers.findIndex(el => el === args.id);
                if (index == 0) {
                    return 'You are player one';
                } else if(index == 1) {
                    return 'You are player two';
                } else {
                    const waitingIndex = connectedUsers.findIndex(el => el === args.id);

                    return ` You are ${waitingIndex + 1} in Queue`
                }

            },
            subscribe: withFilter((_:unknown, args: {id: String}) => {
                // console.log(rootValue, args, context, info);
                const iterator =  pubSub.asyncIterator(GET_STATUS);
                defaultWaitingTime += perCheckInTime;
                
                if(playingUsers.length == 0) {
                    defaultWaitingTime = perCheckInTime;
                    playingUsers.push(args.id);
                    pubSub.publish(GET_STATUS, {playerOne: args.id});
                } else if(playingUsers.length == 1) {
                    playingUsers.push(args.id);
                    pubSub.publish(GET_STATUS, {playerTwo: args.id});
                } else {
                    connectedUsers.push(args.id);
                    pubSub.publish(GET_STATUS, {other:  args.id});
                }
                const waitingTimeMessage = `Current waiting time is ${defaultWaitingTime} minutes`;
                pubSub.publish(CHECK_IN_CHANNEL, {watingTime: waitingTimeMessage});
                return iterator;
            }, 
            (payload, variables) => {
                console.log('variables', variables);
                console.log('payload', payload);
                // for playing user, we only want to retun once
                if (
                    (payload.playerOne && payload.playerOne === variables.id) ||
                    (payload.playerTwo && payload.playerTwo === variables.id)
                    ) {
                    return true;
                }
                // for non playing users
                if (payload.other && !playingUsers.includes(variables.id)) {
                    return true;
                }
                if (payload.all) {
                    return true;
                }
                return false;
            }),
        }
    }
}
 
const server = new GraphQLServer({
    typeDefs,
    resolvers,
    context: {
        pubSub
    }
});

server.start(() => {
    console.log('Server started at port 4000');
})

