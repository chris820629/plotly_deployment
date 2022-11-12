function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // 3. Create a variable that holds the samples array. 
    var sample_array = data.samples;
   
    // 4. Create a variable that filters the samples for the object with the desired sample number.
    var filter_data = sample_array.filter(item => item.id==sample);
    
    //  5. Create a variable that holds the first sample in the array.
    var sample_object = filter_data[0];

    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    var sample_values = sample_object.sample_values;
    var otu_ids = sample_object.otu_ids;
    var otu_labels = sample_object.otu_labels;

    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last. 
    var newdata = [];
    for (var i =0; i<sample_values.length;i+=1){
      newdata.push({
        otu_id: otu_ids[i],
        otu_label: otu_labels[i],
        sample_value: sample_values[i]
      })
    }
    
    var sort_data = newdata.sort((a,b)=>a.sample_value-b.sample_value).reverse();
    
    var slice_data = sort_data.slice(0,10).reverse()
    
    var yticks = slice_data.map(id =>'OTU '+id.otu_id);
    
    

    //Creat Bar Chart
    
    // 8. Create the trace for the bar chart. 
    var barData = [{
      x: slice_data.map(id=>parseInt(id.sample_value)),
      y: yticks,
      type: 'bar',
      orientation: 'h',
      text: slice_data.map(data=>data.otu_label)
    }
    ];
  
    // 9. Create the layout for the bar chart. 
    var barLayout = {
      title: "Top 10 Bacteria Cultures Found",
      xaxis: {title: "Sample Value"},
      yaxis: {title: "ID"},
      width: 700,
      height: 400,
      paper_bgcolor:'rgba(0,0,0,0)',
      plot_bgcolor:'rgba(0,0,0,0)',
      padding: 10
    };
    var config = {responsive: true}
    // 10. Use Plotly to plot the data with the layout. 
    
    Plotly.newPlot('bar',barData,barLayout,config)

    
    //Plot Bubble Chart
    // 1. Create the trace for the bubble chart.
    var bubbleData = [{
      x: newdata.map(data=>data.otu_id),
      y: newdata.map(data=>data.sample_value),
      text: newdata.map(data=>data.otu_label),
      mode: 'markers',
      marker: {
        size: newdata.map(data=>data.sample_value),
        color: newdata.map(data=>data.otu_id)
      }
    }
    ];

    // 2. Create the layout for the bubble chart.
    var bubbleLayout = {
      title: "Bacteria Cultures Per Sample",
      xaxis: {title: "ID"},
      yaxis: {title: "Sample Value"},
      width: 900,
      height: 700,
      hovermode:'closest',
      paper_bgcolor:'rgba(0,0,0,0)',
      plot_bgcolor:'rgba(0,0,0,0)'
    };

    // 3. Use Plotly to plot the data with the layout.
    Plotly.newPlot('bubble',bubbleData,bubbleLayout,config); 

    
    //build gauge chart
    var metadata = data.metadata.filter(sampleObj => sampleObj.id == sample)[0].wfreq;
    console.log(metadata)
    var gauge_data = [{
      domain: {x:[0,1],y:[0,1]},
      value: metadata,
      title: { text: "Belly Button Washing Frequency"},
		  type: "indicator",
		  mode: "gauge+number+delta",
      gauge: {
        axis: { range: [null, 10] , text:'scrub per week' },
        steps: [
          { range: [0, 2], color: "red" },
          { range: [2, 4], color: "orange" },
          { range: [4, 6], color: "yellow" },
          { range: [6, 8], color: "greenyellow" },
          { range: [8, 10], color: "green" }
        ]}
    }]
    var gauge_layout = { 
      width: 600, 
      height: 450, 
      margin: { t: 0, b: 0 },
      paper_bgcolor:'rgba(0,0,0,0)',
      plot_bgcolor:'rgba(0,0,0,0)' }
    Plotly.newPlot('gauge',gauge_data,gauge_layout,config)
  });
}
