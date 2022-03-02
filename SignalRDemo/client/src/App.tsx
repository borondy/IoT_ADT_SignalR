import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [connection, setConnection] = useState<HubConnection>();
  const [messages, setMessages] = useState<string[]>([]);
  const [weatherForecasts, setWeatherForecasts] = useState<any>();

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl(`${backendUrl}/messages`)
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  const startSignalRConnection = async () => {
    if (!connection) return;

    try {
      await connection.start();
      console.log("SignalR connected");

      connection.on("ReceiveMessage", (message) => {
        setMessages((messages) => [...messages, message.message]);
        console.log(`Message received: ${JSON.stringify(message)}`);
      });

      connection.on("ReceiveUpdateWeatherForecastNotification", async () => {
        const result = await (await fetch(`${backendUrl}/weatherforecast`)).json();
        setWeatherForecasts(result);
      });
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    startSignalRConnection();
  }, [connection]);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <ul>
          {messages.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
        <p>{JSON.stringify(weatherForecasts)}</p>
      </header>
    </div>
  );
}

export default App;
