const data = [
  {
    day: 1,
    apples: 3
  },
  {
    day: 2,
    apples: 10
  },
  {
    day: 3,
    apples: 15
  },
  {
    day: 4,
    apples: 2
  },
  {
    day: 5,
    apples: 10
  },
  {
    day: 6,
    apples: 19
  },
  {
    day: 7,
    apples: 20
  }
]

var margin = {
    top: 30,
    right: 20,
    bottom: 30,
    left: 50
  },
  width = 1000 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom

var svg = d3
  .select('body')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

var chart = svg.append('g').attr('id', 'chart')

var y = d3
  .scaleLinear()
  .range([height, 0])
  .domain([0, 15]) // maxapples

const xScale = d3
  .scaleLinear()
  .domain([1, data.length])
  .range([0, width])

svg
  .append('g')
  .attr('class', 'x-axis')
  .style('color', '#black')
  .attr('transform', 'translate(0,' + height + ')')
  .call(d3.axisBottom(xScale).ticks(data.length))

const bandScaleX = d3
  .scaleBand()
  .range([0, width])
  .domain([0, data.length])

var groups = svg
  .selectAll('.groups')
  .data(data)
  .enter()
  .append('g')
  .attr('transform', d => `translate(${xScale(d.day)}, ${-10})`)

var dots = groups
  .selectAll('circle')
  .data(d => d3.range(0, d.apples))
  .enter()
  .append('circle')
  .attr('class', 'dot')
  .attr('r', 10)
  .attr('cy', d => y(d))
  .style('fill', 'blue')
