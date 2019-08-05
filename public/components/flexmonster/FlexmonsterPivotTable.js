import React from 'react';
import {
  EuiPage,
  EuiPageHeader,
  EuiTitle,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPanel,
  EuiComboBox,
  EuiSpacer,
  EuiImage,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText
} from '@elastic/eui';
import * as FlexmonsterReact from 'react-flexmonster';
import 'flexmonster/flexmonster.min.css';

class PivotTable extends React.Component {
  constructor(props) {
    super(props);
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.report !== this.props.report
      || prevProps.report.dataSource !== this.props.report.dataSource
      || prevProps.report.dataSource.index !== this.props.report.dataSource.index) {
      if (this.refs.pivot && this.refs.pivot.flexmonster) {
        this.refs.pivot.flexmonster.setReport(this.props.report);
      } else {
        this.setState({ report: this.props.report });
      }
    }
  }
  render() {
    return (
      <div>
        <EuiSpacer size="m" />
        <EuiPanel>
          <FlexmonsterReact.Pivot ref="pivot" toolbar={true}
            componentFolder="https://cdn.flexmonster.com/" width="100%"
            report={this.props.report} />
        </EuiPanel>
      </div>
    );
  }
}

export class FlexmonsterPivotTable extends React.Component {
  constructor(props) {
    super(props);

    this.esClient = props.esClient;

    this.state = { selectedOptions: [], options: [], isLoading: true, showPivotTable: false };
    this.loadIndices();
  }

  loadIndices = () => {
    this.esClient.cat.indices({
      bytes: "k",
      v: true,
      format: "json"
    }, (r, q) => {
      var indices = angular.fromJson(q).map(item => { return { label: item.index } }).filter(item => item.label.indexOf(".kibana") < 0 && item.label.indexOf(".security") < 0);
      this.setState({
        options: indices,
        isLoading: false
      });
    });
  }
  onChange = (selectedOptions) => {
    var report = {
      "dataSource": {
        "dataSourceType": "elasticsearch",
        "connection": this.esClient,
        "index": selectedOptions[0].label
      }
    };
    this.setState({
      showPivotTable: true,
      selectedOptions: selectedOptions,
      report: report
    });
  };

  render() {
    return (
      <EuiPage>
        <EuiPageBody>
          <EuiPageHeader>
            <EuiTitle size="m">
              <EuiFlexGroup>
                <EuiFlexItem grow={false}>
                  <EuiImage alt="Flexmonster Pivot Table"
                    url="https://cdn.flexmonster.com/logo_only.png" />
                </EuiFlexItem>
                <EuiFlexItem>
                  <h1>
                    Pivot Table for Kibana
                  </h1>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiTitle>
          </EuiPageHeader>
          <EuiPageContent>
            <EuiPageContentBody>
              <EuiText>
                <h3>
                  Please select an index to show
                </h3>
                <EuiComboBox
                  placeholder="Select an index"
                  singleSelection={{ asPlainText: true }}
                  options={this.state.options}
                  selectedOptions={this.state.selectedOptions}
                  isLoading={this.state.isLoading}
                  onChange={this.onChange}
                  isClearable={false}
                />
              </EuiText>
              {this.state.showPivotTable ? <PivotTable report={this.state.report} refresh={true} /> : null}
            </EuiPageContentBody>
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>
    );
  }
}
