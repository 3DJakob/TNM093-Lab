/**
  Computer exercise for TNM093
  Course responsible: Alexander Bock
  Created by: Kahin Akram
  August 2020
 */
function pc (data) {
  var margin = { top: 20, right: 10, bottom: 20, left: 10 }
  var width = $('div.pc-container').width()
  var height = $('div.pc-container').height()

  var x = d3.scalePoint()
    .domain(dimensions.map(function (d) { return d.name }))
    .range([0, width])
    .padding(1)

  var line = d3.line()
    .defined(function (d) { return !isNaN(d[1]) })

  var yAxis = d3.axisLeft()
  var y = {}
  var x = d3.scalePoint().range([0, width]).padding(2)
  var extents; var origDimensions; var dragging = {}

  var pc_svg = d3.selectAll('div.pc-container svg')
    .attr('viewBox', '0 0 ' + (
      width + margin.left + margin.right) +
		' ' + (height + margin.top + margin.bottom))
    .attr('height', height)
    .attr('width', '100%')
    .attr('preserveAspectRatio', 'none')
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  x.domain(dimensions = d3.keys(data[0]).filter(function (d) {
    return d != 'Region' && (y[d] = d3.scaleLinear()
      .domain(d3.extent(data, function (p) { return +p[d] }))
      .range([height, 0]))
  }))

  origDimensions = dimensions.slice(0)
  extents = dimensions.map(function (p) { return [0, 0] })

  /** Computer Exercise starts here  */

  // Task 5.0.8 -- Drawing the Lines
  var foreground = pc_svg.append('g').selectAll('path').data(data).enter().append('path').attr('d', drawPath)
  pc_svg.selectAll('path').style('fill', 'transparent').style('stroke', 'darkturquoise').style('opacity', '0.3')

  // var myCircles = sp_svg.append('g').selectAll('circle').data(data).enter().append('circle').enter().attr('cx', function (d) { return xScale(d.Skattesats) })

  // Task 5.0.9 -- Drawing Axes
  // var axes = d3.scaleLinear()
  //   .domain([d3.min(xVarValues), d3.max(xVarValues)])
  //   .range([0, width])
  // var axes = pc_svg.selectAll('.dimension').data(dimensions).enter().append('g')
  var axes = pc_svg.append('g').selectAll('.dimension').data(dimensions).enter().append('path')

  // 5.0.10 -- Appending Axes Titles

  axes.each(label => d3.select(this).text(label))
  // dimensions.forEach(dimension => {
  //   console.log(dimension)
  //   // .dimension(dimension).axis(yAxis)
  //   pc_svg.selectAll('.dimension').data([dimension]).enter().append('g').text(dimension)
  //   // pc_svg.selectAll('.dimension').data([dimension]).enter().append('circle').attr('cy', yAxis(dimension.Skattesats)).attr('r', 6).style('fill', 'darkturquoise').style('opacity', '0.3')
  // })

  // 5.0.11 -- Interaction, brushing the axes

  // 5.0.12 -- Interaction, dragging the Axes

  /** Computer Exercise ends here  */

  /** NECESSARY FUNCTION. DO NOT TOUCH */

  function perAxisBrush (d) {
    return y[d].brush = d3.brushY()
      .extent([[-10, 0], [10, height]])
      .on('brush', brush)
      .on('end', brush)
  }

  function startDrag (d) {
    dragging[d] = x(d)
  }

  function drag (d) {
    dragging[d] = Math.min(width, Math.max(0, d3.event.x))
    foreground.attr('d', drawPath)
    dimensions.sort(function (a, b) { return position(a) - position(b) })
    x.domain(dimensions)
    axes.attr('transform', function (d) { return 'translate(' + position(d) + ')' })
  }

  function endDrag (d) {
    delete dragging[d]
    transition(d3.select(this)).attr('transform', 'translate(' + x(d) + ')')
    transition(foreground).attr('d', drawPath)

    var new_extents = []
    for (var i = 0; i < dimensions.length; ++i) {
      new_extents.push(extents[origDimensions.indexOf(dimensions[i])])
    }
    extents = new_extents
    origDimensions = dimensions.slice(0)
  }

  // Handles a brush event, toggling the display of foreground lines.
  function brush () {
    var actives = []
    pc_svg.selectAll('.brush')
      .filter(function (d) {
        y[d].brushSelectionValue = d3.brushSelection(this)
        return d3.brushSelection(this)
      })
      .each(function (d) {
        // Get extents of brush along each active selection axis (the Y axes)
        actives.push({
          dimension: d,
          extent: d3.brushSelection(this).map(y[d].invert)
        })
      })
    // Update foreground to only display selected values
    foreground.style('display', function (d) {
      return actives.every(function (active) {
        return active.extent[1] <= d[active.dimension] && d[active.dimension] <= active.extent[0]
      }) ? null : 'none'
    })
  }

  // Returns the path for a given data point.
  function drawPath (d) {
    return line(dimensions.map(function (p) {
      return [x(p), y[p](d[p])]
    }))
  }

  this.selectLine = function (value) {
    d3.select('.foreground').selectAll('path')
      .style('stroke', function (d) {
        return d.Region == value ? 'deeppink' : 'darkturquoise'
      })
      .style('stroke-width', function (d) {
        return d.Region == value ? '3.0' : '0.3'
      })
      .style('opacity', function (d) {
        return d.Region == value ? '1.0' : '0.3'
      })
  }

  this.resetSelectLine = function () {
    var l = d3.select('.foreground')
    l.selectAll('path')
      .style('stroke', 'darkturquoise')
      .style('stroke-width', '0.4px')
      .style('opacity', '1.0')
  }

  function position (d) {
    var v = dragging[d]
    return v == null ? x(d) : v
  }

  function transition (g) {
    return g.transition().duration(500)
  }
  /** END */
}
