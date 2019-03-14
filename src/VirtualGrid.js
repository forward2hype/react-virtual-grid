import React, { Component } from "react";

import SizeTracker from "./SizeTracker";

const STYLE = {
  GRID_ROOT: {
    overflow: 'auto',
  },
  DEBUG: {
    color: 'white', 
    background: 'rgba(0, 0, 0, .55)', 
    borderRadius: '5px', 
    padding: '10px', 
    position: 'fixed', 
    top: '20px',
    left: '20px',
    zIndex: 10000
  }
}

function findBounds(arr, min, max, minIndex = 0, maxIndex = arr.length - 1) {
  
  function lower(threshold, minIndex, maxIndex) {
    if (arr[minIndex] >= threshold) return minIndex;
    var center = (minIndex + maxIndex) >> 1;
    if (center === minIndex)
      if (arr[maxIndex] <= threshold) return maxIndex;
      else return minIndex;
    else
      if (arr[center] >= threshold)
        return lower(threshold, minIndex, center);
      else
        return lower(threshold, center, maxIndex);
  }

  function upper(threshold, minIndex, maxIndex) {
    if (arr[maxIndex] <= threshold) return maxIndex;
    var center = (minIndex + maxIndex) >> 1;
    if (center === minIndex)
      if (arr[minIndex] >= threshold) return minIndex;
      else return maxIndex;
    else
      if (arr[center] >= threshold)
        return upper(threshold, minIndex, center);
      else
        return upper(threshold, center, maxIndex);
  }

  // should't be to hard to actually determine min and max in a single pass, but I'm too tired to fiddle with off-by-one errors
  return {
    min: lower(min, minIndex, maxIndex),
    max: upper(max, minIndex, maxIndex),
  }
}

function generateOffsets(max, gen) {
  let offsets = [],
      sum = 0;
  for (let i = 0; i < max; i++) offsets.push((sum += gen(i)));
  return { offsets };
}

function dim(v) {
  switch (typeof v) {
    case "number":
      return _ => v;
    case "function":
      return v;
    default:
      return _ => 250;
  }
}

export default class VirtualGrid extends Component {
  
  state = { virtualXMin: 0, virtualYMin: 0 };

  render() {
    return (
      <SizeTracker 
          style={STYLE.GRID_ROOT}
          className={this.props.className}
          onScroll={this.handleScroll}
          onResize={this.handleResize}
        >
        {this.state.xSize && this.state.ySize && this.renderGrid()}
      </SizeTracker>
    );
  }

  renderGrid() {

    const { xOffsets, yOffsets, virtualXMin, virtualYMin, xSize, ySize } = this.state;
    
    const xCount = xOffsets.length,
          yCount = yOffsets.length,
          bufferWidth = this.props.bufferWidth || 200,
          virtualXMax = virtualXMin + xSize,
          virtualYMax = virtualYMin + ySize;

    const Cell = this.props.children;

    const renderCell = (x, y) => {
      const key = x + ':' + y;
      let xPos = xOffsets[x - 1] | 0,
          yPos = yOffsets[y - 1] | 0;

      return <div
          key={key}
          style={{
            position: 'absolute',
            left: `${xPos}px`,
            top: `${yPos}px`,
            width: (xCount === 1) ? '100%' : `${xOffsets[x] - xPos}px`,
            height: (yCount === 1) ? '100%' : `${yOffsets[y] - yPos}px`,
          }}
        >
        <Cell x={x} y={y} />
      </div>;
    }

    const { min: xMin, max: xMax } = findBounds(xOffsets, virtualXMin - bufferWidth, virtualXMax + bufferWidth),
          { min: yMin, max: yMax } = findBounds(yOffsets, virtualYMin - bufferWidth, virtualYMax + bufferWidth);
    
    const children = [];
    for (let x = xMin; x <= xMax; x++)
      for (let y = yMin; y <= yMax; y++) 
        children.push(renderCell(x, y));
      
    return <>
      {
        this.props.debug && 
        <div style={STYLE.DEBUG}>
          <p>Columns: {xMin} - {xMax}</p>
          <p>Rows: {yMin} - {yMax}</p>
          <p>Showing {(xMax - xMin + 1) * (yMax - yMin) + 1} of {(this.props.rows || 1) * (this.props.columns)}</p>
        </div>
      }
      <div
        style={{
          width: xOffsets[xOffsets.length - 1] + "px",
          height: yOffsets[yOffsets.length - 1] + "px"
        }}
      >
        {children}
      </div>
    </>;
  }

  handleResize = this.setState.bind(this);

  handleScroll = e => {//TODO: debounce
    this.setState({ virtualXMin: e.target.scrollLeft, virtualYMin: e.target.scrollTop });
    this.forceUpdate();        
  }

  static getDerivedStateFromProps(props, state) {
    if (state.props === props) return null;

    let { offsets: xOffsets } = generateOffsets(props.columns || 1, dim(props.cellWidth)),
        { offsets: yOffsets } = generateOffsets(props.rows || 1, dim(props.cellHeight));

    return {
      ...state,
      props,
      xOffsets,
      yOffsets,
      virtualWidth: xOffsets[xOffsets.length - 1],
      virtualHeight: yOffsets[yOffsets.length - 1]
    };
  }

}