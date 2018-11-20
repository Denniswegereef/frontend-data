'use strict'

const margin = {
  top: 48,
  right: 72,
  bottom: 120,
  left: 72
}

const dotSize = 8
const dotSpacing = 5

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

const filteredOptions = []
let currentGraph = 'publicationYear'

const div = d3
  .select('body')
  .append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0)

d3.json('data.json').then(data => {
  data.forEach((item, index) => {
    data[index].pages = +item.pages
  })

  console.log(data)

  const uniqueYears = uniqueKeys(data, 'publicationYear', 'asc')

  let xScale
  let yScale = d3.scaleLinear().range([height, 0])

  update(data, currentGraph)
  filterSystem(data)

  document.querySelector('#year').addEventListener('click', changeAxis)
  document.querySelector('#type').addEventListener('click', changeAxis)
  document.querySelector('#language').addEventListener('click', changeAxis)

  function changeAxis(attr) {
    update(data, this.innerHTML)
    currentGraph = this.innerHTML
  }

  function filterSystem(allData) {
    d3.select('#visualisation')
      .append('div')
      .attr('class', 'filterElement')

    createUniqueFilter('type', 'checkbox')
    createUniqueFilter('language', 'radio')
  }

  function createUniqueFilter(attr, eleType) {
    const filterElement = d3.select('.filterElement')
    const unique = uniqueKeys(data, attr, 'asc')

    const singleItem = filterElement
      .append('div')
      .attr('class', attr)
      .append('h4')
      .text(attr)

    d3.select(`.${attr}`)
      .selectAll('input')
      .data(unique)
      .enter()
      .append('label')
      .attr('for', d => d)
      .text(d => d)
      .append('input')
      .attr('name', attr)
      .attr('type', eleType)
      .attr('id', d => d)
      .attr('checked', function(d) {
        if (eleType === 'radio') {
          this.checked ? true : false
        }
      })
      .on('click', d => filteredOptionsChange(attr, d))
  }

  function filteredOptionsChange(type, attr) {
    let unique = 'language'

    let newType = `${type}:${attr.toLowerCase()}`
    let newTypeIndex = filteredOptions.indexOf(newType)

    if (type === unique) {
      filteredOptions.forEach((item, index) => {
        filteredOptions.splice(index, 1)
      })
    }

    newTypeIndex > -1
      ? filteredOptions.splice(newTypeIndex, 1)
      : filteredOptions.push(newType)

    updateFiltered(type)
  }

  function updateFiltered(type) {
    const filteredData = data.filter(item => {
      if (checkIfOptionsMatch(item)) {
        return item
      }
    })
    // Als er nikls
    console.log(type)
    filteredData.length > 0
      ? update(filteredData, currentGraph)
      : update(data, currentGraph)
  }

  function checkIfOptionsMatch(item) {
    let matchingOptions = 0

    filteredOptions.forEach(option => {
      let splittedOption = option.split(':')

      if (item[splittedOption[0]] === splittedOption[1]) {
        matchingOptions++
      }
    })
    if (matchingOptions === filteredOptions.length) {
      return true
    }
  }

  function update(newData, attr) {
    const sortedYearsByAttr = d3
      .nest()
      .key(book => book[attr])
      .entries(newData)

    updateScale(sortedYearsByAttr, attr)

    const groups = svg
      .selectAll('.group')
      .data(sortedYearsByAttr)
      .attr('transform', d => getXposition(d))

    groups.exit().remove()

    groups
      .enter()
      .append('g')
      .attr('class', 'group')
      .attr('transform', d => getXposition(d))

    const circles = d3
      .selectAll('.group')
      .selectAll('circle')
      .data(d => d.values.map(item => item))
      .style('stroke', d => yearColors[d.publicationYear])
    circles
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('r', dotSize)
      .attr('cy', (d, i) => {
        return yScale(Math.floor(i / 2))
      })
      .attr('cx', (d, i) => (i % 2 ? dotSize * 2 + dotSpacing : 0))
      .style('fill', '#fff')
      .style('stroke', d => yearColors[d.publicationYear])
      .attr('stroke-width', 4)
      .on('mouseover', function(d) {
        d3.select(this).style('fill', yearColors[d.publicationYear])

        div.style('opacity', 0.9)
        div
          .html(d.title)
          .style('left', d3.event.pageX + 'px')
          .style('top', d3.event.pageY - 28 + 'px')
      })
      .on('mouseout', function(d) {
        div.style('opacity', 0)

        d3.select(this).style('fill', '#fff')
        d3.select(this).attr('r', dotSize)
      })

    circles.exit().remove()
  }

  function getXposition(d) {
    if (checkIfNumber(d.key)) {
      return d.values.length > 1
        ? `translate(${xScale(d.key) - dotSize}, ${-dotSize})`
        : `translate(${xScale(d.key)}, ${-dotSize})`
    } else {
      return `translate(${xScale(d.key)}, ${-dotSize})`
    }
  }

  function updateScale(updatedData, attr) {
    const maxYearsTotal = d3.max(updatedData, d => d.values.length)

    let min = d3.min(updatedData.map(d => d.key))
    let max = d3.max(updatedData.map(d => d.key))

    if (checkIfNumber(updatedData[0].key)) {
      console.log('Scale is in numbers')

      xScale = d3.scaleLinear()
      xScale.domain([min, max])
      xScale.range([0, width])
    } else {
      console.log('Scale is in strings')

      xScale = d3.scalePoint()
      xScale.domain(updatedData.map(d => d.key))
    }

    function calculateRange() {
      if (updatedData.length > 10) {
        return width
      }
      return width * (updatedData.length / 10)
    }

    xScale.range([0, calculateRange()])
    yScale.domain([0, maxYearsTotal])

    const axis = d3.selectAll('.x-axis').remove()
    const bottomAxis = svg
      .append('g')
      .attr('class', 'x-axis')
      .style('color', '#black')
      .attr('transform', 'translate(0,' + (height + 4) + ')')
    checkIfNumber(updatedData[0].key)
      ? bottomAxis.call(
          d3
            .axisBottom(xScale)
            .ticks(max - (min - 1) > 20 ? 20 : max - (min - 1))
            .tickFormat(d3.format('y'))
        )
      : bottomAxis.call(d3.axisBottom(xScale).ticks(updatedData.length))
  }
})

function checkIfNumber(dataItem) {
  return Number.isInteger(Number(dataItem))
}

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
