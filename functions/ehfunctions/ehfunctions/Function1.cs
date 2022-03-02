using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Azure.EventHubs;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;

namespace ehfunctions
{
    public class Function1
    {

        private static readonly string backendURL = Environment.GetEnvironmentVariable("sendMessageBackendURL");
        [FunctionName("Function1")]
        public async Task Run([EventHubTrigger("thermostat-events", Connection = "ehConnectionString")] EventData[] events, ILogger log)
        {
            var exceptions = new List<Exception>();

            foreach (EventData eventData in events)
            {
                try
                {
                    string messageBody = Encoding.UTF8.GetString(eventData.Body.Array, eventData.Body.Offset, eventData.Body.Count);

                    // Replace these two lines with your processing logic.
                    log.LogInformation($"C# Event Hub trigger function processed a message: {messageBody}");
                    using (var httpClient = new HttpClient())
                    {
                        var messageForBackend = new { user = "function", message = messageBody };
                        var content = JsonContent.Create(messageForBackend);
                        try
                        {
                            await httpClient.PostAsync(backendURL, content);

                        }
                        catch (Exception ex)
                        {
                            var e = ex;
                        }
                    }
                    await Task.Yield();
                }
                catch (Exception e)
                {
                    // We need to keep processing the rest of the batch - capture this exception and continue.
                    // Also, consider capturing details of the message that failed processing so it can be processed again later.
                    exceptions.Add(e);
                }
            }

            // Once processing of the batch is complete, if any messages in the batch failed processing throw an exception so that there is a record of the failure.

            if (exceptions.Count > 1)
                throw new AggregateException(exceptions);

            if (exceptions.Count == 1)
                throw exceptions.Single();
        }
    }
}
