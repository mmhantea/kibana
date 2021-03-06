/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { Schemas } from 'ui/vis/editors/default/schemas';
import { CATEGORY } from 'ui/vis/vis_category';
import gaugeTemplate from './editors/gauge.html';
import { vislibColorMaps } from 'ui/vislib/components/color/colormaps';

export default function GaugeVisType(Private) {
  const VisFactory = Private(VisFactoryProvider);

  return VisFactory.createVislibVisualization({
    name: 'gauge',
    title: 'Gauge',
    icon: 'visGauge',
    description: `Gauges indicate the status of a metric. Use it to show how a metric's value relates
      to reference threshold values.`,
    category: CATEGORY.DATA,
    visConfig: {
      defaults: {
        type: 'gauge',
        addTooltip: true,
        addLegend: true,
        isDisplayWarning: false,
        gauge: {
          verticalSplit: false,
          extendRange: true,
          percentageMode: false,
          gaugeType: 'Arc',
          gaugeStyle: 'Full',
          backStyle: 'Full',
          orientation: 'vertical',
          colorSchema: 'Green to Red',
          gaugeColorMode: 'Labels',
          colorsRange: [
            { from: 0, to: 50 },
            { from: 50, to: 75 },
            { from: 75, to: 100 }
          ],
          invertColors: false,
          labels: {
            show: true,
            color: 'black'
          },
          scale: {
            show: true,
            labels: false,
            color: '#333',
          },
          type: 'meter',
          style: {
            bgWidth: 0.9,
            width: 0.9,
            mask: false,
            bgMask: false,
            maskBars: 50,
            bgFill: '#eee',
            bgColor: true,
            subText: '',
            fontSize: 60,
          }
        }
      },
    },
    editorConfig: {
      collections: {
        gaugeTypes: ['Arc', 'Circle'],
        gaugeColorMode: ['None', 'Labels', 'Background'],
        scales: ['linear', 'log', 'square root'],
        colorSchemas: Object.keys(vislibColorMaps),
      },
      optionsTemplate: gaugeTemplate,
      schemas: new Schemas([
        {
          group: 'metrics',
          name: 'metric',
          title: 'Metric',
          min: 1,
          aggFilter: [
            '!std_dev', '!geo_centroid', '!percentiles', '!percentile_ranks',
            '!derivative', '!serial_diff', '!moving_avg', '!cumulative_sum', '!geo_bounds'],
          defaults: [
            { schema: 'metric', type: 'count' }
          ]
        },
        {
          group: 'buckets',
          name: 'group',
          title: 'Split Group',
          min: 0,
          max: 1,
          aggFilter: ['!geohash_grid', '!filter']
        }
      ])
    },
    useCustomNoDataScreen: true
  });
}
