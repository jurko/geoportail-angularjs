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
    .directive('geoportailMap', ['$window', 'geoportailMap', '$timeout', '$log', function($window, geoportailMap, $timeout, $log) {
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
                mapProperties: '='
            },
            link: function(scope, element, attrs) {
                if (scope.mapProperties === undefined) {
                    $log.error("Forgot to specify the mapping attribute 'mapProperties'");
                    return;
                }
                scope.map = geoportailMap.createMap(attrs.id);
                scope.map.getMap().setCenterAtLonLat(scope.mapProperties.lon, scope.mapProperties.lat, scope.mapProperties.zoom);

                $timeout(function() {
                    setParentSize(element, scope.map)
                }, 0);

                scope.$on('resizeEvent', function(event) {
                    setParentSize(element, scope.map);
                });

            }
        };
    }]);
