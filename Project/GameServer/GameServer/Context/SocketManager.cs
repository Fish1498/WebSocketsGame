using System;
using System.Collections.Generic;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace GameServer.Context
{
    public static class SocketManager
    {
        static readonly byte[] StartMessage1 = Encoding.ASCII.GetBytes("1");
        static readonly byte[] StartMessage2 = Encoding.ASCII.GetBytes("2");

        public static List<SocketPair> SocketPairs = new List<SocketPair>();
        public static SocketPair GetPair(WebSocket webSocket)
        {
            foreach (var pair in SocketPairs)
            {
                if (!pair.IsFilled)
                {
                    pair.Second = webSocket;

                    return pair;
                }
            }

            var socketPair = new SocketPair
            {
                First = webSocket
            };

            SocketPairs.Add(socketPair);

            return socketPair;
        }

        public static async Task HandlePair(WebSocket webSocket, SocketPair socketPair)
        {
            while (true)
            {
                if (!socketPair.IsFilled)
                {
                    Thread.Sleep(50);
                } else
                {
                    break;
                }
            }

            if (webSocket == socketPair.First)
            {
                await webSocket.SendAsync(new ArraySegment<byte>(StartMessage1, 0, StartMessage1.Length), WebSocketMessageType.Text, true, CancellationToken.None);
            } else
            {
                await webSocket.SendAsync(new ArraySegment<byte>(StartMessage2, 0, StartMessage2.Length), WebSocketMessageType.Text, true, CancellationToken.None);
            }

            var counterPart = socketPair.GetCounterpart(webSocket);
            var buffer = new byte[1024 * 4];
            var result = await counterPart.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

            while (!result.CloseStatus.HasValue)
            {
                await webSocket.SendAsync(new ArraySegment<byte>(buffer, 0, result.Count), result.MessageType, result.EndOfMessage, CancellationToken.None);

                result = await counterPart.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            }

            await counterPart.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, CancellationToken.None);
        }
    }
}
