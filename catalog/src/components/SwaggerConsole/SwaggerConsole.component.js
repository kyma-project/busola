import React, { Component } from "react";
import { SwaggerUIBundle } from "swagger-ui-dist";

class SwaggerConsole extends Component {
  createSwagger(schema) {
    console.log("1");
    const customPreset = this.props.plugins;
    const presets = [SwaggerUIBundle.presets.apis, customPreset];

    const ui = SwaggerUIBundle({
      dom_id: "#swagger",
      spec: schema,
      presets,
      requestInterceptor: req => {
        const bearer = localStorage.getItem("bearer");
        req.headers = {
          ...req.headers,
          Authorization: bearer,
        };
        return req;
      },
    });

    return ui;
  }

  componentWillReceiveProps(newProps) {
    let schema = this.props.schema;
    if (this.props.url) schema = { ...schema, host: this.props.url };

    this.createSwagger(schema);
  }

  render() {
    return <div id="swagger" />;
  }
}

export default SwaggerConsole;
