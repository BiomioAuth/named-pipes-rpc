using System;
using System.IO;
using System.IO.Pipes;

namespace ConsoleApplication1
{

    class PipeEvent
    {
        public string method { get; set; }
        public string parameters { get; set; }
        public int id { get; set; }
    }

    class Program
    {
        static string pipe = "biomio-pipe";

        static void Main(string[] args)
        {
            var javaScriptSerializer = new  System.Web.Script.Serialization.JavaScriptSerializer();

            using (NamedPipeClientStream pipeClient =
            new NamedPipeClientStream(".", pipe, PipeDirection.InOut))
            {

                // Connect to the pipe or wait until the pipe is available.
                Console.Write("Attempting to connect to pipe...");
                pipeClient.Connect();

                Console.WriteLine("Connected to pipe.");
                Console.WriteLine("There are currently {0} pipe server instances open.",
                   pipeClient.NumberOfServerInstances);

                StreamWriter writer = new StreamWriter(pipeClient);

                // create event
                var ev = new PipeEvent();
                ev.method = "run_auth";
                ev.parameters = "user@gmail.com";
                ev.id = 1;

                string jsonEvent = javaScriptSerializer.Serialize(ev);

                // send event to node.js app
                writer.WriteLine(jsonEvent);
                writer.Flush();

                using (StreamReader sr = new StreamReader(pipeClient))
                {
                    // Display the read text to the console
                    string temp;
                    while ((temp = sr.ReadLine()) != null)
                    {
                        // here we receive responses from node.js library and can parse them 
                        Console.WriteLine("Received from server: {0}", temp);
                    }
                }
            }

            Console.Write("Press Enter to continue...");
            Console.ReadLine();
        }

    }
}