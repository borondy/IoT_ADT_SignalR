using IoTHubTrigger = Microsoft.Azure.WebJobs.EventHubTriggerAttribute;

using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.Azure.EventHubs;
using System.Text;
using System.Net.Http;
using System;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Azure.DigitalTwins.Core;
using Azure.Identity;
using Azure;
using Newtonsoft.Json;
using System.Threading.Tasks;

namespace ehfunctions
{
    public class IoTHubEventProcessor
    {
        private static readonly string adtUrl = System.Environment.GetEnvironmentVariable("adtUrl");
        private static readonly string azureAdTenantId = System.Environment.GetEnvironmentVariable("azureAdTenantId");

        [FunctionName("IoTHubEventProcessor")]
        public async Task Run([IoTHubTrigger("messages/events", Connection = "iotHubConnectionString")] EventData message, ILogger log)
        {
            var data = Encoding.UTF8.GetString(message.Body.Array);
            var tempMessage = JsonConvert.DeserializeObject<TempMessage>(data);
            var creds = new DefaultAzureCredential(new DefaultAzureCredentialOptions { VisualStudioTenantId = azureAdTenantId });
            var client = new DigitalTwinsClient(new Uri(adtUrl), creds);
            var updatePatch = new JsonPatchDocument();
            updatePatch.AppendReplace("/temperatureInDegreeCelsius", tempMessage.TemperatureInC);
            try
            {
                await client.UpdateDigitalTwinAsync(tempMessage.DeviceId, updatePatch);
            }
            catch (Exception ex)
            {
                log.LogInformation(ex.Message);
            }

        }
    }

    class TempMessage
    {
        public string DeviceId { get; set; }
        public int TemperatureInC { get; set; }
    }
}



// {"deviceId":"thermostat-2","temperatureInC":29}