//got the original example from here
//https://bl.ocks.org/e9t/6073cd95c2a515a9f0ba


var app = angular.module('nn_visualizer', []);

app.controller('MainCtrl', function ($scope, $interval, $window, $q) {
    var vm = this;
    var data;

    var networkGraph = {
        "nodes": []
    };


    var width = $window.innerWidth - 15;
    var height = 400,
		nodeSize = 15;

    var color = d3.scale.category20();

    angular.element($window).on('resize', function () {
        console.log($window.innerWidth);
        width = $window.innerWidth;
        draw();
    });

    $scope.$watchGroup(['vm.inputLayer', 'vm.hiddenLayersCount', 'vm.outputLayer'], function (newVal, oldVal) {
    });

    vm.draw = draw;


    function buildNodeGraph() {
        var newGraph = {
            "nodes": []
        };

        //construct input layer
        var newFirstLayer = [];
        if (vm.inputLayer.hasBias) {
            vm.inputLayer.neurons++;
        }
        for (var i = 0; i < vm.inputLayer.neurons; i++) {
            var lblText = '';
            if (vm.inputLayer.hasBias && i == 0) {
                lblText = 'bias';
            } else {
                lblText = "i" + i;
            }
            var newTempLayer = { "label": lblText , "layer": 1, weights: [22, 21] }; //jedes Neuron hat mehrere Weights
            newFirstLayer.push(newTempLayer);
        }

        //construct hidden layers
        var hiddenLayers = [];
        for (var hiddenLayer = 0; hiddenLayer < vm.hiddenLayers.length; hiddenLayer++) {
            var newHiddenLayer = [];
            //for the height of this hidden layer
            for (var i = 0; i < vm.hiddenLayers[hiddenLayer].neurons; i++) {
                var newTempLayer = { "label": "h" + hiddenLayer + i, "layer": (hiddenLayer + 2) };
                newHiddenLayer.push(newTempLayer);
            }
            hiddenLayers.push(newHiddenLayer);
        }

        //construct output layer
        var newOutputLayer = [];
        if (vm.outputLayer.hasBias) {
            vm.outputLayer.neurons++;
        }
        for (var i = 0; i < vm.outputLayer.neurons; i++) {
            var lblText = '';
            if (vm.outputLayer.hasBias && i == 0) {
                lblText = 'bias';
            } else {
                lblText = "i" + i;
            }
            var newTempLayer = { "label": lblText, "layer": vm.hiddenLayers.length + 2 };
            newOutputLayer.push(newTempLayer);
        }

        //add to newGraph
        var allMiddle = newGraph.nodes.concat.apply([], hiddenLayers);
        newGraph.nodes = newGraph.nodes.concat(newFirstLayer, allMiddle, newOutputLayer);

        return newGraph;

    }

    // Define the div for the tooltip
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    function drawGraph(networkGraph, svg) {
        var graph = networkGraph;
        var nodes = graph.nodes;

        // get network size
        var netsize = {};
        nodes.forEach(function (d) {
            if (d.layer in netsize) {
                netsize[d.layer] += 1;
            } else {
                netsize[d.layer] = 1;
            }
            d["lidx"] = netsize[d.layer];
        });

        // calc distances between nodes
        var largestLayerSize = Math.max.apply(
			null, Object.keys(netsize).map(function (i) { return netsize[i]; }));

        var xdist = width / Object.keys(netsize).length,
			ydist = (height - 15) / largestLayerSize;

        // create node locations
        nodes.map(function (d) {
            d["x"] = (d.layer - 0.5) * xdist;
            d["y"] = (((d.lidx - 0.5) + ((largestLayerSize - netsize[d.layer]) / 2)) * ydist) + 10;
        });

        // autogenerate links
        var links = [];
        var biasNeuronsIdxList = getTargetNeuronsBias(nodes);
        var c = 0;
        nodes.map(function (d, i) {
            for (var n in nodes) {
                
                if (d.layer + 1 == nodes[n].layer) { 
                    //for find weights
                    var weight = 0;

                    if (biasNeuronsIdxList.indexOf(parseInt(n)) == -1) { // check if is bias neuron
                        links.push({ "source": parseInt(i), "target": parseInt(n), "value": 1, weight: data.weights[c] }) // jeder link hat ein gewicht.
                        c++;
                    } else {
                        nodes[n].label = 'Bias'
                    }
                }
            }
        }).filter(function (d) { return typeof d !== "undefined"; });

        // draw links
        var link = svg.selectAll(".link")
		.data(links)
		.enter().append("line")
		.attr("class", "link")
		.attr("x1", function (d) { return nodes[d.source].x; })
		.attr("y1", function (d) { return nodes[d.source].y; })
		.attr("x2", function (d) { return nodes[d.target].x; })
		.attr("y2", function (d) { return nodes[d.target].y; })
        .attr('weight', function (d) { return d.weight; })
		.style("stroke-width", function (d) { return Math.sqrt(d.value); })
        .on("mouseover", function (d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html(d.weight.toString().substring(0,7))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
    .on("mouseout", function (d) {
        div.transition()
            .duration(500)
            .style("opacity", 0);
    });

        // draw nodes
        var node = svg.selectAll(".node")
		.data(nodes)
		.enter().append("g")
		.attr("transform", function (d) {
		    return "translate(" + d.x + "," + d.y + ")";
		}
		);

        var circle = node.append("circle")
		.attr("class", "node")
		.attr("r", nodeSize)
		.style("fill", function (d) { return color(d.layer); });


        node.append("text")
		.attr("dx", "-.35em")
		.attr("dy", ".35em")
		.attr("font-size", ".6em")
		.text(function (d) { return d.label; });
    }

    function getTargetNeuronsBias(nodes) {
        var idxList = [];
        var oldLayer = 1;
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (node.layer != oldLayer) {
                var totalLayers = 2 + vm.hiddenLayers.length;
                var hasBias = false;
                if (node.layer == 1) {
                    hasBias = vm.inputLayer.hasBias;
                } else if (node.layer == totalLayers) {
                    hasBias = vm.outputLayer.hasBias;
                } else {
                    hasBias = vm.hiddenLayers[node.layer - 2].hasBias;
                }

                if (hasBias) {
                    idxList.push(i);
                }
            }
            oldLayer = node.layer;
        }
        return idxList;
    }

    function draw() {

        if (!d3.select("svg")[0]) {

        } else {
            //clear d3
            d3.select('svg').remove();
        }



        var svg = d3.select("#neuralNet").append("svg")
		.attr("width", width)
		.attr("height", height);

        console.log("drawing   " + new Date());
        networkGraph = buildNodeGraph();
        //buildNodeGraph();
        drawGraph(networkGraph, svg);
    }


    function init() {
        var json = _dataString;
        data = JSON.parse(json);
        vm.inputLayer = data.input;
        vm.hiddenLayers = [];
        for (var i = 0; i < data.hidden.length; i++) {
            vm.hiddenLayers.push(data.hidden[i])
        }     
        vm.outputLayer = data.output
        vm.weights = data.weights;
  
        
        draw();
    }


    //main
    init()

});


