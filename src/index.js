'use strict'

const margin = {
  top: 48,
  right: 72,
  bottom: 120,
  left: 72
}

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
  const yearsSorted = d3
    .nest()
    .key(book => book.publicationYear)
    .entries(data)

  // Get the min and max year
  var maxYearsTotal = d3.max(yearsSorted, d => d.values.length)

  let xScale = d3.scaleLinear().range([0, width])

  const yScale = d3
    .scaleLinear()
    .range([height, 0])
    .domain([0, maxYearsTotal])

  const bandScaleX = d3.scaleBand().range([0, width])

  const bandScaleY = d3
    .scaleBand()
    .range([0, height])
    .domain([0, maxYearsTotal])

  const dotSize = 10
  document.getElementById('remove').addEventListener('click', remove)
  function remove() {
    update(
      yearsSorted.slice(
        0,
        Math.floor(Math.random() * Math.floor(yearsSorted.length))
      )
    )
  }
  // d3.interval(function(){
  //     update(yearsSorted.slice(0, Math.floor(Math.random() * Math.floor(yearsSorted.length))))
  // }, 2500)

  update(yearsSorted)

  // const uniqueYears = uniqueKeys(data, 'publicationYear', 'asc')

  function update(sortedData) {
    // get unique years
    // const uniqueYears = uniqueKeys(sortedData, 'publicationYear', 'asc')

    updateScale(sortedData)

    const groups = svg.selectAll('.group').data(sortedData)

    groups.exit().remove()

    groups
      .attr('transform', (d, i) => {
        console.log('LOG')
        return d.values.length > 1
          ? `translate(${xScale(d.key) - dotSize}, ${-10})`
          : `translate(${xScale(d.key)}, ${-10})`
      })
      .enter()
      .append('g')
      .attr('class', 'group')
      .attr('transform', (d, i) => {
        console.log('LOG')
        return d.values.length > 1
          ? `translate(${xScale(d.key) - dotSize}, ${-10})`
          : `translate(${xScale(d.key)}, ${-10})`
      })

    const circles = d3
      .selectAll('.group')
      .selectAll('circle')
      .data(d => d.values.map(item => item))
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('r', dotSize)
      .attr('cy', (d, i) => yScale(Math.floor(i / 2)))
      .attr('cx', (d, i) => (i % 2 ? dotSize * 2 : 0))
      .style('fill', d => yearColors[d.publicationYear])
  }

  function updateScale(updatedData) {
    const min = d3.min(updatedData.map(d => d.key))
    const max = d3.max(updatedData.map(d => d.key))

    bandScaleX.domain([0, updatedData.length])
    console.log(updatedData.length)

    xScale.domain([min, max])

    const axis = d3.selectAll('.x-axis').remove()

    svg
      .append('g')
      .attr('class', 'x-axis')
      .style('color', '#black')
      .attr('transform', 'translate(0,' + (height + 4) + ')')
      .call(
        d3
          .axisBottom(xScale)
          .ticks(updatedData.length)
          .tickFormat(d3.format('y'))
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
