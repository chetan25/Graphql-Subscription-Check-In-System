import { GraphQLServer, PubSub, withFilter  } from 'graphql-yoga';

const CHECK_IN_CHANNEL = 'CHECK_IN_CHANNEL';
const GET_STATUS = 'GET_STATUS';

const pubSub = new PubSub();

type UserEmail = String;

let checkedInUsers: UserEmail[] = [];
let defaultWaitingTime = 2;
const perCheckInTime = 2;
let currentWaitingTime = defaultWaitingTime;

const typeDefs = `
  type Mutation {
      unSubscribe(id: String!): Boolean
  }
  type CheckInStatus {
      status: String!,
      message: String!
  }
  type Subscription {
    getQueueStatus(id: String!, type: String!): CheckInStatus!
    watingTime: String!
  }
  type Query {
    _empty: String  
  }
`;

  
const resolvers = {
    // Query: { },
    Mutation: {
       unSubscribe: (
            _: unknown, // parental context
            {id}: {id: string}, // usr arguments
            { pubSub }: {pubSub: PubSub} // context from server
       ) => {
            pubSub.publish(GET_STATUS, {all: true});

            return true;
       }
    },
    Subscription: {
        watingTime: {
            subscribe: () => {
                const iterator =  pubSub.asyncIterator(CHECK_IN_CHANNEL);
                const waitingTimeMessage = `Current waiting time is ${currentWaitingTime} minutes`;
                pubSub.publish(CHECK_IN_CHANNEL, {watingTime: waitingTimeMessage});
                return iterator;
            }
        },
        getQueueStatus: {
            resolve: (payload: String[], args: {id: String, type: String}) => {
                // Manipulate and return the new value
                const index = checkedInUsers.findIndex(el => el === args.id);
                console.log(index, 'index');
                if (index < 0 && args.type === 'check-status') {
                    return {
                        status: 'not-found',
                        message: ` Seems like the email is not in the system, please check-in first `
                    }
                }
                if (index < 0) {
                    return {
                        status: 'done',
                        message: ` It's your time now to see the doctor `
                    }
                }
                const waitingIndex = index + 1;
                const waitTime = (waitingIndex * perCheckInTime);

                return {
                    status: 'success',
                    message: ` You are ${waitingIndex} in Queue and wait time is ${waitTime} minutes `
                }
            },
            subscribe: withFilter((_:unknown, args: {id: String, type: String}) => {
                // console.log(rootValue, args, context, info);
                const iterator =  pubSub.asyncIterator(GET_STATUS);

                pubSub.publish(GET_STATUS, {userId: args.id});
                const index = checkedInUsers.findIndex(el => el === args.id);
                if (index < 0 && args.type === 'check-in') {
                    checkedInUsers.push(args.id);
                    currentWaitingTime += perCheckInTime;
                }

                const waitingTimeMessage = `Current waiting time is ${currentWaitingTime} minutes`;
                pubSub.publish(CHECK_IN_CHANNEL, {watingTime: waitingTimeMessage});
                return iterator;
            }, 
            (payload, variables) => {
                console.log('variables', variables);
                console.log('payload', payload);
                // for playing user, we only want to retun once
                return true;
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

const finishAppointment = () => {
  if(checkedInUsers.length === 0) {
      console.log('no user yet');
      return;
  }
  console.log('inishing appointment');
  const userId = checkedInUsers.shift();
  currentWaitingTime = currentWaitingTime - defaultWaitingTime;
  const waitingTimeMessage = `Current waiting time is ${currentWaitingTime} minutes`;
  pubSub.publish(CHECK_IN_CHANNEL, {watingTime: waitingTimeMessage});
  pubSub.publish(GET_STATUS, {userId: userId});
}

server.start(() => {
    console.log('Server started at port 4000');

    setInterval(function(){ 
        finishAppointment()
    }, 40000);
})

