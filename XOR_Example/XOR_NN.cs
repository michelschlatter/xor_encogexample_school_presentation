using Encog.Engine.Network.Activation;
using Encog.ML.Data;
using Encog.ML.Data.Basic;
using Encog.ML.Train;
using Encog.Neural.Networks;
using Encog.Neural.Networks.Layers;
using Encog.Neural.Networks.Training.Propagation.Resilient;
using NetworkToJSon;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace XOR_Example
{
    public class XOR_NN
    {
        /// <summary>
        /// Input for the XOR function.
        /// </summary>
        public static double[][] XORInput = {
            new[] {0.0, 0.0},
            new[] {1.0, 0.0},
            new[] {0.0, 1.0},
            new[] {1.0, 1.0}
        };

        /// <summary>
        /// Ideal output for the XOR function.
        /// </summary>
        public static double[][] XORIdeal = {
            new[] {0.0},
            new[] {1.0},
            new[] {1.0},
            new[] {0.0}
        };


        BasicNetwork network;

        public void Train()
        {
            // create a neural network, without using a factory
            network = CreateNetwork();

            // create training data
            IMLDataSet trainingSet = new BasicMLDataSet(XORInput, XORIdeal);

            // train the neural network
            IMLTrain train = new ResilientPropagation(network, trainingSet);

            int epoch = 1;

            DateTime start = DateTime.Now;
            while (train.Error > 0.01 || epoch < 1000)
            {
                train.Iteration();
                Console.WriteLine(@"Iteration #" + epoch + @" Error:" + train.Error);
                epoch++;
            }

            DateTime end = DateTime.Now;
            Console.WriteLine("------------------TRAINING FINISHED----------------");
            Console.WriteLine("Training duration:" + (end-start).TotalMilliseconds + "ms");
            Console.WriteLine();
        }

        public void Display()
        {
            if (network != null)
            {
                NetworkToJson.ToJson(network);
            }
        }

        public void Compute() 
        {
            // create training data
            IMLDataSet trainingSet = new BasicMLDataSet(XORInput, XORIdeal);

            if(network == null) {
                network = CreateNetwork();
            }            

            // test the neural network
            Console.WriteLine(@"Neural Network Results:");
            Console.WriteLine();

            Console.WriteLine("  INPUT                | OUTPUT        |SOLL-WERT        |STATUS");
            foreach (IMLDataPair pair in trainingSet)
            {
                IMLData output = network.Compute(pair.Input);
                Console.WriteLine($"[{pair.Input[0]} || {pair.Input[1]} ]              | {Math.Round(output[0])}             | {pair.Ideal[0]}               |{(Math.Round(output[0]) == pair.Ideal[0] ? "OK" : "X")}"); 
            }
            Console.WriteLine();
        }

        private static BasicNetwork CreateNetwork()
        {
            var network = new BasicNetwork();
            network.AddLayer(new BasicLayer(null, true, 2));
            network.AddLayer(new BasicLayer(new ActivationSigmoid(), true, 20));
            network.AddLayer(new BasicLayer(new ActivationSigmoid(), true, 10));
            network.AddLayer(new BasicLayer(new ActivationSigmoid(), true, 5));
            network.AddLayer(new BasicLayer(new ActivationSigmoid(), false, 1));
            network.Structure.FinalizeStructure();
            network.Reset();
           
            JsonSerializerSettings settings = new JsonSerializerSettings() { ReferenceLoopHandling = ReferenceLoopHandling.Ignore };
            return network;
        }

    }
}
