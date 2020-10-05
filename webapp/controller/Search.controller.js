sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./BaseController",
	"../model/formatter"
], function (Controller, BaseController, formatter) {
	"use strict";

	return BaseController.extend("dinosol.din-colecciones-anidadas.controller.Search", {

		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf dinosol.din-colecciones-anidadas.view.Search
		 */
		onInit: function () {

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				"Coleccion": "",
				"Nivel": "",
				"Anidado": false
			}), "search");
			if (!this.getView().searchDialog) {
				this.getView().searchDialog = sap.ui.xmlfragment("searchDialog",
					"dinosol.din-colecciones-anidadas.fragment.DialogSearch", this);
				this.getView().addDependent(this.getView().searchDialog);
			}
			jQuery.sap.delayedCall(200, this, function () {
				this.loadTiendas();
				this.getView().searchDialog.open();
			});
		},

		onPressCerrarDialog: function () {

			if (this.getView().searchDialog) {
				this.getView().searchDialog.close();
			}
		},

		onPressBuscar: function () {

			var that = this;
			var sColeccion = this.getView().getModel("search").getProperty("/Coleccion"),
				sNivel = this.getView().getModel("search").getProperty("/Nivel"),
				bAnidado = this.getView().getModel("search").getProperty("/Anidado");
			var oFinalData = {
				"id": "Prueba",
				"niveles": [{
					"NumNivel": 1,
					"modulo": {
						"Modulo": "1",
						"Denominacion": "Modulo prueba",
						"Clase": "4",
						"FechaInicio": "20200921",
						"FechaFin": "99991231",
						"articulos": [{
							"Articulo": "1040494",
							"Descripcion": "Articulo 1",
							"FechaInicio": "20200921",
							"FechaFin": "99991231"
						}]
					},
					"surtido": {
						"Surtido": "2",
						"Denominacion": "Surtido prueba",
						"FechaInicio": "20200921",
						"FechaFin": "99991231",
						"tiendas": [{
							"Tienda": "9001",
							"Denominacion": "Tienda 1",
							"FechaInicio": "20200921",
							"FechaFin": "99991231"
						}]
					}
				}, {
					"NumNivel": 2,
					"modulo": {
						"Modulo": "3",
						"Denominacion": "Modulo prueba 2",
						"Clase": "4",
						"FechaInicio": "20200921",
						"FechaFin": "99991231",
						"articulos": [{
							"Articulo": "1040495",
							"Descripcion": "Articulo 2",
							"FechaInicio": "20200921",
							"FechaFin": "99991231"
						}]
					},
					"surtido": {
						"Surtido": "3",
						"Denominacion": "Surtido prueba 2",
						"FechaInicio": "20200921",
						"FechaFin": "99991231",
						"tiendas": [{
							"Tienda": "9001",
							"Denominacion": "Tienda 2",
							"FechaInicio": "20200921",
							"FechaFin": "99991231"
						}]
					}
				}]
			};
			that.setComponentModelProperty("data", "/coleccion", oFinalData);
			that.setComponentModelProperty("data", "/anidado", bAnidado);
			// that.getComponentModel("data").updateBindings(true);
			// that.onPressCerrarDialog();
			// that.getOwnerComponent().getRouter().getTargets().display("Coleccion");
			// return;
			sap.ui.core.BusyIndicator.show(0);
			var sSoloOrigen = bAnidado ? "X" : "";
			this.getComponentModel().read("/ColeccionSet(Id='" + sColeccion + "',SoloOrigen='" + sSoloOrigen + "')", {
				urlParameters: {
					"$expand": ["toNiveles", "toModuloHeader", "toModuloItems", "toSurtidoHeader", "toSurtidoItems"]
				},
				success: function (oData) {

					sap.ui.core.BusyIndicator.hide();
					if (oData.toNiveles.results.length === 0) {
						return sap.m.MessageToast.show("No se ha recuperado ninguna colección");
					}
					var oFinalData = that.adjustDataOnRetrieval(sColeccion, oData);
					if (!oFinalData) {
						return sap.m.MessageToast.show("La colección tiene una estructura no identificada");
					}
					that.setComponentModelProperty("data", "/coleccion", oFinalData);
					that.setComponentModelProperty("data", "/originalColeccion", oData);
					that.getComponentModel("data").updateBindings(true);
					that.onPressCerrarDialog();
					that.getOwnerComponent().getRouter().getTargets().display("Coleccion");
					return;

					if (oData.results[0].toResult) {
						if (oData.results[0].toResult.results.length === 0) {
							sap.m.MessageToast.show("No se han recuperado errores");
						}
					}
				},
				error: function (oData) {
					sap.ui.core.BusyIndicator.hide();
					return sap.m.MessageToast.show("Ha fallado la recuperación de coleccion");
				}
			});
		},

		adjustDataOnRetrieval: function (sColeccion, oData) {

			var bError = false;
			var aNiveles = oData.toNiveles.results.map(function (oNivel) {
				var sNivel = oNivel.NumNivel;

				// Añadimos el módulo
				var aModulo = oData.toModuloHeader.results.filter(function (oModulo) {
					return sNivel === oModulo.Nivel;
				}, this);
				if(!bError){
					bError = aModulo.length > 1 || aModulo.length === 0;
				}
				if (aModulo.length === 1) {
					oNivel["modulo"] = aModulo[0];
					var sModulo = oNivel.modulo.Modulo;
					oNivel["modulo"]["articulos"] = oData.toModuloItems.results.filter(function(oArticulo){
						return oArticulo.Modulo === sModulo;
					}, this).map(function (oArticulo) {
						delete oArticulo.__metadata;
						return oArticulo;
					}, this);
				}
				// Añadimos el surtido
				var aSurtido = oData.toSurtidoHeader.results.filter(function (oSurtido) {
					return sNivel === oSurtido.Nivel;
				}, this);
				if(!bError){
					bError = aSurtido.length > 1 || aSurtido.length === 0;
				}
				if (aSurtido.length === 1) {
					oNivel["surtido"] = aSurtido[0];
					var sSurtido = oNivel.surtido.Surtido;
					oNivel["surtido"]["tiendas"] = oData.toSurtidoItems.results.filter(function(oTienda){
						return oTienda.Surtido === sSurtido;
					}, this).map(function (oTienda) {
						delete oTienda.__metadata;
						return oTienda;
					});
				}
				return oNivel;
			}, this);
			var oFinalData = {};
			oFinalData["id"] = sColeccion;
			oFinalData["niveles"] = aNiveles;
			return bError ? undefined : oFinalData;
		},

		onChangeNivelSearch: function (oEvent) {

			this.getView().getModel("search").setProperty("/Nivel", oEvent.getParameter("selectedItem").getKey());
		},

		onChangeAnidado: function (oEvent) {

			this.getView().getModel("search").setProperty("/Anidado", oEvent.getParameter("selected"));
		},

		/**
		 * 
		 * COLECCION
		 * 
		 */

		onRequestValueHelpColeccion: function (oEvent) {

			if (!this.getView().searchHelpColeccionDialog) {
				this.getView().searchHelpColeccionDialog = sap.ui.xmlfragment("searchHelpColeccionDialog",
					"dinosol.din-colecciones-anidadas.fragment.DialogValueHelpColeccion", this);
				this.getView().addDependent(this.getView().searchHelpColeccionDialog);
			}

			var oValueHelp = sap.ui.core.Fragment.byId("searchHelpColeccionDialog", "valueHelpDialogColeccion");
			var oColsModel = new sap.ui.model.json.JSONModel({
				"cols": [{
					"label": "{i18n>label.descripcion}",
					"template": "Descripcion",
					"width": "15rem"
				}, {
					"label": "{i18n>label.existe}",
					"template": "Existe",
					"width": "15rem"
				}]
			});

			var oTable = oValueHelp.getTable();
			// oValueHelp.getTableAsync().then(function (oTable) {
			oTable.setModel(this.oProductsModel);
			oTable.setModel(oColsModel, "columns");

			if (oTable.bindRows) {
				oTable.bindAggregation("rows", "/colecciones");
			}
			// oValueHelp.update();
			// }.bind(this));

			this.getView().searchHelpColeccionDialog.setModel(new sap.ui.model.json.JSONModel());
			document.addEventListener("keypress", this.onKeyPressColeccionSH.bind(this));
			this.toggleOpenSH();
			this.getView().searchHelpColeccionDialog.open();
		},

		onSearchValueHelpColeccion: function (oEvent) {

			var aSelectionSet = oEvent.getParameter("selectionSet") || this.getFilterBarControls("coleccion");
			var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
				var sValue;
				if (oControl.getValue) {
					var sOp = sap.ui.model.FilterOperator.Contains;
					if (oControl.getValue()) {
						sValue = oControl.getValue();
						if (sValue.indexOf("*") === 0) {
							sOp = sap.ui.model.FilterOperator.EndsWith;
						}
						if (sValue.indexOf("*") > 0) {
							sOp = sap.ui.model.FilterOperator.StartsWith;
						}
						// if (oControl.getName() === "Ean") {
						// 	sOp = sap.ui.model.FilterOperator.EQ;
						// }
						sValue = sValue.replace(/\*/g, "");
						if (isNaN(parseInt(sValue)) === false) { // !sValue.toUpperCase
							aResult.push(
								new sap.ui.model.Filter({
									path: oControl.getName(),
									operator: sOp,
									value1: sValue
								}));
						} else {
							aResult.push(new sap.ui.model.Filter({
								filters: [
									new sap.ui.model.Filter({
										path: oControl.getName(),
										operator: sOp,
										value1: sValue.toUpperCase()
									}),
									new sap.ui.model.Filter({
										path: oControl.getName(),
										operator: sOp,
										value1: sValue
									})
								],
								and: false
							}));
						}
					}
				}
				if (oControl.getSelected) {
					if (oControl.getSelected()) {
						aResult.push(new sap.ui.model.Filter({
							path: oControl.getName(),
							operator: sap.ui.model.FilterOperator.EQ,
							value1: "X"
						}));
					}
				}

				return aResult;
			}, []);

			var sLifnr = this.getView().searchHelpColeccionDialog.getModel().getProperty("/lifnr");
			if (!!sLifnr) {
				this.getView().searchHelpColeccionDialog.getTable().getBinding("rows").filter(undefined);
				this.getView().searchHelpColeccionDialog.getTable().getBinding("rows").filter(aFilters);
				return;
			}

			var that = this;
			this.getView().searchHelpColeccionDialog.getTable().setBusy(true);
			this.getComponentModel().read("/MCColeccionSet", {
				filters: aFilters,
				success: function (oData) {
					that.getView().searchHelpColeccionDialog.getTable().setBusy(false);
					that.getView().searchHelpColeccionDialog.getModel().setProperty("/colecciones", oData.results);
				},
				error: function (oData) {
					that.getView().searchHelpColeccionDialog.getTable().setBusy(false);
				}
			});

		},

		onOKValueHelpColeccion: function (oEvent) {

			var aTokens = oEvent.getParameter("tokens").length > 0 ? oEvent.getParameter("tokens") : this.getView().searchHelpColeccionDialog
				._oSelectedTokens
				.getTokens();
			var aKeys = aTokens.map(function (oToken) {
				// this.getView().byId("coleccionFilter").addToken(oToken);
				return {
					"Coleccion": oToken.getKey()
				};
			}, this);
			this.setComponentModelProperty("search", "/Coleccion", aKeys);
			this.getComponentModel("search").updateBindings(true);

			this.getView().searchHelpColeccionDialog.close();
			document.removeEventListener("keypress", this.onKeyPressArticuloSH);
			this.toggleOpenSH();
			this.getView().searchHelpColeccionDialog.getTable().setSelectedIndex(-1);
			this.getView().searchHelpColeccionDialog.getFilterBar().fireClear();
		},

		clearFiltersValueHelpColeccion: function (oEvent) {

			this.getView().searchHelpColeccionDialog.getFilterBar().getAllFilterItems().forEach(function (oItem, index) {
				var oContent = oItem.getControl();
				if (oContent.getValue) {
					oContent.setValue("");
				}
			});

		},

		onKeyPressColeccionSH: function (e) {
			if (e.which === 13) {
				this.getView().searchHelpColeccionDialog.getFilterBar().fireSearch();
			}
		},

		closeValueHelpDialogColeccion: function () {

			this.getView().searchHelpColeccionDialog.close();
			this.toggleOpenSH();
			document.removeEventListener("keypress", this.onKeyPressColeccionSH);
		},

		loadTiendas: function () {
			var that = this;
			this.getComponentModel().read("/MCTiendaSet", {
				success: function (oData) {
					that.getComponentModel("tiendas").setProperty("/", oData.results);
					var oTiendaObj = {};
					oData.results.forEach(function (oTienda) {
						oTiendaObj[oTienda.Tienda] = oTienda.Descripcion;
					}, that);
					that.getComponentModel("tiendasObj").setProperty("/", oTiendaObj);
				},
				error: function (oError) {
					var oErrorModel = new sap.ui.model.json.JSONModel();
					oErrorModel.setJSON(oError.responseText);
					sap.m.MessageToast.show(oErrorModel.getData().error.message.value, {
						"width": "30em"
					});
				}
			});
		},

	});

});