# Flexmonster Pivot plugin for Kibana

### :warning: NOTICE - The plugin development is ceased
**Due to breaking changes in last versions of Kibana, there are numerous issues with maintaining the working version. Therefore, the further development of the plugin is currently ceased.**

Still, the currently available groundwork is free to use for your own custom integrations.

---

## Flexmonster Pivot Table & Charts

Flexmonster Pivot is a powerful JavaScript tool for interactive web reporting. It allows you to visualize and analyze data from JSON, CSV, SQL, NoSQL, Elasticsearch, and OLAP data sources quickly and conveniently. Flexmonster is designed to integrate seamlessly with any client-side framework and can be easily embedded into your application.

This repository holds Flexmonster Pivot plugin for [Kibana](https://www.elastic.co/products/kibana).

## Requirements

The version of Kibana should be compatible with Elasticsearch. For more details, check [support matrix](https://www.elastic.co/support/matrix#matrix_compatibility). 

For the latest versions, please make changes in the package.json and/or other files if necessary.

The following is the most recent working configuration:
- Kibana v.7.3.2
- Plugin v.1.21
- react-flexmonster@2.7.24

## Step 1: Install Flexmonster Pivot plugin

Navigate to Kibana `bin/` folder and run in the console:

```bash
kibana-plugin install https://github.com/flexmonster/pivot-kibana/releases/download/v1.21/flexmonster_pivot-v1.21.zip
cd plugins/flexmonster_pivot
yarn add flexmonster@2.7.24 --flat
yarn add react-flexmonster@2.7.24-1 --flat
```

## Step 2: Add the license key in [`FlexmonsterPivotTable.js`](https://github.com/flexmonster/pivot-kibana/blob/master/public/components/flexmonster/FlexmonsterPivotTable.js#L42):
```bash
  <FlexmonsterReact.Pivot ref="pivot" toolbar={true}
        componentFolder="https://cdn.flexmonster.com/" 
        width="100%"
        licenseKey="XXXX-XXXX-XXXX-XXXX-XXXX"
        report={this.props.report} />
```

Note that licenseKey is your license or trial key, so replace XXXX-XXXX-XXXX-XXXX-XXXX with an actual key. If you don’t have a license key, [get a trial key here](https://www.flexmonster.com/download-page/).


## Step 3: Enable CORS for Elasticsearch 

Open `elasticsearch.yml` and add the following configuration:

```bash
http.cors.enabled : true
http.cors.allow-origin : "*"
http.cors.allow-credentials: true
http.cors.allow-methods : OPTIONS,HEAD,GET,POST,PUT,DELETE
http.cors.allow-headers : kbn-version,Origin,X-Requested-With,Content-Type,Accept,Engaged-Auth-Token,Content-Length,Authorization
```

## Step 4: Enable CORS for Kibana

Open `kibana.yml` and add the following configuration:

```bash
elasticsearch.hosts: ["http://localhost:9200"]
server.cors: true
server.cors.origin: ['*']
```

## Step 5: See the results

A new tab with Flexmonster Pivot will be available if you open Kibana:

![Pivot in Kibana](https://www.flexmonster.com/fm_uploads/2019/07/CreateReportKibanaFM.gif)

# Resources
- [Demos](https://www.flexmonster.com/demos/)
- [Documentation](https://www.flexmonster.com/doc/)
- [Set of tools](https://www.flexmonster.com/set-of-tools/)
- [Blog](https://www.flexmonster.com/blog/)

You can also submit your technical questions via [Flexmonster Help Center](https://www.flexmonster.com/help-center/). Our Tech team reacts fast to the questions and provides professional assistance.
