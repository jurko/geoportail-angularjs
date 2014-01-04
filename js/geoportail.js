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

angular.module('geoportailMap', [])
    .provider('geoportailMapLoader', function geoportailMapLoaderProvider() {
        var apiKey = null;
        this.setApiKey = function (value) {
            apiKey = value;
        };

        var loaded = false;
        var deferred = null;
        this.loadApi = function ($q, $timeout) {
            deferred = $q.defer();
            if (loaded) {
                deferred.resolve();
            } else {
                loadGeoportailApi($timeout);
            }
            return deferred.promise;
        }

        var checkClassesLoaded = function(clss) {
            var f;
            for (var i = 0, l = clss.length; i < l; i++) {
                try {
                    eval('var f=' + clss[i]);
                } catch (e) {
                    f = undefined;
                }
                if (typeof(f) === 'undefined') {
                    return false;
                }
            }
            return true;
        }

        var loadGeoportailApi = function($timeout) {
            if (checkClassesLoaded(['OpenLayers', 'Geoportal', 'Geoportal.Viewer', 'Geoportal.Viewer.Default'])) {
                // get the contracts first
                Geoportal.GeoRMHandler.getConfig([apiKey], null, null, {
                    onContractsComplete: onLoadComplete
                });
            } else {
                wait = $timeout(function() {
                    loadGeoportailApi($timeout);
                }, 500);
            }
        }

        /**
         * Callback called from Geoportal.GeoRMHandler.getConfig, which is the end of the loading sequence and the API is loaded
         */
        var onLoadComplete = function() {
            loaded = true;
            deferred.resolve();
        }

        this.$get = function() {
            return {
                getKey : function() {
                    return apiKey;
                }
            }
        }
    })
    .service('geoportailMap', ['geoportailMapLoader', '$log', function(geoportailMapLoader, $log) {
        this.createMap = function(elementId, properties) {
            $log.debug("Creating map for '" + elementId + "'");
            var apiKey = geoportailMapLoader.getKey();

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
                $log.error("Failed to create new map");
                return null;
            }

            map.addGeoportalLayers(['GEOGRAPHICALGRIDSYSTEMS.MAPS', 'ORTHOIMAGERY.ORTHOPHOTOS'], {
                'GEOGRAPHICALGRIDSYSTEMS.MAPS': {opacity: 1.0},
                'ORTHOIMAGERY.ORTHOPHOTOS': {visibility: false}
            });
            //map.addGeoportalLayer('GEOGRAPHICALGRIDSYSTEMS.MAPS', {visibility:true, opacity:1});
            map.setInformationPanelVisibility(false);
            map.openLayersPanel(false);
            map.openToolsPanel(false);
            //map.getMap().addControl(new Geoportal.Control.LayerSwitcher());
            //map.getMap().addControl(new Geoportal.Control.GraphicScale(), new OpenLayers.Pixel(80, 430));
            //map.getMap().addControl(new Geoportal.Control.MousePosition({autoActivate:true, position: new OpenLayers.Pixel(150,150)}));

            return map;
        }
    }])
    .directive('geoportailMap', ['geoportailMap', '$log', function(geoportailMap, $log) {
        return {
            restrict: 'A',
            scope: {
                mapProperties: '='
            },
            controller: function($scope) {
                this.getMap = function() {
                    return $scope.map;
                }
            },
            link: function(scope, element, attrs) {
                if (scope.mapProperties === undefined) {
                    $log.error("Forgot to specify the mapping attribute 'mapProperties'");
                    return;
                }
                scope.map = geoportailMap.createMap(attrs.id);
                scope.map.getMap().setCenterAtLonLat(scope.mapProperties.lon, scope.mapProperties.lat, scope.mapProperties.zoom);
            }
        };
    }])
    .directive('fixMapSize', ['$window', '$timeout', function($window, $timeout) {
        // it looks like geoportail resizes automatically the map to the parent's size if css height is '100%'
        // however, it doesn't consider padding/margin of the parent which is inconvenient in some cases (see full map)

        var fixMapSize = function(element, map, adjustHeight, adjustWidth) {
            // TODO, get real size of the parent element (padding excluded)
            var parent = element.parent();
            height = parent.prop('offsetHeight') - adjustHeight;
            width = parent.prop('offsetWidth') - adjustWidth;
            if (map != null) {
                map.setSize(width + 'px', height + 'px');
            }
        }

        return {
            restrict: 'A',
            require: 'geoportailMap',
            scope: false,
            link: function(scope, element, attrs, mapCtrl) {
                if (element.css('height') == '100%') {
                    var map = mapCtrl.getMap();
                    var adjustHeight = attrs.adjustHeight === undefined ? 0 : attrs.adjustHeight;
                    var adjustWidth = attrs.adjustWidth === undefined ? 0 : attrs.adjustWidth;
                    $timeout(function() {
                        fixMapSize(element, map, adjustHeight, adjustWidth);
                    }, 0);

                    var w = angular.element($window);
                    w.bind('resize', function() {
                        fixMapSize(element, map, adjustHeight, adjustWidth);
                    });
                    w.bind('DOMContentLoaded', function() {
                        fixMapSize(element, map, adjustHeight, adjustWidth);
                    })
                }
            }
        }
    }])
;
