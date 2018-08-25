/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { ALayer } from './layer';
import { FillAndOutlineStyle } from './styles/fill_and_outline_style';
import { getOlLayerStyle, OL_GEOJSON_FORMAT } from '../ol_layer_defaults';
import * as ol from 'openlayers';

export class VectorLayer extends ALayer {

  static type = 'VECTOR';

  static createDescriptor(options) {
    const vectorLayerDescriptor = super.createDescriptor(options);
    vectorLayerDescriptor.type = VectorLayer.type;
    vectorLayerDescriptor.style = {
      ...vectorLayerDescriptor.style,
      ...this._applyDefaultStyle()
    };
    return vectorLayerDescriptor;
  }

  static _applyDefaultStyle = (() => {
    //todo: should follow fixed ordering, similar to POC
    const defaultColors = ['#e6194b', '#3cb44b', '#ffe119', '#f58231', '#911eb4'];
    let defaultColorIndex = 0;
    return () => {
      defaultColorIndex = defaultColorIndex >= defaultColors.length
        ? 0 : defaultColorIndex;
      return FillAndOutlineStyle.createDescriptor(defaultColors[defaultColorIndex++]);
    };
  })();

  getSupportedStyles() {
    //todo: this should be data-dependent (e.g. point data will not have FillAndOutlineStyle)
    return [FillAndOutlineStyle];
  }

  getCurrentStyle() {
    if (this._descriptor.style.type === FillAndOutlineStyle.type) {
      return new FillAndOutlineStyle(this._descriptor.style);
    } else {
      throw new Error('Style type not recognized by VectorLayer');
    }
  }

  _createCorrespondingOLLayer() {
    const vectorLayer = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: []
      }),
      renderMode: 'image'
    });
    vectorLayer.setVisible(this.isVisible());
    const style = this.getCurrentStyle();
    vectorLayer.setStyle(getOlLayerStyle(style, this.isTemporary()));
    return vectorLayer;
  }

  _syncOLStyle(olLayer) {
    const style = this.getCurrentStyle();
    const appliedStyle = getOlLayerStyle(style, this.isTemporary());
    olLayer.setStyle(appliedStyle);
  }

  _syncOLData(olLayer) {

    if (!this._descriptor.data) {
      return;
    }
    //ugly, but it's what we have now
    //think about stateful-shim that mirrors OL (or Mb) that can keep these links
    //but for now, the OpenLayers object model remains our source of truth
    if (this._descriptor.data === olLayer.__kbn_data__) {
      return;
    } else {
      olLayer.__kbn_data__ = this._descriptor.data;
    }

    const olSource = olLayer.getSource();
    olSource.clear();
    const olFeatures = OL_GEOJSON_FORMAT.readFeatures(this._descriptor.data);
    olSource.addFeatures(olFeatures);
  }

  isLayerLoading() {
    return !!this._descriptor.dataDirty;
  }


  async updateData() {
    try {
      return this._source.getGeoJson();
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

}