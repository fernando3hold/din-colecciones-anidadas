sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./BaseController",
	"../model/formatter"
], function (Controller, BaseController, formatter) {
	"use strict";

	return BaseController.extend("dinosol.din-colecciones-anidadas.controller.Coleccion", {

		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf dinosol.din-colecciones-anidadas.view.Coleccion
		 */
		onInit: function () {

			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.getTarget("Coleccion").attachDisplay(function (oEvt) {
				this._onDisplay();
			}, this);
		},

		_onDisplay: function () {

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				"editMode": false,
				"displayMode": true,
				"anidado": this.getComponentModelProperty("data", "/anidado"),
				"erroresModulo": [],
				"erroresSurtido": []
				// "errores": [{
				// 	"Message": "Articulo 1040494 está mal",
				// 	"Type": "E"
				// }, {
				// 	"Message": "Modulo maligno",
				// 	"Type": "E",
				// 	"Modulo": "12345"
				// }]
			}), "viewModel");
		},

		toggleMode: function () {

			this.getView().getModel("viewModel").setProperty("/displayMode", !this.getView().getModel("viewModel").getProperty("/displayMode"));
			this.getView().getModel("viewModel").setProperty("/editMode", !this.getView().getModel("viewModel").getProperty("/editMode"));
		},

		onPressMover: function () {

			if (this.getModuloTable().getSelectedContexts().length === 0 && this.getSurtidoTable().getSelectedContexts().length === 0) {
				return sap.m.MessageToast.show("Seleccione algun artículo o tienda");
			}
			this.openMoverNiveles();
		},

		getModuloTable: function () {

			var sCurrentSection = this.getView().byId("opl").getSelectedSection();
			var oModuloSubSection = sap.ui.getCore().byId(sCurrentSection).getSubSections()[0];
			return oModuloSubSection.getBlocks()[0].getItems()[0].getItems()[1];
		},

		getSurtidoTable: function () {

			var sCurrentSection = this.getView().byId("opl").getSelectedSection();
			var oSurtidoSubSection = sap.ui.getCore().byId(sCurrentSection).getSubSections()[0];

			return oSurtidoSubSection.getBlocks()[0].getItems()[1].getItems()[1];
		},

		getCurrentNivel: function () {

			var sCurrentSection = this.getView().byId("opl").getSelectedSection();
			return sap.ui.getCore().byId(sCurrentSection).getBindingContext("data").getProperty("NumNivel");
		},

		getArticulosInLevel: function (iLevel) {

			var iAuxLevel = iLevel ? iLevel - 1 : this.getCurrentNivel() - 1;
			return this.getComponentModelProperty("data", "/coleccion/niveles/" + iAuxLevel + "/modulo/articulos");
		},

		setArticulosInLevel: function (iLevel, aArticulos) {

			var iAuxLevel = iLevel ? iLevel - 1 : this.getCurrentNivel() - 1;
			return this.setComponentModelProperty("data", "/coleccion/niveles/" + iAuxLevel + "/modulo/articulos", aArticulos);
		},

		getTiendasInLevel: function (iLevel) {

			var iAuxLevel = iLevel ? iLevel - 1 : this.getCurrentNivel() - 1;
			return this.getComponentModelProperty("data", "/coleccion/niveles/" + iAuxLevel + "/surtido/tiendas");
		},

		setTiendasInLevel: function (iLevel, aTiendas) {

			var iAuxLevel = iLevel ? iLevel - 1 : this.getCurrentNivel() - 1;
			return this.setComponentModelProperty("data", "/coleccion/niveles/" + iAuxLevel + "/surtido/tiendas", aTiendas);
		},

		openMoverNiveles: function () {

			var that = this;
			if (!this.getView().moverNivelesDialog) {
				this.getView().moverNivelesDialog = new sap.m.SelectDialog({
					title: "Niveles",
					items: {
						path: "data>/coleccion/niveles",
						filters: [
							new sap.ui.model.Filter({
								path: "NumNivel",
								operator: "NE",
								value1: this.getCurrentNivel()
							})
						],
						template: new sap.m.StandardListItem({
							title: "Nivel {data>NumNivel}"
						})
					},
					confirm: [that.confirmMoverDialog, that],
					cancel: [that.cancelMoverDialog, that]
				});
				this.getView().addDependent(this.getView().moverNivelesDialog);
			}
			this.getView().moverNivelesDialog.open();
		},

		confirmMoverDialog: function (oEvent) {

			this.moverArticulos(oEvent);
			this.getComponentModel("data").updateBindings(true);
			this.getView().moverNivelesDialog.close();
		},

		onPressEnviar: function () {

			// Llamada de creacion de carga masiva
			// "Accion": sAccion,
			// "toAsignacionItems": [],
			// "toModuloItems": [],
			// "toSurtidoItems": [],
			// "toReturnAsignacion": [],
			// "toReturnModulo": [],
			// "toReturnSurtido": []
			// this.getComponentModelProperty("data", "/originalColeccion") ||
			var oColeccion = {
				// "Id" : this.getComponentModelProperty("data", "/coleccion/id"),
				"Accion": "C",
				// "toReturn": [],
				"toReturnModulo": [],
				"toReturnSurtido": []
			};
			// oColeccion.toNiveles = this.getComponentModelProperty("data", "/coleccion/niveles").map(function (oNivel) {
			// 	var oNiv= {};
			// 	jQuery.extend(true, oNiv, oNivel);
			// 	delete oNiv.modulo;
			// 	delete oNiv.surtido;
			// 	return oNiv;
			// }).flat();

			// oColeccion.toModuloHeader = this.getComponentModelProperty("data", "/coleccion/niveles").map(function (oNivel) {
			// 	var oMod= {};
			// 	jQuery.extend(true, oMod, oNivel.modulo);
			// 	delete oMod.articulos;
			// 	return oMod;
			// }).flat();

			oColeccion.toModuloItems = this.getComponentModelProperty("data", "/coleccion/niveles").map(function (oNivel) {
				return oNivel.modulo.articulos.map(function (oArticulo) {
					var oArt = {};
					jQuery.extend(true, oArt, oArticulo);
					delete oArt.Nivel;
					delete oArt.IndBorrado;
					delete oArt.Descripcion;
					delete oArt.TipoModificacion;
					delete oArt.Error;
					delete oArt.TipoError;
					oArt.Borrar = false;
					return oArt;
				});
			}).flat();

			// oColeccion.toSurtidoHeader = this.getComponentModelProperty("data", "/coleccion/niveles").map(function (oNivel) {
			// 	var oSur= {};
			// 	jQuery.extend(true, oSur, oNivel.surtido);
			// 	delete oSur.tiendas;
			// 	return oSur;
			// }).flat();

			oColeccion.toSurtidoItems = this.getComponentModelProperty("data", "/coleccion/niveles").map(function (oNivel) {
				return oNivel.surtido.tiendas.map(function (oTienda) {
					var oTi = {};
					jQuery.extend(true, oTi, oTienda);
					delete oTi.Nivel;
					return oTi;
				});
			}).flat();

			console.log(oColeccion);
			var that = this;
			sap.ui.core.BusyIndicator.show(0);
			this.getComponentModel().create("/EMColeccionSet", oColeccion, { // ColeccionSet
				success: function (oData) {
					that.getView().getModel("viewModel").setProperty('/erroresModulo', oData.toReturnModulo ? oData.toReturnModulo.results : []);
					that.getView().getModel("viewModel").setProperty('/erroresSurtido', oData.toReturnSurtido ? oData.toReturnSurtido.results : []);
					that.setErrorOnItem(oData.toReturnModulo.results, oData.toReturnSurtido.results);
					sap.ui.core.BusyIndicator.hide();
				},
				error: function (oData) {
					sap.ui.core.BusyIndicator.hide();
					return sap.m.MessageToast.show("Ha fallado el envío");
				}
			});
		},

		setErrorOnItem: function (aErroresModulo, aErroresSurtido) {

			var aEModulo = aErroresModulo,
				aESurtido = aErroresSurtido;
			var aNiveles = this.getComponentModelProperty("data", "/coleccion/niveles");
			aNiveles.forEach(function (oNivel) {

				oNivel.modulo.articulos.forEach(function (oArticulo) {

					var sMatnr = oArticulo.Articulo,
						sModulo = oArticulo.Modulo;
					var aErrores = aEModulo.filter(function (oError) {
						return oError.Modulo.indexOf(sModulo) >= 0 && oError.Message.indexOf(sMatnr) >= 0;
					}, this);
					if (aErrores.length > 0) {
						oArticulo.Error = aErrores[0].Message;
						oArticulo.TipoError = aErrores[0].Type === "E" ? "Error" : "Warning";
					}
				}, this);

			}, this);
			this.setComponentModelProperty("data", "/coleccion/niveles", aNiveles);
			this.getComponentModel("data").updateBindings(true);
		},

		getDateToSearch: function (dDate) {

			var fnTwoDigits = function (iNumber) {
				return iNumber < 10 ? "0" + iNumber : "" + iNumber;
			};
			return dDate.getFullYear() + fnTwoDigits(dDate.getMonth() + 1) + fnTwoDigits(dDate.getDate());

		},

		/**
		 * 
		 * 
		 * ACCIONES
		 * 
		 * 
		 */
		onPressAddTienda: function (oEvent) {
			if (!this.getView().addTiendaDialog) {
				this.getView().addTiendaDialog = sap.ui.xmlfragment("addTiendaDialog",
					"dinosol.din-colecciones-anidadas.fragment.DialogNuevaTienda", this);
				this.getView().addDependent(this.getView().addTiendaDialog);
			}

			var oNew = {
				"Tienda": "",
				"Descripcion": "",
				"FechaInicio": this.getDateToSearch(new Date()),
				"FechaFin": this.getDateToSearch(new Date(9999, 11, 31)) //this.oModel.getProperty("/seleccionado/fechaFin")
			};

			this.getView().addTiendaDialog.setModel(new sap.ui.model.json.JSONModel(oNew), "newTienda");
			this.getView().addTiendaDialog.removeAllCustomData();
			this.getView().addTiendaDialog.addCustomData(new sap.ui.core.CustomData({
				key: "binding",
				value: undefined
			}));
			this.getView().addTiendaDialog.open();
		},

		onChangeTienda: function (oEvent) {

			var oTienda = this.getView().getModel("tiendas").getProperty("/").find(function (element) {
				return element.Tienda === oEvent.getParameter("selectedItem").getProperty(
					"key");
			});

			this.getView().addTiendaDialog.getModel("newTienda").setProperty("/Descripcion", oTienda.Descripcion);
		},

		onPressAñadirTienda: function (oEvent) {

			var oNewTienda = this.getView().addTiendaDialog.getModel("newTienda").getProperty("/");

			if (this.getCurrentNivel() !== null && this.getCurrentNivel() !== undefined) {
				aItemsNivel = this.getTiendasInLevel();
				var oNewTiendaToSet = {
					"Tienda": oNewTienda.Articulo,
					"Descripcion": oNewTienda.Descripcion,
					"FechaInicio": oNewTienda.FechaInicio,
					"FechaFin": oNewTienda.FechaFin
				};
				aItemsNivel.push(oNewTiendaToSet);
				this.setTiendasInLevel( /* iLevel */ undefined, aItemsNivel);
				this.getComponentModel("data").updateBindings(true);
			}
			this.getView().addTiendaDialog.close();
		},

		onPressCancelarAñadirTienda: function () {
			if (this.getView().addTiendaDialog) {
				this.getView().addTiendaDialog.close();
			}
		},

		onPressAddArticulo: function (oEvent) {
			if (!this.getView().addArticuloDialog) {
				this.getView().addArticuloDialog = sap.ui.xmlfragment("addArticuloDialog",
					"dinosol.din-colecciones-anidadas.fragment.DialogNuevoArticulo", this);
				this.getView().addDependent(this.getView().addArticuloDialog);
			}

			var oNew = {
				"Articulo": "",
				"Descripcion": "",
				"NoAnidar": false,
				"FechaInicio": this.getDateToSearch(new Date()),
				"FechaFin": this.getDateToSearch(new Date(9999, 11, 31)) //this.oModel.getProperty("/seleccionado/fechaFin")
			};

			this.getView().addArticuloDialog.setModel(new sap.ui.model.json.JSONModel(oNew), "newArticulo");
			this.getView().addArticuloDialog.removeAllCustomData();
			this.getView().addArticuloDialog.addCustomData(new sap.ui.core.CustomData({
				key: "binding",
				value: undefined
			}));
			this.getView().addArticuloDialog.open();
		},

		onPressAñadirArticulo: function (oEvent) {
			var aItemsNivel = [];
			var oNewArticulo = this.getView().addArticuloDialog.getModel("newArticulo").getProperty("/");

			if (this.getCurrentNivel() !== null && this.getCurrentNivel() !== undefined) {
				aItemsNivel = this.getArticulosInLevel();
				var oNewArticuloToSet = {
					"Articulo": oNewArticulo.Articulo,
					"Descripcion": oNewArticulo.Descripcion,
					"NoAnidar": oNewArticulo.NoAnidar,
					"FechaInicio": oNewArticulo.FechaInicio,
					"FechaFin": oNewArticulo.FechaFin
				};
				aItemsNivel.push(oNewArticuloToSet);
				this.setArticulosInLevel( /* iLevel */ undefined, aItemsNivel);
				this.getComponentModel("data").updateBindings(true);
			}

			this.getDescripcionArticulos(this.getCurrentNivel());
			this.getView().addArticuloDialog.close();
		},

		onPressCancelarAñadir: function () {
			this.getView().addArticuloDialog.close();
		},

		onChangeArticulo: function (oEvent) {

			var sValue = oEvent.getParameter("value");
			if (sValue === "") {
				this.getView().addArticuloDialog.getModel("newArticulo").setProperty("/Articulo", "");
				this.getView().addArticuloDialog.getModel("newArticulo").setProperty("/Descripcion", "");
				return;
			}
			var sOp = sap.ui.model.FilterOperator.Contains;
			if (sValue.indexOf("*") === 0) {
				sOp = sap.ui.model.FilterOperator.EndsWith;
			}
			if (sValue.indexOf("*") > 0) {
				sOp = sap.ui.model.FilterOperator.StartsWith;
			}
			sValue = sValue.replace(/\*/g, "");
			var that = this;

			this.getComponentModel().read("/MCArticuloSet('" + sValue + "')", {
				// filters: [new sap.ui.model.Filter({
				// 	path: "Articulo",
				// 	operator: sOp,
				// 	value1: sValue.toUpperCase()
				// })],
				success: function (oData) {
					if (oData) {
						// if (oData.results.length === 1) {
						that.getView().addArticuloDialog.getModel("newArticulo").setProperty("/Articulo", oData.Articulo); // .results[0]
						that.getView().addArticuloDialog.getModel("newArticulo").setProperty("/Descripcion", oData.Descripcion); // .results[0]
						// }
					}
				},
				error: function (oData) {}
			});
		},

		getDescripcionArticulos: function (sNivel) {
			var that = this;

			this.getOwnerComponent().getModel().attachEventOnce("batchRequestSent", function (oEvent) {
				sap.ui.core.BusyIndicator.show(0);
			});
			this.getOwnerComponent().getModel().attachEventOnce("batchRequestCompleted", function (oEvent) {
				sap.ui.core.BusyIndicator.hide();
			});
			var iAuxNivel = sNivel || this.getCurrentNivel() - 1;

			this.getArticulosInLevel(iAuxNivel).forEach(function (oLinea) {

				if (oLinea.Descripcion === "") {
					var sArticulo = oLinea.Articulo;
					if (sArticulo !== "") {
						this.getOwnerComponent().getModel().read("/MCArticuloSet('" + sArticulo + "')", {
							// filters: [new sap.ui.model.Filter({
							// 	path: "Articulo",
							// 	operator: sap.ui.model.FilterOperator.Contains,
							// 	value1: sArticulo.toUpperCase()
							// })],
							success: function (oData) {
								if (oData) {
									that.fillDescripcionArticulos(sArticulo, iAuxNivel, oData);
								}
							},
							error: function (oData) {}
						});
					}
				}
			}, this);
		},

		fillDescripcionArticulos: function (sArticulo, sNivel, oDataArticulo) {
			var aItems = this.getArticulosInLevel(),
				sAuxArticulo = oDataArticulo;
			aItems.forEach(function (oItem) {
				if (oItem.Articulo === sAuxArticulo.Articulo) {
					oItem.Descripcion = sAuxArticulo.Descripcion;
				}
			});
			// this.oModel.setProperty("/items/" + sNivel, aItems);
			this.setArticulosInLevel( /* iLevel */ undefined, aItems)
		},

		onPressBorrar: function () {

			if (this.getModuloTable().getSelectedContexts().length > 0 || this.getSurtidoTable().getSelectedContexts() > 0) {
				if (this.getModuloTable().getSelectedContexts().length > 0) {
					this.onPressBorrarArticulo();
				}
				if (this.getSurtidoTable().getSelectedContexts().length > 0) {
					this.onPressBorrarTienda();
				}
			} else {
				return sap.m.MessageToast.show("Seleccione alguna línea");
			}
		},

		onPressBorrarArticulo: function (oEvent) {

			var aListaArticulosBorrar = this.getModuloTable().getSelectedContexts().map(function (oContext) {
				return oContext.getProperty("Articulo");
			});
			var aArticulosOrigen = [];
			try {
				// Eliminamos el articulo del nivel actual
				aArticulosOrigen = this.getArticulosInLevel().filter(function (oArticulo) {
					return !aListaArticulosBorrar.includes(oArticulo.Articulo);
				});
			} catch (exc) {
				return sap.m.MessageToast.show("No hay listado de articulos para borrar")
			}
			this.setArticulosInLevel( /* iLevel */ undefined, aArticulosOrigen);
			// this.getComponentModel("data").updateBindings(true);
		},

		onPressBorrarTienda: function (oEvent) {

			var aListaTiendasBorrar = this.getSurtidoTable().getSelectedContexts().map(function (oContext) {
				return oContext.getProperty("Tienda");
			});
			var aTiendasOrigen = [];
			try {
				// Eliminamos el articulo del nivel actual
				aTiendasOrigen = this.getTiendasInLevel().filter(function (oTienda) {
					return !aListaTiendasBorrar.includes(oTienda.Tienda);
				});
			} catch (exc) {
				return sap.m.MessageToast.show("No hay listado de tiendas para borrar")
			}
			this.setTiendasInLevel( /* iLevel */ undefined, aTiendasOrigen);
			this.getComponentModel("data").updateBindings(true);
		},

		onPressEditarFechas: function () {

			if (!this.getView().editarFechasDialog) {
				this.getView().editarFechasDialog = sap.ui.xmlfragment("editarFechasDialog",
					"dinosol.din-colecciones-anidadas.fragment.DialogEditarFechas", this);
				this.getView().addDependent(this.getView().editarFechasDialog);
			}
			var oModulo = this.getComponentModelProperty("data", "/coleccion/niveles/" + (this.getCurrentNivel() - 1) + "/modulo"),
				oSurtido = this.getComponentModelProperty("data", "/coleccion/niveles/" + (this.getCurrentNivel() - 1) + "/surtido");
			this.getView().editarFechasDialog.setModel(new sap.ui.model.json.JSONModel({
				"iniModulo": oModulo.FechaInicio,
				"finModulo": oModulo.FechaFin,
				"iniSurtido": oSurtido.FechaInicio,
				"finSurtido": oSurtido.FechaFin
			}), "editFechas");
			this.getView().editarFechasDialog.open();
		},

		onPressGuardarEditarFechas: function () {
			var oModel = this.getView().editarFechasDialog.getModel("editFechas").getProperty("/");
			this.setComponentModelProperty("data", "/coleccion/niveles/" + (this.getCurrentNivel() - 1) + "/modulo/FechaInicio", oModel.iniModulo);
			this.setComponentModelProperty("data", "/coleccion/niveles/" + (this.getCurrentNivel() - 1) + "/modulo/FechaFin", oModel.finModulo);
			this.setComponentModelProperty("data", "/coleccion/niveles/" + (this.getCurrentNivel() - 1) + "/surtido/FechaInicio", oModel.iniSurtido);
			this.setComponentModelProperty("data", "/coleccion/niveles/" + (this.getCurrentNivel() - 1) + "/surtido/FechaFin", oModel.finSurtido);
			this.getComponentModel("data").updateBindings(true);
			this.getView().editarFechasDialog.close();
			sap.m.MessageToast.show("Las fechas han sido modificadas");
		},

		onPressCancelarEditarFechas: function () {

			this.getView().editarFechasDialog.close();
		},

		moverArticulos: function (oEvent) {

			// Articulos
			var aListaArticulosMover = this.getModuloTable().getSelectedContexts().map(function (oContext) {
					return oContext.getProperty("Articulo");
				}),
				aArticulosMover = this.getModuloTable().getSelectedContexts().map(function (oContext) {
					return oContext.getObject();
				});

			var iNivelOrigen = this.getCurrentNivel(),
				iNivelSelected = oEvent.getParameter("selectedItem").getBindingContext("data").getProperty("NumNivel");
			var aArticulosOrigen = this.getArticulosInLevel(iNivelOrigen),
				aArticulosSelected = this.getArticulosInLevel(iNivelSelected);
			var bSubir = iNivelSelected > iNivelOrigen,
				bBajar = iNivelSelected < iNivelOrigen;

			// Subir un artículo de nivel origen. Por ejemplo, se pasa del nivel origen del 1 al 5 →
			// Se deberá enviar a SAP el artículo con fecha fin hoy para los niveles (módulos) 1, 2, 3, 4.
			if (bSubir) {
				var aArticuloInsert = aArticulosMover.map(function (oArticulo) {
					oArticulo.FechaInicio = this.getTodayDateToSend();
					return oArticulo;
				}, this);
				//Cambiamos las fechas en el actual y en los sucesivos excepto en el final
				for (var iLevel = iNivelOrigen; iLevel < iNivelSelected; iLevel++) {
					// Obtenemos los articulos del nivel actual
					var aArticulosLevel = this.getArticulosInLevel(iLevel);
					// Buscamos si hay alguno que esté en la lista de los articulos a subir
					aArticulosLevel = aArticulosLevel.filter(function (oArticulo) {
						return !aListaArticulosMover.includes(oArticulo.Articulo);
					}, this);
					aArticulosLevel = aArticulosLevel.concat(aArticuloInsert);
					this.setArticulosInLevel(iLevel, aArticulosLevel);
				}
				// Lo añadimos en el nivel final
				aArticulosSelected = aArticulosSelected.concat(aArticulosMover);
				this.setArticulosInLevel(iNivelSelected, aArticulosSelected);
			} else if (bBajar) {
				// Bajar un artículo de nivel origen. Por ejemplo, se pasa del nivel origen del 5 al 1 →
				// Se deberá enviar a SAP el artículo con fecha inicio hoy y fin 31.12.9999 para los niveles 1, 2, 3, 4. 	
				var aArticuloInsert = aArticulosMover.map(function (oArticulo) {
					oArticulo.FechaInicio = this.getTodayDateToSend();
					oArticulo.FechaFin = "99991231";
					return oArticulo;
				}, this);
				for (var iLevel = iNivelSelected; iLevel >= iNivelSelected; iLevel--) {

					// Obtenemos los articulos del nivel actual
					var aArticulosLevel = this.getArticulosInLevel(iLevel)
						// Buscamos si hay alguno que esté en la lista de los articulos a bajar
					aArticulosLevel = aArticulosLevel.filter(function (oArticulo) {
						return !aListaArticulosMover.includes(oArticulo.Articulo);
					}, this);
					aArticulosLevel = aArticulosLevel.concat(aArticuloInsert);
					this.setArticulosInLevel(iLevel, aArticulosLevel);
				}
			}

			// Eliminamos articulos y tiendas del nivel actual
			// aArticulosOrigen = aArticulosOrigen.filter(function (oArticulo) {
			// 	return !aListaArticulosMover.includes(oArticulo.Articulo);
			// });
			// this.setArticulosInLevel(iNivelOrigen, aArticulosOrigen);

			// Lo añadimos en el nivel seleccionado
			// aArticulosSelected = aArticulosSelected.concat(aArticulosMover);
			// this.setArticulosInLevel(iNivelSelected, aArticulosSelected);

			this.getComponentModel("data").updateBindings(true);
			this.getModuloTable().removeSelections(true);
			sap.m.MessageToast.show("Los artículos han sido movidos");
		},

		onPressSubirMasiva: function (oEvent) {

			if (!this.getView().cargaMasivaDialog) {
				this.getView().cargaMasivaDialog = sap.ui.xmlfragment("cargaMasivaDialog",
					"dinosol.din-colecciones-anidadas.fragment.DialogCargaMasiva", this);
				this.getView().addDependent(this.getView().cargaMasivaDialog);
			}
			var sKey = oEvent.getSource().getKey();
			var oNew = {
				"Tipo": sKey,
				"visiblePlantillaArticulo": sKey === "Articulos",
				"visiblePlantillaTienda": sKey === "Tiendas"
			};

			this.getView().cargaMasivaDialog.setModel(new sap.ui.model.json.JSONModel(oNew), "cargaMasiva");

			if (this.getUploaderFiles()) {
				this.getView().cargaMasivaDialog.getContent()[0].removeContent(1);
				this.getView().cargaMasivaDialog.getContent()[0].addContent(new sap.ui.unified
					.FileUploader({
						width: "250px",
						uploadOnChange: true,
						change: [this.readArchivo, this]
					}).addStyleClass("sapUiResponsiveMargin"));
			}
			this.getView().cargaMasivaDialog.open();
		},

		getUploaderFiles: function () {
			if (this.getView().cargaMasivaDialog.getContent()[0].getContent()[1].oFileUpload) {
				return this.getView().cargaMasivaDialog.getContent()[0].getContent()[1].oFileUpload.files[0];
			}
			return undefined;
		},

		readArchivo: function () {

			var f = this.getUploaderFiles();
			var that = this;

			var rABS = true;
			var reader = new FileReader();
			reader.onload = function (e) {
				var data = e.target.result;
				if (!rABS) data = new Uint8Array(data);
				var workbook = XLSX.read(data, {
					type: rABS ? "binary" : "array"
				});
				that.readData(workbook);
			};
			if (rABS) {
				reader.readAsBinaryString(f);
			} else {
				reader.readAsArrayBuffer(f);
			}
		},
		onPressCerrar: function () {
			this.getView().cargaMasivaDialog.close();
		},

		upperCaseAllData: function (sText) {
			return sText;
		},

		readData: function (oData) {

			var sSheet = oData.SheetNames[0];
			var aNewData = this.upperCaseAllData(XLSX.utils.sheet_to_json(oData.Sheets[sSheet]));
			var bAllGood = true,
				bFechaFinVacio = false;
			var oCargaMasiva = this.getView().cargaMasivaDialog.getModel("cargaMasiva");
			var oFieldRelation = {};

			var oCargaMasivaModel = this.getView().cargaMasivaDialog.getModel("cargaMasiva").getProperty("/");

			switch (oCargaMasivaModel.Tipo) {
			case "Articulos":
				oFieldRelation = this.getComponentModel("textfieldArticulo").getProperty("/");

				aNewData.forEach(function (oLinea) {
					for (var sProperty in oLinea) {
						var sNewProperty = oFieldRelation[sProperty];
						oLinea[sNewProperty] = "" + oLinea[sProperty];
						if (sProperty !== sNewProperty) {
							delete oLinea[sProperty];
						}
					}

					oLinea.Descripcion = "";
					oLinea.FechaInicio = this.getReadDate(oLinea.FechaInicio) || this.getTodayDateToSend();
					oLinea.FechaFin = this.getReadDate(oLinea.FechaFin); // || "99991231";

					if (oLinea.NoAnidar === "X") {
						oLinea.NoAnidar = true;
					} else {
						oLinea.NoAnidar = false;
					}

					if ("undefined" in oLinea) {
						bAllGood = false;
					}
					if (!oLinea.FechaFin) {
						bFechaFinVacio = true;
					}
				}, this);

				// if (bFechaFinVacio) {
				// 	return sap.m.MessageToast.show("Alguna línea contiene un campo de fecha fin vacío.");
				// }
				if (!bAllGood) {
					return sap.m.MessageToast.show("Alguna línea contiene un campo que no se ha podido leer.");
				}
				if (bAllGood) {
					// this.removeAndPush(aNewData, "/items/" + oCargaMasivaModel.Nivel, oCargaMasivaModel.Nivel, true);
					var aArticulos = this.getArticulosInLevel();
					aArticulos = aArticulos.concat(aNewData);
					this.setArticulosInLevel( /* iLevel */ undefined, aArticulos);
					this.getDescripcionArticulos(this.getCurrentNivel() - 1);
				}
				break;

			case "Tiendas":

				oFieldRelation = this.getComponentModel("textfieldTienda").getProperty("/");

				aNewData.forEach(function (oLinea) {
					for (var sProperty in oLinea) {
						var sNewProperty = oFieldRelation[sProperty];
						oLinea[sNewProperty] = "" + oLinea[sProperty];
						if (sProperty !== sNewProperty) {
							delete oLinea[sProperty];
						}
					}

					var oTienda = this.getComponentModel("tiendas").getProperty("/").find(function (element) {
						return element.Tienda === oLinea.Tienda;
					});

					oLinea.Descripcion = "";

					if (oTienda) {
						oLinea.Descripcion = oTienda.Descripcion;
					}

					oLinea.FechaInicio = this.getReadDate(oLinea.FechaInicio) || this.getTodayDateToSend();
					oLinea.FechaFin = this.getReadDate(oLinea.FechaFin); // || "99991231";

					if ("undefined" in oLinea) {
						bAllGood = false;
					}
					if (!oLinea.FechaFin) {
						bFechaFinVacio = true;
					}
				}, this);

				if (bFechaFinVacio) {
					return sap.m.MessageToast.show("Alguna línea contiene un campo de fecha fin vacío.");
				}
				if (!bAllGood) {
					return sap.m.MessageToast.show("Alguna línea contiene un campo que no se ha podido leer.");
				}
				if (bAllGood && bFechaFinVacio === false) {
					// this.removeAndPush(aNewData, "/surtidos/" + oCargaMasivaModel.Nivel, oCargaMasivaModel.Nivel, false);

					var aTiendas = this.getTiendasInLevel();
					aTiendas = aArticulos.concat(aNewData);
					this.setTiendasInLevel( /* iLevel */ undefined, aTiendas);
				}

				break;
			}
			this.getComponentModel("data").updateBindings(true);
			this.getView().cargaMasivaDialog.close();
		},

		removeAndPush: function (aNewData, sPath, sNivel, bLoadArticulosDesc) {
			var aOldData = this.oModel.getProperty(sPath);
			var aData = aOldData.concat(aNewData);
			this.oModel.setProperty(sPath, aData);
			if (bLoadArticulosDesc) {
				this.getDescripcionArticulos(sNivel);
			}

		},

		getReadDate: function (sDate) {

			// Esperamos dd.MM.aaaa
			if (sDate) {
				var sDay = parseInt(sDate.split(".")[0]),
					sMes = parseInt(sDate.split(".")[1]),
					sAno = sDate.split(".")[2];

				sDay = sDay < 10 ? "0" + sDay : "" + sDay;
				sMes = sMes < 10 ? "0" + sMes : "" + sMes;

				var sFinalDate = sAno + sMes + sDay;
				return sFinalDate.length > 8 ? undefined : sFinalDate;
			}
			return undefined;
		},

		getTodayDateToSend: function () {

			var sMonth = new Date().getMonth() < 10 ? "0" + (new Date().getMonth() + 1) : (new Date().getMonth() + 1);
			var sDay = new Date().getDate() < 10 ? "0" + (new Date().getDate()) : (new Date().getDate());
			return new Date().getFullYear() + "" + sMonth + "" + sDay;
		},

		formatTiendaDescripcion: function (sTienda, oTiendas) {

			return sTienda + " - " + (oTiendas[sTienda] || "") || "";
		},

		onPressItemArticulo: function (oEvent) {

			var sBinding = oEvent.getSource().getBindingContext("data").getPath();
			this.onPressEditarArticulo(sBinding);
		},

		onPressEditarArticulo: function (sBinding) {
			if (!this.getView().editarArticuloDialog) {
				this.getView().editarArticuloDialog = sap.ui.xmlfragment("editarArticuloDialog",
					"dinosol.din-colecciones-anidadas.fragment.DialogEditarArticulo", this);
				this.getView().addDependent(this.getView().editarArticuloDialog);
			}
			var oArticulo = this.getComponentModelProperty("data", sBinding);

			var oNew = {
				"Articulo": oArticulo.Articulo,
				"Descripcion": oArticulo.Descripcion,
				"NoAnidar": oArticulo.NoAnidar,
				"FechaInicio": oArticulo.FechaInicio,
				"FechaFin": oArticulo.FechaFin //this.oModel.getProperty("/seleccionado/fechaFin")
			};

			this.getView().editarArticuloDialog.setModel(new sap.ui.model.json.JSONModel(oNew), "editArticulo");
			this.getView().editarArticuloDialog.removeAllCustomData();
			this.getView().editarArticuloDialog.addCustomData(new sap.ui.core.CustomData({
				key: "binding",
				value: sBinding
			}));
			this.getView().editarArticuloDialog.open();
		},

		onPressConfirmarEditarArticulo: function (oEvent) {
			var aItemsNivel = [];
			var oNewArticulo = this.getView().editarArticuloDialog.getModel("editArticulo").getProperty("/");
			var sBinding = this.getView().editarArticuloDialog.getCustomData()[0].getValue();

			this.setComponentModelProperty("data", sBinding, oNewArticulo);

			this.getDescripcionArticulos(this.getCurrentNivel());
			this.getView().editarArticuloDialog.close();
		},

		onPressCancelarEditar: function () {
			this.getView().editarArticuloDialog.close();
		},

		onPressItemTienda: function (oEvent) {

			var sBinding = oEvent.getSource().getBindingContext("data").getPath();
			this.onPressEditarTienda(sBinding);
		},

		onPressEditarTienda: function (sBinding) {
			if (!this.getView().editarTiendaDialog) {
				this.getView().editarTiendaDialog = sap.ui.xmlfragment("editarTiendaDialog",
					"dinosol.din-colecciones-anidadas.fragment.DialogEditarTienda", this);
				this.getView().addDependent(this.getView().editarTiendaDialog);
			}

			var oTienda = this.getComponentModelProperty("data", sBinding);

			var oNew = {
				"Tienda": oTienda.Tienda,
				"Descripcion": oTienda.Descripcion,
				"FechaInicio": oTienda.FechaInicio,
				"FechaFin": oTienda.FechaFin //this.oModel.getProperty("/seleccionado/fechaFin")
			};

			this.getView().editarTiendaDialog.setModel(new sap.ui.model.json.JSONModel(oNew), "editTienda");
			this.getView().editarTiendaDialog.removeAllCustomData();
			this.getView().editarTiendaDialog.addCustomData(new sap.ui.core.CustomData({
				key: "binding",
				value: sBinding
			}));
			this.getView().editarTiendaDialog.open();
		},

		onChangeTienda: function (oEvent) {

			var oTienda = this.getComponentModelProperty("tiendas", "/").find(function (element) {
				return element.Tienda === oEvent.getParameter("selectedItem").getProperty(
					"key");
			});

			this.getView().editarTiendaDialog.getModel("editTienda").setProperty("/Descripcion", oTienda.Descripcion);
		},

		onPressConfirmEditarTienda: function (oEvent) {

			var oNewTienda = this.getView().editarTiendaDialog.getModel("editTienda").getProperty("/");
			var sBinding = this.getView().editarTiendaDialog.getCustomData()[0].getValue();

			this.setComponentModelProperty("data", sBinding, oNewTienda);
			this.getView().editarTiendaDialog.close();
		},

		onPressCancelarEditarTienda: function () {
			if (this.getView().editarTiendaDialog) {
				this.getView().editarTiendaDialog.close();
			}
		},

		formatTypeErroresGenerales: function (aErroresModulo, aErroresSurtido) {

			var aModulo = aErroresModulo.filter(function (oError) {
				return oError.Message.indexOf("Artículo") < 0;
			}, this);
			var aSurtido = aErroresSurtido.filter(function (oError) {
				return (oError.Message.indexOf("Surtido") >= 0 || oError.Message.indexOf("surtido") >= 0) && oError.Message.indexOf("Tienda") <
					0;
			}, this);

			var aFinal = [];
			aFinal = aModulo.concat(aSurtido);

			return aFinal.length > 0 ? "Emphasized" : "Transparent";
		},

		onPressAbrirErroresGenerales: function (oEvent) {

			var aErroresModulo = this.getView().getModel("viewModel").getProperty("/erroresModulo");
			var aModulo = aErroresModulo.filter(function (oError) {
				return oError.Message.indexOf("Artículo") < 0;
			}, this);
			var aErroresSurtido = this.getView().getModel("viewModel").getProperty("/erroresSurtido");
			var aSurtido = aErroresSurtido.filter(function (oError) {
				return (oError.Message.indexOf("Surtido") >= 0 || oError.Message.indexOf("surtido") >= 0) && oError.Message.indexOf("Tienda") <
					0;
			}, this);

			var aFinal = aModulo.concat(aSurtido);

			if (!this.getView()._errorsDialog) {
				this.getView()._errorsDialog = new sap.m.MessagePopover({
					groupItems: true
				});
			}
			this.getView().addDependent(this.getView()._errorsDialog);

			this.getView()._errorsDialog.removeAllItems();
			aFinal.forEach(function (oError) {
				this.getView()._errorsDialog.addItem(new sap.m.MessageItem({
					title: oError.Message,
					subtitle: oError.Modulo ? oError.Modulo : oError.Surtido,
					type: oError.Type === "E" ? "Error" : "Warning"
				}));
			}, this);
			this.getView()._errorsDialog.openBy(oEvent.getSource());
		},

		onPressFiltrarFallidosArticulos: function (oEvent) {

			var oTable = this.getModuloTable();
			oTable.getBinding("items").filter(undefined);
			var that = this;
			if (oEvent.getParameter("pressed")) {
				oTable.getBinding("items").filter([new sap.ui.model.Filter({
					path: "Articulo",
					test: function (sArticulo) {
						var aErrors = this.getView().getModel("viewModel").getProperty("/errores");
						if (aErrors.length === 0) {
							return false;
						}
						var bError = aErrors.some(function (oError) {
							return oError.Message.indexOf(sArticulo) >= 0 && oError.Type === "E";
						}, this);
						return bError;
					}.bind(that)
				})]);
			}
		},

		onPressFiltrarFallidosTiendas: function (oEvent) {

			var oTable = this.getSurtidoTable();
			oTable.getBinding("items").filter(undefined);
			var that = this;
			if (oEvent.getParameter("pressed")) {
				oTable.getBinding("items").filter([new sap.ui.model.Filter({
					path: "Tienda",
					test: function (sArticulo) {
						var aErrors = this.getView().getModel("viewModel").getProperty("/errores");
						if (aErrors.length === 0) {
							return false;
						}
						var bError = aErrors.some(function (oError) {
							return oError.Message.indexOf(sArticulo) >= 0 && oError.Type === "E";
						}, this);
						return bError;
					}.bind(that)
				})]);
			}
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf dinosol.din-colecciones-anidadas.view.Coleccion
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf dinosol.din-colecciones-anidadas.view.Coleccion
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf dinosol.din-colecciones-anidadas.view.Coleccion
		 */
		//	onExit: function() {
		//
		//	}

	});

});