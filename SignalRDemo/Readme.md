# SignalR Demo

I was interested on how we can send messages using .Net server side to React application. This demo shows us the very basics of using SignalR for achieving this goal.

## How to run the solutions?

### Backend

You can easily run it from Visual Studio or the dotnet cli. In the appsettings.Development.json feel free to update the `ClientApplication` value if you'd like to run your React app in a diferent port.

### Client

1. Add the **REACT_APP_BACKEND_URL** configuration setting to your environment variables in some way (_.env will be the easiest_).
2. open the client directory from any kind of terminal, and run the following commands:
   - npm i
   - npm start

## Key thoughts

I wanted to have a solution like this:

1. Backend receives a POST request from somewhere
2. Backend sends notification to clients: **New Weather Forecasts are available!**
3. Clients receive this notification, and fetch the new WeatherForecasts from backend.

### Backend components

#### MessageHub

An implementation of the abstract `Hub<T>` class. This is responsible for managing the SignalR connections.

#### IMessageHubClient

An interface describing the clients/client capabilities we want to communicate with.

#### MessageController

Controller for sending messages to clients from the _outside world_. We are using the `IHubContext<MessageHub, IMessageHubClient>` injected dependency because it is already provided by ASP.NET and it let's us access the methods defined in the `IMessageHubClient` interface.

### Client
We are using the `@microsoft/signalr` package.  
We can build a `HubConnection` via the `HubConnectionBuilder` class. The withUrl() call uses the endpoint we configured in our backend with `app.MapHub<MessageHub>("/mesages")`.  
As soon as we have the HubConnection, we can `start()` the communication, and listen `on({diferent kind of messages we defined in our backend on IMessageHubClient })`.