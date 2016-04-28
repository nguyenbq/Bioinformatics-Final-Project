import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Tasks } from '../api/tasks.js';

import './task.js'; 
import './body.html';

Template.body.onCreated(function bodyOnCreated() {
  this.state = new ReactiveDict();
  Meteor.subscribe('tasks');
});
 
Template.body.helpers({
  tasks() {
    const instance = Template.instance();
    if (instance.state.get('hideCompleted')) {
      // If hide completed is checked, filter tasks
      return Tasks.find({ checked: { $ne: true } }, { sort: { createdAt: -1 } });
    }
    // Otherwise, return all of the tasks
    return Tasks.find({}, { sort: { createdAt: -1 } });
  },
  incompleteCount() {
    return Tasks.find({ checked: { $ne: true } }).count();
  },
});

 
Template.body.events({
  'submit .new-task'(event) {
    // Prevent default browser form submit
    event.preventDefault();
 
    // Get value from form element
    const target = event.target;
    const text = target.text.value;
 
    // Insert a task into the collection
    Meteor.call('tasks.insert', text);
 
    // Clear form
    target.text.value = '';
  },
  'change .hide-completed input'(event, instance) {
    instance.state.set('hideCompleted', event.target.checked);
  },
});


//barChart
var Points = new Meteor.Collection(null);

if(Points.find({}).count() === 0){
  for(i = 0; i < 20; i++)
    Points.insert({
      date:moment().startOf('day').subtract('days', Math.floor(Math.random() * 1000)).toDate(),
      value:Math.floor(Math.random() * 100)+500
    });
}

Template.lineChart.events({
  'click #add':function(){
    Points.insert({
      date:moment().startOf('day').subtract('days', Math.floor(Math.random() * 1000)).toDate(),
      value:Math.floor(Math.random() * 100)+500
    });
  },
  'click #remove':function(){
    var toRemove = Random.choice(Points.find().fetch());
    Points.remove({_id:toRemove._id});
  },
  'click #randomize':function(){
    //loop through bars
    Points.find({}).forEach(function(point){
      Points.update({_id:point._id},{$set:{value:Math.floor(Math.random() * 100)+500}});
    });
  }
});

