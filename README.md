# Flexmonster Pivot plugin for Kibana

### :warning: NOTICE - Suspended from development
**Due to breaking changes in last versions of Kibana, there are numerous issues with maintaining the working version. Therefore, the plugin is currently suspended from further development.**

Still, the currently available groundwork is free to use for your own custom integrations.

---

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
yarn upgrade
yarn install react-flexmonster@2.7.24
yarn install flexmonster@2.7.24
```

## Step 2: Enable CORS for Elasticsearch 

Open `elasticsearch.yml` and add the following configuration:

```bash
http.cors.enabled : true
http.cors.allow-origin : "*"
http.cors.allow-credentials: true
http.cors.allow-methods : OPTIONS,HEAD,GET,POST,PUT,DELETE
http.cors.allow-headers : kbn-version,Origin,X-Requested-With,Content-Type,Accept,Engaged-Auth-Token,Content-Length,Authorization
```

## Step 3: Enable CORS for Kibana

Open `kibana.yml` and add the following configuration:

```bash
elasticsearch.hosts: ["http://localhost:9200"]
server.cors: true
server.cors.origin: ['*']
```

## Step 4: See the results

A new tab with Flexmonster Pivot will be available if you open Kibana:

![Pivot in Kibana](https://www.flexmonster.com/fm_uploads/2019/07/CreateReportKibanaFM.gif)

# Resources
- [Demos](https://www.flexmonster.com/demos/)
- [Documentation](https://www.flexmonster.com/doc/)
- [Set of tools](https://www.flexmonster.com/set-of-tools/)
- [Blog](https://www.flexmonster.com/blog/)

Also you can get all support from our development team on [Forum](https://www.flexmonster.com/forum/). Flexmonster developers react fast to the questions and provide professional assistance.
