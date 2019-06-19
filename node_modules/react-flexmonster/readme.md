# React module for Flexmonster Pivot Table & Charts 
[![Flexmonster Pivot Table & Charts](https://s3.amazonaws.com/flexmonster/github/fm-github-cover.png)](https://flexmonster.com)


This repository holds the source code for using [Flexmonster Pivot](https://www.flexmonster.com/) in [React](https://reactjs.org/) applications. 

* [Getting started](#getting-started)
* [Usage](#usage)
* [License](#license)
* [Support & feedback](#support-feedback)

## <a name="getting-started"></a>Getting Started ##

If you don’t have React app, you can create it by running in the console:

```bash
npx create-react-app my-app
cd my-app
```

Add Flexmonster React module by running in the console:

```bash
npm i react-flexmonster --save
```

Include `FlexmonsterReact` into `App.js`:

```bash
import * as FlexmonsterReact from 'react-flexmonster';
```

Insert a pivot table into `App.js`:

```bash
class App extends Component {
  render() {
    return (
      <div className="App">
        <FlexmonsterReact.Pivot toolbar={true} 
        componentFolder="https://cdn.flexmonster.com/" width="100%" 
        report="https://cdn.flexmonster.com/reports/report.json"/>
      </div>
    );
  }
}
```

Run your application from the console:

```bash
npm start
```

To see the result open your browser on `http://localhost:3000/`.

## <a name="usage"></a>Usage ##

Available attributes for `FlexmonsterReact.Pivot`:

* `componentFolder` – URL of the component’s folder which contains all necessary files. Also, it is used as a base URL for report files, localization files, styles and images. The default value for `componentFolder` is `flexmonster/`.
* `width` – width of the component on the page (pixels or percent). The default value for width is 100%.
* `height` – height of the component on the page (pixels or percent). The default value for height is `500`.
* `report` – property to set a report. It can be inline [Report Object](https://www.flexmonster.com/api/report-object/) or URL to report JSON.
* `toolbar` – parameter to embed the toolbar or not. Default value is `false` – without the toolbar.
* `customizeCell` – function that allows customizing of separate cells. Have a look at [customizeCell definition and examples](https://www.flexmonster.com/api/customizecell/).
* `customizeContextMenu` – function that allows customizing context menu. Have a look at [customizeContextMenu definition and examples](https://www.flexmonster.com/api/customizecontextmenu/).
* `licenseKey` – the license key.

Here is an example how such attributes can be specified:

```bash
<FlexmonsterReact.Pivot toolbar={true} 
  componentFolder="https://cdn.flexmonster.com/" 
  width="100%" 
  report="https://cdn.flexmonster.com/reports/report.json"
/>
```

## <a name="license"></a>License ##

Here is [Flexmonster licensing page](https://www.flexmonster.com/pivot-table-editions-and-pricing/). We have free 30 day trial! 

Flexmonster React module is released as a MIT-licensed (free and open-source) add-on to Flexmonster Pivot.

## <a name="support-feedback"></a>Support & feedback ##

Please share your feedback or ask questions via [Flexmonster Forum](https://www.flexmonster.com/forum/).