//LineChart
Template.lineChart.rendered = function(){
  //Width and height
  var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  var x = d3.time.scale()
    .range([0, width]);

  var y = d3.scale.linear()
    .range([height, 0]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

  var line = d3.svg.line()
    .x(function(d) {
      return x(d.x);
    })
    .y(function(d) {
      return y(d.y);
    });

  var svg = d3.select("#lineChart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");

  svg.append("g")
    .attr("class", "y axis")
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("BMI");

  Tracker.autorun(function(){
    var dataset = [
      {x: new Date(2013,2,31), y: 20},
      {x: new Date(2013,4, 3), y: 20},
      {x: new Date(2013,6,11), y: 20},
      {x: new Date(2013,8,16), y: 21},
      {x: new Date(2013,10,18), y: 21.5},
      {x: new Date(2013,12,31), y: 21},
      {x: new Date(2014,2,3),  y: 21},
      {x: new Date(2014,4,11), y: 21},
      {x: new Date(2014,6,16), y: 22},
      {x: new Date(2014,8,18), y: 22},
      {x: new Date(2014,10,31), y: 22},
      {x: new Date(2014,12, 3), y: 22.5},
      {x: new Date(2015,2,11), y: 22},
      {x: new Date(2015,4,16), y: 21},
      {x: new Date(2015,6,18), y: 21.5},
      {x: new Date(2015,8,31), y: 22},
      {x: new Date(2015,10,3),  y: 22.5},
      {x: new Date(2015,12,11), y: 22},
      {x: new Date(2016,2,16), y: 21.5},
      {x: new Date(2016,4,18), y: 22},
      {x: new Date(2016,6,18), y: 21},
      {x: new Date(2016,8,31), y: 23},
      {x: new Date(2016,10,3),  y: 22},
      {x: new Date(2016,12,11), y: 22},
    ];
   var mindate = new Date(2013,0,1),
              maxdate = new Date(2016,12,31);

    var paths = svg.selectAll("path.line")
      .data([dataset]); //todo - odd syntax here - should use a key function, but can't seem to get that working

    x.domain(d3.extent(dataset, function(d) { return d.x; }));
    y.domain(d3.extent(dataset, function(d) { return d.y; }));

    //Update X axis
    svg.select(".x.axis")
      .transition()
      .duration(1000)
      .call(xAxis);
      
    //Update Y axis
    svg.select(".y.axis")
      .transition()
      .duration(1000)
      .call(yAxis);
    
    paths
      .enter()
      .append("path")
      .attr("class", "line")
      .attr('d', line);

    paths
      .attr('d', line); //todo - should be a transisition, but removed it due to absence of key
      
    paths
      .exit()
      .remove();
  });
};

//BMI Chart
Template.bmiChart.rendered = function(){
  var margin = {top: 20, right: 100, bottom: 30, left: 100},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  var xScale = d3.time.scale()
      .domain([mindate, maxdate])
      .range([0, width]);

  var yScale = d3.scale.linear()
      .domain([19, d3.max(dataset, function(d){ return d.y; })])
      .range([height, 30]);
   
  var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient("left");

  var line = d3.svg.line()
      .x(function(d) { return xScale(d.x); })
      .y(function(d) { return yScale(d.y); });

  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);


  Tracker.autorun(function(){
    var dataset = [
      {x: new Date(2013,2,31), y: 20},
      {x: new Date(2013,4, 3), y: 20},
      {x: new Date(2013,6,11), y: 20},
      {x: new Date(2013,8,16), y: 21},
      {x: new Date(2013,10,18), y: 21.5},
      {x: new Date(2013,12,31), y: 21},
      {x: new Date(2014,2,3),  y: 21},
      {x: new Date(2014,4,11), y: 21},
      {x: new Date(2014,6,16), y: 22},
      {x: new Date(2014,8,18), y: 22},
      {x: new Date(2014,10,31), y: 22},
      {x: new Date(2014,12, 3), y: 22.5},
      {x: new Date(2015,2,11), y: 22},
      {x: new Date(2015,4,16), y: 21},
      {x: new Date(2015,6,18), y: 21.5},
      {x: new Date(2015,8,31), y: 22},
      {x: new Date(2015,10,3),  y: 22.5},
      {x: new Date(2015,12,11), y: 22},
      {x: new Date(2016,2,16), y: 21.5},
      {x: new Date(2016,4,18), y: 22},
      {x: new Date(2016,6,18), y: 21},
      {x: new Date(2016,8,31), y: 23},
      {x: new Date(2016,10,3),  y: 22},
      {x: new Date(2016,12,11), y: 22},
    ];
    var mindate = new Date(2013,0,1),
        maxdate = new Date(2016,12,31);
  });
};


//PedChart
Template.PedChart.rendered = function(){
  //Width and height
  var margin = {top: 0, right: 320, bottom: 0, left: 0},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  var tree = d3.layout.tree()
      .separation(function(a, b) { return a.parent === b.parent ? 1 : .5; })
      .children(function(d) { return d.parents; })
      .size([height, width]);

  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  Tracker.autorun(function(){
    d3.json("tree.json", function(error, json) {
    if (error) throw error;

    var nodes = tree.nodes(json);

    var link = svg.selectAll(".link")
        .data(tree.links(nodes))
      .enter().append("path")
        .attr("class", "link")
        .attr("d", elbow);

    var node = svg.selectAll(".node")
        .data(nodes)
      .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })

    node.append("text")
        .attr("class", "name")
        .attr("x", 8)
        .attr("y", -6)
        .text(function(d) { return d.name; });

    node.append("text")
        .attr("x", 8)
        .attr("y", 8)
        .attr("dy", ".71em")
        .attr("class", "about lifespan")
        .text(function(d) { return d.born + "–" + d.died; });

    node.append("text")
        .attr("x", 8)
        .attr("y", 8)
        .attr("dy", "1.86em")
        .attr("class", "about medical history")
        .text(function(d) { return d.medicalhistory; });
  });

  function elbow(d, i) {
    return "M" + d.source.y + "," + d.source.x
         + "H" + d.target.y + "V" + d.target.x
         + (d.target.children ? "" : "h" + margin.right);
  };
});
};


