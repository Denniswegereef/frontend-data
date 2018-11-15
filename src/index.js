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
  console.log()
  // get unique years
  const uniqueYears = uniqueKeys(data, 'publicationYear', 'asc')

  const yearsSorted = d3
    .nest()
    .key(book => book.publicationYear)
    .entries(data)

    console.log(yearsSorted);

  // Get the min and max year
  var maxYearsTotal = d3.max(yearsSorted, d => d.values.length)

  const svg = d3.select('svg')

  const yScale = d3
    .scaleLinear()
    .range([height, 0])
    .domain([0, maxYearsTotal])

  const xScale = d3
    .scaleLinear()
    .domain([2000, 2018])
    .range([0, width])

  const bandScaleX = d3
    .scaleBand()
    .range([0, width])
    .domain([0, yearsSorted.length])

    const bandScaleY = d3
      .scaleBand()
      .range([0, height])
      .domain([0, maxYearsTotal])

  // Axis X
  svg
    .append('g')
    .attr('class', 'x-axis')
    .style('color', '#black')
    .attr('transform', 'translate(0,' + height + ')')
    .call(
      d3
        .axisBottom(xScale)
        .ticks(15)
        .tickFormat(d3.format('y'))
    )

  // Create groups for each year
  const groups = svg
    .selectAll('.groups')
    .data(yearsSorted)
    .enter()
    .append('g')
    .attr('transform', d => `translate(${xScale(d.key)}, ${-10})`)
    .selectAll('circle')
    .data(d => d.values.map(item => item))
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('r', 10)
    .attr('cy', (d, i) => yScale(i))
    .style('fill', d => yearColors[d.publicationYear])
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
