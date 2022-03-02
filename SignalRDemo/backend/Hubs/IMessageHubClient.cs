using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend.Hubs
{
    public interface IMessageHubClient
    {
        Task ReceiveMessage(HubMessage message);
        Task ReceiveUpdateWeatherForecastNotification();
    }

    public class HubMessage
    {
        public string User { get; set; }
        public string Message { get; set; }

        public HubMessage(string user, string message)
        {
            User = user;
            Message = message;
        }
    }
}
