using backend.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class MessageController : Controller
    {
        private readonly IHubContext<MessageHub, IMessageHubClient> _messageHub;

        public MessageController(IHubContext<MessageHub, IMessageHubClient> messageHub)
        {
            _messageHub = messageHub;
        }

        [HttpPost("messages")]
        public async Task Post(HubMessage message)
        {
            await _messageHub.Clients.All.ReceiveMessage(message);
        }

        [HttpPost("sendUpdateWeatherForecastNotification")]
        public async Task Post()
        {
            await _messageHub.Clients.All.ReceiveUpdateWeatherForecastNotification();
        }
    }
}
