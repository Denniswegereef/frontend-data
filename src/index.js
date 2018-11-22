'use strict'

const margin = {
  top: 48,
  right: 72,
  bottom: 120,
  left: 72
}

const dotSize = 7
const dotSpacing = 5
const dotBreak = 25
const dotBreakDistance = 20
const dotStrokeRadius = 4

// x-axis button change
document.querySelector('#year').addEventListener('click', changeAxis)
document.querySelector('#type').addEventListener('click', changeAxis)
document.querySelector('#language').addEventListener('click', changeAxis)

const width =
    window.innerWidth < 1000
      ? window.innerWidth - margin.left - margin.right
      : 1000,
  height = 600

// Color scheme
const color = d3
  .scaleLinear()
  .domain([2000, 2005, 2010, 2015, 2020])
  .range(['#8C489F', '#B39BC8', '#F172A1', '#A1C3D1', '#E64398'])

const svg = d3.select('svg')

const group = svg
  .attr('width', width > 1000 ? 1000 : width)
  .attr('height', height)
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// Start variables
const filteredOptions = []
let activeItem
let activeLanguageFilter
let currentGraph = 'publicationYear'

// Tooltip div
const div = d3
  .select('body')
  .append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0)
  .style('color', '#fff')

d3.json('data.json').then(data => {
  data = data.slice(0, 155)
  data.forEach((item, index) => {
    data[index].pages = +item.pages
  })

  const scalePoint = d3
    .scaleLinear()
    .domain([0, dotBreak])
    .range([0, height])

  const uniqueYears = uniqueKeys(data, 'publicationYear', 'asc')

  let xScale
  let yScale = d3.scaleLinear().range([height, 0])

  // Call update for first render, append all the filters
  update(data, currentGraph)
  filterSystem(data)

  // Change X axis and call update
  function changeAxis(attr) {
    if (document.querySelector('.activeAxis')) {
      document.querySelector('.activeAxis').classList.remove('activeAxis')
    }
    this.classList.add('activeAxis')
    update(data, this.innerHTML)
    currentGraph = this.innerHTML
  }

  // Start filter
  function filterSystem(allData) {
    d3.select('#options')
      .append('div')
      .attr('class', 'filterElement')

    // Create filter
    createUniqueFilter('type', 'checkbox')
    createUniqueFilter('language', 'radio')
  }

  // Render all filters
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
      .attr('class', 'lang')
      .data(unique)
      .enter()
      .append('label')
      .attr('for', d => d)
      .text(d => d)
      .append('input')
      .attr('name', attr)
      .attr('type', eleType)
      .attr('id', d => d)
      .on('click', function(d) {
        if (activeLanguageFilter === d) {
          this.checked = false
        }
        if (this.type === 'radio') {
          activeLanguageFilter = d
        }

        filteredOptionsChange(attr, d)
      })
  }

  // Make array of filters
  function filteredOptionsChange(type, attr) {
    let unique = 'language' // Needed because one possible answer

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

  // Filter everything away
  function updateFiltered(type) {
    const filteredData = data.filter(item => {
      if (checkIfOptionsMatch(item)) {
        return item
      }
    })

    // If there are no results show all the data
    // (need work, need a message that shows 'nothing matches' such as that)
    filteredData.length > 0
      ? update(filteredData, currentGraph)
      : update(data, currentGraph)
  }

  // Filter loop through everything in array
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

  // Update function to render data
  function update(newData, attr) {
    const sortedYearsByAttr = d3
      .nest()
      .key(book => book[attr])
      .entries(newData)

    d3.select('.singleBook').remove()
    div.style('opacity', 0)

    // Update scale
    updateScale(sortedYearsByAttr, attr)

    const groups = svg
      .selectAll('.group')
      .data(sortedYearsByAttr)
      .attr(
        'transform',
        d => `translate(${xScale(d.key) - dotSize}, ${-dotSize})`
      )

    groups.exit().remove()

    groups
      .enter()
      .append('g')
      .attr('class', 'group')
      .attr(
        'transform',
        d => `translate(${xScale(d.key) - dotSize}, ${-dotSize})`
      )

    const circles = d3
      .selectAll('.group')
      .selectAll('circle')
      .data(d => d.values.map(item => item))
      .style('stroke', d => color(d.publicationYear))

    circles.exit().remove()

    circles
      .attr('r', 0)
      .transition()
      .duration(500)
      .attr('r', dotSize)

    circles
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .on('mouseover', function(d) {
        // Dot
        d3.select(this)
          .style('fill', color(d.publicationYear))
          .transition()
          .attr('r', dotSize * 1.5)

        // Mouse over
        div
          .html(d.title)
          .style('left', d3.event.pageX + dotSize + 4 + 'px')
          .style('top', d3.event.pageY - 25 + 'px')
          .transition()
          .style('opacity', 0.9)
          .style('background', color(d.publicationYear))
          .style('box-shadow', `0 0 50px 2px ${color(d.publicationYear)}`)
      })
      .on('mouseout', function(d) {
        if (d.title === activeItem) {
          d3.select(this)
            .style('fill', color(d.publicationYear))
            .transition()
            .attr('r', dotSize * 1.5)
        } else {
          d3.select(this)
            .style('fill', 'none')
            .transition()
            .attr('r', dotSize)
        }

        // Mouse over
        div.style('opacity', 0).style('box-shadow', `0 0 50px 2px none`)
      })
      .on('click', function(d) {
        d3.selectAll('circle')
          .style('fill', 'none')
          .transition()
          .attr('r', dotSize)

        d3.select(this)
          .style('fill', color(d.publicationYear))
          .transition()
          .attr('r', dotSize * 1.5)

        activeItem = d.title
        showSingle(d)
      })
      .attr('cy', (d, i) => {
        return height - scalePoint(i % dotBreak)
      })
      .attr('cx', (d, i) => {
        return Math.floor(i / dotBreak) * dotBreakDistance
      })
      .style('stroke', (d, i) => color(d.publicationYear))
      .attr('stroke-width', dotStrokeRadius)
      .style('fill', 'none')
      .attr('r', 0)
      .transition()
      .duration(500)
      .attr('r', dotSize)
  }

  // Append single book to bottom
  function showSingle(item) {
    d3.select('.singleBook').remove()
    d3.select('#options')
      .append('div')
      .attr('class', 'singleBook')

    const singleBook = d3.select('.singleBook')
    singleBook
      .append('div')
      .attr('class', 'bookCover')
      .append('img')
      .attr('src', item.coverImage)
    singleBook
      .append('div')
      .attr('class', 'bookText')
      .append('h4')
      .text(item.title)

    d3.select('.bookText')
      .append('p')
      .html(
        `Language: <span>${item.language}</span> | author: <span>${
          item.mainAuthor
        }</span> | publication year: <span>${
          item.publicationYear
        }</span> | type: <span>${item.type}</span>`
      )

    d3.select('.bookText')
      .append('p')
      .text(item.summary)

    d3.select('.bookText')
      .append('a')
      .attr('target', '_blank')
      .attr('href', item.detailPage)
      .text('Link to OBA')
  }

  // Update all scales correctly
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
      return width * (updatedData.length / 5)
    }

    xScale.range([0, calculateRange()])
    yScale.domain([0, maxYearsTotal])

    const axis = d3.selectAll('.x-axis').remove()
    const bottomAxis = svg
      .append('g')
      .attr('class', 'x-axis')
      .style('color', '#black')
      .attr('transform', 'translate(-10,' + height + ')')
      .transition()
      .attr('transform', 'translate(-10,' + (height + 10) + ')')

    bottomAxis.select('text').style('color', 'red')

    checkIfNumber(updatedData[0].key)
      ? bottomAxis.call(
          d3
            .axisBottom(xScale)
            .ticks(max - (min - 1))
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
