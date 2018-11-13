'use strict'

const margin = { top: 48, right: 72, bottom: 120, left: 72 }

const width = window.innerWidth - margin.left - margin.right,
  height = 600

const radius = 7

const svg = d3.select('svg')

const group = svg
  .attr('width', width)
  .attr('height', height)
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

d3.json('data.json').then(data => {
  console.log(data)

  data.map(item => {
    item.r = radius
    return item
  })

  const uniqueYears = uniqueKeys(data, 'publicationYear', 'asc')
  const minMax = d3.extent(data.map(year => year.publicationYear))

  const xScale = d3
    .scaleLinear()
    .domain(minMax)
    .range([0, width])

  svg
    .append('g')
    .attr('class', 'x-axis')
    .style('color', '#black')
    .attr('transform', 'translate(0,' + height + ')')
    .call(
      d3
        .axisBottom(xScale)
        .ticks(uniqueYears.length)
        .tickFormat(d3.format('y'))
    )

  console.log(svg.selectAll('.x-axis'))

  var w = 600,
    h = 600

  var yearColors = {
    '2000': '#4BB7C3',
    '2001': '#41246B',
    '2002': '#DABE90',
    '2003': '#286977',
    '2004': '#D071BD',
    '2005': '#ECD7C6',
    '2006': '#D1E7F0',
    '2007': '#241132',
    '2008': '#CD6A83',
    '2009': '#44C1C1',
    '2010': '#C3A54B',
    '2011': '#E5D9F2',
    '2012': '#852E8A',
    '2013': '#B0713B',
    '2014': '#BEC9E9',
    '2015': '#8BD175',
    '2016': '#3A501B',
    '2017': '#163B41',
    '2018': '#CFD47D'
  }

  const circles = svg.selectAll('circle').data(data)

  const simulation = d3
    .forceSimulation(data)
    .force('magnetic', d3.forceManyBody().strength(2))
    .force('x', d3.forceX().x(d => xScale(d.publicationYear)))
    .force('y', d3.forceY().y((d, i) => height - 50))
    .force('collision', d3.forceCollide().radius(d => radius * 1.1))
    .on('tick', ticked)

  function ticked() {
    const circles = svg.selectAll('circle').data(data)

    circles
      .enter()
      .append('circle')
      .attr('r', d => {
        console.log('hoi')
        return d.r
      })
      .style('fill', d => yearColors[d.publicationYear])
      .merge(circles)
      .attr('cx', d => d.x)
      .attr('cy', (d, i) => d.y)
      .on('mouseover', (d, i) => click(d, i))

    circles.exit().remove()
  }

  function click(d, i) {
    data[i].r = 50
    console.log(data[i])
    simulation.nodes(data).force(
      'collide',
      d3
        .forceCollide()
        .strength(1)
        .radius(function(d) {
          return 10
        })
        .iterations(1)
    )
  }
})

function uniqueKeys(obj, key, sort) {
  let unique = d3.map(obj, d => d[key]).keys()

  // ascending
  if (sort === 'asc') {
    unique.sort((a, b) => a - b)
  }
  // descending
  if (sort === 'desc') {
    unique.sort((a, b) => b - a)
  }

  return unique
}
