// subscription client
import { createClient, Client, defaultExchanges, subscriptionExchange } from '@urql/core';
import { SubscriptionClient } from 'subscriptions-transport-ws';

let client: Client | null = null;

const createNewSubscriptionClient = () => {
    const subscriptionClient = new SubscriptionClient(
        "ws://localhost:4000",
        {
           reconnect: true
        }
    );
    
    // create client
    return createClient({
        url: 'http://localhost:4000',
        exchanges: [
            ...defaultExchanges,
            subscriptionExchange({
                forwardSubscription: (operation) => subscriptionClient.request(operation) as any
            })
        ]
      });
}


export const useSubscriptionClient = () => {
   if (!client) {
      client = createNewSubscriptionClient();
    }

    return client;
}
