'use strict'

const margin = { top: 48, right: 72, bottom: 120, left: 72 }

const width = window.innerWidth - margin.left - margin.right,
  height = 600

const radius = 6

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
    .force('magnetic', d3.forceManyBody().strength(7))
    .force('x', d3.forceX().x(d => xScale(d.publicationYear)))
    .force(
      'y',
      d3.forceY().y((d, i) => {
        return height - 50
      })
    )
    .force('collision', d3.forceCollide().radius(d => radius * 1.1))
    .on('tick', ticked)

  function ticked() {
    const circles = svg.selectAll('circle').data(data)
    const t = d3
      .transition()
      .duration(500)
      .ease(d3.easeLinear)

    circles
      .enter()
      .append('circle')
      .attr('r', d => {
        console.log('called')
        return d.r
      })
      .style('fill', 'red')
      .style('opacity', 0)
      .attr('cx', (d, i) => {
        return 10 * i
      })
      .attr('cy', (d, i) => {
        return height
      })
      .on('mouseover', (d, i) => hover(d, i))
      .merge(
        circles
          .transition(t)
          .style('fill', d => yearColors[d.publicationYear])
          .style('opacity', 1.0)
          .attr('cx', d => d.x)
          .attr('cy', (d, i) => d.y)
      )

    circles.exit().remove()
  }

  function hover(d, i) {
    console.log(svg.selectAll('circle'))

    const circles = svg.selectAll('circle')

    circles.style('opacity', 0.2)
  }

  // function click(d, i) {
  //   simulation.force('collision', d3.forceCollide().radius(d => 11 * 1.1))
  //
  //   const t = d3
  //     .transition()
  //     .duration(1000)
  //     .ease(d3.easeLinear)
  //
  //   const circles = svg.selectAll('circle').data(data)
  //
  //   circles
  //     .attr('r', radius)
  //     .merge(
  //       circles.transition(t).attr('r', d => {
  //         console.log('called')
  //         return 11
  //       })
  //     )
  //     .exit()
  //     .remove()
  // }
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
