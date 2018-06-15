using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace XOR_Example
{
    class Program
    {
        static void Main(string[] args)
        {
            XOR_NN nn = new XOR_NN();
            Console.OutputEncoding = System.Text.Encoding.UTF8; ;
            Console.InputEncoding = Encoding.UTF8;

            PrintCommands();
            Console.WriteLine("--------TYPE IN YOUR COMMAND AND PRESS ENTER--------");
            Console.WriteLine();
            String input = Console.ReadLine();
            Console.WriteLine();
            while (input.ToUpper() != "FINISH")
            {

                switch (input)
                {
                    case "TRAIN":
                        nn.Train();
                        break;
                    case "COMPUTE":
                        nn.Compute();
                        break;
                    case "SHOW":
                        nn.Display();
                        break;
                    default:
                        Console.WriteLine("Sorry I didn't understand. Please choose one of the following commands:");
                        PrintCommands();
                        break;
                }

                input = Console.ReadLine();
                Console.WriteLine();
            }
        }

        private static void PrintCommands()
        {
            Console.WriteLine("COMMANDS:");
            Console.WriteLine("FINISH => PROGRAMM WILL STOP");
            Console.WriteLine("TRAIN => NEURAL NETWORK WILL TRAIN");
            Console.WriteLine("COMPUTE => NEURAL NETWORK WILL COMPUTE THE OUTPUTS");
            Console.WriteLine();
        }
    }
}
