
using Microsoft.Azure.Devices.Client;
using System.Text;
using Newtonsoft.Json;

var connectionString = "<your connectionstring>";
var client = DeviceClient.CreateFromConnectionString(connectionString);


while (true)
{
    int temp = new Random().Next(15, 30);
    var data = new { deviceId = "thermostat-2", temperatureInC = temp };
    var message = new Message(Encoding.UTF8.GetBytes(
                            JsonConvert.SerializeObject(data)));

    client.SendEventAsync(message).Wait();
    Task.Delay(5000).Wait();
}