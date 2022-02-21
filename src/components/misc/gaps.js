import React from "react"

class Gaps extends React.Component {
    render() {
      return (
        <>
          <div
            className={`${
              this.props.gaps.mobile ? `gaps-${this.props.gaps.mobile}` : ""
            } ${
              this.props.gaps.tablet ? `gaps-md-${this.props.gaps.tablet}` : ""
            } ${
              this.props.gaps.desktop ? `gaps-lg-${this.props.gaps.desktop}` : ""
            }`}
            style={this.props.style}
          />
        </>
      )
    }
  }
  
  export default Gaps
  