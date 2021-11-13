---
title: Online Spot Reservation.
excerpt: Simple Graphql subscription based reservation system, with React based UI.
Tools: ['Express', 'React', 'graphql-yoga', Webpack', 'XSTate', 'wonka', '@urql', 'subscriptions-transport-ws', 'material-ui']
---

# Online Spot Reservation
This is a simple project to try out graphql subscription with graphql-yoga in the backend and wonka and subscriptions-transport in the frontend.

### Local Development

#### Server 
- Is a simple GraphQLServer from `graphql-yoga`. 
- It has a publisher/subscriber to listen to and update the channels.
- The crux is the two mutations:
  - getQueueStatus - accepts the email(id) and type('check-in' or 'check-status') to subscribe user to the channel 'CHECK_IN_CHANNEL' and then return the current waiting status for him.
  - watingTime - its a subscription that subscribe to the 'GET_STATUS' channel and returns the current waiting time for the system.
- Each subscription has two things:
  - `resolve` - Is function that takes `payload` and `args`. `payload` is the data we transfer in channel as the second argument. `args` is the argument we subscribed with. This is the function that resolve the final output for the subscription into the channels.
  - `subscribe` - is the function that gets runs first when a user subscribe to a subscription. We have used `withFilter` from `yoga` to filter the subscription.
  - `withFilter` takes two functions as argument. The first one is where we subscribe to the channel and do any logic related work. The second function is the one that has logic to filter the subscription, returning false will not relay event to the particular subscriptions.
  - To run `npm run start` it will run the server at port 4000.

#### Client
- The client is a simple React based UI.
- It has XState to manage the UI State for reservation flow.
- To run `npm run start`, will start the UI at port 8081.
  