import { GraphQLServer, PubSub, withFilter  } from 'graphql-yoga';

const CHAT_CHANNLE = 'CHAT_CHANNLE';
const GET_STATUS = 'GET_STATUS';

const pubSub = new PubSub();

const messages = [{
    message: 'Welcome User',
    from: 'Server'
}];

type UserId = String;

const connectedUsers: UserId[] = [];
const playingUsers: UserId[] = [];

const typeDefs = `
  type Message {
    message: String!
    from: String!
  }
  type Query {
      getMessages: [Message]!
      getQueueStatus: String!
  }
  type Mutation {
      addMessage(message: String!, from: String!): Message
  }
  type Subscription {
      messages: [Message]!
      getQueueStatus(id: String!): String!
  } 
`;

const resolvers = {
    Query: {
        getMessages: () => {
            return messages;
        },
        getQueueStatus: () => {
            const newUserId =  Math.floor(Math.random() * 10000).toString();
            if(playingUsers.length == 0) {
                playingUsers.push(newUserId);
                return 'Player One';
            }
            if(playingUsers.length == 1) {
                playingUsers.push(newUserId);
                return 'Player Two';
            }
            connectedUsers.push(newUserId);
            return connectedUsers.length.toString();
        }
    },
    Mutation: {
       addMessage: (
           _: unknown, // parental context
           {message, from}: {message: string, from: string}, // ur arguments
           { pubSub }: {pubSub: PubSub} // context from server
        ) => {
           const newMessage = {message, from};
           messages.push(newMessage);
           pubSub.publish(
               CHAT_CHANNLE,
               {messages}
           )
           return newMessage;
       }
    },
    Subscription: {
        messages: {
            subscribe: () => {
                const iterator =  pubSub.asyncIterator(CHAT_CHANNLE);
                pubSub.publish(CHAT_CHANNLE, {messages});
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
                if(playingUsers.length == 0) {
                    playingUsers.push(args.id);
                } else if(playingUsers.length == 1) {
                    playingUsers.push(args.id);
                } else {
                    connectedUsers.push(args.id);
                }
                pubSub.publish(GET_STATUS, {});
                return iterator;
            }, () => true)
            // , (payload, variables) => {
            //     return payload.somethingChanged.id === variables.relevantId;
            // }),
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