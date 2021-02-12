using System.Net.WebSockets;

namespace GameServer.Context
{
    public class SocketPair
    {
        public WebSocket First { get; set; }
        public WebSocket Second { get; set; }

        public bool IsFilled => First != null && Second != null;

        public WebSocket GetCounterpart(WebSocket webSocket)
        {
            if(First == webSocket)
            {
                return Second;
            }

            return First;
        } 
    }
}
