/*
 * Copyright (c) 2013, Juraj Polakovic
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/**
 * A Geoportail Map.
 *
 * TODO could be moved to client code actually.
 *
 * @param apiKey
 * @param $log
 * @returns {null}
 * @constructor
 */
function GeoportailMap(apiKey, elementId, $log) {
    $log.debug("Creating map for '" + elementId + "'");

    var map = new Geoportal.Viewer.Default(
        elementId,
        OpenLayers.Util.extend({
            mode:'normal',
            territory: 'FXX',
            //projection: 'IGNF:GEOPORTALFXX',
            //displayProjection:'IGNF:LAMB93',
            //displayProjection: ['IGNF:RGF93G', 'IGNF:LAMB93', 'IGNF:LAMBE'],
            nameInstance: elementId},
        // API keys configuration variable set by <Geoportal.GeoRMHandler.getConfig>
        window.gGEOPORTALRIGHTSMANAGEMENT === undefined ? {'apiKey': apiKey} : gGEOPORTALRIGHTSMANAGEMENT)
    );
    if (!map) {
        $log.error(OpenLayers.i18n('new.instance.failed'));
        return null;
    }

    map.addGeoportalLayers(['GEOGRAPHICALGRIDSYSTEMS.MAPS', 'ORTHOIMAGERY.ORTHOPHOTOS'], {
        'GEOGRAPHICALGRIDSYSTEMS.MAPS': {opacity: 1.0},
        'ORTHOIMAGERY.ORTHOPHOTOS': {visibility: false}
    });
//    map.addGeoportalLayer('GEOGRAPHICALGRIDSYSTEMS.MAPS', {visibility:true, opacity:1});
//    map.addGeoportalLayer('ORTHOIMAGERY.ORTHOPHOTOS', {opacity: 1, visibility: false});
    map.setInformationPanelVisibility(false);
    map.openLayersPanel(false);
    map.openToolsPanel(false);

//    map.getMap().addControl(new Geoportal.Control.LayerSwitcher());
//    map.getMap().addControl(new Geoportal.Control.GraphicScale(), new OpenLayers.Pixel(80, 430));
//    map.getMap().addControl(new Geoportal.Control.MousePosition({autoActivate:true,
//        position: new OpenLayers.Pixel(150,150)}));

    return map;
}

angular.module('geoportailMap', [])
    .provider('geoportailMap', function geoportailMapProvider() {
        var apiKey = null;
        this.setApiKey = function (value) {
            apiKey = value;
        };

        var checkApiLoadedHelper = function(clss) {
            var f;
            for (var i = 0, l = clss.length; i < l; i++) {
                try {
                    eval('var f=' + clss[i]);
                } catch (e) {
                    f = undefined;
                }
                if (typeof(f) === 'undefined') {
                    /**
                     * It may happen that the init function is executed before the API is loaded
                     * Addition of a timer code that waits 300 ms before running the init function
                     */
//                __Geoportal$timer = window.setTimeout(retryClbk, 300);
                    return false;
                }
            }
            return true;
        }

        var checkApiLoaded = function() {
            if (checkApiLoadedHelper(['OpenLayers', 'Geoportal', 'Geoportal.Viewer', 'Geoportal.Viewer.Default'])) {
                // actually not sure why this is needed, but it is ;-)
                Geoportal.GeoRMHandler.getConfig([apiKey], null, null, {
                    onContractsComplete: onLoadComplete
                });
            } else {
                wait = $timeout(function() {
                    checkApiLoaded();
                }, 500);
            }
        }

        /**
         * Callback called from Geoportal.GeoRMHandler.getConfig, which is the end of the loading sequence
         * and the map is loaded and instantiated successfully.
         */
        var deferredMaps = new Array();
        var onLoadComplete = function() {
            for(var i = 0; i < deferredMaps.length; i++) {
                deferredMaps[i].promise.resolve(deferredMaps[i].callback());
            }
            deferredMaps = new Array();
        }

        this.$get = ['$q', '$timeout', '$log', function geoportailMapFactory($q, $timeout, $log) {
            $log.debug("Using geportail key: " + apiKey);

            mapPromise = {
                createMap : function(elementId) {
                    $log.debug("Deferring map creation for '" + elementId + "'");
                    deferredMap = {
                        promise : $q.defer(),
                        callback : function() {
                            return new GeoportailMap(apiKey, elementId, $log);
                        }
                    }
                    deferredMaps.push(deferredMap);
                    checkApiLoaded();
                    return deferredMap.promise.promise;
                }
            }

            // avoid race if the API is loaded and onLoadComplete() is executed before the below promise is created
            checkApiLoaded();

            return mapPromise;
        }];
    })
    .directive('map', function($window, $log, geoportailMap) { // TODO, ignMap, geoportailMap conflicts with something (weird)
        var setParentSize = function(element, map) {
            var parent = element.parent();
            height = parent.prop('offsetHeight');
            width = parent.prop('offsetWidth');
            element.css('height', height);
            element.css('width', width);

            if (map != null) {
                map.setSize(width + 'px', height + 'px');
            }
        }

        return {
            restrict: 'E',
            scope: {
            },
//            controller : function($scope, $attrs, $log, geoportailMap) {
//            },
            link: function(scope, element, attrs) {
                geoportailMap.createMap(attrs.id).then(function (map) {
                        scope.map = map;
                        setParentSize(element, scope.map);
                        map.getMap().setCenterAtLonLat(5.74, 45.17, 9);
                    }
                );

                scope.$on('resizeEvent', function(event) {
                    setParentSize(element, scope.map);
                });
            }
        };
    });