//Vaccine Table
Template.vaccinetbl.rendered = function(){
  var header = d3.select("body").append("div").attr("class", "well");

  header.append("h3").text("Vaccine Record");

  var taskLabel = header.append("label")

  .attr("id", "taskLabel")

  .html("&nbsp;");

  var currTask = 0;

  var taskButton = header.append("button")

  .attr("class", "btn btn-primary")

  .style("margin-bottom", "20px")

  .style("width", "100%")

  .style("text-align", "left")

  .text("Start")

  .on("click", function() {

    this.blur();

    tasks[currTask]();

    currTask = ++currTask % tasks.length;

  })

  var tableDiv = d3.select("body").append("div").attr("id", "tableDiv1");


  Tracker.autorun(function(){
    var data;
    var initialData = [
      { table: "At birth", rows: [
          { table: "Hepatitis B #1", row: "Jan 1, 2016", data: "Jan 1,2016", status:"Administered" }
        ]
      },
      { table: "Second Month", rows: [
          { table: "DTAP #1", row: "March 8, 2016", data: "March8, 2016", status:"pending" },
          { table: "PCV #1", row: "March8, 2016", data: "March8, 2016", status:"pending" },
          { table: "IPV #1", row: "March8, 2016", data: "March8, 2016", status:"pending" }
        ]
      },
      { table: "Fourth Month", rows: [
          { table: "DTAP #2", row: "May 18, 2016", data: "May 18, 2016", status:"pending" },
          { table: "PCV #2", row: "May 18, 2016", data: "May 18, 2016", status:"pending" },
          { table: "IPV #2", row: "May 18, 2016", data: "May 18, 2016", status:"pending" }
        ]
      },
      { table: "Sixth to Fifteenth Month", rows: [
          { table: "DTAP #3", row: "July 18, 2016", data: "July 18, 2016", status:"pending" },
          { table: "PCV #3", row: "July 18, 2016", data: "July 18, 2016", status:"pending" },
          { table: "IPV #3", row: "July 18, 2016", data: "July 18, 2016", status:"pending" },
          { table: "MMR #1", row: "July 18, 2016", data: "July 18, 2016", status:"pending" },
          { table: "Varicella", row: "July 18, 2016", data: "July 18, 2016", status:"pending" },
          { table: "PCV #4", row: "July 18, 2016", data: "July 18, 2016", status:"pending" }
        ]
      }
    ]


    function task0() {
      update([]);

     
      taskButton.text("Vaccine Records");
    }

    function task1() {
      data = JSON.parse(JSON.stringify(initialData));
      update(data);

      taskLabel.text("Name: Panace panacea ID: 1234 DOB: Jan 1, 2016  Age: 1 month");
      taskButton.text("Back");
    }

    var tasks = [task0, task1,];

    function update(data) {

     
      var divs = tableDiv.selectAll("div")
          
          .data(function(d) {
            return data;
          }, function(d) { 
          return d.table 
          })

      
      divs.exit().remove();

     
      var divsEnter = divs.enter().append("div")
          .attr("id", function(d) { return d.table + "Div"; })
          .attr("class", "well")
     
      divsEnter.append("h5").text(function(d) { return d.table; });

      
      var tableEnter = divsEnter.append("table")
          .attr("id", function(d) { return d.table })
          .attr("class", "table table-condensed table-striped table-bordered")

      
      tableEnter.append("thead")
        .append("tr")
          .selectAll("th")
          .data(["VACCINE", "DUE DATE", "ADMINISTERED ON", "STATUS"])
        .enter().append("th")
          .text(function(d) { return d; })

     
      tableEnter.append("tbody");

     
      var tr = divs.select("table").select("tbody").selectAll("tr")
          .data(function(d, i) { return d.rows; }, function(d) { return d.row }); // again we're using key function to disable by-index evaluation

    
      
      tr.enter().append("tr");

      
      var td = tr.selectAll("td")
          .data(function(d, i) { return d3.values(d); });


      td.enter().append("td");

      
      td.text(function(d) { return d; })
    };
  });
};





