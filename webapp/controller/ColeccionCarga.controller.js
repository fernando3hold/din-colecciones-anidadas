sap.ui.define([
	"./BaseController",
	"../model/formatter"
], function (BaseController, formatter) {
	"use strict";

	return BaseController.extend("dinosol.din-colecciones-anidadas.controller.Coleccion", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf es.dinosol.ZUI5_CREA_COL.view.Coleccion
		 */
		onInit: function () {
			var oSeleccion = this.getComponentModel("TempData").getProperty("/");
			this.initModeloLocal(oSeleccion);
			this.getView().setModel(this.oModel);
			this.getView().getModel().setProperty("/errores", []);
			this.getView().getModel().setProperty("/openSH", false);

			switch (oSeleccion.tipoColeccion) {
			case "A":
				this.crearMultiSeccion(oSeleccion.niveles, oSeleccion.tipoColeccion, oSeleccion.fechaInicio, oSeleccion.fechaFin);
				break;
			default:
				this.crearSeccion("1", oSeleccion.tipoColeccion, oSeleccion.fechaInicio, oSeleccion.fechaFin);
				break;
			}
		},

		crearMultiSeccion: function (aNiveles, sTipoColeccion, sFechaInicio, sFechaFin) {
			for (var i = 0; i < aNiveles.length; i++) {
				this.crearSeccion(aNiveles[i], sTipoColeccion, sFechaInicio, sFechaFin);
			}
		},

		crearSeccion: function (sNivel, sTipoColeccion, sFechaInicio, sFechaFin) {
			var that = this;
			var sPathModulo = "/items/N" + sNivel;
			var sPathSurtido = "/surtidos/N" + sNivel;
			var sPathHeader = "/headers/N" + sNivel + "/";

			var oObjectPageLayout = this.getView().byId("opl");

			var oVBoxModulo = new sap.m.VBox("VBOXModulo_N" + sNivel);

			var oModuloHeader = new sap.m.FlexBox("ModuloHeader_N" + sNivel, {
				backgroundDesign: sap.m.BackgroundDesign.Translucent,
				alignItems: sap.m.FlexAlignItems.Center
			});

			oModuloHeader.addItem(new sap.m.Label("LabelFechaIncioModulo_N" + sNivel, {
				text: "Fecha inicio módulo: ",
				required: true
			}));

			oModuloHeader.addItem(new sap.m.DatePicker("FechaIncioModulo_N" + sNivel, {
				displayFormat: "dd.MM.yyyy",
				valueFormat: "yyyyMMdd",
				width: "80%",
				value: "{" + sPathHeader + "DatabModulo}"
			}));

			oModuloHeader.addItem(new sap.m.Label("LabelFechaFinModulo_N" + sNivel, {
				text: "Fecha fin módulo: ",
				required: true
			}));

			oModuloHeader.addItem(new sap.m.DatePicker("FechaFinModulo_N" + sNivel, {
				displayFormat: "dd.MM.yyyy",
				valueFormat: "yyyyMMdd",
				width: "80%",
				value: "{" + sPathHeader + "DatbiModulo}"
			}));

			this.oModel.setProperty(sPathHeader + "DatabModulo", sFechaInicio);
			this.oModel.setProperty(sPathHeader + "DatbiModulo", sFechaFin);

			var oToolbarModulo = new sap.m.Toolbar("ToolbarModulo_N" + sNivel);
			oToolbarModulo.addContent(new sap.m.Title("TitleModulo_N" + sNivel, {
				text: {
					parts: [sPathModulo],
					formatter: formatter.articulosCount
				}
			}));

			oToolbarModulo.addContent(new sap.m.ToolbarSpacer());
			// Inicio FTM 01.09.2020
			oToolbarModulo.addContent(new sap.m.ToggleButton("erroneosButtonModulo_N" + sNivel, {
				// icon: "sap-icon://filter",
				type: sap.m.ButtonType.Transparent,
				text: "Mostrar artículos no validados",
				press: [this.onPressFiltrarErroneosModulo, this]
			}));
			// Fin FTM 01.09.2020
			oToolbarModulo.addContent(new sap.m.Button("massAddButtonModulo_N" + sNivel, {
				icon: "sap-icon://upload-to-cloud",
				type: sap.m.ButtonType.Transparent,
				tooltip: "Añadir masivamente artículos",
				press: [this.onPressSubirMasiva, this]
			}));

			oToolbarModulo.addContent(new sap.m.Button("addButtonModulo_N" + sNivel, {
				icon: "sap-icon://add",
				type: sap.m.ButtonType.Transparent,
				tooltip: "Añadir artículo",
				press: [this.onPressAddArticulo, this]
			}));

			oToolbarModulo.addContent(new sap.m.Button("removeButtonModulo_N" + sNivel, {
				icon: "sap-icon://less",
				type: sap.m.ButtonType.Transparent,
				tooltip: "Borrar artículo",
				press: [this.onPressBorrarArticulo, this]
			}));

			var oTableModulo = new sap.ui.table.Table("Modulo_N" + sNivel, {
				alternateRowColors: true
			});
			oTableModulo.setModel(this.oModel);
			oTableModulo.bindRows(sPathModulo);

			oTableModulo.bindColumns("tablaModuloItems>/", function (sId, oContext) {
				var oTemplate;
				switch (oContext.getProperty("type")) {

				case "Semaforo":
					{
						oTemplate = new sap.ui.core.Icon({
							src: {
								parts: ["", "/errores"],
								formatter: formatter.srcSemaforoGeneral
							},
							color: {
								parts: ["", "/errores"],
								formatter: formatter.colorSemaforoGeneral
							},
							press: [that.onPressSemaforoArticulo, that]
						});
						break;
					}
				case "Text":
					{
						oTemplate = new sap.m.Text({
							text: "{" + oContext.getProperty("field") + "}"
						});
						break;
					}
				case "BooleanText":
					{
						oTemplate = new sap.m.Text({
							text: {
								parts: [oContext.getProperty("field")],
								formatter: formatter.convertBooleanToString
							}
						});

						break;
					}
				case "Date":
					{
						oTemplate = new sap.m.Text({
							text: {
								parts: [oContext.getProperty("field")],
								formatter: formatter.convertStringToDateString
							}
						});
					}
				}

				var bVisible = true;

				if (oContext.getProperty("field") === "NoAnidar") {
					if (that.oModel.getProperty("/seleccionado/tipoColeccion") === 'A') {
						bVisible = true;
					} else {
						bVisible = false;
					}
				}

				var sWidth = oContext.getProperty("width");
				return new sap.ui.table.Column({
					resizable: true,
					hAlign: sap.ui.core.HorizontalAlign.Center,
					filterOperator: "Contains",
					filterProperty: oContext.getProperty("field"),
					sortProperty: oContext.getProperty("field"),
					visible: bVisible,
					width: sWidth || "auto",
					template: oTemplate,
					label: new sap.m.Label({
						tooltip: oContext.getProperty("label"),
						text: oContext.getProperty("label"),
						wrapping: true
					})
				});
			});

			oVBoxModulo.addItem(oModuloHeader);
			oVBoxModulo.addItem(oToolbarModulo);
			oVBoxModulo.addItem(oTableModulo);

			var oVBoxSurtido = new sap.m.VBox("VBOXSurtido_N" + sNivel);

			var oSurtidoHeader = new sap.m.FlexBox("ModuloSurtido_N" + sNivel, {
				backgroundDesign: sap.m.BackgroundDesign.Translucent,
				alignItems: sap.m.FlexAlignItems.Center
			});

			oSurtidoHeader.addItem(new sap.m.Label("LabelFechaIncioSurtido_N" + sNivel, {
				text: "Fecha inicio surtido: ",
				required: true
			}));

			oSurtidoHeader.addItem(new sap.m.DatePicker("FechaIncioSurtido_N" + sNivel, {
				displayFormat: "dd.MM.yyyy",
				valueFormat: "yyyyMMdd",
				width: "80%",
				value: "{" + sPathHeader + "DatabSurtido}"
			}));

			oSurtidoHeader.addItem(new sap.m.Label("LabelFechaFinSurtido_N" + sNivel, {
				text: "Fecha fin surtido: ",
				required: true
			}));

			oSurtidoHeader.addItem(new sap.m.DatePicker("FechaFinSurtido_N" + sNivel, {
				displayFormat: "dd.MM.yyyy",
				valueFormat: "yyyyMMdd",
				width: "80%",
				value: "{" + sPathHeader + "DatbiSurtido}"
			}));

			this.oModel.setProperty(sPathHeader + "DatabSurtido", sFechaInicio);
			this.oModel.setProperty(sPathHeader + "DatbiSurtido", sFechaFin);

			var oToolbarSurtido = new sap.m.Toolbar("ToolbarSurtido_N" + sNivel, {
				width: "100%"
			});
			oToolbarSurtido.addContent(new sap.m.Title("TitleSurtido_N" + sNivel, {
				text: {
					parts: [sPathSurtido],
					formatter: formatter.tiendasCount
				}
			}));

			oToolbarSurtido.addContent(new sap.m.ToolbarSpacer());

			if (sTipoColeccion === 'A') {
				oToolbarSurtido.addContent(new sap.m.Button("massAddButtonSurtido_N" + sNivel, {
					icon: "sap-icon://upload-to-cloud",
					type: sap.m.ButtonType.Transparent,
					tooltip: "Añadir masivamente tiendas",
					press: [this.onPressSubirMasiva, this]
				}));

				oToolbarSurtido.addContent(new sap.m.Button("addButtonSurtido_N" + sNivel, {
					icon: "sap-icon://add",
					type: sap.m.ButtonType.Transparent,
					tooltip: "Añadir tienda",
					press: [this.onPressAddTienda, this]
				}));

				oToolbarSurtido.addContent(new sap.m.Button("removeButtonSurtido_N" + sNivel, {
					icon: "sap-icon://less",
					type: sap.m.ButtonType.Transparent,
					tooltip: "Borrar tienda",
					press: [this.onPressBorrarTienda, this]
				}));
			} else {
				var oSeleccionado = this.oModel.getProperty("/seleccionado");
				var aTienda = [];

				aTienda.push({
					"Locnr": oSeleccionado.tienda,
					"Name1": this.getDescripcionTienda(oSeleccionado.tienda),
					"Datab": oSeleccionado.fechaInicio,
					"Datbi": oSeleccionado.fechaFin
				});

				this.oModel.setProperty("/surtidos/N" + sNivel, aTienda);
			}

			var oTableSurtido = new sap.ui.table.Table("Surtido_N" + sNivel, {
				alternateRowColors: true,
				width: "100%"
			});

			oTableSurtido.setModel(this.oModel);
			oTableSurtido.bindRows(sPathSurtido);

			oTableSurtido.bindColumns("tablaSurtidoItems>/", function (sId, oContext) {
				var oTemplate;
				switch (oContext.getProperty("type")) {
				case "Text":
					{
						oTemplate = new sap.m.Text({
							text: "{" + oContext.getProperty("field") + "}"
						});
						break;
					}

				case "Date":
					{
						oTemplate = new sap.m.Text({
							text: {
								parts: [oContext.getProperty("field")],
								formatter: formatter.convertStringToDateString
							}
						});
					}
				}

				var sWidth = oContext.getProperty("width");
				return new sap.ui.table.Column({
					resizable: true,
					hAlign: sap.ui.core.HorizontalAlign.Center,
					filterOperator: "Contains",
					filterProperty: oContext.getProperty("field"),
					sortProperty: oContext.getProperty("field"),
					visible: oContext.getProperty("visible") || true,
					width: sWidth || "auto",
					template: oTemplate,
					label: new sap.m.Label({
						tooltip: oContext.getProperty("label"),
						text: oContext.getProperty("label"),
						wrapping: true
					})
				});
			});

			oVBoxSurtido.addItem(oSurtidoHeader);
			oVBoxSurtido.addItem(oToolbarSurtido);
			oVBoxSurtido.addItem(oTableSurtido);

			var oHBox = new sap.m.HBox("HBOX_N" + sNivel, {});
			oHBox.addStyleClass("columns");
			oHBox.addItem(oVBoxModulo);
			oHBox.addItem(oVBoxSurtido);

			var oObjectPageSubSection = new sap.uxap.ObjectPageSubSection("SubSection_N" + sNivel);
			oObjectPageSubSection.addBlock(oHBox);

			var oObjectPageSection = new sap.uxap.ObjectPageSection("Section_N" + sNivel, {
				title: "Nivel " + sNivel
			});

			oObjectPageSection.addSubSection(oObjectPageSubSection);
			oObjectPageLayout.addSection(oObjectPageSection);
		},

		onPressBorrarArticulo: function (oEvent) {
			var sNivel = oEvent.getParameter("id").split("_")[1];
			var sTable = 'Modulo_' + sNivel;
			var oTable = sap.ui.getCore().byId(sTable);
			var aRows = oTable.getSelectedIndices();
			var aRealIndexes = oTable.getBinding("rows").aIndices;
			var bWithErrors = sap.ui.getCore().byId("erroneosButtonModulo_" + sNivel).getPressed();

			var aIndexToRemove = [];
			var aItems = this.oModel.getProperty('/items/' + sNivel);
			for (var i = 0; i < aRows.length; i++) {

				var aErrors = this.getView().getModel().getProperty("/errores");
				var sArticulo = aItems[aRealIndexes[aRows[i]]].Matnr;
				if (sArticulo) {
					var bError = aErrors.some(function (oError) {
						return oError.Message.indexOf(sArticulo) >= 0;
					}, this);
					if (bWithErrors === true && bError === true) {
						aIndexToRemove.push(aRealIndexes[aRows[i]]);
						// aItems.splice(aRealIndexes[aRows[i]], 1);
					} else {
						aIndexToRemove.push(aRealIndexes[aRows[i]]);
						// aItems.splice(aRealIndexes[aRows[i]], 1);
					}
				} else {
					console.log("No hay matnr al borrar");
				}
			}

			aIndexToRemove.sort(function (a, b) {
				return b - a;
			});
			aIndexToRemove.forEach(function (iIndex) {
				aItems.splice(iIndex, 1);
			});
			oTable.setSelectedIndex(-1);
			this.oModel.setProperty('/items/' + sNivel, aItems);
		},

		onPressBorrarTienda: function (oEvent) {
			var sNivel = oEvent.getParameter("id").split("_")[1];
			var sTable = 'Surtido_' + sNivel;
			var oTable = sap.ui.getCore().byId(sTable);
			var aRows = oTable.getSelectedIndices();

			aRows.sort(function (a, b) {
				return b - a;
			});

			var aItems = this.oModel.getProperty('/surtidos/' + sNivel);

			for (var i = 0; i < aRows.length; i++) {
				aItems.splice(aRows[i], 1);
			}
			this.oModel.setProperty('/surtidos/' + sNivel, aItems);
		},

		getDateToSearch: function (dDate) {

			var fnTwoDigits = function (iNumber) {
				return iNumber < 10 ? "0" + iNumber : "" + iNumber;
			};
			return dDate.getFullYear() + fnTwoDigits(dDate.getMonth() + 1) + fnTwoDigits(dDate.getDate());

		},

		onKeyPressArticuloSH: function (e) {
			if (e.which === 13) {
				if (this.getView().getModel().getProperty("/openSH")) {
					if (this.getView().searchHelpArticuloDialog) {
						this.getView().searchHelpArticuloDialog.getFilterBar().fireSearch();
					}
				}
			}
		},

		onPressAddArticulo: function (oEvent) {
			if (!this.getView().addArticuloDialog) {
				this.getView().addArticuloDialog = sap.ui.xmlfragment("addArticuloDialog",
					"es.dinosol.ZUI5_CREA_COL.fragment.DialogNuevoArticulo", this);
				this.getView().addDependent(this.getView().addArticuloDialog);
			}

			var oNew = {
				"Nivel": oEvent.getParameter("id").split("_")[1],
				"Matnr": "",
				"Maktx": "",
				"NoAnidar": false,
				"Datab": this.getDateToSearch(new Date()),
				"Datbi": this.oModel.getProperty("/seleccionado/fechaFin") //this.getDateToSearch(new Date(9999, 11, 31))
			};

			this.getView().addArticuloDialog.setModel(new sap.ui.model.json.JSONModel(oNew), "newArticulo");
			this.getView().addArticuloDialog.removeAllCustomData();
			this.getView().addArticuloDialog.addCustomData(new sap.ui.core.CustomData({
				key: "binding",
				value: undefined
			}));
			this.getView().addArticuloDialog.open();

		},

		onPressAddTienda: function (oEvent) {

			if (!this.getView().addTiendaDialog) {
				this.getView().addTiendaDialog = sap.ui.xmlfragment("addTiendaDialog",
					"es.dinosol.ZUI5_CREA_COL.fragment.DialogNuevaTienda", this);
				this.getView().addDependent(this.getView().addTiendaDialog);
			}

			var oNew = {
				"Nivel": oEvent.getParameter("id").split("_")[1],
				"Locnr": "",
				"Name1": "",
				"Datab": this.getDateToSearch(new Date()),
				"Datbi": this.oModel.getProperty("/seleccionado/fechaFin") //this.getDateToSearch(new Date(9999, 11, 31))
			};

			this.getView().addTiendaDialog.setModel(new sap.ui.model.json.JSONModel(oNew), "newTienda");
			this.getView().addTiendaDialog.removeAllCustomData();
			this.getView().addTiendaDialog.addCustomData(new sap.ui.core.CustomData({
				key: "binding",
				value: undefined
			}));
			this.getView().addTiendaDialog.open();

		},

		onRequestValueHelpArticulo: function (oEvent) {
			if (!this.getView().searchHelpArticuloDialog) {
				this.getView().searchHelpArticuloDialog = sap.ui.xmlfragment("searchHelpArticuloDialog",
					"es.dinosol.ZUI5_CREA_COL.fragment.DialogValueHelpArticulo", this);
				this.getView().addDependent(this.getView().searchHelpArticuloDialog);
			}

			var oValueHelp = sap.ui.core.Fragment.byId("searchHelpArticuloDialog", "valueHelpDialog");
			var oColsModel = new sap.ui.model.json.JSONModel({
				"cols": [{
					"label": "{i18n>label.codigoArticulo}",
					"template": "Articulo",
					"width": "10rem"
				}, {
					"label": "{i18n>label.descArticulo}",
					"template": "Descripcion",
					"width": "28rem"
				}]
			});

			var oTable = oValueHelp.getTable();
			oTable.setModel(oColsModel, "columns");

			if (oTable.bindRows) {
				oTable.bindAggregation("rows", "/articulos");
			}

			this.getView().searchHelpArticuloDialog.setModel(new sap.ui.model.json.JSONModel());

			document.addEventListener("keypress", this.onKeyPressArticuloSH.bind(this));
			this.getView().getModel().setProperty("/openSH", true);

			this.getView().searchHelpArticuloDialog.open();
		},

		onChangeArticulo: function (oEvent) {

			var sValue = oEvent.getParameter("value");
			if (sValue === "") {
				this.getView().addArticuloDialog.getModel("newArticulo").setProperty("/Matnr", "");
				this.getView().addArticuloDialog.getModel("newArticulo").setProperty("/Maktx", "");
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
						that.getView().addArticuloDialog.getModel("newArticulo").setProperty("/Matnr", oData.Articulo); // .results[0]
						that.getView().addArticuloDialog.getModel("newArticulo").setProperty("/Maktx", oData.Descripcion); // .results[0]
						// }
					}
				},
				error: function (oData) {}
			});
		},
		onPressCancelarAñadir: function () {
			this.getView().addArticuloDialog.close();
		},
		onPressAñadirArticulo: function (oEvent) {
			var aItemsNivel = [];
			var oNewArticulo = this.getView().addArticuloDialog.getModel("newArticulo").getProperty("/");

			if (oNewArticulo.Nivel !== null && oNewArticulo.Nivel !== undefined) {
				aItemsNivel = this.oModel.getProperty("/items/" + oNewArticulo.Nivel);
				var oNewArticuloToSet = {
					"Matnr": oNewArticulo.Matnr,
					"Maktx": oNewArticulo.Maktx,
					"NoAnidar": oNewArticulo.NoAnidar,
					"Datab": oNewArticulo.Datab,
					"Datbi": oNewArticulo.Datbi
				};
				aItemsNivel.push(oNewArticuloToSet);
				aItemsNivel = this.oModel.setProperty("/items/" + oNewArticulo.Nivel, aItemsNivel);
				this.oModel.updateBindings(true);
			}

			this.getDescripcionArticulos(oNewArticulo.Nivel);

			this.getView().addArticuloDialog.close();
		},

		onOKValueHelpArticulo: function (oEvent) {

			var iIndexSelected = this.getView().searchHelpArticuloDialog.getTable().getSelectedIndex();
			var sKey = this.getView().searchHelpArticuloDialog.getModel().getProperty("/articulos/" + iIndexSelected + "/Articulo");
			var sDesc = this.getView().searchHelpArticuloDialog.getModel().getProperty("/articulos/" + iIndexSelected + "/Descripcion");
			this.getView().addArticuloDialog.getModel("newArticulo").setProperty("/Matnr", sKey);
			this.getView().addArticuloDialog.getModel("newArticulo").setProperty("/Maktx", sDesc);
			this.getView().searchHelpArticuloDialog.close();
			this.getView().getModel().setProperty("/openSH", false);
			document.removeEventListener("keypress", this.onKeyPressArticuloSH);
		},
		clearFiltersValueHelpArticulo: function (oEvent) {

			this.getView().searchHelpArticuloDialog.getFilterBar().getAllFilterItems().forEach(function (oItem, index) {
				var oContent = oItem.getControl();
				if (oContent.getValue) {
					oContent.setValue("");
				}
			});

		},

		getFilterBarControls: function (sDialog) {

			var oBar = sDialog === "proveedor" ? this.getView().searchHelpProveedorDialog.getFilterBar() : this.getView().searchHelpArticuloDialog
				.getFilterBar();
			return oBar.getFilterGroupItems().map(function (oFGI) {
				return oFGI.getControl();
			});
		},

		onSearchValueHelpArticulo: function (oEvent) {

			var aSelectionSet = oEvent.getParameter("selectionSet") || this.getFilterBarControls("articulo");
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
						sValue = sValue.replace(/\*/g, "");
						if (sValue !== "") {
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

			var that = this;
			if (aFilters.length > 0) {
				this.getView().searchHelpArticuloDialog.getTable().setBusy(true);
				this.getComponentModel().read("/MCArticuloSet", {
					filters: aFilters,
					success: function (oData) {
						that.getView().searchHelpArticuloDialog.getTable().setBusy(false);
						that.getView().searchHelpArticuloDialog.getModel().setProperty("/articulos", oData.results);
					},
					error: function (oData) {
						that.getView().searchHelpArticuloDialog.getTable().setBusy(false);
					}
				});
			}

		},

		onChangeTienda: function (oEvent) {

			var oTienda = this.getView().getModel("TiendasData").getProperty("/").find(function (element) {
				return element.Tienda === oEvent.getParameter("selectedItem").getProperty(
					"key");
			});

			this.getView().addTiendaDialog.getModel("newTienda").setProperty("/Name1", oTienda.Descripcion);
		},

		getDescripcionTienda: function (sTienda) {

			if (!this.getComponentModel("TiendasData").getProperty("/")) {
				return "";
			}
			if (this.getComponentModel("TiendasData").getProperty("/").length === 0) {
				return "";
			}
			try {
				var oTienda = this.getComponentModel("TiendasData").getProperty("/").find(function (element) {
					return element.Tienda === sTienda;
				});

				if (oTienda) {
					return oTienda.Descripcion;
				} else {
					return "";
				}
			} catch (exc) {
				sap.ui.core.BusyIndicator.hide();
			}

		},

		onPressCancelarAñadirTienda: function () {
			if (this.getView().addTiendaDialog) {
				this.getView().addTiendaDialog.close();
			}
		},

		onPressAñadirTienda: function (oEvent) {
			var aTiendasNivel = [];
			var oNewTienda = this.getView().addTiendaDialog.getModel("newTienda").getProperty("/");

			if (oNewTienda.Nivel !== null && oNewTienda.Nivel !== undefined) {
				aTiendasNivel = this.oModel.getProperty("/surtidos/" + oNewTienda.Nivel);

				var oNewTiendaToSet = {
					"Locnr": oNewTienda.Locnr,
					"Name1": oNewTienda.Name1,
					"Datab": oNewTienda.Datab,
					"Datbi": oNewTienda.Datbi
				};
				aTiendasNivel.push(oNewTiendaToSet);
				aTiendasNivel = this.oModel.setProperty("/surtidos/" + oNewTienda.Nivel, aTiendasNivel);
				this.oModel.updateBindings(true);
			}

			this.getView().addTiendaDialog.close();
		},

		onPressSubirMasiva: function (oEvent) {

			if (!this.getView().cargaMasivaDialog) {
				this.getView().cargaMasivaDialog = sap.ui.xmlfragment("cargaMasivaDialog",
					"es.dinosol.ZUI5_CREA_COL.fragment.DialogCargaMasiva", this);
				this.getView().addDependent(this.getView().cargaMasivaDialog);
			}

			var oNew = {
				"Nivel": oEvent.getParameter("id").split("_")[1],
				"Tipo": oEvent.getParameter("id").split("_")[0],
				"visiblePlantillaArticulo": oEvent.getParameter("id").split("_")[0] === 'massAddButtonModulo' ? true : false,
				"visiblePlantillaTienda": oEvent.getParameter("id").split("_")[0] === 'massAddButtonModulo' ? false : true
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
			case 'massAddButtonModulo':
				oFieldRelation = this.getComponentModel("textfieldArticulo").getProperty("/");

				aNewData.forEach(function (oLinea) {
					for (var sProperty in oLinea) {
						var sNewProperty = oFieldRelation[sProperty];
						oLinea[sNewProperty] = "" + oLinea[sProperty];
						if (sProperty !== sNewProperty) {
							delete oLinea[sProperty];
						}
					}

					oLinea.Maktx = "";
					oLinea.Datab = this.getReadDate(oLinea.Datab) || this.getTodayDateToSend();
					oLinea.Datbi = this.getReadDate(oLinea.Datbi); // || "99991231";

					if (oLinea.NoAnidar === "X") {
						oLinea.NoAnidar = true;
					} else {
						oLinea.NoAnidar = false;
					}

					if ("undefined" in oLinea) {
						bAllGood = false;
					}
					if (!oLinea.Datbi) {
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
					this.removeAndPush(aNewData, "/items/" + oCargaMasivaModel.Nivel, oCargaMasivaModel.Nivel, true);
				}

				break;
			case 'massAddButtonSurtido':

				oFieldRelation = this.getComponentModel("textfieldTienda").getProperty("/");

				aNewData.forEach(function (oLinea) {
					for (var sProperty in oLinea) {
						var sNewProperty = oFieldRelation[sProperty];
						oLinea[sNewProperty] = "" + oLinea[sProperty];
						if (sProperty !== sNewProperty) {
							delete oLinea[sProperty];
						}
					}

					var oTienda = this.getView().getModel("TiendasData").getProperty("/").find(function (element) {
						return element.Tienda === oLinea.Locnr;
					});

					oLinea.Name1 = "";

					if (oTienda) {
						oLinea.Name1 = oTienda.Descripcion;
					}

					oLinea.Datab = this.getReadDate(oLinea.Datab) || this.getTodayDateToSend();
					oLinea.Datbi = this.getReadDate(oLinea.Datbi); // || "99991231";

					if ("undefined" in oLinea) {
						bAllGood = false;
					}
					if (!oLinea.Datbi) {
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
					this.removeAndPush(aNewData, "/surtidos/" + oCargaMasivaModel.Nivel, oCargaMasivaModel.Nivel, false);
				}

				break;
			}

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

		getDescripcionArticulos: function (sNivel) {
			var that = this;

			this.getOwnerComponent().getModel().attachEventOnce("batchRequestSent", function (oEvent) {
				sap.ui.core.BusyIndicator.show(0);
			});
			this.getOwnerComponent().getModel().attachEventOnce("batchRequestCompleted", function (oEvent) {
				sap.ui.core.BusyIndicator.hide();
			});

			this.oModel.getProperty("/items/" + sNivel).forEach(function (oLinea) {

				if (oLinea.Maktx === "") {
					var sArticulo = oLinea.Matnr;
					if (sArticulo !== "") {
						this.getOwnerComponent().getModel().read("/MCArticuloSet('" + sArticulo + "')", {
							// filters: [new sap.ui.model.Filter({
							// 	path: "Articulo",
							// 	operator: sap.ui.model.FilterOperator.Contains,
							// 	value1: sArticulo.toUpperCase()
							// })],
							success: function (oData) {
								if (oData) {
									that.fillDescripcionArticulos(sArticulo, sNivel, oData);
								}
							},
							error: function (oData) {}
						});
					}
				}
			}, this);
		},

		fillDescripcionArticulos: function (sArticulo, sNivel, oDataArticulo) {
			var aItems = this.oModel.getProperty("/items/" + sNivel);

			for (var i = 0; i < aItems.length; i++) {
				if (aItems[i].Matnr === oDataArticulo.Articulo) {
					aItems[i].Maktx = oDataArticulo.Descripcion;
				}
			}
			this.oModel.setProperty("/items/" + sNivel, aItems);
		},

		onPressCrear: function () {
			var oSeleccionModel = this.oModel.getProperty("/seleccionado");
			var bOk = this.validarColeccion(oSeleccionModel);

			if (bOk) {
				// this.initModeloCreacion();
				this.crearModulo(oSeleccionModel);
				this.crearSurtido(oSeleccionModel);
				this.crearNiveles(oSeleccionModel);
				this.crearColeccion();
			}

		},

		onPressConfirmAdvertencias: function () {
			
			this._errorDialog.close();
			var oSeleccionModel = this.oModel.getProperty("/seleccionado");

			// this.initModeloCreacion();
			this.crearModulo(oSeleccionModel);
			this.crearSurtido(oSeleccionModel);
			this.crearNiveles(oSeleccionModel);
			this.crearColeccion();
		},

		initModeloCreacion: function () {
			this.oCreacionModel = new sap.ui.model.json.JSONModel({
				"TipoModificacion": "C",
				"TipoColeccion": this.oModel.getProperty("/seleccionado/tipoColeccion"),
				"toModuloHeader": [],
				"toModuloItems": [],
				"toSurtidoHeader": [],
				"toSurtidoItems": [],
				"toNiveles": [],
				"toReturn": []
			});
		},

		crearModulo: function (oSeleccion) {
			var aNiveles = [];

			var aHeaders = [];
			var aItems = [];

			switch (oSeleccion.tipoColeccion) {
			case "A":
				aNiveles = aNiveles.concat(oSeleccion.niveles);
				break;
			default:
				aNiveles.push(1);
				break;
			}

			for (var i = 0; i < aNiveles.length; i++) {
				var sNivel = aNiveles[i];

				aHeaders.push({
					"Nivel": sNivel.toString(),
					"Modulo": "",
					"FechaInicio": this.oModel.getProperty("/headers/N" + sNivel + "/DatabModulo"),
					"FechaFin": this.oModel.getProperty("/headers/N" + sNivel + "/DatbiModulo"),
					"Clase": "",
					"Prioridad": "",
					"Status": "",
					"Denominacion": formatter.crearDescripcionColec(oSeleccion.tipoColeccion, oSeleccion.tienda, oSeleccion.coleccion),
					"TipoModificacion": "I"
				});

				var aItemsModel = this.oModel.getProperty("/items/N" + sNivel);

				for (var j = 0; j < aItemsModel.length; j++) {
					var oItem = aItemsModel[j];

					aItems.push({
						"Nivel": sNivel.toString(),
						"Modulo": "",
						"Articulo": oItem.Matnr,
						"Descripcion": oItem.Maktx,
						"FechaFin": oItem.Datbi,
						"FechaInicio": oItem.Datab,
						"IndBorrado": "",
						"NoAnidar": oItem.NoAnidar,
						"TipoModificacion": "I"
					});
				}
			}
			this.setComponentModelProperty("data","/toModuloHeader", aHeaders);
			this.setComponentModelProperty("data","/toModuloItems", aItems);
		},

		crearSurtido: function (oSeleccion) {
			var aNiveles = [];
			var aHeaders = [];
			var aItems = [];

			switch (oSeleccion.tipoColeccion) {
			case "A":
				aNiveles = aNiveles.concat(oSeleccion.niveles);
				break;
			default:
				aNiveles.push(1);
				break;
			}

			for (var i = 0; i < aNiveles.length; i++) {
				var sNivel = aNiveles[i];

				aHeaders.push({
					"Nivel": sNivel.toString(),
					"Surtido": "",
					"Funcion": "009",
					"Denominacion": formatter.crearDescripcionColec(oSeleccion.tipoColeccion, oSeleccion.tienda, oSeleccion.coleccion),
					"Tipo": "",
					"Canal": "",
					"FechaInicio": this.oModel.getProperty("/headers/N" + sNivel + "/DatabSurtido"),
					"FechaFin": this.oModel.getProperty("/headers/N" + sNivel + "/DatbiSurtido")
				});

				var aItemsModel = this.oModel.getProperty("/surtidos/N" + sNivel);

				for (var j = 0; j < aItemsModel.length; j++) {
					var oItem = aItemsModel[j];
					aItems.push({
						"Nivel": sNivel.toString(),
						"Surtido": "",
						"Tienda": oItem.Locnr,
						"FechaInicio": oItem.Datab,
						"FechaFin": oItem.Datbi
					});
				}
			}
			this.setComponentModelProperty("data","/toSurtidoHeader", aHeaders);
			this.setComponentModelProperty("data","/toSurtidoItems", aItems);
		},

		crearNiveles: function (oSeleccion) {
			var aNiveles = [];
			var aNivelesModel = [];

			switch (oSeleccion.tipoColeccion) {
			case "A":
				aNiveles = aNiveles.concat(oSeleccion.niveles);
				break;
			default:
				aNiveles.push(1);
				break;
			}

			for (var i = 0; i < aNiveles.length; i++) {
				var sNivel = aNiveles[i];

				aNivelesModel.push({
					"NumNivel": sNivel.toString(),
					"Modulo": "",
					"Surtido": "",
					"FechaInicio": oSeleccion.fechaInicio,
					"FechaFin": oSeleccion.fechaFin
				});
			}
			this.setComponentModelProperty("data","/toNiveles", aNivelesModel);
		},

		crearColeccion: function () {
			var that = this;
			sap.ui.core.BusyIndicator.show(0);

			this.getComponentModel().create("/ColeccionSet", this.getComponentModel("data").getData(), {
				success: function (oData) {
					sap.ui.core.BusyIndicator.hide();
					that.getView().getModel().setProperty("/errores", oData.toReturn.results);
					sap.m.MessageToast.show("Los datos han sido enviados. Consulte las líneas de artículo para ver errores.");
					// that.showMessages(oData.toReturn.results);
					//	that.initModeloLocal(that.getComponentModel("TempData").getProperty("/"));
				},
				error: function (oData) {}
			});

		},

		initModeloLocal: function (oSeleccion) {
			this.oModel = new sap.ui.model.json.JSONModel({
				"seleccionado": oSeleccion,
				"headers": {
					"N1": {
						"DatabModulo": "",
						"DatbiModulo": "",
						"DatabSurtido": "",
						"DatbiSurtido": ""
					},
					"N2": {
						"DatabModulo": "",
						"DatbiModulo": "",
						"DatabSurtido": "",
						"DatbiSurtido": ""
					},
					"N3": {
						"DatabModulo": "",
						"DatbiModulo": "",
						"DatabSurtido": "",
						"DatbiSurtido": ""
					},
					"N4": {
						"DatabModulo": "",
						"DatbiModulo": "",
						"DatabSurtido": "",
						"DatbiSurtido": ""
					},
					"N5": {
						"DatabModulo": "",
						"DatbiModulo": "",
						"DatabSurtido": "",
						"DatbiSurtido": ""
					},
					"N6": {
						"DatabModulo": "",
						"DatbiModulo": "",
						"DatabSurtido": "",
						"DatbiSurtido": ""
					},
					"N7": {
						"DatabModulo": "",
						"DatbiModulo": "",
						"DatabSurtido": "",
						"DatbiSurtido": ""
					},
					"N8": {
						"DatabModulo": "",
						"DatbiModulo": "",
						"DatabSurtido": "",
						"DatbiSurtido": ""
					},
					"N9": {
						"DatabModulo": "",
						"DatbiModulo": "",
						"DatabSurtido": "",
						"DatbiSurtido": ""
					},
					"N10": {
						"DatabModulo": "",
						"DatbiModulo": "",
						"DatabSurtido": "",
						"DatbiSurtido": ""
					}
				},
				"items": {
					"N1": [],
					"N2": [],
					"N3": [],
					"N4": [],
					"N5": [],
					"N6": [],
					"N7": [],
					"N8": [],
					"N9": [],
					"N10": []
				},
				"surtidos": {
					"N1": [],
					"N2": [],
					"N3": [],
					"N4": [],
					"N5": [],
					"N6": [],
					"N7": [],
					"N8": [],
					"N9": [],
					"N10": []
				}
			});
		},

		showMessages: function (aResult) {
			var that = this;
			if (!this._errorDialog) {

				this._errorDialog = new sap.m.Dialog({
					title: "Mensajes",
					content: new sap.m.List(),
					beginButton: new sap.m.Button({
						text: "Continuar",
						press: function () {
							that.onPressConfirmAdvertencias();
						}
					}),
					endButton: new sap.m.Button({
						text: "Cerrar",
						press: function (oEvent) {
							that._errorDialog.close();
						}
					})
				});
			}

			this._errorDialog.getContent()[0].removeAllItems();

			for (var i = 0; i < aResult.length; i++) {
				var oResult = aResult[i];

				this._errorDialog.getContent()[0].addItem(new sap.m.StandardListItem({
					info: oResult.Message,
					highlight: oResult.Type === "S" ? "Success" : "Warning"
				}));
			}

			this._errorDialog.open();
		},

		// Inicio FTM 07.09.2020 
		onPressAbrirErrores: function (oEvent) {

			if (!this.getView()._errorsDialog) {
				this.getView()._errorsDialog = new sap.m.MessagePopover({
					groupItems: true,
					items: {
						path: "/errores",
						// filters: [
						// 	new sap.ui.model.Filter({
						// 		path: "Message",
						// 		test: function (sMensaje) {
						// 			return sMensaje.indexOf("creado") >= 0 || sMensaje.indexOf("asignado") >= 0;
						// 		}
						// 	})
						// ],
						template: new sap.m.MessageItem({
							title: "{Message}",
							type: {
								path: "Type",
								formatter: function (sTipo) {
									if (sTipo === "S") {
										return "Success";
									}
									if (sTipo === "W") {
										return "Warning";
									}
									if (sTipo === "E") {
										return "Error";
									}
									return "Error";
								}
							}
						})
					}
				});
				this.getView().addDependent(this.getView()._errorsDialog);
			}
			this.getView()._errorsDialog.openBy(oEvent.getSource());
		},

		onPressSemaforoArticulo: function (oEvent) {

			var sArticulo = oEvent.getSource().getBindingContext().getProperty("Matnr");
			var aErrores = this.getView().getModel().getProperty("/errores");
			var aArticuloErrores = aErrores.filter(function (oError) {
				return oError.Message.indexOf(sArticulo) >= 0;
			}, this);

			var oErroresPopover = new sap.m.ResponsivePopover({
				contentHeight: "300px",
				contentWidth: "600px",
				showArrow: true,
				showHeader: false,
				title: "Errores",
				placement: "Right",
				content: [
					new sap.m.MessageView({
						height: "300px",
						width: "600px",
						items: aArticuloErrores.map(function (oError) {
							var sType = "Success";
							if (oError.Type === "W") {
								sType = "Warning";
							}
							if (oError.Type === "E") {
								sType = "Error";
							}
							return new sap.m.MessageItem({
								title: oError.Message,
								type: sType
							});
						})
					}).addStyleClass("errorsMessageView")
				]
			});
			this.getView().addDependent(oErroresPopover);
			oErroresPopover.openBy(oEvent.getSource());
		},
		
		onPressFiltrarErroneosArticulo  : function (oEvent) {

		},

		onPressFiltrarErroneosModulo: function (oEvent) {

			var sNivel = oEvent.getSource().getId().split("_")[1];
			var oTable = sap.ui.getCore().byId("Modulo_" + sNivel);
			oTable.getBinding("rows").filter(undefined);
			var that = this;
			if (oEvent.getParameter("pressed")) {
				oTable.getBinding("rows").filter([new sap.ui.model.Filter({
					path: "Matnr",
					test: function (sArticulo) {
						var aErrors = this.getView().getModel().getProperty("/errores");
						if (aErrors.length === 0) {
							return true;
						}
						var bError = aErrors.some(function (oError) {
							return oError.Message.indexOf(sArticulo) >= 0 && oError.Type === "E";
						}, this);
						return bError;
					}.bind(that)
				})]);
			}

		},
		// Fin FTM 07.09.2020 

		validarColeccion: function (oSeleccion) {

			var aResult = [];
			var aNiveles = [];

			if (oSeleccion.tipoColeccion === 'A') {
				aNiveles = aNiveles.concat(oSeleccion.niveles);
			} else {
				aNiveles.push(1);
			}

			for (var i = 0; i < aNiveles.length; i++) {
				var sNivel = aNiveles[i].toString();

				if (this.oModel.getProperty("/headers/N" + sNivel + "/DatabModulo") === "") {
					aResult.push({
						"Nivel": sNivel,
						"Type": "W",
						"Message": "Nivel " + sNivel + ": " + "Falta fecha inicio para los artículos"
					});
				}

				if (this.oModel.getProperty("/headers/N" + sNivel + "/DatbiModulo") === "") {
					aResult.push({
						"Nivel": sNivel,
						"Type": "W",
						"Message": "Nivel " + sNivel + ": " + "Falta fecha fin para los artículos"
					});
				}

				if (this.oModel.getProperty("/headers/N" + sNivel + "/DatabSurtido") === "") {
					aResult.push({
						"Nivel": sNivel,
						"Type": "W",
						"Message": "Nivel " + sNivel + ": " + "Falta fecha inicio para las tiendas"
					});
				}

				if (this.oModel.getProperty("/headers/N" + sNivel + "/DatbiSurtido") === "") {
					aResult.push({
						"Nivel": sNivel,
						"Type": "W",
						"Message": "Nivel " + sNivel + ": " + "Falta fecha fin para las tiendas"
					});
				}

				if (this.oModel.getProperty("/items/N" + sNivel).length <= 0) {
					aResult.push({
						"Nivel": sNivel,
						"Type": "W",
						"Message": "Nivel " + sNivel + ": " + "Faltan artículo"
					});
				}

				if (this.oModel.getProperty("/surtidos/N" + sNivel).length <= 0) {
					aResult.push({
						"Nivel": sNivel,
						"Type": "W",
						"Message": "Nivel " + sNivel + ": " + "Faltan tiendas"
					});
				}

			}

			if (aResult.length > 0) {
				this.showMessages(aResult);
				return false;
			} else {
				return true;
			}
		},
		closeValueHelpDialogArticulo: function (oEvent) {
			this.getView().searchHelpArticuloDialog.close();
		},

		onPressDescargarPlantillaArticulo: function (oEvent) {

			if (typeof XLSX == "undefined") XLSX = require("xlsx");

			/* make the worksheet */
			var ws = XLSX.utils.json_to_sheet([{
				"Artículo": "",
				"No anidar": "",
				"Fecha inicio": "",
				"Fecha fin": ""
			}]);

			/* add to workbook */
			var wb = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, ws, "ARTICULOS");

			XLSX.writeFile(wb, "articulos_coleccion.xlsx");
		},

		onPressDescargarPlantillaTienda: function (oEvent) {

			if (typeof XLSX == "undefined") XLSX = require("xlsx");

			/* make the worksheet */
			var ws = XLSX.utils.json_to_sheet([{
				"Tienda": "",
				"Fecha inicio": "",
				"Fecha fin": ""
			}]);

			/* add to workbook */
			var wb = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, ws, "ARTICULOS");

			XLSX.writeFile(wb, "tiendas_coleccion.xlsx");
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf es.dinosol.ZUI5_CREA_COL.view.Coleccion
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf es.dinosol.ZUI5_CREA_COL.view.Coleccion
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf es.dinosol.ZUI5_CREA_COL.view.Coleccion
		 */
		//	onExit: function() {
		//
		//	}

	});

});