'use strict'

const margin = { top: 48, right: 72, bottom: 120, left: 72 }

const width = window.innerWidth - margin.left - margin.right,
  height = 600

const yearColors = {
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

const svg = d3.select('svg')

const group = svg
  .attr('width', width)
  .attr('height', height)
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

d3.json('data.json').then(data => {
  console.log(data)

  // get unique years
  const uniqueYears = uniqueKeys(data, 'publicationYear', 'asc')

  // Get the min and max year
  const minMax = d3.extent(data.map(year => year.publicationYear))

  // Set scale X
  const xScale = d3
    .scaleLinear()
    .domain(minMax)
    .range([0, width])
  //.tickFormat(3)

  // Scaleband
  const bandScaleX = d3
    .scaleBand()
    .range([0, width])
    .domain(uniqueYears)

  const bandScaleY = d3
    .scaleBand()
    .range([0, height])
    .domain([0, 40])

  //.range(minMax)

  // Append axis bottom
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

  const amount = 3
  let yearsPassed = []
  svg
    .append('g')
    .selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', (d, i) => {
      return xScale(d.publicationYear)
    })
    .attr('y', (d, i) => bandScaleY.bandwidth(d.title))
    .attr('width', bandScaleX.bandwidth())
    .attr('height', 10)
    .style('fill', d => yearColors[d.publicationYear])
})

svg.append('rect')

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
