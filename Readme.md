# Azure Digital Twins sample 
This is a sample solution created for demoing the querying and integration capabilities of Azure Digital Twins.
## Contents:
### edgeDevice  
Contains IoT Edge device simulator for periodically sending simulated telemetry from a specified sensor 
- Run from VS or `dotnet run` after updating the **\<your connectionstring\>** value in Program.cs
<hr>

### functions
Dotnet Function App with functions for:
- updating Azure Digital Twins triggered by IoT Hub messages
- calling SignalRDemo application's messaging endpoint ADT twin updated event 
    - the event is forwarded manually to a specific event hub...
    - TODO include IaC if needed  
<hr>

Run from VS after updating environment variables in `local.settings.json`
`ehConnectionString`: "", <- connection string where the ADT events are directed  
`iotHubConnectionString`: "", <-- IoT hub default eventhub compatible endpoint   
`adtUrl`: "https://...",  <-- Your digital twins  
`azureAdTenantId`: ""  <-- Tenant Id of your Azure Active Directory
<hr>

### graphCreator
Azure Digital Twins sample graph creator. 
Not necessarely intended for distribution, just wanted to create a "complex enough" graph for demonstrating the queries.

How to Run:  
provide ADT_URL in .env
```sh
# from it's directory
npm i      ## install dependencies
npm start   ## start application... 
            ## 10s wait time is included (consistency reasons)
```
Feel free to run `npm start` two times... second execution can create the initially missing relationships (caused by consistency issues)


TODO fix relationship creation issues  
<hr>


### Ontology
Contains the models used to create the ADT graph.

<hr>  

### SignalRDemo
Basic server to client messaging application. More info in its own readme.


