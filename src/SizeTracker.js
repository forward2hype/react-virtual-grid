import React, { Component } from "react";

const STYLE = {
  ROOT: {
    position: 'relative',
  },
  IFRAME: {
    position: 'absolute',
    top: '0',
    bottom: '0',
    height: '100%',
    right: '100%',
    visibility: 'hidden',
  }
}

const useIframe = !window.ResizeObserver;

let counter = 0;

export default class SizeTracker extends Component {

  iframe = useIframe && React.createRef();
  iframeVDom = useIframe ? <iframe title={`size-iframe-${counter++}`} style={STYLE.IFRAME} ref={this.iframe} /> : undefined;
  root = React.createRef();

  render() {
    let props = { ...this.props};
    delete props.children;
    delete props.onResize;

    return <div 
        {...props}
        ref={this.root} 
        style={{ ...STYLE.ROOT,...this.props.style}}
      >
      {this.iframeVDom}
      {this.props.children}
    </div>
  }

  triggerResize(xSize, ySize) {
    if (this.props.onResize)
      this.props.onResize({ xSize, ySize });
  }

  handleResize = () => {
    let root = this.root.current;
    this.triggerResize(root.clientWidth, root.clientHeight);
  }

  componentDidMount() {
    if (useIframe) {
      let iframe = this.iframe.current;
      this.window = iframe.contentWindow;
      if (this.window) 
        this.onWindow(this.window);
      else {
        const onLoad = () => {
          iframe.removeEventListener("load", onLoad);
          this.window = this.iframe.contentWindow;
          this.onWindow(this.window);
        };
        iframe.addEventListener("load", onLoad);
      }
    }
    else {
      this.observer = new ResizeObserver(this.handleResize);
      this.observer.observe(this.root.current);
    }
  }

  onWindow(wnd) {
    wnd.addEventListener("resize", this.handleResize);
    setTimeout(this.handleResize, 0);//libreact's SizeSensor uses 35 msecs here ... not sure if that has any meaning
  }

  componentWillUnmount() {
    if (this.window) 
      this.window.removeEventListener("resize", this.handleResize);
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}