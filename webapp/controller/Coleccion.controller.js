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
			
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				"editMode": false,
				"displayMode": true
			}), "viewModel");
		},
		
		toggleMode : function(){
			
			this.getView().getModel("viewModel").setProperty("/displayMode", !this.getView().getModel("viewModel").getProperty("/displayMode"));
			this.getView().getModel("viewModel").setProperty("/editMode", !this.getView().getModel("viewModel").getProperty("/editMode"));
		},

		onPressMover: function () {

			if (this.getModuloTable().getSelectedContexts().length > 0 || this.getSurtidoTable().getSelectedContexts().length > 0) {
				this.openMoverNiveles();
			} else {
				return sap.m.MessageToast.show("Seleccione algun artículo o tienda");
			}

		},

		getModuloTable: function () {

			var sCurrentSection = this.getView().byId("opl").getSelectedSection();
			var oModuloSubSection = sap.ui.getCore().byId(sCurrentSection).getSubSections()[0];
			return oModuloSubSection.getBlocks()[0].getItems()[1];
		},

		getSurtidoTable: function () {

			var sCurrentSection = this.getView().byId("opl").getSelectedSection();
			var oSurtidoSubSection = sap.ui.getCore().byId(sCurrentSection).getSubSections()[1];

			return oSurtidoSubSection.getBlocks()[0].getItems()[1];
		},

		getCurrentNivel: function () {

			var sCurrentSection = this.getView().byId("opl").getSelectedSection();
			return sap.ui.getCore().byId(sCurrentSection).getBindingContext("data").getProperty("NumNivel");
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
		
		
		moverArticulos : function(oEvent){
			
			var aListaArticulosMover = this.getModuloTable().getSelectedContexts().map(function (oContext) {
				return oContext.getProperty("Articulo");
			}),
			aArticulosMover = this.getModuloTable().getSelectedContexts().map(function (oContext) {
				return oContext.getObject();
			});
			var iNivelOrigen = this.getCurrentNivel() -1 ,
				iNivelSelected = oEvent.getParameter("selectedItem").getBindingContext("data").getProperty("NumNivel") -1;
			var aArticulosOrigen = this.getComponentModelProperty("data", "/coleccion/niveles/" + iNivelOrigen + "/modulo/articulos"),
				aArticulosSelected = this.getComponentModelProperty("data", "/coleccion/niveles/" + iNivelSelected + "/modulo/articulos");
			
			// Eliminamos el articulo del nivel actual
			aArticulosOrigen = aArticulosOrigen.filter(function(oArticulo){
				return !aListaArticulosMover.includes(oArticulo.Articulo);
			});
			this.setComponentModelProperty("data", "/coleccion/niveles/" + iNivelOrigen + "/modulo/articulos", aArticulosOrigen);
			
			// Lo añadimos en el nivel seleccionado
			aArticulosSelected = aArticulosSelected.concat(aArticulosMover);
			this.setComponentModelProperty("data", "/coleccion/niveles/" + iNivelSelected + "/modulo/articulos", aArticulosSelected);
		},
		
		moverTiendas : function(){
			
			
		},
		
		onPressEnviar : function(){
			
			debugger;
			var oColeccion = this.getComponentModelProperty("data", "/originalColeccion");
			var sColeccion = this.getComponentModelProperty("data", "/coleccion/id");
			oColeccion.toModuloItems = this.getComponentModelProperty("data", "/coleccion/niveles").map(function(oNivel){
				return oNivel.modulo.articulos;
			});
			oColeccion.toSurtidoItems = this.getComponentModelProperty("data", "/coleccion/niveles").map(function(oNivel){
				return oNivel.surtido.tiendas;
			});
			
			this.getComponentModel().create("/ColeccionSet('" + sColeccion + "')", oColeccion, {
				success: function (oData) {
					
					debugger;
				},
				error: function(oData){
					debugger;
				}
			});
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